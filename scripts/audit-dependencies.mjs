#!/usr/bin/env node
import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import process from "node:process"

const allowedPackages = new Set(["react-router", "react-router-dom"])
const allowedAdvisory = "https://github.com/advisories/GHSA-qwww-vcr4-c8h2"
const allowedVersions = new Map([
  ["react-router", "7.18.2"],
  ["react-router-dom", "7.18.2"],
])
const severityRank = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }

function fail(message) {
  console.error(`[FAIL] ${message}`)
  process.exitCode = 1
}

function option(name, fallback = undefined) {
  const index = process.argv.indexOf(name)
  if (index === -1) return fallback
  const value = process.argv[index + 1]
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value`)
  return value
}

function readAudit() {
  const input = option("--input")
  if (input) {
    return { data: JSON.parse(readFileSync(input, "utf8")), childStatus: 0 }
  }

  const npmCommand = option("--npm-command", "npm")
  const result = spawnSync(npmCommand, ["audit", "--json"], {
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })
  if (result.error) throw result.error
  if (result.signal) throw new Error(`npm audit terminated by signal ${result.signal}`)
  if (result.status !== 0 && result.status !== 1) {
    throw new Error(`npm audit returned unsupported status ${result.status}`)
  }
  if (!result.stdout) {
    throw new Error(result.stderr || "npm audit returned no JSON")
  }
  return { data: JSON.parse(result.stdout), childStatus: result.status }
}

function validateReport(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("npm audit report must be an object")
  }
  if (data.error) throw new Error("npm audit returned an error payload")
  if (!data.vulnerabilities || typeof data.vulnerabilities !== "object" || Array.isArray(data.vulnerabilities)) {
    throw new Error("npm audit report is missing vulnerabilities object")
  }

  const graph = new Map()
  for (const [key, entry] of Object.entries(data.vulnerabilities)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      throw new Error(`invalid vulnerability entry: ${key}`)
    }
    if (entry.name !== key || !(entry.severity in severityRank) || !Array.isArray(entry.via)) {
      throw new Error(`unsupported vulnerability schema: ${key}`)
    }
    graph.set(key, entry)
  }
  return graph
}

function resolvesOnlyToAllowedAdvisory(name, graph, visiting = new Set()) {
  if (!allowedPackages.has(name) || visiting.has(name)) return false
  const entry = graph.get(name)
  if (!entry || entry.via.length === 0) return false

  const nextVisiting = new Set(visiting)
  nextVisiting.add(name)
  let provedAdvisory = false
  for (const via of entry.via) {
    if (typeof via === "string") {
      if (!resolvesOnlyToAllowedAdvisory(via, graph, nextVisiting)) return false
      provedAdvisory = true
      continue
    }
    if (
      !via ||
      typeof via !== "object" ||
      via.name !== "react-router" ||
      via.url !== allowedAdvisory ||
      !(via.severity in severityRank)
    ) {
      return false
    }
    provedAdvisory = true
  }
  return provedAdvisory
}

try {
  const { data, childStatus } = readAudit()
  const graph = validateReport(data)
  if (childStatus === 1 && graph.size === 0) {
    throw new Error("npm audit returned status 1 with an empty vulnerability graph")
  }
  const enforced = [...graph.values()].filter(
    (entry) => severityRank[entry.severity] >= severityRank.moderate,
  )
  const blocked = enforced.filter(
    (entry) => !resolvesOnlyToAllowedAdvisory(entry.name, graph),
  )

  if (blocked.length > 0) {
    for (const entry of blocked) {
      fail(`${entry.name}: unapproved ${entry.severity} dependency vulnerability`)
    }
  }

  const allowed = enforced.filter((entry) => !blocked.includes(entry))

  if (allowed.length > 0) {
    const lockPath = option("--lock", "package-lock.json")
    const lock = JSON.parse(readFileSync(lockPath, "utf8"))
    for (const [name, required] of allowedVersions) {
      const installed = lock.packages?.[`node_modules/${name}`]?.version
      if (installed !== required) {
        fail(`documented exception requires ${name}@${required}, found ${installed ?? "missing"}`)
      }
    }
  }

  if (process.exitCode !== 1) {
    if (allowed.length > 0) {
      console.log(
        `[PASS] dependency audit: only documented ${allowedAdvisory.split("/").at(-1)} RSC-mode exception remains`,
      )
    } else {
      console.log("[PASS] dependency audit: no moderate/high/critical vulnerabilities")
    }
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}

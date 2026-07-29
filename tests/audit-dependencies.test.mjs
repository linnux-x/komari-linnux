import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { chmodSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"

const script = new URL("../scripts/audit-dependencies.mjs", import.meta.url)
const allowedAdvisory = {
  name: "react-router",
  severity: "high",
  url: "https://github.com/advisories/GHSA-qwww-vcr4-c8h2",
}

function report(vulnerabilities) {
  return { metadata: { vulnerabilities: {} }, vulnerabilities }
}

function runPayload(
  payload,
  {
    raw = false,
    routerVersion = "7.18.2",
    routerDomVersion = "7.18.2",
  } = {},
) {
  const dir = mkdtempSync(join(tmpdir(), "komari-audit-test-"))
  try {
    const input = join(dir, "audit.json")
    const lock = join(dir, "package-lock.json")
    writeFileSync(input, raw ? payload : JSON.stringify(payload))
    const packages = {}
    if (routerVersion !== null) {
      packages["node_modules/react-router"] = { version: routerVersion }
    }
    if (routerDomVersion !== null) {
      packages["node_modules/react-router-dom"] = { version: routerDomVersion }
    }
    writeFileSync(lock, JSON.stringify({ lockfileVersion: 3, packages }))
    return spawnSync(
      process.execPath,
      [script.pathname, "--input", input, "--lock", lock],
      { encoding: "utf8" },
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function runFakeNpm(body) {
  const dir = mkdtempSync(join(tmpdir(), "komari-audit-command-test-"))
  try {
    const npm = join(dir, "fake-npm")
    const lock = join(dir, "package-lock.json")
    writeFileSync(npm, `#!/bin/sh\n${body}\n`)
    chmodSync(npm, 0o700)
    writeFileSync(lock, JSON.stringify({ lockfileVersion: 3, packages: {} }))
    return spawnSync(
      process.execPath,
      [script.pathname, "--npm-command", npm, "--lock", lock],
      { encoding: "utf8", cwd: dir },
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

test("allows only the documented React Router RSC advisory", () => {
  const result = runPayload(
    report({
      "react-router": {
        name: "react-router",
        severity: "high",
        via: [allowedAdvisory],
      },
      "react-router-dom": {
        name: "react-router-dom",
        severity: "high",
        via: ["react-router"],
      },
    }),
  )
  assert.equal(result.status, 0, result.stdout + result.stderr)
})

test("rejects a new vulnerability in another package", () => {
  const result = runPayload(
    report({
      lodash: {
        name: "lodash",
        severity: "high",
        via: [{ name: "lodash", severity: "high", url: "https://example.invalid/new" }],
      },
    }),
  )
  assert.equal(result.status, 1)
})

test("rejects a different React Router advisory", () => {
  const result = runPayload(
    report({
      "react-router": {
        name: "react-router",
        severity: "high",
        via: [
          {
            name: "react-router",
            severity: "high",
            url: "https://github.com/advisories/GHSA-not-allowed",
          },
        ],
      },
    }),
  )
  assert.equal(result.status, 1)
})

test("rejects mixed approved and unapproved via entries", () => {
  const result = runPayload(
    report({
      "react-router": {
        name: "react-router",
        severity: "high",
        via: [
          allowedAdvisory,
          { name: "react-router", severity: "high", url: "https://example.invalid/new" },
        ],
      },
    }),
  )
  assert.equal(result.status, 1)
})

test("rejects self-referential and missing string-only via chains", () => {
  const self = runPayload(
    report({
      "react-router": {
        name: "react-router",
        severity: "critical",
        via: ["react-router"],
      },
    }),
  )
  assert.equal(self.status, 1)

  const missing = runPayload(
    report({
      "react-router-dom": {
        name: "react-router-dom",
        severity: "high",
        via: ["react-router"],
      },
    }),
  )
  assert.equal(missing.status, 1)
})

test("rejects malformed JSON, missing schema, and audit error payloads", () => {
  assert.equal(runPayload("{not-json", { raw: true }).status, 1)
  assert.equal(runPayload({ metadata: {} }).status, 1)
  assert.equal(
    runPayload({ error: { code: "EAUDIT", summary: "registry unavailable" } }).status,
    1,
  )
})

test("rejects missing or unknown severity", () => {
  assert.equal(
    runPayload(report({ lodash: { name: "lodash", via: [] } })).status,
    1,
  )
  assert.equal(
    runPayload(
      report({ lodash: { name: "lodash", severity: "severe", via: [] } }),
    ).status,
    1,
  )
})

test("rejects documented exception when either locked package is missing or differs", () => {
  const payload = report({
    "react-router": {
      name: "react-router",
      severity: "high",
      via: [allowedAdvisory],
    },
  })
  for (const options of [
    { routerVersion: "7.17.0" },
    { routerVersion: null },
    { routerDomVersion: "7.17.0" },
    { routerDomVersion: null },
  ]) {
    const result = runPayload(payload, options)
    assert.equal(result.status, 1, result.stdout + result.stderr)
  }
})

test("rejects npm spawn failure, signal, and unexpected child status", () => {
  const missing = spawnSync(
    process.execPath,
    [script.pathname, "--npm-command", "/definitely/missing/npm"],
    { encoding: "utf8" },
  )
  assert.equal(missing.status, 1)
  assert.equal(runFakeNpm("kill -TERM $$").status, 1)
  assert.equal(
    runFakeNpm("printf '{\"vulnerabilities\":{}}'; exit 2").status,
    1,
  )
  assert.equal(
    runFakeNpm("printf '{\"vulnerabilities\":{}}'; exit 1").status,
    1,
  )
})

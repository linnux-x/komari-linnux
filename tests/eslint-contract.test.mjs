import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import test from "node:test"

const projectRoot = new URL("..", import.meta.url)

test("preserves the existing no-with lint contract", () => {
  const result = spawnSync(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["eslint", "--print-config", "src/main.tsx"],
    { cwd: projectRoot, encoding: "utf8" },
  )
  assert.equal(result.status, 0, result.stdout + result.stderr)
  const config = JSON.parse(result.stdout)
  const setting = config.rules?.["no-with"]
  const severity = Array.isArray(setting) ? setting[0] : setting
  assert.ok(severity === 2 || severity === "error", `no-with severity is ${severity}`)
})

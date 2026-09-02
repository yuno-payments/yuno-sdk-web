#!/usr/bin/env node
/**
 * Repo-root test gate.
 *
 * The only executable test suite in this repository is the white-label proxy's
 * (`white-label-proxy-server/test`), which boots the real `server.js` against
 * local stub upstreams. It lives in its own package with its own lockfile, so
 * this runner installs that package deterministically from the committed
 * lockfile when it has not been installed yet, then delegates to it.
 *
 * `npm run check:pins` runs first: an exact SDK version pin is a defect the
 * examples must never ship, and it is cheap to catch before the suite runs.
 *
 * Run: npm test
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROXY_DIR = path.join(ROOT, "white-label-proxy-server");

const npm = process.platform === "win32" ? "npm.cmd" : "npm";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { stdio: "inherit", cwd: ROOT, ...options });
  if (result.error) {
    console.error(`\nFailed to run \`${command} ${args.join(" ")}\`: ${result.error.message}`);
    process.exit(1);
  }
  return result.status ?? 1;
}

console.log("→ npm run check:pins");
const pinsStatus = run(npm, ["run", "check:pins"]);
if (pinsStatus !== 0) process.exit(pinsStatus);

if (!existsSync(path.join(PROXY_DIR, "node_modules"))) {
  console.log("\n→ installing white-label-proxy-server dependencies from its lockfile");
  const installStatus = run(npm, ["ci", "--no-audit", "--no-fund"], { cwd: PROXY_DIR });
  if (installStatus !== 0) {
    console.error(
      "\nCould not install white-label-proxy-server dependencies. " +
        "Run `npm ci` inside white-label-proxy-server with registry access, then re-run `npm test`.",
    );
    process.exit(installStatus);
  }
}

console.log("\n→ white-label-proxy-server test suite");
process.exit(run(npm, ["test"], { cwd: PROXY_DIR }));

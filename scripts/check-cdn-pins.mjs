#!/usr/bin/env node
/**
 * Fails when any example pins the Web SDK to an exact version.
 *
 * `https://sdk-web.y.uno/v1.10/main.js` is a global path: it is republished on
 * every release of that line, so a merchant who copies it from these examples
 * picks up fixes without touching their integration.
 *
 * `https://sdk-web.y.uno/v1.10.3/main.js` is an exact version: immutable by
 * design, permanently frozen on the build it was cut with. Pinning one here
 * freezes every integration bootstrapped from this repo on that build — which
 * is how a merchant ended up stuck on a pre-fix bundle mid-certification.
 *
 * Run: npm run check:pins
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const PIN = /sdk-web\.y\.uno\/v([^/"'\s]+)\/main\.js/g;
const GLOBAL_PIN = /^\d+\.\d+$/;

// This file documents the bad pattern in prose and builds it in template
// literals, so it would flag itself.
const SELF = "scripts/check-cdn-pins.mjs";

const files = execFileSync("git", ["ls-files"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean)
  .filter((file) => file !== SELF);

const offenders = [];

for (const file of files) {
  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  if (!content.includes("sdk-web.y.uno")) continue;

  const lines = content.split("\n");
  lines.forEach((line, index) => {
    for (const match of line.matchAll(PIN)) {
      if (!GLOBAL_PIN.test(match[1])) {
        offenders.push({ file, line: index + 1, pin: match[1] });
      }
    }
  });
}

if (offenders.length > 0) {
  console.error("\nExact-version SDK pins found. Use a global major.minor path instead.\n");
  for (const { file, line, pin } of offenders) {
    const suggested = pin.split(".").slice(0, 2).join(".");
    console.error(`  ${file}:${line}`);
    console.error(`    found:  https://sdk-web.y.uno/v${pin}/main.js`);
    console.error(`    use:    https://sdk-web.y.uno/v${suggested}/main.js\n`);
  }
  console.error(`${offenders.length} exact pin${offenders.length === 1 ? "" : "s"} must be changed before merging.\n`);
  process.exit(1);
}

console.log("All Web SDK pins use a global major.minor path.");

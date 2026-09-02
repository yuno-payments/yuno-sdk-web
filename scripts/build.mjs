#!/usr/bin/env node
/**
 * Repo-root build gate for a repository that ships no bundler.
 *
 * The root of this repo is plain Node (the demo server, `utils.js`, the
 * white-label proxy) plus browser ES modules served as-is from `vanilla/` and
 * `white-label-proxy-server/static/`. There is nothing to transpile, so "does
 * it build" means: every first-party source file parses, and every module the
 * white-label proxy loads at boot resolves.
 *
 * The framework demos (`yuno-react`, `yuno-vue`, `yuno-angular`,
 * `yuno-vtex-webview/HeadlessVTEXWeb`) each carry their own toolchain,
 * lockfile and `build` script and are built from their own directory — this
 * gate deliberately does not shell into `ng`/`vite`, which are not installed
 * at the root and would fail with `ng: not found`. It verifies instead that
 * each demo still declares the lockfile and build script needed to build it
 * independently.
 *
 * Run: npm run build
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

const SELF_BUILDING_PROJECTS = [
  "yuno-react",
  "yuno-vue",
  "yuno-angular",
  "yuno-vtex-webview/HeadlessVTEXWeb",
];

const PROXY_DIR = "white-label-proxy-server";

const PROXY_MODULES = [
  `${PROXY_DIR}/lib/upstream-router.js`,
  `${PROXY_DIR}/lib/html-rewrite.js`,
];

const failures = [];

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function trackedFiles() {
  return execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" })
    .split("\n")
    .filter(Boolean);
}

function isSelfBuilding(file) {
  return SELF_BUILDING_PROJECTS.some((project) => file.startsWith(`${project}/`));
}

function checkSyntax(file) {
  const absolute = path.join(ROOT, file);
  try {
    execFileSync(process.execPath, ["--check", absolute], { stdio: "pipe" });
    return;
  } catch (error) {
    const stderr = String(error.stderr || "");
    if (!/import statement outside a module|Unexpected token 'export'/.test(stderr)) {
      fail(file, stderr.trim() || error.message);
      return;
    }
  }
  try {
    execFileSync(process.execPath, ["--input-type=module", "--check"], {
      input: readFileSync(absolute),
      stdio: "pipe",
    });
  } catch (error) {
    fail(file, String(error.stderr || error.message).trim());
  }
}

function checkProxyModules() {
  if (!existsSync(path.join(ROOT, PROXY_DIR, "node_modules"))) {
    console.log(
      `- ${PROXY_DIR}: dependencies not installed, module load check skipped ` +
        `(run: npm ci --prefix ${PROXY_DIR})`,
    );
    return 0;
  }
  for (const file of PROXY_MODULES) {
    try {
      require(path.join(ROOT, file));
    } catch (error) {
      fail(file, `failed to load: ${error.message}`);
    }
  }
  return PROXY_MODULES.length;
}

function checkSelfBuildingProjects() {
  for (const project of SELF_BUILDING_PROJECTS) {
    const manifestPath = path.join(ROOT, project, "package.json");
    if (!existsSync(manifestPath)) {
      fail(project, "package.json is missing");
      continue;
    }
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (!manifest.scripts?.build) {
      fail(project, "package.json declares no build script");
    }
    if (!existsSync(path.join(ROOT, project, "package-lock.json"))) {
      fail(project, "package-lock.json is missing, the build is not reproducible");
    }
    console.log(`- ${project}: built separately with \`npm ci && npm run build\` in that directory`);
  }
}

const sources = trackedFiles().filter(
  (file) => SOURCE_EXTENSIONS.has(path.extname(file)) && !isSelfBuilding(file),
);

for (const file of sources) checkSyntax(file);
const loadedModules = checkProxyModules();
checkSelfBuildingProjects();

if (failures.length > 0) {
  console.error(`\nBuild failed:\n${failures.map((line) => `  ✖ ${line}`).join("\n")}`);
  process.exit(1);
}

console.log(`\nBuild OK: ${sources.length} source files parsed, ${loadedModules} proxy modules loaded.`);

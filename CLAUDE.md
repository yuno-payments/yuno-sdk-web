# CLAUDE.md - yuno-sdk-web

## Project Overview

Demo application showcasing Yuno's Web SDK integration across multiple frontend frameworks.

## Repository Structure

```
yuno-sdk-web/
├── server.js              # Express server (Node.js) - shared backend
├── package.json           # Root package (Express server dependencies)
├── vanilla/               # Vanilla JS demo
├── yuno-angular/          # Angular 19 demo (standalone sub-project with own package.json)
├── yuno-react/            # React 19 + Vite demo (standalone sub-project)
├── yuno-vue/              # Vue 3 + Vite demo (standalone sub-project)
├── yuno-vtex-webview/     # VTEX headless webview demo
│   └── HeadlessVTEXWeb/   # Vite sub-project
└── typescript/            # TypeScript types
```

Each sub-directory with a `package.json` is an independent npm project with its own `package-lock.json`.

## Development Commands

```bash
# Root server
npm run start:dev

# Sub-projects (run from their directory)
cd yuno-angular && npm start
cd yuno-react && npm run dev
cd yuno-vue && npm run dev
cd yuno-vtex-webview/HeadlessVTEXWeb && npm run dev
```

## Branch & PR Conventions

- Default branch: `main` (protected, requires PR)
- Branch naming: `fix/VULS-XXXX-short-description` or `feat/TICKET-description`
- PR title format: `fix:[VULS-XXXX] description` or `feat:[TICKET] description`
- PRs target `main`

## Dependency Management

- Each sub-project manages its own dependencies independently
- Use `overrides` in package.json to force transitive dependency versions for security patches
- When fixing vulnerabilities: update direct deps in package.json, add overrides for transitive deps
- Always regenerate `package-lock.json` after changes: `rm package-lock.json && npm install --package-lock-only`
- Run `npm audit` to verify 0 vulnerabilities after changes

## Security / Vulnerability Fixes

When resolving Dependabot alerts:
1. Identify which sub-project's `package-lock.json` is affected (check the alert's manifest path)
2. If it's a direct dependency, bump the version in `package.json`
3. If it's a transitive dependency, add an override in the relevant `package.json`
4. Regenerate the lock file and verify with `npm audit`

## Environment

- `.env` file required for server configuration (API keys)
- Do not commit secrets

# Rules for AnyForge crews in yuno-sdk-web

Read this before any change. These rules come from the team that owns this repository. When a work item says something different, the work item wins.

## Branches and pull requests

- Base branch: `main`. Never merge, tag, publish or deploy. A person does that.
- Commit message: `type:[TICKET] description`. `type` is `feat`, `fix`, `docs` or `chore`. `TICKET` is the Jira key in the work item (for example `YSHUB-7396`, `VULS-6054` or `CORECM-20102`). Example: `fix:[YSHUB-7396] pin postcss override to 8.5.23 in yuno-vue (GHSA-fxqj-rqcc-2cmp)`.
- Pull request title: exactly the commit message. Do not put the AnyForge work item code (`[YSW-001]`) or a type label (`[Bug]`) in front of it. If the work item code must appear, put it in the pull request description.
- AnyForge assigns the branch at dispatch. If your assigned branch does not follow `type/TICKET-short-slug` (for example it starts with `bug/`), keep working on it and write this line at the top of the pull request description: `Branch name does not follow type/TICKET-short-slug. The reviewer must rename it before merge.`
- One commit per pull request.

## Vulnerability fixes (VULS and YSHUB tickets)

These rules override the "Dependency Management" section of `CLAUDE.md` for security tickets.

- Move only the vulnerable package, and only to the minimum patched version named in the advisory. No other package version may change in the lockfile.
- For a transitive dependency, write the override as `">=X.Y.Z"` with the minimum patched version, in the same style as the other overrides. Do not use `^`.
- Update `package-lock.json` in place. Do not delete and regenerate it. To land exactly the minimum version: set the override to `"X.Y.Z"`, run `npm install --package-lock-only`, set it back to `">=X.Y.Z"`, run the command again.
- Check that the patched version does not pull a newer version of one of its own dependencies. If it does, say so in the pull request description.
- Other `npm audit` findings are out of scope. List them in the pull request description and do not claim 0 vulnerabilities unless `npm audit --package-lock-only` reports 0.
- Before starting, check open pull requests for the same alert or ticket. If one exists, say so on the work item instead of opening a second one.

## Tests and checks

- The repository has no test runner. The root `npm test` exits 1, and `yuno-vue` has no test script. No CI job builds the sub-projects.
- A dependency-only change needs no new test. Instead run, inside the changed sub-project, `npm ci`, `npm run build` and `npm audit --package-lock-only`, and paste the output in the pull request description.
- Each sub-project (`yuno-angular`, `yuno-react`, `yuno-vue`, `yuno-vtex-webview/HeadlessVTEXWeb`, `white-label-proxy-server`) has its own `package.json` and lockfile. Run commands from its folder.

## Scope

- Change only the files the work item names. If another file must change, say why in the pull request description.
- Never commit `.env`. Use `.env.example`.

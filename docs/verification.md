# Verification record

Checked October 12, 2026. User story: browse a local catalog, edit a label, see a modeled sign, and paste the exact generated text from the clipboard into Valheim.

## Local checks

- ESLint: passed.
- TypeScript: passed.
- Vitest: 44 tests passed across formatter, catalog integrity/filtering, preferences, sharing, and import/export.
- Vite production build: passed. Client bundle approximately 90 KB gzipped, plus approximately 9 KB CSS.
- Dependency installation audit: zero reported vulnerabilities at installation.
- Playwright: 30 checks passed using real Microsoft Edge (Chromium), covering 1440×1080 desktop, 390×844 mobile, and 820×1180 tablet viewports.
- Screenshots were inspected for desktop, mobile, and tablet; all three viewports have automated horizontal-overflow checks and screenshots in `docs/screenshots/`.

## Browser coverage

Each viewport covers:

1. Search, item selection, live preview colors, formatting, real Clipboard API write/read equality, and ASCII fallback.
2. Individual catalog copy and complete category JSON copy.
3. Favorites, recents, and editor settings surviving reload.
4. Over-limit text preserved; invalid colors and raw markup blocked; arbitrary user markup rendered as inert text.
5. Custom label editing, presets, symbol controls, advanced alignment, and encoded multiline plain output.
6. Shared-link configuration isolated from saved local editor preferences.
7. JSON download/upload roundtrip and invalid-file rejection.
8. Manual-copy dialog after simulated Clipboard API and selection-copy failure. Normal clipboard tests are not mocked.
9. No horizontal page overflow, browser exceptions, or third-party application requests on load.
10. Keyboard search and modal guide dismissal.

Clipboard tests run sequentially because host clipboard state can be shared across browser contexts. CI uses bundled Chromium on Linux rather than the installed Edge browser.

## Evidence limits

Mobile and tablet checks emulate viewport/input characteristics in Chromium; they are not physical iOS/Safari device tests. Sign markup, length handling, defaults, and fonts were inspected in installed Valheim 1.0.17, but the generated labels have not been visually tested in an active game world. See the compatibility record for those limits. There are no backend/API/data-service boundaries to verify because all app functionality is local to the browser.

## Production release

- Public site: https://valheim-sign-generator.vercel.app
- Public repository: https://github.com/jasonpagliaro/valheim-sign-generator
- Initial source commit: `054c963d5b8d669285551497325f3085d9c48326`.
- Vercel project: `valheim-sign-generator`, project ID `prj_9EXZFcTNyRRQ3wORvZJlO5L5EuAA`, in the owner's personal Hobby workspace.
- Production deployment `dpl_FGRfqLTjXZL3HHTJD5U1eGsVKQjq` reached `READY`; public origin returned HTTP 200 and the expected application title without authentication.
- The same 30 browser checks passed against the public production origin, including real clipboard readback across desktop/mobile/tablet viewports (40.3 seconds).
- [GitHub Actions run 38334371659](https://github.com/jasonpagliaro/valheim-sign-generator/actions/runs/38334371659) passed all checks, including the 30 browser cases on Linux Chromium.
- No paid upgrade, purchased domain, server, or database was used.

## Pending Git integration

The owner approved adding this repository to Vercel's selected GitHub repositories. That permission was saved and verified through both GitHub's settings page and Vercel's repository lookup. A deployment pulled directly from GitHub commit `fcf745c6995b45ba11367d238d9098f00284d6bc` reached `READY` as `dpl_8JpYq36z4njwofLDKzs9popvzYn6` and received the public production domain. Search, editing, formatting, and real clipboard readback were then rechecked successfully on desktop, mobile, and tablet against that production release.

Automatic deployment on push is still pending: the existing Vercel project is not yet linked to the repository. The connected API supports Git-sourced builds but does not expose an operation to attach Git to an existing unlinked project. The dashboard requires the owner to finish Vercel sign-in. After sign-in, connect this existing project to `jasonpagliaro/valheim-sign-generator`, production branch `main`, and verify a new push results in a `READY` production deployment. Do not create a duplicate project.

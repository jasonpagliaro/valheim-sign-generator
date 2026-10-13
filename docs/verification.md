# Verification record

Checked October 12, 2026. User story: browse a local catalog, edit a label, see a modeled sign, and paste the exact generated text from the clipboard into Valheim.

## Local checks

- ESLint: passed.
- TypeScript: passed.
- Vitest: 44 tests passed across formatter, catalog integrity/filtering, preferences, sharing, and import/export.
- Vite production build: passed. Client bundle approximately 90 KB gzipped, plus approximately 9 KB CSS.
- Dependency installation audit: zero reported vulnerabilities at installation.
- Playwright: 30 checks passed using real Microsoft Edge (Chromium), covering 1440×1080 desktop, 390×844 mobile, and 820×1180 tablet viewports.
- Screenshots were inspected for desktop and mobile; all three viewports have automated horizontal-overflow checks and screenshots in `docs/screenshots/`.

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

Production and Git integration results will be recorded after release.

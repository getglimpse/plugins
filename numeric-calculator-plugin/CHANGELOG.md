# Changelog

## 0.2.0 - 2026-09-03

- Updated the sample plugin to the v0.2.0 manifest shape.
- Replaced the `page.js` Internal Page entrypoint with `page.json` standard tab declarations.
- Kept runtime logic in `main.js` for actions and viewers.
- Converted the action sample to a Playground standard tab.

## 0.1.1 - 2026-09-03

- Moved localized strings from inline `manifest.i18n` metadata to `i18n.json`.
- Updated `manifest.i18n` to reference the external i18n file.
- Bumped the sample plugin version to `0.1.1`.

## 0.1.0 - 2026-07-28

- Added the numeric calculator as a page action plugin.
- Moved calculation logic into `main.js`.
- Moved Internal Page layout into `page.js`.
- Added playground examples such as `1 + 1`, `sqrt(144)`, and `pow(2, 8)`.
- Added `Plugin Details` as a collapsed section.
- Added `manifest.i18n` metadata.
- Added plugin-scoped `styles.css`.

# Changelog

## 0.2.0 - 2026-09-03

- Updated the sample plugin to the v0.2.0 manifest shape.
- Replaced the `page.js` Internal Page entrypoint with `page.json` standard tab declarations.
- Kept runtime logic in `main.js` for actions and viewers.
- Converted the viewer sample to an Info-only plugin page with viewer metadata declared in the manifest.

## 0.1.1 - 2026-09-03

- Moved localized strings from inline `manifest.i18n` metadata to `i18n.json`.
- Updated `manifest.i18n` to reference the external i18n file.
- Bumped the sample plugin version to `0.1.1`.

## 0.1.0 - 2026-07-28

- Added the frontend CSV viewer plugin.
- Added `contributes.viewers` metadata for `.csv`.
- Added plugin-owned CSV text loading through `ctx.files.readText()`.
- Added plugin-owned CSV parsing in `main.js`.
- Rendered CSV previews with Core `Table`.
- Fixed the CSV preview area so large tables can scroll.
- Removed the preview heading and plugin details from the file preview surface.
- Added `page.js` overview page for the viewer plugin.
- Added `manifest.i18n` metadata.
- Added plugin-scoped `styles.css`.

# Changelog

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

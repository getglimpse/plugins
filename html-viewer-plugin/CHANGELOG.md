# Changelog

## 0.2.0 - 2026-09-03

- Updated the sample plugin to the v0.2.0 manifest shape.
- Replaced the `page.js` Internal Page entrypoint with `page.json` standard tab declarations.
- Kept runtime logic in `main.js` for actions and viewers.
- Converted the viewer sample to an Info-only plugin page with viewer metadata declared in the manifest.

## 0.1.1 - 2026-09-03

- Bumped the sample plugin version to `0.1.1` for the current plugin sample set.

## 0.1.0 - 2026-07-31

- Added the HTML viewer plugin.
- Added `contributes.viewers` metadata for `.html` and `.htm`.
- Added manual WebView preview loading through the preview header.
- Added external open fallback for oversized files.
- Set the preview frame's default background to white for dark app themes.
- Switched loaded HTML previews to iframe `srcDoc` with an injected base URL so relative CSS and JavaScript references resolve from the HTML file directory.

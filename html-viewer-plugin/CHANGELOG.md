# Changelog

## 0.1.0 - 2026-07-31

- Added the HTML viewer plugin.
- Added `contributes.viewers` metadata for `.html` and `.htm`.
- Added manual WebView preview loading through the preview header.
- Added external open fallback for oversized files.
- Set the preview frame's default background to white for dark app themes.
- Switched loaded HTML previews to iframe `srcDoc` with an injected base URL so relative CSS and JavaScript references resolve from the HTML file directory.

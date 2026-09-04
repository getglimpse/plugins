# File Viewer Template

Use this template when your plugin previews files in Glimpse. It contributes a
viewer for `.txt` files and uses an Info-only plugin page.

## What It Contains

| File | Purpose |
| --- | --- |
| `manifest.json` | Declares a `.txt` viewer, `active-tab` read capability, and optional i18n. |
| `page.json` | Uses an empty `tabs` array so Glimpse generates only the Info tab. |
| `main.js` | Registers the `text` viewer and renders a preview with Core components. |
| `i18n.json` | Provides English and Japanese strings for viewer labels and messages. |
| `styles.css` | Adds scoped styles for the viewer preview. |

## Runtime Flow

```text
User previews a .txt file
-> viewer id: text
-> main.js ctx.registerViewer("text", renderer)
-> ctx.files.readText(sourcePath)
-> Core components render the preview
```

The viewer can read the active preview file because
`capabilities.files.read` is `active-tab`. It cannot read arbitrary files in the
target group.

## Info-only Page

`page.json` intentionally has no custom tabs:

```json
{
  "id": "plugin:file-viewer-template-plugin",
  "tabs": []
}
```

Glimpse still creates a plugin page from `manifest.json`. That page shows Info,
and Settings if the plugin later adds `manifest.settings`.

## Fields to Rename

When copying this template, update these values together:

- Folder name
- `manifest.json` `id`
- `manifest.json` `name`
- `manifest.json` `contributes.internalPage.id`
- `page.json` top-level `id`
- `main.js` log messages
- `i18n.json` `name` and `plugin.name`

If you rename the viewer or supported extension, update all of these:

- `manifest.json` `contributes.viewers[].id`
- `manifest.json` `contributes.viewers[].extensions`
- `main.js` `ctx.registerViewer(...)`
- `i18n.json` keys under `viewers.<viewerId>.*`

## Customization Notes

- Use `active-tab` for normal viewers. Use `target-group` only when the viewer truly needs to read other files.
- Keep `capabilities.files.write` as `none` unless the viewer also creates files.
- Use `ctx.files.toAssetUrl(sourcePath)` when a viewer needs to render the active file as an asset URL.
- Keep custom CSS scoped to classes used by this plugin. Avoid global selectors such as `body`, `html`, `:root`, and `*`.
- If you add action tabs later, declare them in `page.json`; do not put Info or Settings in `page.json`.

## Smoke Test

1. Install this folder from Plugin Page.
2. Trust and enable it.
3. Open a `.txt` file from the current target group.
4. Confirm the file uses `Text Viewer`.
5. Open the plugin page and confirm it shows generated Info.

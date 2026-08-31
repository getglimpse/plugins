# CSV Viewer

CSV viewer sample plugin for Glimpse.

Preview behavior:

- CSV files up to 32 MiB load in-app.
- CSV files over 32 MiB are not read by the plugin; open them with the OS
  default app.

## What It Contributes

- `contributes.viewers`: `csv`
- Extensions: `.csv`
- Runtime entrypoints: `main.js`, `page.js`

Glimpse routes `.csv` files to this viewer by matching `sourcePath` against
`contributes.viewers[].extensions`:

```json
{
  "type": "pluginViewer",
  "pluginId": "csv-viewer-plugin",
  "viewerId": "csv"
}
```

`main.js` registers the viewer, checks size with `ctx.files.getMetadata`, reads
small enough source files with `ctx.files.readText`, parses CSV in the plugin,
and renders rows with the Core `components.Table` component.
`page.js` registers the plugin overview Internal Page.

## Install

Install this directory from Plugin Page, then Trust and enable it.

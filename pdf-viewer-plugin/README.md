# PDF Viewer

Preview PDF files in Glimpse with lazy loading for large documents.

Preview behavior:

- PDFs up to 100 MiB load automatically.
- PDFs from 100 MiB through 500 MiB require a manual preview click.
- PDFs over 500 MiB are not loaded in-app; open them with the OS default app.

PDF viewer sample plugin for Glimpse.

## What It Contributes

- `contributes.viewers`: `pdf`
- Extensions: `.pdf`
- Runtime entrypoints: `main.js`, `page.js`

Glimpse routes `.pdf` files to this viewer by matching `sourcePath` against
`contributes.viewers[].extensions`:

```json
{
  "type": "pluginViewer",
  "pluginId": "pdf-viewer-plugin",
  "viewerId": "pdf"
}
```

`main.js` registers the viewer, checks the active PDF size with
`ctx.files.getMetadata`, converts the source path with `ctx.files.toAssetUrl`,
and chooses whether to render an iframe immediately, defer loading, or offer an
external open action.
`page.js` registers the plugin overview Internal Page.

## Install

Install this directory from Plugin Page, then Trust and enable it.

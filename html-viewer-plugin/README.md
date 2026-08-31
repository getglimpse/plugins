# HTML Viewer

Preview local HTML files in Glimpse by delegating rendering to the app WebView.

This plugin is meant for quickly inspecting local HTML files from Glimpse. It is
not a browser compatibility layer, and it does not try to guarantee that every
page script behaves exactly as it would in a full browser.

Preview behavior:

- Selecting an HTML file shows the indexed HTML source text first.
- The preview header shows `Load` and `Open` actions.
- `Load` switches from source text to the WebView preview.
- HTML files over 10 MiB are not loaded in-app; open them with the OS default app.
- The preview frame uses a white default background so plain HTML remains readable in dark Glimpse themes.

This plugin does not sanitize, inspect, or rewrite HTML. Loading preview may run
scripts or load resources referenced by the file, but JavaScript behavior is
best-effort and secondary to local HTML viewing. Preview is manual by design.
HTML files that declare their own background color keep that page-defined
background. After `Load`, the plugin reads the HTML text, renders it through
iframe `srcDoc`, and Core injects a `<base>` tag pointing at the HTML file's
directory so relative references such as `./style.css` and `./app.js` resolve
from that directory.

## What It Contributes

- `contributes.viewers`: `html`
- Extensions: `.html`, `.htm`
- Runtime entrypoints: `main.js`, `page.js`

Glimpse routes `.html` and `.htm` files to this viewer by matching `sourcePath`
against `contributes.viewers[].extensions`:

```json
{
  "type": "pluginViewer",
  "pluginId": "html-viewer-plugin",
  "viewerId": "html"
}
```

`main.js` registers the viewer, checks the active HTML file size with
`ctx.files.getMetadata`, reads the active file with `ctx.files.readText`,
converts the source path with `ctx.files.toAssetUrl`, and renders a WebView
frame after the header `Load` action activates the viewer.

## Install

Install this directory from Plugin Page, then Trust and enable it.

## Notes

HTML files are still indexed by Glimpse's normal file indexing rules. If a large
HTML file does not appear in search results, check the app indexing size limit.

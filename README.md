# Glimpse Plugin Samples

This directory contains development samples. Glimpse does not discover plugins
from this repository path automatically.

Install a sample from **Plugin Page**:

1. Open Plugin Page.
2. Enter the absolute path to a sample directory.
3. Click Install.
4. Click Trust.
5. Turn the plugin ON.

Samples:

- `first-glimpse-plugin`: minimal `main.js` action and `page.json` Playground tab.
- `numeric-calculator-plugin`: calculator page built with Core components and mathjs.
- `date-calculator-plugin`: date calculator page built with Core components.
- `unit-converter-plugin`: unit converter page built with Core components.
- `pdf-viewer-plugin`: PDF file viewer with lazy loading for large documents.
- `csv-viewer-plugin`: CSV file viewer with plugin-owned parsing and Core `Table`.
- `html-viewer-plugin`: HTML file viewer with manual WebView loading.
- `office-documents-viewer-plugin`: Office Open XML viewer for Word, Excel, and PowerPoint files.
- `file-converter-plugin`: `.txt`, `.md`, and `.markdown` file drop converter that prepends a success marker and writes to a configurable output directory.

Samples may define optional localized strings in `i18n.json`. When present,
`manifest.json` references that file through `i18n`.

Each sample keeps its own update history in `CHANGELOG.md`.

Installing or replacing a plugin clears its trust record. Trust is always tied
to the current plugin files and version.

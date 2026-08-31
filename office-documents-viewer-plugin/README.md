# Office Documents Viewer

Preview Office documents in Glimpse.

Supported preview formats:

- Word Open XML: `.docx`, `.docm`, `.dotx`, `.dotm`
- Excel Open XML: `.xlsx`, `.xlsm`, `.xltx`, `.xltm`
- PowerPoint Open XML: `.pptx`, `.pptm`, `.potx`, `.potm`, `.ppsx`, `.ppsm`

Legacy binary Office files (`.doc`, `.xls`, `.ppt`, `.pps`) are indexed and
recognized, but this plugin does not parse their proprietary binary content.

The plugin reads only the active preview file through `ctx.files.readBinary()`.

Preview safety limits:

- Maximum Office package read from the backend: 32 MiB
- Maximum ZIP entries: 2048
- Maximum compressed ZIP entry: 16 MiB
- Maximum uncompressed ZIP entry: 8 MiB
- Maximum cumulative uncompressed preview data: 32 MiB
- Maximum XML part text: 8 MiB / 4 million characters

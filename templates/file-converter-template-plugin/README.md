# File Converter Template

Use this template when your plugin accepts user-selected files and writes output
files. It creates a standard Converter tab with a drop area, Results controls,
and a Results table.

## What It Contains

| File | Purpose |
| --- | --- |
| `manifest.json` | Declares the `convertFile` action, file output capability, and an `outputDirectory` setting. |
| `page.json` | Declares one `converter` tab with localized labels for drop UI and Results UI. |
| `main.js` | Normalizes file payloads, reads text content, and returns file outputs. |
| `i18n.json` | Provides English and Japanese strings for the Converter and Settings tabs. |

## Runtime Flow

```text
Dropped or selected files
-> Converter tab validates accept / size / count
-> action id: convertFile
-> main.js returns file output objects
-> Glimpse writes files to outputDirectory
-> Results table shows file name, size, and path
```

The plugin action returns file-like objects. The plugin does not write directly
to the filesystem; Glimpse resolves the output directory setting and writes the
files after checking capabilities.

## Input Shape

For `multiple: true`, the action receives:

```js
{
  files: [
    {
      name: "notes.md",
      type: "text/markdown",
      contentType: "text/markdown",
      size: 123,
      text: "# Notes"
    }
  ]
}
```

For single-file use, handle the file payload directly as well:

```js
const files = Array.isArray(input.files) ? input.files : [input.file ?? input];
```

## Output Shape

Return one file object or an array of file objects:

```js
{
  type: "file",
  fileName: "notes.converted.md",
  contentType: "text/markdown",
  body: "Converted text"
}
```

`fileName` must be a file name only. Do not return an absolute path, path
separator, or `..`.

## Fields to Rename

When copying this template, update these values together:

- Folder name
- `manifest.json` `id`
- `manifest.json` `name`
- `manifest.json` `contributes.internalPage.id`
- `page.json` top-level `id`
- `main.js` log messages
- `i18n.json` `name` and `plugin.name`

If you rename the action, update all of these:

- `manifest.json` `contributes.actions[].id`
- `manifest.json` `contributes.actions[].input`
- `manifest.json` `contributes.actions[].output`
- `page.json` tab `action`
- `main.js` `ctx.registerAction(...)`
- `i18n.json` keys under `actions.<actionId>.*`

## Customization Notes

- Keep `capabilities.files.write` as `declared-output-directory` for output files.
- Keep `capabilities.files.read` as `none` when files only come from drag/drop or picker input.
- Update both `manifest.json` action `input.accept` and `page.json` tab `accept` when supporting new file types.
- Add new Converter UI labels as `*Key` plus `*Fallback` in `page.json`, then define the keys in `i18n.json`.
- Put output location settings in `manifest.settings`; Glimpse adds the Settings tab automatically.

## Smoke Test

1. Install this folder from Plugin Page.
2. Trust and enable it.
3. Open `File Converter Template`.
4. Confirm the tab order is Converter, Settings, Info.
5. Drop a `.txt`, `.md`, or `.markdown` file.
6. Confirm the Results table shows the generated file and Reveal opens its folder.

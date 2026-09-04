# Basic Action Template

Use this template when your plugin needs one text input and one text-like result.
It creates a standard Playground tab and wires it to an action registered in
`main.js`.

## What It Contains

| File | Purpose |
| --- | --- |
| `manifest.json` | Declares the plugin page, the `hello` action, no file access, and optional i18n. |
| `page.json` | Declares one `playground` tab that invokes the `hello` action. |
| `main.js` | Registers `hello` and returns a localized greeting. |
| `i18n.json` | Provides English and Japanese strings for labels and action output. |

## Runtime Flow

```text
Playground input
-> action id: hello
-> main.js ctx.registerAction("hello", handler)
-> localized string result
-> Playground result history
```

The plugin can also be executed from search with `>` because
`manifest.contributes.internalPage.pageAction` points to the same action.

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

- `manifest.json` `contributes.internalPage.pageAction.actionId`
- `manifest.json` `contributes.actions[].id`
- `page.json` tab `action`
- `main.js` `ctx.registerAction(...)`
- `i18n.json` keys under `actions.<actionId>.*`

## Customization Notes

- Keep `capabilities.files.read` and `capabilities.files.write` as `none` unless the action actually needs file access.
- Use a short Japanese plugin name such as `メモ作成`, not `メモ作成プラグイン`, because Plugin Page and the icon already provide plugin context.
- Put Settings in `manifest.settings`; Glimpse adds the Settings tab automatically.
- Put page layout in `page.json`; do not register a page from `main.js`.

## Smoke Test

1. Install this folder from Plugin Page.
2. Trust and enable it.
3. Open `Basic Action Template`.
4. Type `Glimpse` in Playground and run it.
5. Search `basic action template > Glimpse` and press Enter while the preview is active.

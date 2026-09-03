# Changelog

## 0.2.0 - 2026-09-03

- Updated the sample plugin to the v0.2.0 manifest shape.
- Replaced the `page.js` Internal Page entrypoint with `page.json` standard tab declarations.
- Kept runtime logic in `main.js` for actions and viewers.
- Declared file output through `capabilities.files.write`, `settings.outputDirectory`, and action output metadata.
- Converted the action sample to a Playground standard tab.

## 0.1.1 - 2026-09-03

- Moved localized strings from inline `manifest.i18n` metadata to `i18n.json`.
- Updated `manifest.i18n` to reference the external i18n file.
- Bumped the sample plugin version to `0.1.1`.

## 0.1.0

- Added the file converter plugin sample.
- Added a Converter tab with a file drop UI.
- Added configurable output directory support through plugin preferences.
- Restricted conversion input to `.txt` files.
- Changed conversion output to prepend `Success Converted!`.
- Moved output directory controls to Info > Settings.

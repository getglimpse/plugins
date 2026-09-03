# Date Calculator

Sample plugin version of Glimpse's date calculator.

It demonstrates:

- page action execution through `contributes.internalPage` and `page.json`
- date calculation logic in `main.js`
- a standard tab layout in `page.json`
- generated Playground, Settings, and Info tabs
- manifest `i18n` for Japanese labels and help text
- scoped plugin styling through `styles.css`

Supported expressions:

- `today`
- `today + 7d`
- `today - 30d`
- `today - 2w`
- `today + 10bd`
- `today + 1m`
- `today - 1y`
- `2026-07-30 + 30d`
- `2026-01-31 + 1m`
- `2026-08-10 - 2026-07-30`
- `startOfMonth(today)`
- `endOfMonth(today)`
- `som(2026-07-30)`
- `eom(2026-02-10)`
- `weekday(today)`
- `wd(today)`
- `next monday`
- `next mon`
- `last friday`
- `last fri`

Month and year offsets clamp to the end of the target month. For example,
`2026-01-31 + 1m` returns `2026-02-28`.

Business-day offsets use weekdays only and skip Saturday/Sunday. Holidays are
not included.

Safety limits:

- expressions are limited to 96 characters
- units are limited to `d`, `w`, `m`, `y`, and `bd`
- maximum offsets are about 100 years

Install from Plugin Page with this directory path, then trust and enable it.
Search for `date calculator > today + 7d`, then press Enter while the preview is active.

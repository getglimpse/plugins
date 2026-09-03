# Unit Converter

Sample plugin version of Glimpse's unit converter.

It demonstrates:

- page action execution through `contributes.internalPage` and `page.json`
- unit conversion logic in `main.js`
- a standard tab layout in `page.json`
- generated Playground, Settings, and Info tabs
- manifest `i18n` for Japanese labels and help text
- scoped plugin styling through `styles.css`

Supported examples:

- `10cm to inches`
- `5mi to km`
- `1kg to lb`
- `2l to ml`
- `1gal to l`
- `100km/h to mph`
- `1m/s to km/h`
- `1gb to mib`
- `32f to c`
- `300k to c`

Supported groups:

- length
- area
- volume
- mass
- data
- time
- speed
- temperature

Safety limits:

- expressions are limited to 96 characters
- absolute input values are limited to `1e15`
- results are limited to 128 characters

Install from Plugin Page with this directory path, then trust and enable it.
Search for `unit converter > 10cm to in`, then press Enter while the preview is active.

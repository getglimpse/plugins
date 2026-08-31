# Numeric Calculator

Sample plugin version of Glimpse's numeric calculator.

It demonstrates:

- page action execution through `contributes.internalPages[].pageAction`
- calculation logic in `main.js`
- an Internal Page layout in `page.js`
- `ActionPlayground`, `Details`, and `KeyValueList`
- scoped plugin styling through `styles.css`

Safety limits:

- expressions are limited to 512 characters
- displayed results are limited to 4096 characters
- assignment, function definition, and mathjs environment/meta functions such as
  `evaluate`, `parse`, `compile`, `parser`, `config`, `import`, and `createUnit`
  are disabled
- regular calculator-style mathjs functions remain available

Install from Plugin Page with this directory path, then trust and enable it.
Search for `numeric calculator > sqrt(144)`, then press Enter while the preview is active.

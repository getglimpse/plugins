# Glimpse Plugins Registry Docs

このディレクトリには、無料公開 plugin catalog の registry schema だけを置きます。

Plugin API、package、release archive、author 向け実装ガイドは `getglimpse/plugin-template` で管理します。Plugin store の内部運用、review workflow、未公開ロードマップは private docs で管理します。

## 読むもの

| 文書 | 内容 |
| --- | --- |
| [plugin-registry.schema.json](./plugin-registry.schema.json) | Remote install 用 registry JSON schema。 |

## 検証

repository root で次を実行します。

```bash
node scripts/validate-registry.mjs
```

この script は root の `registry.json` とこの schema を使い、remote install が読む field を検証します。

## 関連ディレクトリ

- `../`: 無料公開 plugin と `registry.json`。
- `getglimpse/plugin-template`: 新規 plugin 作成用の template、README、validator、author docs。

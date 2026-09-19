# Password Generator

Generate strong passwords from a standard Glimpse Form tab.

Features:

- password lengths from 8 to 128 characters
- independent lowercase, uppercase, number, and symbol character sets
- optional removal of ambiguous characters such as `I`, `l`, `1`, `O`, `0`, and `o`
- at least one character from every selected character set
- unbiased selection and shuffling with the standard Web Crypto `crypto.getRandomValues()` API
- one-click result copying
- English and Japanese UI

This plugin requires Glimpse 0.2.7 or later because that version allows the standard Web Crypto API inside the plugin sandbox.

Install this directory from Plugin Page, trust and enable the plugin, then search for `password generator` or use `/ #tool`.

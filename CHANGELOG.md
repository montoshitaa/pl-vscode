# Changelog

All notable changes to Placitum for VS Code are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-10-27

### Added

- Placitum language registration for `.placitum` files, TextMate grammar,
  bracket matching, comments, and auto-closing pairs.
- Language client over stdio backed by the bundled `placitum-lsp` 0.1.0 and
  `placitum` 1.0.0 packages; no global language-server install required.
- Diagnostics, completion, hover, signature help, definition/type definition,
  references, rename, document/workspace symbols, highlights, folding,
  selection ranges, semantic tokens, code actions, code lens, and inlay hints.
- Pull diagnostics for VS Code, with `workspace/diagnostic/refresh` after
  configuration changes.
- Commands: `Placitum: Show capability manifest`, `Placitum: Reanalyze file`,
  and `Placitum: Add missing needs`.
- Settings under the `placitum.*` namespace mirroring the server configuration.
- Support for untrusted workspaces (Restricted Mode).
- Third-party license notices for the bundled Placitum packages.

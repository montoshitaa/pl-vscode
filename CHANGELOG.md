# Changelog

All notable changes to Placitum for VS Code are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this
project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-11-17

### Added

- Marketplace icon (`icon.png`, rounded variant of the Placitum logo).
- In-editor language reference (`Placitum: Language reference`) with reserved
  words, syntax, types, operators, capabilities and commands.
- Analysis status summary in the status bar plus a `Placitum — Analysis`
  output channel (`Placitum: Show analysis status`); `Reanalyze file` is
  unchanged.

### Fixed

- Added the missing `placitum.diagnostics.literalTypes` setting so VS Code users
  can disable E501–E504 checks independently.

### Changed

- Bundles the currently published `placitum@1.0.0` and `placitum-lsp@0.1.0`.
  The `1.0.1`/`0.1.1` source releases are prepared but not yet published on
  npm; publish them and re-bundle for a later marketplace release.

## [0.1.2] - 2026-10-28

### Fixed

- The run terminal now stays open after the process exits and closes on a key
  press.

## [0.1.1] - 2026-10-27

### Added

- `Placitum: Run file` command and editor title button: saves the active file
  and runs it with the bundled CLI in a terminal, using the file's directory as
  working directory. Works in local and remote workspaces and is disabled in
  untrusted workspaces.

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

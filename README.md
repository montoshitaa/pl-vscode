# Placitum for VS Code

Placitum support for `.placitum` files. A thin VS Code client: all analysis is
answered by the bundled Placitum language server, no global install required.

## Features

- Syntax highlighting via TextMate grammar, plus bracket matching and
  comment/auto-close configuration.
- Language server over stdio with diagnostics, completion, hover, rename and
  code lens/quick fixes driven by the server's capability model.
- Commands:
  - `Placitum: Show capability manifest` — renders the `placitum explain` text
    in a markdown preview.
  - `Placitum: Reanalyze file`.
  - `Placitum: Add missing needs` — applies the server's workspace edit.
- Settings mirroring the server configuration under the `placitum.*` section;
  changing one triggers re-analysis.

The language server and the Placitum core are bundled inside the extension, so
there is nothing else to install.

## Settings

| Setting | Default | Description |
|---|---|---|
| `placitum.diagnostics.enable` | `true` | Enable diagnostics. |
| `placitum.diagnostics.scope` | `true` | Include scope diagnostics. |
| `placitum.diagnostics.strictChecks` | `true` | Enable strict checks. |
| `placitum.completion.enable` | `true` | Enable completion. |
| `placitum.completion.snippets` | `true` | Offer snippets. |
| `placitum.codeLens.enable` | `true` | Enable code lens. |
| `placitum.inlayHints.enable` | `false` | Enable inlay hints. |
| `placitum.inlayHints.capabilities` | `false` | Inlay hints for capabilities. |
| `placitum.workspaceSymbols.enable` | `true` | Enable workspace symbols. |
| `placitum.workspaceSymbols.maxFiles` | `2000` | File cap for workspace symbols. |
| `placitum.trace.server` | `"off"` | Trace LSP traffic (`off`/`messages`/`verbose`). |

## Requirements

- VS Code 1.90 or newer.

## Known limitations

- **Pull diagnostics do not refresh when a setting changes.** Changing a
  setting that only affects binder diagnostics (e.g.
  `placitum.diagnostics.scope`) updates the server's analysis but VS Code keeps
  the previous pull collection until the file is edited or reopened. A
  request-based setting (e.g. `placitum.completion.enable`) does reflect live.

## Development

The host needs Node 20+; the repository ships a Nix dev shell:

```bash
nix develop --command npm install
nix develop --command npm run bundle:server   # bundle placitum-lsp + placitum
nix develop --command npm run smoke:server    # stdio smoke: E301, manifest, reanalyze
nix develop --command npm run package         # produce the .vsix
```

## License

MIT. The bundled `placitum-lsp` and `placitum` packages are also MIT; see
[`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md).

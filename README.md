# Placitum for VS Code

Extensión fina de VS Code para [Placitum](../../docs/README.md): registro del
lenguaje, gramática TextMate y cliente LSP contra el server `placitum-lsp`
bundleado. No reimplementa análisis.

Estado: **Fase 4 (comandos y manifiesto)**. Además de registrar el lenguaje, la
gramática TextMate y `language-configuration.json`, el cliente
`vscode-languageclient` arranca por stdio el server bundleado en
`server/dist/bin.js`, sin requerir `placitum-lsp` global, y expone los comandos
`placitum.showManifest` (request `placitum/manifest` → markdown en pestaña
preview), `placitum.reanalyze` y `placitum.addNeeds` (ambos vía
`workspace/executeCommand`). Ver la ruta en
[`docs/EXTENSION-VSCODE.md`](../../docs/EXTENSION-VSCODE.md).

```bash
nix develop --command npm run bundle:server   # bundlea placitum-lsp + placitum
nix develop --command npm run smoke:server    # stdio puro, E301, manifest y reanalyze
```

## Identidad

| Campo | Valor |
|---|---|
| Publisher | `placitum` |
| Extension id | `placitum.placitum-vscode` |
| `name` / `displayName` | `placitum-vscode` / `Placitum` |
| Licencia | MIT |

Publicación: Marketplace de VS Code como canal primario; el mismo `.vsix` sirve
para OpenVSX cuando se reclame el publisher allí.

## Entorno

El host no trae Node; usar el dev shell de Nix:

```bash
nix develop --command npm install
```

# Placitum for VS Code

Extensión fina de VS Code para [Placitum](../../docs/README.md): registro del
lenguaje, gramática TextMate y cliente LSP contra el server `placitum-lsp`
bundleado. No reimplementa análisis.

Estado: **Fase 5 (settings)**. Además de registrar el lenguaje, la gramática
TextMate y `language-configuration.json`, el cliente `vscode-languageclient`
arranca por stdio el server bundleado en `server/dist/bin.js`, sin requerir
`placitum-lsp` global, y expone los comandos `placitum.showManifest` (request
`placitum/manifest` → markdown en pestaña preview), `placitum.reanalyze` y
`placitum.addNeeds` (ambos vía `workspace/executeCommand`). Los settings
`placitum.*` son espejo 1:1 de la directiva §11 y se sincronizan con
`synchronize.configurationSection: 'placitum'`; cambiar uno dispara re-análisis y
republicación de diagnósticos. Ver la ruta en
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

## Limitaciones conocidas

- **Los diagnósticos pull no se refrescan al cambiar settings (VS Code).** Con
  `placitum-lsp@0.1.0`, cambiar un setting que solo afecta diagnósticos del
  binder (p. ej. `placitum.diagnostics.scope`) no actualiza los diagnósticos
  visibles en vivo. El server **sí** recibe la config y re-analiza (editar o
  reabrir el archivo muestra el resultado nuevo), pero no emite
  `workspace/diagnostic/refresh`, así que VS Code conserva la colección *pull*
  anterior. Arreglo pendiente del lado server:
  `connection.languages.diagnostics.refresh()` dentro de `applyConfig` cuando el
  cliente declare `workspace.diagnostics.refreshSupport`. Mientras tanto, un
  setting request-based (p. ej. `placitum.completion.enable`) sí se refleja en
  vivo.

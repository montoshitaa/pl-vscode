# Placitum for VS Code

Extensión fina de VS Code para [Placitum](../../docs/README.md): registro del
lenguaje, gramática TextMate y cliente LSP contra el server `placitum-lsp`
bundleado. No reimplementa análisis.

Estado: **Fase 2 (gramática y configuración de lenguaje)**. Registra el
lenguaje y colorea `.placitum` con la gramática TextMate + `language-
configuration.json`; el cliente LSP arranca cuando exista el server bundleado
(fase 3). Ver la ruta en [`docs/EXTENSION-VSCODE.md`](../../docs/EXTENSION-VSCODE.md).

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

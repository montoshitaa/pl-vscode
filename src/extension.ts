import * as path from 'node:path';
import { EventEmitter, ExtensionContext, Uri, ViewColumn, window, workspace } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

const manifestContents = new Map<string, string>();
const manifestChanged = new EventEmitter<Uri>();

function reportError(error: unknown): void {
  void window.showErrorMessage(`Placitum: ${error instanceof Error ? error.message : String(error)}`);
}

/** Code lens pass the document URI as an argument; palettes fall back to the active editor. */
function targetUri(argument: unknown): string | undefined {
  if (typeof argument === 'string') return argument;
  return window.activeTextEditor?.document.uri.toString();
}

/** `placitum.explain` text, rendered verbatim from the server's custom request. */
async function showManifest(argument: unknown): Promise<void> {
  if (client === undefined) return;
  const sourceUri = targetUri(argument);
  if (sourceUri === undefined) return;
  try {
    const result = await client.sendRequest<{ markdown: string }>('placitum/manifest', {
      textDocument: { uri: sourceUri },
    });
    const name = path.posix.basename(Uri.parse(sourceUri).path) || 'manifest';
    const uri = Uri.from({ scheme: 'placitum', path: `/${name}.md`, query: sourceUri });
    manifestContents.set(uri.toString(), result.markdown);
    manifestChanged.fire(uri);
    const document = await workspace.openTextDocument(uri);
    await window.showTextDocument(document, { preview: true, viewColumn: ViewColumn.Beside });
  } catch (error) {
    reportError(error);
  }
}

export function activate(context: ExtensionContext): void {
  context.subscriptions.push(
    manifestChanged,
    workspace.registerTextDocumentContentProvider('placitum', {
      onDidChange: manifestChanged.event,
      provideTextDocumentContent: (uri) => manifestContents.get(uri.toString()) ?? '',
    }),
  );

  const serverModule = context.asAbsolutePath(path.join('server', 'dist', 'bin.js'));

  const serverOptions: ServerOptions = {
    command: process.execPath,
    args: [serverModule, '--stdio'],
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'placitum' }],
    synchronize: { configurationSection: 'placitum' },
    // The server advertises its commands through executeCommandProvider, so the
    // language client registers them all itself; intercept showManifest to open
    // the markdown preview instead of the server's capped showMessage fallback.
    middleware: {
      executeCommand: (command, args, next) => {
        if (command === 'placitum.showManifest') return showManifest(args[0]);
        return next(command, args);
      },
    },
  };

  client = new LanguageClient('placitum', 'Placitum', serverOptions, clientOptions);
  void client.start().catch((error) => {
    console.error('Placitum language server failed to start', error);
  });
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

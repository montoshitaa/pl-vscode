import * as fs from 'node:fs';
import * as path from 'node:path';
import { ExtensionContext } from 'vscode';
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from 'vscode-languageclient/node';

let client: LanguageClient | undefined;

export function activate(context: ExtensionContext): void {
  const serverModule = context.asAbsolutePath(path.join('server', 'dist', 'bin.js'));

  // ponytail: the bundled server lands in Fase 3; activate cleanly until then.
  if (!fs.existsSync(serverModule)) {
    return;
  }

  const serverOptions: ServerOptions = {
    command: process.execPath,
    args: [serverModule, '--stdio'],
    transport: TransportKind.stdio,
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ language: 'placitum' }],
    synchronize: { configurationSection: 'placitum' },
  };

  client = new LanguageClient('placitum-lsp', 'Placitum', serverOptions, clientOptions);
  void client.start().catch((error) => {
    console.error('Placitum language server failed to start', error);
  });
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

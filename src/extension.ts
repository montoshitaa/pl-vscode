import * as path from 'node:path';
import {
  commands,
  DiagnosticSeverity,
  EventEmitter,
  ExtensionContext,
  languages,
  StatusBarAlignment,
  Uri,
  ViewColumn,
  WebviewPanel,
  window,
  workspace,
} from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions } from 'vscode-languageclient/node';
import { referenceHtml } from './reference';
import { runBlockReason } from './run-guard';
import { countDiagnostics, statusText, summaryLine } from './status';

let client: LanguageClient | undefined;
let referencePanel: WebviewPanel | undefined;

const MANIFEST_CACHE_LIMIT = 50;
const manifestContents = new Map<string, string>();
const manifestChanged = new EventEmitter<Uri>();

/** Keep only the most recent manifests so a long session cannot grow without bound. */
function cacheManifest(uri: Uri, markdown: string): void {
  const key = uri.toString();
  manifestContents.delete(key);
  manifestContents.set(key, markdown);
  if (manifestContents.size > MANIFEST_CACHE_LIMIT) {
    // shortcut: keep the 50 most recent manifests; persist or use an LRU if
    // older previews must reopen after eviction.
    const oldest = manifestContents.keys().next().value;
    if (oldest !== undefined) manifestContents.delete(oldest);
  }
}

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
    cacheManifest(uri, result.markdown);
    manifestChanged.fire(uri);
    const document = await workspace.openTextDocument(uri);
    await window.showTextDocument(document, { preview: true, viewColumn: ViewColumn.Beside });
  } catch (error) {
    reportError(error);
  }
}

/** Static language reference in a webview; no Placitum file is required. */
function showReference(): void {
  if (referencePanel !== undefined) {
    referencePanel.reveal(ViewColumn.Active);
    return;
  }
  referencePanel = window.createWebviewPanel(
    'placitum.reference',
    'Placitum: Language reference',
    ViewColumn.Active,
    { enableScripts: false },
  );
  referencePanel.webview.html = referenceHtml();
  referencePanel.onDidDispose(() => {
    referencePanel = undefined;
  });
}

/** Saves the target file and runs it with the bundled CLI in a terminal. */
async function runFile(wrapper: string, cli: string, argument: unknown): Promise<void> {
  const sourceUri = targetUri(argument);
  if (sourceUri === undefined) return;
  try {
    const document = await workspace.openTextDocument(Uri.parse(sourceUri));
    const block = runBlockReason(document.languageId, document.uri.scheme, workspace.isTrusted);
    if (block === 'untrusted') {
      void window.showWarningMessage('Placitum: running scripts requires a trusted workspace.');
      return;
    }
    if (block !== undefined) return;
    if (!(await document.save())) {
      void window.showWarningMessage('Placitum: the file could not be saved, so it was not run.');
      return;
    }
    // shortcut: one terminal per run, no stop button; add a pseudoterminal or
    // output channel when long-running scripts or cancellation matter.
    window
      .createTerminal({
        name: `Placitum: ${path.basename(document.uri.fsPath)}`,
        cwd: path.dirname(document.uri.fsPath),
        shellPath: process.execPath,
        shellArgs: [wrapper, cli, 'run', document.uri.fsPath],
        // Electron only behaves as plain Node with this set; the terminal does
        // not inherit it from the extension host.
        env: { ELECTRON_RUN_AS_NODE: '1' },
        isTransient: true,
      })
      .show();
  } catch (error) {
    reportError(error);
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  const analysisOutput = window.createOutputChannel('Placitum — Analysis');
  const analysisStatus = window.createStatusBarItem(StatusBarAlignment.Left, 100);
  analysisStatus.name = 'Placitum analysis';
  analysisStatus.command = 'placitum.showStatus';
  const lastAnalysis = new Map<string, string>();

  const updateAnalysisStatus = (): void => {
    const document = window.activeTextEditor?.document;
    if (document === undefined || document.languageId !== 'placitum') {
      analysisStatus.hide();
      return;
    }
    const diagnostics = languages.getDiagnostics(document.uri).filter((d) => d.source === 'placitum');
    const counts = countDiagnostics(diagnostics.map((d) => d.severity));
    const name = path.posix.basename(document.uri.path) || document.fileName;
    analysisStatus.text = statusText(counts);
    analysisStatus.tooltip = `${summaryLine(name, counts)}\nClic para ver el resumen.`;
    analysisStatus.show();

    const key = `${counts.errors}:${counts.warnings}:${diagnostics.map((d) => String(d.code ?? '')).join(',')}`;
    if (lastAnalysis.get(document.uri.toString()) === key) return;
    lastAnalysis.set(document.uri.toString(), key);
    analysisOutput.appendLine(`[${new Date().toLocaleTimeString()}] ${summaryLine(name, counts)}`);
    for (const diagnostic of diagnostics.slice(0, 5)) {
      const severity = diagnostic.severity === DiagnosticSeverity.Error ? 'error' : 'warning';
      analysisOutput.appendLine(
        `  ${severity} ${String(diagnostic.code ?? '')} (línea ${diagnostic.range.start.line + 1}): ${diagnostic.message.split('\n')[0]}`,
      );
    }
  };

  context.subscriptions.push(
    manifestChanged,
    analysisOutput,
    analysisStatus,
    commands.registerCommand('placitum.run', (argument: unknown) =>
      runFile(
        context.asAbsolutePath(path.join('out', 'run-wrapper.js')),
        context.asAbsolutePath(path.join('server', 'dist', 'placitum.js')),
        argument,
      ),
    ),
    commands.registerCommand('placitum.showReference', () => showReference()),
    commands.registerCommand('placitum.showStatus', () => analysisOutput.show(true)),
    workspace.registerTextDocumentContentProvider('placitum', {
      onDidChange: manifestChanged.event,
      provideTextDocumentContent: (uri) => manifestContents.get(uri.toString()) ?? '',
    }),
    window.onDidChangeActiveTextEditor(() => updateAnalysisStatus()),
    workspace.onDidOpenTextDocument(() => updateAnalysisStatus()),
    workspace.onDidCloseTextDocument((document) => {
      lastAnalysis.delete(document.uri.toString());
      updateAnalysisStatus();
    }),
    languages.onDidChangeDiagnostics((event) => {
      const active = window.activeTextEditor?.document.uri.toString();
      if (active !== undefined && event.uris.some((uri) => uri.toString() === active)) updateAnalysisStatus();
    }),
  );

  updateAnalysisStatus();

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
  try {
    await client.start();
  } catch (error) {
    reportError(error);
  }
}

export function deactivate(): Thenable<void> | undefined {
  return client?.stop();
}

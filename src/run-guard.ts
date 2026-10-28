export type RunBlock = 'untrusted' | 'unsupported';

/** Why the Run command refuses a document; `undefined` means it may run. */
export function runBlockReason(languageId: string, scheme: string, trusted: boolean): RunBlock | undefined {
  if (!trusted) return 'untrusted';
  if (languageId !== 'placitum' || (scheme !== 'file' && scheme !== 'vscode-remote')) return 'unsupported';
  return undefined;
}

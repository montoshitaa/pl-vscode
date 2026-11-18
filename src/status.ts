export interface DiagnosticCounts {
  errors: number;
  warnings: number;
}

/**
 * VS Code DiagnosticSeverity values: Error = 0, Warning = 1.
 * Kept as numbers so this module stays free of the vscode runtime and can be
 * unit-tested outside the extension host.
 */
export function countDiagnostics(severities: readonly (number | undefined)[]): DiagnosticCounts {
  let errors = 0;
  let warnings = 0;
  for (const severity of severities) {
    if (severity === 0) errors++;
    else if (severity === 1) warnings++;
  }
  return { errors, warnings };
}

/** Compact status bar text; errors win over warnings, then OK. */
export function statusText(counts: DiagnosticCounts): string {
  if (counts.errors > 0) return `$(error) Placitum: ${counts.errors}`;
  if (counts.warnings > 0) return `$(warning) Placitum: ${counts.warnings}`;
  return '$(check) Placitum';
}

/** One-line summary used in the output channel. */
export function summaryLine(name: string, counts: DiagnosticCounts): string {
  const errors = counts.errors === 1 ? 'error' : 'errores';
  const warnings = counts.warnings === 1 ? 'advertencia' : 'advertencias';
  return `${name}: ${counts.errors} ${errors}, ${counts.warnings} ${warnings}`;
}

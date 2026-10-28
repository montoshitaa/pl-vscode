import { spawn } from 'node:child_process';

const [cli, ...args] = process.argv.slice(2);
let finished = false;

/** Keep the terminal open after the process exits, like VS Code's internal waitOnExit. */
function finish(code: number): void {
  if (finished) return;
  finished = true;
  process.stdout.write(`\r\n[Process exited with code ${code}. Press any key to close.]\r\n`);
  process.stdin.setRawMode?.(true);
  process.stdin.resume();
  process.stdin.once('data', () => process.exit(code));
}

if (cli === undefined) {
  finish(1);
} else {
  const child = spawn(process.execPath, [cli, ...args], { stdio: 'inherit' });
  child.on('error', (error) => {
    process.stderr.write(`${error.message}\r\n`);
    finish(1);
  });
  child.on('exit', (code) => finish(code ?? 1));
}

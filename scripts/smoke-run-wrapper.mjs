import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const WRAPPER = fileURLToPath(new URL('../out/run-wrapper.js', import.meta.url));
const CLI = fileURLToPath(new URL('../server/dist/placitum.js', import.meta.url));

if (!existsSync(WRAPPER)) {
  console.error('out/run-wrapper.js is missing; run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(CLI)) {
  console.error('server/dist/placitum.js is missing; run `npm run bundle:server` first.');
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), 'placitum-wrapper-'));
let child;
try {
  const file = join(dir, 'smoke.placitum');
  await writeFile(file, 'print!("wrapped")\n');
  child = spawn(process.execPath, [WRAPPER, CLI, 'run', file], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', (chunk) => {
    stdout += chunk;
  });
  child.stderr.on('data', (chunk) => {
    stderr += chunk;
  });

  const deadline = Date.now() + 5000;
  while (!stdout.includes('Press any key to close.')) {
    if (Date.now() > deadline) throw new Error(`timed out; stdout=${JSON.stringify(stdout)}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.match(stdout, /wrapped/);
  assert.equal(child.exitCode, null);

  const exited = new Promise((resolve) => child.once('exit', resolve));
  child.stdin.write('\n');
  assert.equal(await exited, 0, stderr);
  console.log('smoke: run wrapper kept the terminal open until input.');
} finally {
  child?.kill();
  await rm(dir, { recursive: true, force: true });
}

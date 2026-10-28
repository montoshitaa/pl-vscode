import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
const BIN = fileURLToPath(new URL('../server/dist/placitum.js', import.meta.url));

if (!existsSync(BIN)) {
  console.error('server/dist/placitum.js is missing; run `npm run bundle:server` first.');
  process.exit(1);
}

const dir = await mkdtemp(join(tmpdir(), 'placitum-cli-'));
try {
  const file = join(dir, 'smoke.placitum');
  await writeFile(file, 'let x = 1\nprint!(x)\n');
  const { stdout, stderr } = await run(process.execPath, [BIN, 'run', file]);
  assert.equal(stdout.trim(), '1');
  assert.equal(stderr, '');
  console.log('smoke: CLI bundle ran a script.');
} finally {
  await rm(dir, { recursive: true, force: true });
}

import { execSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const rootDir = resolve(process.cwd());
const packageDir = join(rootDir, 'packages/client');
const smokeDir = join(rootDir, 'smoke/pack-node-esm');
const tempDir = join(rootDir, '.tmp/pack-node-esm');

rmSync(tempDir, { recursive: true, force: true });
rmSync(join(smokeDir, 'node_modules'), { recursive: true, force: true });
rmSync(join(smokeDir, 'package-lock.json'), { force: true });
mkdirSync(tempDir, { recursive: true });

// 1. Build the package
execSync('pnpm --filter @dfsync/client build', {
  cwd: rootDir,
  stdio: 'inherit',
});

// 2. Create tarball
execSync('pnpm pack --pack-destination ../../.tmp/pack-node-esm', {
  cwd: packageDir,
  stdio: 'inherit',
});

// 3. Find tarball
const tgzFile = readdirSync(tempDir).find((file) => file.endsWith('.tgz'));
if (!tgzFile) {
  throw new Error('Could not find packed tarball');
}

const tgzPath = join(tempDir, tgzFile);

// 4. Install tarball into isolated smoke project without lifecycle scripts
execSync(`npm install --ignore-scripts --no-save "${tgzPath}"`, {
  cwd: smokeDir,
  stdio: 'inherit',
});

// 5. Run smoke test
execSync('npm test', {
  cwd: smokeDir,
  stdio: 'inherit',
});

console.log('Pack ESM smoke test passed');

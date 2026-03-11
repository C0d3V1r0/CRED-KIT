import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const artifacts = [
  '.next',
  '.lighthouseci',
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  'tsconfig.tsbuildinfo'
];

for (const directory of artifacts) {
  const target = resolve(process.cwd(), directory);
  rmSync(target, { recursive: true, force: true });
}

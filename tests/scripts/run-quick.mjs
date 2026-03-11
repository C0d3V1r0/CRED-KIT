import { spawnSync } from 'node:child_process';

const steps = [
  ['npm', ['run', 'test:clean']],
  ['npm', ['run', 'typecheck']],
  ['npm', ['run', 'lint']],
  ['npm', ['run', 'test:coverage']],
  ['npm', ['run', 'test:component']],
  ['npm', ['run', 'test:integration']],
  ['npm', ['run', 'build']],
  ['npm', ['run', 'test:budget']],
  ['npm', ['run', 'test:a11y']]
];

for (const [cmd, args] of steps) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

import { spawnSync } from 'node:child_process';

const steps = [
  ['npm', ['run', 'test:clean']],
  ['npm', ['run', 'test:quick']],
  ['npm', ['run', 'test:e2e']],
  ['npm', ['run', 'test:lighthouse']],
  ['npm', ['run', 'test:budget']]
];

for (const [cmd, args] of steps) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

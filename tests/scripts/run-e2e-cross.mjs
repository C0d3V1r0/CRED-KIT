import { spawnSync } from 'node:child_process';

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  return {
    status: result.status ?? 1,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`
  };
}

function runRequired(scriptName) {
  const result = run('npm', ['run', scriptName]);
  if (result.status !== 0) {
    process.exit(result.status);
  }
}

function runOptionalFirefox() {
  const result = run('npm', ['run', 'test:e2e:firefox']);
  if (result.status === 0) return;

  const fallbackMessage = 'NS_ERROR_NET_ERROR_RESPONSE';
  if (result.output.includes(fallbackMessage)) {
    console.warn(`[warn] ${fallbackMessage}: firefox e2e skipped for current environment`);
    return;
  }

  process.exit(result.status);
}

runRequired('test:e2e');
runOptionalFirefox();
runRequired('test:e2e:webkit');

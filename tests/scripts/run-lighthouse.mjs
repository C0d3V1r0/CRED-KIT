import { spawn, spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import http from 'node:http';

const HOST = '127.0.0.1';
const PORT = 4173;
const TARGET_URL = `http://${HOST}:${PORT}/`;
const REPORT_PATH = '.lighthouseci/report.json';
const MIN_PERFORMANCE = 0.8;
const MIN_ACCESSIBILITY = 0.8;

function runStep(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function waitForServer(timeoutMs = 30_000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const probe = () => {
      const req = http.get(TARGET_URL, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });

      req.on('error', retry);
      req.setTimeout(2_000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error(`Next server did not start at ${TARGET_URL}`));
        return;
      }
      setTimeout(probe, 250);
    };

    probe();
  });
}

async function main() {
  runStep('npm', ['run', 'build']);
  await mkdir('.lighthouseci', { recursive: true });

  const preview = spawn('npm', ['run', 'preview', '--', '--hostname', HOST, '--port', String(PORT)], {
    stdio: 'inherit'
  });

  try {
    await waitForServer();

    runStep('lighthouse', [
      TARGET_URL,
      '--output=json',
      '--output-path', REPORT_PATH,
      '--quiet',
      '--preset=desktop',
      '--throttling-method=provided',
      '--screenEmulation.disabled',
      '--chrome-flags=--headless --no-sandbox'
    ]);

    const rawReport = await readFile(REPORT_PATH, 'utf8');
    const report = JSON.parse(rawReport);

    const performance = report?.categories?.performance?.score ?? 0;
    const accessibility = report?.categories?.accessibility?.score ?? 0;

    if (performance < MIN_PERFORMANCE || accessibility < MIN_ACCESSIBILITY) {
      console.error(`Lighthouse assertions failed:
performance=${performance}
accessibility=${accessibility}`);
      process.exit(1);
    }

    console.log(`Lighthouse passed:
performance=${performance}
accessibility=${accessibility}
report=${REPORT_PATH}`);
  } finally {
    preview.kill('SIGTERM');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

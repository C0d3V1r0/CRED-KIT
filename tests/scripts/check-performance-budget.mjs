import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST_ASSETS_DIR = 'dist/assets';
const LIGHTHOUSE_REPORT = '.lighthouseci/report.json';

const BUDGETS = {
  maxMainJsBytes: 230 * 1024,
  maxMainCssBytes: 105 * 1024,
  maxLcpMs: 2500,
  maxCls: 0.25
};

function getMainAssetSize(extension) {
  if (!existsSync(DIST_ASSETS_DIR)) return null;
  const files = readdirSync(DIST_ASSETS_DIR);
  const mainFile = files.find((file) => file.startsWith('index-') && file.endsWith(extension));
  if (!mainFile) return null;
  return {
    file: mainFile,
    bytes: statSync(join(DIST_ASSETS_DIR, mainFile)).size
  };
}

function assertBudget(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readLighthouseMetrics() {
  if (!existsSync(LIGHTHOUSE_REPORT)) return null;
  const report = JSON.parse(readFileSync(LIGHTHOUSE_REPORT, 'utf8'));
  const lcp = report?.audits?.['largest-contentful-paint']?.numericValue ?? null;
  const cls = report?.audits?.['cumulative-layout-shift']?.numericValue ?? null;
  return { lcp, cls };
}

function main() {
  const js = getMainAssetSize('.js');
  const css = getMainAssetSize('.css');

  if (js) {
    assertBudget(
      js.bytes <= BUDGETS.maxMainJsBytes,
      `Performance budget failed: ${js.file} is ${js.bytes} bytes (limit ${BUDGETS.maxMainJsBytes})`
    );
  }

  if (css) {
    assertBudget(
      css.bytes <= BUDGETS.maxMainCssBytes,
      `Performance budget failed: ${css.file} is ${css.bytes} bytes (limit ${BUDGETS.maxMainCssBytes})`
    );
  }

  const metrics = readLighthouseMetrics();
  if (metrics?.lcp != null) {
    assertBudget(
      metrics.lcp <= BUDGETS.maxLcpMs,
      `Performance budget failed: LCP=${metrics.lcp}ms (limit ${BUDGETS.maxLcpMs}ms)`
    );
  }
  if (metrics?.cls != null) {
    assertBudget(
      metrics.cls <= BUDGETS.maxCls,
      `Performance budget failed: CLS=${metrics.cls} (limit ${BUDGETS.maxCls})`
    );
  }

  console.log('Performance budgets passed', {
    js,
    css,
    lighthouse: metrics ?? 'not-found'
  });
}

main();

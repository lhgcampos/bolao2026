import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4177);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/?demo=planilha`;
const START_TIMEOUT_MS = 45000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'follow' });
      if (response.ok) return;
    } catch {
      // continua tentando ate subir
    }
    await delay(250);
  }

  throw new Error(`Servidor nao respondeu em ${url} apos ${timeoutMs}ms.`);
}

function startDevServer() {
  const child = spawn('node', ['scripts/dev-app.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST,
      PORT: String(PORT)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

async function clickVisibleButton(page, label) {
  await page.locator('button:visible', { hasText: new RegExp(`^${label}$`) }).first().click();
}

async function run() {
  const devServer = startDevServer();
  let browser;

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.getByText('Planilha de Palpites', { exact: true }).waitFor({ timeout: 15000 });

    const expectedMatchId = await page.evaluate(() => {
      const formatDayKey = (timestamp) => new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(new Date(timestamp));

      const visibleRows = Array.from(document.querySelectorAll('[data-match-row-id]'))
        .filter((node) => node instanceof HTMLElement && node.offsetParent !== null)
        .map((node) => {
          const rawId = node.getAttribute('data-match-row-id');
          const scheduleMatch = (node.textContent || '').match(/(\d{1,2})\/(\d{1,2})\s*•\s*(\d{2}:\d{2})\s*BR/);
          if (!rawId || !scheduleMatch) return null;

          const [, day, month, hourText] = scheduleMatch;
          const [hour, minute] = hourText.split(':').map(Number);
          return {
            id: Number(rawId),
            timestamp: new Date(2026, Number(month) - 1, Number(day), hour || 0, minute || 0).getTime()
          };
        })
        .filter((row) => row && Number.isFinite(row.timestamp));

      if (!visibleRows.length) return null;

      const nowMs = Date.now();
      const todayKey = formatDayKey(nowMs);
      const todaysRows = visibleRows.filter((row) => formatDayKey(row.timestamp) === todayKey);
      const futureTodayRows = todaysRows
        .filter((row) => row.timestamp >= nowMs)
        .sort((a, b) => a.timestamp - b.timestamp);
      const candidateRows = futureTodayRows.length
        ? futureTodayRows
        : todaysRows.length
          ? todaysRows
          : visibleRows;

      return candidateRows.sort((a, b) => (
        Math.abs(a.timestamp - nowMs) - Math.abs(b.timestamp - nowMs)
        || a.timestamp - b.timestamp
        || a.id - b.id
      ))[0]?.id || null;
    });

    assert.ok(expectedMatchId, 'Nao foi possivel identificar o proximo jogo esperado.');

    await clickVisibleButton(page, 'Ranking');
    await page.getByText('Ranking', { exact: true }).first().waitFor({ timeout: 15000 });

    await clickVisibleButton(page, 'Painel');
    await page.getByText('Planilha de Palpites', { exact: true }).waitFor({ timeout: 15000 });
    await page.waitForTimeout(1200);

    const scrollResult = await page.evaluate((targetId) => {
      const container = document.querySelector('[data-testid="review-scroll-container"]');
      const targetNode = Array.from(document.querySelectorAll(`[data-match-row-id="${targetId}"]`))
        .find((node) => node instanceof HTMLElement && node.offsetParent !== null);

      if (!(container instanceof HTMLElement) || !(targetNode instanceof HTMLElement)) {
        return null;
      }

      const containerRect = container.getBoundingClientRect();
      const targetRect = targetNode.getBoundingClientRect();

      return {
        scrollTop: container.scrollTop,
        topOffset: targetRect.top - containerRect.top,
        containerHeight: container.clientHeight
      };
    }, expectedMatchId);

    assert.ok(scrollResult, 'Nao foi possivel localizar o container ou a linha alvo no painel.');
    assert.ok(scrollResult.scrollTop > 120, `Painel nao rolou o suficiente (scrollTop=${scrollResult.scrollTop}).`);
    assert.ok(
      scrollResult.topOffset >= -8 && scrollResult.topOffset <= Math.min(220, scrollResult.containerHeight * 0.35),
      `Linha do proximo jogo nao ficou posicionada no topo util do painel (offset=${scrollResult.topOffset}).`
    );

    console.log(`painel scroll ok (jogo ${expectedMatchId})`);
  } finally {
    await browser?.close();
    devServer.kill('SIGTERM');
  }
}

await run();

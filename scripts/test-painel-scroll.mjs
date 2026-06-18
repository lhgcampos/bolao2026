import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';
import { gerarJogosIniciais } from '../bolao-app/src/matchData.js';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4177);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/`;
const START_TIMEOUT_MS = 45000;
const TARGET_MATCH_ID = 67;
const FUTURE_PENDING_MATCH_ID = 63;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildSeedMatches() {
  return gerarJogosIniciais().map((match) => {
    if (match.id === TARGET_MATCH_ID || match.id === FUTURE_PENDING_MATCH_ID) {
      return {
        ...match,
        placarA: '',
        placarB: '',
        isFinal: false
      };
    }

    return {
      ...match,
      placarA: '1',
      placarB: '0',
      isFinal: true
    };
  });
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

async function clickUniqueButton(page, label) {
  const button = page.getByRole('button', { name: label, exact: true });
  assert.equal(await button.count(), 1, `Esperava exatamente um botao "${label}".`);
  await button.click();
}

async function run() {
  const devServer = startDevServer();
  let browser;

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });
    const seedMatches = buildSeedMatches();

    await page.addInitScript((matches) => {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = async (input, init) => {
        const requestUrl = typeof input === 'string' ? input : input?.url || '';
        if (requestUrl.startsWith('https://mantledb.sh/v2/lhgcampos-bolao2026-live-20260609/')) {
          return new Response(JSON.stringify({ error: 'blocked-for-test' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return nativeFetch(input, init);
      };

      window.localStorage.clear();
      window.localStorage.setItem('bolao26_users', JSON.stringify([
        { id: 1, nome: 'Teste User', senha: '123', role: 'participant' }
      ]));
      window.localStorage.setItem('bolao26_matches', JSON.stringify(matches));
      window.localStorage.setItem('bolao26_bets_games', JSON.stringify({}));
      window.localStorage.setItem('bolao26_bets_knockout_v2', JSON.stringify({}));
      window.localStorage.setItem('bolao26_official_knockout_v2', JSON.stringify({}));
      window.localStorage.setItem('bolao26_group_conduct', JSON.stringify({}));
      window.localStorage.setItem('bolao26_submissions', JSON.stringify({}));
    }, seedMatches);

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.getByText('BOLÃO 2026', { exact: true }).waitFor({ timeout: 15000 });

    await page.getByPlaceholder('Ex: Fera Braba').fill('Admin');
    await page.getByPlaceholder('Sua senha secreta').fill('qwer');
    await clickUniqueButton(page, 'Entrar');

    await clickUniqueButton(page, 'Ranking');
    await page.getByText('Ranking', { exact: true }).first().waitFor({ timeout: 15000 });

    await clickUniqueButton(page, 'Painel');
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
        targetText: targetNode.textContent || ''
      };
    }, TARGET_MATCH_ID);

    assert.ok(scrollResult, 'Nao foi possivel localizar o container ou a linha alvo no painel.');
    assert.ok(scrollResult.scrollTop > 120, `Painel nao rolou o suficiente (scrollTop=${scrollResult.scrollTop}).`);
    assert.ok(
      scrollResult.topOffset >= -8 && scrollResult.topOffset <= 220,
      `Linha do proximo jogo pendente nao ficou no topo util do painel (offset=${scrollResult.topOffset}).`
    );
    assert.match(scrollResult.targetText, /Gana/);
    assert.match(scrollResult.targetText, /Panama|Panamá/);

    console.log(`painel scroll ok (jogo ${TARGET_MATCH_ID})`);
  } finally {
    await browser?.close();
    devServer.kill('SIGTERM');
  }
}

await run();

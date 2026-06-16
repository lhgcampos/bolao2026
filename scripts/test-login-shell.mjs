import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4174);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/`;
const START_TIMEOUT_MS = 45000;
const REUSE_SERVER = process.env.APP_REUSE_SERVER === '1';

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
      // keep retrying until the timeout
    }
    await delay(250);
  }
  throw new Error(`Servidor não respondeu em ${url} após ${timeoutMs}ms.`);
}

function startDevServer() {
  if (REUSE_SERVER) return null;

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

async function assertVisible(locator, description) {
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  if (!(await locator.isVisible())) {
    throw new Error(`Elemento esperado não visível: ${description}`);
  }
}

async function run() {
  const devServer = startDevServer();
  let browser;
  const runtimeErrors = [];

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    page.on('console', (message) => {
      if (message.type() === 'error') {
        runtimeErrors.push(`console: ${message.text()}`);
      }
    });
    page.on('pageerror', (error) => {
      runtimeErrors.push(`pageerror: ${error.message}`);
    });

    await page.goto(APP_URL, { waitUntil: 'domcontentloaded' });
    await assertVisible(page.getByRole('heading', { name: 'BOLÃO 2026' }), 'título da tela de login');

    await page.getByLabel('Nome de Usuário').fill('Admin');
    await page.getByLabel('Senha').fill('qwer');
    await page.getByRole('button', { name: /Entrar/i }).click();

    await assertVisible(page.getByText('Admin').first(), 'usuário autenticado');
    await assertVisible(page.getByRole('button', { name: /Fase de Grupos|1a Fase/i }).first(), 'navegação principal');
    await assertVisible(page.getByRole('button', { name: /Mata-mata/i }).first(), 'aba mata-mata');
    await assertVisible(page.getByRole('button', { name: /Ranking/i }).first(), 'aba ranking');

    if (runtimeErrors.length > 0) {
      throw new Error(`O app abriu, mas houve erros após login:\n${runtimeErrors.join('\n')}`);
    }

    console.log(`login shell ok: app abriu após login em ${APP_URL}`);
  } finally {
    await browser?.close();
    devServer?.kill('SIGTERM');
  }
}

await run();

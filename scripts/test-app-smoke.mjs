import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4173);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/`;
const DEMO_URL = `${APP_URL}?demo=planilha`;
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
      // retry until timeout
    }
    await delay(250);
  }
  throw new Error(`Servidor não respondeu em ${url} após ${timeoutMs}ms.`);
}

function startDevServer() {
  const child = spawn('node', ['scripts/dev-app.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      HOST,
      PORT: String(PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  return child;
}

function isIgnorableConsoleError(message) {
  return message === 'Failed to load resource: the server responded with a status of 404 ()';
}

async function collectPageErrors(page, action) {
  const errors = [];
  const pageErrorHandler = (error) => errors.push(`pageerror: ${error.message}`);
  const consoleHandler = (message) => {
    if (message.type() === 'error' && !isIgnorableConsoleError(message.text())) {
      errors.push(`console: ${message.text()}`);
    }
  };

  page.on('pageerror', pageErrorHandler);
  page.on('console', consoleHandler);

  try {
    await action();
  } finally {
    page.off('pageerror', pageErrorHandler);
    page.off('console', consoleHandler);
  }

  return errors;
}

async function assertVisible(page, selector, description) {
  await page.locator(selector).waitFor({ state: 'visible', timeout: 15000 });
  const visible = await page.locator(selector).isVisible();
  if (!visible) {
    throw new Error(`Elemento esperado não visível: ${description}`);
  }
}

async function assertLocatorVisible(locator, description) {
  await locator.waitFor({ state: 'visible', timeout: 15000 });
  const visible = await locator.isVisible();
  if (!visible) {
    throw new Error(`Elemento esperado não visível: ${description}`);
  }
}

async function run() {
  const devServer = startDevServer();
  let browser;

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    const loginErrors = await collectPageErrors(page, async () => {
      await page.goto(APP_URL, { waitUntil: 'networkidle' });
      await assertVisible(page, 'text=BOLÃO 2026', 'título da tela de login');
      await assertVisible(page, 'text=Instalar no celular', 'card de instalação');
      await assertVisible(page, 'text=Entrar no grupo do WhatsApp', 'atalho do grupo');
    });

    if (loginErrors.length > 0) {
      throw new Error(`Tela de login com erros:\n${loginErrors.join('\n')}`);
    }

    const demoErrors = await collectPageErrors(page, async () => {
      await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
      await assertLocatorVisible(page.getByRole('heading', { name: 'Planilha de Palpites' }), 'painel demo');
      await page.getByRole('button', { name: 'Ranking' }).click();
      await assertVisible(page, 'text=Ranking fechado', 'mensagem do ranking');
    });

    if (demoErrors.length > 0) {
      throw new Error(`Modo demo com erros:\n${demoErrors.join('\n')}`);
    }

    console.log(`smoke ok: login e demo responderam em ${APP_URL}`);
  } finally {
    await browser?.close();
    devServer.kill('SIGTERM');
  }
}

await run();

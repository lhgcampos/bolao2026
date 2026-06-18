import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4178);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/`;
const START_TIMEOUT_MS = 45000;
const REUSE_SERVER = process.env.APP_REUSE_SERVER === '1';
const THEME_STORAGE_KEY = 'bolao26_theme_preference';

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
      // keep retrying until timeout
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
      PORT: String(PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

async function assertTheme(page, expectedTheme, description) {
  await page.waitForFunction(
    (theme) => document.documentElement.dataset.theme === theme,
    expectedTheme,
    { timeout: 15000 }
  );

  const currentTheme = await page.evaluate(() => document.documentElement.dataset.theme);
  if (currentTheme !== expectedTheme) {
    throw new Error(`${description}: esperado "${expectedTheme}", recebido "${currentTheme}".`);
  }
}

async function assertStoredPreference(page, expectedPreference) {
  const currentPreference = await page.evaluate((storageKey) => window.localStorage.getItem(storageKey), THEME_STORAGE_KEY);
  if (currentPreference !== expectedPreference) {
    throw new Error(`Preferência salva incorreta. Esperado "${expectedPreference}", recebido "${currentPreference}".`);
  }
}

async function run() {
  const devServer = startDevServer();
  let browser;

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);

    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ colorScheme: 'dark' });
    const page = await context.newPage();

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: 'BOLÃO 2026' }).waitFor({ state: 'visible', timeout: 15000 });
    await page.getByText('Aparência').waitFor({ state: 'visible', timeout: 15000 });

    await assertTheme(page, 'dark', 'Tema automático inicial');
    await assertStoredPreference(page, 'system');

    await page.getByRole('button', { name: 'Claro' }).click();
    await assertTheme(page, 'light', 'Tema claro manual');
    await assertStoredPreference(page, 'light');

    await page.reload({ waitUntil: 'networkidle' });
    await assertTheme(page, 'light', 'Persistência do tema claro');
    await assertStoredPreference(page, 'light');

    await page.getByRole('button', { name: 'Noturno' }).click();
    await assertTheme(page, 'dark', 'Tema noturno manual');
    await assertStoredPreference(page, 'dark');

    await page.getByRole('button', { name: 'Automático' }).click();
    await assertTheme(page, 'dark', 'Tema automático em aparelho escuro');
    await assertStoredPreference(page, 'system');

    await context.close();

    const lightContext = await browser.newContext({ colorScheme: 'light' });
    const lightPage = await lightContext.newPage();

    await lightPage.goto(APP_URL, { waitUntil: 'networkidle' });
    await assertTheme(lightPage, 'light', 'Tema automático em aparelho claro');
    await assertStoredPreference(lightPage, 'system');

    await lightContext.close();

    console.log(`theme preference ok: automático, persistência e troca manual responderam em ${APP_URL}`);
  } finally {
    await browser?.close();
    devServer?.kill('SIGTERM');
  }
}

await run();

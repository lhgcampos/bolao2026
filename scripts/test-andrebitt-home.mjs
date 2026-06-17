import { spawn } from 'node:child_process';
import process from 'node:process';
import { chromium } from 'playwright';

const HOST = process.env.APP_HOST || '127.0.0.1';
const PORT = Number(process.env.APP_PORT || 4175);
const APP_URL = process.env.APP_URL || `http://${HOST}:${PORT}/`;
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
      PORT: String(PORT)
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr.on('data', (chunk) => process.stderr.write(chunk));

  return child;
}

async function run() {
  const devServer = startDevServer();
  let browser;

  try {
    await waitForServer(APP_URL, START_TIMEOUT_MS);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(APP_URL, { waitUntil: 'networkidle' });
    await page.getByPlaceholder('Ex: Fera Braba').fill('andrebitt');
    await page.getByPlaceholder('Sua senha secreta').fill('julesrimet70');
    await page.getByRole('button', { name: /^Entrar$/ }).click();

    await page.getByRole('button', { name: 'Fase de Grupos', exact: true }).first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(1000);

    const bodyText = await page.locator('body').innerText();
    const hasWarning = bodyText.includes('Complete seus envios para liberar o painel.')
      || bodyText.includes('Falta concluir o mata-mata para liberar o painel.')
      || bodyText.includes('Mata-mata Pendente')
      || bodyText.includes('Mata-mata: pendente');

    if (!bodyText.includes('andrebitt')) {
      throw new Error('andrebitt não apareceu após login.');
    }

    if (hasWarning) {
      throw new Error('Aviso de mata-mata ainda apareceu para andrebitt.');
    }

    if (
      !bodyText.includes('MATA-MATA\nEnviado')
      && !bodyText.includes('MATA-MATA Enviado')
      && !bodyText.includes('Mata-mata\nEnviado')
      && !bodyText.includes('Mata-mata Enviado')
    ) {
      throw new Error('Status de mata-mata não apareceu como enviado.');
    }

    console.log('andrebitt home ok');
  } finally {
    await browser?.close();
    devServer.kill('SIGTERM');
  }
}

await run();

import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createReadStream, existsSync, watch as watchFiles } from 'node:fs';
import fs from 'node:fs/promises';
import * as esbuild from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ROOT_DIR = path.resolve(__dirname, '..');
export const APP_DIR = path.join(ROOT_DIR, 'bolao-app');
export const SRC_DIR = path.join(APP_DIR, 'src');
export const PUBLIC_DIR = path.join(APP_DIR, 'public');
export const DIST_DIR = path.join(APP_DIR, 'dist');
export const HTML_TEMPLATE_PATH = path.join(APP_DIR, 'index.html');
export const CSS_RUNTIME_PATH = path.join(SRC_DIR, 'index.prebuilt.css');
export const APP_ENTRY_PATH = path.join(SRC_DIR, 'App.jsx');

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
};

function createBuildAssetVersion() {
  if (process.env.BUILD_ASSET_VERSION) return process.env.BUILD_ASSET_VERSION;
  return new Date().toISOString().replace(/\D/g, '').slice(0, 14);
}

function normalizeBase(baseValue) {
  let base = baseValue || '/';
  if (!base.startsWith('/')) base = `/${base}`;
  if (!base.endsWith('/')) base = `${base}/`;
  return base;
}

function escapeForRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildDefineMap(base) {
  return {
    'import.meta.env.BASE_URL': JSON.stringify(base),
    'import.meta.env.VITE_AVATAR_PUBLIC_BASE_URL': JSON.stringify(process.env.VITE_AVATAR_PUBLIC_BASE_URL || ''),
    'import.meta.env.VITE_AVATAR_UPLOAD_URL': JSON.stringify(process.env.VITE_AVATAR_UPLOAD_URL || ''),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  };
}

async function copyDirectory(sourceDir, targetDir) {
  await fs.mkdir(targetDir, { recursive: true });
  const entries = await fs.readdir(sourceDir, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
      return;
    }
    await fs.copyFile(sourcePath, targetPath);
  }));
}

async function copyCssRuntime(outdir, cssFileName) {
  await fs.mkdir(path.join(outdir, 'assets'), { recursive: true });
  await fs.copyFile(CSS_RUNTIME_PATH, path.join(outdir, 'assets', cssFileName));
}

async function writeIndexHtml({ base, outdir, cssFileName, jsFileName }) {
  const template = await fs.readFile(HTML_TEMPLATE_PATH, 'utf8');
  const rootedTemplate = template
    .replace(/\s*<script type="module" src="\/src\/main\.jsx"><\/script>\s*/u, '\n')
    .replace(/(href|src)="\/(?!\/)/g, `$1="${base}`);
  const assetMarkup = [
    `    <link rel="stylesheet" href="${base}assets/${cssFileName}" />`,
    `    <script type="module" src="${base}assets/${jsFileName}"></script>`,
  ].join('\n');
  const html = rootedTemplate.replace('</head>', `${assetMarkup}\n  </head>`);
  await fs.writeFile(path.join(outdir, 'index.html'), html);
}

function createVirtualEntry() {
  return [
    `import React, { StrictMode } from "react";`,
    `import { createRoot } from "react-dom/client";`,
    `import App from ${JSON.stringify(APP_ENTRY_PATH)};`,
    ``,
    `createRoot(document.getElementById("root")).render(`,
    `  React.createElement(StrictMode, null, React.createElement(App, null))`,
    `);`,
    '',
  ].join('\n');
}

export function resolveBase(mode = 'production') {
  return normalizeBase(mode === 'production' ? (process.env.PAGES_BASE_PATH || '/bolao2026/') : '/');
}

export async function buildApp({ mode = 'production', outdir = DIST_DIR } = {}) {
  const base = resolveBase(mode);
  const buildAssetVersion = createBuildAssetVersion();
  const jsFileName = `index-${buildAssetVersion}.js`;
  const cssFileName = `index-${buildAssetVersion}.css`;
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'bolao2026-build-'));
  const entryPath = path.join(tempDir, 'entry.mjs');
  await fs.writeFile(entryPath, createVirtualEntry(), 'utf8');

  try {
    await fs.rm(outdir, { recursive: true, force: true });
    await fs.mkdir(path.join(outdir, 'assets'), { recursive: true });
    console.log(`building app bundle (${mode})`);
    await esbuild.build({
      absWorkingDir: ROOT_DIR,
      assetNames: 'assets/[name]',
      bundle: true,
      define: buildDefineMap(base),
      entryPoints: [entryPath],
      entryNames: `assets/index-${buildAssetVersion}`,
      format: 'esm',
      jsx: 'transform',
      loader: {
        '.jpg': 'file',
        '.jpeg': 'file',
        '.png': 'file',
        '.svg': 'file',
        '.webp': 'file',
      },
      minify: mode === 'production',
      nodePaths: [path.join(ROOT_DIR, 'node_modules')],
      outdir,
      platform: 'browser',
      publicPath: base,
      sourcemap: false,
      target: ['es2020'],
    });
    console.log('copying css runtime');
    await copyCssRuntime(outdir, cssFileName);
    console.log('copying public assets');
    await copyDirectory(PUBLIC_DIR, outdir);
    console.log('writing html shell');
    await writeIndexHtml({ base, outdir, cssFileName, jsFileName });
    return {
      base,
      outdir,
      cssPath: path.join(outdir, 'assets', cssFileName),
      jsPath: path.join(outdir, 'assets', jsFileName),
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

export function stopBuildServices() {
  esbuild.stop();
}

function resolveFilePathFromUrl(urlPath) {
  const pathname = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const trimmed = pathname.replace(/^\/+/, '');
  const candidate = trimmed === '' ? 'index.html' : trimmed;
  const absolutePath = path.join(DIST_DIR, candidate);
  if (existsSync(absolutePath)) {
    return absolutePath;
  }
  if (!path.extname(candidate)) {
    return path.join(DIST_DIR, 'index.html');
  }
  return null;
}

export function createStaticRequestHandler() {
  return async function handleRequest(request, response) {
    const filePath = resolveFilePathFromUrl(request.url || '/');
    if (!filePath) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Not found');
      return;
    }

    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Not found');
        return;
      }
      response.writeHead(200, {
        'Cache-Control': 'no-cache',
        'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
      });
      createReadStream(filePath).pipe(response);
    } catch (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end(`Failed to read ${path.basename(filePath)}: ${error.message}`);
    }
  };
}

export async function watchAppSources(onChange) {
  const watchedTargets = [
    path.join(APP_DIR, 'src'),
    path.join(APP_DIR, 'public'),
    HTML_TEMPLATE_PATH,
  ];
  const watchers = [];

  for (const target of watchedTargets) {
    try {
      const watcher = watchFiles(target, { recursive: true }, () => {
        onChange();
      });
      watchers.push(watcher);
    } catch {
      // Some environments do not support recursive watchers; serving still works without live rebuilds.
    }
  }

  return () => {
    for (const watcher of watchers) {
      watcher.close();
    }
  };
}

export function formatBuildSummary(result) {
  return `built ${path.relative(ROOT_DIR, result.jsPath)} and ${path.relative(ROOT_DIR, result.cssPath)} with base ${result.base}`;
}

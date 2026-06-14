import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import * as espree from 'espree';
import { CSS_RUNTIME_PATH, HTML_TEMPLATE_PATH, ROOT_DIR } from './app-toolchain.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JS_LIKE_EXTENSIONS = new Set(['.js', '.jsx', '.mjs']);
const RESOLVABLE_EXTENSIONS = ['', '.js', '.jsx', '.mjs', '.cjs', '.json', '.css'];
const TARGET_PATHS = [
  path.join(ROOT_DIR, 'bolao-app', 'src'),
  path.join(ROOT_DIR, 'scripts'),
  path.join(ROOT_DIR, 'workers'),
  path.join(ROOT_DIR, 'cloudflare'),
  path.join(ROOT_DIR, 'eslint.config.js'),
  path.join(ROOT_DIR, 'vite.config.js'),
];

function walkAst(node, visit) {
  if (!node || typeof node !== 'object') return;
  visit(node);
  for (const value of Object.values(node)) {
    if (!value) continue;
    if (Array.isArray(value)) {
      value.forEach((entry) => walkAst(entry, visit));
      continue;
    }
    if (typeof value === 'object' && typeof value.type === 'string') {
      walkAst(value, visit);
    }
  }
}

function buildCandidatePaths(specifier, importer) {
  const absoluteBase = path.resolve(path.dirname(importer), specifier);
  const paths = [];
  for (const extension of RESOLVABLE_EXTENSIONS) {
    paths.push(`${absoluteBase}${extension}`);
  }
  for (const extension of RESOLVABLE_EXTENSIONS.filter(Boolean)) {
    paths.push(path.join(absoluteBase, `index${extension}`));
  }
  return paths;
}

async function resolveRelativeSpecifier(specifier, importer) {
  for (const candidatePath of buildCandidatePaths(specifier, importer)) {
    try {
      const stats = await fs.stat(candidatePath);
      if (stats.isFile()) {
        return candidatePath;
      }
    } catch {
      // keep trying
    }
  }
  return null;
}

async function collectTargetFiles(targetPath) {
  try {
    const stats = await fs.stat(targetPath);
    if (stats.isFile()) return [targetPath];
  } catch {
    return [];
  }

  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolutePath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      return collectTargetFiles(absolutePath);
    }
    return [absolutePath];
  }));

  return files.flat();
}

async function lintJavaScriptFile(filePath, errors) {
  const source = await fs.readFile(filePath, 'utf8');
  let program;

  try {
    program = espree.parse(source, {
      ecmaVersion: 'latest',
      ecmaFeatures: { jsx: true },
      loc: true,
      sourceType: 'module',
    });
  } catch (error) {
    errors.push(`${path.relative(ROOT_DIR, filePath)}:${error.lineNumber || 1}:${error.column || 1} ${error.message}`);
    return;
  }

  const specifiers = [];
  walkAst(program, (node) => {
    if (
      (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration' || node.type === 'ExportNamedDeclaration')
      && node.source
      && typeof node.source.value === 'string'
    ) {
      specifiers.push(node.source.value);
    }
    if (node.type === 'ImportExpression' && node.source?.type === 'Literal' && typeof node.source.value === 'string') {
      specifiers.push(node.source.value);
    }
  });

  for (const specifier of specifiers) {
    if (!specifier.startsWith('.')) continue;
    const resolvedPath = await resolveRelativeSpecifier(specifier, filePath);
    if (!resolvedPath) {
      errors.push(`${path.relative(ROOT_DIR, filePath)} missing relative import ${specifier}`);
    }
  }
}

async function main() {
  const targetFiles = (await Promise.all(TARGET_PATHS.map((targetPath) => collectTargetFiles(targetPath)))).flat();
  const filesToLint = targetFiles.filter((filePath) => JS_LIKE_EXTENSIONS.has(path.extname(filePath)));
  const errors = [];

  for (const filePath of filesToLint) {
    await lintJavaScriptFile(filePath, errors);
  }

  try {
    await fs.stat(CSS_RUNTIME_PATH);
  } catch {
    errors.push(`${path.relative(ROOT_DIR, CSS_RUNTIME_PATH)} is required by the build pipeline`);
  }

  try {
    await fs.stat(HTML_TEMPLATE_PATH);
  } catch {
    errors.push(`${path.relative(ROOT_DIR, HTML_TEMPLATE_PATH)} is missing`);
  }

  if (errors.length > 0) {
    console.error(errors.join('\n'));
    process.exit(1);
  }

  console.log(`lint ok: parsed ${filesToLint.length} files and verified runtime assets`);
}

await main();

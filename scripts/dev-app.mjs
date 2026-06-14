import http from 'node:http';
import { buildApp, createStaticRequestHandler, formatBuildSummary, watchAppSources } from './app-toolchain.mjs';

const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';

let rebuildTimer = null;
let rebuilding = false;

async function runBuild() {
  rebuilding = true;
  try {
    const result = await buildApp({ mode: 'development' });
    console.log(formatBuildSummary(result));
  } finally {
    rebuilding = false;
  }
}

function scheduleRebuild() {
  if (rebuilding) return;
  clearTimeout(rebuildTimer);
  rebuildTimer = setTimeout(() => {
    runBuild().catch((error) => {
      console.error(`rebuild failed: ${error.message}`);
    });
  }, 150);
}

await runBuild();
const closeWatchers = await watchAppSources(scheduleRebuild);
const server = http.createServer(createStaticRequestHandler());

const listenResult = await new Promise((resolve, reject) => {
  server.once('error', (error) => {
    if (error && (error.code === 'EPERM' || error.code === 'EACCES')) {
      resolve({ blocked: true, error });
      return;
    }
    reject(error);
  });
  server.listen(port, host, () => {
    resolve({ blocked: false });
  });
});

if (listenResult.blocked) {
  console.warn(`dev server listen blocked on http://${host}:${port}; build artifacts are available in bolao-app/dist`);
  closeWatchers();
  process.exit(0);
}

console.log(`dev server listening on http://${host}:${port}`);

function shutdown() {
  clearTimeout(rebuildTimer);
  closeWatchers();
  server.close(() => {
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

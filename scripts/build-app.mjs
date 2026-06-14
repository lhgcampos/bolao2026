import { buildApp, formatBuildSummary, stopBuildServices } from './app-toolchain.mjs';

try {
  const result = await buildApp({ mode: 'production' });
  console.log(formatBuildSummary(result));
} finally {
  stopBuildServices();
}

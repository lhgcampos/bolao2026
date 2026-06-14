import { runOfficialResultsSyncJob } from '../workers/official-results/runOfficialResultsSync.js';

const run = async () => {
  const result = await runOfficialResultsSyncJob({
    env: process.env,
    fetchImpl: fetch,
    triggeredBy: 'node-script'
  });

  console.log(JSON.stringify(result, null, 2));
};

run().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

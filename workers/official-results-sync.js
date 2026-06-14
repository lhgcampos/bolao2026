import { runOfficialResultsSyncJob } from './official-results/runOfficialResultsSync.js';

export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);

    if (pathname === '/health') {
      return Response.json({
        ok: true,
        service: 'official-results-sync'
      });
    }

    return Response.json({
      ok: true,
      service: 'official-results-sync',
      message: 'Worker ativo. O auto-sync roda via cron server-side.'
    });
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(runOfficialResultsSyncJob({
      env,
      fetchImpl: fetch,
      triggeredBy: 'cloudflare-cron'
    }));
  }
};

import { fetchFootballDataMatches } from '../bolao-app/src/officialResults/providers/footballDataProvider.js';
import { fetchEspnWorldCupMatches } from '../bolao-app/src/officialResults/providers/espnWorldCupProvider.js';
import { fetchOpenFootballMatches } from '../bolao-app/src/officialResults/providers/openFootballProvider.js';
import { syncOfficialResults } from '../bolao-app/src/officialResults/officialResultSync.js';
import { deriveOfficialKnockout, getTournamentSyncWindowState, mergeOfficialKnockout } from '../bolao-app/src/officialResults/tournamentSync.js';
import { gerarJogosIniciais, normalizePersistedGameData } from '../bolao-app/src/matchData.js';

const REMOTE_STORE_BASE = process.env.OFFICIAL_RESULTS_REMOTE_BASE || 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = process.env.OFFICIAL_RESULTS_REMOTE_NAMESPACE || 'lhgcampos-bolao2026-live-20260609';
const REMOTE_LEGACY_STATE_PATH = 'state';
const REMOTE_PATHS = {
  meta: 'meta',
  matches: 'matches',
  officialKnockout: 'official-knockout'
};

const AUTO_APPLY = process.env.OFFICIAL_RESULTS_AUTO_APPLY !== 'false';
const DRY_RUN = process.env.OFFICIAL_RESULTS_DRY_RUN === 'true';
const PROVIDERS = String(process.env.OFFICIAL_RESULTS_PROVIDER || 'espn')
  .split(',')
  .map((provider) => provider.trim())
  .filter(Boolean);

const getRemotePathUrl = (path) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${path}`;

const fetchRemoteEntry = async (path) => {
  const response = await fetch(getRemotePathUrl(path));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Falha ao ler ${path} (${response.status})`);
  return response.json();
};

const writeRemoteEntry = async (path, payload) => {
  const response = await fetch(getRemotePathUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falha ao gravar ${path} (${response.status})`);
  }
};

const loadRemoteMatches = async () => {
  const [metaDoc, matchesDoc, legacyDoc] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.matches),
    fetchRemoteEntry(REMOTE_LEGACY_STATE_PATH)
  ]);

  if (Array.isArray(matchesDoc)) {
    return {
      meta: metaDoc || {},
      matches: normalizePersistedGameData(matchesDoc, {}).matches
    };
  }

  if (Array.isArray(legacyDoc?.matches)) {
    return {
      meta: metaDoc || legacyDoc || {},
      matches: normalizePersistedGameData(legacyDoc.matches, {}).matches
    };
  }

  return {
    meta: metaDoc || {},
    matches: gerarJogosIniciais()
  };
};

const fetchProviderMatches = async (providerName) => {
  if (providerName === 'football-data') {
    return fetchFootballDataMatches({
      token: process.env.FOOTBALL_DATA_API_TOKEN,
      competitionCode: process.env.FOOTBALL_DATA_COMPETITION_CODE || 'WC',
      season: Number(process.env.FOOTBALL_DATA_SEASON || 2026)
    });
  }

  if (providerName === 'espn') {
    return fetchEspnWorldCupMatches({
      startDate: process.env.ESPN_WORLD_CUP_START_DATE || '20260611',
      endDate: process.env.ESPN_WORLD_CUP_END_DATE || '20260719'
    });
  }

  if (providerName === 'openfootball') {
    return fetchOpenFootballMatches();
  }

  throw new Error(`Provider não suportado: ${providerName}`);
};

const run = async () => {
  const syncMode = String(process.env.OFFICIAL_RESULTS_SYNC_CRON || 'manual');
  const windowState = getTournamentSyncWindowState();
  if (syncMode === '*/5 * * * *' && !windowState.active) {
    console.log(JSON.stringify({ providerPolicy: { configuredProviders: PROVIDERS, syncMode, windowState }, report: { skipped: 'outside-active-window' } }, null, 2));
    return;
  }
  if (syncMode === '*/30 * * * *' && windowState.active) {
    console.log(JSON.stringify({ providerPolicy: { configuredProviders: PROVIDERS, syncMode, windowState }, report: { skipped: 'inside-active-window' } }, null, 2));
    return;
  }

  const providerResults = await Promise.all(PROVIDERS.map(async (provider) => ({
    provider,
    matches: await fetchProviderMatches(provider)
  })));

  const { meta, matches } = await loadRemoteMatches();
  const officialKnockoutDoc = await fetchRemoteEntry(REMOTE_PATHS.officialKnockout) || {};
  const externalMatches = providerResults.flatMap((entry) => entry.matches);
  const appliedAt = Date.now();
  const syncResult = syncOfficialResults({
    matches,
    externalMatches,
    autoApply: AUTO_APPLY && !DRY_RUN,
    appliedAt
  });
  const derivedOfficialKnockout = mergeOfficialKnockout(officialKnockoutDoc, deriveOfficialKnockout(externalMatches));
  const officialKnockoutChanged = JSON.stringify(derivedOfficialKnockout) !== JSON.stringify(officialKnockoutDoc || {});

  if (AUTO_APPLY && !DRY_RUN && (syncResult.changed || officialKnockoutChanged)) {
    const userIds = Array.isArray(meta?.userIds) ? meta.userIds : [];
    if (syncResult.changed) {
      await writeRemoteEntry(REMOTE_PATHS.matches, syncResult.matches);
    }
    if (officialKnockoutChanged) {
      await writeRemoteEntry(REMOTE_PATHS.officialKnockout, derivedOfficialKnockout);
    }
    await writeRemoteEntry(REMOTE_PATHS.meta, {
      schemaVersion: meta?.schemaVersion || 3,
      updatedAt: appliedAt,
      userIds
    });
  }

  const output = {
    providerPolicy: {
      configuredProviders: PROVIDERS,
      autoApply: AUTO_APPLY,
      dryRun: DRY_RUN,
      syncMode,
      windowState
    },
    report: {
      ...syncResult.report,
      officialKnockoutChanged
    }
  };

  console.log(JSON.stringify(output, null, 2));
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});

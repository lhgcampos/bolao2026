import { gerarJogosIniciais, normalizePersistedGameData } from '../../bolao-app/src/matchData.js';
import {
  createEmptyOfficialBracketSlots,
  countPublishedOfficialBracketMatches,
  countPublishedOfficialBracketTeams,
  mergeOfficialBracketSlots,
  normalizeOfficialBracketSlots
} from '../../bolao-app/src/officialResults/officialBracketSlots.js';
import { syncOfficialResults } from '../../bolao-app/src/officialResults/officialResultSync.js';
import { deriveOfficialKnockout, mergeOfficialKnockout } from '../../bolao-app/src/officialResults/tournamentSync.js';
import { fetchApiFootballMatches } from './providers/apiFootballProvider.js';
import { fetchFifaBracketSlots } from './providers/fifaBracketProvider.js';
import { fetchFootballDataMatches } from './providers/footballDataProvider.js';

const REMOTE_SCHEMA_VERSION = 4;
const REMOTE_LEGACY_STATE_PATH = 'state';
const REMOTE_PATHS = {
  meta: 'meta',
  matches: 'matches',
  officialKnockout: 'official-knockout',
  officialBracketSlots: 'official-bracket-slots',
  officialResultsSyncStatus: 'official-results-sync-status',
  officialResultsSyncHistory: 'official-results-sync-history'
};

const getRemoteStoreBase = (env = {}) => env.OFFICIAL_RESULTS_REMOTE_BASE || 'https://mantledb.sh/v2';
const getRemoteNamespace = (env = {}) => env.OFFICIAL_RESULTS_REMOTE_NAMESPACE || 'lhgcampos-bolao2026-live-20260609';
const getRemotePathUrl = (env, path) => `${getRemoteStoreBase(env)}/${getRemoteNamespace(env)}/${path}`;

const parseConfiguredProviders = (env = {}) => String(env.OFFICIAL_RESULTS_PROVIDER || 'football-data')
  .split(',')
  .map((provider) => provider.trim())
  .filter(Boolean);

const parseHistoryLimit = (env = {}) => {
  const value = Number.parseInt(env.OFFICIAL_RESULTS_SYNC_HISTORY_LIMIT || '40', 10);
  return Number.isInteger(value) && value > 0 ? value : 40;
};

const fetchRemoteEntry = async (fetchImpl, env, path) => {
  const response = await fetchImpl(getRemotePathUrl(env, path));
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Falha ao ler ${path} (${response.status})`);
  }
  return response.json();
};

const writeRemoteEntry = async (fetchImpl, env, path, payload) => {
  const response = await fetchImpl(getRemotePathUrl(env, path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falha ao gravar ${path} (${response.status})`);
  }
};

const loadRemoteState = async (fetchImpl, env) => {
  const [metaDoc, matchesDoc, legacyDoc, officialKnockoutDoc, officialBracketSlotsDoc, syncStatusDoc, syncHistoryDoc] = await Promise.all([
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.meta),
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.matches),
    fetchRemoteEntry(fetchImpl, env, REMOTE_LEGACY_STATE_PATH),
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialKnockout),
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialBracketSlots),
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialResultsSyncStatus),
    fetchRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialResultsSyncHistory)
  ]);

  if (Array.isArray(matchesDoc)) {
    return {
      meta: metaDoc || {},
      matches: normalizePersistedGameData(matchesDoc, {}).matches,
      officialKnockout: officialKnockoutDoc || {},
      officialBracketSlots: normalizeOfficialBracketSlots(officialBracketSlotsDoc || {}),
      syncStatus: syncStatusDoc || {},
      syncHistory: Array.isArray(syncHistoryDoc) ? syncHistoryDoc : []
    };
  }

  if (Array.isArray(legacyDoc?.matches)) {
    return {
      meta: metaDoc || legacyDoc || {},
      matches: normalizePersistedGameData(legacyDoc.matches, {}).matches,
      officialKnockout: officialKnockoutDoc || legacyDoc?.officialKnockout || {},
      officialBracketSlots: normalizeOfficialBracketSlots(officialBracketSlotsDoc || legacyDoc?.officialBracketSlots || {}),
      syncStatus: syncStatusDoc || {},
      syncHistory: Array.isArray(syncHistoryDoc) ? syncHistoryDoc : []
    };
  }

  return {
    meta: metaDoc || {},
    matches: gerarJogosIniciais(),
    officialKnockout: officialKnockoutDoc || {},
    officialBracketSlots: normalizeOfficialBracketSlots(officialBracketSlotsDoc || {}),
    syncStatus: syncStatusDoc || {},
    syncHistory: Array.isArray(syncHistoryDoc) ? syncHistoryDoc : []
  };
};

const fetchProviderMatches = async (providerName, fetchImpl, env) => {
  if (providerName === 'football-data') {
    return fetchFootballDataMatches({
      fetchImpl,
      token: env.FOOTBALL_DATA_API_TOKEN,
      competitionCode: env.FOOTBALL_DATA_COMPETITION_CODE || 'WC',
      season: Number(env.FOOTBALL_DATA_SEASON || 2026)
    });
  }

  if (providerName === 'api-football') {
    return fetchApiFootballMatches({
      fetchImpl,
      key: env.API_FOOTBALL_KEY,
      leagueId: Number(env.API_FOOTBALL_LEAGUE_ID || 1),
      season: Number(env.API_FOOTBALL_SEASON || 2026)
    });
  }

  throw new Error(`Provider não suportado: ${providerName}`);
};

const buildOutcome = ({ dryRun, changed, providerErrors, providerResults }) => {
  if (dryRun) return 'dry-run';
  if (!providerResults.length) return 'failed';
  if (providerErrors.length) return 'partial-error';
  return changed ? 'updated' : 'no-change';
};

const buildSyncStatus = ({
  previousStatus = {},
  configuredProviders,
  providerResults,
  providerErrors,
  syncResult,
  officialKnockoutChanged,
  officialBracketSlotsChanged,
  officialBracketSlotsMeta,
  autoApply,
  dryRun,
  triggeredBy,
  appliedAt
}) => {
  const changed = syncResult.changed || officialKnockoutChanged || officialBracketSlotsChanged;
  const outcome = buildOutcome({ dryRun, changed, providerErrors, providerResults });
  const successfulRun = providerResults.length > 0;

  return {
    schemaVersion: 1,
    providerPolicy: {
      configuredProviders,
      autoApply,
      dryRun
    },
    triggeredBy,
    lastRunAt: appliedAt,
    lastSuccessAt: successfulRun ? appliedAt : Number(previousStatus?.lastSuccessAt || 0),
    lastAppliedAt: changed ? appliedAt : Number(previousStatus?.lastAppliedAt || 0),
    lastOutcome: outcome,
    scannedMatches: Number(syncResult?.report?.scanned || 0),
    updatedMatches: Number(syncResult?.report?.applied?.length || 0),
    skippedMatches: Number(syncResult?.report?.skipped?.length || 0),
    conflictMatches: Number(syncResult?.report?.conflicts?.length || 0),
    officialKnockoutChanged: Boolean(officialKnockoutChanged),
    officialBracketSlotsChanged: Boolean(officialBracketSlotsChanged),
    officialBracketSlotsPublishedMatches: Number(officialBracketSlotsMeta?.publishedMatches || 0),
    officialBracketSlotsPublishedTeams: Number(officialBracketSlotsMeta?.publishedTeams || 0),
    officialBracketSlotsError: officialBracketSlotsMeta?.error || '',
    providers: providerResults.map((entry) => ({
      provider: entry.provider,
      matches: entry.matches.length
    })),
    providerErrors
  };
};

const buildSyncHistoryEntry = ({
  syncStatus,
  syncResult,
  officialKnockoutChanged,
  officialBracketSlotsChanged
}) => ({
  runAt: syncStatus.lastRunAt,
  triggeredBy: syncStatus.triggeredBy,
  outcome: syncStatus.lastOutcome,
  providerPolicy: syncStatus.providerPolicy,
  scannedMatches: syncStatus.scannedMatches,
  updatedMatches: syncStatus.updatedMatches,
  skippedMatches: syncStatus.skippedMatches,
  conflictMatches: syncStatus.conflictMatches,
  officialKnockoutChanged,
  officialBracketSlotsChanged,
  providers: syncStatus.providers,
  providerErrors: syncStatus.providerErrors,
  applied: syncResult.report.applied,
  skipped: syncResult.report.skipped,
  conflicts: syncResult.report.conflicts,
  dryRun: syncResult.report.dryRun
});

export const runOfficialResultsSyncJob = async ({
  env = {},
  fetchImpl = fetch,
  dryRunOverride,
  triggeredBy = 'manual'
} = {}) => {
  const configuredProviders = parseConfiguredProviders(env);
  const autoApply = env.OFFICIAL_RESULTS_AUTO_APPLY !== 'false';
  const dryRun = dryRunOverride ?? (env.OFFICIAL_RESULTS_DRY_RUN === 'true');
  const appliedAt = Date.now();
  const historyLimit = parseHistoryLimit(env);

  const providerAttempts = await Promise.all(configuredProviders.map(async (provider) => {
    try {
      const matches = await fetchProviderMatches(provider, fetchImpl, env);
      return {
        provider,
        matches,
        error: null
      };
    } catch (error) {
      return {
        provider,
        matches: [],
        error: error?.message || String(error)
      };
    }
  }));

  const providerResults = providerAttempts
    .filter((attempt) => !attempt.error)
    .map(({ provider, matches }) => ({ provider, matches }));
  const providerErrors = providerAttempts
    .filter((attempt) => attempt.error)
    .map(({ provider, error }) => ({ provider, message: error }));

  const { meta, matches, officialKnockout, officialBracketSlots, syncStatus: previousStatus, syncHistory } = await loadRemoteState(fetchImpl, env);
  let fetchedOfficialBracketSlots = createEmptyOfficialBracketSlots();
  let officialBracketSlotsError = '';

  if (env.OFFICIAL_BRACKET_SLOTS_ENABLED !== 'false') {
    try {
      fetchedOfficialBracketSlots = await fetchFifaBracketSlots({
        fetchImpl,
        seasonId: Number(env.FIFA_BRACKET_SEASON_ID || 285023),
        language: env.FIFA_BRACKET_LANGUAGE || 'en'
      });
    } catch (error) {
      officialBracketSlotsError = error?.message || String(error);
    }
  }

  const externalMatches = providerResults.flatMap((entry) => entry.matches);
  const syncResult = syncOfficialResults({
    matches,
    externalMatches,
    autoApply: autoApply && !dryRun,
    appliedAt
  });
  const derivedOfficialKnockout = mergeOfficialKnockout(officialKnockout, deriveOfficialKnockout(externalMatches));
  const officialKnockoutChanged = JSON.stringify(derivedOfficialKnockout) !== JSON.stringify(officialKnockout || {});
  const derivedOfficialBracketSlots = mergeOfficialBracketSlots(officialBracketSlots, fetchedOfficialBracketSlots);
  const officialBracketSlotsChanged = JSON.stringify(derivedOfficialBracketSlots) !== JSON.stringify(normalizeOfficialBracketSlots(officialBracketSlots || {}));
  const officialBracketSlotsMeta = {
    publishedMatches: countPublishedOfficialBracketMatches(derivedOfficialBracketSlots),
    publishedTeams: countPublishedOfficialBracketTeams(derivedOfficialBracketSlots),
    error: officialBracketSlotsError
  };
  const nextSyncStatus = buildSyncStatus({
    previousStatus,
    configuredProviders,
    providerResults,
    providerErrors,
    syncResult,
    officialKnockoutChanged,
    officialBracketSlotsChanged,
    officialBracketSlotsMeta,
    autoApply,
    dryRun,
    triggeredBy,
    appliedAt
  });
  const nextSyncHistory = [
    buildSyncHistoryEntry({
      syncStatus: nextSyncStatus,
      syncResult,
      officialKnockoutChanged,
      officialBracketSlotsChanged
    }),
    ...(Array.isArray(syncHistory) ? syncHistory : [])
  ].slice(0, historyLimit);

  if (!dryRun) {
    const userIds = Array.isArray(meta?.userIds) ? meta.userIds : [];

    if (autoApply && syncResult.changed) {
      await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.matches, syncResult.matches);
    }

    if (autoApply && officialKnockoutChanged) {
      await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialKnockout, derivedOfficialKnockout);
    }

    if (officialBracketSlotsChanged) {
      await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialBracketSlots, derivedOfficialBracketSlots);
    }

    await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialResultsSyncStatus, nextSyncStatus);
    await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.officialResultsSyncHistory, nextSyncHistory);
    await writeRemoteEntry(fetchImpl, env, REMOTE_PATHS.meta, {
      schemaVersion: REMOTE_SCHEMA_VERSION,
      updatedAt: appliedAt,
      userIds
    });
  }

  return {
    ok: providerResults.length > 0,
    providerPolicy: {
      configuredProviders,
      autoApply,
      dryRun
    },
    report: {
      ...syncResult.report,
      officialKnockoutChanged,
      officialBracketSlotsChanged,
      providerErrors
    },
    syncStatus: nextSyncStatus
  };
};

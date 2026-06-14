import { isManualResultLocked, placarPreenchido } from '../matchData.js';

const FINAL_STATUSES = new Set(['FINISHED', 'FT', 'FULL_TIME', 'COMPLETED', 'CLOSED', 'AFTER_PENALTIES', 'AET']);
const BLOCKED_STATUSES = new Set([
  'TIMED',
  'SCHEDULED',
  'LIVE',
  'IN_PLAY',
  'PAUSED',
  'HALF_TIME',
  'HT',
  'BREAK',
  'EXTRA_TIME',
  'PEN_LIVE',
  'SUSPENDED',
  'POSTPONED',
  'CANCELLED',
  'ABANDONED',
  'DELAYED',
  'INTERRUPTED'
]);

const isValidScore = (value) => Number.isInteger(value) && value >= 0;

export const isFinalResultStatus = (status) => FINAL_STATUSES.has(String(status || '').toUpperCase());

export const isBlockedLiveStatus = (status) => BLOCKED_STATUSES.has(String(status || '').toUpperCase());

const hasStaleConflictingAutoResult = ({ existingMatch, externalMatch }) => {
  if (!placarPreenchido(existingMatch?.placarA, existingMatch?.placarB)) return false;
  if (!existingMatch?.isFinal || existingMatch?.resultOrigin !== 'auto-sync') return false;
  if (existingMatch?.resultSource !== externalMatch?.provider) return false;
  if (String(existingMatch?.resultExternalMatchId || '') !== String(externalMatch?.externalMatchId || '')) return false;

  const sameScore = String(existingMatch?.placarA) === String(externalMatch?.scoreHome)
    && String(existingMatch?.placarB) === String(externalMatch?.scoreAway);

  if (sameScore) return false;

  const externalUpdatedAt = externalMatch?.lastUpdated ? new Date(externalMatch.lastUpdated).getTime() : Number.NaN;
  const currentUpdatedAt = Number(existingMatch?.resultUpdatedAt || 0);

  return !Number.isFinite(externalUpdatedAt) || externalUpdatedAt <= currentUpdatedAt;
};

export const validateOfficialResultCandidate = ({ existingMatch, mappedMatch, externalMatch }) => {
  if (!mappedMatch?.matched || !mappedMatch.localMatch) {
    return { ok: false, reason: mappedMatch?.reason || 'local-match-not-found' };
  }

  if (isManualResultLocked(existingMatch)) {
    return { ok: false, reason: 'manual-lock-active' };
  }

  if (isBlockedLiveStatus(externalMatch?.status)) {
    return { ok: false, reason: 'blocked-live-status' };
  }

  if (!isFinalResultStatus(externalMatch?.status)) {
    return { ok: false, reason: 'status-not-final' };
  }

  if (!isValidScore(externalMatch?.scoreHome) || !isValidScore(externalMatch?.scoreAway)) {
    return { ok: false, reason: 'invalid-final-score' };
  }

  if (hasStaleConflictingAutoResult({ existingMatch, externalMatch })) {
    return { ok: false, reason: 'stale-conflicting-auto-result' };
  }

  return { ok: true, reason: 'validated-final-score' };
};

const FINAL_STATUSES = new Set(['FINISHED', 'FT', 'FULL_TIME', 'COMPLETED', 'CLOSED']);
const BLOCKED_STATUSES = new Set(['TIMED', 'LIVE', 'IN_PLAY', 'SUSPENDED', 'POSTPONED', 'CANCELLED', 'ABANDONED']);

const isValidScore = (value) => Number.isInteger(value) && value >= 0;

export const isFinalResultStatus = (status) => FINAL_STATUSES.has(String(status || '').toUpperCase());

export const isBlockedLiveStatus = (status) => BLOCKED_STATUSES.has(String(status || '').toUpperCase());

export const validateOfficialResultCandidate = ({ existingMatch, mappedMatch, externalMatch }) => {
  if (!mappedMatch?.matched || !mappedMatch.localMatch) {
    return { ok: false, reason: mappedMatch?.reason || 'local-match-not-found' };
  }

  if (existingMatch?.manualOverride) {
    return { ok: false, reason: 'manual-override-active' };
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

  return { ok: true, reason: 'validated-final-score' };
};

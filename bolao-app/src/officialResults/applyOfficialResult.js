import { placarPreenchido } from '../matchData.js';

const buildScoreSnapshot = (match) => (
  placarPreenchido(match?.placarA, match?.placarB)
    ? { placarA: String(match.placarA), placarB: String(match.placarB), isFinal: Boolean(match?.isFinal) }
    : null
);

const appendHistoryEntry = (match, entry) => ({
  ...match,
  resultHistory: [...(Array.isArray(match?.resultHistory) ? match.resultHistory : []), entry]
});

const sameScore = (match, scoreHome, scoreAway) => (
  String(match?.placarA ?? '') === String(scoreHome) &&
  String(match?.placarB ?? '') === String(scoreAway) &&
  Boolean(match?.isFinal)
);

export const applyAutomaticOfficialResult = (match, externalMatch, { appliedAt = Date.now() } = {}) => {
  if (!match || !externalMatch) {
    return { changed: false, match };
  }

  const nextScoreA = String(externalMatch.scoreHome);
  const nextScoreB = String(externalMatch.scoreAway);
  const scoreAlreadyApplied = sameScore(match, nextScoreA, nextScoreB)
    && match?.resultSource === externalMatch.provider
    && match?.resultExternalStatus === externalMatch.status
    && !match?.manualOverride;

  if (scoreAlreadyApplied) {
    return {
      changed: false,
      match: {
        ...match,
        resultUpdatedAt: appliedAt,
        lastAutoSyncAt: appliedAt
      }
    };
  }

  const previousScore = buildScoreSnapshot(match);
  const nextEntry = {
    gameId: match.id,
    previousScore,
    newScore: { placarA: nextScoreA, placarB: nextScoreB, isFinal: true },
    source: externalMatch.provider,
    externalMatchId: String(externalMatch.externalMatchId || ''),
    externalStatus: externalMatch.status,
    appliedAt,
    appliedBy: 'auto-sync',
    confidence: externalMatch.confidence || 'high',
    reason: 'external-final-score'
  };

  return {
    changed: true,
    match: appendHistoryEntry({
      ...match,
      placarA: nextScoreA,
      placarB: nextScoreB,
      isFinal: true,
      resultSource: externalMatch.provider,
      resultSourceLabel: externalMatch.sourceLabel || externalMatch.provider,
      resultExternalMatchId: String(externalMatch.externalMatchId || ''),
      resultExternalStatus: externalMatch.status || '',
      resultUpdatedAt: appliedAt,
      resultConfidence: externalMatch.confidence || 'high',
      resultOrigin: 'auto-sync',
      lastAutoSyncAt: appliedAt
    }, nextEntry)
  };
};

export const applyManualResultCorrection = (
  match,
  {
    placarA,
    placarB,
    isFinal = true,
    appliedAt = Date.now(),
    appliedBy = 'admin',
    reason = 'admin-correction'
  }
) => {
  if (!match) {
    return { changed: false, match };
  }

  const nextScoreA = placarA === '' || placarA === null || placarA === undefined ? '' : String(placarA);
  const nextScoreB = placarB === '' || placarB === null || placarB === undefined ? '' : String(placarB);
  const nextIsFinal = Boolean(isFinal && nextScoreA !== '' && nextScoreB !== '');
  const previousScore = buildScoreSnapshot(match);

  const changed = (
    String(match?.placarA ?? '') !== nextScoreA ||
    String(match?.placarB ?? '') !== nextScoreB ||
    Boolean(match?.isFinal) !== nextIsFinal ||
    !match?.manualOverride
  );

  if (!changed) {
    return { changed: false, match };
  }

  const nextEntry = {
    gameId: match.id,
    previousScore,
    newScore: nextScoreA !== '' && nextScoreB !== '' ? { placarA: nextScoreA, placarB: nextScoreB, isFinal: nextIsFinal } : null,
    source: 'manual-correction',
    appliedAt,
    appliedBy,
    reason
  };

  return {
    changed: true,
    match: appendHistoryEntry({
      ...match,
      placarA: nextScoreA,
      placarB: nextScoreB,
      isFinal: nextIsFinal,
      resultSource: 'manual-correction',
      resultSourceLabel: 'Correção manual',
      resultExternalMatchId: '',
      resultExternalStatus: nextIsFinal ? 'MANUAL_FINAL' : 'MANUAL_PENDING',
      resultUpdatedAt: appliedAt,
      resultConfidence: 'high',
      resultOrigin: 'manual',
      manualOverride: true,
      manualOverrideAt: appliedAt,
      manualOverrideBy: appliedBy,
      manualOverrideReason: reason
    }, nextEntry)
  };
};

export const clearManualResultOverride = (match, { appliedAt = Date.now(), appliedBy = 'admin' } = {}) => {
  if (!match?.manualOverride) {
    return { changed: false, match };
  }

  const nextEntry = {
    gameId: match.id,
    previousScore: buildScoreSnapshot(match),
    newScore: buildScoreSnapshot(match),
    source: 'manual-override-clear',
    appliedAt,
    appliedBy,
    reason: 'manual-override-cleared'
  };

  return {
    changed: true,
    match: appendHistoryEntry({
      ...match,
      manualOverride: false,
      manualOverrideAt: 0,
      manualOverrideBy: '',
      manualOverrideReason: ''
    }, nextEntry)
  };
};

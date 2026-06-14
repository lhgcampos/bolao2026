import { isManualResultLocked, placarPreenchido } from '../matchData.js';
import { appendResultHistoryEntry, buildScoreSnapshot } from './resultHistory.js';

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
    && !isManualResultLocked(match);

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
    reason: 'external-final-score',
    manualLock: false
  };

  return {
    changed: true,
    match: appendResultHistoryEntry({
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
    !isManualResultLocked(match)
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
    reason,
    manualLock: true
  };

  return {
    changed: true,
    match: appendResultHistoryEntry({
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
      manualLock: true,
      manualLockAt: appliedAt,
      manualLockBy: appliedBy,
      manualLockReason: reason,
      manualOverride: true,
      manualOverrideAt: appliedAt,
      manualOverrideBy: appliedBy,
      manualOverrideReason: reason
    }, nextEntry)
  };
};

export const clearManualResultLock = (match, { appliedAt = Date.now(), appliedBy = 'admin' } = {}) => {
  if (!isManualResultLocked(match)) {
    return { changed: false, match };
  }

  const nextEntry = {
    gameId: match.id,
    previousScore: buildScoreSnapshot(match),
    newScore: buildScoreSnapshot(match),
    source: 'manual-override-clear',
    appliedAt,
    appliedBy,
    reason: 'manual-override-cleared',
    manualLock: false
  };

  return {
    changed: true,
    match: appendResultHistoryEntry({
      ...match,
      manualLock: false,
      manualLockAt: 0,
      manualLockBy: '',
      manualLockReason: '',
      manualOverride: false,
      manualOverrideAt: 0,
      manualOverrideBy: '',
      manualOverrideReason: ''
    }, nextEntry)
  };
};

export const clearManualResultOverride = clearManualResultLock;

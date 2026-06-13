import { mapExternalMatchToLocal } from './matchMapping.js';
import { applyAutomaticOfficialResult } from './applyOfficialResult.js';
import { validateOfficialResultCandidate } from './resultValidation.js';

const buildCandidateKey = (candidate) => `${candidate.scoreHome}:${candidate.scoreAway}`;

export const syncOfficialResults = ({
  matches = [],
  externalMatches = [],
  autoApply = true,
  appliedAt = Date.now()
} = {}) => {
  const nextMatches = [...matches];
  const matchesById = new Map(nextMatches.map((match) => [match.id, match]));
  const candidatesByMatchId = new Map();
  const report = {
    scanned: externalMatches.length,
    applied: [],
    skipped: [],
    conflicts: [],
    dryRun: []
  };

  externalMatches.forEach((externalMatch) => {
    const mappedMatch = mapExternalMatchToLocal(externalMatch, matches);
    const localMatch = mappedMatch.localMatch || null;
    const existingMatch = localMatch ? matchesById.get(localMatch.id) : null;
    const validation = validateOfficialResultCandidate({ existingMatch, mappedMatch, externalMatch });

    if (!validation.ok || !localMatch) {
      report.skipped.push({
        externalMatchId: externalMatch.externalMatchId,
        provider: externalMatch.provider,
        reason: validation.reason
      });
      return;
    }

    const candidate = {
      ...externalMatch,
      localMatchId: localMatch.id,
      confidence: mappedMatch.confidence
    };
    const currentCandidates = candidatesByMatchId.get(localMatch.id) || [];
    candidatesByMatchId.set(localMatch.id, [...currentCandidates, candidate]);
  });

  candidatesByMatchId.forEach((candidates, localMatchId) => {
    const uniqueScores = new Set(candidates.map(buildCandidateKey));
    if (uniqueScores.size > 1) {
      report.conflicts.push({
        gameId: localMatchId,
        providers: candidates.map((candidate) => candidate.provider),
        reason: 'provider-score-conflict'
      });
      return;
    }

    const authoritativeCandidates = candidates.filter((candidate) => candidate.authoritative !== false);
    if (!authoritativeCandidates.length) {
      report.skipped.push({
        gameId: localMatchId,
        reason: 'non-authoritative-provider-only'
      });
      return;
    }

    const [chosenCandidate] = authoritativeCandidates;
    if (!autoApply) {
      report.dryRun.push({
        gameId: localMatchId,
        provider: chosenCandidate.provider,
        score: `${chosenCandidate.scoreHome} x ${chosenCandidate.scoreAway}`
      });
      return;
    }

    const currentMatch = matchesById.get(localMatchId);
    const applied = applyAutomaticOfficialResult(currentMatch, chosenCandidate, { appliedAt });
    if (!applied.changed) {
      return;
    }

    matchesById.set(localMatchId, applied.match);
    const matchIndex = nextMatches.findIndex((match) => match.id === localMatchId);
    if (matchIndex >= 0) {
      nextMatches[matchIndex] = applied.match;
    }

    report.applied.push({
      gameId: localMatchId,
      provider: chosenCandidate.provider,
      score: `${chosenCandidate.scoreHome} x ${chosenCandidate.scoreAway}`
    });
  });

  return {
    matches: nextMatches,
    report,
    changed: report.applied.length > 0
  };
};

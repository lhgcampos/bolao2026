import { placarPreenchido } from '../matchData.js';

export const buildScoreSnapshot = (match) => (
  placarPreenchido(match?.placarA, match?.placarB)
    ? { placarA: String(match.placarA), placarB: String(match.placarB), isFinal: Boolean(match?.isFinal) }
    : null
);

export const appendResultHistoryEntry = (match, entry) => ({
  ...match,
  resultHistory: [...(Array.isArray(match?.resultHistory) ? match.resultHistory : []), entry]
});

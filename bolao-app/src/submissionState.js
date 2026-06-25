import { placarPreenchido } from './matchData.js';

export const normalizeKnockoutRound = (values = [], size = 0) => Array.from(
  { length: size },
  (_, index) => (typeof values?.[index] === 'string' ? values[index] : '')
);

export const normalizeKnockoutBracketShape = (bracket = {}, phaseLengths = {}) => ({
  dezeszeseisavos: normalizeKnockoutRound(bracket.dezeszeseisavos, phaseLengths.dezeszeseisavos || 0),
  oitavas: normalizeKnockoutRound(bracket.oitavas, phaseLengths.oitavas || 0),
  quartas: normalizeKnockoutRound(bracket.quartas, phaseLengths.quartas || 0),
  semis: normalizeKnockoutRound(bracket.semis, phaseLengths.semis || 0),
  campeao: typeof bracket.campeao === 'string' ? bracket.campeao : '',
  vice: typeof bracket.vice === 'string' ? bracket.vice : '',
  terceiro: typeof bracket.terceiro === 'string' ? bracket.terceiro : '',
  quarto: typeof bracket.quarto === 'string' ? bracket.quarto : ''
});

export const countFilledKnockoutSelections = (bracket = {}, phaseLengths = {}) => {
  const normalized = normalizeKnockoutBracketShape(bracket, phaseLengths);
  return (
    ['dezeszeseisavos', 'oitavas', 'quartas', 'semis'].reduce(
      (total, field) => total + normalized[field].filter(Boolean).length,
      0
    ) +
    ['campeao', 'vice', 'terceiro', 'quarto'].filter((field) => Boolean(normalized[field])).length
  );
};

export const countFilledGameSelections = (bets = {}) => Object.values(bets || {}).reduce((total, bet) => (
  placarPreenchido(bet?.placarA, bet?.placarB) ? total + 1 : total
), 0);

export const mergeSubmissionEntry = (baseEntry = {}, localEntry = {}) => {
  const next = {
    ...(baseEntry && typeof baseEntry === 'object' ? baseEntry : {}),
    ...(localEntry && typeof localEntry === 'object' ? localEntry : {})
  };

  const jogosAt = Math.max(baseEntry?.jogosAt || 0, localEntry?.jogosAt || 0);
  const mataAt = Math.max(baseEntry?.mataAt || 0, localEntry?.mataAt || 0);

  if (jogosAt) next.jogosAt = jogosAt;
  if (mataAt) next.mataAt = mataAt;

  return next;
};

export const userCompletedAllGames = (matches = [], bets = {}) => matches.every((match) => {
  const bet = bets?.[match.id];
  return placarPreenchido(bet?.placarA, bet?.placarB);
});

export const countPendingGames = (matches = [], bets = {}) => matches.reduce((total, match) => {
  const bet = bets?.[match.id];
  return placarPreenchido(bet?.placarA, bet?.placarB) ? total : total + 1;
}, 0);

export const userCompletedKnockout = (bracket = {}, phaseLengths = {}) => {
  const normalized = normalizeKnockoutBracketShape(bracket, phaseLengths);
  return (
    normalized.dezeszeseisavos.length === (phaseLengths.dezeszeseisavos || 0) &&
    normalized.dezeszeseisavos.every(Boolean) &&
    normalized.oitavas.length === (phaseLengths.oitavas || 0) &&
    normalized.oitavas.every(Boolean) &&
    normalized.quartas.length === (phaseLengths.quartas || 0) &&
    normalized.quartas.every(Boolean) &&
    normalized.semis.length === (phaseLengths.semis || 0) &&
    normalized.semis.every(Boolean) &&
    [normalized.campeao, normalized.vice, normalized.terceiro, normalized.quarto].every(Boolean)
  );
};

export const reconcileSubmissionMap = ({
  submissions = {},
  matches = [],
  betsGames = {},
  betsKnockout = {},
  phaseLengths = {}
}) => {
  const allUserIds = new Set([
    ...Object.keys(submissions || {}),
    ...Object.keys(betsGames || {}),
    ...Object.keys(betsKnockout || {})
  ]);

  return Object.fromEntries(
    [...allUserIds].map((userId) => {
      const normalizedEntry = mergeSubmissionEntry({}, submissions?.[userId]);
      const nextEntry = {};

      // Submission timestamps are authoritative user actions. We preserve them here
      // instead of deriving lock state from mutable bet docs, because those docs can
      // be partially edited, restored, or become inconsistent after submission.
      if (normalizedEntry.jogosAt) {
        nextEntry.jogosAt = normalizedEntry.jogosAt;
      }

      if (normalizedEntry.mataAt) {
        nextEntry.mataAt = normalizedEntry.mataAt;
      }

      return [userId, nextEntry];
    })
  );
};

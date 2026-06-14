export const TOURNAMENT_KNOCKOUT_SCHEDULE = {
  r32: [
    { id: 73, kickoffEt: '2026-06-28T12:00:00-07:00' },
    { id: 74, kickoffEt: '2026-06-29T16:30:00-04:00' },
    { id: 75, kickoffEt: '2026-06-29T19:00:00-06:00' },
    { id: 76, kickoffEt: '2026-06-29T12:00:00-05:00' },
    { id: 77, kickoffEt: '2026-06-30T17:00:00-04:00' },
    { id: 78, kickoffEt: '2026-06-30T12:00:00-05:00' },
    { id: 79, kickoffEt: '2026-06-30T19:00:00-06:00' },
    { id: 80, kickoffEt: '2026-07-01T12:00:00-04:00' },
    { id: 81, kickoffEt: '2026-07-01T17:00:00-07:00' },
    { id: 82, kickoffEt: '2026-07-01T13:00:00-07:00' },
    { id: 83, kickoffEt: '2026-07-02T19:00:00-04:00' },
    { id: 84, kickoffEt: '2026-07-02T12:00:00-07:00' },
    { id: 85, kickoffEt: '2026-07-02T20:00:00-07:00' },
    { id: 86, kickoffEt: '2026-07-03T18:00:00-04:00' },
    { id: 87, kickoffEt: '2026-07-03T20:30:00-05:00' },
    { id: 88, kickoffEt: '2026-07-03T13:00:00-05:00' }
  ],
  r16: [
    { id: 89, kickoffEt: '2026-07-04T17:00:00-04:00' },
    { id: 90, kickoffEt: '2026-07-04T12:00:00-05:00' },
    { id: 91, kickoffEt: '2026-07-05T16:00:00-04:00' },
    { id: 92, kickoffEt: '2026-07-05T18:00:00-06:00' },
    { id: 93, kickoffEt: '2026-07-06T14:00:00-05:00' },
    { id: 94, kickoffEt: '2026-07-06T17:00:00-07:00' },
    { id: 95, kickoffEt: '2026-07-07T12:00:00-04:00' },
    { id: 96, kickoffEt: '2026-07-07T13:00:00-07:00' }
  ],
  qf: [
    { id: 97, kickoffEt: '2026-07-09T16:00:00-04:00' },
    { id: 98, kickoffEt: '2026-07-10T12:00:00-07:00' },
    { id: 99, kickoffEt: '2026-07-11T17:00:00-04:00' },
    { id: 100, kickoffEt: '2026-07-11T20:00:00-05:00' }
  ],
  sf: [
    { id: 101, kickoffEt: '2026-07-14T14:00:00-05:00' },
    { id: 102, kickoffEt: '2026-07-15T15:00:00-04:00' }
  ],
  bronzeFinal: [{ id: 103, kickoffEt: '2026-07-18T17:00:00-04:00' }],
  final: [{ id: 104, kickoffEt: '2026-07-19T15:00:00-04:00' }]
};

const getWinnerName = (externalMatch) => {
  if (externalMatch?.homeWinner) return externalMatch?.homeTeam?.name || externalMatch?.homeTeam?.shortName || '';
  if (externalMatch?.awayWinner) return externalMatch?.awayTeam?.name || externalMatch?.awayTeam?.shortName || '';

  const scoreHome = Number(externalMatch?.scoreHome);
  const scoreAway = Number(externalMatch?.scoreAway);
  if (Number.isInteger(scoreHome) && Number.isInteger(scoreAway)) {
    if (scoreHome > scoreAway) return externalMatch?.homeTeam?.name || externalMatch?.homeTeam?.shortName || '';
    if (scoreAway > scoreHome) return externalMatch?.awayTeam?.name || externalMatch?.awayTeam?.shortName || '';
  }

  return '';
};

const pickRoundMatches = (externalMatches, roundKey) => externalMatches
  .filter((match) => match?.roundKey === roundKey && Number.isInteger(match?.scoreHome) && Number.isInteger(match?.scoreAway))
  .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());

const buildRoundWinners = (externalMatches, roundKey, expectedCount) => {
  const winners = Array(expectedCount).fill('');
  pickRoundMatches(externalMatches, roundKey).forEach((match, index) => {
    if (index >= expectedCount) return;
    winners[index] = getWinnerName(match);
  });
  return winners;
};

export const deriveOfficialKnockout = (externalMatches = []) => {
  const r32 = buildRoundWinners(externalMatches, 'r32', TOURNAMENT_KNOCKOUT_SCHEDULE.r32.length);
  const r16 = buildRoundWinners(externalMatches, 'r16', TOURNAMENT_KNOCKOUT_SCHEDULE.r16.length);
  const qf = buildRoundWinners(externalMatches, 'qf', TOURNAMENT_KNOCKOUT_SCHEDULE.qf.length);
  const sf = buildRoundWinners(externalMatches, 'sf', TOURNAMENT_KNOCKOUT_SCHEDULE.sf.length);
  const finalMatch = pickRoundMatches(externalMatches, 'final')[0];
  const bronzeMatch = pickRoundMatches(externalMatches, 'bronze')[0];

  const finalWinner = getWinnerName(finalMatch);
  const finalLoser = finalMatch ? (
    finalWinner === (finalMatch.homeTeam?.name || finalMatch.homeTeam?.shortName || '') ? (finalMatch.awayTeam?.name || finalMatch.awayTeam?.shortName || '') : (finalMatch.homeTeam?.name || finalMatch.homeTeam?.shortName || '')
  ) : '';
  const bronzeWinner = getWinnerName(bronzeMatch);
  const bronzeLoser = bronzeMatch ? (
    bronzeWinner === (bronzeMatch.homeTeam?.name || bronzeMatch.homeTeam?.shortName || '') ? (bronzeMatch.awayTeam?.name || bronzeMatch.awayTeam?.shortName || '') : (bronzeMatch.homeTeam?.name || bronzeMatch.homeTeam?.shortName || '')
  ) : '';

  return {
    dezeszeseisavos: r32,
    oitavas: r16,
    quartas: qf,
    semis: sf,
    campeao: finalWinner,
    vice: finalLoser,
    terceiro: bronzeWinner,
    quarto: bronzeLoser
  };
};

export const mergeOfficialKnockout = (existing = {}, derived = {}) => {
  const merged = {
    dezeszeseisavos: Array.isArray(existing.dezeszeseisavos) ? [...existing.dezeszeseisavos] : Array(TOURNAMENT_KNOCKOUT_SCHEDULE.r32.length).fill(''),
    oitavas: Array.isArray(existing.oitavas) ? [...existing.oitavas] : Array(TOURNAMENT_KNOCKOUT_SCHEDULE.r16.length).fill(''),
    quartas: Array.isArray(existing.quartas) ? [...existing.quartas] : Array(TOURNAMENT_KNOCKOUT_SCHEDULE.qf.length).fill(''),
    semis: Array.isArray(existing.semis) ? [...existing.semis] : Array(TOURNAMENT_KNOCKOUT_SCHEDULE.sf.length).fill(''),
    campeao: existing.campeao || '',
    vice: existing.vice || '',
    terceiro: existing.terceiro || '',
    quarto: existing.quarto || ''
  };

  ['dezeszeseisavos', 'oitavas', 'quartas', 'semis'].forEach((phaseKey) => {
    if (!Array.isArray(derived[phaseKey])) return;
    derived[phaseKey].forEach((value, index) => {
      if (value) merged[phaseKey][index] = value;
    });
  });

  ['campeao', 'vice', 'terceiro', 'quarto'].forEach((field) => {
    if (derived[field]) merged[field] = derived[field];
  });

  return merged;
};

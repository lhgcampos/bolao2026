import { MATA_MATA_CONFIG } from './constants.js';
import { GRUPOS_2026, placarPreenchido } from './matchData.js';
import { THIRD_PLACE_ASSIGNMENTS } from './thirdPlaceAssignments.js';
import { TEAM_FIFA_RANKINGS } from './fifaTeamRankings.js';
import { evaluateKnockoutPhasePick } from './officialResults/knockoutPhaseScoring.js';
import { resolveLocalTeamName } from './officialResults/matchMapping.js';

const normalizeTeam = (value) => {
  const label = typeof value === 'string' ? value.trim() : '';
  if (!label) return '';
  return resolveLocalTeamName({ name: label, shortName: label }) || label;
};

const isResolvedTeam = (value) => {
  const normalized = normalizeTeam(value);
  if (!normalized) return false;
  if (normalized === 'A definir' || normalized === 'Aguardando oficial') return false;
  if (normalized.startsWith('3o de ') || normalized.startsWith('3º de ')) return false;
  if (normalized.startsWith('Venc. ') || /^V\d+$/i.test(normalized)) return false;
  return true;
};

const getTeamOfficialRank = (team) => TEAM_FIFA_RANKINGS[team]?.officialRank ?? Number.MAX_SAFE_INTEGER;

const compareOfficialRanking = (a, b) => (
  getTeamOfficialRank(a.time) - getTeamOfficialRank(b.time)
);

const compareBaseCriteria = (a, b) => (
  b.p - a.p ||
  b.sg - a.sg ||
  b.gp - a.gp ||
  b.conduta - a.conduta ||
  compareOfficialRanking(a, b) ||
  a.time.localeCompare(b.time, 'pt-BR')
);

const calculateMiniTable = (tiedTeams, processedMatches) => {
  const mini = {};
  tiedTeams.forEach((team) => {
    mini[team] = { p: 0, sg: 0, gp: 0 };
  });

  processedMatches.forEach((match) => {
    if (!tiedTeams.includes(match.timeA) || !tiedTeams.includes(match.timeB)) return;

    mini[match.timeA].gp += match.pA;
    mini[match.timeA].sg += match.pA - match.pB;
    mini[match.timeB].gp += match.pB;
    mini[match.timeB].sg += match.pB - match.pA;

    if (match.pA > match.pB) {
      mini[match.timeA].p += 3;
    } else if (match.pB > match.pA) {
      mini[match.timeB].p += 3;
    } else {
      mini[match.timeA].p += 1;
      mini[match.timeB].p += 1;
    }
  });

  return mini;
};

const resolveFifaGroupTie = (rows, processedMatches) => {
  if (rows.length <= 1) return rows;

  const miniTable = calculateMiniTable(rows.map((row) => row.time), processedMatches);
  const enriched = rows.map((row) => ({
    ...row,
    miniP: miniTable[row.time].p,
    miniSg: miniTable[row.time].sg,
    miniGp: miniTable[row.time].gp
  }));

  enriched.sort((a, b) => (
    b.miniP - a.miniP ||
    b.miniSg - a.miniSg ||
    b.miniGp - a.miniGp
  ));

  const groups = [];
  enriched.forEach((row) => {
    const last = groups[groups.length - 1];
    if (
      last &&
      last[0].miniP === row.miniP &&
      last[0].miniSg === row.miniSg &&
      last[0].miniGp === row.miniGp
    ) {
      last.push(row);
      return;
    }

    groups.push([row]);
  });

  return groups.flatMap((group) => {
    if (group.length === 1) return group;
    if (group.length !== rows.length) {
      return resolveFifaGroupTie(
        group.map(({ miniP, miniSg, miniGp, ...rest }) => rest),
        processedMatches
      );
    }

    return group
      .map(({ miniP, miniSg, miniGp, ...rest }) => rest)
      .sort((a, b) => compareBaseCriteria(a, b));
  });
};

const sortFifaGroupTable = (rows, processedMatches) => {
  const byPoints = [...rows].sort((a, b) => b.p - a.p);
  const groups = [];

  byPoints.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last[0].p === row.p) {
      last.push(row);
      return;
    }
    groups.push([row]);
  });

  return groups.flatMap((group) => (
    group.length === 1 ? group : resolveFifaGroupTie(group, processedMatches)
  ));
};

const getConductScore = (group, team, conductByGroup = {}) => {
  const cardData = conductByGroup?.[group]?.[team];
  return Number(cardData?.score || 0);
};

const calculateGroupTable = (group, matches, gamePredictions, conduct = {}, { preferPredictions = false } = {}) => {
  const teams = GRUPOS_2026[group];
  const table = {};
  const processedMatches = [];

  teams.forEach((team) => {
    table[team] = {
      time: team,
      grupo: group,
      p: 0,
      j: 0,
      v: 0,
      e: 0,
      d: 0,
      gp: 0,
      gc: 0,
      sg: 0,
      conduta: getConductScore(group, team, conduct)
    };
  });

  matches
    .filter((match) => match.grupo === group)
    .forEach((match) => {
      const prediction = gamePredictions?.[match.id];
      const hasPrediction = placarPreenchido(prediction?.placarA, prediction?.placarB);
      let scoreA = preferPredictions && hasPrediction ? prediction.placarA : match.placarA;
      let scoreB = preferPredictions && hasPrediction ? prediction.placarB : match.placarB;

      if (scoreA === '' || scoreB === '') {
        if (hasPrediction) {
          scoreA = prediction.placarA;
          scoreB = prediction.placarB;
        }
      }

      if (scoreA === '' || scoreB === '') return;
      if (!table[match.timeA] || !table[match.timeB]) return;

      const parsedA = Number.parseInt(scoreA, 10);
      const parsedB = Number.parseInt(scoreB, 10);
      processedMatches.push({ timeA: match.timeA, timeB: match.timeB, pA: parsedA, pB: parsedB });

      table[match.timeA].j += 1;
      table[match.timeA].gp += parsedA;
      table[match.timeA].gc += parsedB;
      table[match.timeA].sg += (parsedA - parsedB);

      table[match.timeB].j += 1;
      table[match.timeB].gp += parsedB;
      table[match.timeB].gc += parsedA;
      table[match.timeB].sg += (parsedB - parsedA);

      if (parsedA > parsedB) {
        table[match.timeA].v += 1;
        table[match.timeA].p += 3;
        table[match.timeB].d += 1;
      } else if (parsedB > parsedA) {
        table[match.timeB].v += 1;
        table[match.timeB].p += 3;
        table[match.timeA].d += 1;
      } else {
        table[match.timeA].e += 1;
        table[match.timeA].p += 1;
        table[match.timeB].e += 1;
        table[match.timeB].p += 1;
      }
    });

  return sortFifaGroupTable(Object.values(table), processedMatches);
};

const sortThirdPlaceTeams = (teams) => [...teams].sort((a, b) => compareBaseCriteria(a, b));

const resolveThirdPlaceMatchups = (bestThirdPlaces, availableSlots) => {
  const ordered = sortThirdPlaceTeams(bestThirdPlaces);
  const qualifiedGroups = ordered
    .map((team) => team.grupo)
    .sort()
    .join('');
  const officialCombination = THIRD_PLACE_ASSIGNMENTS[qualifiedGroups];

  if (officialCombination) {
    const thirdPlaceByGroup = Object.fromEntries(
      ordered.map((team) => [`3${team.grupo}`, team.time])
    );

    return Object.fromEntries(
      availableSlots
        .filter((slot) => officialCombination[String(slot.id)])
        .map((slot) => [slot.id, thirdPlaceByGroup[officialCombination[String(slot.id)]] || null])
        .filter(([, team]) => Boolean(team))
    );
  }

  let solution = null;
  const backtrack = (index, allocated, usedTeams) => {
    if (solution) return;
    if (index === availableSlots.length) {
      solution = allocated;
      return;
    }

    const slot = availableSlots[index];
    if (!slot.refThirdGroups) {
      backtrack(index + 1, allocated, usedTeams);
      return;
    }

    for (const currentTeam of ordered) {
      if (usedTeams.has(currentTeam.time)) continue;
      if (!slot.refThirdGroups.includes(currentTeam.grupo)) continue;

      const nextUsed = new Set(usedTeams);
      nextUsed.add(currentTeam.time);
      backtrack(index + 1, { ...allocated, [slot.id]: currentTeam.time }, nextUsed);
    }
  };

  backtrack(0, {}, new Set());
  return solution || {};
};

const isGroupStageComplete = (matches, gamePredictions = {}) => matches.every((match) => {
  if (placarPreenchido(match.placarA, match.placarB)) return true;
  const prediction = gamePredictions?.[match.id];
  return placarPreenchido(prediction?.placarA, prediction?.placarB);
});

const getR32Team = (reference, matches, gamePredictions, conduct) => {
  if (!reference) return 'A definir';
  if (reference.length !== 2) return 'A definir';

  const position = Number.parseInt(reference[0], 10);
  const group = reference[1];
  const groupMatches = matches.filter((match) => match.grupo === group);
  const groupComplete = groupMatches.every((match) => {
    if (placarPreenchido(match.placarA, match.placarB)) return true;
    const prediction = gamePredictions?.[match.id];
    return placarPreenchido(prediction?.placarA, prediction?.placarB);
  });

  if (!groupComplete) return 'A definir';

  const table = calculateGroupTable(group, matches, gamePredictions, conduct, {
    preferPredictions: Boolean(gamePredictions)
  });

  return table[position - 1]?.time || 'A definir';
};

const buildThirdPlaceAllocation = (
  matches,
  gamePredictions,
  conduct,
  groupsComplete = isGroupStageComplete(matches, gamePredictions)
) => {
  if (!groupsComplete) return {};

  const allTables = {};
  Object.keys(GRUPOS_2026).forEach((group) => {
    allTables[group] = calculateGroupTable(group, matches, gamePredictions, conduct, {
      preferPredictions: Boolean(gamePredictions)
    });
  });

  const thirdPlaces = [];
  Object.values(allTables).forEach((table) => {
    if (table[2]) thirdPlaces.push(table[2]);
  });

  thirdPlaces.sort((a, b) => compareBaseCriteria(a, b));
  return resolveThirdPlaceMatchups(
    thirdPlaces.slice(0, 8),
    MATA_MATA_CONFIG.r32.filter((match) => match.refThirdGroups)
  );
};

const getUserPhaseParticipantsFromGroupStage = ({ matches, gamePredictions, conduct }) => {
  const groupsComplete = isGroupStageComplete(matches, gamePredictions);
  const thirdPlaceAllocation = buildThirdPlaceAllocation(matches, gamePredictions, conduct, groupsComplete);

  return MATA_MATA_CONFIG.r32.flatMap((match) => {
    const teamA = getR32Team(match.refA, matches, gamePredictions, conduct);
    const teamB = match.refThirdGroups
      ? (groupsComplete ? (thirdPlaceAllocation[match.id] || 'A definir') : 'A definir')
      : getR32Team(match.refB, matches, gamePredictions, conduct);

    return [
      { key: `${match.id}:A`, matchId: match.id, side: 'A', team: isResolvedTeam(teamA) ? teamA : '' },
      { key: `${match.id}:B`, matchId: match.id, side: 'B', team: isResolvedTeam(teamB) ? teamB : '' }
    ];
  });
};

const PREVIOUS_PHASE_CONFIG = {
  oitavas: { matches: MATA_MATA_CONFIG.r32, sourceField: 'dezeszeseisavos' },
  quartas: { matches: MATA_MATA_CONFIG.r16, sourceField: 'oitavas' },
  semis: { matches: MATA_MATA_CONFIG.qf, sourceField: 'quartas' }
};

export const getKnockoutPhaseParticipantEntries = ({
  phaseKey,
  knockoutBets = {},
  matches = [],
  gamePredictions = {},
  conduct = {}
} = {}) => {
  if (phaseKey === 'dezeszeseisavos') {
    return getUserPhaseParticipantsFromGroupStage({ matches, gamePredictions, conduct });
  }

  const config = PREVIOUS_PHASE_CONFIG[phaseKey];
  if (!config) return [];

  const picks = Array.isArray(knockoutBets?.[config.sourceField]) ? knockoutBets[config.sourceField] : [];
  return config.matches.map((match, index) => ({
    key: String(match.id),
    matchId: match.id,
    team: isResolvedTeam(picks[index]) ? normalizeTeam(picks[index]) : ''
  }));
};

export const getKnockoutPhaseParticipantPicks = (input = {}) => (
  getKnockoutPhaseParticipantEntries(input)
    .map((entry) => entry.team)
    .filter(Boolean)
);

export const getKnockoutPhaseParticipantReviews = ({
  phaseKey,
  points = 0,
  knockoutBets = {},
  matches = [],
  gamePredictions = {},
  conduct = {},
  officialKnockout = {},
  officialBracketSlots = {}
} = {}) => {
  const entries = getKnockoutPhaseParticipantEntries({
    phaseKey,
    knockoutBets,
    matches,
    gamePredictions,
    conduct
  });
  const allPicks = entries.map((entry) => entry.team);

  return entries.map((entry, pickIndex) => ({
    ...entry,
    review: evaluateKnockoutPhasePick({
      phaseKey,
      pick: entry.team,
      pickIndex,
      allPicks,
      points,
      officialKnockout,
      officialBracketSlots,
      successLabel: 'Acertou'
    })
  }));
};

const getEmptyParticipantReview = () => ({
  key: '',
  matchId: null,
  team: '',
  review: {
    state: 'no-pick',
    label: 'Sem palpite',
    detail: 'Nenhuma escolha foi registrada para comparar.',
    tone: 'border-slate-200 bg-slate-50 text-slate-600',
    pointsAwarded: 0
  }
});

export const getKnockoutPhaseMatchReview = ({
  phaseKey,
  match,
  points = 0,
  knockoutBets = {},
  matches = [],
  gamePredictions = {},
  conduct = {},
  officialKnockout = {},
  officialBracketSlots = {}
} = {}) => {
  const reviewedEntries = getKnockoutPhaseParticipantReviews({
    phaseKey,
    points,
    knockoutBets,
    matches,
    gamePredictions,
    conduct,
    officialKnockout,
    officialBracketSlots
  });
  const reviewedMap = new Map(reviewedEntries.map((entry) => [entry.key, entry]));

  const entryA = phaseKey === 'dezeszeseisavos'
    ? (reviewedMap.get(`${match.id}:A`) || getEmptyParticipantReview())
    : (reviewedMap.get(String(match.feedA)) || getEmptyParticipantReview());
  const entryB = phaseKey === 'dezeszeseisavos'
    ? (reviewedMap.get(`${match.id}:B`) || getEmptyParticipantReview())
    : (reviewedMap.get(String(match.feedB)) || getEmptyParticipantReview());

  const sideReviews = [entryA.review, entryB.review];
  const confirmedSides = sideReviews.filter((review) => review.pointsAwarded > 0).length;
  const openSides = sideReviews.filter((review) => review.state === 'partial-pending' || review.state === 'waiting-official').length;
  const wrongSides = sideReviews.filter((review) => review.state === 'error' || review.state === 'duplicate').length;
  const totalPoints = sideReviews.reduce((sum, review) => sum + (review.pointsAwarded || 0), 0);

  let badgeLabel = 'Sem palpite';
  if (confirmedSides === 2) badgeLabel = '2 de 2 pontuaram';
  else if (confirmedSides === 1) badgeLabel = '1 de 2 pontuou';
  else if (openSides > 0) badgeLabel = 'Ainda em aberto';
  else if (wrongSides > 0) badgeLabel = 'Nao pontuou';

  return {
    sideA: entryA.team || 'A definir',
    sideB: entryB.team || 'A definir',
    reviewA: entryA.review,
    reviewB: entryB.review,
    totalPoints,
    confirmedSides,
    openSides,
    wrongSides,
    badgeLabel
  };
};

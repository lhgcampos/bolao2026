import { getConsensusEligibleUsers } from './rankingConsensus.js';
import { calculateKnockoutPhasePoints } from './officialResults/knockoutPhaseScoring.js';

const COLLATOR = new Intl.Collator('pt-BR', { sensitivity: 'base' });

const EMPTY_COMPARATIVE_TEXT = 'Assim que mais gente enviar tudo, o bolão começa a revelar os estilos de palpite.';
const LOCKED_HOME_TEXT = 'Envie seus palpites para liberar o raio-X do bolão.';
const LOCKED_RANKING_TEXT = 'Envie seus palpites para liberar os comentários da mesa.';
const STALE_HOME_CANDIDATE_TYPES = new Set([
  'consensusFollowerIndex',
  'consensusTwin',
  'oneNilIndex'
]);

const isFilled = (value) => value !== '' && value !== null && value !== undefined;
const isFilledScore = (pick) => isFilled(pick?.placarA) && isFilled(pick?.placarB);
const isFinalMatch = (match) => Boolean(match?.isFinal ?? match?.resultadoFinal);

const parseScore = (value) => {
  if (!isFilled(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const compareText = (a = '', b = '') => COLLATOR.compare(a, b);

const formatCount = (count, singular, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;
const formatDecimal = (value, digits = 1) => Number(value || 0).toFixed(digits).replace('.', ',');
const formatMatchName = (match) => `${match?.timeA || 'Time A'} x ${match?.timeB || 'Time B'}`;
const formatScoreLabel = (scoreA, scoreB) => `${scoreA} x ${scoreB}`;

const getOutcome = (scoreA, scoreB) => {
  const normalizedA = parseScore(scoreA);
  const normalizedB = parseScore(scoreB);
  if (normalizedA === null || normalizedB === null) return null;
  if (normalizedA > normalizedB) return 'A';
  if (normalizedB > normalizedA) return 'B';
  return 'draw';
};

const getWinnerTeam = ({ match, scoreA, scoreB }) => {
  const outcome = getOutcome(scoreA, scoreB);
  if (outcome === 'A') return match.timeA;
  if (outcome === 'B') return match.timeB;
  return null;
};

const getLoserTeam = ({ match, scoreA, scoreB }) => {
  const outcome = getOutcome(scoreA, scoreB);
  if (outcome === 'A') return match.timeB;
  if (outcome === 'B') return match.timeA;
  return null;
};

const getRareThreshold = (total) => Math.max(1, Math.min(2, Math.ceil(total * 0.25)));

const sortCountEntries = (entries = []) => (
  [...entries].sort((a, b) => (
    b.count - a.count ||
    b.share - a.share ||
    compareText(a.value, b.value)
  ))
);

const buildCountEntries = (countMap, total) => (
  sortCountEntries(
    Array.from(countMap.entries()).map(([value, count]) => ({
      value,
      count,
      share: total > 0 ? count / total : 0
    }))
  )
);

const normalizeValue = (value, values = []) => {
  if (!values.length) return 0;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return max === 0 ? 0 : 1;
  return (value - min) / (max - min);
};

const sortProfiles = (profiles = [], selector) => (
  [...profiles].sort((a, b) => (
    selector(b) - selector(a) ||
    compareText(a.userName, b.userName)
  ))
);

const sortProfilesAsc = (profiles = [], selector) => (
  [...profiles].sort((a, b) => (
    selector(a) - selector(b) ||
    compareText(a.userName, b.userName)
  ))
);

const incrementObjectCount = (target, key, amount = 1) => {
  if (!key) return;
  target[key] = (target[key] || 0) + amount;
};

const getTopTeamEntry = (counts = {}) => (
  Object.entries(counts)
    .map(([team, value]) => ({ team, value }))
    .sort((a, b) => (
      b.value - a.value ||
      compareText(a.team, b.team)
    ))[0] || null
);

const buildProfileBase = (user) => ({
  userId: user.id,
  userName: user.nome,
  gamesFilled: 0,
  consensusFollowerHits: 0,
  antiConsensusHits: 0,
  contrarianScore: 0,
  contrarianRarePicks: 0,
  totalGoalsPredicted: 0,
  totalGoalDiffPredicted: 0,
  blowoutCount: 0,
  lowScoreCount: 0,
  drawCount: 0,
  oneNilCount: 0,
  goalPartyCount: 0,
  lonelyPickCount: 0,
  upsetCount: 0,
  upsetGapSum: 0,
  upsetHunterIndex: 0,
  favoriteComparableGames: 0,
  favoriteFollowerHits: 0,
  groupWinsByTeam: {},
  groupLossesByTeam: {},
  knockoutSupportByTeam: {},
  biasTeam: null,
  biasScore: 0,
  biasWins: 0,
  biasChampion: false,
  pessimistTeam: null,
  pessimistScore: 0,
  consensusTwinExactHits: 0,
  consensusTwinOutcomeHits: 0,
  consensusTwinPct: 0,
  earlyVisionaryCount: 0,
  earlyVisionaryBest: null,
  nearMissCount: 0,
  championPick: '',
  vicePick: '',
  thirdPick: '',
  fourthPick: '',
  championPopularity: 0,
  vicePopularity: 0,
  thirdPopularity: 0,
  fourthPopularity: 0,
  finalPairPopularity: 0,
  knockoutBoldnessIndex: 0,
  knockoutConsensusIndex: 0,
  confirmedKnockoutPoints: 0,
  confirmedPodiumHits: 0,
  elasticScoreIndex: 0,
  lowScoreIndex: 0,
  chaosWriterIndex: 0,
  avgGoalsPredicted: 0,
  avgGoalDiffPredicted: 0,
  consensusFollowerPct: 0,
  drawPct: 0,
  favoriteFollowerPct: 0
});

const getVisibilityAccess = ({ canRevealComparisons = false, isAdminViewer = false }) => Boolean(isAdminViewer || canRevealComparisons);

const buildLockedState = ({ title, text }) => ({
  title,
  locked: true,
  empty: false,
  text,
  items: []
});

const buildEmptyState = ({ title, text, eligibleCount = 0 }) => ({
  title,
  locked: false,
  empty: true,
  text,
  eligibleCount,
  items: []
});

const compareCandidates = (a, b) => (
  b.strength - a.strength ||
  b.score - a.score ||
  compareText(a.title, b.title) ||
  compareText(a.text, b.text) ||
  compareText(a.id, b.id)
);

const buildCandidate = ({
  id,
  type,
  family,
  title,
  text,
  userId = null,
  userName = null,
  score = 0,
  strength = 0,
  debug = {}
}) => ({
  id,
  type,
  family,
  title,
  text,
  userId,
  userName,
  score,
  strength,
  debug
});

const selectEditorialCandidates = (
  candidates,
  {
    minItems,
    maxItems,
    preferredItems,
    maxPerUser
  }
) => {
  const sorted = [...candidates].sort(compareCandidates);
  const target = Math.max(minItems, Math.min(maxItems, preferredItems, sorted.length));
  const selected = [];
  const selectedIds = new Set();
  const userCounts = new Map();
  const familyCounts = new Map();

  const tryPush = (candidate, { requireNewFamily = false, relaxedUserCap = false } = {}) => {
    if (!candidate || selectedIds.has(candidate.id)) return false;
    if (requireNewFamily && familyCounts.has(candidate.family)) return false;
    if (candidate.userId) {
      const currentCount = userCounts.get(candidate.userId) || 0;
      const effectiveCap = relaxedUserCap ? maxPerUser + 1 : maxPerUser;
      if (currentCount >= effectiveCap) return false;
      userCounts.set(candidate.userId, currentCount + 1);
    }
    familyCounts.set(candidate.family, (familyCounts.get(candidate.family) || 0) + 1);
    selected.push(candidate);
    selectedIds.add(candidate.id);
    return true;
  };

  for (const candidate of sorted) {
    if (selected.length >= target) break;
    tryPush(candidate, { requireNewFamily: true });
  }

  for (const candidate of sorted) {
    if (selected.length >= target) break;
    tryPush(candidate);
  }

  for (const candidate of sorted) {
    if (selected.length >= target || selected.length >= maxItems) break;
    tryPush(candidate, { relaxedUserCap: true });
  }

  return selected.length >= minItems ? selected : selected.slice(0, Math.max(0, selected.length));
};

const createMatchContexts = ({ games = [], eligibleUsers = [], betsGames = {}, teamRankings = {} }) => (
  (games || []).map((match) => {
    const picks = eligibleUsers
      .map((user) => {
        const pick = betsGames?.[user.id]?.[match.id];
        if (!isFilledScore(pick)) return null;
        const scoreA = parseScore(pick.placarA);
        const scoreB = parseScore(pick.placarB);
        if (scoreA === null || scoreB === null) return null;
        return {
          userId: user.id,
          userName: user.nome,
          scoreA,
          scoreB,
          scoreLabel: formatScoreLabel(scoreA, scoreB),
          outcome: getOutcome(scoreA, scoreB)
        };
      })
      .filter(Boolean);

    if (!picks.length) return null;

    const scoreCounts = new Map();
    const outcomeCounts = new Map();

    picks.forEach((pick) => {
      scoreCounts.set(pick.scoreLabel, (scoreCounts.get(pick.scoreLabel) || 0) + 1);
      if (pick.outcome) {
        outcomeCounts.set(pick.outcome, (outcomeCounts.get(pick.outcome) || 0) + 1);
      }
    });

    const scoreEntries = buildCountEntries(scoreCounts, picks.length);
    const outcomeEntries = buildCountEntries(outcomeCounts, picks.length);
    const topScore = scoreEntries[0] || null;
    const topOutcome = outcomeEntries[0] || null;
    const officialScoreA = parseScore(match?.placarA);
    const officialScoreB = parseScore(match?.placarB);
    const officialAvailable = isFinalMatch(match) && officialScoreA !== null && officialScoreB !== null;
    const officialScoreLabel = officialAvailable ? formatScoreLabel(officialScoreA, officialScoreB) : null;
    const officialOutcome = officialAvailable ? getOutcome(officialScoreA, officialScoreB) : null;
    const officialPickCount = officialScoreLabel ? (scoreCounts.get(officialScoreLabel) || 0) : 0;
    const rankA = teamRankings?.[match.timeA]?.officialRank ?? null;
    const rankB = teamRankings?.[match.timeB]?.officialRank ?? null;

    return {
      match,
      picks,
      scoreCounts,
      outcomeCounts,
      scoreEntries,
      outcomeEntries,
      topScore,
      topOutcome,
      officialAvailable,
      officialScoreA,
      officialScoreB,
      officialScoreLabel,
      officialOutcome,
      officialPickCount,
      rankA,
      rankB
    };
  }).filter(Boolean)
);

const buildKnockoutPopularity = ({ eligibleUsers = [], betsKnockout = {} }) => {
  const championCounts = new Map();
  const viceCounts = new Map();
  const thirdCounts = new Map();
  const fourthCounts = new Map();
  const finalistCounts = new Map();
  const semifinalistCounts = new Map();
  const finalPairCounts = new Map();

  eligibleUsers.forEach((user) => {
    const bracket = betsKnockout?.[user.id] || {};
    const champion = bracket.campeao || '';
    const vice = bracket.vice || '';
    const third = bracket.terceiro || '';
    const fourth = bracket.quarto || '';
    if (champion) championCounts.set(champion, (championCounts.get(champion) || 0) + 1);
    if (vice) viceCounts.set(vice, (viceCounts.get(vice) || 0) + 1);
    if (third) thirdCounts.set(third, (thirdCounts.get(third) || 0) + 1);
    if (fourth) fourthCounts.set(fourth, (fourthCounts.get(fourth) || 0) + 1);

    (bracket.semis || [])
      .filter(Boolean)
      .filter((team, index, list) => list.indexOf(team) === index)
      .forEach((team) => {
        semifinalistCounts.set(team, (semifinalistCounts.get(team) || 0) + 1);
      });

    [champion, vice]
      .filter(Boolean)
      .filter((team, index, list) => list.indexOf(team) === index)
      .forEach((team) => {
        finalistCounts.set(team, (finalistCounts.get(team) || 0) + 1);
      });

    if (champion && vice) {
      const finalPairKey = `${champion}|||${vice}`;
      finalPairCounts.set(finalPairKey, (finalPairCounts.get(finalPairKey) || 0) + 1);
    }
  });

  return {
    championCounts,
    viceCounts,
    thirdCounts,
    fourthCounts,
    finalistCounts,
    semifinalistCounts,
    finalPairCounts
  };
};

export function getEligiblePredictionUsers(input = {}) {
  return getConsensusEligibleUsers({
    users: input.users,
    submissions: input.submissions,
    betsGames: input.betsGames,
    betsKnockout: input.betsKnockout,
    games: input.games,
    submissionFields: input.submissionFields,
    isAdminUser: input.isAdminUser,
    usuarioPreencheuTodosOsJogos: input.usuarioPreencheuTodosOsJogos,
    usuarioPreencheuMataCompleta: input.usuarioPreencheuMataCompleta
  });
}

export function calculateUserStyleProfiles(input = {}) {
  const eligibleUsers = input.eligibleUsers || getEligiblePredictionUsers(input);
  const profileByUserId = Object.fromEntries(
    eligibleUsers.map((user) => [user.id, buildProfileBase(user)])
  );

  const matchContexts = createMatchContexts({
    games: input.games,
    eligibleUsers,
    betsGames: input.betsGames,
    teamRankings: input.teamRankings
  });

  matchContexts.forEach((context) => {
    const lowPickThreshold = getRareThreshold(context.picks.length);

    context.picks.forEach((pick) => {
      const profile = profileByUserId[pick.userId];
      if (!profile) return;

      profile.gamesFilled += 1;
      profile.totalGoalsPredicted += pick.scoreA + pick.scoreB;
      profile.totalGoalDiffPredicted += Math.abs(pick.scoreA - pick.scoreB);
      if (Math.abs(pick.scoreA - pick.scoreB) >= 3) profile.blowoutCount += 1;
      if ((pick.scoreA + pick.scoreB) <= 2) profile.lowScoreCount += 1;
      if (pick.scoreA === pick.scoreB) profile.drawCount += 1;
      if ((pick.scoreA === 1 && pick.scoreB === 0) || (pick.scoreA === 0 && pick.scoreB === 1)) profile.oneNilCount += 1;
      if ((pick.scoreA + pick.scoreB) >= 4) profile.goalPartyCount += 1;

      const scoreCount = context.scoreCounts.get(pick.scoreLabel) || 0;
      const outcomeCount = pick.outcome ? (context.outcomeCounts.get(pick.outcome) || 0) : 0;
      const totalPicks = context.picks.length;

      if (context.topScore && pick.scoreLabel === context.topScore.value) {
        profile.consensusFollowerHits += 1;
        profile.consensusTwinExactHits += 1;
      } else {
        profile.antiConsensusHits += 1;
        if (context.topOutcome && pick.outcome && pick.outcome === context.topOutcome.value) {
          profile.consensusTwinOutcomeHits += 1;
        }
      }

      profile.contrarianScore += (1 - (scoreCount / totalPicks)) * 2;
      if (pick.outcome) {
        profile.contrarianScore += (1 - (outcomeCount / totalPicks));
        if (context.topOutcome && pick.outcome !== context.topOutcome.value) {
          profile.contrarianScore += 0.6;
        }
      }
      if (scoreCount <= lowPickThreshold) profile.contrarianRarePicks += 1;
      if (scoreCount === 1) profile.lonelyPickCount += 1;

      const predictedWinner = getWinnerTeam({
        match: context.match,
        scoreA: pick.scoreA,
        scoreB: pick.scoreB
      });
      const predictedLoser = getLoserTeam({
        match: context.match,
        scoreA: pick.scoreA,
        scoreB: pick.scoreB
      });

      if (predictedWinner) incrementObjectCount(profile.groupWinsByTeam, predictedWinner, 1);
      if (predictedLoser) incrementObjectCount(profile.groupLossesByTeam, predictedLoser, 1);

      if (context.rankA && context.rankB && context.rankA !== context.rankB && pick.outcome && pick.outcome !== 'draw') {
        const favoriteSide = context.rankA < context.rankB ? 'A' : 'B';
        const favoriteTeam = favoriteSide === 'A' ? context.match.timeA : context.match.timeB;
        const underdogTeam = favoriteSide === 'A' ? context.match.timeB : context.match.timeA;
        const rankGap = Math.abs(context.rankA - context.rankB);

        profile.favoriteComparableGames += 1;
        if ((favoriteSide === 'A' && pick.outcome === 'A') || (favoriteSide === 'B' && pick.outcome === 'B')) {
          profile.favoriteFollowerHits += 1;
        } else {
          profile.upsetCount += 1;
          profile.upsetGapSum += rankGap;
          profile.upsetHunterIndex += rankGap + 2;
          incrementObjectCount(profile.groupWinsByTeam, underdogTeam, 0.5);
          incrementObjectCount(profile.groupLossesByTeam, favoriteTeam, 0.5);
        }
      }

      if (context.officialAvailable) {
        const exactHit = pick.scoreLabel === context.officialScoreLabel;
        const sameOutcome = pick.outcome && pick.outcome === context.officialOutcome;
        const rareOfficialHit = exactHit && context.officialPickCount > 0 && context.officialPickCount <= lowPickThreshold;

        if (rareOfficialHit) {
          profile.earlyVisionaryCount += 1;
          const visionaryCandidate = {
            matchId: context.match.id,
            matchName: formatMatchName(context.match),
            officialScoreLabel: context.officialScoreLabel,
            pickCount: context.officialPickCount
          };
          if (
            !profile.earlyVisionaryBest ||
            visionaryCandidate.pickCount < profile.earlyVisionaryBest.pickCount ||
            (
              visionaryCandidate.pickCount === profile.earlyVisionaryBest.pickCount &&
              visionaryCandidate.matchId > profile.earlyVisionaryBest.matchId
            )
          ) {
            profile.earlyVisionaryBest = visionaryCandidate;
          }
        }

        if (sameOutcome && !exactHit) {
          const manhattanDistance = Math.abs(pick.scoreA - context.officialScoreA) + Math.abs(pick.scoreB - context.officialScoreB);
          if (manhattanDistance === 1) {
            profile.nearMissCount += 1;
          }
        }
      }
    });
  });

  const knockoutPopularity = buildKnockoutPopularity({
    eligibleUsers,
    betsKnockout: input.betsKnockout
  });

  const knockoutWeights = {
    dezeszeseisavos: 0.4,
    oitavas: 0.6,
    quartas: 0.9,
    semis: 1.2,
    vice: 2,
    terceiro: 1.5,
    quarto: 1.25,
    campeao: 3
  };

  eligibleUsers.forEach((user) => {
    const profile = profileByUserId[user.id];
    const bracket = input.betsKnockout?.[user.id] || {};
    const scoringRules = input.scoringRules || {};

    profile.championPick = bracket.campeao || '';
    profile.vicePick = bracket.vice || '';
    profile.thirdPick = bracket.terceiro || '';
    profile.fourthPick = bracket.quarto || '';
    profile.championPopularity = profile.championPick ? (knockoutPopularity.championCounts.get(profile.championPick) || 0) : 0;
    profile.vicePopularity = profile.vicePick ? (knockoutPopularity.viceCounts.get(profile.vicePick) || 0) : 0;
    profile.thirdPopularity = profile.thirdPick ? (knockoutPopularity.thirdCounts.get(profile.thirdPick) || 0) : 0;
    profile.fourthPopularity = profile.fourthPick ? (knockoutPopularity.fourthCounts.get(profile.fourthPick) || 0) : 0;
    profile.finalPairPopularity = profile.championPick && profile.vicePick
      ? (knockoutPopularity.finalPairCounts.get(`${profile.championPick}|||${profile.vicePick}`) || 0)
      : 0;

    [
      ['dezeszeseisavos', bracket.dezeszeseisavos || []],
      ['oitavas', bracket.oitavas || []],
      ['quartas', bracket.quartas || []],
      ['semis', bracket.semis || []]
    ].forEach(([phase, teams]) => {
      teams
        .filter(Boolean)
        .filter((team, index, list) => list.indexOf(team) === index)
        .forEach((team) => incrementObjectCount(profile.knockoutSupportByTeam, team, knockoutWeights[phase]));
    });

    [
      ['vice', bracket.vice],
      ['terceiro', bracket.terceiro],
      ['quarto', bracket.quarto],
      ['campeao', bracket.campeao]
    ].forEach(([phase, team]) => incrementObjectCount(profile.knockoutSupportByTeam, team, knockoutWeights[phase]));

    const finalistShare = [profile.championPick, profile.vicePick]
      .filter(Boolean)
      .filter((team, index, list) => list.indexOf(team) === index)
      .reduce((total, team) => total + ((knockoutPopularity.finalistCounts.get(team) || 0) / Math.max(eligibleUsers.length, 1)), 0);

    const championShare = profile.championPopularity / Math.max(eligibleUsers.length, 1);
    const viceShare = profile.vicePopularity / Math.max(eligibleUsers.length, 1);

    profile.knockoutBoldnessIndex = ((1 - championShare) * 4) + ((1 - viceShare) * 2) + ((2 - finalistShare) * 0.8);
    profile.knockoutConsensusIndex = (championShare * 4) + (viceShare * 2) + (finalistShare * 0.8);
    profile.confirmedKnockoutPoints = (
      calculateKnockoutPhasePoints({
        phaseKey: 'dezeszeseisavos',
        picks: bracket.dezeszeseisavos || [],
        points: scoringRules?.MATA?.R32 ?? 0,
        officialKnockout: input.officialKnockout,
        officialBracketSlots: input.officialBracketSlots
      }) +
      calculateKnockoutPhasePoints({
        phaseKey: 'oitavas',
        picks: bracket.oitavas || [],
        points: scoringRules?.MATA?.R16 ?? 0,
        officialKnockout: input.officialKnockout,
        officialBracketSlots: input.officialBracketSlots
      }) +
      calculateKnockoutPhasePoints({
        phaseKey: 'quartas',
        picks: bracket.quartas || [],
        points: scoringRules?.MATA?.QF ?? 0,
        officialKnockout: input.officialKnockout,
        officialBracketSlots: input.officialBracketSlots
      }) +
      calculateKnockoutPhasePoints({
        phaseKey: 'semis',
        picks: bracket.semis || [],
        points: scoringRules?.MATA?.SF ?? 0,
        officialKnockout: input.officialKnockout,
        officialBracketSlots: input.officialBracketSlots
      })
    );
    profile.confirmedPodiumHits = 0;
    if (input.officialKnockout?.campeao && profile.championPick === input.officialKnockout.campeao) profile.confirmedPodiumHits += 1;
    if (input.officialKnockout?.vice && profile.vicePick === input.officialKnockout.vice) profile.confirmedPodiumHits += 1;
    if (input.officialKnockout?.terceiro && profile.thirdPick === input.officialKnockout.terceiro) profile.confirmedPodiumHits += 1;
    if (input.officialKnockout?.quarto && profile.fourthPick === input.officialKnockout.quarto) profile.confirmedPodiumHits += 1;

    const biasEntries = Object.keys({
      ...profile.groupWinsByTeam,
      ...profile.knockoutSupportByTeam
    }).map((team) => ({
      team,
      score: (profile.groupWinsByTeam[team] || 0) + (profile.knockoutSupportByTeam[team] || 0),
      wins: profile.groupWinsByTeam[team] || 0,
      champion: profile.championPick === team
    }));

    const topBias = [...biasEntries].sort((a, b) => (
      b.score - a.score ||
      b.wins - a.wins ||
      Number(b.champion) - Number(a.champion) ||
      compareText(a.team, b.team)
    ))[0] || null;

    profile.biasTeam = topBias?.team || null;
    profile.biasScore = topBias?.score || 0;
    profile.biasWins = topBias?.wins || 0;
    profile.biasChampion = Boolean(topBias?.champion);

    const topPessimist = getTopTeamEntry(profile.groupLossesByTeam);
    profile.pessimistTeam = topPessimist?.team || null;
    profile.pessimistScore = topPessimist?.value || 0;

    if (profile.gamesFilled > 0) {
      profile.avgGoalsPredicted = profile.totalGoalsPredicted / profile.gamesFilled;
      profile.avgGoalDiffPredicted = profile.totalGoalDiffPredicted / profile.gamesFilled;
      profile.consensusFollowerPct = profile.consensusFollowerHits / profile.gamesFilled;
      profile.drawPct = profile.drawCount / profile.gamesFilled;
      profile.favoriteFollowerPct = profile.favoriteComparableGames > 0
        ? profile.favoriteFollowerHits / profile.favoriteComparableGames
        : 0;
      profile.consensusTwinPct = (
        profile.consensusTwinExactHits +
        (profile.consensusTwinOutcomeHits * 0.35)
      ) / profile.gamesFilled;
      profile.elasticScoreIndex = (
        profile.avgGoalsPredicted * 1.5 +
        profile.avgGoalDiffPredicted +
        ((profile.goalPartyCount / profile.gamesFilled) * 4) +
        ((profile.blowoutCount / profile.gamesFilled) * 3)
      );
      profile.lowScoreIndex = (
        Math.max(0, 4 - profile.avgGoalsPredicted) * 1.4 +
        ((profile.lowScoreCount / profile.gamesFilled) * 4) +
        ((profile.drawCount / profile.gamesFilled) * 1.2) -
        ((profile.goalPartyCount / profile.gamesFilled) * 1.4)
      );
    }
  });

  const profiles = Object.values(profileByUserId);
  const contrarianValues = profiles.map((profile) => profile.contrarianScore);
  const elasticValues = profiles.map((profile) => profile.elasticScoreIndex);
  const upsetValues = profiles.map((profile) => profile.upsetHunterIndex);

  profiles.forEach((profile) => {
    profile.chaosWriterIndex = (
      normalizeValue(profile.contrarianScore, contrarianValues) +
      normalizeValue(profile.elasticScoreIndex, elasticValues) +
      normalizeValue(profile.upsetHunterIndex, upsetValues)
    );
  });

  const pairings = [];
  for (let index = 0; index < profiles.length; index += 1) {
    for (let innerIndex = index + 1; innerIndex < profiles.length; innerIndex += 1) {
      const left = profiles[index];
      const right = profiles[innerIndex];
      let sharedGames = 0;
      let exactMatches = 0;
      let sameOutcome = 0;

      matchContexts.forEach((context) => {
        const leftPick = context.picks.find((pick) => pick.userId === left.userId);
        const rightPick = context.picks.find((pick) => pick.userId === right.userId);
        if (!leftPick || !rightPick) return;
        sharedGames += 1;
        if (leftPick.scoreLabel === rightPick.scoreLabel) {
          exactMatches += 1;
          sameOutcome += 1;
          return;
        }
        if (leftPick.outcome && leftPick.outcome === rightPick.outcome) {
          sameOutcome += 1;
        }
      });

      if (!sharedGames) continue;

      const sameChampion = left.championPick && left.championPick === right.championPick ? left.championPick : '';
      const rareChampionCount = sameChampion ? (knockoutPopularity.championCounts.get(sameChampion) || 0) : 0;

      pairings.push({
        leftUserId: left.userId,
        leftUserName: left.userName,
        rightUserId: right.userId,
        rightUserName: right.userName,
        sharedGames,
        exactMatches,
        sameOutcome,
        oppositeOutcomes: sharedGames - sameOutcome,
        exactPct: exactMatches / sharedGames,
        sameOutcomePct: sameOutcome / sharedGames,
        sameChampion,
        rareChampionCount
      });
    }
  }

  return {
    eligibleUsers,
    profiles,
    profileByUserId,
    matchContexts,
    pairings,
    knockoutPopularity
  };
}

const buildStatCandidates = ({ profiles = [], pairings = [] }) => {
  const candidates = [];
  const stats = {};

  const register = (key, candidate) => {
    if (!candidate) return;
    stats[key] = candidate;
    candidates.push(candidate);
  };

  const consensusFollower = sortProfiles(profiles, (profile) => (
    profile.consensusFollowerHits + profile.consensusFollowerPct
  ))[0];
  if (consensusFollower && consensusFollower.consensusFollowerHits >= 2) {
    register('consensusFollowerIndex', buildCandidate({
      id: `consensus-follower-${consensusFollower.userId}`,
      type: 'consensusFollowerIndex',
      family: 'consensus',
      title: 'Modo seguranca',
      text: `${consensusFollower.userName} esta no modo seguranca: foi no placar mais popular em ${consensusFollower.consensusFollowerHits} jogos.`,
      userId: consensusFollower.userId,
      userName: consensusFollower.userName,
      score: consensusFollower.consensusFollowerHits,
      strength: consensusFollower.consensusFollowerHits + (consensusFollower.consensusFollowerPct * 4),
      debug: {
        hits: consensusFollower.consensusFollowerHits,
        pct: consensusFollower.consensusFollowerPct
      }
    }));
  }

  const contrarian = sortProfiles(profiles, (profile) => profile.contrarianScore)[0];
  if (contrarian && contrarian.antiConsensusHits >= 2) {
    register('contrarianIndex', buildCandidate({
      id: `contrarian-${contrarian.userId}`,
      type: 'contrarianIndex',
      family: 'chaos',
      title: 'Do contra',
      text: `${contrarian.userName} jogou contra a mesa: ${contrarian.antiConsensusHits} palpites dele fogem do placar mais comum.`,
      userId: contrarian.userId,
      userName: contrarian.userName,
      score: contrarian.contrarianScore,
      strength: contrarian.contrarianScore + contrarian.contrarianRarePicks,
      debug: {
        contrarianScore: contrarian.contrarianScore,
        antiConsensusHits: contrarian.antiConsensusHits,
        rarePicks: contrarian.contrarianRarePicks
      }
    }));
  }

  const elastic = sortProfiles(profiles, (profile) => profile.elasticScoreIndex)[0];
  if (elastic && elastic.avgGoalsPredicted >= 2.4) {
    register('elasticScoreIndex', buildCandidate({
      id: `elastic-${elastic.userId}`,
      type: 'elasticScoreIndex',
      family: 'goals',
      title: 'Jogo aberto',
      text: `${elastic.userName} não veio para 1 x 0: média de ${formatDecimal(elastic.avgGoalsPredicted)} gols por jogo.`,
      userId: elastic.userId,
      userName: elastic.userName,
      score: elastic.elasticScoreIndex,
      strength: elastic.elasticScoreIndex + elastic.goalPartyCount,
      debug: {
        avgGoals: elastic.avgGoalsPredicted,
        avgGoalDiff: elastic.avgGoalDiffPredicted,
        goalPartyCount: elastic.goalPartyCount
      }
    }));
  }

  const lowScore = sortProfiles(profiles, (profile) => profile.lowScoreIndex)[0];
  if (lowScore && lowScore.lowScoreCount >= 2) {
    register('lowScoreIndex', buildCandidate({
      id: `low-score-${lowScore.userId}`,
      type: 'lowScoreIndex',
      family: 'goals',
      title: 'Retranca declarada',
      text: `${lowScore.userName} está dirigindo um ônibus: média de ${formatDecimal(lowScore.avgGoalsPredicted)} gols por jogo.`,
      userId: lowScore.userId,
      userName: lowScore.userName,
      score: lowScore.lowScoreIndex,
      strength: lowScore.lowScoreIndex + lowScore.lowScoreCount,
      debug: {
        avgGoals: lowScore.avgGoalsPredicted,
        lowScoreCount: lowScore.lowScoreCount,
        drawCount: lowScore.drawCount
      }
    }));
  }

  const upsetHunter = sortProfiles(profiles, (profile) => profile.upsetHunterIndex)[0];
  if (upsetHunter && upsetHunter.upsetCount >= 1) {
    register('upsetHunterIndex', buildCandidate({
      id: `upset-hunter-${upsetHunter.userId}`,
      type: 'upsetHunterIndex',
      family: 'zebra',
      title: 'Caçador de zebra',
      text: `${upsetHunter.userName} está caçando zebra: bancou ${upsetHunter.upsetCount} vitória${upsetHunter.upsetCount === 1 ? '' : 's'} contra o ranking FIFA.`,
      userId: upsetHunter.userId,
      userName: upsetHunter.userName,
      score: upsetHunter.upsetHunterIndex,
      strength: upsetHunter.upsetHunterIndex + upsetHunter.upsetCount,
      debug: {
        upsetCount: upsetHunter.upsetCount,
        upsetGapSum: upsetHunter.upsetGapSum
      }
    }));
  }

  const favoriteFollower = sortProfiles(profiles, (profile) => profile.favoriteFollowerPct)[0];
  if (favoriteFollower && favoriteFollower.favoriteComparableGames >= 2 && favoriteFollower.favoriteFollowerHits >= 2) {
    register('favoriteFollowerIndex', buildCandidate({
      id: `favorite-follower-${favoriteFollower.userId}`,
      type: 'favoriteFollowerIndex',
      family: 'zebra',
      title: 'Time das favoritas',
      text: `${favoriteFollower.userName} confia no ranking FIFA: foi de favorita em ${formatPercent(favoriteFollower.favoriteFollowerPct)} dos jogos.`,
      userId: favoriteFollower.userId,
      userName: favoriteFollower.userName,
      score: favoriteFollower.favoriteFollowerPct,
      strength: (favoriteFollower.favoriteFollowerPct * 10) + favoriteFollower.favoriteFollowerHits,
      debug: {
        favoriteFollowerHits: favoriteFollower.favoriteFollowerHits,
        favoriteComparableGames: favoriteFollower.favoriteComparableGames
      }
    }));
  }

  const drawLover = sortProfiles(profiles, (profile) => profile.drawCount + profile.drawPct)[0];
  if (drawLover && drawLover.drawCount >= 2) {
    register('drawLoverIndex', buildCandidate({
      id: `draw-lover-${drawLover.userId}`,
      type: 'drawLoverIndex',
      family: 'draws',
      title: 'Empatador oficial',
      text: `${drawLover.userName} ama um ponto para cada lado: apostou em ${drawLover.drawCount} empate${drawLover.drawCount === 1 ? '' : 's'}.`,
      userId: drawLover.userId,
      userName: drawLover.userName,
      score: drawLover.drawCount,
      strength: drawLover.drawCount + (drawLover.drawPct * 4),
      debug: {
        drawCount: drawLover.drawCount,
        drawPct: drawLover.drawPct
      }
    }));
  }

  const drawHater = sortProfilesAsc(profiles, (profile) => profile.drawPct)[0];
  if (drawHater && drawHater.gamesFilled >= 3) {
    register('drawHaterIndex', buildCandidate({
      id: `draw-hater-${drawHater.userId}`,
      type: 'drawHaterIndex',
      family: 'draws',
      title: 'Inimigo do empate',
      text: `${drawHater.userName} não acredita em paz: só foi de empate em ${drawHater.drawCount} de ${drawHater.gamesFilled} jogos.`,
      userId: drawHater.userId,
      userName: drawHater.userName,
      score: 1 - drawHater.drawPct,
      strength: ((1 - drawHater.drawPct) * 6) + drawHater.gamesFilled,
      debug: {
        drawCount: drawHater.drawCount,
        gamesFilled: drawHater.gamesFilled
      }
    }));
  }

  const biasedUser = sortProfiles(profiles, (profile) => profile.biasScore)[0];
  if (biasedUser && biasedUser.biasTeam && biasedUser.biasScore >= 2.5) {
    const biasTail = biasedUser.biasChampion ? ` e ainda botou ${biasedUser.biasTeam} campea.` : '.';
    register('teamBiasIndex', buildCandidate({
      id: `team-bias-${biasedUser.userId}-${biasedUser.biasTeam}`,
      type: 'teamBiasIndex',
      family: 'bias',
      title: 'Fechado com uma selecao',
      text: `${biasedUser.userName} está fechado com ${biasedUser.biasTeam}: colocou a seleção vencendo ${biasedUser.biasWins} vez${biasedUser.biasWins === 1 ? '' : 'es'}${biasTail}`,
      userId: biasedUser.userId,
      userName: biasedUser.userName,
      score: biasedUser.biasScore,
      strength: biasedUser.biasScore + biasedUser.biasWins,
      debug: {
        biasTeam: biasedUser.biasTeam,
        biasWins: biasedUser.biasWins,
        biasChampion: biasedUser.biasChampion
      }
    }));
  }

  const pessimistUser = sortProfiles(profiles, (profile) => profile.pessimistScore)[0];
  if (pessimistUser && pessimistUser.pessimistTeam && pessimistUser.pessimistScore >= 2) {
    register('teamPessimistIndex', buildCandidate({
      id: `team-pessimist-${pessimistUser.userId}-${pessimistUser.pessimistTeam}`,
      type: 'teamPessimistIndex',
      family: 'bias',
      title: 'Não comprou o hype',
      text: `${pessimistUser.userName} não comprou o hype da ${pessimistUser.pessimistTeam}: apostou ${pessimistUser.pessimistScore} vez${pessimistUser.pessimistScore === 1 ? '' : 'es'} contra ela.`,
      userId: pessimistUser.userId,
      userName: pessimistUser.userName,
      score: pessimistUser.pessimistScore,
      strength: pessimistUser.pessimistScore * 2,
      debug: {
        pessimistTeam: pessimistUser.pessimistTeam,
        pessimistScore: pessimistUser.pessimistScore
      }
    }));
  }

  const consensusTwin = sortProfiles(profiles, (profile) => profile.consensusTwinPct)[0];
  if (consensusTwin && consensusTwin.consensusTwinExactHits >= 2) {
    register('consensusTwin', buildCandidate({
      id: `consensus-twin-${consensusTwin.userId}`,
      type: 'consensusTwin',
      family: 'consensus',
      title: 'Clone do consenso',
      text: `${consensusTwin.userName} é o clone do bolão: o cartão bateu com o consenso em ${consensusTwin.consensusTwinExactHits} jogos.`,
      userId: consensusTwin.userId,
      userName: consensusTwin.userName,
      score: consensusTwin.consensusTwinPct,
      strength: (consensusTwin.consensusTwinPct * 10) + consensusTwin.consensusTwinExactHits,
      debug: {
        exactHits: consensusTwin.consensusTwinExactHits,
        outcomeHits: consensusTwin.consensusTwinOutcomeHits,
        pct: consensusTwin.consensusTwinPct
      }
    }));
  }

  const lonelyPick = sortProfiles(profiles, (profile) => profile.lonelyPickCount)[0];
  if (lonelyPick && lonelyPick.lonelyPickCount >= 2) {
    register('lonelyPickIndex', buildCandidate({
      id: `lonely-picks-${lonelyPick.userId}`,
      type: 'lonelyPickIndex',
      family: 'chaos',
      title: 'Ilha deserta',
      text: `${lonelyPick.userName} ficou sozinho em ${lonelyPick.lonelyPickCount} placares. Ilha deserta total.`,
      userId: lonelyPick.userId,
      userName: lonelyPick.userName,
      score: lonelyPick.lonelyPickCount,
      strength: lonelyPick.lonelyPickCount * 2,
      debug: {
        lonelyPickCount: lonelyPick.lonelyPickCount
      }
    }));
  }

  const chaosWriter = sortProfiles(profiles, (profile) => profile.chaosWriterIndex)[0];
  if (chaosWriter && chaosWriter.chaosWriterIndex > 0.5) {
    register('chaosWriterIndex', buildCandidate({
      id: `chaos-writer-${chaosWriter.userId}`,
      type: 'chaosWriterIndex',
      family: 'chaos',
      title: 'Roteirista do caos',
      text: `${chaosWriter.userName} comprou o caos: zebra, goleada e placar raro no mesmo pacote.`,
      userId: chaosWriter.userId,
      userName: chaosWriter.userName,
      score: chaosWriter.chaosWriterIndex,
      strength: chaosWriter.chaosWriterIndex * 10,
      debug: {
        chaosWriterIndex: chaosWriter.chaosWriterIndex,
        contrarianScore: chaosWriter.contrarianScore,
        elasticScoreIndex: chaosWriter.elasticScoreIndex,
        upsetHunterIndex: chaosWriter.upsetHunterIndex
      }
    }));
  }

  const oneNil = sortProfiles(profiles, (profile) => profile.oneNilCount)[0];
  if (oneNil && oneNil.oneNilCount >= 2) {
    register('oneNilIndex', buildCandidate({
      id: `one-nil-${oneNil.userId}`,
      type: 'oneNilIndex',
      family: 'goals',
      title: 'Cirurgiao do 1 x 0',
      text: `${oneNil.userName} acredita no detalhe: apostou ${oneNil.oneNilCount} vez${oneNil.oneNilCount === 1 ? '' : 'es'} em 1 x 0 ou 0 x 1.`,
      userId: oneNil.userId,
      userName: oneNil.userName,
      score: oneNil.oneNilCount,
      strength: oneNil.oneNilCount * 2,
      debug: {
        oneNilCount: oneNil.oneNilCount
      }
    }));
  }

  const goalParty = sortProfiles(profiles, (profile) => profile.goalPartyCount)[0];
  if (goalParty && goalParty.goalPartyCount >= 2) {
    register('goalPartyIndex', buildCandidate({
      id: `goal-party-${goalParty.userId}`,
      type: 'goalPartyIndex',
      family: 'goals',
      title: 'Festival de gols',
      text: `${goalParty.userName} comprou ingresso para espetáculo: lidera com ${goalParty.goalPartyCount} placares de 4+ gols.`,
      userId: goalParty.userId,
      userName: goalParty.userName,
      score: goalParty.goalPartyCount,
      strength: goalParty.goalPartyCount * 2,
      debug: {
        goalPartyCount: goalParty.goalPartyCount
      }
    }));
  }

  const knockoutBold = sortProfiles(profiles, (profile) => profile.knockoutBoldnessIndex)[0];
  if (knockoutBold && knockoutBold.championPick) {
    register('knockoutBoldnessIndex', buildCandidate({
      id: `knockout-bold-${knockoutBold.userId}`,
      type: 'knockoutBoldnessIndex',
      family: 'knockout',
      title: 'Ousadia no mata-mata',
      text: `${knockoutBold.userName} apostou num campeão pouco popular: ${knockoutBold.championPick} recebeu ${formatCount(knockoutBold.championPopularity, 'voto')}.`,
      userId: knockoutBold.userId,
      userName: knockoutBold.userName,
      score: knockoutBold.knockoutBoldnessIndex,
      strength: knockoutBold.knockoutBoldnessIndex * 4,
      debug: {
        championPick: knockoutBold.championPick,
        championPopularity: knockoutBold.championPopularity,
        vicePopularity: knockoutBold.vicePopularity
      }
    }));
  }

  const knockoutConfirmed = sortProfiles(profiles, (profile) => profile.confirmedKnockoutPoints)[0];
  if (knockoutConfirmed && knockoutConfirmed.confirmedKnockoutPoints > 0) {
    register('knockoutConfirmedPoints', buildCandidate({
      id: `knockout-confirmed-${knockoutConfirmed.userId}`,
      type: 'knockoutConfirmedPoints',
      family: 'official-knockout',
      title: 'Mata-mata no caixa',
      text: `${knockoutConfirmed.userName} já tem ${knockoutConfirmed.confirmedKnockoutPoints} pts confirmados com o mata-mata oficial.`,
      userId: knockoutConfirmed.userId,
      userName: knockoutConfirmed.userName,
      score: knockoutConfirmed.confirmedKnockoutPoints,
      strength: knockoutConfirmed.confirmedKnockoutPoints + 20,
      debug: {
        confirmedKnockoutPoints: knockoutConfirmed.confirmedKnockoutPoints
      }
    }));
  }

  const knockoutConsensus = sortProfiles(profiles, (profile) => profile.knockoutConsensusIndex)[0];
  if (knockoutConsensus && knockoutConsensus.championPick) {
    register('knockoutConsensusIndex', buildCandidate({
      id: `knockout-consensus-${knockoutConsensus.userId}`,
      type: 'knockoutConsensusIndex',
      family: 'knockout',
      title: 'Mata-mata mainstream',
      text: `${knockoutConsensus.userName} montou o mata-mata mais popular do bolão.`,
      userId: knockoutConsensus.userId,
      userName: knockoutConsensus.userName,
      score: knockoutConsensus.knockoutConsensusIndex,
      strength: knockoutConsensus.knockoutConsensusIndex * 4,
      debug: {
        championPick: knockoutConsensus.championPick,
        championPopularity: knockoutConsensus.championPopularity,
        vicePick: knockoutConsensus.vicePick,
        vicePopularity: knockoutConsensus.vicePopularity
      }
    }));
  }

  const soloChampion = sortProfilesAsc(
    profiles.filter((profile) => profile.championPick && profile.championPopularity > 0),
    (profile) => profile.championPopularity
  )[0];
  if (soloChampion && soloChampion.championPopularity === 1) {
    register('soloChampion', buildCandidate({
      id: `solo-champion-${soloChampion.userId}`,
      type: 'soloChampion',
      family: 'podium',
      title: 'Campeão solo',
      text: `${soloChampion.userName} está sozinho com ${soloChampion.championPick} campeão.`,
      userId: soloChampion.userId,
      userName: soloChampion.userName,
      score: 1,
      strength: 24,
      debug: {
        championPick: soloChampion.championPick
      }
    }));
  }

  const rareFinalPair = sortProfilesAsc(
    profiles.filter((profile) => profile.championPick && profile.vicePick && profile.finalPairPopularity > 0),
    (profile) => profile.finalPairPopularity
  )[0];
  if (rareFinalPair && rareFinalPair.finalPairPopularity <= 2) {
    register('rareFinalPair', buildCandidate({
      id: `rare-final-pair-${rareFinalPair.userId}`,
      type: 'rareFinalPair',
      family: 'final',
      title: 'Final alternativa',
      text: `${rareFinalPair.userName} desenhou uma final pouco repetida: ${rareFinalPair.championPick} campeão sobre ${rareFinalPair.vicePick}.`,
      userId: rareFinalPair.userId,
      userName: rareFinalPair.userName,
      score: 3 - rareFinalPair.finalPairPopularity,
      strength: 22 + (3 - rareFinalPair.finalPairPopularity),
      debug: {
        championPick: rareFinalPair.championPick,
        vicePick: rareFinalPair.vicePick,
        finalPairPopularity: rareFinalPair.finalPairPopularity
      }
    }));
  }

  const bronzeSolo = sortProfilesAsc(
    profiles.filter((profile) => profile.thirdPick && profile.thirdPopularity > 0),
    (profile) => profile.thirdPopularity
  )[0];
  if (bronzeSolo && bronzeSolo.thirdPopularity === 1) {
    register('bronzeSolo', buildCandidate({
      id: `bronze-solo-${bronzeSolo.userId}`,
      type: 'bronzeSolo',
      family: 'podium',
      title: 'Bronze isolado',
      text: `${bronzeSolo.userName} foi sozinho com ${bronzeSolo.thirdPick} em 3º lugar.`,
      userId: bronzeSolo.userId,
      userName: bronzeSolo.userName,
      score: 1,
      strength: 18,
      debug: {
        thirdPick: bronzeSolo.thirdPick
      }
    }));
  }

  const podiumConfirmed = sortProfiles(profiles, (profile) => profile.confirmedPodiumHits)[0];
  if (podiumConfirmed && podiumConfirmed.confirmedPodiumHits > 0) {
    register('podiumConfirmed', buildCandidate({
      id: `podium-confirmed-${podiumConfirmed.userId}`,
      type: 'podiumConfirmed',
      family: 'official-podium',
      title: 'Pódio no radar',
      text: `${podiumConfirmed.userName} já confirmou ${podiumConfirmed.confirmedPodiumHits} peça${podiumConfirmed.confirmedPodiumHits === 1 ? '' : 's'} do pódio oficial.`,
      userId: podiumConfirmed.userId,
      userName: podiumConfirmed.userName,
      score: podiumConfirmed.confirmedPodiumHits,
      strength: 26 + (podiumConfirmed.confirmedPodiumHits * 2),
      debug: {
        confirmedPodiumHits: podiumConfirmed.confirmedPodiumHits
      }
    }));
  }

  const similarPair = [...pairings].sort((a, b) => (
    b.exactPct - a.exactPct ||
    b.exactMatches - a.exactMatches ||
    compareText(`${a.leftUserName}${a.rightUserName}`, `${b.leftUserName}${b.rightUserName}`)
  ))[0];

  if (similarPair && similarPair.sharedGames >= 3 && similarPair.exactMatches >= 2) {
    register('unlikelyPairingsMatch', buildCandidate({
      id: `unlikely-pair-match-${similarPair.leftUserId}-${similarPair.rightUserId}`,
      type: 'unlikelyPairings',
      family: 'pairings',
      title: 'Dupla sincronizada',
      text: `${similarPair.leftUserName} e ${similarPair.rightUserName} quase preencheram em dupla: bateram ${similarPair.exactMatches} placares iguais.`,
      score: similarPair.exactPct,
      strength: (similarPair.exactPct * 8) + similarPair.exactMatches,
      debug: similarPair
    }));
  }

  const rareChampionPair = [...pairings]
    .filter((pair) => pair.sameChampion && pair.rareChampionCount > 0 && pair.rareChampionCount <= 2)
    .sort((a, b) => (
      a.rareChampionCount - b.rareChampionCount ||
      b.oppositeOutcomes - a.oppositeOutcomes ||
      compareText(`${a.leftUserName}${a.rightUserName}`, `${b.leftUserName}${b.rightUserName}`)
    ))[0];

  if (rareChampionPair) {
    register('unlikelyPairingsChampion', buildCandidate({
      id: `unlikely-pair-champion-${rareChampionPair.leftUserId}-${rareChampionPair.rightUserId}`,
      type: 'unlikelyPairings',
      family: 'pairings',
      title: 'Campeão em comum',
      text: `${rareChampionPair.leftUserName} e ${rareChampionPair.rightUserName} discordaram em quase tudo, mas fecharam com ${rareChampionPair.sameChampion}.`,
      score: rareChampionPair.oppositeOutcomes,
      strength: (rareChampionPair.oppositeOutcomes * 2) + 6,
      debug: rareChampionPair
    }));
  }

  const earlyVisionary = sortProfiles(profiles, (profile) => (
    profile.earlyVisionaryCount * 10 + (profile.earlyVisionaryBest ? (10 - profile.earlyVisionaryBest.pickCount) : 0)
  ))[0];
  if (earlyVisionary && earlyVisionary.earlyVisionaryCount >= 1 && earlyVisionary.earlyVisionaryBest) {
    const ownerWord = earlyVisionary.earlyVisionaryBest.pickCount === 1 ? 'sozinho' : `com mais ${earlyVisionary.earlyVisionaryBest.pickCount - 1} pessoa${earlyVisionary.earlyVisionaryBest.pickCount - 1 === 1 ? '' : 's'}`;
    register('earlyVisionary', buildCandidate({
      id: `early-visionary-${earlyVisionary.userId}`,
      type: 'earlyVisionary',
      family: 'official',
      title: 'Visionario provisorio',
      text: `${earlyVisionary.userName} cravou ${ownerWord} ${earlyVisionary.earlyVisionaryBest.matchName}: ${earlyVisionary.earlyVisionaryBest.officialScoreLabel}.`,
      userId: earlyVisionary.userId,
      userName: earlyVisionary.userName,
      score: earlyVisionary.earlyVisionaryCount,
      strength: (earlyVisionary.earlyVisionaryCount * 6) + (6 - earlyVisionary.earlyVisionaryBest.pickCount),
      debug: earlyVisionary.earlyVisionaryBest
    }));
  }

  const nearMiss = sortProfiles(profiles, (profile) => profile.nearMissCount)[0];
  if (nearMiss && nearMiss.nearMissCount >= 1) {
    register('nearMissIndex', buildCandidate({
      id: `near-miss-${nearMiss.userId}`,
      type: 'nearMissIndex',
      family: 'official',
      title: 'Azarado estatistico',
      text: `${nearMiss.userName} esta batendo na trave: ja teve ${nearMiss.nearMissCount} quase-cravada${nearMiss.nearMissCount === 1 ? '' : 's'}.`,
      userId: nearMiss.userId,
      userName: nearMiss.userName,
      score: nearMiss.nearMissCount,
      strength: nearMiss.nearMissCount * 3,
      debug: {
        nearMissCount: nearMiss.nearMissCount
      }
    }));
  }

  return {
    stats,
    candidates
  };
};

export function buildEditorialStatsDashboard(input = {}) {
  const eligibleUsers = input.eligibleUsers || getEligiblePredictionUsers(input);

  if (eligibleUsers.length < 2) {
    return {
      eligibleUsers,
      eligibleCount: eligibleUsers.length,
      insufficientSample: true,
      emptyText: EMPTY_COMPARATIVE_TEXT,
      profiles: [],
      stats: {},
      candidates: [],
      homeInsights: [],
      rankingComments: []
    };
  }

  const profileState = calculateUserStyleProfiles({
    ...input,
    eligibleUsers
  });
  const { stats, candidates } = buildStatCandidates(profileState);
  const freshHomeCandidates = candidates.filter((candidate) => !STALE_HOME_CANDIDATE_TYPES.has(candidate.type));

  return {
    ...profileState,
    eligibleCount: eligibleUsers.length,
    insufficientSample: false,
    emptyText: EMPTY_COMPARATIVE_TEXT,
    stats,
    candidates,
    homeInsights: selectEditorialCandidates(freshHomeCandidates.length ? freshHomeCandidates : candidates, {
      minItems: 3,
      maxItems: 6,
      preferredItems: 5,
      maxPerUser: 1
    }),
    rankingComments: selectEditorialCandidates(candidates, {
      minItems: 4,
      maxItems: 8,
      preferredItems: 6,
      maxPerUser: 2
    })
  };
}

export function buildHomeEditorialInsights(input = {}) {
  if (!getVisibilityAccess(input)) {
    return buildLockedState({
      title: 'Raio-X do bolão',
      text: LOCKED_HOME_TEXT
    });
  }

  const dashboard = input.dashboard || buildEditorialStatsDashboard(input);

  if (dashboard.insufficientSample) {
    return buildEmptyState({
      title: 'Raio-X do bolão',
      text: dashboard.emptyText,
      eligibleCount: dashboard.eligibleCount
    });
  }

  return {
    title: 'Raio-X do bolão',
    locked: false,
    empty: false,
    eligibleCount: dashboard.eligibleCount,
    text: '',
    items: dashboard.homeInsights
  };
}

export function buildRankingFooterComments(input = {}) {
  if (!getVisibilityAccess(input)) {
    return buildLockedState({
      title: 'Comentários da mesa',
      text: LOCKED_RANKING_TEXT
    });
  }

  const dashboard = input.dashboard || buildEditorialStatsDashboard(input);

  if (dashboard.insufficientSample) {
    return buildEmptyState({
      title: 'Comentários da mesa',
      text: dashboard.emptyText,
      eligibleCount: dashboard.eligibleCount
    });
  }

  return {
    title: 'Comentários da mesa',
    locked: false,
    empty: false,
    eligibleCount: dashboard.eligibleCount,
    text: '',
    items: dashboard.rankingComments
  };
}

export function formatEditorialStatLine(stat) {
  return stat?.text || '';
}

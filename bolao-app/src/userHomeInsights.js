import { buildCompetitionRanking } from './ranking.js';

const PHASE_LENGTHS = {
  dezeszeseisavos: 32,
  oitavas: 16,
  quartas: 8,
  semis: 4
};

const isFilled = (value) => value !== '' && value !== null && value !== undefined;

const isFilledScore = (pick) => isFilled(pick?.placarA) && isFilled(pick?.placarB);

const parseScore = (value) => {
  if (!isFilled(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getMatchName = (match) => `${match.timeA} x ${match.timeB}`;

const formatScore = (scoreA, scoreB) => `${scoreA}x${scoreB}`;

const formatOrdinal = (rank) => `${rank}º`;

const parseMatchDateTime = (match) => {
  if (match?.kickoffEt) return new Date(match.kickoffEt).getTime();

  const [day, month] = String(match?.data || '01/01').split('/').map(Number);
  const [hour, minute] = String(match?.hora || '00:00').split(':').map(Number);
  return new Date(2026, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime();
};

const formatScheduleLabel = (match) => {
  if (match?.kickoffEt) {
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: 'numeric',
      month: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(new Date(match.kickoffEt));

    const getPart = (type) => parts.find((part) => part.type === type)?.value || '00';
    return `${getPart('day')}/${getPart('month')} às ${getPart('hour')}:${getPart('minute')} BR`;
  }

  const [day = '1', month = '1'] = String(match?.data || '01/01').split('/');
  return `${Number(day)}/${Number(month)} às ${match?.hora || '00:00'} BR`;
};

const getOutcome = (scoreA, scoreB) => {
  const normalizedA = parseScore(scoreA);
  const normalizedB = parseScore(scoreB);
  if (normalizedA === null || normalizedB === null) return null;
  if (normalizedA > normalizedB) return 'A';
  if (normalizedB > normalizedA) return 'B';
  return 'draw';
};

const calculateGamePoints = (pickA, pickB, realA, realB, scoringRules) => {
  const normalizedPickA = parseScore(pickA);
  const normalizedPickB = parseScore(pickB);
  const normalizedRealA = parseScore(realA);
  const normalizedRealB = parseScore(realB);

  if ([normalizedPickA, normalizedPickB, normalizedRealA, normalizedRealB].some((value) => value === null)) {
    return 0;
  }

  if (normalizedPickA === normalizedRealA && normalizedPickB === normalizedRealB) {
    return scoringRules?.JOGO?.CHEIO ?? 20;
  }

  return getOutcome(normalizedPickA, normalizedPickB) === getOutcome(normalizedRealA, normalizedRealB)
    ? (scoringRules?.JOGO?.VITORIA ?? 5)
    : 0;
};

const getPendingSummary = ({ pendingGroupPicksCount = 0, knockoutComplete = false }) => {
  const groupText = pendingGroupPicksCount > 0
    ? `Faltam ${pendingGroupPicksCount} jogo${pendingGroupPicksCount === 1 ? '' : 's'} da fase de grupos`
    : 'fase de grupos enviada';

  if (pendingGroupPicksCount > 0 && !knockoutComplete) return `${groupText} e o mata-mata ainda nao foi concluido.`;
  if (pendingGroupPicksCount > 0) return `${groupText}.`;
  if (!knockoutComplete) return 'Falta concluir o mata-mata para liberar o painel.';
  return 'Complete seus envios para liberar o painel.';
};

const getCurrentPoints = (entry) => entry?.total ?? entry?.points ?? 0;

const getTopAlivePhase = (officialKnockout = {}) => {
  if (officialKnockout.campeao) return { key: 'campeao', teams: [officialKnockout.campeao] };

  const top4 = [
    officialKnockout.campeao,
    officialKnockout.vice,
    officialKnockout.terceiro,
    officialKnockout.quarto
  ].filter(Boolean);
  if (top4.length === 4) return { key: 'top4', teams: top4 };

  if ((officialKnockout.semis || []).length === PHASE_LENGTHS.semis) return { key: 'semis', teams: officialKnockout.semis };
  if ((officialKnockout.quartas || []).length === PHASE_LENGTHS.quartas) return { key: 'quartas', teams: officialKnockout.quartas };
  if ((officialKnockout.oitavas || []).length === PHASE_LENGTHS.oitavas) return { key: 'oitavas', teams: officialKnockout.oitavas };
  if ((officialKnockout.dezeszeseisavos || []).length === PHASE_LENGTHS.dezeszeseisavos) return { key: 'dezeszeseisavos', teams: officialKnockout.dezeszeseisavos };
  return null;
};

const buildChampionEliminatedInsight = ({ championPick, officialKnockout }) => {
  if (!championPick) return null;
  const alivePhase = getTopAlivePhase(officialKnockout);
  if (!alivePhase) return null;

  if (!alivePhase.teams.includes(championPick)) {
    return {
      type: 'champion-eliminated',
      tone: 'warning',
      text: `Voce colocou ${championPick} campeao, mas ${championPick} ja foi eliminado.`
    };
  }

  return null;
};

const buildNoMathematicalChanceInsight = ({ currentEntry, leaderEntry, matches, predictions, knockoutPredictions, officialKnockout, scoringRules }) => {
  if (!currentEntry || !leaderEntry || currentEntry.id === leaderEntry.id) return null;

  const unresolvedGamePoints = (matches || []).reduce((total, match) => {
    if (isFilled(match?.placarA) && isFilled(match?.placarB)) return total;
    return isFilledScore(predictions?.[match.id]) ? total + (scoringRules?.JOGO?.CHEIO ?? 20) : total;
  }, 0);

  const unresolvedKnockoutPoints = [
    ['dezeszeseisavos', scoringRules?.MATA?.R32 ?? 5],
    ['oitavas', scoringRules?.MATA?.R16 ?? 10],
    ['quartas', scoringRules?.MATA?.QF ?? 20],
    ['semis', scoringRules?.MATA?.SF ?? 30]
  ].reduce((total, [field, points]) => {
    const officialLength = (officialKnockout?.[field] || []).length;
    if (officialLength >= PHASE_LENGTHS[field]) return total;
    const picks = (knockoutPredictions?.[field] || []).filter(Boolean);
    return total + (picks.length * points);
  }, 0)
    + (!officialKnockout?.campeao && knockoutPredictions?.campeao ? (scoringRules?.MATA?.CAMPEAO ?? 100) : 0)
    + (!officialKnockout?.vice && knockoutPredictions?.vice ? (scoringRules?.MATA?.VICE ?? 70) : 0)
    + (!officialKnockout?.terceiro && knockoutPredictions?.terceiro ? (scoringRules?.MATA?.TOP3 ?? 50) : 0)
    + (!officialKnockout?.quarto && knockoutPredictions?.quarto ? (scoringRules?.MATA?.TOP4 ?? 40) : 0);

  const maxReachableTotal = getCurrentPoints(currentEntry) + unresolvedGamePoints + unresolvedKnockoutPoints;
  if (maxReachableTotal < getCurrentPoints(leaderEntry)) {
    return {
      type: 'no-mathematical-chance',
      tone: 'warning',
      text: 'Mesmo acertando tudo que falta, voce nao alcanca mais a lideranca.'
    };
  }

  return null;
};

const getNextPendingMatch = (matches = []) => (
  [...matches]
    .filter((match) => !isFilled(match?.placarA) || !isFilled(match?.placarB))
    .sort((a, b) => parseMatchDateTime(a) - parseMatchDateTime(b))[0] || null
);

const buildNextMatchOvertakeInsight = ({ currentEntry, ranking, predictionsByUser, nextMatch, scoringRules }) => {
  const currentPick = predictionsByUser?.[currentEntry.id]?.[nextMatch.id];
  if (!isFilledScore(currentPick)) return null;

  const hypotheticalEntries = ranking.map((entry) => {
    const pick = predictionsByUser?.[entry.id]?.[nextMatch.id];
    const delta = isFilledScore(pick)
      ? calculateGamePoints(pick.placarA, pick.placarB, currentPick.placarA, currentPick.placarB, scoringRules)
      : 0;

    return {
      ...entry,
      hypotheticalTotal: getCurrentPoints(entry) + delta
    };
  });

  const hypotheticalRanking = buildCompetitionRanking(
    hypotheticalEntries,
    (entry) => entry.hypotheticalTotal,
    (entry) => entry.nome
  );

  const hypotheticalCurrent = hypotheticalRanking.find((entry) => entry.id === currentEntry.id);
  if (!hypotheticalCurrent) return null;

  if (currentEntry.rank > 3 && hypotheticalCurrent.rank <= 3) {
    return {
      type: 'next-match-overtake',
      tone: 'positive',
      text: 'Uma cravada no proximo jogo pode te colocar no top 3.'
    };
  }

  const passedUser = ranking
    .filter((entry) => entry.rank < currentEntry.rank)
    .find((entry) => hypotheticalCurrent.hypotheticalTotal > (hypotheticalRanking.find((candidate) => candidate.id === entry.id)?.hypotheticalTotal ?? getCurrentPoints(entry)));

  if (!passedUser) return null;

  return {
    type: 'next-match-overtake',
    tone: 'positive',
    text: `Se cravar seu proximo jogo, voce pode passar ${passedUser.nome}.`
  };
};

const buildNextMatchPickInsights = ({ currentUserId, users, predictionsByUser, nextMatch }) => {
  const currentPick = predictionsByUser?.[currentUserId]?.[nextMatch.id];
  if (!isFilledScore(currentPick)) return [];

  const picks = (users || [])
    .map((user) => ({
      user,
      pick: predictionsByUser?.[user.id]?.[nextMatch.id]
    }))
    .filter(({ pick }) => isFilledScore(pick));

  if (!picks.length) return [];

  const scoreMap = new Map();
  const outcomeMap = new Map();

  picks.forEach(({ user, pick }) => {
    const scoreKey = formatScore(pick.placarA, pick.placarB);
    const outcomeKey = getOutcome(pick.placarA, pick.placarB);

    if (!scoreMap.has(scoreKey)) scoreMap.set(scoreKey, []);
    scoreMap.get(scoreKey).push(user);

    if (outcomeKey) {
      if (!outcomeMap.has(outcomeKey)) outcomeMap.set(outcomeKey, []);
      outcomeMap.get(outcomeKey).push(user);
    }
  });

  const currentScoreKey = formatScore(currentPick.placarA, currentPick.placarB);
  const currentOutcomeKey = getOutcome(currentPick.placarA, currentPick.placarB);
  const sameScoreUsers = (scoreMap.get(currentScoreKey) || []).filter((user) => user.id !== currentUserId);
  const sortedScores = [...scoreMap.entries()]
    .map(([scoreKey, supporters]) => ({ scoreKey, supporters }))
    .sort((a, b) => b.supporters.length - a.supporters.length || a.scoreKey.localeCompare(b.scoreKey, 'pt-BR'));

  const mostCommon = sortedScores[0] || null;
  const insights = [];

  if ((scoreMap.get(currentScoreKey) || []).length === 1) {
    insights.push({
      type: 'unique-prediction',
      tone: 'neutral',
      text: 'So voce apostou nesse placar.'
    });
  } else if (currentOutcomeKey && (outcomeMap.get(currentOutcomeKey) || []).length === 1) {
    insights.push({
      type: 'unique-prediction',
      tone: 'neutral',
      text: 'So voce apostou nesse resultado.'
    });
  }

  if (sameScoreUsers.length === 1) {
    insights.push({
      type: 'same-prediction-next-match',
      tone: 'neutral',
      text: `Voce e ${sameScoreUsers[0].nome} apostaram no mesmo placar.`
    });
  } else if (sameScoreUsers.length > 1) {
    insights.push({
      type: 'same-prediction-next-match',
      tone: 'neutral',
      text: `Mais ${sameScoreUsers.length} pessoas apostaram no mesmo placar que voce.`
    });
  }

  if (mostCommon) {
    if (mostCommon.scoreKey === currentScoreKey && mostCommon.supporters.length > 1) {
      insights.push({
        type: 'most-common-prediction',
        tone: 'neutral',
        text: 'Voce esta no palpite mais comum do proximo jogo.'
      });
    } else {
      insights.push({
        type: 'most-common-prediction',
        tone: 'neutral',
        text: `O palpite mais comum do proximo jogo e ${mostCommon.scoreKey.replace('x', ' x ')}.`
      });
    }
  }

  insights.push({
    type: 'next-match-focus',
    tone: 'positive',
    text: `Proximo jogo: ${getMatchName(nextMatch)} em ${formatScheduleLabel(nextMatch)}. Seu palpite e ${currentPick.placarA} x ${currentPick.placarB}.`
  });

  return insights;
};

export function buildUserHomeInsights({
  currentUserId,
  users = [],
  matches = [],
  predictions = {},
  ranking = [],
  scoringRules = {},
  unlocked = false,
  pendingGroupPicksCount = 0,
  knockoutComplete = false,
  officialKnockout = {},
  knockoutPredictions = {}
}) {
  const title = 'Seu Bolao';
  const currentEntry = ranking.find((entry) => entry.id === currentUserId) || null;

  if (!unlocked) {
    return {
      locked: true,
      title,
      primaryLine: 'Complete seus palpites para liberar seu painel do Bolao.',
      secondaryLine: getPendingSummary({ pendingGroupPicksCount, knockoutComplete }),
      insights: []
    };
  }

  if (!currentEntry) {
    return {
      locked: false,
      title,
      primaryLine: 'Seu painel ainda nao tem dados suficientes.',
      secondaryLine: 'Assim que houver ranking e palpites validos, este card sera preenchido.',
      insights: []
    };
  }

  const currentPoints = getCurrentPoints(currentEntry);
  const tieGroup = ranking.filter((entry) => getCurrentPoints(entry) === currentPoints);
  const tiedWithCount = Math.max(tieGroup.length - 1, 0);
  const leaderEntry = ranking[0] || currentEntry;
  const leaderGap = Math.max(getCurrentPoints(leaderEntry) - currentPoints, 0);

  const nextMatch = getNextPendingMatch(matches);
  const participantUsers = users.filter((user) => user.id !== currentUserId ? user.role !== 'admin' : true);

  const insightCandidates = [];
  const championEliminatedInsight = buildChampionEliminatedInsight({
    championPick: knockoutPredictions?.campeao,
    officialKnockout
  });
  if (championEliminatedInsight) insightCandidates.push(championEliminatedInsight);

  const noMathematicalChanceInsight = buildNoMathematicalChanceInsight({
    currentEntry,
    leaderEntry,
    matches,
    predictions: predictions?.[currentUserId] || {},
    knockoutPredictions,
    officialKnockout,
    scoringRules
  });
  if (noMathematicalChanceInsight) insightCandidates.push(noMathematicalChanceInsight);

  if (nextMatch) {
    const overtakeInsight = buildNextMatchOvertakeInsight({
      currentEntry,
      ranking,
      predictionsByUser: predictions,
      nextMatch,
      scoringRules
    });
    if (overtakeInsight) insightCandidates.push(overtakeInsight);

    insightCandidates.push(
      ...buildNextMatchPickInsights({
        currentUserId,
        users: participantUsers,
        predictionsByUser: predictions,
        nextMatch
      })
    );
  }

  const uniqueInsights = insightCandidates.filter((insight, index, list) => (
    list.findIndex((candidate) => candidate.type === insight.type && candidate.text === insight.text) === index
  ));

  return {
    locked: false,
    title,
    rank: currentEntry.rank,
    points: currentPoints,
    tiedWithCount,
    leaderGap,
    primaryLine: `Voce esta em ${formatOrdinal(currentEntry.rank)} lugar`,
    secondaryLine: tiedWithCount > 0
      ? `${currentPoints} pontos · empatado com ${tiedWithCount} ${tiedWithCount === 1 ? 'pessoa' : 'pessoas'}`
      : `${currentPoints} pontos`,
    leaderLine: leaderGap === 0
      ? (tiedWithCount > 0 ? 'Voce esta empatado na lideranca.' : (
        ranking[1] ? `Voce esta liderando por ${getCurrentPoints(currentEntry) - getCurrentPoints(ranking[1])} ponto${getCurrentPoints(currentEntry) - getCurrentPoints(ranking[1]) === 1 ? '' : 's'}.` : 'Voce esta liderando o bolao.'
      ))
      : `Voce esta a ${leaderGap} ponto${leaderGap === 1 ? '' : 's'} da lideranca.`,
    insights: uniqueInsights.slice(0, 3)
  };
}

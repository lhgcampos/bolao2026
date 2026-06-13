const COLLATOR = new Intl.Collator('pt-BR', { sensitivity: 'base' });

const compareText = (a = '', b = '') => COLLATOR.compare(a, b);

const isFilled = (value) => value !== '' && value !== null && value !== undefined;

const isFilledScore = (pick) => isFilled(pick?.placarA) && isFilled(pick?.placarB);
const isFinalMatch = (match) => Boolean(match?.isFinal ?? match?.resultadoFinal);

const normalizeScoreValue = (value) => {
  if (!isFilled(value)) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const getCountEntries = (counts, total) => (
  Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      share: total > 0 ? count / total : 0
    }))
    .sort((a, b) => (
      b.count - a.count ||
      b.share - a.share ||
      compareText(a.value, b.value)
    ))
);

const formatApostadorLabel = (count) => `${count} ${count === 1 ? 'apostador' : 'apostadores'}`;

const formatNamesList = (names = []) => {
  if (!names.length) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} e ${names[1]}`;
  if (names.length === 3) return `${names[0]}, ${names[1]} e ${names[2]}`;
  return `${names[0]}, ${names[1]} e mais ${names.length - 2}`;
};

const buildOutcomeNarrative = ({ matchName, teamA, teamB, outcome, count, supporterNames = [] }) => {
  if (!outcome || count !== 1) return null;
  const owner = formatNamesList(supporterNames);
  if (outcome === 'draw') return owner ? `${owner} foi o único a bancar empate em ${matchName}.` : `Só 1 apostador bancou empate em ${matchName}.`;
  const winner = outcome === 'A' ? teamA : teamB;
  const loser = outcome === 'A' ? teamB : teamA;
  return owner ? `${owner} foi o único a bancar ${winner} contra ${loser}.` : `Só 1 apostador bancou ${winner} contra ${loser}.`;
};

const compareMostCommonPick = (a, b) => (
  b.count - a.count ||
  b.share - a.share ||
  a.match.id - b.match.id ||
  compareText(formatMatchName(a.match), formatMatchName(b.match)) ||
  compareText(a.scoreLabel, b.scoreLabel)
);

const compareDivergence = (a, b) => (
  b.divergenceScore - a.divergenceScore ||
  b.uniqueScores - a.uniqueScores ||
  b.uniqueOutcomes - a.uniqueOutcomes ||
  a.match.id - b.match.id ||
  compareText(formatMatchName(a.match), formatMatchName(b.match))
);

const compareUpset = (a, b) => (
  b.upsetScore - a.upsetScore ||
  a.count - b.count ||
  b.rankGap - a.rankGap ||
  a.match.id - b.match.id ||
  compareText(a.underdogTeam, b.underdogTeam)
);

const compareConsensusTeam = (a, b) => (
  b.count - a.count ||
  b.share - a.share ||
  compareText(a.team, b.team)
);

const compareFinalizedMatch = (a, b) => (
  b.match.id - a.match.id ||
  compareText(a.matchName, b.matchName)
);

export function formatScorePick(pickOrScoreA, maybeScoreB) {
  if (typeof pickOrScoreA === 'object' && pickOrScoreA !== null) {
    return `${pickOrScoreA.placarA} x ${pickOrScoreA.placarB}`;
  }
  return `${pickOrScoreA} x ${maybeScoreB}`;
}

export function formatMatchName(match) {
  return `${match.timeA} x ${match.timeB}`;
}

export function getOutcomeFromScore(scoreA, scoreB) {
  const normalizedA = normalizeScoreValue(scoreA);
  const normalizedB = normalizeScoreValue(scoreB);
  if (normalizedA === null || normalizedB === null) return null;
  if (normalizedA > normalizedB) return 'A';
  if (normalizedB > normalizedA) return 'B';
  return 'draw';
}

export function calculateDivergenceScore({ uniqueScores, uniqueOutcomes, topScoreShare }) {
  return uniqueScores + uniqueOutcomes * 2 + (1 - topScoreShare) * 5;
}

export function getUpsetScore({ winnerRank, loserRank, pickCount, totalEligible }) {
  if (!winnerRank || !loserRank || winnerRank <= loserRank || totalEligible <= 0) return 0;
  const rankGap = winnerRank - loserRank;
  const rarityBonus = 1 - (pickCount / totalEligible);
  return rankGap * (1 + rarityBonus);
}

export function getConsensusEligibleUsers({
  users,
  submissions,
  betsGames,
  betsKnockout,
  games,
  submissionFields,
  isAdminUser,
  usuarioPreencheuTodosOsJogos,
  usuarioPreencheuMataCompleta
}) {
  return (users || []).filter((user) => {
    if (isAdminUser(user)) return false;

    const userSubmissions = submissions?.[user.id] || {};
    const userGames = betsGames?.[user.id] || {};
    const userKnockout = betsKnockout?.[user.id] || {};

    return (
      Boolean(userSubmissions[submissionFields.JOGOS]) &&
      Boolean(userSubmissions[submissionFields.MATA]) &&
      usuarioPreencheuTodosOsJogos(games, userGames) &&
      usuarioPreencheuMataCompleta(userKnockout)
    );
  });
}

export function buildGameConsensus({ matches, eligibleUsers, betsGames, teamRankings }) {
  const matchSummaries = [];
  const mostCommonPickCandidates = [];
  const upsetCandidates = [];
  const divergenceCandidates = [];
  const finalizedWithoutExactHits = [];
  const isolatedOutcomeCandidates = [];
  const finalizedMatches = [];

  (matches || []).forEach((match) => {
    const picks = eligibleUsers
      .map((user) => ({
        user,
        pick: betsGames?.[user.id]?.[match.id]
      }))
      .filter(({ pick }) => isFilledScore(pick));

    if (!picks.length) return;

    const scoreCounts = new Map();
    const outcomeCounts = new Map();
    const scoreSupporters = new Map();
    const outcomeSupporters = new Map();

    picks.forEach(({ user, pick }) => {
      const scoreLabel = formatScorePick(pick);
      scoreCounts.set(scoreLabel, (scoreCounts.get(scoreLabel) || 0) + 1);
      scoreSupporters.set(scoreLabel, [...(scoreSupporters.get(scoreLabel) || []), user.nome]);

      const outcome = getOutcomeFromScore(pick.placarA, pick.placarB);
      if (outcome) {
        outcomeCounts.set(outcome, (outcomeCounts.get(outcome) || 0) + 1);
        outcomeSupporters.set(outcome, [...(outcomeSupporters.get(outcome) || []), user.nome]);
      }
    });

    const scoreEntries = getCountEntries(scoreCounts, picks.length);
    const outcomeEntries = getCountEntries(outcomeCounts, picks.length);
    const topScore = scoreEntries[0] || null;
    const topScoreShare = topScore?.share || 0;
    const uniqueScores = scoreEntries.length;
    const uniqueOutcomes = outcomeEntries.length;
    const divergenceScore = calculateDivergenceScore({
      uniqueScores,
      uniqueOutcomes,
      topScoreShare
    });

    const summary = {
      match,
      matchName: formatMatchName(match),
      pickCount: picks.length,
      scoreEntries,
      outcomeEntries,
      topScore,
      uniqueScores,
      uniqueOutcomes,
      topScoreShare,
      divergenceScore
    };

    matchSummaries.push(summary);

    if (topScore) {
      mostCommonPickCandidates.push({
        match,
        matchName: summary.matchName,
        scoreLabel: topScore.value,
        count: topScore.count,
        share: topScore.share,
        supporterNames: scoreSupporters.get(topScore.value) || []
      });
    }

    divergenceCandidates.push(summary);

    const officialOutcome = getOutcomeFromScore(match.placarA, match.placarB);
    if (officialOutcome && isFinalMatch(match)) {
      const officialScoreLabel = formatScorePick(match.placarA, match.placarB);
      const exactHitUsers = scoreSupporters.get(officialScoreLabel) || [];
      const correctOutcomeUsers = outcomeSupporters.get(officialOutcome) || [];

      finalizedMatches.push({
        match,
        matchName: summary.matchName,
        officialScoreLabel,
        exactHitUsers,
        correctOutcomeUsers,
        officialOutcome
      });
    }
    if (officialOutcome && isFinalMatch(match) && !scoreCounts.has(formatScorePick(match.placarA, match.placarB))) {
      finalizedWithoutExactHits.push({
        match,
        matchName: summary.matchName
      });
    }

    outcomeEntries
      .filter((entry) => entry.count === 1)
      .forEach((entry) => {
        isolatedOutcomeCandidates.push({
          match,
          matchName: summary.matchName,
          outcome: entry.value,
          count: entry.count,
          share: entry.share,
          supporterNames: outcomeSupporters.get(entry.value) || []
        });
      });

    const rankA = teamRankings?.[match.timeA]?.officialRank;
    const rankB = teamRankings?.[match.timeB]?.officialRank;

    if (!rankA || !rankB || rankA === rankB) return;

    const underdogSide = rankA > rankB ? 'A' : 'B';
    const underdogTeam = underdogSide === 'A' ? match.timeA : match.timeB;
    const favoriteTeam = underdogSide === 'A' ? match.timeB : match.timeA;
    const winnerRank = underdogSide === 'A' ? rankA : rankB;
    const loserRank = underdogSide === 'A' ? rankB : rankA;
    const underdogWinCount = outcomeCounts.get(underdogSide) || 0;

    if (!underdogWinCount) return;

    upsetCandidates.push({
      match,
      matchName: summary.matchName,
      underdogTeam,
      favoriteTeam,
      count: underdogWinCount,
      share: underdogWinCount / picks.length,
      supporterNames: outcomeSupporters.get(underdogSide) || [],
      rankGap: winnerRank - loserRank,
      upsetScore: getUpsetScore({
        winnerRank,
        loserRank,
        pickCount: underdogWinCount,
        totalEligible: picks.length
      })
    });
  });

  const mostCommonPick = [...mostCommonPickCandidates].sort(compareMostCommonPick)[0] || null;
  const topCommonPicks = [...mostCommonPickCandidates].sort(compareMostCommonPick).slice(0, 3);
  const biggestUpset = [...upsetCandidates].sort(compareUpset)[0] || null;
  const strongestDivergence = [...divergenceCandidates].sort(compareDivergence)[0] || null;
  const biggestDivergence = strongestDivergence?.uniqueScores > 1 ? strongestDivergence : null;
  const isolatedOutcomePick = [...isolatedOutcomeCandidates]
    .sort((a, b) => (
      a.count - b.count ||
      a.match.id - b.match.id ||
      compareText(a.matchName, b.matchName) ||
      compareText(a.outcome, b.outcome)
    ))[0] || null;

  return {
    matches: matchSummaries,
    mostCommonPick,
    topCommonPicks,
    biggestUpset,
    biggestDivergence,
    finalizedWithoutExactHits,
    isolatedOutcomePick,
    finalizedMatches: [...finalizedMatches].sort(compareFinalizedMatch)
  };
}

export function buildKnockoutConsensus({ eligibleUsers, betsKnockout }) {
  const countValues = (getValues) => {
    const counts = new Map();
    const supporters = new Map();

    eligibleUsers.forEach((user) => {
      const bracket = betsKnockout?.[user.id] || {};
      const values = getValues(bracket)
        .filter(Boolean)
        .filter((value, index, list) => list.indexOf(value) === index);

      values.forEach((value) => {
        counts.set(value, (counts.get(value) || 0) + 1);
        supporters.set(value, [...(supporters.get(value) || []), user.nome]);
      });
    });

    return getCountEntries(counts, eligibleUsers.length)
      .map((entry) => ({
        team: entry.value,
        count: entry.count,
        share: entry.share,
        supporterNames: supporters.get(entry.value) || []
      }))
      .sort(compareConsensusTeam);
  };

  const champion = countValues((bracket) => [bracket.campeao]);
  const vice = countValues((bracket) => [bracket.vice]);
  const third = countValues((bracket) => [bracket.terceiro]);
  const fourth = countValues((bracket) => [bracket.quarto]);
  const semifinalists = countValues((bracket) => bracket.semis || []);
  const finalists = countValues((bracket) => [bracket.campeao, bracket.vice]);

  return {
    champion,
    vice,
    third,
    fourth,
    semifinalists,
    finalists
  };
}

export function buildNarrativeLines({ dashboard, ranking = [] }) {
  if (!dashboard || dashboard.insufficientSample) return [];

  const lines = [];
  const usedText = new Set();
  const pushLine = (text) => {
    if (!text || usedText.has(text)) return;
    usedText.add(text);
    lines.push(text);
  };

  const championTop = dashboard.knockoutConsensus?.champion?.[0];
  if (championTop) {
    pushLine(
      championTop.count === 1
        ? `${formatNamesList(championTop.supporterNames)} foi de ${championTop.team} campeão.`
        : `${formatApostadorLabel(championTop.count)} foram de ${championTop.team} campeão.`
    );
  }

  const overallLeader = ranking[0];
  const overallLeaders = overallLeader
    ? ranking.filter((entry) => entry.total === overallLeader.total)
    : [];
  if (overallLeader && overallLeader.total > 0) {
    pushLine(
      overallLeaders.length === 1
        ? `${overallLeader.nome} lidera o ranking geral com ${overallLeader.total} pts.`
        : `${formatNamesList(overallLeaders.map((entry) => entry.nome))} lideram o ranking geral com ${overallLeader.total} pts.`
    );
  }

  const knockoutLeader = [...ranking].sort((a, b) => (
    b.ptsMataMata - a.ptsMataMata ||
    b.total - a.total ||
    compareText(a.nome, b.nome)
  ))[0];
  if (knockoutLeader && knockoutLeader.ptsMataMata > 0) {
    pushLine(`${knockoutLeader.nome} lidera o mata-mata com ${knockoutLeader.ptsMataMata} pts.`);
  }

  const topExactLeader = [...ranking].sort((a, b) => (
    b.exatos - a.exatos ||
    b.total - a.total ||
    compareText(a.nome, b.nome)
  ))[0];
  if (topExactLeader && topExactLeader.exatos > 0) {
    pushLine(`${topExactLeader.nome} lidera nos placares cravados com ${topExactLeader.exatos} exato${topExactLeader.exatos === 1 ? '' : 's'}.`);
  }

  const latestFinalized = dashboard.finalizedMatches?.[0];
  if (latestFinalized) {
    if (latestFinalized.exactHitUsers.length > 0) {
      pushLine(`${formatNamesList(latestFinalized.exactHitUsers)} cravou${latestFinalized.exactHitUsers.length > 1 ? 'ram' : ''} ${latestFinalized.matchName}: ${latestFinalized.officialScoreLabel}.`);
    } else {
      pushLine(`No último resultado lançado, ninguém cravou ${latestFinalized.matchName}: ${latestFinalized.officialScoreLabel}.`);
    }
  }

  if (dashboard.finalizedMatches?.length) {
    const exactHitNames = Array.from(new Set(dashboard.finalizedMatches.flatMap((match) => match.exactHitUsers)));
    if (exactHitNames.length > 0) {
      pushLine(`Depois de ${dashboard.finalizedMatches.length} jogo${dashboard.finalizedMatches.length === 1 ? '' : 's'} oficial${dashboard.finalizedMatches.length === 1 ? '' : 'is'}, ${formatApostadorLabel(exactHitNames.length)} já cravaram pelo menos um placar.`);
    } else {
      pushLine(`Depois de ${dashboard.finalizedMatches.length} jogo${dashboard.finalizedMatches.length === 1 ? '' : 's'} oficial${dashboard.finalizedMatches.length === 1 ? '' : 'is'}, ninguém acertou placar exato ainda.`);
    }
  }

  if (dashboard.biggestUpset) {
    const { count, underdogTeam, favoriteTeam, supporterNames } = dashboard.biggestUpset;
    if (count === 1) {
      pushLine(`${formatNamesList(supporterNames)} foi o único a bancar ${underdogTeam} contra ${favoriteTeam}.`);
    } else {
      pushLine(`${formatApostadorLabel(count)} bancaram ${underdogTeam} sobre ${favoriteTeam}.`);
    }
  }

  if (dashboard.biggestDivergence) {
    pushLine(`${dashboard.biggestDivergence.matchName} rachou o bolão: ${dashboard.biggestDivergence.uniqueScores} placares diferentes.`);
  }

  if (dashboard.mostCommonPick) {
    if (dashboard.mostCommonPick.count === 1) {
      pushLine(`${formatNamesList(dashboard.mostCommonPick.supporterNames)} segurou sozinho ${dashboard.mostCommonPick.matchName} ${dashboard.mostCommonPick.scoreLabel}.`);
    } else {
      pushLine(`${dashboard.mostCommonPick.matchName} ${dashboard.mostCommonPick.scoreLabel} foi o placar mais popular.`);
    }
  }

  const noExactMatch = dashboard.finalizedWithoutExactHits?.[0];
  if (noExactMatch) {
    pushLine(`Ninguém cravou o placar oficial de ${noExactMatch.matchName}.`);
  }

  const isolatedOutcomeText = buildOutcomeNarrative({
    ...dashboard.isolatedOutcomePick,
    teamA: dashboard.isolatedOutcomePick?.match?.timeA,
    teamB: dashboard.isolatedOutcomePick?.match?.timeB
  });
  pushLine(isolatedOutcomeText);

  return lines.slice(0, 8);
}

export function buildConsensusDashboard({
  users,
  submissions,
  betsGames,
  betsKnockout,
  games,
  ranking,
  teamRankings,
  submissionFields,
  isAdminUser,
  usuarioPreencheuTodosOsJogos,
  usuarioPreencheuMataCompleta
}) {
  const eligibleUsers = getConsensusEligibleUsers({
    users,
    submissions,
    betsGames,
    betsKnockout,
    games,
    submissionFields,
    isAdminUser,
    usuarioPreencheuTodosOsJogos,
    usuarioPreencheuMataCompleta
  });

  if (eligibleUsers.length < 2) {
    return {
      eligibleUsers,
      eligibleCount: eligibleUsers.length,
      insufficientSample: true,
      narrativeLines: []
    };
  }

  const gameConsensus = buildGameConsensus({
    matches: games,
    eligibleUsers,
    betsGames,
    teamRankings
  });
  const knockoutConsensus = buildKnockoutConsensus({
    eligibleUsers,
    betsKnockout
  });

  const dashboard = {
    eligibleUsers,
    eligibleCount: eligibleUsers.length,
    insufficientSample: false,
    ...gameConsensus,
    knockoutConsensus
  };

  return {
    ...dashboard,
    narrativeLines: buildNarrativeLines({
      dashboard,
      ranking
    })
  };
}

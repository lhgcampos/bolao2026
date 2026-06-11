const COLLATOR = new Intl.Collator('pt-BR', { sensitivity: 'base' });

const getDefaultPoints = (player = {}) => player.points ?? player.total ?? 0;

const getDefaultName = (player = {}) => player.nome ?? player.name ?? '';

export const compareRankingNames = (a = '', b = '') => COLLATOR.compare(a, b);

export function sortRankingEntries(entries = [], getPoints = getDefaultPoints, getName = getDefaultName) {
  return [...entries].sort((a, b) => (
    getPoints(b) - getPoints(a) ||
    compareRankingNames(getName(a), getName(b))
  ));
}

export function assignCompetitionRanks(sortedPlayers = [], getPoints = getDefaultPoints) {
  let previousPoints = null;
  let previousRank = 0;

  return sortedPlayers.map((player, index) => {
    const currentPoints = getPoints(player);
    const currentPosition = index + 1;

    if (previousPoints === null || currentPoints !== previousPoints) {
      previousRank = currentPosition;
      previousPoints = currentPoints;
    }

    return {
      ...player,
      rank: previousRank
    };
  });
}

export function buildCompetitionRanking(entries = [], getPoints = getDefaultPoints, getName = getDefaultName) {
  return assignCompetitionRanks(sortRankingEntries(entries, getPoints, getName), getPoints);
}

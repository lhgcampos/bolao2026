import { getOfficialBracketSlot } from './officialBracketSlots.js';

const normalizeLabel = (value) => (typeof value === 'string' ? value.trim() : '');

export const formatKnockoutPlaceholder = (value = '') => {
  const normalized = normalizeLabel(value).toUpperCase();
  if (!normalized) return '';

  const directGroupMatch = normalized.match(/^([123])([A-L])$/);
  if (directGroupMatch) {
    return `${directGroupMatch[1]}o do Grupo ${directGroupMatch[2]}`;
  }

  const thirdPlaceMatch = normalized.match(/^3([A-L]{2,})$/);
  if (thirdPlaceMatch) {
    return `3o de ${thirdPlaceMatch[1].split('').join('/')}`;
  }

  return normalized;
};

export const getOfficialKnockoutMatchup = (officialBracketSlots = {}, matchId) => {
  const slot = getOfficialBracketSlot(officialBracketSlots, matchId);
  const teamA = normalizeLabel(slot?.teamA);
  const teamB = normalizeLabel(slot?.teamB);
  const placeholderA = formatKnockoutPlaceholder(slot?.placeholderA || '');
  const placeholderB = formatKnockoutPlaceholder(slot?.placeholderB || '');
  const publishedCount = (teamA ? 1 : 0) + (teamB ? 1 : 0);

  return {
    teamA,
    teamB,
    placeholderA,
    placeholderB,
    labelA: teamA || placeholderA || 'Aguardando oficial',
    labelB: teamB || placeholderB || 'Aguardando oficial',
    hasPublishedTeams: publishedCount > 0,
    publishedCount
  };
};

export const buildKnockoutReviewCopy = ({ review, pick = '', points = 0 } = {}) => {
  const team = normalizeLabel(pick);
  const awardedPoints = Number.isFinite(review?.pointsAwarded) ? review.pointsAwarded : points;

  switch (review?.state) {
    case 'confirmed':
    case 'partial-confirmed':
      return {
        badgeLabel: 'Acertou',
        pointsLabel: `+${awardedPoints} pts confirmados`,
        caption: team
          ? `Voce marcou ${team}, e esse time ja esta oficialmente nesta fase.`
          : 'Seu time ja esta oficialmente nesta fase.'
      };
    case 'partial-pending':
      return {
        badgeLabel: 'Em aberto',
        pointsLabel: '0 pts por enquanto',
        caption: team
          ? `${team} ainda pode aparecer oficialmente nesta fase.`
          : 'Seu time ainda pode aparecer oficialmente nesta fase.'
      };
    case 'waiting-official':
      return {
        badgeLabel: 'Aguardando oficial',
        pointsLabel: '0 pts por enquanto',
        caption: 'A FIFA ainda nao publicou times suficientes desta fase para pontuar.'
      };
    case 'duplicate':
      return {
        badgeLabel: 'Duplicado',
        pointsLabel: '0 pts nesta fase',
        caption: team
          ? `${team} foi repetido e so pontua uma vez nesta fase.`
          : 'O mesmo time so pontua uma vez nesta fase.'
      };
    case 'error':
      return {
        badgeLabel: 'Errou',
        pointsLabel: '0 pts nesta fase',
        caption: team
          ? `${team} nao entrou oficialmente nesta fase.`
          : 'Seu time nao entrou oficialmente nesta fase.'
      };
    case 'no-pick':
    default:
      return {
        badgeLabel: 'Sem palpite',
        pointsLabel: '0 pts',
        caption: 'Nenhum time foi marcado neste jogo.'
      };
  }
};

import { PONTOS } from './constants.js';
import { placarPreenchido } from './matchData';
import { getMatchResultVariant } from './officialResults/officialResultsView';

export const calcularPontosJogo = (palpiteA, palpiteB, realA, realB) => {
  if (palpiteA === '' || palpiteB === '' || realA === '' || realB === '') return null;
  const pA = parseInt(palpiteA);
  const pB = parseInt(palpiteB);
  const rA = parseInt(realA);
  const rB = parseInt(realB);
  if (pA === rA && pB === rB) return { pts: PONTOS.JOGO.CHEIO, label: 'NA MOSCA!', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
  const diffP = pA - pB;
  const diffR = rA - rB;
  if (Math.sign(diffP) === Math.sign(diffR)) {
    return { pts: PONTOS.JOGO.VITORIA, label: 'VENCEDOR', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
  }
  return { pts: 0, label: 'ERROU', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
};

export const formatScoreDisplay = (placarA, placarB, emptyLabel = '—') => (
  placarPreenchido(placarA, placarB) ? `${placarA} x ${placarB}` : emptyLabel
);

export const formatSubmissionDate = (timestamp) => {
  if (!timestamp) return 'Rascunho';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(timestamp));
};

export const buildGroupBetReview = ({ palpiteA, palpiteB, jogo }) => {
  const officialVariant = getMatchResultVariant(jogo);
  const hasPrediction = placarPreenchido(palpiteA, palpiteB);

  if (officialVariant === 'pending') {
    return {
      label: 'Aguardando oficial',
      detail: 'O resultado ainda não saiu no gabarito.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600'
    };
  }

  if (!hasPrediction) {
    return {
      label: 'Palpite incompleto',
      detail: 'Preencha os dois placares para comparar.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600'
    };
  }

  const score = calcularPontosJogo(palpiteA, palpiteB, jogo.placarA, jogo.placarB);
  if (!score) {
    return {
      label: 'Comparação indisponível',
      detail: 'Não foi possível comparar este jogo.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600'
    };
  }

  if (score.pts === PONTOS.JOGO.CHEIO) {
    return {
      label: 'Cravou o placar',
      detail: `${score.pts} pts${officialVariant === 'temporary' ? ' até agora' : ''}`,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  }

  if (score.pts === PONTOS.JOGO.VITORIA) {
    return {
      label: 'Acertou o resultado',
      detail: `${score.pts} pts${officialVariant === 'temporary' ? ' até agora' : ''}`,
      tone: 'border-amber-200 bg-amber-50 text-amber-700'
    };
  }

  return {
    label: 'Não acertou',
    detail: officialVariant === 'temporary' ? 'Ainda sem pontuação neste parcial.' : 'Este jogo não pontuou.',
    tone: 'border-rose-200 bg-rose-50 text-rose-700'
  };
};

export const buildChoiceReview = ({ choice, official, points, successLabel = 'Acertou a escolha' }) => {
  if (!official) {
    return {
      label: 'Aguardando oficial',
      detail: 'A pontuação aparece quando a definição oficial sair.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600'
    };
  }

  if (!choice) {
    return {
      label: 'Sem palpite',
      detail: 'Nenhuma escolha foi registrada para comparar.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600'
    };
  }

  if (choice === official) {
    return {
      label: successLabel,
      detail: `${points} pts`,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  }

  return {
    label: 'Não acertou',
    detail: '0 pts',
    tone: 'border-rose-200 bg-rose-50 text-rose-700'
  };
};

export const getRunnerUp = (winner, teamA, teamB) => {
  if (!winner || !teamA || !teamB) return '';
  if (winner === teamA) return teamB;
  if (winner === teamB) return teamA;
  return '';
};

export const getWinnerOfMatch = (matchId, source) => {
  if (!source) return null;
  if (matchId >= 73 && matchId <= 88) return source.dezeszeseisavos?.[matchId - 73];
  if (matchId >= 89 && matchId <= 96) return source.oitavas?.[matchId - 89];
  if (matchId >= 97 && matchId <= 100) return source.quartas?.[matchId - 97];
  if (matchId >= 101 && matchId <= 102) return source.semis?.[matchId - 101];
  return null;
};

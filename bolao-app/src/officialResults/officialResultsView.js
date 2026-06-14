import { buildChronologicalMatchGroups, isMatchFinal, isManualResultLocked, parseMatchDateTime, placarPreenchido } from '../matchData.js';

export const getMatchResultVariant = (match) => {
  if (!placarPreenchido(match?.placarA, match?.placarB)) return 'pending';
  return isMatchFinal(match) ? 'final' : 'temporary';
};

export const countResolvedMatchesByVariant = (matches = []) => matches.reduce((summary, match) => {
  const variant = getMatchResultVariant(match);
  if (variant === 'final') summary.final += 1;
  if (variant === 'temporary') summary.temporary += 1;
  return summary;
}, { final: 0, temporary: 0 });

export const formatResultSourceTimestamp = (timestamp) => {
  if (!timestamp) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(timestamp));
};

export const getOfficialResultStatus = (match, { nowMs = Date.now() } = {}) => {
  const variant = getMatchResultVariant(match);
  const alreadyStarted = parseMatchDateTime(match) <= nowMs;

  if (isManualResultLocked(match)) {
    return {
      label: 'Corrigido manualmente',
      tone: 'border-sky-200 bg-sky-50 text-sky-700'
    };
  }

  if (variant === 'final' && match?.resultOrigin === 'auto-sync') {
    return {
      label: 'Atualizado automaticamente',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  }

  if (variant === 'final') {
    return {
      label: 'Resultado oficial',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700'
    };
  }

  if (variant === 'temporary') {
    return {
      label: 'Placar temporário',
      tone: 'border-orange-200 bg-orange-50 text-orange-700'
    };
  }

  if (alreadyStarted) {
    return {
      label: 'Aguardando resultado',
      tone: 'border-amber-200 bg-amber-50 text-amber-700'
    };
  }

  return {
    label: 'Não iniciado',
    tone: 'border-slate-200 bg-slate-50 text-slate-600'
  };
};

const buildSourceMeta = (match) => [
  match?.resultSourceLabel || '',
  match?.resultUpdatedAt ? formatResultSourceTimestamp(match.resultUpdatedAt) : ''
].filter(Boolean).join(' • ');

export const getOfficialCompetitionLabel = (match) => {
  if (match?.grupo) return `Grupo ${match.grupo}`;
  if (match?.fase) return match.fase;
  return 'Fase oficial';
};

export const buildGabaritoTimeline = (matches = [], { isAdmin = false, nowMs = Date.now() } = {}) => (
  buildChronologicalMatchGroups(matches).map((dayGroup) => ({
    ...dayGroup,
    matches: dayGroup.matches.map((match) => ({
      match,
      competitionLabel: getOfficialCompetitionLabel(match),
      status: getOfficialResultStatus(match, { nowMs }),
      sourceMeta: buildSourceMeta(match),
      showAdminControls: isAdmin,
      showHistory: isAdmin
    }))
  }))
);

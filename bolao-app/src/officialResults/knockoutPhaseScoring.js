import { MATA_MATA_CONFIG } from '../constants.js';
import { getOfficialBracketSlot, normalizeOfficialBracketSlots } from './officialBracketSlots.js';

const PHASE_SLOT_MATCH_IDS = {
  dezeszeseisavos: MATA_MATA_CONFIG.r32.map((match) => match.id),
  oitavas: MATA_MATA_CONFIG.r16.map((match) => match.id),
  quartas: MATA_MATA_CONFIG.qf.map((match) => match.id),
  semis: MATA_MATA_CONFIG.sf.map((match) => match.id)
};

const PHASE_EXPECTED_TEAM_COUNTS = {
  dezeszeseisavos: MATA_MATA_CONFIG.r32.length * 2,
  oitavas: MATA_MATA_CONFIG.r16.length * 2,
  quartas: MATA_MATA_CONFIG.qf.length * 2,
  semis: MATA_MATA_CONFIG.sf.length * 2
};

const PHASE_KNOCKOUT_PARTICIPANTS_SOURCE = {
  dezeszeseisavos: null,
  oitavas: 'dezeszeseisavos',
  quartas: 'oitavas',
  semis: 'quartas'
};

const normalizeTeamName = (value) => (typeof value === 'string' ? value.trim() : '');

const collectUniqueTeams = (teams = []) => {
  const unique = [];
  const seen = new Set();

  teams.forEach((team) => {
    const normalized = normalizeTeamName(team);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    unique.push(normalized);
  });

  return unique;
};

const getSlotTeamsForPhase = (phaseKey, officialBracketSlots = {}) => {
  const normalizedSlots = normalizeOfficialBracketSlots(officialBracketSlots);
  const matchIds = PHASE_SLOT_MATCH_IDS[phaseKey] || [];
  return collectUniqueTeams(
    matchIds.flatMap((matchId) => {
      const slot = getOfficialBracketSlot(normalizedSlots, matchId);
      return slot ? [slot.teamA, slot.teamB] : [];
    })
  );
};

const getKnockoutTeamsForPhase = (phaseKey, officialKnockout = {}) => {
  const sourceField = PHASE_KNOCKOUT_PARTICIPANTS_SOURCE[phaseKey];
  if (!sourceField) return [];
  return collectUniqueTeams(Array.isArray(officialKnockout?.[sourceField]) ? officialKnockout[sourceField] : []);
};

export const getKnockoutPhaseOfficialState = ({
  phaseKey,
  officialKnockout = {},
  officialBracketSlots = {}
} = {}) => {
  const expectedCount = PHASE_EXPECTED_TEAM_COUNTS[phaseKey] || 0;
  const slotTeams = getSlotTeamsForPhase(phaseKey, officialBracketSlots);
  const knockoutTeams = getKnockoutTeamsForPhase(phaseKey, officialKnockout);
  const teams = collectUniqueTeams([...slotTeams, ...knockoutTeams]);
  const publishedCount = teams.length;
  const isClosed = expectedCount > 0 && publishedCount >= expectedCount;
  const isPartial = publishedCount > 0 && !isClosed;
  const isPending = publishedCount === 0;

  return {
    phaseKey,
    teams,
    teamSet: new Set(teams),
    expectedCount,
    publishedCount,
    isClosed,
    isPartial,
    isPending
  };
};

export const calculateKnockoutPhasePoints = ({
  phaseKey,
  picks = [],
  points = 0,
  officialKnockout = {},
  officialBracketSlots = {}
} = {}) => {
  const officialState = getKnockoutPhaseOfficialState({
    phaseKey,
    officialKnockout,
    officialBracketSlots
  });

  const uniquePicks = collectUniqueTeams(Array.isArray(picks) ? picks : []);
  return uniquePicks.reduce(
    (total, pick) => total + (officialState.teamSet.has(pick) ? points : 0),
    0
  );
};

export const evaluateKnockoutPhasePick = ({
  phaseKey,
  pick = '',
  pickIndex = -1,
  allPicks = [],
  points = 0,
  officialKnockout = {},
  officialBracketSlots = {},
  successLabel = 'Acertou a escolha'
} = {}) => {
  const normalizedPick = normalizeTeamName(pick);
  const normalizedPicks = Array.isArray(allPicks) ? allPicks.map(normalizeTeamName) : [];
  const officialState = getKnockoutPhaseOfficialState({
    phaseKey,
    officialKnockout,
    officialBracketSlots
  });

  if (!normalizedPick) {
    return {
      state: 'no-pick',
      label: 'Sem palpite',
      detail: 'Nenhuma escolha foi registrada para comparar.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600',
      pointsAwarded: 0,
      officialState
    };
  }

  const firstOccurrenceIndex = normalizedPicks.findIndex((entry) => entry === normalizedPick);
  if (firstOccurrenceIndex !== -1 && pickIndex !== -1 && firstOccurrenceIndex !== pickIndex) {
    return {
      state: 'duplicate',
      label: 'Palpite duplicado',
      detail: '0 pts. O mesmo time so pontua uma vez na fase.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600',
      pointsAwarded: 0,
      officialState
    };
  }

  if (officialState.isPending) {
    return {
      state: 'waiting-official',
      label: 'Aguardando oficial',
      detail: 'A pontuacao aparece quando a definicao oficial sair.',
      tone: 'border-slate-200 bg-slate-50 text-slate-600',
      pointsAwarded: 0,
      officialState
    };
  }

  if (officialState.teamSet.has(normalizedPick)) {
    return {
      state: officialState.isPartial ? 'partial-confirmed' : 'confirmed',
      label: officialState.isPartial ? 'Oficial parcial' : successLabel,
      detail: officialState.isPartial ? `${points} pts ja confirmados.` : `${points} pts`,
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      pointsAwarded: points,
      officialState
    };
  }

  if (officialState.isPartial) {
    return {
      state: 'partial-pending',
      label: 'Oficial parcial',
      detail: 'Seu time ainda pode aparecer no oficial.',
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
      pointsAwarded: 0,
      officialState
    };
  }

  return {
    state: 'error',
    label: 'Nao acertou',
    detail: '0 pts',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    pointsAwarded: 0,
    officialState
  };
};

export const getKnockoutPhaseTeamStatus = ({
  phaseKey,
  team = '',
  officialKnockout = {},
  officialBracketSlots = {}
} = {}) => {
  const normalizedTeam = normalizeTeamName(team);
  const officialState = getKnockoutPhaseOfficialState({
    phaseKey,
    officialKnockout,
    officialBracketSlots
  });

  if (!normalizedTeam || normalizedTeam === 'A definir') {
    return {
      state: 'unknown',
      label: 'A definir',
      tone: 'border-slate-200 bg-slate-50 text-slate-500',
      officialState
    };
  }

  if (officialState.isPending) {
    return {
      state: 'waiting-official',
      label: 'Sem oficial ainda',
      tone: 'border-slate-200 bg-slate-50 text-slate-600',
      officialState
    };
  }

  if (officialState.teamSet.has(normalizedTeam)) {
    return {
      state: 'confirmed',
      label: 'Ja confirmado',
      tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
      officialState
    };
  }

  if (officialState.isPartial) {
    return {
      state: 'partial-pending',
      label: 'Ainda pode entrar',
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
      officialState
    };
  }

  return {
    state: 'eliminated',
    label: 'Ficou fora',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    officialState
  };
};

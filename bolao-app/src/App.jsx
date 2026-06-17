import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Calendar, Settings, Plus, User, Medal, Crown, List, ChevronDown, ChevronUp, AlertCircle, MapPin, Calculator, Lock, LogOut, ArrowRight, Check, Eye, EyeOff, MessageCircle, Smartphone } from './lucideIcons';
import { THIRD_PLACE_ASSIGNMENTS } from './thirdPlaceAssignments';
import { TEAM_FIFA_RANKINGS } from './fifaTeamRankings';
import { buildConsensusDashboard } from './rankingConsensus';
import { buildDenseRanking } from './ranking';
import { buildUserHomeInsights } from './userHomeInsights';
import { buildEditorialStatsDashboard, buildHomeEditorialInsights } from './editorialStats';
import { AvatarBadge, InsightsHubPanel, PodiumSection, RankingTable, RestrictedMatchDropdown, ReviewSheet, TabelaClassificacao } from './components/index.js';
import { MATA_MATA_CONFIG, PONTOS, PONTOS_CONDUTA, SUBMISSION_FIELDS } from './constants.js';
import { GLASS_CARD, GLASS_BTN_PRIMARY, GLASS_BTN_SECONDARY, GLASS_INPUT, TEXT_HIGHLIGHT, TEXT_MUTED } from './styles.js';
import { buildGroupBetReview, calcularPontosJogo, formatScoreDisplay, formatSubmissionDate } from './utils.js';
import {
  GRUPOS_2026,
  formatBrazilMatchSchedule,
  formatOfficialKickoffHint,
  gerarJogosIniciais,
  isManualResultLocked,
  normalizePersistedGameData,
  placarPreenchido
} from './matchData';
import {
  countFilledGameSelections,
  countFilledKnockoutSelections,
  countPendingGames,
  mergeSubmissionEntry,
  normalizeKnockoutBracketShape,
  reconcileSubmissionMap,
  userCompletedAllGames,
  userCompletedKnockout
} from './submissionState';
import {
  applyManualResultCorrection,
  clearManualResultLock
} from './officialResults/applyOfficialResult';
import {
  buildGabaritoTimeline,
  countResolvedMatchesByVariant,
  formatResultSourceTimestamp,
  getOfficialCompetitionLabel,
  getMatchResultVariant
} from './officialResults/officialResultsView';

const TODOS_TIMES = Object.values(GRUPOS_2026).flat().sort();

const ADMIN_USER_ID = 999;
const REMOTE_STORE_BASE = 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = 'lhgcampos-bolao2026-live-20260609';
const REMOTE_SCHEMA_VERSION = 4;
const REMOTE_LEGACY_STATE_PATH = 'state';
const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  matches: 'matches',
  officialKnockout: 'official-knockout',
  officialResultsSyncStatus: 'official-results-sync-status',
  officialResultsSyncHistory: 'official-results-sync-history',
  conduct: 'conduct',
  betsGames: 'bets-games',
  betsKnockout: 'bets-knockout',
  sealedBetsGames: 'sealed-bets-games',
  sealedBetsKnockout: 'sealed-bets-knockout',
  submissions: 'submissions',
  userProfiles: 'user-profiles'
};
const PENDING_SYNC_KEY = 'bolao26_pending_sync_v1';
const SYNC_DEBOUNCE_MS = 900;
const SYNC_IMMEDIATE_RETRY_MS = 80;
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/K3WYefFWkzY09iK1csJtZA?mode=gi_t';
const REMOTE_POLL_MS = 5000;
const KNOCKOUT_PHASE_LENGTHS = {
  dezeszeseisavos: 16,
  oitavas: 8,
  quartas: 4,
  semis: 2
};
const COUNTRY_SHORT_NAMES = {
  'África do Sul': 'Afr. Sul',
  'Coreia do Sul': 'Cor. Sul',
  'Rep. Tcheca': 'Rep. Tch.',
  'Costa do Marfim': 'C. Marfim',
  'Nova Zelândia': 'Nova Zel.',
  'Arábia Saudita': 'Arábia S.',
  'Cabo Verde': 'C. Verde',
  'RD Congo': 'RD Congo'
};
const AVATAR_MAX_FILE_BYTES = 2 * 1024 * 1024;
const AVATAR_MAX_OUTPUT_BYTES = 48 * 1024;
const AVATAR_MAX_DIMENSION = 160;
const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL || 'https://bolao2026-avatar-upload.linoscheduling.workers.dev';
const AVATAR_PUBLIC_BASE_URL = import.meta.env.VITE_AVATAR_PUBLIC_BASE_URL || 'https://pub-56fbf4716fdc4ab69e70b4c56f28fccf.r2.dev';
const DEMO_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAABv7bNHAAABpUlEQVR4nO3QwQ3CMBQFQYz//8u2g0QdW0dManIeZDV4SSQdlqzTeWYIAAAAAAAAAAB4m7vN3Wf9eR9n3rV7h9t7n5f4q2w8b0v2m2vV8f9bKf9t8m9bM4QGg9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rer8BX3kD6XhSx8AAAAASUVORK5CYII=';
const PWA_RESET_KEY = 'bolao26_pwa_reset_v5';
const INSTALLATION_TIPS = {
  ios: [
    'Abra o link no Safari.',
    'Toque em Compartilhar.',
    'Escolha "Adicionar à Tela de Início".'
  ],
  android: [
    'Abra o link no Chrome ou navegador compatível.',
    'Toque em "Instalar app" ou no menu do navegador.',
    'Se não aparecer, use "Adicionar à tela inicial".'
  ]
};
// --- CONFIGURAÇÃO INICIAL ---
const getShortCountryName = (name) => COUNTRY_SHORT_NAMES[name] || name;
const BRAZIL_DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});

const getMatchReferenceTime = (match) => {
  if (match?.kickoffEt) {
    const timestamp = Date.parse(match.kickoffEt);
    return Number.isNaN(timestamp) ? null : timestamp;
  }

  const [day, month] = String(match?.data || '01/01').split('/').map(Number);
  const [hour, minute] = String(match?.hora || '00:00').split(':').map(Number);
  const timestamp = new Date(2026, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const getBrazilDayKey = (timestamp) => {
  if (!Number.isFinite(timestamp)) return '';
  return BRAZIL_DATE_FORMATTER.format(new Date(timestamp));
};

const parseReferenceTimestamp = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getNearestTimelineMatchId = (matches = [], nowMs = Date.now()) => {
  const candidates = (matches || [])
    .map((match) => ({
      id: match.id,
      timestamp: getMatchReferenceTime(match)
    }))
    .filter((entry) => Number.isFinite(entry.timestamp));

  if (!candidates.length) return null;

  const todayKey = getBrazilDayKey(nowMs);
  const todaysMatches = candidates.filter((entry) => getBrazilDayKey(entry.timestamp) === todayKey);
  const futureTodayMatches = todaysMatches
    .filter((entry) => entry.timestamp >= nowMs)
    .sort((a, b) => a.timestamp - b.timestamp);

  const pool = futureTodayMatches.length
    ? futureTodayMatches
    : todaysMatches.length
      ? todaysMatches
      : candidates;

  return pool.sort((a, b) => (
    Math.abs(a.timestamp - nowMs) - Math.abs(b.timestamp - nowMs) ||
    a.timestamp - b.timestamp ||
    a.id - b.id
  ))[0]?.id || null;
};

// --- LÓGICA DE NEGÓCIO ---
const getTeamConductScore = (grupo, time, condutaGrupos) => {
  const registro = condutaGrupos?.[grupo]?.[time];
  if (!registro) return 0;
  if (typeof registro.score === 'number' && !Number.isNaN(registro.score)) return registro.score;
  const amarelos = Number(registro.amarelos || 0);
  const vermelhoIndireto = Number(registro.vermelhoIndireto || 0);
  const vermelhoDireto = Number(registro.vermelhoDireto || 0);
  const amareloEVermelhoDireto = Number(registro.amareloEVermelhoDireto || 0);
  return (
    amarelos * PONTOS_CONDUTA.AMARELO +
    vermelhoIndireto * PONTOS_CONDUTA.VERMELHO_INDIRETO +
    vermelhoDireto * PONTOS_CONDUTA.VERMELHO_DIRETO +
    amareloEVermelhoDireto * PONTOS_CONDUTA.AMARELO_E_VERMELHO_DIRETO
  );
};

const calcularMiniTabela = (timesEmpatados, jogosProcessados) => {
  const mini = {};
  timesEmpatados.forEach((time) => {
    mini[time] = { p: 0, sg: 0, gp: 0 };
  });

  jogosProcessados.forEach((jogo) => {
    if (!timesEmpatados.includes(jogo.timeA) || !timesEmpatados.includes(jogo.timeB)) return;

    mini[jogo.timeA].gp += jogo.pA;
    mini[jogo.timeA].sg += jogo.pA - jogo.pB;
    mini[jogo.timeB].gp += jogo.pB;
    mini[jogo.timeB].sg += jogo.pB - jogo.pA;

    if (jogo.pA > jogo.pB) {
      mini[jogo.timeA].p += 3;
    } else if (jogo.pB > jogo.pA) {
      mini[jogo.timeB].p += 3;
    } else {
      mini[jogo.timeA].p += 1;
      mini[jogo.timeB].p += 1;
    }
  });

  return mini;
};

const getTeamOfficialRank = (team) => TEAM_FIFA_RANKINGS[team]?.officialRank ?? Number.MAX_SAFE_INTEGER;

const compareOfficialRanking = (a, b) => (
  getTeamOfficialRank(a.time) - getTeamOfficialRank(b.time)
);

const compararCritBase = (a, b) => (
  b.p - a.p ||
  b.sg - a.sg ||
  b.gp - a.gp ||
  b.conduta - a.conduta ||
  compareOfficialRanking(a, b) ||
  a.time.localeCompare(b.time, 'pt-BR')
);

const resolverEmpateGrupoFifa = (linhas, jogosProcessados) => {
  if (linhas.length <= 1) return linhas;

  const miniTabela = calcularMiniTabela(linhas.map((linha) => linha.time), jogosProcessados);
  const enriquecidas = linhas.map((linha) => ({
    ...linha,
    miniP: miniTabela[linha.time].p,
    miniSg: miniTabela[linha.time].sg,
    miniGp: miniTabela[linha.time].gp
  }));

  enriquecidas.sort((a, b) =>
    b.miniP - a.miniP ||
    b.miniSg - a.miniSg ||
    b.miniGp - a.miniGp
  );

  const grupos = [];
  enriquecidas.forEach((linha) => {
    const ultimo = grupos[grupos.length - 1];
    if (
      ultimo &&
      ultimo[0].miniP === linha.miniP &&
      ultimo[0].miniSg === linha.miniSg &&
      ultimo[0].miniGp === linha.miniGp
    ) {
      ultimo.push(linha);
      return;
    }
    grupos.push([linha]);
  });

  return grupos.flatMap((grupoEmpatado) => {
    if (grupoEmpatado.length === 1) return grupoEmpatado;
    if (grupoEmpatado.length !== linhas.length) {
      return resolverEmpateGrupoFifa(
        grupoEmpatado.map(({ miniP, miniSg, miniGp, ...resto }) => resto),
        jogosProcessados
      );
    }
    return grupoEmpatado
      .map(({ miniP, miniSg, miniGp, ...resto }) => resto)
      .sort((a, b) => compararCritBase(a, b));
  });
};

const ordenarTabelaGrupoFifa = (linhas, jogosProcessados) => {
  const porPontos = [...linhas].sort((a, b) => b.p - a.p);
  const grupos = [];

  porPontos.forEach((linha) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo[0].p === linha.p) {
      ultimo.push(linha);
      return;
    }
    grupos.push([linha]);
  });

  return grupos.flatMap((grupoEmpatado) => (
    grupoEmpatado.length === 1 ? grupoEmpatado : resolverEmpateGrupoFifa(grupoEmpatado, jogosProcessados)
  ));
};

const calcularTabelaGrupo = (grupo, jogos, palpitesUsuario, condutaGrupos = {}, { preferPredictions = false } = {}) => {
  const times = GRUPOS_2026[grupo];
  const tabela = {};
  const jogosProcessados = [];
  times.forEach(time => {
    tabela[time] = {
      time,
      grupo,
      p: 0,
      j: 0,
      v: 0,
      e: 0,
      d: 0,
      gp: 0,
      gc: 0,
      sg: 0,
      conduta: getTeamConductScore(grupo, time, condutaGrupos)
    };
  });
  const jogosDoGrupo = jogos.filter(j => j.grupo === grupo);
  jogosDoGrupo.forEach(jogo => {
    const p = palpitesUsuario?.[jogo.id];
    const predictionFilled = p && p.placarA !== '' && p.placarB !== '';
    let gA = preferPredictions && predictionFilled ? p.placarA : jogo.placarA;
    let gB = preferPredictions && predictionFilled ? p.placarB : jogo.placarB;
    if (gA === '' || gB === '') {
      if (predictionFilled) { gA = p.placarA; gB = p.placarB; }
    }
    if (gA !== '' && gB !== '') {
      const pA = parseInt(gA), pB = parseInt(gB);
      jogosProcessados.push({ timeA: jogo.timeA, timeB: jogo.timeB, pA, pB });
      tabela[jogo.timeA].j++; tabela[jogo.timeA].gp += pA; tabela[jogo.timeA].gc += pB; tabela[jogo.timeA].sg += (pA - pB);
      tabela[jogo.timeB].j++; tabela[jogo.timeB].gp += pB; tabela[jogo.timeB].gc += pA; tabela[jogo.timeB].sg += (pB - pA);
      if (pA > pB) { tabela[jogo.timeA].v++; tabela[jogo.timeA].p += 3; tabela[jogo.timeB].d++; }
      else if (pB > pA) { tabela[jogo.timeB].v++; tabela[jogo.timeB].p += 3; tabela[jogo.timeA].d++; }
      else { tabela[jogo.timeA].e++; tabela[jogo.timeA].p += 1; tabela[jogo.timeB].e++; tabela[jogo.timeB].p += 1; }
    }
  });
  return ordenarTabelaGrupoFifa(Object.values(tabela), jogosProcessados);
};

const ordenarTerceirosFifa = (terceiros) => [...terceiros].sort((a, b) => compararCritBase(a, b));

const resolverConfrontosTerceiros = (melhoresTerceiros, slotsDisponiveis) => {
  const ordenados = ordenarTerceirosFifa(melhoresTerceiros);
  const gruposQualificados = ordenados
    .map((time) => time.grupo)
    .sort()
    .join('');
  const combinacaoOficial = THIRD_PLACE_ASSIGNMENTS[gruposQualificados];

  if (combinacaoOficial) {
    const terceiroPorGrupo = Object.fromEntries(
      ordenados.map((time) => [`3${time.grupo}`, time.time])
    );

    return Object.fromEntries(
      slotsDisponiveis
        .filter((slot) => combinacaoOficial[String(slot.id)])
        .map((slot) => [slot.id, terceiroPorGrupo[combinacaoOficial[String(slot.id)]] || null])
        .filter(([, time]) => Boolean(time))
    );
  }

  let solucao = null;
  const backtrack = (index, alocados, usados) => {
    if (solucao) return;
    if (index === slotsDisponiveis.length) { solucao = alocados; return; }
    const slot = slotsDisponiveis[index];
    if (!slot.refThirdGroups) {
      backtrack(index + 1, alocados, usados);
      return;
    }
    for (const timeAtual of ordenados) {
      if (usados.has(timeAtual.time)) continue;
      if (!slot.refThirdGroups.includes(timeAtual.grupo)) continue;
      const proximosUsados = new Set(usados);
      proximosUsados.add(timeAtual.time);
      backtrack(index + 1, { ...alocados, [slot.id]: timeAtual.time }, proximosUsados);
    }
  };
  backtrack(0, {}, new Set());
  return solucao || {};
};

const faseDeGruposCompleta = (jogos, palpitesUsuario) => jogos.every((jogo) => {
  if (placarPreenchido(jogo.placarA, jogo.placarB)) return true;
  const palpite = palpitesUsuario?.[jogo.id];
  return placarPreenchido(palpite?.placarA, palpite?.placarB);
});

const usuarioPreencheuTodosOsJogos = (jogos, palpitesUsuario) => userCompletedAllGames(jogos, palpitesUsuario);

const contarJogosPendentes = (jogos, palpitesUsuario) => countPendingGames(jogos, palpitesUsuario);

const usuarioPreencheuMataCompleta = (palpitesUsuario = {}) => (
  userCompletedKnockout(palpitesUsuario, KNOCKOUT_PHASE_LENGTHS)
);

const sanitizeSubmissionMap = (submissions = {}) => Object.fromEntries(
  Object.entries(submissions || {}).map(([userId, entry]) => {
    const normalizedEntry = mergeSubmissionEntry({}, entry);
    return [userId, normalizedEntry];
  })
);

const reconcileSubmissionState = ({ submissions = {}, matches = [], betsGames = {}, betsKnockout = {} }) => (
  reconcileSubmissionMap({
    submissions,
    matches,
    betsGames,
    betsKnockout,
    phaseLengths: KNOCKOUT_PHASE_LENGTHS
  })
);

const getR32Team = (ref, jogos, palpitesUsuario, condutaGrupos, gruposCompletos) => {
  if (!gruposCompletos) return "A definir";
  if (!ref) return "???";
  if (ref.length === 2) {
    const pos = parseInt(ref[0]);
    const grp = ref[1];
    const tabela = calcularTabelaGrupo(grp, jogos, palpitesUsuario, condutaGrupos, { preferPredictions: Boolean(palpitesUsuario) });
    return tabela[pos-1]?.time || "A definir";
  }
  return null;
};

const getThirdPlaceCandidate = (match, alocacaoTerceiros, gruposCompletos) => {
  if (!match.refThirdGroups) return null;
  if (!gruposCompletos) return "A definir";
  return alocacaoTerceiros[match.id] || `3º de ${match.refThirdGroups.join('/')}`;
};

const createEmptyKnockoutBracket = () => ({
  dezeszeseisavos: Array(MATA_MATA_CONFIG.r32.length).fill(''),
  oitavas: Array(MATA_MATA_CONFIG.r16.length).fill(''),
  quartas: Array(MATA_MATA_CONFIG.qf.length).fill(''),
  semis: Array(MATA_MATA_CONFIG.sf.length).fill(''),
  campeao: '',
  vice: '',
  terceiro: '',
  quarto: ''
});

const buildThirdPlaceAllocation = (jogos, palpitesUsuario, condutaGrupos, gruposCompletos = faseDeGruposCompleta(jogos, palpitesUsuario)) => {
  if (!gruposCompletos) return {};
  const tabelaGeral = {};
  Object.keys(GRUPOS_2026).forEach((grupo) => {
    tabelaGeral[grupo] = calcularTabelaGrupo(grupo, jogos, palpitesUsuario, condutaGrupos, { preferPredictions: Boolean(palpitesUsuario) });
  });
  const terceiros = [];
  Object.values(tabelaGeral).forEach((tabela) => {
    if (tabela[2]) terceiros.push(tabela[2]);
  });
  terceiros.sort((a, b) => compararCritBase(a, b));
  return resolverConfrontosTerceiros(
    terceiros.slice(0, 8),
    MATA_MATA_CONFIG.r32.filter((match) => match.refThirdGroups)
  );
};

const buildPlanilhaDemoData = () => {
  const matches = gerarJogosIniciais().map((match, index) => ({
    ...match,
    placarA: String((index + 2) % 4),
    placarB: String(index % 3),
    isFinal: true
  }));

  const users = [
    { id: 101, nome: 'Ana Turbo', senha: '123', role: 'participant', avatar: DEMO_AVATAR },
    { id: 102, nome: 'Beto Foguete', senha: '123', role: 'participant', avatar: DEMO_AVATAR },
    { id: ADMIN_USER_ID, nome: 'Admin', senha: 'qwer', role: 'admin', avatar: DEMO_AVATAR }
  ];

  const betsGames = { 101: {}, 102: {} };
  matches.forEach((match, index) => {
    const a = Number(match.placarA);
    const b = Number(match.placarB);
    betsGames[101][match.id] = index % 3 === 0
      ? { placarA: String(a), placarB: String(b) }
      : index % 3 === 1
        ? { placarA: String(a + 1), placarB: String(b + 1) }
        : { placarA: String(Math.max(0, b + 1)), placarB: String(Math.max(0, a - 1)) };
    betsGames[102][match.id] = index % 4 === 0
      ? { placarA: String(a), placarB: String(b) }
      : index % 4 === 1
        ? { placarA: String(a), placarB: String(Math.max(0, b + 2)) }
        : index % 4 === 2
          ? { placarA: String(a + 1), placarB: String(b) }
          : { placarA: String(Math.max(0, b)), placarB: String(Math.max(0, a)) };
  });

  const officialKnockout = {
    dezeszeseisavos: ['México', 'Canadá', 'Brasil', 'Alemanha', 'Holanda', 'Bélgica', 'Espanha', 'França', 'Argentina', 'Portugal', 'Inglaterra', 'EUA', 'Marrocos', 'Suíça', 'Croácia', 'Uruguai'],
    oitavas: ['México', 'Brasil', 'Holanda', 'França', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
    quartas: ['Brasil', 'França', 'Argentina', 'Uruguai'],
    semis: ['Brasil', 'Argentina'],
    campeao: 'Brasil',
    vice: 'Argentina',
    terceiro: 'França',
    quarto: 'Uruguai'
  };

  const betsKnockout = {
    101: {
      dezeszeseisavos: ['México', 'Canadá', 'Brasil', 'Alemanha', 'Holanda', 'Bélgica', 'Espanha', 'França', 'Argentina', 'Portugal', 'Inglaterra', 'EUA', 'Marrocos', 'Suíça', 'Croácia', 'Uruguai'],
      oitavas: ['México', 'Brasil', 'Holanda', 'França', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
      quartas: ['Brasil', 'França', 'Argentina', 'Uruguai'],
      semis: ['Brasil', 'Argentina'],
      campeao: 'Brasil',
      vice: 'Argentina',
      terceiro: 'França',
      quarto: 'Uruguai'
    },
    102: {
      dezeszeseisavos: ['México', 'Suíça', 'Brasil', 'Equador', 'Holanda', 'Egito', 'Espanha', 'Noruega', 'Argentina', 'Colômbia', 'Inglaterra', 'Paraguai', 'Marrocos', 'Canadá', 'Croácia', 'Uruguai'],
      oitavas: ['México', 'Brasil', 'Holanda', 'Noruega', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
      quartas: ['Brasil', 'Noruega', 'Argentina', 'Uruguai'],
      semis: ['Brasil', 'Uruguai'],
      campeao: 'Brasil',
      vice: 'Uruguai',
      terceiro: 'Argentina',
      quarto: 'Noruega'
    }
  };

  const submissions = {
    101: {
      jogosAt: new Date('2026-06-09T08:15:00Z').getTime(),
      mataAt: new Date('2026-06-09T08:40:00Z').getTime()
    },
    102: {
      jogosAt: new Date('2026-06-09T09:05:00Z').getTime(),
      mataAt: new Date('2026-06-09T09:25:00Z').getTime()
    }
  };

  return {
    users,
    matches,
    betsGames,
    betsKnockout,
    officialKnockout,
    submissions,
    conduct: {},
    adminUser: normalizeUser(users.find((user) => user.id === ADMIN_USER_ID))
  };
};

const createInitialAppState = () => ({
  users: [],
  matches: gerarJogosIniciais(),
  betsGames: {},
  betsKnockout: {},
  officialKnockout: {},
  officialResultsSyncStatus: {},
  officialResultsSyncHistory: [],
  conduct: {},
  submissions: {}
});

const buildStateDocument = ({
  users,
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions
}, { includeUpdatedAt = true } = {}) => ({
  schemaVersion: REMOTE_SCHEMA_VERSION,
  ...(includeUpdatedAt ? { updatedAt: Date.now() } : {}),
  usersById: Object.fromEntries(users.map((user) => [user.id, user])),
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions: reconcileSubmissionState({
    submissions,
    matches,
    betsGames,
    betsKnockout
  })
});

const buildStateSnapshot = (state) => JSON.stringify(buildStateDocument(state, { includeUpdatedAt: false }));

const buildRemoteUserIndexRecord = (user) => {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    nome: normalized.nome || '',
    nomeKey: normalized.nomeKey || normalizeUserNameKey(normalized.nome || ''),
    senha: normalized.senha || '',
    role: normalized.role || 'participant'
  };
};

const buildRemoteUserProfileRecord = (user) => ({
  avatar: user?.avatar || ''
});

const buildRemoteUsersIndex = (users = []) => Object.fromEntries(
  users.map((user) => {
    const normalized = normalizeUser(user);
    return [String(normalized.id), buildRemoteUserIndexRecord(normalized)];
  })
);

const parseRemotePayload = (payload) => {
  const fallback = createInitialAppState();
  if (!payload || typeof payload !== 'object') return fallback;

  const users = Object.values(payload.usersById || {}).map(normalizeUser);
  const normalizedGameData = normalizePersistedGameData(payload.matches, payload.betsGames);
  const betsKnockout = payload.betsKnockout || {};

  return {
    users,
    matches: Array.isArray(payload.matches) && payload.matches.length ? normalizedGameData.matches : fallback.matches,
    betsGames: normalizedGameData.betsGames,
    betsKnockout,
    officialKnockout: payload.officialKnockout || {},
    officialResultsSyncStatus: payload.officialResultsSyncStatus || {},
    officialResultsSyncHistory: Array.isArray(payload.officialResultsSyncHistory) ? payload.officialResultsSyncHistory : [],
    conduct: payload.conduct || {},
    submissions: reconcileSubmissionState({
      submissions: payload.submissions || {},
      matches: Array.isArray(payload.matches) && payload.matches.length ? normalizedGameData.matches : fallback.matches,
      betsGames: normalizedGameData.betsGames,
      betsKnockout
    })
  };
};

const getRemotePathUrl = (path) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${path}`;
const getRemoteUserShardPath = (prefix, userId) => `${prefix}/${userId}`;

const chooseSealedRecord = ({ liveRecord = {}, sealedRecord = null, hasSubmission = false, countFilled }) => {
  if (!sealedRecord || typeof sealedRecord !== 'object') {
    return liveRecord && typeof liveRecord === 'object' ? liveRecord : {};
  }

  const liveCount = countFilled(liveRecord || {});
  const sealedCount = countFilled(sealedRecord || {});

  if (hasSubmission || sealedCount >= liveCount) {
    return sealedRecord;
  }

  return liveRecord && typeof liveRecord === 'object' ? liveRecord : {};
};

const fetchRemoteEntry = async (path) => {
  const response = await fetch(getRemotePathUrl(path));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Falha ao ler base online (${response.status})`);
  return response.json();
};

const fetchLegacyRemoteState = async () => fetchRemoteEntry(REMOTE_LEGACY_STATE_PATH);

const fetchShardedRemoteState = async () => {
  const [metaDoc, usersIndexDoc, matchesDoc, officialKnockoutDoc, officialResultsSyncStatusDoc, officialResultsSyncHistoryDoc, conductDoc] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(REMOTE_PATHS.matches),
    fetchRemoteEntry(REMOTE_PATHS.officialKnockout),
    fetchRemoteEntry(REMOTE_PATHS.officialResultsSyncStatus),
    fetchRemoteEntry(REMOTE_PATHS.officialResultsSyncHistory),
    fetchRemoteEntry(REMOTE_PATHS.conduct)
  ]);

  const hasShardState = [metaDoc, usersIndexDoc, matchesDoc, officialKnockoutDoc, officialResultsSyncStatusDoc, officialResultsSyncHistoryDoc, conductDoc].some((entry) => entry !== null);
  if (!hasShardState) return null;

  const usersIndex = usersIndexDoc && typeof usersIndexDoc === 'object' && !Array.isArray(usersIndexDoc) ? usersIndexDoc : {};
  const userIds = Array.from(new Set([
    ...Object.keys(usersIndex),
    ...((metaDoc?.userIds || []).map((userId) => String(userId)))
  ]));

  const [userProfiles, betsGamesDocs, betsKnockoutDocs, sealedBetsGamesDocs, sealedBetsKnockoutDocs, submissionsDocs] = await Promise.all([
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.sealedBetsGames, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.sealedBetsKnockout, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, userId))))
  ]);

  const usersById = {};
  const betsGames = {};
  const betsKnockout = {};
  const submissions = {};

  userIds.forEach((userId, index) => {
    const userCore = usersIndex[userId];
    if (userCore) {
      usersById[userId] = normalizeUser({
        ...userCore,
        ...(userProfiles[index] || {})
      });
    }
    if (submissionsDocs[index] && typeof submissionsDocs[index] === 'object') {
      submissions[userId] = submissionsDocs[index];
    }

    const submissionEntry = submissions[userId] || {};
    const liveBetsGames = betsGamesDocs[index] && typeof betsGamesDocs[index] === 'object' ? betsGamesDocs[index] : {};
    const liveBetsKnockout = betsKnockoutDocs[index] && typeof betsKnockoutDocs[index] === 'object' ? betsKnockoutDocs[index] : {};
    const sealedBetsGames = sealedBetsGamesDocs[index] && typeof sealedBetsGamesDocs[index] === 'object' ? sealedBetsGamesDocs[index] : null;
    const sealedBetsKnockout = sealedBetsKnockoutDocs[index] && typeof sealedBetsKnockoutDocs[index] === 'object' ? sealedBetsKnockoutDocs[index] : null;

    betsGames[userId] = chooseSealedRecord({
      liveRecord: liveBetsGames,
      sealedRecord: sealedBetsGames,
      hasSubmission: Boolean(submissionEntry.jogosAt),
      countFilled: countFilledGameSelections
    });

    betsKnockout[userId] = chooseSealedRecord({
      liveRecord: liveBetsKnockout,
      sealedRecord: sealedBetsKnockout,
      hasSubmission: Boolean(submissionEntry.mataAt),
      countFilled: (record) => countFilledKnockoutSelections(record, KNOCKOUT_PHASE_LENGTHS)
    });
  });

  return {
    schemaVersion: metaDoc?.schemaVersion || REMOTE_SCHEMA_VERSION,
    updatedAt: metaDoc?.updatedAt || 0,
    usersById,
    matches: Array.isArray(matchesDoc) ? matchesDoc : [],
    betsGames,
    betsKnockout,
    officialKnockout: officialKnockoutDoc || {},
    officialResultsSyncStatus: officialResultsSyncStatusDoc || {},
    officialResultsSyncHistory: Array.isArray(officialResultsSyncHistoryDoc) ? officialResultsSyncHistoryDoc : [],
    conduct: conductDoc || {},
    submissions,
    __authoritative: {
      users: usersIndexDoc !== null,
      matches: matchesDoc !== null,
      officialKnockout: officialKnockoutDoc !== null,
      officialResultsSyncStatus: officialResultsSyncStatusDoc !== null,
      officialResultsSyncHistory: officialResultsSyncHistoryDoc !== null,
      conduct: conductDoc !== null
    }
  };
};

const mergeRemoteRecordMap = (baseMap = {}, overrideMap = {}) => ({
  ...(baseMap && typeof baseMap === 'object' ? baseMap : {}),
  ...(overrideMap && typeof overrideMap === 'object' ? overrideMap : {})
});

const mergeRemoteScopedRecordsByCompleteness = (legacyMap = {}, shardedMap = {}, countFilled = () => 0) => {
  const allUserIds = new Set([
    ...Object.keys(legacyMap || {}),
    ...Object.keys(shardedMap || {})
  ]);

  return Object.fromEntries(
    [...allUserIds].map((userId) => {
      const legacyRecord = legacyMap?.[userId];
      const shardedRecord = shardedMap?.[userId];

      if (!legacyRecord || typeof legacyRecord !== 'object') return [userId, shardedRecord || {}];
      if (!shardedRecord || typeof shardedRecord !== 'object') return [userId, legacyRecord || {}];

      const legacyCount = countFilled(legacyRecord || {});
      const shardedCount = countFilled(shardedRecord || {});

      return [userId, legacyCount > shardedCount ? legacyRecord : shardedRecord];
    })
  );
};

const mergeRemotePayloads = (legacyPayload, shardedPayload) => {
  if (!legacyPayload) return shardedPayload;
  if (!shardedPayload) return legacyPayload;

  const authoritative = shardedPayload.__authoritative || {};

  return {
    schemaVersion: shardedPayload.schemaVersion || legacyPayload.schemaVersion || REMOTE_SCHEMA_VERSION,
    updatedAt: Math.max(legacyPayload.updatedAt || 0, shardedPayload.updatedAt || 0),
    usersById: authoritative.users
      ? (shardedPayload.usersById || {})
      : mergeRemoteRecordMap(legacyPayload.usersById, shardedPayload.usersById),
    matches: authoritative.matches
      ? (Array.isArray(shardedPayload.matches) ? shardedPayload.matches : [])
      : (Array.isArray(shardedPayload.matches) && shardedPayload.matches.length ? shardedPayload.matches : legacyPayload.matches),
    betsGames: mergeRemoteScopedRecordsByCompleteness(
      legacyPayload.betsGames,
      shardedPayload.betsGames,
      countFilledGameSelections
    ),
    betsKnockout: mergeRemoteScopedRecordsByCompleteness(
      legacyPayload.betsKnockout,
      shardedPayload.betsKnockout,
      (record) => countFilledKnockoutSelections(record, KNOCKOUT_PHASE_LENGTHS)
    ),
    officialKnockout: authoritative.officialKnockout
      ? (shardedPayload.officialKnockout || {})
      : (shardedPayload.officialKnockout || legacyPayload.officialKnockout || {}),
    officialResultsSyncStatus: authoritative.officialResultsSyncStatus
      ? (shardedPayload.officialResultsSyncStatus || {})
      : (shardedPayload.officialResultsSyncStatus || legacyPayload.officialResultsSyncStatus || {}),
    officialResultsSyncHistory: authoritative.officialResultsSyncHistory
      ? (Array.isArray(shardedPayload.officialResultsSyncHistory) ? shardedPayload.officialResultsSyncHistory : [])
      : (Array.isArray(shardedPayload.officialResultsSyncHistory) && shardedPayload.officialResultsSyncHistory.length
        ? shardedPayload.officialResultsSyncHistory
        : (Array.isArray(legacyPayload.officialResultsSyncHistory) ? legacyPayload.officialResultsSyncHistory : [])),
    conduct: authoritative.conduct
      ? (shardedPayload.conduct || {})
      : (shardedPayload.conduct || legacyPayload.conduct || {}),
    submissions: mergeRemoteRecordMap(legacyPayload.submissions, shardedPayload.submissions)
  };
};

const fetchRemoteState = async () => {
  const [legacyPayload, shardedPayload] = await Promise.all([
    fetchLegacyRemoteState(),
    fetchShardedRemoteState()
  ]);

  return mergeRemotePayloads(legacyPayload, shardedPayload);
};

const fetchRemoteUpdatedAtMarker = async () => {
  const metaDoc = await fetchRemoteEntry(REMOTE_PATHS.meta);
  if (metaDoc?.updatedAt) {
    return {
      updatedAt: metaDoc.updatedAt,
      userIds: Array.isArray(metaDoc.userIds) ? metaDoc.userIds : []
    };
  }

  const legacyPayload = await fetchLegacyRemoteState();
  if (legacyPayload?.updatedAt) {
    return {
      updatedAt: legacyPayload.updatedAt,
      userIds: []
    };
  }

  return null;
};

const mergeRemoteState = (baseState, localState, { currentUserId = null, isAdmin = false } = {}) => {
  const baseUsers = Object.fromEntries((baseState.users || []).map((user) => [user.id, normalizeUser(user)]));
  const localUsers = Object.fromEntries((localState.users || []).map((user) => [user.id, normalizeUser(user)]));

  const mergedUsers = isAdmin
    ? Object.values(localUsers)
    : Object.values({
        ...baseUsers,
        ...(currentUserId ? { [currentUserId]: localUsers[currentUserId] || baseUsers[currentUserId] } : {})
      }).filter(Boolean);

  const mergeOwnedRecordMap = (baseMap = {}, localMap = {}) => {
    if (isAdmin) return { ...baseMap };
    const next = { ...baseMap };
    if (currentUserId && Object.prototype.hasOwnProperty.call(localMap || {}, currentUserId)) {
      next[currentUserId] = localMap[currentUserId];
    }
    return next;
  };

  const mergedSubmissions = (() => {
    if (isAdmin) return sanitizeSubmissionMap(baseState.submissions || {});
    const next = { ...(baseState.submissions || {}) };
    if (currentUserId) {
      next[currentUserId] = mergeSubmissionEntry(
        baseState.submissions?.[currentUserId],
        localState.submissions?.[currentUserId]
      );
    }
    return next;
  })();

  const mergedBetsKnockout = (() => {
    const next = mergeOwnedRecordMap(baseState.betsKnockout, localState.betsKnockout);
    if (!isAdmin && currentUserId) {
      const remoteBracket = normalizeKnockoutBracketShape(baseState.betsKnockout?.[currentUserId] || {}, KNOCKOUT_PHASE_LENGTHS);
      const localHasOwnBracket = Object.prototype.hasOwnProperty.call(localState.betsKnockout || {}, currentUserId);
      const localBracket = localHasOwnBracket
        ? normalizeKnockoutBracketShape(localState.betsKnockout?.[currentUserId] || {}, KNOCKOUT_PHASE_LENGTHS)
        : remoteBracket;
      const remoteSubmitted = Boolean(baseState.submissions?.[currentUserId]?.mataAt);
      const localSubmitted = Boolean(localState.submissions?.[currentUserId]?.mataAt);
      const remoteCount = countFilledKnockoutSelections(remoteBracket, KNOCKOUT_PHASE_LENGTHS);
      const localCount = countFilledKnockoutSelections(localBracket, KNOCKOUT_PHASE_LENGTHS);
      const sameBracket = JSON.stringify(remoteBracket) === JSON.stringify(localBracket);

      if (
        !localHasOwnBracket ||
        (remoteSubmitted && !sameBracket) ||
        (remoteCount > localCount && !localSubmitted)
      ) {
        next[currentUserId] = remoteBracket;
      } else {
        next[currentUserId] = localBracket;
      }
    }
    return next;
  })();

  const mergedBetsGames = (() => {
    const next = mergeOwnedRecordMap(baseState.betsGames, localState.betsGames);
    if (!isAdmin && currentUserId) {
      const remoteBets = baseState.betsGames?.[currentUserId] || {};
      const localHasOwnBets = Object.prototype.hasOwnProperty.call(localState.betsGames || {}, currentUserId);
      const localBets = localHasOwnBets ? (localState.betsGames?.[currentUserId] || {}) : remoteBets;
      const remoteSubmitted = Boolean(baseState.submissions?.[currentUserId]?.jogosAt);
      const localSubmitted = Boolean(localState.submissions?.[currentUserId]?.jogosAt);
      const remoteCount = countFilledGameSelections(remoteBets);
      const localCount = countFilledGameSelections(localBets);
      const sameBets = JSON.stringify(remoteBets) === JSON.stringify(localBets);

      if (
        !localHasOwnBets ||
        (remoteSubmitted && !sameBets) ||
        (remoteCount > localCount && !localSubmitted)
      ) {
        next[currentUserId] = remoteBets;
      } else {
        next[currentUserId] = localBets;
      }
    }
    return next;
  })();

  return {
    users: mergedUsers,
    matches: isAdmin ? (localState.matches || baseState.matches || gerarJogosIniciais()) : (baseState.matches || gerarJogosIniciais()),
    betsGames: mergedBetsGames,
    betsKnockout: mergedBetsKnockout,
    officialKnockout: isAdmin ? (localState.officialKnockout || baseState.officialKnockout || {}) : (baseState.officialKnockout || {}),
    conduct: isAdmin ? (localState.conduct || baseState.conduct || {}) : (baseState.conduct || {}),
    submissions: reconcileSubmissionState({
      submissions: mergedSubmissions,
      matches: isAdmin ? (localState.matches || baseState.matches || gerarJogosIniciais()) : (baseState.matches || gerarJogosIniciais()),
      betsGames: mergedBetsGames,
      betsKnockout: mergedBetsKnockout
    })
  };
};

const parseRemoteWriteError = async (response) => {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (payload?.error === 'Entry limit reached') {
    return 'A base online atingiu o limite do plano atual. Contas novas ou incompletas não conseguem sincronizar até liberar mais espaço.';
  }

  if (typeof payload?.message === 'string' && payload.message.trim()) {
    return `Falha ao gravar base online (${response.status}): ${payload.message}`;
  }

  return `Falha ao gravar base online (${response.status})`;
};

const writeRemoteEntry = async (path, payload) => {
  const response = await fetch(getRemotePathUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(await parseRemoteWriteError(response));
  }
};

const writeRemoteAdminSharedState = async (state) => {
  const updatedAt = Date.now();
  const currentMeta = await fetchRemoteEntry(REMOTE_PATHS.meta);
  const currentUserIds = Array.isArray(currentMeta?.userIds)
    ? currentMeta.userIds
    : (state.users || []).map((user) => normalizeUser(user).id);

  await Promise.all([
    writeRemoteEntry(REMOTE_PATHS.matches, state.matches || []),
    writeRemoteEntry(REMOTE_PATHS.officialKnockout, state.officialKnockout || {}),
    writeRemoteEntry(REMOTE_PATHS.conduct, state.conduct || {})
  ]);

  await writeRemoteEntry(REMOTE_PATHS.meta, {
    schemaVersion: REMOTE_SCHEMA_VERSION,
    updatedAt,
    userIds: currentUserIds
  });

  return updatedAt;
};

const writeRemoteState = async (state, { currentUserId = null, isAdmin = false } = {}) => {
  const normalizedUsers = (state.users || []).map(normalizeUser);
  const reconciledSubmissions = reconcileSubmissionState({
    submissions: state.submissions || {},
    matches: state.matches || [],
    betsGames: state.betsGames || {},
    betsKnockout: state.betsKnockout || {}
  });
  const updatedAt = Date.now();
  const metaEntry = [
    REMOTE_PATHS.meta,
    {
      schemaVersion: REMOTE_SCHEMA_VERSION,
      updatedAt,
      userIds: normalizedUsers.map((user) => user.id)
    }
  ];
  const entries = [
    [REMOTE_PATHS.usersIndex, buildRemoteUsersIndex(normalizedUsers)]
  ];

  if (isAdmin || !currentUserId) {
    entries.push(
      [REMOTE_PATHS.matches, state.matches || []],
      [REMOTE_PATHS.officialKnockout, state.officialKnockout || {}],
      [REMOTE_PATHS.conduct, state.conduct || {}]
    );
  }

  if (!isAdmin || !currentUserId) {
    const scopedUserIds = currentUserId ? [currentUserId] : normalizedUsers.map((user) => user.id);
    scopedUserIds.forEach((userId) => {
      const normalizedId = String(userId);
      const user = normalizedUsers.find((candidate) => String(candidate.id) === normalizedId);
      if (!user) return;

      const jogosEnviadosAt = reconciledSubmissions?.[userId]?.[SUBMISSION_FIELDS.JOGOS] || 0;
      const mataEnviadosAt = reconciledSubmissions?.[userId]?.[SUBMISSION_FIELDS.MATA] || 0;

      entries.push(
        [getRemoteUserShardPath(REMOTE_PATHS.userProfiles, normalizedId), buildRemoteUserProfileRecord(user)],
        [getRemoteUserShardPath(REMOTE_PATHS.betsGames, normalizedId), state.betsGames?.[userId] || {}],
        [getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, normalizedId), state.betsKnockout?.[userId] || {}],
        [getRemoteUserShardPath(REMOTE_PATHS.submissions, normalizedId), reconciledSubmissions?.[userId] || {}]
      );

      if (jogosEnviadosAt) {
        entries.push([
          getRemoteUserShardPath(REMOTE_PATHS.sealedBetsGames, normalizedId),
          state.betsGames?.[userId] || {}
        ]);
      }

      if (mataEnviadosAt) {
        entries.push([
          getRemoteUserShardPath(REMOTE_PATHS.sealedBetsKnockout, normalizedId),
          state.betsKnockout?.[userId] || {}
        ]);
      }
    });
  }

  await Promise.all(entries.map(([path, payload]) => writeRemoteEntry(path, payload)));
  // `meta.updatedAt` funciona como marcador de commit: grava por ultimo para nao anunciar
  // um estado novo antes de os documentos de jogos/gabarito ficarem visiveis.
  await writeRemoteEntry(metaEntry[0], metaEntry[1]);
  return updatedAt;
};

const syncRemoteStateWithPatch = async (localState, options = {}) => {
  if (options.scope === 'admin-shared' && options.isAdmin) {
    const updatedAt = await writeRemoteAdminSharedState(localState);
    return { mergedState: localState, updatedAt };
  }

  const remotePayload = await fetchRemoteState();
  const mergedState = mergeRemoteState(
    remotePayload ? parseRemotePayload(remotePayload) : createInitialAppState(),
    localState,
    options
  );
  const updatedAt = await writeRemoteState(mergedState, options);
  return { mergedState, updatedAt };
};

const normalizePendingSync = (pending) => {
  if (!pending || typeof pending !== 'object' || !pending.state || typeof pending.state !== 'object') {
    return null;
  }

  return pending;
};

const readPendingSync = () => {
  try {
    return normalizePendingSync(JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || 'null'));
  } catch {
    return null;
  }
};

const savePendingSync = (pending) => {
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify({
    ...pending,
    savedAt: Date.now()
  }));
};

const clearPendingSync = () => {
  localStorage.removeItem(PENDING_SYNC_KEY);
};

const clearPendingSyncIfSnapshot = (snapshot) => {
  if (!snapshot) {
    clearPendingSync();
    return;
  }

  const currentPending = readPendingSync();
  if (currentPending?.snapshot === snapshot) {
    clearPendingSync();
  }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
  reader.readAsDataURL(file);
});

const getSerializedSize = (value) => new TextEncoder().encode(String(value || '')).length;

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
  image.src = src;
});

const processAvatarFile = async (file) => {
  if (!file) throw new Error('Selecione um arquivo JPG ou PNG.');
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Use apenas JPG ou PNG.');
  }
  if (file.size > AVATAR_MAX_FILE_BYTES) {
    throw new Error('O arquivo precisa ter no máximo 2 MB.');
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.88;
  let output = canvas.toDataURL('image/webp', quality);

  while (getSerializedSize(output) > AVATAR_MAX_OUTPUT_BYTES && quality > 0.45) {
    quality -= 0.08;
    output = canvas.toDataURL('image/webp', quality);
  }

  if (getSerializedSize(output) > AVATAR_MAX_OUTPUT_BYTES) {
    throw new Error('A imagem ficou grande demais mesmo após compactar.');
  }

  return output;
};

const uploadAvatarAsset = async ({ dataUrl, userId, userName }) => {
  if (!dataUrl) return { avatar: '', avatarKey: '' };
  if (!AVATAR_UPLOAD_URL) {
    return { avatar: dataUrl, avatarKey: '' };
  }

  const response = await fetch(AVATAR_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userName,
      contentType: 'image/webp',
      fileName: `avatar-${userId || Date.now()}.webp`,
      imageDataUrl: dataUrl
    })
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar imagem (${response.status})`);
  }

  const payload = await response.json();
  const avatarUrl = payload.avatarUrl
    || payload.url
    || (payload.key && AVATAR_PUBLIC_BASE_URL ? `${AVATAR_PUBLIC_BASE_URL.replace(/\/$/, '')}/${payload.key}` : '');

  if (!avatarUrl) {
    throw new Error('Upload concluído sem URL do avatar.');
  }

  return {
    avatar: avatarUrl,
    avatarKey: payload.avatarKey || payload.key || ''
  };
};

const normalizeUserNameKey = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeUser = (user) => {
  if (!user) return user;
  const nome = user.nome || '';
  const nomeKey = user.nomeKey || normalizeUserNameKey(nome);
  const role = user.role || ((user.id === ADMIN_USER_ID || nomeKey === 'admin') ? 'admin' : 'participant');
  return { ...user, nomeKey, role, avatar: user.avatar || '' };
};

const isAdminUser = (user) => user?.role === 'admin' || user?.id === ADMIN_USER_ID;
const findUserByName = (users, inputName) => users.find((user) => user.nomeKey === normalizeUserNameKey(inputName));

const InstallGuideCard = () => (
  <div className={`${GLASS_CARD} overflow-hidden`}>
    <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 to-cyan-50 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-sky-100 bg-white p-2.5 text-sky-600 shadow-sm">
          <Smartphone size={18} />
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">Instalar no celular</div>
          <div className="mt-1 text-sm font-semibold text-slate-900">Abra como app na tela inicial</div>
        </div>
      </div>
    </div>
    <div className="grid gap-4 p-5 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">iPhone / iPad</div>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          {INSTALLATION_TIPS.ios.map((tip, index) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-0.5 text-sky-600">{index + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Android</div>
        <ol className="mt-3 space-y-2 text-sm text-slate-700">
          {INSTALLATION_TIPS.android.map((tip, index) => (
            <li key={tip} className="flex gap-2">
              <span className="mt-0.5 text-sky-600">{index + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

const LoginScreen = ({ onLogin, onRefreshUsers, users, syncStatus = 'online', syncError = '', isDemoMode = false }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !password.trim()) { setError('Preencha nome e senha'); return; }
    if (normalizeUserNameKey(name) === 'admin') {
      if (password === 'qwer') { onLogin(999, 'Admin', 'qwer'); return; } 
      else { setError('Senha de Administrador incorreta.'); return; }
    }

    let availableUsers = users;
    let existingUser = findUserByName(availableUsers, name);

    if ((!existingUser || isRegistering) && onRefreshUsers) {
      setAuthLoading(true);
      try {
        availableUsers = await onRefreshUsers();
        existingUser = findUserByName(availableUsers, name);
      } catch (refreshError) {
        setError(refreshError.message || 'Não foi possível atualizar a lista de usuários.');
        setAuthLoading(false);
        return;
      }
      setAuthLoading(false);
    }

    if (isRegistering) {
      if (existingUser) {
        setError('Nome já existe. Tente fazer login.');
      } else {
        const newUserId = Date.now();
        setAuthLoading(true);
        try {
          const uploadedAvatar = avatarPreview
            ? await uploadAvatarAsset({ dataUrl: avatarPreview, userId: newUserId, userName: name.trim() })
            : { avatar: '', avatarKey: '' };

          onLogin(newUserId, name.trim(), password.trim(), {
            avatar: uploadedAvatar.avatar,
            avatarKey: uploadedAvatar.avatarKey
          });
        } catch (uploadError) {
          setError(uploadError.message || 'Não foi possível enviar a imagem.');
        } finally {
          setAuthLoading(false);
        }
      }
    } else {
      if (existingUser) {
        if (existingUser.senha === password.trim()) { onLogin(existingUser.id, existingUser.nome, existingUser.senha, existingUser); } 
        else { setError('Senha incorreta.'); }
      } else { setError('Usuário não encontrado. Crie uma conta.'); }
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setAvatarLoading(true);
    setError('');

    try {
      const avatar = await processAvatarFile(file);
      setAvatarPreview(avatar);
    } catch (avatarError) {
      setError(avatarError.message || 'Não foi possível preparar a imagem.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-6 text-slate-900 font-sans sm:px-6">
      <div className="w-full max-w-md space-y-4">
      <div className={`${GLASS_CARD} w-full p-6 md:p-8 relative overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_70%)]"></div>
        <div className="flex justify-center mb-6">
          <div className="bg-sky-50 p-4 rounded-full shadow-inner border border-sky-100">
            <Trophy size={40} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight text-slate-900">BOLÃO 2026</h1>
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle size={16} />
          Entrar no grupo do WhatsApp
        </a>
        {!isDemoMode && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-700">Base online</span>
              <span className={`text-[11px] font-bold ${
                syncStatus === 'online'
                  ? 'text-emerald-600'
                  : syncStatus === 'syncing' || syncStatus === 'connecting'
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }`}>
                {syncStatus === 'online' && 'Online'}
                {syncStatus === 'syncing' && 'Sincronizando'}
                {syncStatus === 'connecting' && 'Conectando'}
                {syncStatus === 'offline' && 'Falha de sync'}
              </span>
            </div>
            {syncError && <div className="mt-2 text-[11px] text-rose-600">{syncError}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Nome de Usuário</label>
            <div className="relative"><User size={18} className={`absolute left-3.5 top-4 ${TEXT_MUTED}`} /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Fera Braba" className={`${GLASS_INPUT} min-h-13 w-full pl-11 p-3.5 text-base`}/></div>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Senha</label>
            <div className="relative"><Lock size={18} className={`absolute left-3.5 top-4 ${TEXT_MUTED}`} /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha secreta" className={`${GLASS_INPUT} min-h-13 w-full pl-11 pr-12 p-3.5 text-base`}/><button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3.5 top-3.5 rounded-full p-1 hover:text-slate-800 transition-colors ${TEXT_MUTED}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {isRegistering && (
            <div className="space-y-3">
              <label className={`text-[10px] font-bold uppercase ml-1 block ${TEXT_MUTED}`}>Imagem do Perfil</label>
              <div className="flex items-center gap-3">
                <AvatarBadge user={{ nome: name || 'Novo usuário', avatar: avatarPreview }} size="lg" />
                <div className="flex-1">
                  <label className={`${GLASS_BTN_SECONDARY} flex min-h-12 cursor-pointer items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest`}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarChange} />
                    {avatarLoading ? 'Processando...' : avatarPreview ? 'Trocar imagem' : 'Escolher imagem'}
                  </label>
                  <p className={`mt-2 text-[11px] ${TEXT_MUTED}`}>JPG ou PNG, até 2 MB.</p>
                </div>
              </div>
            </div>
          )}
          {error && <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-200"><AlertCircle size={14} /> {error}</div>}
          <button type="submit" disabled={authLoading} className={`${GLASS_BTN_PRIMARY} w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}>{authLoading ? 'Verificando...' : isRegistering ? 'Criar Conta' : 'Entrar'} <ArrowRight size={18} /></button>
        </form>
        <div className="mt-8 text-center"><button onClick={() => { setIsRegistering(!isRegistering); setError(''); setAvatarPreview(''); }} className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 hover:decoration-slate-700">{isRegistering ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Criar nova.'}</button></div>
      </div>
      <InstallGuideCard />
      </div>
    </div>
  );
};

export default function App() {
  const isDemoMode = useMemo(() => new URLSearchParams(window.location.search).get('demo') === 'planilha', []);
  const [currentUser, setCurrentUser] = useState(null); 
  const [abaAtiva, setAbaAtiva] = useState('jogos');
  const [secaoExpandida, setSecaoExpandida] = useState('r32');
  const [alocacaoTerceiros, setAlocacaoTerceiros] = useState({});
  const [userDeleteConfirmId, setUserDeleteConfirmId] = useState(null);
  const [reviewMode, setReviewMode] = useState('jogos');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewGroupFilter, setReviewGroupFilter] = useState('todos');
  const [reviewGameSort, setReviewGameSort] = useState('date');
  const [reviewPhaseFilter, setReviewPhaseFilter] = useState('todos');
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isDemoMode ? 'demo' : 'connecting');
  const [syncError, setSyncError] = useState('');
  const avatarInputRef = useRef(null);
  const timelineMatchRefs = useRef({});
  const remoteReadyRef = useRef(false);
  const remoteUpdatedAtRef = useRef(0);
  const skipNextRemoteSyncRef = useRef(false);
  const remoteSnapshotRef = useRef('');
  const pendingSyncTimeoutRef = useRef(null);
  const syncInFlightRef = useRef(false);
  const latestLocalSnapshotRef = useRef('');
  const nextSyncScopeRef = useRef(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    const setupServiceWorker = async () => {
      try {
        if (!localStorage.getItem(PWA_RESET_KEY)) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations
              .filter((registration) => registration.scope.includes(window.location.origin))
              .map((registration) => registration.unregister())
          );

          if ('caches' in window) {
            const cacheKeys = await caches.keys();
            await Promise.all(
              cacheKeys
                .filter((key) => key.startsWith('bolao2026-pwa-'))
                .map((key) => caches.delete(key))
            );
          }

          localStorage.setItem(PWA_RESET_KEY, 'done');
        }

        const registration = await navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
          scope: import.meta.env.BASE_URL
        });
        registration.update().catch(() => {});
      } catch (error) {
        console.error('Falha ao registrar service worker', error);
      }
    };

    setupServiceWorker();

    return undefined;
  }, []);

  const [bootstrapState] = useState(() => {
    const savedUsers = JSON.parse(localStorage.getItem('bolao26_users')) || [];
    const savedMatches = JSON.parse(localStorage.getItem('bolao26_matches')) || [];
    const savedBetsGames = JSON.parse(localStorage.getItem('bolao26_bets_games')) || {};
    const normalizedGameData = normalizePersistedGameData(savedMatches, savedBetsGames);

    return {
      users: savedUsers.map(normalizeUser),
      matches: savedMatches.length ? normalizedGameData.matches : gerarJogosIniciais(),
      betsGames: savedMatches.length ? normalizedGameData.betsGames : savedBetsGames
    };
  });

  const [usuarios, setUsuarios] = useState(() => bootstrapState.users);
  const [jogosReais, setJogosReais] = useState(() => bootstrapState.matches);
  const [palpitesJogos, setPalpitesJogos] = useState(() => bootstrapState.betsGames);
  const [palpitesMataMata, setPalpitesMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_bets_knockout_v2')) || {});
  const [gabaritoMataMata, setGabaritoMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_official_knockout_v2')) || {});
  const [officialResultsSyncStatus, setOfficialResultsSyncStatus] = useState(() => bootstrapState.officialResultsSyncStatus || {});
  const [officialResultsSyncHistory, setOfficialResultsSyncHistory] = useState(() => bootstrapState.officialResultsSyncHistory || []);
  const [condutaGrupos, setCondutaGrupos] = useState(() => JSON.parse(localStorage.getItem('bolao26_group_conduct')) || {});
  const [submissoes, setSubmissoes] = useState(() => JSON.parse(localStorage.getItem('bolao26_submissions')) || {});
  const [adminMatchDrafts, setAdminMatchDrafts] = useState({});

  useEffect(() => { localStorage.setItem('bolao26_users', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('bolao26_matches', JSON.stringify(jogosReais)); }, [jogosReais]);
  useEffect(() => { localStorage.setItem('bolao26_bets_games', JSON.stringify(palpitesJogos)); }, [palpitesJogos]);
  useEffect(() => { localStorage.setItem('bolao26_bets_knockout_v2', JSON.stringify(palpitesMataMata)); }, [palpitesMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_official_knockout_v2', JSON.stringify(gabaritoMataMata)); }, [gabaritoMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_group_conduct', JSON.stringify(condutaGrupos)); }, [condutaGrupos]);
  useEffect(() => { localStorage.setItem('bolao26_submissions', JSON.stringify(submissoes)); }, [submissoes]);
  useEffect(() => {
    setAdminMatchDrafts(Object.fromEntries(
      jogosReais.map((match) => [match.id, {
        placarA: match.placarA ?? '',
        placarB: match.placarB ?? ''
      }])
    ));
  }, [jogosReais]);

  const applyAppState = (nextState, nextUpdatedAt = Date.now()) => {
    skipNextRemoteSyncRef.current = true;
    setUsuarios((nextState.users || []).map(normalizeUser));
    setJogosReais(nextState.matches || gerarJogosIniciais());
    setPalpitesJogos(nextState.betsGames || {});
    setPalpitesMataMata(nextState.betsKnockout || {});
    setGabaritoMataMata(nextState.officialKnockout || {});
    setOfficialResultsSyncStatus(nextState.officialResultsSyncStatus || {});
    setOfficialResultsSyncHistory(Array.isArray(nextState.officialResultsSyncHistory) ? nextState.officialResultsSyncHistory : []);
    setCondutaGrupos(nextState.conduct || {});
    setSubmissoes(nextState.submissions || {});
    remoteUpdatedAtRef.current = nextUpdatedAt;
    remoteSnapshotRef.current = buildStateSnapshot({
      users: (nextState.users || []).map(normalizeUser),
      matches: nextState.matches || gerarJogosIniciais(),
      betsGames: nextState.betsGames || {},
      betsKnockout: nextState.betsKnockout || {},
      officialKnockout: nextState.officialKnockout || {},
      conduct: nextState.conduct || {},
      submissions: nextState.submissions || {}
    });
    setCurrentUser((current) => {
      if (!current) return current;
      const updatedUser = (nextState.users || []).find((user) => user.id === current.id);
      return updatedUser ? normalizeUser(updatedUser) : current;
    });
  };

  const getCurrentLocalState = () => ({
    users: usuarios,
    matches: jogosReais,
    betsGames: palpitesJogos,
    betsKnockout: palpitesMataMata,
    officialKnockout: gabaritoMataMata,
    conduct: condutaGrupos,
    submissions: submissoes
  });

  const schedulePendingSyncFlush = (delay = SYNC_DEBOUNCE_MS) => {
    if (pendingSyncTimeoutRef.current) {
      window.clearTimeout(pendingSyncTimeoutRef.current);
    }

    pendingSyncTimeoutRef.current = window.setTimeout(() => {
      pendingSyncTimeoutRef.current = null;
      flushPendingSync();
    }, delay);
  };

  useEffect(() => {
    if (!isDemoMode) return;
    const demo = buildPlanilhaDemoData();
    applyAppState({
      users: demo.users,
      matches: demo.matches,
      betsGames: demo.betsGames,
      betsKnockout: demo.betsKnockout,
      officialKnockout: demo.officialKnockout,
      conduct: demo.conduct,
      submissions: demo.submissions
    });
    setCurrentUser(demo.adminUser);
    setAbaAtiva('painel');
    setReviewMode('jogos');
    setReviewSearch('');
    setReviewGroupFilter('todos');
    setReviewPhaseFilter('todos');
    setSyncStatus('demo');
  }, [isDemoMode]);

  useEffect(() => {
    const nextState = getCurrentLocalState();
    latestLocalSnapshotRef.current = buildStateSnapshot(nextState);
  }, [usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata, condutaGrupos, submissoes]);

  const flushPendingSync = async () => {
    if (isDemoMode || syncInFlightRef.current) return;
    const pending = readPendingSync();
    if (!pending?.state) return;

    const flushedSnapshot = pending.snapshot || buildStateSnapshot(pending.state);
    syncInFlightRef.current = true;
    let shouldRetryImmediately = false;

    try {
      setSyncStatus('syncing');
      setSyncError('');
      const syncResult = await syncRemoteStateWithPatch(pending.state, pending.options || {});
      const latestPending = readPendingSync();
      const hasNewerPending = Boolean(latestPending?.snapshot && latestPending.snapshot !== flushedSnapshot);
      const localChangedSinceFlush = Boolean(
        latestLocalSnapshotRef.current &&
        latestLocalSnapshotRef.current !== flushedSnapshot
      );

      if (!hasNewerPending && !localChangedSinceFlush) {
        clearPendingSyncIfSnapshot(flushedSnapshot);
        applyAppState(syncResult.mergedState || pending.state, syncResult.updatedAt || Date.now());
        setSyncStatus('online');
      } else {
        shouldRetryImmediately = true;
      }
    } catch (error) {
      setSyncStatus('offline');
      setSyncError(error.message || 'Falha ao salvar dados online.');
    } finally {
      syncInFlightRef.current = false;
      if (shouldRetryImmediately) {
        schedulePendingSyncFlush(SYNC_IMMEDIATE_RETRY_MS);
      }
    }
  };

  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;

    const bootstrapRemoteState = async () => {
      try {
        setSyncStatus('connecting');
        setSyncError('');
        const remotePayload = await fetchRemoteState();
        if (cancelled) return;

        if (!remotePayload) {
          const initialState = mergeRemoteState(createInitialAppState(), {
            users: bootstrapState.users,
            matches: bootstrapState.matches,
            betsGames: bootstrapState.betsGames,
            betsKnockout: JSON.parse(localStorage.getItem('bolao26_bets_knockout_v2')) || {},
            officialKnockout: JSON.parse(localStorage.getItem('bolao26_official_knockout_v2')) || {},
            conduct: JSON.parse(localStorage.getItem('bolao26_group_conduct')) || {},
            submissions: JSON.parse(localStorage.getItem('bolao26_submissions')) || {}
          });
          const initialUpdatedAt = await writeRemoteState(initialState);
          if (cancelled) return;
          applyAppState(initialState, initialUpdatedAt);
          remoteReadyRef.current = true;
          setSyncStatus('online');
          if (readPendingSync()) flushPendingSync();
          return;
        }

        const nextRemoteState = parseRemotePayload(remotePayload);
        const pendingSync = readPendingSync();
        remoteReadyRef.current = true;

        if (pendingSync) {
          const remoteSnapshot = buildStateSnapshot(nextRemoteState);
          if (pendingSync.snapshot && pendingSync.snapshot === remoteSnapshot) {
            clearPendingSync();
            applyAppState(nextRemoteState, remotePayload.updatedAt || Date.now());
            setSyncStatus('online');
            return;
          }

          await flushPendingSync();
          return;
        }

        applyAppState(nextRemoteState, remotePayload.updatedAt || Date.now());
        setSyncStatus('online');
      } catch (error) {
        if (cancelled) return;
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao conectar com a base online.');
      }
    };

    bootstrapRemoteState();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode || !remoteReadyRef.current) return;

    const intervalId = window.setInterval(async () => {
      try {
        if (readPendingSync()) return;
        const remoteMarker = await fetchRemoteUpdatedAtMarker();
        if (!remoteMarker) return;
        const remoteUpdatedAt = remoteMarker.updatedAt || 0;
        if (remoteUpdatedAt <= remoteUpdatedAtRef.current) return;
        const remotePayload = await fetchRemoteState();
        if (!remotePayload) return;
        applyAppState(parseRemotePayload(remotePayload), remoteUpdatedAt);
        setSyncStatus('online');
        setSyncError('');
      } catch (error) {
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao atualizar dados online.');
      }
    }, REMOTE_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return undefined;

    const handleOnline = () => { flushPendingSync(); };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') flushPendingSync();
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDemoMode]);

  const modoAdmin = isAdminUser(currentUser); 

  useEffect(() => {
    if (isDemoMode || !remoteReadyRef.current) return;
    if (skipNextRemoteSyncRef.current) {
      skipNextRemoteSyncRef.current = false;
      return;
    }

    const nextState = getCurrentLocalState();
    const snapshot = buildStateSnapshot(nextState);

    if (snapshot === remoteSnapshotRef.current) return;

    const pending = {
      state: nextState,
      options: {
        currentUserId: currentUser?.id || null,
        isAdmin: modoAdmin,
        scope: nextSyncScopeRef.current || null
      },
      snapshot
    };

    nextSyncScopeRef.current = null;
    savePendingSync(pending);
    schedulePendingSyncFlush(pending.options.scope === 'admin-shared' ? 220 : SYNC_DEBOUNCE_MS);

    return () => {
      if (pendingSyncTimeoutRef.current) {
        window.clearTimeout(pendingSyncTimeoutRef.current);
        pendingSyncTimeoutRef.current = null;
      }
    };
  }, [isDemoMode, usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata, condutaGrupos, submissoes]);

  const palpitesUsuarioAtual = currentUser ? palpitesJogos[currentUser.id] : undefined;
  const palpitesMataUsuarioAtual = currentUser ? (palpitesMataMata[currentUser.id] || {}) : {};
  const gruposCompletos = currentUser ? faseDeGruposCompleta(jogosReais, modoAdmin ? undefined : palpitesUsuarioAtual) : false;
  const jogosCompletosUsuarioAtual = Boolean(currentUser && gruposCompletos);
  const jogosEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.JOGOS] : null;
  const mataEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.MATA] : null;
  const mataCompletaUsuarioAtual = usuarioPreencheuMataCompleta(palpitesMataUsuarioAtual);
  const mataConcluidaUsuarioAtual = Boolean(currentUser && mataCompletaUsuarioAtual);
  const palpitesTravadosJogos = !modoAdmin && Boolean(jogosEnviadosAt);
  const palpitesTravadosMata = !modoAdmin && Boolean(mataEnviadosAt);
  const jogosPendentesUsuario = currentUser ? contarJogosPendentes(jogosReais, palpitesUsuarioAtual) : 0;
  const currentUserCanSeeConsensusPanel = modoAdmin || (jogosCompletosUsuarioAtual && mataConcluidaUsuarioAtual);
  const participanteUsuarios = useMemo(
    () => usuarios.filter((user) => !isAdminUser(user)),
    [usuarios]
  );
  const matchResultSummary = useMemo(
    () => countResolvedMatchesByVariant(jogosReais),
    [jogosReais]
  );
  const ranking = useMemo(() => {
    const rankingEntries = usuarios.filter((user) => !isAdminUser(user)).map((user) => {
      let ptsJogos = 0;
      let ptsMataMata = 0;
      let exatos = 0;

      jogosReais.forEach((jogo) => {
        if (jogo.placarA !== '' && jogo.placarB !== '') {
          const aposta = palpitesJogos[user.id]?.[jogo.id];
          if (aposta && aposta.placarA !== '' && aposta.placarB !== '') {
            const res = calcularPontosJogo(aposta.placarA, aposta.placarB, jogo.placarA, jogo.placarB);
            if (res) {
              ptsJogos += res.pts;
              if (res.pts === PONTOS.JOGO.CHEIO) exatos++;
            }
          }
        }
      });

      const userMM = palpitesMataMata[user.id] || {};
      if (gabaritoMataMata.campeao && userMM.campeao === gabaritoMataMata.campeao) ptsMataMata += PONTOS.MATA.CAMPEAO;
      if (gabaritoMataMata.vice && userMM.vice === gabaritoMataMata.vice) ptsMataMata += PONTOS.MATA.VICE;
      if (gabaritoMataMata.terceiro && userMM.terceiro === gabaritoMataMata.terceiro) ptsMataMata += PONTOS.MATA.TOP3;
      if (gabaritoMataMata.quarto && userMM.quarto === gabaritoMataMata.quarto) ptsMataMata += PONTOS.MATA.TOP4;

      const checkPhase = (field, points) => {
        const official = gabaritoMataMata[field] || [];
        const userBet = userMM[field] || [];
        userBet.forEach((betTeam) => {
          if (betTeam && official.includes(betTeam)) ptsMataMata += points;
        });
      };

      checkPhase('semis', PONTOS.MATA.SF);
      checkPhase('quartas', PONTOS.MATA.QF);
      checkPhase('oitavas', PONTOS.MATA.R16);
      checkPhase('dezeszeseisavos', PONTOS.MATA.R32);

      return { ...user, ptsJogos, ptsMataMata, total: ptsJogos + ptsMataMata, exatos };
    });

    return buildDenseRanking(rankingEntries, (user) => user.total, (user) => user.nome);
  }, [usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata]);
  const homeInsightCard = useMemo(() => {
    if (!currentUser || modoAdmin) return null;

    return buildUserHomeInsights({
      currentUserId: currentUser.id,
      users: participanteUsuarios,
      matches: jogosReais,
      predictions: palpitesJogos,
      ranking,
      scoringRules: PONTOS,
      unlocked: currentUserCanSeeConsensusPanel,
      pendingGroupPicksCount: jogosPendentesUsuario,
      knockoutComplete: mataCompletaUsuarioAtual,
      officialKnockout: gabaritoMataMata,
      knockoutPredictions: palpitesMataUsuarioAtual
    });
  }, [
    currentUser,
    modoAdmin,
    participanteUsuarios,
    jogosReais,
    palpitesJogos,
    ranking,
    currentUserCanSeeConsensusPanel,
    jogosPendentesUsuario,
    palpitesMataUsuarioAtual,
    mataCompletaUsuarioAtual,
    gabaritoMataMata
  ]);
  const editorialStatsDashboard = useMemo(() => {
    if (!currentUser || !currentUserCanSeeConsensusPanel) return null;

    return buildEditorialStatsDashboard({
      users: usuarios,
      submissions: submissoes,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      games: jogosReais,
      ranking,
      teamRankings: TEAM_FIFA_RANKINGS,
      submissionFields: SUBMISSION_FIELDS,
      isAdminUser,
      usuarioPreencheuTodosOsJogos,
      usuarioPreencheuMataCompleta
    });
  }, [
    currentUser,
    currentUserCanSeeConsensusPanel,
    usuarios,
    submissoes,
    palpitesJogos,
    palpitesMataMata,
    jogosReais,
    ranking
  ]);
  const homeEditorialInsights = useMemo(() => {
    if (!currentUser) return null;
    return buildHomeEditorialInsights({
      dashboard: editorialStatsDashboard,
      canRevealComparisons: currentUserCanSeeConsensusPanel,
      isAdminViewer: modoAdmin
    });
  }, [editorialStatsDashboard, currentUser, currentUserCanSeeConsensusPanel, modoAdmin]);
  const consensusDashboard = useMemo(() => {
    if (!currentUserCanSeeConsensusPanel) return null;

    return buildConsensusDashboard({
      users: usuarios,
      submissions: submissoes,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      games: jogosReais,
      ranking,
      teamRankings: TEAM_FIFA_RANKINGS,
      submissionFields: SUBMISSION_FIELDS,
      isAdminUser,
      usuarioPreencheuTodosOsJogos,
      usuarioPreencheuMataCompleta
    });
  }, [
    currentUserCanSeeConsensusPanel,
    usuarios,
    submissoes,
    palpitesJogos,
    palpitesMataMata,
    jogosReais,
    ranking
  ]);
  const timelineReferenceNowMs = useMemo(
    () => (
      parseReferenceTimestamp(officialResultsSyncStatus?.lastRunAt)
      || parseReferenceTimestamp(officialResultsSyncStatus?.lastAppliedAt)
      || parseReferenceTimestamp(officialResultsSyncStatus?.lastSuccessAt)
      || Date.now()
    ),
    [
      officialResultsSyncStatus?.lastAppliedAt,
      officialResultsSyncStatus?.lastRunAt,
      officialResultsSyncStatus?.lastSuccessAt
    ]
  );
  const nearestTimelineMatchId = useMemo(
    () => getNearestTimelineMatchId(jogosReais, timelineReferenceNowMs),
    [jogosReais, timelineReferenceNowMs]
  );

  useEffect(() => {
    if (!currentUser) return;
    if (!gruposCompletos) {
      setAlocacaoTerceiros({});
      return;
    }
    setAlocacaoTerceiros(
      buildThirdPlaceAllocation(
        jogosReais,
        modoAdmin ? undefined : palpitesUsuarioAtual,
        condutaGrupos,
        gruposCompletos
      )
    );
  }, [jogosReais, palpitesUsuarioAtual, condutaGrupos, currentUser, gruposCompletos]);

  const handleLogin = (id, nome, senha, extraUser = {}) => {
    const normalizedUser = normalizeUser({ id, nome, senha, ...extraUser });

    if (isAdminUser(normalizedUser) && !usuarios.find(isAdminUser)) {
      setUsuarios([...usuarios, normalizedUser]);
    } else if (!usuarios.find(u => u.id === id)) {
      setUsuarios([...usuarios, normalizedUser]); 
    }
    setCurrentUser(normalizedUser);
  };

  const refreshUsersForLogin = async () => {
    const remotePayload = await fetchRemoteState();
    if (!remotePayload) return usuarios;
    const nextState = parseRemotePayload(remotePayload);
    applyAppState(nextState, remotePayload.updatedAt || Date.now());
    return nextState.users || [];
  };

  const handleLogout = () => setCurrentUser(null);
  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!currentUser || !file) return;

    setAvatarLoading(true);
    setAvatarError('');

    try {
      const preparedAvatar = await processAvatarFile(file);
      const uploadedAvatar = await uploadAvatarAsset({
        dataUrl: preparedAvatar,
        userId: currentUser.id,
        userName: currentUser.nome
      });
      const updatedUser = {
        ...currentUser,
        avatar: uploadedAvatar.avatar,
        avatarKey: uploadedAvatar.avatarKey || currentUser.avatarKey || ''
      };

      setUsuarios((current) => current.map((user) => (
        user.id === currentUser.id
          ? { ...user, avatar: uploadedAvatar.avatar, avatarKey: uploadedAvatar.avatarKey || user.avatarKey || '' }
          : user
      )));
      setCurrentUser(updatedUser);
    } catch (error) {
      setAvatarError(error.message || 'Não foi possível salvar a imagem.');
    } finally {
      setAvatarLoading(false);
    }
  };
  const handleRemoveAvatar = () => {
    if (!currentUser) return;
    setAvatarError('');
    setUsuarios((current) => current.map((user) => (
      user.id === currentUser.id ? { ...user, avatar: '', avatarKey: '' } : user
    )));
    setCurrentUser((current) => ({ ...current, avatar: '', avatarKey: '' }));
  };
  const atualizarJogo = (id, c, v) => {
    if (modoAdmin) {
      setAdminMatchDrafts((current) => ({
        ...current,
        [id]: {
          ...(current[id] || { placarA: '', placarB: '' }),
          [c]: v
        }
      }));
      return;
    }
    setJogosReais((current) => current.map((jogo) => {
      if (jogo.id !== id) return jogo;
      const nextMatch = { ...jogo, [c]: v };
      if (!placarPreenchido(nextMatch.placarA, nextMatch.placarB)) {
        nextMatch.isFinal = false;
      }
      return nextMatch;
    }));
  };
  const aplicarAtualizacaoManualNoJogo = (id, updater) => {
    if (!modoAdmin) return;
    nextSyncScopeRef.current = 'admin-shared';
    setJogosReais((current) => current.map((jogo) => {
      if (jogo.id !== id) return jogo;
      const updated = updater(jogo);
      return updated?.match || jogo;
    }));
  };
  const salvarCorrecaoManualJogo = (id) => {
    if (!modoAdmin) return;
    const draft = adminMatchDrafts[id] || { placarA: '', placarB: '' };
    const hasPartialScore = (draft.placarA === '') !== (draft.placarB === '');

    if (hasPartialScore) {
      setSyncError('Preencha os dois gols ou deixe os dois campos vazios antes de salvar a correção manual.');
      return;
    }

    setSyncError('');
    aplicarAtualizacaoManualNoJogo(id, (jogo) => applyManualResultCorrection(jogo, {
      placarA: draft.placarA,
      placarB: draft.placarB,
      isFinal: placarPreenchido(draft.placarA, draft.placarB),
      appliedBy: currentUser?.nome || 'admin',
      reason: 'admin-correction'
    }));
  };
  const atualizarStatusFinalJogo = (id, checked) => {
    if (!modoAdmin) return;
    aplicarAtualizacaoManualNoJogo(id, (jogo) => {
      if (!placarPreenchido(jogo.placarA, jogo.placarB)) {
        return { changed: false, match: { ...jogo, isFinal: false } };
      }

      return applyManualResultCorrection(jogo, {
        placarA: jogo.placarA,
        placarB: jogo.placarB,
        isFinal: Boolean(checked),
        appliedBy: currentUser?.nome || 'admin',
        reason: checked ? 'admin-final-confirmation' : 'admin-reopened-result'
      });
    });
  };
  const reativarAutoSyncJogo = (id) => {
    if (!modoAdmin) return;
    aplicarAtualizacaoManualNoJogo(id, (jogo) => clearManualResultLock(jogo, {
      appliedBy: currentUser?.nome || 'admin'
    }));
  };
  const atualizarPalpite = (id, c, v) => {
    if (palpitesTravadosJogos) return;
    setPalpitesJogos(p => ({ ...p, [currentUser.id]: { ...(p[currentUser.id] || {}), [id]: { ...(p[currentUser.id]?.[id] || { placarA: '', placarB: '' }), [c]: v } } }));
  };
  const atualizarCondutaGrupo = (grupo, time, campo, valor) => {
    if (modoAdmin) {
      nextSyncScopeRef.current = 'admin-shared';
    }
    setCondutaGrupos((anterior) => ({
      ...anterior,
      [grupo]: {
        ...(anterior[grupo] || {}),
        [time]: {
          ...(anterior[grupo]?.[time] || {}),
          [campo]: valor
        }
      }
    }));
  };
  const atualizarMataMata = (c, v, i) => {
    if (palpitesTravadosMata && !modoAdmin) return;
    if (modoAdmin) {
      nextSyncScopeRef.current = 'admin-shared';
    }
    const setter = modoAdmin ? setGabaritoMataMata : setPalpitesMataMata;
    setter(p => {
      const root = modoAdmin ? p : (p[currentUser.id] || {});
      const val = i !== null ? [...(root[c] || [])] : v;
      if (i !== null) val[i] = v;
      const updatedRoot = { ...root, [c]: val };
      const sanitizedRoot = sanitizeKnockoutBracket({
        bracket: updatedRoot,
        jogos: jogosReais,
        palpitesUsuario: modoAdmin ? undefined : palpitesJogos[currentUser.id],
        condutaGrupos
      });

      return modoAdmin ? sanitizedRoot : { ...p, [currentUser.id]: sanitizedRoot };
    });
  };

  const handleSubmitSection = async (field) => {
    if (!currentUser || modoAdmin) return;
    if (field === SUBMISSION_FIELDS.MATA && !jogosEnviadosAt) return;

    const nextSubmissoes = {
      ...submissoes,
      [currentUser.id]: {
        ...(submissoes[currentUser.id] || {}),
        [field]: Date.now()
      }
    };

    const nextState = {
      users: usuarios,
      matches: jogosReais,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      officialKnockout: gabaritoMataMata,
      conduct: condutaGrupos,
      submissions: nextSubmissoes
    };

    try {
      setSyncStatus('syncing');
      setSyncError('');
      const syncResult = await syncRemoteStateWithPatch(nextState, { currentUserId: currentUser.id, isAdmin: modoAdmin });
      remoteUpdatedAtRef.current = syncResult.updatedAt || Date.now();
      remoteSnapshotRef.current = buildStateSnapshot(syncResult.mergedState || nextState);
      clearPendingSync();
      setSubmissoes(nextSubmissoes);
      setSyncStatus('online');
    } catch (error) {
      setSyncStatus('offline');
      setSyncError(error.message || 'Falha ao salvar dados online.');
    }
  };

  const handleDeleteUser = (userId) => {
    const targetUser = usuarios.find((user) => user.id === userId);
    if (!modoAdmin || isAdminUser(targetUser)) return;

    if (userDeleteConfirmId !== userId) {
      setUserDeleteConfirmId(userId);
      setTimeout(() => setUserDeleteConfirmId((current) => (current === userId ? null : current)), 3000);
      return;
    }

    setUsuarios((current) => current.filter((user) => user.id !== userId));
    setPalpitesJogos((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setPalpitesMataMata((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setSubmissoes((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setUserDeleteConfirmId(null);
  };


  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRefreshUsers={refreshUsersForLogin}
        users={usuarios}
        syncStatus={syncStatus}
        syncError={syncError}
        isDemoMode={isDemoMode}
      />
    );
  }

  const navItems = [
    { id: 'jogos', icon: Calendar, label: 'Fase de Grupos', mobileLabel: '1a Fase' },
    { id: 'matamata', icon: Crown, label: 'Mata-mata', mobileLabel: 'Mata-mata' },
    { id: 'ranking', icon: Trophy, label: 'Ranking', mobileLabel: 'Ranking' },
    { id: 'painel', icon: Medal, label: 'Painel', mobileLabel: 'Painel' },
    { id: 'regras', icon: List, label: 'Pontuação', mobileLabel: 'Pontuação' }
  ];
  const gabaritoTimeline = buildGabaritoTimeline(jogosReais, { isAdmin: modoAdmin });
  const syncDiagnosticsSummary = {
    lastRunAt: formatResultSourceTimestamp(officialResultsSyncStatus?.lastRunAt),
    lastSuccessAt: formatResultSourceTimestamp(officialResultsSyncStatus?.lastSuccessAt),
    lastAppliedAt: formatResultSourceTimestamp(officialResultsSyncStatus?.lastAppliedAt),
    updatedMatches: Number(officialResultsSyncStatus?.updatedMatches || 0),
    skippedMatches: Number(officialResultsSyncStatus?.skippedMatches || 0),
    conflictMatches: Number(officialResultsSyncStatus?.conflictMatches || 0),
    lastOutcome: officialResultsSyncStatus?.lastOutcome || 'pending',
    providers: Array.isArray(officialResultsSyncStatus?.providers) ? officialResultsSyncStatus.providers : [],
    providerErrors: Array.isArray(officialResultsSyncStatus?.providerErrors) ? officialResultsSyncStatus.providerErrors : []
  };

  return (
    <div className="app-shell min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] text-slate-900 font-sans pb-28 lg:pb-10">
      <header className="app-topbar sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <AvatarBadge user={currentUser} size="md" />
          <div><h1 className="text-sm font-bold text-slate-900 leading-tight">{currentUser.nome}</h1><p className={`text-[10px] font-medium tracking-wide ${TEXT_MUTED}`}>{modoAdmin ? 'ADMINISTRADOR' : 'Participante'}</p></div>
        </div>
        <button onClick={handleLogout} className={`min-h-11 min-w-11 rounded-full p-2.5 hover:bg-slate-100 transition-colors ${TEXT_MUTED} hover:text-slate-800`}><LogOut size={18} /></button>
      </header>

      <main className="mx-auto max-w-[1720px] px-4 py-4 lg:grid lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-5">
            <div className={`${GLASS_CARD} p-5`}>
              <div className="flex items-center gap-4">
                <AvatarBadge user={currentUser} size="lg" />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-bold text-slate-900">{currentUser.nome}</h1>
                  <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>{modoAdmin ? 'Administrador' : 'Participante'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <LogOut size={14} />
                Sair
              </button>
            </div>

            <div className={`${GLASS_CARD} p-3`}>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAbaAtiva(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                        active
                          ? 'bg-sky-600 text-white shadow-[0_18px_40px_-24px_rgba(2,132,199,0.9)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 max-w-xl mx-auto w-full lg:max-w-none">
        {!isDemoMode && (
          <div className={`${GLASS_CARD} mb-5 px-4 py-3`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">Base online</div>
              <div className={`text-[11px] font-bold ${
                syncStatus === 'online'
                  ? 'text-emerald-600'
                  : syncStatus === 'syncing' || syncStatus === 'connecting'
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }`}>
                {syncStatus === 'online' && 'Online'}
                {syncStatus === 'syncing' && 'Sincronizando'}
                {syncStatus === 'connecting' && 'Conectando'}
                {syncStatus === 'offline' && 'Falha de sync'}
              </div>
            </div>
            {syncError && <div className="mt-2 text-[11px] text-rose-600">{syncError}</div>}
          </div>
        )}
        {!modoAdmin && (
          <div className={`${GLASS_CARD} p-5 mb-5`}>
            <div className="flex items-center gap-4">
              <AvatarBadge user={currentUser} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">Sua foto no bolão</div>
                <div className={`mt-1 text-xs ${TEXT_MUTED}`}>JPG ou PNG, até 2 MB. A imagem é reduzida automaticamente.</div>
                {avatarError && <div className="mt-2 text-xs text-rose-600">{avatarError}</div>}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarSelected}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {avatarLoading ? 'Enviando...' : currentUser.avatar ? 'Trocar imagem' : 'Enviar imagem'}
              </button>
              {currentUser.avatar && (
                <button onClick={handleRemoveAvatar} className={`${GLASS_BTN_SECONDARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest`}>
                  Remover
                </button>
              )}
            </div>
          </div>
        )}
        {abaAtiva === 'jogos' && (
          <div className="space-y-8 animate-fade-in">
            {(homeInsightCard || homeEditorialInsights || modoAdmin) && (
              <InsightsHubPanel
                personalInsight={homeInsightCard}
                editorialInsight={homeEditorialInsights}
                consensusDashboard={consensusDashboard}
                canSeeConsensus={currentUserCanSeeConsensusPanel}
                jogosSubmitted={jogosCompletosUsuarioAtual}
                mataSubmitted={mataConcluidaUsuarioAtual}
                isAdminViewer={modoAdmin}
                onNavigateToClosestMatch={() => {
                  const targetId = nearestTimelineMatchId;
                  if (!targetId) return;
                  const targetNode = timelineMatchRefs.current[targetId];
                  if (!targetNode) return;
                  targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              />
            )}
            <>
              <div className={`${GLASS_CARD} p-5`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900">Gabarito cronológico</h3>
                    <p className={`mt-1 text-xs ${TEXT_MUTED}`}>
                      {modoAdmin
                        ? 'O auto-sync roda sozinho no servidor. Correções manuais travam novas sobrescritas até você reativar o jogo.'
                        : 'Resultados oficiais por dia e horário do Brasil. O ranking acompanha essas atualizações automaticamente.'}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] ${
                    modoAdmin
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  }`}>
                    <AlertCircle size={12} />
                    {modoAdmin ? 'Modo gabarito ativo' : 'Leitura oficial'}
                  </div>
                </div>
              </div>

              {modoAdmin && (
                <div className={`${GLASS_CARD} p-5`}>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Último auto-sync</div>
                      <div className="mt-2 text-sm font-bold text-slate-900">{syncDiagnosticsSummary.lastRunAt || 'Ainda não registrado'}</div>
                      <div className="mt-1 text-[11px] text-slate-500">Status: {syncDiagnosticsSummary.lastOutcome}</div>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Último sucesso</div>
                      <div className="mt-2 text-sm font-bold text-slate-900">{syncDiagnosticsSummary.lastSuccessAt || 'Sem sucesso ainda'}</div>
                      <div className="mt-1 text-[11px] text-slate-500">Última aplicação: {syncDiagnosticsSummary.lastAppliedAt || 'Sem alteração'}</div>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Resumo da rodada</div>
                      <div className="mt-2 text-sm font-bold text-slate-900">{syncDiagnosticsSummary.updatedMatches} atualizados</div>
                      <div className="mt-1 text-[11px] text-slate-500">{syncDiagnosticsSummary.skippedMatches} ignorados • {syncDiagnosticsSummary.conflictMatches} conflitos</div>
                    </div>
                    <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Fonte ativa</div>
                      <div className="mt-2 text-sm font-bold text-slate-900">
                        {syncDiagnosticsSummary.providers.length
                          ? syncDiagnosticsSummary.providers.map((provider) => provider.provider).join(', ')
                          : 'Aguardando job'}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {syncDiagnosticsSummary.providerErrors.length
                          ? `Erros: ${syncDiagnosticsSummary.providerErrors.length}`
                          : 'Sem erros no último ciclo'}
                      </div>
                    </div>
                  </div>
                  {syncDiagnosticsSummary.providerErrors.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {syncDiagnosticsSummary.providerErrors.map((error, index) => (
                        <div key={`sync-error-${index}`} className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
                          <span className="font-bold">{error.provider}</span>: {error.message}
                        </div>
                      ))}
                    </div>
                  )}
                  {officialResultsSyncHistory.length > 0 && (
                    <details className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50/80 px-4 py-3">
                      <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                        Histórico resumido do auto-sync ({officialResultsSyncHistory.length})
                      </summary>
                      <div className="mt-3 space-y-2">
                        {officialResultsSyncHistory.slice(0, 5).map((entry, index) => (
                          <div key={`sync-history-${index}`} className="rounded-xl border border-white/70 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                            <div className="font-bold text-slate-800">{formatResultSourceTimestamp(entry.runAt)} • {entry.outcome}</div>
                            <div className="mt-1">{entry.updatedMatches} atualizados • {entry.skippedMatches} ignorados • {entry.conflictMatches} conflitos</div>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}

              {gabaritoTimeline.map((dayGroup) => (
                <div key={dayGroup.dayKey} className="space-y-3">
                  <div className="sticky top-20 z-10 inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur">
                    {dayGroup.dayLabel}
                  </div>
                  <div className="space-y-3">
                    {dayGroup.matches.map((timelineMatch) => {
                      const jogo = timelineMatch.match;
                      const draft = adminMatchDrafts[jogo.id] || { placarA: jogo.placarA ?? '', placarB: jogo.placarB ?? '' };
                      const schedule = formatBrazilMatchSchedule(jogo);
                      const officialKickoffHint = formatOfficialKickoffHint(jogo);
                      const isLocked = isManualResultLocked(jogo);
                      const hasPartialDraft = (draft.placarA === '') !== (draft.placarB === '');
                      const hasDraftChanges = draft.placarA !== (jogo.placarA ?? '') || draft.placarB !== (jogo.placarB ?? '');
                      const canSaveManual = !hasPartialDraft && (
                        hasDraftChanges ||
                        (placarPreenchido(draft.placarA, draft.placarB) && !isLocked)
                      );

                      if (!timelineMatch.showAdminControls) {
                        const palpite = palpitesJogos[currentUser.id]?.[jogo.id] || { placarA: '', placarB: '' };
                        const betReview = buildGroupBetReview({
                          palpiteA: palpite.placarA,
                          palpiteB: palpite.placarB,
                          jogo
                        });
                        const hasPrediction = placarPreenchido(palpite.placarA, palpite.placarB);

                        return (
                          <div
                            key={jogo.id}
                            ref={(node) => {
                              if (node) timelineMatchRefs.current[jogo.id] = node;
                              else delete timelineMatchRefs.current[jogo.id];
                            }}
                            className={`${GLASS_CARD} p-4 lg:p-5`}
                          >
                            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                  <span className="inline-flex items-center gap-1"><Calendar size={10} /> {schedule.day}/{schedule.month} • {schedule.time} BR</span>
                                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{timelineMatch.competitionLabel || getOfficialCompetitionLabel(jogo)}</span>
                                  {jogo.local && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{jogo.local}</span>}
                                </div>
                                {officialKickoffHint && <div className="mt-2 text-[13px] text-slate-500">{officialKickoffHint}</div>}
                              </div>
                              <div className={`self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${timelineMatch.status.tone}`}>
                                {timelineMatch.status.label}
                              </div>
                            </div>
                            <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                              <div className="text-right text-[15px] font-bold text-slate-900 lg:text-[18px]">{jogo.timeA}</div>
                              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-lg font-black text-slate-900 lg:min-w-[112px] lg:text-[28px]">
                                {placarPreenchido(jogo.placarA, jogo.placarB) ? `${jogo.placarA} x ${jogo.placarB}` : '—'}
                              </div>
                              <div className="text-left text-[15px] font-bold text-slate-900 lg:text-[18px]">{jogo.timeB}</div>
                            </div>
                            <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
                              <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                                <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu palpite</div>
                                <div className="mt-3 text-[24px] font-black text-slate-900 lg:text-[28px]">
                                  {formatScoreDisplay(palpite.placarA, palpite.placarB, 'Sem palpite')}
                                </div>
                                <div className="mt-2 text-[13px] leading-snug text-slate-500">
                                  {hasPrediction ? 'Comparado com o resultado oficial acima.' : 'Preencha os dois placares para comparar.'}
                                </div>
                              </div>
                              <div className={`rounded-[20px] border px-4 py-4 ${betReview.tone}`}>
                                <div className="text-[11px] font-bold uppercase tracking-[0.16em]">{betReview.label}</div>
                                <div className="mt-3 text-[20px] font-black lg:text-[24px]">{betReview.detail}</div>
                                <div className="mt-2 text-[13px] leading-snug opacity-80">
                                  {placarPreenchido(jogo.placarA, jogo.placarB)
                                    ? 'O placar oficial já foi sincronizado neste jogo.'
                                    : 'A pontuação aparece assim que o placar oficial for publicado.'}
                                </div>
                              </div>
                            </div>
                            {timelineMatch.sourceMeta && (
                              <div className="text-[13px] leading-snug text-slate-500">
                                <span className="font-bold uppercase tracking-[0.14em] text-slate-400">Fonte/última atualização:</span> {timelineMatch.sourceMeta}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={jogo.id}
                          ref={(node) => {
                            if (node) timelineMatchRefs.current[jogo.id] = node;
                            else delete timelineMatchRefs.current[jogo.id];
                          }}
                          className={`${GLASS_CARD} p-4 lg:p-5`}
                        >
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                <span className="inline-flex items-center gap-1"><Calendar size={10} /> {schedule.day}/{schedule.month} • {schedule.time} BR</span>
                                <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{timelineMatch.competitionLabel || getOfficialCompetitionLabel(jogo)}</span>
                                {jogo.local && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{jogo.local}</span>}
                              </div>
                              {officialKickoffHint && <div className="mt-2 text-[11px] text-slate-500">{officialKickoffHint}</div>}
                            </div>
                            <div className={`self-start rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] ${timelineMatch.status.tone}`}>
                              {timelineMatch.status.label}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center">
                            <div className="text-[14px] font-bold text-slate-900 lg:text-right">{jogo.timeA}</div>
                            <div className="flex items-center justify-center gap-2">
                              <input type="number" min="0" inputMode="numeric" value={draft.placarA} onChange={e => atualizarJogo(jogo.id, 'placarA', e.target.value)} className={`${GLASS_INPUT} h-12 w-14 text-center text-base font-bold`} />
                              <span className="text-sm font-light text-slate-500">X</span>
                              <input type="number" min="0" inputMode="numeric" value={draft.placarB} onChange={e => atualizarJogo(jogo.id, 'placarB', e.target.value)} className={`${GLASS_INPUT} h-12 w-14 text-center text-base font-bold`} />
                            </div>
                            <div className="text-[14px] font-bold text-slate-900 lg:text-left">{jogo.timeB}</div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                            <label className={`flex items-center justify-between gap-4 rounded-[18px] border px-3 py-3 ${
                              placarPreenchido(jogo.placarA, jogo.placarB)
                                ? (jogo.isFinal ? 'border-emerald-200 bg-emerald-50/70' : 'border-orange-200 bg-orange-50/70')
                                : 'border-slate-200 bg-slate-50/80'
                            }`}>
                              <div className="min-w-0">
                                <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
                                  !placarPreenchido(jogo.placarA, jogo.placarB)
                                    ? 'text-slate-500'
                                    : jogo.isFinal
                                      ? 'text-emerald-700'
                                      : 'text-orange-700'
                                }`}>
                                  {!placarPreenchido(jogo.placarA, jogo.placarB) ? 'Sem placar salvo' : jogo.isFinal ? 'Resultado definitivo' : 'Placar temporário'}
                                </div>
                                <div className="mt-1 text-[11px] text-slate-600">
                                  {hasPartialDraft
                                    ? 'Complete os dois gols antes de salvar.'
                                    : isLocked
                                      ? 'Este jogo está protegido contra auto-sync até reativação manual.'
                                      : 'O auto-sync só aplica resultado final validado.'}
                                </div>
                              </div>
                              <input
                                type="checkbox"
                                checked={Boolean(jogo.isFinal && placarPreenchido(jogo.placarA, jogo.placarB))}
                                disabled={!placarPreenchido(jogo.placarA, jogo.placarB)}
                                onChange={(event) => atualizarStatusFinalJogo(jogo.id, event.target.checked)}
                                className="h-5 w-5 shrink-0 accent-emerald-600"
                              />
                            </label>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => salvarCorrecaoManualJogo(jogo.id)}
                                disabled={!canSaveManual}
                                className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-[11px] uppercase tracking-[0.18em] disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                Salvar correção
                              </button>
                              {isLocked && (
                                <button
                                  onClick={() => reativarAutoSyncJogo(jogo.id)}
                                  className={`${GLASS_BTN_SECONDARY} min-h-12 px-4 py-3 text-[11px] uppercase tracking-[0.18em]`}
                                >
                                  Reativar auto-sync
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3">
                              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Origem e atualização</div>
                              <div className="mt-2 text-[12px] text-slate-700">
                                {timelineMatch.sourceMeta || 'Nenhum resultado oficial aplicado ainda.'}
                              </div>
                              {jogo.resultExternalMatchId && (
                                <div className="mt-1 text-[11px] text-slate-500">ID externo: {jogo.resultExternalMatchId}</div>
                              )}
                            </div>
                            <details className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3">
                              <summary className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                Histórico do jogo ({(jogo.resultHistory || []).length})
                              </summary>
                              <div className="mt-3 space-y-2">
                                {(jogo.resultHistory || []).slice().reverse().slice(0, 5).map((entry, index) => (
                                  <div key={`${jogo.id}-history-${index}`} className="rounded-xl border border-white/70 bg-white px-3 py-2 text-[11px] text-slate-600 shadow-sm">
                                    <div className="font-bold text-slate-800">{entry.source === 'manual-correction' ? 'Correção manual' : entry.source === 'manual-override-clear' ? 'Auto-sync reativado' : 'Auto-sync'}</div>
                                    <div className="mt-1">
                                      {entry.previousScore ? `${entry.previousScore.placarA} x ${entry.previousScore.placarB}` : 'Sem placar'}
                                      {' -> '}
                                      {entry.newScore ? `${entry.newScore.placarA} x ${entry.newScore.placarB}` : 'Sem placar'}
                                    </div>
                                    <div className="mt-1 text-slate-500">
                                      {(entry.appliedBy || 'sistema')} • {formatResultSourceTimestamp(entry.appliedAt)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {!modoAdmin && (
                <div className="space-y-5">
                  <div className={`${GLASS_CARD} p-5 flex flex-col gap-4`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Seus palpites da fase de grupos</h3>
                        <p className={`text-xs mt-1 ${TEXT_MUTED}`}>Esta parte serve apenas para envio e revisão dos seus placares. O gabarito oficial acima continua sendo sincronizado separadamente.</p>
                      </div>
                      {palpitesTravadosJogos && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Check size={12} /> Enviado</span>}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className={`text-xs ${TEXT_MUTED}`}>
                        {palpitesTravadosJogos
                          ? `Enviado em ${formatSubmissionDate(jogosEnviadosAt)}`
                          : jogosPendentesUsuario > 0
                            ? `Faltam ${jogosPendentesUsuario} jogo${jogosPendentesUsuario === 1 ? '' : 's'} para liberar o envio.`
                            : 'Tudo pronto para enviar.'}
                      </span>
                      {!palpitesTravadosJogos && (
                        <button
                          onClick={() => handleSubmitSection(SUBMISSION_FIELDS.JOGOS)}
                          disabled={!usuarioPreencheuTodosOsJogos(jogosReais, palpitesUsuarioAtual)}
                          className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
                        >
                          Enviar palpites
                        </button>
                      )}
                    </div>
                  </div>
                  {Object.keys(GRUPOS_2026).map(grupo => (
                    <div key={grupo} className="relative">
                      <h3 className="mb-4 pl-3 border-l-2 border-yellow-500 text-[15px] font-bold tracking-wide text-slate-700">GRUPO {grupo}</h3>
                      <TabelaClassificacao
                        grupo={grupo}
                        currentUser={currentUser}
                        calcularTabelaGrupo={calcularTabelaGrupo}
                        jogosReais={jogosReais}
                        palpitesJogos={palpitesJogos}
                        condutaGrupos={condutaGrupos}
                        modoAdmin={modoAdmin}
                        atualizarCondutaGrupo={atualizarCondutaGrupo}
                        getShortCountryName={getShortCountryName}
                      />
                      <div className="space-y-3">
                        {jogosReais.filter(j => j.grupo === grupo).map(jogo => {
                          const palpite = palpitesJogos[currentUser.id]?.[jogo.id] || { placarA: '', placarB: '' };
                          const valA = palpite.placarA;
                          const valB = palpite.placarB;
                          const schedule = formatBrazilMatchSchedule(jogo);
                          const officialKickoffHint = formatOfficialKickoffHint(jogo);
                          const officialVariant = getMatchResultVariant(jogo);
                          const betReview = buildGroupBetReview({ palpiteA: valA, palpiteB: valB, jogo });
                          return (
                            <div key={jogo.id} className={`${GLASS_CARD} p-4`}>
                              <div className="mb-4 flex flex-col gap-2 text-[11px] font-bold uppercase text-slate-500 sm:flex-row sm:items-start sm:justify-between">
                                <div className="flex flex-col gap-1 min-w-0">
                                  <span className="flex items-center gap-1"><Calendar size={10} /> {schedule.day}/{schedule.month} • {schedule.time} BR</span>
                                  {officialKickoffHint && <span className="text-[10px] font-semibold normal-case text-slate-500">{officialKickoffHint}</span>}
                                </div>
                                <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{jogo.local}</span>
                              </div>
                              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                                <span className="text-right text-[13px] font-bold leading-tight text-slate-800 sm:text-[14px]">{jogo.timeA}</span>
                                {palpitesTravadosJogos ? (
                                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-base font-black text-slate-900">
                                    {formatScoreDisplay(valA, valB)}
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2">
                                    <input type="number" min="0" inputMode="numeric" disabled={palpitesTravadosJogos} value={valA} onChange={e => atualizarPalpite(jogo.id, 'placarA', e.target.value)} className={`${GLASS_INPUT} h-12 w-12 text-center text-base font-bold`} />
                                    <span className="text-sm text-slate-500 font-light">X</span>
                                    <input type="number" min="0" inputMode="numeric" disabled={palpitesTravadosJogos} value={valB} onChange={e => atualizarPalpite(jogo.id, 'placarB', e.target.value)} className={`${GLASS_INPUT} h-12 w-12 text-center text-base font-bold`} />
                                  </div>
                                )}
                                <span className="text-left text-[13px] font-bold leading-tight text-slate-800 sm:text-[14px]">{jogo.timeB}</span>
                              </div>
                              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
                                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3">
                                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu palpite</div>
                                  <div className="mt-2 text-[13px] font-bold text-slate-900">
                                    {formatScoreDisplay(valA, valB, palpitesTravadosJogos ? 'Sem palpite' : 'Preencha acima')}
                                  </div>
                                </div>
                                <div className="rounded-[18px] border border-slate-200 bg-slate-50/80 px-3 py-3">
                                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                                    {officialVariant === 'temporary' ? 'Placar oficial temporário' : 'Resultado oficial'}
                                  </div>
                                  <div className="mt-2 text-[13px] font-bold text-slate-900">
                                    {formatScoreDisplay(jogo.placarA, jogo.placarB, 'Aguardando')}
                                  </div>
                                </div>
                                <div className={`rounded-[18px] border px-3 py-3 ${betReview.tone}`}>
                                  <div className="text-[10px] font-bold uppercase tracking-[0.16em]">{betReview.label}</div>
                                  <div className="mt-2 text-[12px] font-semibold">{betReview.detail}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          </div>
        )}

        {abaAtiva === 'matamata' && (
          <div className="space-y-4 animate-fade-in">
            {!modoAdmin && (
              <div className={`${GLASS_CARD} p-5 flex flex-col gap-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Envio do mata-mata</h3>
                    <p className={`text-xs mt-1 ${TEXT_MUTED}`}>Quando você enviar, chaves e pódio final não poderão mais ser alterados.</p>
                  </div>
                  {palpitesTravadosMata && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Check size={12} /> Enviado</span>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`text-xs ${TEXT_MUTED}`}>{palpitesTravadosMata ? `Enviado em ${formatSubmissionDate(mataEnviadosAt)}` : jogosEnviadosAt ? 'Complete toda a chave e o pódio para enviar.' : 'Envie a fase de grupos antes de liberar o envio do mata-mata.'}</span>
                  {!palpitesTravadosMata && (
                    <button
                      onClick={() => handleSubmitSection(SUBMISSION_FIELDS.MATA)}
                      disabled={!jogosEnviadosAt || !usuarioPreencheuMataCompleta(palpitesMataUsuarioAtual)}
                      className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Enviar mata-mata
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-sky-50 p-4 rounded-2xl border border-sky-200 mb-6">
              <div className="bg-white p-2 rounded-full border border-sky-100"><Calculator className="text-sky-500" size={18} /></div>
              <p className="text-[11px] text-sky-900 leading-snug">Seus palpites da fase de grupos preenchem automaticamente os confrontos abaixo.</p>
            </div>
            {[
              { id: 'r32', title: '32 avos de final', list: MATA_MATA_CONFIG.r32, key: 'dezeszeseisavos', pts: PONTOS.MATA.R32 },
              { id: 'r16', title: 'Oitavas de Final', list: MATA_MATA_CONFIG.r16, key: 'oitavas', pts: PONTOS.MATA.R16 },
              { id: 'qf', title: 'Quartas de Final', list: MATA_MATA_CONFIG.qf, key: 'quartas', pts: PONTOS.MATA.QF },
              { id: 'sf', title: 'Semifinais', list: MATA_MATA_CONFIG.sf, key: 'semis', pts: PONTOS.MATA.SF }
            ].map(section => (
              <div key={section.id}>
                <button onClick={() => setSecaoExpandida(secaoExpandida === section.id ? null : section.id)} className={`${GLASS_CARD} w-full flex min-h-13 items-center justify-between p-4 mb-2 hover:bg-white/10 transition-colors`}>
                  <span className="text-sm font-bold text-slate-900 tracking-wide">{section.title}</span>
                  {secaoExpandida === section.id ? <ChevronUp size={16} className={TEXT_MUTED} /> : <ChevronDown size={16} className={TEXT_MUTED} />}
                </button>
                {secaoExpandida === section.id && (
                  <div className="mt-2 mb-6">{section.list.map((match, idx) => (
                    <RestrictedMatchDropdown
                      key={match.id}
                      match={match}
                      idx={idx}
                      phaseKey={section.key}
                      points={section.pts}
                      modoAdmin={modoAdmin}
                      palpitesTravadosMata={palpitesTravadosMata}
                      gabaritoMataMata={gabaritoMataMata}
                      palpitesMataMata={palpitesMataMata}
                      currentUser={currentUser}
                      jogosReais={jogosReais}
                      palpitesUsuarioAtual={palpitesUsuarioAtual}
                      condutaGrupos={condutaGrupos}
                      gruposCompletos={gruposCompletos}
                      alocacaoTerceiros={alocacaoTerceiros}
                      atualizarMataMata={atualizarMataMata}
                      getR32Team={getR32Team}
                      getThirdPlaceCandidate={getThirdPlaceCandidate}
                    />
                  ))}</div>
                )}
              </div>
            ))}
            <PodiumSection
              modoAdmin={modoAdmin}
              gabaritoMataMata={gabaritoMataMata}
              palpitesMataMata={palpitesMataMata}
              currentUser={currentUser}
              atualizarMataMata={atualizarMataMata}
              palpitesTravadosMata={palpitesTravadosMata}
              secaoExpandida={secaoExpandida}
              setSecaoExpandida={setSecaoExpandida}
            />
          </div>
        )}

        {abaAtiva === 'ranking' && (
          <RankingTable
            currentUser={currentUser}
            ranking={ranking}
            matchResultSummary={matchResultSummary}
          />
        )}
        {abaAtiva === 'painel' && (
          <ReviewSheet
            reviewMode={reviewMode}
            setReviewMode={setReviewMode}
            reviewSearch={reviewSearch}
            setReviewSearch={setReviewSearch}
            reviewGroupFilter={reviewGroupFilter}
            setReviewGroupFilter={setReviewGroupFilter}
            reviewGameSort={reviewGameSort}
            setReviewGameSort={setReviewGameSort}
            reviewPhaseFilter={reviewPhaseFilter}
            setReviewPhaseFilter={setReviewPhaseFilter}
            participanteUsuarios={participanteUsuarios}
            jogosReais={jogosReais}
            palpitesJogos={palpitesJogos}
            submissoes={submissoes}
            palpitesMataMata={palpitesMataMata}
            gabaritoMataMata={gabaritoMataMata}
          />
        )}
        
        {abaAtiva === 'regras' && (
          <div className="space-y-6 animate-fade-in">
             <div className={`${GLASS_CARD} p-6`}>
               <h3 className="font-bold text-sm mb-6 text-slate-900 flex items-center gap-2 uppercase tracking-wide"><List size={18} className="text-sky-600"/> Pontuação Detalhada</h3>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">FASE DE GRUPOS</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Placar Exato</span><span className="font-bold text-emerald-700">{PONTOS.JOGO.CHEIO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Apenas Vencedor</span><span className="font-bold text-amber-700">{PONTOS.JOGO.VITORIA} pts</span></div>
                    <div className="mt-2 text-[10px] text-slate-500 italic p-2 border-l-2 border-rose-300 pl-3">Não há pontos por saldo de gols.</div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">MATA-MATA (POR ACERTO)</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar time nos 32 avos</span><span className="font-bold text-slate-900">{PONTOS.MATA.R32} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Oitavas</span><span className="font-bold text-slate-900">{PONTOS.MATA.R16} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Quartas</span><span className="font-bold text-slate-900">{PONTOS.MATA.QF} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Semis</span><span className="font-bold text-indigo-700">{PONTOS.MATA.SF} pts</span></div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">PÓDIO FINAL</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Campeão</span><span className="font-bold text-amber-700">{PONTOS.MATA.CAMPEAO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Vice</span><span className="font-bold text-slate-700">{PONTOS.MATA.VICE} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>3º Lugar</span><span className="font-bold text-orange-700">{PONTOS.MATA.TOP3} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>4º Lugar</span><span className="font-bold text-slate-600">{PONTOS.MATA.TOP4} pts</span></div>
                 </div>
               </div>
             </div>
             {modoAdmin && (
               <div className={`${GLASS_CARD} p-6`}>
                 <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900"><User size={18} className="text-red-500" /> Gerenciar Usuários</h3>
                 <p className={`text-xs mb-5 ${TEXT_MUTED}`}>Apague participantes e remova junto os palpites salvos deles. A conta Admin fica protegida.</p>
                 <div className="space-y-3">
                   {usuarios.map((user) => {
                     const adminUser = isAdminUser(user);
                     const isConfirming = userDeleteConfirmId === user.id;
                     return (
                       <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                         <div className="min-w-0">
                           <div className="truncate text-sm font-bold text-slate-900">{user.nome}</div>
                           <div className={`text-[10px] uppercase tracking-wide ${TEXT_MUTED}`}>{adminUser ? 'Administrador protegido' : 'Participante'}</div>
                         </div>
                         <button
                           onClick={() => handleDeleteUser(user.id)}
                           disabled={adminUser}
                           className={`shrink-0 rounded-lg border px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                             adminUser
                               ? 'cursor-not-allowed border-slate-200 bg-white text-slate-300'
                                : isConfirming
                                  ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-900/40'
                                  : 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10'
                           }`}
                         >
                           {adminUser ? 'Protegido' : isConfirming ? 'Confirmar exclusão' : 'Apagar'}
                         </button>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        )}
        </section>
      </main>

      <nav className="mobile-bottom-nav fixed left-1/2 z-50 flex w-[min(96vw,32rem)] -translate-x-1/2 justify-between gap-1 rounded-[28px] border border-slate-200 bg-white/95 px-2 py-2 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = abaAtiva === item.id;
          return (
            <button key={item.id} onClick={() => setAbaAtiva(item.id)} className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${active ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{item.mobileLabel || item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

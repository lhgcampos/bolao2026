import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

import { TEAM_FIFA_RANKINGS } from '../bolao-app/src/fifaTeamRankings.js';
import { THIRD_PLACE_ASSIGNMENTS } from '../bolao-app/src/thirdPlaceAssignments.js';

const REMOTE_STORE_BASE = 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = 'lhgcampos-bolao2026-live-20260609';
const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  betsGames: 'bets-games',
  betsKnockout: 'bets-knockout',
  submissions: 'submissions',
  userProfiles: 'user-profiles'
};
const REPORTS_DIR = path.join(process.cwd(), 'reports');
const USERNAME = 'RoqueIA';
const PASSWORD = '1234';
const GROUP_SUBMISSION_FIELD = 'jogosAt';
const KNOCKOUT_SUBMISSION_FIELD = 'mataAt';

const EXPLICIT_GROUP_PICKS = {
  A: [
    ['México', 'África do Sul', 2, 0],
    ['Coreia do Sul', 'Rep. Tcheca', 1, 1],
    ['México', 'Coreia do Sul', 1, 1],
    ['Rep. Tcheca', 'África do Sul', 2, 0],
    ['México', 'Rep. Tcheca', 2, 1],
    ['Coreia do Sul', 'África do Sul', 1, 0]
  ],
  B: [
    ['Canadá', 'Bósnia', 1, 1],
    ['Qatar', 'Suíça', 0, 2],
    ['Canadá', 'Suíça', 1, 2],
    ['Bósnia', 'Qatar', 2, 0],
    ['Canadá', 'Qatar', 2, 0],
    ['Suíça', 'Bósnia', 1, 1]
  ],
  C: [
    ['Brasil', 'Marrocos', 2, 0],
    ['Haiti', 'Escócia', 0, 2],
    ['Brasil', 'Haiti', 3, 0],
    ['Marrocos', 'Escócia', 1, 1],
    ['Brasil', 'Escócia', 1, 0],
    ['Marrocos', 'Haiti', 2, 0]
  ],
  D: [
    ['EUA', 'Paraguai', 2, 1],
    ['Austrália', 'Turquia', 1, 1],
    ['EUA', 'Turquia', 1, 1],
    ['Paraguai', 'Austrália', 2, 0],
    ['EUA', 'Austrália', 2, 0],
    ['Paraguai', 'Turquia', 1, 1]
  ],
  E: [
    ['Alemanha', 'Curaçao', 2, 0],
    ['Costa do Marfim', 'Equador', 1, 1],
    ['Alemanha', 'Equador', 2, 1],
    ['Curaçao', 'Costa do Marfim', 0, 2],
    ['Alemanha', 'Costa do Marfim', 3, 1],
    ['Equador', 'Curaçao', 2, 0]
  ],
  F: [
    ['Holanda', 'Japão', 2, 1],
    ['Suécia', 'Tunísia', 1, 0],
    ['Holanda', 'Suécia', 1, 1],
    ['Japão', 'Tunísia', 2, 0],
    ['Japão', 'Suécia', 1, 1],
    ['Holanda', 'Tunísia', 2, 0]
  ],
  G: [
    ['Bélgica', 'Egito', 2, 0],
    ['Irã', 'Nova Zelândia', 1, 0],
    ['Bélgica', 'Irã', 1, 1],
    ['Egito', 'Nova Zelândia', 2, 0],
    ['Bélgica', 'Nova Zelândia', 3, 0],
    ['Egito', 'Irã', 1, 1]
  ],
  H: [
    ['Espanha', 'Cabo Verde', 2, 0],
    ['Uruguai', 'Arábia Saudita', 2, 1],
    ['Espanha', 'Uruguai', 1, 1],
    ['Cabo Verde', 'Arábia Saudita', 1, 1],
    ['Espanha', 'Arábia Saudita', 2, 0],
    ['Uruguai', 'Cabo Verde', 2, 0]
  ],
  I: [
    ['França', 'Senegal', 2, 1],
    ['Noruega', 'Iraque', 2, 0],
    ['França', 'Iraque', 2, 0],
    ['Senegal', 'Noruega', 1, 1],
    ['França', 'Noruega', 1, 1],
    ['Senegal', 'Iraque', 2, 0]
  ]
};

const K_GROUP_SCORE_SEQUENCE = [
  [1, 1],
  [2, 0],
  [1, 0],
  [2, 1],
  [0, 0],
  [1, 0]
];

const L_GROUP_SCORE_SEQUENCE = [
  [2, 1],
  [1, 1],
  [2, 0],
  [1, 0],
  [1, 1],
  [2, 0]
];

const INFERRED_KNOCKOUT = {
  dezeszeseisavos: ['Coreia do Sul', 'Alemanha', 'Holanda', 'Brasil', 'França', 'Equador', 'México', 'Inglaterra', 'EUA', 'Bélgica', 'Colômbia', 'Espanha', 'Suíça', 'Argentina', 'Portugal', 'Irã'],
  oitavas: ['França', 'Holanda', 'Brasil', 'Inglaterra', 'Espanha', 'Bélgica', 'Argentina', 'Portugal'],
  quartas: ['França', 'Espanha', 'Inglaterra', 'Argentina'],
  semis: ['França', 'Argentina'],
  campeao: 'França',
  vice: 'Argentina',
  terceiro: 'Espanha',
  quarto: 'Inglaterra'
};

const INFERENCE_NOTES = [
  'Fases finais (semifinais, final e pódio) prevaleceram sobre listas anteriores quando houve conflito estrutural.',
  'No round of 32, Argentina venceu o slot 86 no lugar de Uruguai porque os dois caíam no mesmo confronto real.',
  'Inglaterra venceu o slot 80 no lugar de Senegal para manter coerência com quarto lugar informado.',
  'Portugal venceu o slot 87 no lugar de Croácia para manter coerência com as fases seguintes.',
  'Nos confrontos sem vencedor explícito compatível com a chave real, foi escolhido o time mais bem ranqueado pela base oficial do app.'
];

const args = new Set(process.argv.slice(2));
const validateOnly = args.has('--validate-only');

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[.'’]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeUserNameKey = (value = '') => normalizeText(value);

const teamAliasMap = new Map([
  ['qatar', 'Catar'],
  ['catar', 'Catar'],
  ['rep tcheca', 'Rep. Tcheca'],
  ['republica tcheca', 'Rep. Tcheca']
]);

const resolveTeamAlias = (value, officialTeamsByNormalized) => {
  const normalized = normalizeText(value);
  return officialTeamsByNormalized.get(normalized)
    || officialTeamsByNormalized.get(normalizeText(teamAliasMap.get(normalized) || ''))
    || null;
};

const getRemotePathUrl = (remotePath) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${remotePath}`;
const getRemoteUserShardPath = (prefix, userId) => `${prefix}/${userId}`;

const fetchRemoteEntry = async (remotePath) => {
  const url = `${getRemotePathUrl(remotePath)}?ts=${Date.now()}`;
  const response = await fetch(url, { cache: 'no-store' });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Falha ao ler ${remotePath} (${response.status})`);
  }
  return response.json();
};

const writeRemoteEntry = async (remotePath, payload) => {
  const response = await fetch(getRemotePathUrl(remotePath), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falha ao gravar ${remotePath} (${response.status})`);
  }
};

const buildTimestampLabel = () => new Date().toISOString().replace(/[:.]/g, '-');

const extractLiteral = (source, constName) => {
  const marker = `const ${constName} =`;
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error(`Não foi possível localizar ${constName} em App.jsx`);
  }

  let cursor = start + marker.length;
  while (/\s/.test(source[cursor])) cursor += 1;
  const openChar = source[cursor];
  const closeChar = openChar === '[' ? ']' : openChar === '{' ? '}' : null;
  if (!closeChar) {
    throw new Error(`Constante ${constName} não começa com array/objeto`);
  }

  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let index = cursor; index < source.length; index += 1) {
    const char = source[index];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '\'' || char === '"' || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) depth += 1;
    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return source.slice(cursor, index + 1);
      }
    }
  }

  throw new Error(`Não foi possível extrair ${constName}`);
};

const loadAppData = async () => {
  const appPath = path.join(process.cwd(), 'bolao-app/src/App.jsx');
  const appSource = await fs.readFile(appPath, 'utf8');
  const grupos = vm.runInNewContext(`(${extractLiteral(appSource, 'GRUPOS_2026')})`);
  const jogos = vm.runInNewContext(`(${extractLiteral(appSource, 'JOGOS_FASE_DE_GRUPOS')})`);
  const mataConfig = vm.runInNewContext(`(${extractLiteral(appSource, 'MATA_MATA_CONFIG')})`);

  return {
    grupos,
    jogos,
    mataConfig
  };
};

const sortMatchesByOfficialOrder = (matches) => [...matches].sort((a, b) => {
  const aTime = a.kickoffEt ? new Date(a.kickoffEt).getTime() : Number.MAX_SAFE_INTEGER;
  const bTime = b.kickoffEt ? new Date(b.kickoffEt).getTime() : Number.MAX_SAFE_INTEGER;
  return aTime - bTime || a.id - b.id;
});

const getTeamOfficialRank = (team) => TEAM_FIFA_RANKINGS[team]?.officialRank ?? Number.MAX_SAFE_INTEGER;

const compareOfficialRanking = (a, b) => getTeamOfficialRank(a.time) - getTeamOfficialRank(b.time);

const compararCritBase = (a, b) => (
  b.p - a.p ||
  b.sg - a.sg ||
  b.gp - a.gp ||
  b.conduta - a.conduta ||
  compareOfficialRanking(a, b) ||
  a.time.localeCompare(b.time, 'pt-BR')
);

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

    if (jogo.pA > jogo.pB) mini[jogo.timeA].p += 3;
    else if (jogo.pB > jogo.pA) mini[jogo.timeB].p += 3;
    else {
      mini[jogo.timeA].p += 1;
      mini[jogo.timeB].p += 1;
    }
  });

  return mini;
};

const resolverEmpateGrupoFifa = (linhas, jogosProcessados) => {
  if (linhas.length <= 1) return linhas;

  const miniTabela = calcularMiniTabela(linhas.map((linha) => linha.time), jogosProcessados);
  const enriquecidas = linhas.map((linha) => ({
    ...linha,
    miniP: miniTabela[linha.time].p,
    miniSg: miniTabela[linha.time].sg,
    miniGp: miniTabela[linha.time].gp
  }));

  enriquecidas.sort((a, b) => b.miniP - a.miniP || b.miniSg - a.miniSg || b.miniGp - a.miniGp);

  const grupos = [];
  enriquecidas.forEach((linha) => {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo[0].miniP === linha.miniP && ultimo[0].miniSg === linha.miniSg && ultimo[0].miniGp === linha.miniGp) {
      ultimo.push(linha);
    } else {
      grupos.push([linha]);
    }
  });

  return grupos.flatMap((grupoEmpatado) => {
    if (grupoEmpatado.length === 1) return grupoEmpatado;
    if (grupoEmpatado.length !== linhas.length) {
      return resolverEmpateGrupoFifa(
        grupoEmpatado.map(({ miniP, miniSg, miniGp, ...resto }) => resto),
        jogosProcessados
      );
    }
    return grupoEmpatado.map(({ miniP, miniSg, miniGp, ...resto }) => resto).sort((a, b) => compararCritBase(a, b));
  });
};

const ordenarTabelaGrupoFifa = (linhas, jogosProcessados) => {
  const porPontos = [...linhas].sort((a, b) => b.p - a.p);
  const grupos = [];

  porPontos.forEach((linha) => {
    const ultimo = grupos.at(-1);
    if (ultimo && ultimo[0].p === linha.p) {
      ultimo.push(linha);
    } else {
      grupos.push([linha]);
    }
  });

  return grupos.flatMap((grupoEmpatado) => (
    grupoEmpatado.length === 1 ? grupoEmpatado : resolverEmpateGrupoFifa(grupoEmpatado, jogosProcessados)
  ));
};

const calcularTabelaGrupo = (grupo, grupos, jogos, palpitesUsuario) => {
  const tabela = {};
  const jogosProcessados = [];

  grupos[grupo].forEach((time) => {
    tabela[time] = { time, grupo, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0, conduta: 0 };
  });

  jogos.filter((jogo) => jogo.grupo === grupo).forEach((jogo) => {
    const palpite = palpitesUsuario[jogo.id];
    if (!palpite) return;
    const pA = Number(palpite.placarA);
    const pB = Number(palpite.placarB);
    jogosProcessados.push({ timeA: jogo.timeA, timeB: jogo.timeB, pA, pB });

    tabela[jogo.timeA].j += 1;
    tabela[jogo.timeB].j += 1;
    tabela[jogo.timeA].gp += pA;
    tabela[jogo.timeA].gc += pB;
    tabela[jogo.timeA].sg += pA - pB;
    tabela[jogo.timeB].gp += pB;
    tabela[jogo.timeB].gc += pA;
    tabela[jogo.timeB].sg += pB - pA;

    if (pA > pB) {
      tabela[jogo.timeA].v += 1;
      tabela[jogo.timeA].p += 3;
      tabela[jogo.timeB].d += 1;
    } else if (pB > pA) {
      tabela[jogo.timeB].v += 1;
      tabela[jogo.timeB].p += 3;
      tabela[jogo.timeA].d += 1;
    } else {
      tabela[jogo.timeA].e += 1;
      tabela[jogo.timeA].p += 1;
      tabela[jogo.timeB].e += 1;
      tabela[jogo.timeB].p += 1;
    }
  });

  return ordenarTabelaGrupoFifa(Object.values(tabela), jogosProcessados);
};

const resolverConfrontosTerceiros = (melhoresTerceiros, slotsDisponiveis) => {
  const ordenados = [...melhoresTerceiros].sort((a, b) => compararCritBase(a, b));
  const gruposQualificados = ordenados.map((time) => time.grupo).sort().join('');
  const combinacaoOficial = THIRD_PLACE_ASSIGNMENTS[gruposQualificados];

  if (!combinacaoOficial) {
    throw new Error(`Combinação de terceiros não suportada: ${gruposQualificados}`);
  }

  const terceiroPorGrupo = Object.fromEntries(ordenados.map((time) => [`3${time.grupo}`, time.time]));
  return Object.fromEntries(
    slotsDisponiveis
      .filter((slot) => combinacaoOficial[String(slot.id)])
      .map((slot) => [slot.id, terceiroPorGrupo[combinacaoOficial[String(slot.id)]] || null])
  );
};

const buildThirdPlaceAllocation = (grupos, jogos, palpitesUsuario, mataConfig) => {
  const terceiros = Object.keys(grupos).map((grupo) => calcularTabelaGrupo(grupo, grupos, jogos, palpitesUsuario)[2]);
  return resolverConfrontosTerceiros(
    terceiros.slice().sort((a, b) => compararCritBase(a, b)).slice(0, 8),
    mataConfig.r32.filter((match) => match.refThirdGroups)
  );
};

const getR32Team = (ref, grupos, jogos, palpitesUsuario) => {
  const pos = Number(ref[0]);
  const grupo = ref[1];
  const tabela = calcularTabelaGrupo(grupo, grupos, jogos, palpitesUsuario);
  return tabela[pos - 1]?.time || null;
};

const getWinnerOfMatch = (matchId, source) => {
  if (matchId >= 73 && matchId <= 88) return source.dezeszeseisavos[matchId - 73];
  if (matchId >= 89 && matchId <= 96) return source.oitavas[matchId - 89];
  if (matchId >= 97 && matchId <= 100) return source.quartas[matchId - 97];
  if (matchId >= 101 && matchId <= 102) return source.semis[matchId - 101];
  return null;
};

const buildKnockoutFromDesiredWinners = ({ grupos, jogos, mataConfig, groupPicks }) => {
  const thirdPlaceAllocation = buildThirdPlaceAllocation(grupos, jogos, groupPicks, mataConfig);
  const bracket = {
    dezeszeseisavos: Array(mataConfig.r32.length).fill(''),
    oitavas: Array(mataConfig.r16.length).fill(''),
    quartas: Array(mataConfig.qf.length).fill(''),
    semis: Array(mataConfig.sf.length).fill(''),
    campeao: '',
    vice: '',
    terceiro: '',
    quarto: ''
  };

  const buildOptions = (phaseKey, match) => {
    if (phaseKey === 'dezeszeseisavos') {
      const teamA = getR32Team(match.refA, grupos, jogos, groupPicks);
      const teamB = match.refThirdGroups
        ? thirdPlaceAllocation[match.id]
        : getR32Team(match.refB, grupos, jogos, groupPicks);
      return [teamA, teamB].filter(Boolean);
    }
    return [getWinnerOfMatch(match.feedA, bracket), getWinnerOfMatch(match.feedB, bracket)].filter(Boolean);
  };

  const phases = [
    ['dezeszeseisavos', mataConfig.r32, INFERRED_KNOCKOUT.dezeszeseisavos],
    ['oitavas', mataConfig.r16, INFERRED_KNOCKOUT.oitavas],
    ['quartas', mataConfig.qf, INFERRED_KNOCKOUT.quartas],
    ['semis', mataConfig.sf, INFERRED_KNOCKOUT.semis]
  ];

  phases.forEach(([phaseKey, matches, inferredWinners]) => {
    matches.forEach((match, index) => {
      const desired = inferredWinners[index];
      const options = buildOptions(phaseKey, match);
      if (!options.includes(desired)) {
        throw new Error(`Vencedor inferido inválido em ${phaseKey}[${index}] (${desired}); opções reais: ${options.join(' x ')}`);
      }
      bracket[phaseKey][index] = desired;
    });
  });

  const finalists = bracket.semis;
  if (!finalists.includes(INFERRED_KNOCKOUT.campeao) || !finalists.includes(INFERRED_KNOCKOUT.vice)) {
    throw new Error('Campeão/vice não batem com os semifinalistas escolhidos.');
  }

  bracket.campeao = INFERRED_KNOCKOUT.campeao;
  bracket.vice = INFERRED_KNOCKOUT.vice;

  const semiLosers = [
    [bracket.quartas[0], bracket.quartas[1]].find((team) => team !== bracket.semis[0]),
    [bracket.quartas[2], bracket.quartas[3]].find((team) => team !== bracket.semis[1])
  ];

  if (!semiLosers.includes(INFERRED_KNOCKOUT.terceiro) || !semiLosers.includes(INFERRED_KNOCKOUT.quarto)) {
    throw new Error(`Terceiro/quarto inválidos; perdedores reais da semi: ${semiLosers.join(' x ')}`);
  }

  bracket.terceiro = INFERRED_KNOCKOUT.terceiro;
  bracket.quarto = INFERRED_KNOCKOUT.quarto;

  return { bracket, thirdPlaceAllocation };
};

const findMatchByPair = (matches, grupo, teamA, teamB) => {
  const normalizedA = normalizeText(teamA);
  const normalizedB = normalizeText(teamB);
  return matches.find((match) => (
    match.grupo === grupo &&
    (
      (normalizeText(match.timeA) === normalizedA && normalizeText(match.timeB) === normalizedB) ||
      (normalizeText(match.timeA) === normalizedB && normalizeText(match.timeB) === normalizedA)
    )
  )) || null;
};

const buildExplicitGroupBets = (groups, officialMatches) => {
  const allOfficialTeams = new Map(
    [...new Set(Object.values(groups).flat())].map((team) => [normalizeText(team), team])
  );
  const userBets = {};
  const missingPairs = [];

  Object.entries(EXPLICIT_GROUP_PICKS).forEach(([grupo, rows]) => {
    rows.forEach(([rawA, rawB, scoreA, scoreB]) => {
      const teamA = resolveTeamAlias(rawA, allOfficialTeams);
      const teamB = resolveTeamAlias(rawB, allOfficialTeams);
      if (!teamA || !teamB) {
        missingPairs.push(`${grupo}: ${rawA} x ${rawB}`);
        return;
      }

      const match = findMatchByPair(officialMatches, grupo, teamA, teamB);
      if (!match) {
        missingPairs.push(`${grupo}: ${teamA} x ${teamB}`);
        return;
      }

      userBets[match.id] = normalizeText(match.timeA) === normalizeText(teamA)
        ? { placarA: String(scoreA), placarB: String(scoreB) }
        : { placarA: String(scoreB), placarB: String(scoreA) };
    });
  });

  if (missingPairs.length) {
    throw new Error(`Falha ao mapear confrontos autoritativos: ${missingPairs.join('; ')}`);
  }

  return userBets;
};

const buildSpecialGroupJBets = (groupMatches) => {
  const sorted = sortMatchesByOfficialOrder(groupMatches);
  const teamNames = [...new Set(sorted.flatMap((match) => [match.timeA, match.timeB]))];
  const argentina = teamNames.find((team) => normalizeText(team) === 'argentina');
  const argelia = teamNames.find((team) => normalizeText(team) === 'argelia');
  if (!argentina || !argelia) {
    throw new Error(`Grupo J sem Argentina/Argélia: ${teamNames.join(', ')}`);
  }

  const adversario2 = sorted
    .find((match) => [match.timeA, match.timeB].some((team) => normalizeText(team) === 'argentina') && ![match.timeA, match.timeB].some((team) => normalizeText(team) === 'argelia'))
    ?.timeA === argentina
    ? sorted.find((match) => [match.timeA, match.timeB].includes(argentina) && ![match.timeA, match.timeB].includes(argelia)).timeB
    : sorted.find((match) => [match.timeA, match.timeB].includes(argentina) && ![match.timeA, match.timeB].includes(argelia)).timeA;

  const adversario3 = teamNames.find((team) => team !== argentina && team !== argelia && team !== adversario2);
  if (!adversario2 || !adversario3) {
    throw new Error(`Não foi possível inferir adversário 2/3 do Grupo J: ${teamNames.join(', ')}`);
  }

  const mappings = [
    [argentina, argelia, 2, 0],
    [adversario2, adversario3, 1, 1],
    [argentina, adversario2, 1, 0],
    [argelia, adversario3, 1, 1],
    [argentina, adversario3, 2, 1],
    [argelia, adversario2, 2, 0]
  ];

  const bets = {};
  mappings.forEach(([teamA, teamB, scoreA, scoreB]) => {
    const match = findMatchByPair(groupMatches, 'J', teamA, teamB);
    if (!match) {
      throw new Error(`Confronto do Grupo J não encontrado: ${teamA} x ${teamB}`);
    }
    bets[match.id] = normalizeText(match.timeA) === normalizeText(teamA)
      ? { placarA: String(scoreA), placarB: String(scoreB) }
      : { placarA: String(scoreB), placarB: String(scoreA) };
  });

  return {
    bets,
    mapping: {
      adversario2,
      adversario3,
      order: sortMatchesByOfficialOrder(groupMatches).map((match) => `${match.id}:${match.timeA} x ${match.timeB}`)
    }
  };
};

const buildOrderedGroupSequenceBets = (groupMatches, scoreSequence) => {
  const ordered = [...groupMatches];
  if (ordered.length !== scoreSequence.length) {
    throw new Error(`Grupo ${groupMatches[0]?.grupo || '?'} com quantidade inesperada de jogos.`);
  }

  const bets = {};
  ordered.forEach((match, index) => {
    const [scoreA, scoreB] = scoreSequence[index];
    bets[match.id] = { placarA: String(scoreA), placarB: String(scoreB) };
  });

  return {
    bets,
    order: ordered.map((match, index) => ({
      gameNumber: index + 1,
      matchId: match.id,
      fixture: `${match.timeA} x ${match.timeB}`,
      score: `${scoreSequence[index][0]}x${scoreSequence[index][1]}`
    }))
  };
};

const buildAllGroupBets = (groups, officialMatches) => {
  const baseBets = buildExplicitGroupBets(groups, officialMatches);
  const groupJBets = buildSpecialGroupJBets(officialMatches.filter((match) => match.grupo === 'J'));
  const groupKBets = buildOrderedGroupSequenceBets(officialMatches.filter((match) => match.grupo === 'K'), K_GROUP_SCORE_SEQUENCE);
  const groupLBets = buildOrderedGroupSequenceBets(officialMatches.filter((match) => match.grupo === 'L'), L_GROUP_SCORE_SEQUENCE);

  return {
    bets: {
      ...baseBets,
      ...groupJBets.bets,
      ...groupKBets.bets,
      ...groupLBets.bets
    },
    mappings: {
      J: groupJBets.mapping,
      K: groupKBets.order,
      L: groupLBets.order
    }
  };
};

const buildExpectedState = ({ existingUser, usersIndex, groups, officialMatches, mataConfig, profile }) => {
  const now = Date.now();
  const userId = existingUser?.id || now;
  const { bets: groupBets, mappings } = buildAllGroupBets(groups, officialMatches);
  const { bracket, thirdPlaceAllocation } = buildKnockoutFromDesiredWinners({
    grupos: groups,
    jogos: officialMatches,
    mataConfig,
    groupPicks: groupBets
  });

  const userRecord = {
    ...(existingUser || {}),
    id: userId,
    nome: USERNAME,
    nomeKey: normalizeUserNameKey(USERNAME),
    senha: PASSWORD,
    role: 'participant'
  };

  const submissions = {
    ...(profile.submissions || {}),
    [GROUP_SUBMISSION_FIELD]: profile.submissions?.[GROUP_SUBMISSION_FIELD] || now,
    [KNOCKOUT_SUBMISSION_FIELD]: profile.submissions?.[KNOCKOUT_SUBMISSION_FIELD] || now
  };

  const nextUsersIndex = {
    ...(usersIndex || {}),
    [String(userId)]: {
      id: userId,
      nome: userRecord.nome,
      nomeKey: userRecord.nomeKey,
      senha: userRecord.senha,
      role: userRecord.role
    }
  };

  return {
    userId,
    userRecord,
    usersIndex: nextUsersIndex,
    betsGames: groupBets,
    betsKnockout: bracket,
    submissions,
    profile: profile.userProfile || {},
    mappings,
    thirdPlaceAllocation
  };
};

const buildValidationSummary = ({ userId, usersIndex, betsGames, betsKnockout, submissions, groups, officialMatches, mataConfig, mappings }) => {
  const user = usersIndex[String(userId)] || usersIndex[userId];
  const groupMatchIds = officialMatches.map((match) => String(match.id));
  const missingGroupMatchIds = groupMatchIds.filter((matchId) => !betsGames[matchId] && !betsGames[Number(matchId)]);
  const normalizedBetsGames = Object.fromEntries(
    Object.entries(betsGames).map(([matchId, bet]) => [String(matchId), bet])
  );

  const phases = [
    ['dezeszeseisavos', mataConfig.r32.length],
    ['oitavas', mataConfig.r16.length],
    ['quartas', mataConfig.qf.length],
    ['semis', mataConfig.sf.length]
  ];

  const phaseCounts = Object.fromEntries(phases.map(([key]) => [key, Array.isArray(betsKnockout[key]) ? betsKnockout[key].length : 0]));
  const expectedKnockoutTotal = mataConfig.r32.length + mataConfig.r16.length + mataConfig.qf.length + mataConfig.sf.length + 4;
  const actualKnockoutTotal = phases.reduce((sum, [key]) => sum + phaseCounts[key], 0) + ['campeao', 'vice', 'terceiro', 'quarto'].filter((field) => Boolean(betsKnockout[field])).length;

  return {
    userExists: Boolean(user),
    loginWorks: Boolean(user && user.nome === USERNAME && user.senha === PASSWORD),
    groupPicksComplete: missingGroupMatchIds.length === 0,
    knockoutPicksComplete: actualKnockoutTotal === expectedKnockoutTotal,
    duplicateGroupPickIds: new Set(Object.keys(normalizedBetsGames)).size !== Object.keys(normalizedBetsGames).length,
    duplicateKnockoutSlots: phases.some(([key, length]) => phaseCounts[key] !== length),
    expectedGroupPicks: officialMatches.length,
    actualGroupPicks: Object.keys(normalizedBetsGames).length,
    expectedKnockoutPicks: expectedKnockoutTotal,
    actualKnockoutPicks: actualKnockoutTotal,
    submissions,
    mappings
  };
};

const assertValidationSummary = (summary) => {
  if (!summary.userExists) throw new Error('Validação falhou: usuário RoqueIA não existe.');
  if (!summary.loginWorks) throw new Error('Validação falhou: senha 1234 não bate com o fluxo de login do app.');
  if (!summary.groupPicksComplete) throw new Error('Validação falhou: palpites de grupos incompletos.');
  if (!summary.knockoutPicksComplete) throw new Error('Validação falhou: palpites de mata-mata incompletos.');
  if (summary.duplicateGroupPickIds) throw new Error('Validação falhou: duplicidade em palpites de grupos.');
  if (summary.duplicateKnockoutSlots) throw new Error('Validação falhou: duplicidade/estrutura inválida no mata-mata.');
  if (summary.actualGroupPicks !== summary.expectedGroupPicks) throw new Error(`Validação falhou: grupos ${summary.actualGroupPicks}/${summary.expectedGroupPicks}.`);
  if (summary.actualKnockoutPicks !== summary.expectedKnockoutPicks) throw new Error(`Validação falhou: mata ${summary.actualKnockoutPicks}/${summary.expectedKnockoutPicks}.`);
};

const writeReport = async (report) => {
  await fs.mkdir(REPORTS_DIR, { recursive: true });
  const targetPath = path.join(REPORTS_DIR, `seed-roqueia-report-${buildTimestampLabel()}.json`);
  await fs.writeFile(targetPath, JSON.stringify(report, null, 2));
  return targetPath;
};

const restoreTouchedEntries = async (backup) => {
  for (const [remotePath, payload] of backup) {
    await writeRemoteEntry(remotePath, payload);
  }
};

const run = async () => {
  const { grupos, jogos, mataConfig } = await loadAppData();
  const [usersIndex, meta] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(REMOTE_PATHS.meta)
  ]);

  const normalizedUsersIndex = usersIndex && typeof usersIndex === 'object' ? usersIndex : {};
  const existingUser = Object.values(normalizedUsersIndex).find((user) => normalizeUserNameKey(user?.nome || '') === normalizeUserNameKey(USERNAME)) || null;
  const existingUserId = existingUser?.id;

  const [existingProfile, existingBetsGames, existingBetsKnockout, existingSubmissions] = existingUserId
    ? await Promise.all([
        fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, existingUserId)),
        fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, existingUserId)),
        fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, existingUserId)),
        fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, existingUserId))
      ])
    : [null, null, null, null];

  const expected = buildExpectedState({
    existingUser,
    usersIndex: normalizedUsersIndex,
    groups: grupos,
    officialMatches: jogos,
    mataConfig,
    profile: {
      userProfile: existingProfile || {},
      betsGames: existingBetsGames || {},
      betsKnockout: existingBetsKnockout || {},
      submissions: existingSubmissions || {}
    }
  });

  const nextMeta = {
    ...(meta || {}),
    schemaVersion: meta?.schemaVersion || 3,
    updatedAt: Date.now(),
    userIds: Array.from(new Set([...(meta?.userIds || []), expected.userId]))
  };

  const touchedEntriesBackup = [
    [REMOTE_PATHS.meta, meta],
    [REMOTE_PATHS.usersIndex, normalizedUsersIndex],
    [getRemoteUserShardPath(REMOTE_PATHS.userProfiles, expected.userId), existingProfile],
    [getRemoteUserShardPath(REMOTE_PATHS.betsGames, expected.userId), existingBetsGames],
    [getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, expected.userId), existingBetsKnockout],
    [getRemoteUserShardPath(REMOTE_PATHS.submissions, expected.userId), existingSubmissions]
  ];

  if (!validateOnly) {
    try {
      await writeRemoteEntry(REMOTE_PATHS.meta, nextMeta);
      await writeRemoteEntry(REMOTE_PATHS.usersIndex, expected.usersIndex);
      await writeRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, expected.userId), expected.profile);
      await writeRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, expected.userId), expected.betsGames);
      await writeRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, expected.userId), expected.betsKnockout);
      await writeRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, expected.userId), expected.submissions);
    } catch (error) {
      await restoreTouchedEntries(touchedEntriesBackup);
      throw new Error(`Falha ao gravar RoqueIA; rollback executado. Motivo: ${error.message}`);
    }
  }

  const [validatedUsersIndex, validatedBetsGames, validatedBetsKnockout, validatedSubmissions] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, expected.userId)),
    fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, expected.userId)),
    fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, expected.userId))
  ]);

  const validationSummary = buildValidationSummary({
    userId: expected.userId,
    usersIndex: validatedUsersIndex || {},
    betsGames: validatedBetsGames || {},
    betsKnockout: validatedBetsKnockout || {},
    submissions: validatedSubmissions || {},
    groups: grupos,
    officialMatches: jogos,
    mataConfig,
    mappings: expected.mappings
  });

  assertValidationSummary(validationSummary);

  const report = {
    validateOnly,
    namespace: REMOTE_NAMESPACE,
    userId: expected.userId,
    userName: USERNAME,
    inferenceNotes: INFERENCE_NOTES,
    validationSummary,
    thirdPlaceAllocation: expected.thirdPlaceAllocation,
    touchedPaths: touchedEntriesBackup.map(([remotePath]) => remotePath)
  };

  const reportPath = await writeReport(report);
  console.log(JSON.stringify({ ...report, reportPath }, null, 2));
};

run().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});

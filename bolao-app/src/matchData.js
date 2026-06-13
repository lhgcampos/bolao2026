export const GRUPOS_2026 = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'Rep. Tcheca'],
  B: ['Canadá', 'Bósnia', 'Catar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['EUA', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Costa do Marfim', 'Curaçao', 'Equador'],
  F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Iraque', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'RD Congo', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá']
};

// Agenda oficial baseada nos horarios locais publicados pela FIFA; a exibicao em tela converte tudo para o horario do Brasil.
// `kickoffEt` guarda o instante real do jogo com o offset do estadio; `horaEt` preserva a hora local oficial publicada pela FIFA.
export const JOGOS_FASE_DE_GRUPOS = [
  { id: 1, grupo: 'A', timeA: 'México', timeB: 'África do Sul', kickoffEt: '2026-06-11T13:00:00-06:00', data: '11/06', hora: '16:00', horaEt: '13:00', local: 'Cid. México' },
  { id: 2, grupo: 'A', timeA: 'Coreia do Sul', timeB: 'Rep. Tcheca', kickoffEt: '2026-06-11T20:00:00-06:00', data: '11/06', hora: '23:00', horaEt: '20:00', local: 'Guadalajara' },
  { id: 3, grupo: 'A', timeA: 'Rep. Tcheca', timeB: 'África do Sul', kickoffEt: '2026-06-18T12:00:00-04:00', data: '18/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 4, grupo: 'A', timeA: 'México', timeB: 'Coreia do Sul', kickoffEt: '2026-06-18T19:00:00-06:00', data: '18/06', hora: '22:00', horaEt: '19:00', local: 'Guadalajara' },
  { id: 5, grupo: 'A', timeA: 'Rep. Tcheca', timeB: 'México', kickoffEt: '2026-06-24T19:00:00-06:00', data: '24/06', hora: '22:00', horaEt: '19:00', local: 'Cid. México' },
  { id: 6, grupo: 'A', timeA: 'África do Sul', timeB: 'Coreia do Sul', kickoffEt: '2026-06-24T19:00:00-06:00', data: '24/06', hora: '22:00', horaEt: '19:00', local: 'Monterrey' },
  { id: 7, grupo: 'B', timeA: 'Canadá', timeB: 'Bósnia', kickoffEt: '2026-06-12T15:00:00-04:00', data: '12/06', hora: '16:00', horaEt: '15:00', local: 'Toronto' },
  { id: 8, grupo: 'B', timeA: 'Catar', timeB: 'Suíça', kickoffEt: '2026-06-13T12:00:00-07:00', data: '13/06', hora: '16:00', horaEt: '12:00', local: 'San Francisco Bay Area' },
  { id: 9, grupo: 'B', timeA: 'Suíça', timeB: 'Bósnia', kickoffEt: '2026-06-18T12:00:00-07:00', data: '18/06', hora: '16:00', horaEt: '12:00', local: 'Los Angeles' },
  { id: 10, grupo: 'B', timeA: 'Canadá', timeB: 'Catar', kickoffEt: '2026-06-18T15:00:00-07:00', data: '18/06', hora: '19:00', horaEt: '15:00', local: 'Vancouver' },
  { id: 11, grupo: 'B', timeA: 'Suíça', timeB: 'Canadá', kickoffEt: '2026-06-24T12:00:00-07:00', data: '24/06', hora: '16:00', horaEt: '12:00', local: 'Vancouver' },
  { id: 12, grupo: 'B', timeA: 'Bósnia', timeB: 'Catar', kickoffEt: '2026-06-24T12:00:00-07:00', data: '24/06', hora: '16:00', horaEt: '12:00', local: 'Seattle' },
  { id: 13, grupo: 'C', timeA: 'Haiti', timeB: 'Escócia', kickoffEt: '2026-06-13T21:00:00-04:00', data: '13/06', hora: '22:00', horaEt: '21:00', local: 'Boston' },
  { id: 14, grupo: 'C', timeA: 'Brasil', timeB: 'Marrocos', kickoffEt: '2026-06-13T18:00:00-04:00', data: '13/06', hora: '19:00', horaEt: '18:00', local: 'Nova York/Nova Jersey' },
  { id: 15, grupo: 'C', timeA: 'Escócia', timeB: 'Marrocos', kickoffEt: '2026-06-19T18:00:00-04:00', data: '19/06', hora: '19:00', horaEt: '18:00', local: 'Boston' },
  { id: 16, grupo: 'C', timeA: 'Brasil', timeB: 'Haiti', kickoffEt: '2026-06-19T20:30:00-04:00', data: '19/06', hora: '21:30', horaEt: '20:30', local: 'Filadélfia' },
  { id: 17, grupo: 'C', timeA: 'Escócia', timeB: 'Brasil', kickoffEt: '2026-06-24T18:00:00-04:00', data: '24/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 18, grupo: 'C', timeA: 'Marrocos', timeB: 'Haiti', kickoffEt: '2026-06-24T18:00:00-04:00', data: '24/06', hora: '19:00', horaEt: '18:00', local: 'Atlanta' },
  { id: 19, grupo: 'D', timeA: 'EUA', timeB: 'Paraguai', kickoffEt: '2026-06-12T18:00:00-07:00', data: '12/06', hora: '22:00', horaEt: '18:00', local: 'Los Angeles' },
  { id: 20, grupo: 'D', timeA: 'Austrália', timeB: 'Turquia', kickoffEt: '2026-06-13T21:00:00-07:00', data: '14/06', hora: '01:00', horaEt: '21:00', local: 'Vancouver' },
  { id: 21, grupo: 'D', timeA: 'Turquia', timeB: 'Paraguai', kickoffEt: '2026-06-19T20:00:00-07:00', data: '20/06', hora: '00:00', horaEt: '20:00', local: 'San Francisco Bay Area' },
  { id: 22, grupo: 'D', timeA: 'EUA', timeB: 'Austrália', kickoffEt: '2026-06-19T12:00:00-07:00', data: '19/06', hora: '16:00', horaEt: '12:00', local: 'Seattle' },
  { id: 23, grupo: 'D', timeA: 'Turquia', timeB: 'EUA', kickoffEt: '2026-06-25T19:00:00-07:00', data: '25/06', hora: '23:00', horaEt: '19:00', local: 'Los Angeles' },
  { id: 24, grupo: 'D', timeA: 'Paraguai', timeB: 'Austrália', kickoffEt: '2026-06-25T19:00:00-07:00', data: '25/06', hora: '23:00', horaEt: '19:00', local: 'San Francisco Bay Area' },
  { id: 25, grupo: 'E', timeA: 'Costa do Marfim', timeB: 'Equador', kickoffEt: '2026-06-14T19:00:00-04:00', data: '14/06', hora: '20:00', horaEt: '19:00', local: 'Filadélfia' },
  { id: 26, grupo: 'E', timeA: 'Alemanha', timeB: 'Curaçao', kickoffEt: '2026-06-14T12:00:00-05:00', data: '14/06', hora: '14:00', horaEt: '12:00', local: 'Houston' },
  { id: 27, grupo: 'E', timeA: 'Alemanha', timeB: 'Costa do Marfim', kickoffEt: '2026-06-20T16:00:00-04:00', data: '20/06', hora: '17:00', horaEt: '16:00', local: 'Toronto' },
  { id: 28, grupo: 'E', timeA: 'Equador', timeB: 'Curaçao', kickoffEt: '2026-06-20T19:00:00-05:00', data: '20/06', hora: '21:00', horaEt: '19:00', local: 'Kansas City' },
  { id: 29, grupo: 'E', timeA: 'Curaçao', timeB: 'Costa do Marfim', kickoffEt: '2026-06-25T16:00:00-04:00', data: '25/06', hora: '17:00', horaEt: '16:00', local: 'Filadélfia' },
  { id: 30, grupo: 'E', timeA: 'Equador', timeB: 'Alemanha', kickoffEt: '2026-06-25T16:00:00-04:00', data: '25/06', hora: '17:00', horaEt: '16:00', local: 'Nova York/Nova Jersey' },
  { id: 31, grupo: 'F', timeA: 'Holanda', timeB: 'Japão', kickoffEt: '2026-06-14T15:00:00-05:00', data: '14/06', hora: '17:00', horaEt: '15:00', local: 'Dallas' },
  { id: 32, grupo: 'F', timeA: 'Suécia', timeB: 'Tunísia', kickoffEt: '2026-06-14T20:00:00-06:00', data: '14/06', hora: '23:00', horaEt: '20:00', local: 'Monterrey' },
  { id: 33, grupo: 'F', timeA: 'Holanda', timeB: 'Suécia', kickoffEt: '2026-06-20T12:00:00-05:00', data: '20/06', hora: '14:00', horaEt: '12:00', local: 'Houston' },
  { id: 34, grupo: 'F', timeA: 'Tunísia', timeB: 'Japão', kickoffEt: '2026-06-20T22:00:00-06:00', data: '21/06', hora: '01:00', horaEt: '22:00', local: 'Monterrey' },
  { id: 35, grupo: 'F', timeA: 'Japão', timeB: 'Suécia', kickoffEt: '2026-06-25T18:00:00-05:00', data: '25/06', hora: '20:00', horaEt: '18:00', local: 'Dallas' },
  { id: 36, grupo: 'F', timeA: 'Tunísia', timeB: 'Holanda', kickoffEt: '2026-06-25T18:00:00-05:00', data: '25/06', hora: '20:00', horaEt: '18:00', local: 'Kansas City' },
  { id: 37, grupo: 'G', timeA: 'Bélgica', timeB: 'Egito', kickoffEt: '2026-06-15T12:00:00-07:00', data: '15/06', hora: '16:00', horaEt: '12:00', local: 'Seattle' },
  { id: 38, grupo: 'G', timeA: 'Irã', timeB: 'Nova Zelândia', kickoffEt: '2026-06-15T18:00:00-07:00', data: '15/06', hora: '22:00', horaEt: '18:00', local: 'Los Angeles' },
  { id: 39, grupo: 'G', timeA: 'Bélgica', timeB: 'Irã', kickoffEt: '2026-06-21T12:00:00-07:00', data: '21/06', hora: '16:00', horaEt: '12:00', local: 'Los Angeles' },
  { id: 40, grupo: 'G', timeA: 'Nova Zelândia', timeB: 'Egito', kickoffEt: '2026-06-21T18:00:00-07:00', data: '21/06', hora: '22:00', horaEt: '18:00', local: 'Vancouver' },
  { id: 41, grupo: 'G', timeA: 'Egito', timeB: 'Irã', kickoffEt: '2026-06-26T20:00:00-07:00', data: '27/06', hora: '00:00', horaEt: '20:00', local: 'Seattle' },
  { id: 42, grupo: 'G', timeA: 'Nova Zelândia', timeB: 'Bélgica', kickoffEt: '2026-06-26T20:00:00-07:00', data: '27/06', hora: '00:00', horaEt: '20:00', local: 'Vancouver' },
  { id: 43, grupo: 'H', timeA: 'Arábia Saudita', timeB: 'Uruguai', kickoffEt: '2026-06-15T18:00:00-04:00', data: '15/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 44, grupo: 'H', timeA: 'Espanha', timeB: 'Cabo Verde', kickoffEt: '2026-06-15T12:00:00-04:00', data: '15/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 45, grupo: 'H', timeA: 'Uruguai', timeB: 'Cabo Verde', kickoffEt: '2026-06-21T18:00:00-04:00', data: '21/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 46, grupo: 'H', timeA: 'Espanha', timeB: 'Arábia Saudita', kickoffEt: '2026-06-21T12:00:00-04:00', data: '21/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 47, grupo: 'H', timeA: 'Cabo Verde', timeB: 'Arábia Saudita', kickoffEt: '2026-06-26T19:00:00-05:00', data: '26/06', hora: '21:00', horaEt: '19:00', local: 'Houston' },
  { id: 48, grupo: 'H', timeA: 'Uruguai', timeB: 'Espanha', kickoffEt: '2026-06-26T18:00:00-06:00', data: '26/06', hora: '21:00', horaEt: '18:00', local: 'Guadalajara' },
  { id: 49, grupo: 'I', timeA: 'Iraque', timeB: 'Noruega', kickoffEt: '2026-06-16T18:00:00-04:00', data: '16/06', hora: '19:00', horaEt: '18:00', local: 'Boston' },
  { id: 50, grupo: 'I', timeA: 'França', timeB: 'Senegal', kickoffEt: '2026-06-16T15:00:00-04:00', data: '16/06', hora: '16:00', horaEt: '15:00', local: 'Nova York/Nova Jersey' },
  { id: 51, grupo: 'I', timeA: 'Noruega', timeB: 'Senegal', kickoffEt: '2026-06-22T20:00:00-04:00', data: '22/06', hora: '21:00', horaEt: '20:00', local: 'Dallas' },
  { id: 52, grupo: 'I', timeA: 'França', timeB: 'Iraque', kickoffEt: '2026-06-22T17:00:00-04:00', data: '22/06', hora: '18:00', horaEt: '17:00', local: 'Nova York/Nova Jersey' },
  { id: 53, grupo: 'I', timeA: 'Noruega', timeB: 'França', kickoffEt: '2026-06-26T15:00:00-04:00', data: '26/06', hora: '16:00', horaEt: '15:00', local: 'Boston' },
  { id: 54, grupo: 'I', timeA: 'Senegal', timeB: 'Iraque', kickoffEt: '2026-06-26T15:00:00-04:00', data: '26/06', hora: '16:00', horaEt: '15:00', local: 'Toronto' },
  { id: 55, grupo: 'J', timeA: 'Áustria', timeB: 'Jordânia', kickoffEt: '2026-06-16T21:00:00-07:00', data: '17/06', hora: '01:00', horaEt: '21:00', local: 'San Francisco Bay Area' },
  { id: 56, grupo: 'J', timeA: 'Argentina', timeB: 'Argélia', kickoffEt: '2026-06-16T20:00:00-05:00', data: '16/06', hora: '22:00', horaEt: '20:00', local: 'Kansas City' },
  { id: 57, grupo: 'J', timeA: 'Argentina', timeB: 'Áustria', kickoffEt: '2026-06-22T12:00:00-05:00', data: '22/06', hora: '14:00', horaEt: '12:00', local: 'Dallas' },
  { id: 58, grupo: 'J', timeA: 'Jordânia', timeB: 'Argélia', kickoffEt: '2026-06-22T20:00:00-07:00', data: '23/06', hora: '00:00', horaEt: '20:00', local: 'San Francisco Bay Area' },
  { id: 59, grupo: 'J', timeA: 'Argélia', timeB: 'Áustria', kickoffEt: '2026-06-27T21:00:00-05:00', data: '27/06', hora: '23:00', horaEt: '21:00', local: 'Kansas City' },
  { id: 60, grupo: 'J', timeA: 'Jordânia', timeB: 'Argentina', kickoffEt: '2026-06-27T21:00:00-05:00', data: '27/06', hora: '23:00', horaEt: '21:00', local: 'Dallas' },
  { id: 61, grupo: 'K', timeA: 'Portugal', timeB: 'RD Congo', kickoffEt: '2026-06-17T12:00:00-05:00', data: '17/06', hora: '14:00', horaEt: '12:00', local: 'Houston' },
  { id: 62, grupo: 'K', timeA: 'Uzbequistão', timeB: 'Colômbia', kickoffEt: '2026-06-17T20:00:00-06:00', data: '17/06', hora: '23:00', horaEt: '20:00', local: 'Cid. México' },
  { id: 63, grupo: 'K', timeA: 'Portugal', timeB: 'Uzbequistão', kickoffEt: '2026-06-23T12:00:00-05:00', data: '23/06', hora: '14:00', horaEt: '12:00', local: 'Houston' },
  { id: 64, grupo: 'K', timeA: 'Colômbia', timeB: 'RD Congo', kickoffEt: '2026-06-23T20:00:00-06:00', data: '23/06', hora: '23:00', horaEt: '20:00', local: 'Guadalajara' },
  { id: 65, grupo: 'K', timeA: 'Colômbia', timeB: 'Portugal', kickoffEt: '2026-06-27T19:30:00-04:00', data: '27/06', hora: '20:30', horaEt: '19:30', local: 'Miami' },
  { id: 66, grupo: 'K', timeA: 'RD Congo', timeB: 'Uzbequistão', kickoffEt: '2026-06-27T19:30:00-04:00', data: '27/06', hora: '20:30', horaEt: '19:30', local: 'Atlanta' },
  { id: 67, grupo: 'L', timeA: 'Gana', timeB: 'Panamá', kickoffEt: '2026-06-17T19:00:00-04:00', data: '17/06', hora: '20:00', horaEt: '19:00', local: 'Toronto' },
  { id: 68, grupo: 'L', timeA: 'Inglaterra', timeB: 'Croácia', kickoffEt: '2026-06-17T15:00:00-05:00', data: '17/06', hora: '17:00', horaEt: '15:00', local: 'Dallas' },
  { id: 69, grupo: 'L', timeA: 'Inglaterra', timeB: 'Gana', kickoffEt: '2026-06-23T16:00:00-04:00', data: '23/06', hora: '17:00', horaEt: '16:00', local: 'Boston' },
  { id: 70, grupo: 'L', timeA: 'Panamá', timeB: 'Croácia', kickoffEt: '2026-06-23T19:00:00-04:00', data: '23/06', hora: '20:00', horaEt: '19:00', local: 'Toronto' },
  { id: 71, grupo: 'L', timeA: 'Panamá', timeB: 'Inglaterra', kickoffEt: '2026-06-27T17:00:00-04:00', data: '27/06', hora: '18:00', horaEt: '17:00', local: 'Nova York/Nova Jersey' },
  { id: 72, grupo: 'L', timeA: 'Croácia', timeB: 'Gana', kickoffEt: '2026-06-27T17:00:00-04:00', data: '27/06', hora: '18:00', horaEt: '17:00', local: 'Filadélfia' }
];

export const buildPairKey = (timeA, timeB) => [timeA, timeB].sort().join('||');

export const placarPreenchido = (placarA, placarB) => (
  placarA !== '' &&
  placarB !== '' &&
  placarA !== undefined &&
  placarB !== undefined &&
  placarA !== null &&
  placarB !== null
);

export const isMatchFinal = (match) => Boolean(match?.isFinal ?? match?.resultadoFinal);

const buildResultHistory = (match) => (
  Array.isArray(match?.resultHistory)
    ? match.resultHistory.filter((entry) => entry && typeof entry === 'object')
    : []
);

export const buildEmptyMatchRecord = (match) => ({
  ...match,
  placarA: '',
  placarB: '',
  isFinal: false,
  resultHistory: [],
  resultSource: '',
  resultSourceLabel: '',
  resultExternalMatchId: '',
  resultExternalStatus: '',
  resultUpdatedAt: 0,
  resultConfidence: '',
  resultOrigin: '',
  manualOverride: false,
  manualOverrideAt: 0,
  manualOverrideBy: '',
  manualOverrideReason: '',
  lastAutoSyncAt: 0
});

const mergePersistedMatchState = (baseMatch, persistedMatch, override = {}) => ({
  ...baseMatch,
  placarA: override.placarA ?? persistedMatch?.placarA ?? '',
  placarB: override.placarB ?? persistedMatch?.placarB ?? '',
  isFinal: override.isFinal ?? isMatchFinal(persistedMatch),
  resultHistory: buildResultHistory(persistedMatch),
  resultSource: persistedMatch?.resultSource || '',
  resultSourceLabel: persistedMatch?.resultSourceLabel || '',
  resultExternalMatchId: persistedMatch?.resultExternalMatchId || '',
  resultExternalStatus: persistedMatch?.resultExternalStatus || '',
  resultUpdatedAt: Number(persistedMatch?.resultUpdatedAt || 0),
  resultConfidence: persistedMatch?.resultConfidence || '',
  resultOrigin: persistedMatch?.resultOrigin || '',
  manualOverride: Boolean(persistedMatch?.manualOverride),
  manualOverrideAt: Number(persistedMatch?.manualOverrideAt || 0),
  manualOverrideBy: persistedMatch?.manualOverrideBy || '',
  manualOverrideReason: persistedMatch?.manualOverrideReason || '',
  lastAutoSyncAt: Number(persistedMatch?.lastAutoSyncAt || 0)
});

export const findOfficialMatchForPair = (match) => {
  if (!match?.grupo || !match?.timeA || !match?.timeB) return null;
  const pairKey = buildPairKey(match.timeA, match.timeB);
  return JOGOS_FASE_DE_GRUPOS.find(
    (officialMatch) => officialMatch.grupo === match.grupo && buildPairKey(officialMatch.timeA, officialMatch.timeB) === pairKey
  ) || null;
};

export const normalizePersistedGameData = (matches = [], betsGames = {}) => {
  const officialMatches = JOGOS_FASE_DE_GRUPOS.map(buildEmptyMatchRecord);
  const officialById = new Map(officialMatches.map((match) => [match.id, match]));
  const migrationBySourceId = new Map();

  matches.forEach((match) => {
    const officialMatch = findOfficialMatchForPair(match);
    if (!officialMatch) return;

    const swapScores = officialMatch.timeA === match.timeB && officialMatch.timeB === match.timeA;
    migrationBySourceId.set(String(match.id), { targetId: officialMatch.id, swapScores });

    officialById.set(
      officialMatch.id,
      mergePersistedMatchState(officialById.get(officialMatch.id), match, {
        placarA: swapScores ? (match.placarB ?? '') : (match.placarA ?? ''),
        placarB: swapScores ? (match.placarA ?? '') : (match.placarB ?? '')
      })
    );
  });

  const normalizedBetsGames = Object.fromEntries(
    Object.entries(betsGames || {}).map(([userId, userBets]) => {
      const nextUserBets = {};

      Object.entries(userBets || {}).forEach(([matchId, bet]) => {
        const migration = migrationBySourceId.get(String(matchId));
        if (!migration || !bet) return;

        nextUserBets[migration.targetId] = migration.swapScores
          ? { ...bet, placarA: bet.placarB ?? '', placarB: bet.placarA ?? '' }
          : { ...bet };
      });

      return [userId, nextUserBets];
    })
  );

  return {
    matches: [...officialById.values()],
    betsGames: normalizedBetsGames
  };
};

export const gerarJogosIniciais = () => JOGOS_FASE_DE_GRUPOS.map(buildEmptyMatchRecord);

export const formatBrazilMatchSchedule = (match) => {
  if (match?.kickoffEt) {
    const kickoff = new Date(match.kickoffEt);
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(kickoff);

    const getPart = (type) => parts.find((part) => part.type === type)?.value || '00';
    const day = Number(getPart('day'));
    const month = Number(getPart('month'));
    const time = `${getPart('hour')}:${getPart('minute')}`;

    return {
      day,
      month,
      time,
      label: `${day}/${month} - ${time} BR`
    };
  }

  const [day = '01', month = '01'] = String(match?.data || '01/01').split('/');
  return {
    day: Number(day),
    month: Number(month),
    time: match?.hora || '00:00',
    label: `${Number(day)}/${Number(month)} - ${match?.hora || '00:00'} BR`
  };
};

export const formatOfficialKickoffHint = (match) => {
  if (!match?.kickoffEt || !match?.horaEt) return null;
  return `Oficial FIFA: ${match.horaEt} no horario local do estadio`;
};

export const parseMatchDateTime = (match) => {
  if (match?.kickoffEt) {
    return new Date(match.kickoffEt).getTime();
  }

  const [day, month] = String(match?.data || '01/01').split('/').map(Number);
  const [hour, minute] = String(match?.hora || '00:00').split(':').map(Number);
  return new Date(2026, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime();
};

export const sortMatchesChronologically = (matches = []) => [...matches].sort((a, b) => (
  parseMatchDateTime(a) - parseMatchDateTime(b) ||
  a.id - b.id
));

export const getMatchDayKey = (match) => {
  const date = match?.kickoffEt ? new Date(match.kickoffEt) : new Date(parseMatchDateTime(match));
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

export const formatMatchDayLabel = (match) => {
  const date = match?.kickoffEt ? new Date(match.kickoffEt) : new Date(parseMatchDateTime(match));
  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);
};

export const buildChronologicalMatchGroups = (matches = []) => {
  const grouped = [];
  const sorted = sortMatchesChronologically(matches);

  sorted.forEach((match) => {
    const dayKey = getMatchDayKey(match);
    const currentGroup = grouped[grouped.length - 1];

    if (currentGroup?.dayKey === dayKey) {
      currentGroup.matches.push(match);
      return;
    }

    grouped.push({
      dayKey,
      dayLabel: formatMatchDayLabel(match),
      matches: [match]
    });
  });

  return grouped;
};

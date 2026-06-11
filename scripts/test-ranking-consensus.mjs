import assert from 'node:assert/strict';
import {
  buildConsensusDashboard,
  buildGameConsensus,
  buildNarrativeLines,
  calculateDivergenceScore,
  getConsensusEligibleUsers
} from '../bolao-app/src/rankingConsensus.js';

const submissionFields = {
  JOGOS: 'jogosAt',
  MATA: 'mataAt'
};

const isAdminUser = (user) => user?.role === 'admin';

const hasFilledScore = (pick) => pick?.placarA !== '' && pick?.placarB !== '' && pick?.placarA !== undefined && pick?.placarB !== undefined;

const usuarioPreencheuTodosOsJogos = (games, userGames) => games.every((game) => hasFilledScore(userGames?.[game.id]));

const usuarioPreencheuMataCompleta = (bracket = {}) => (
  Array.isArray(bracket.dezeszeseisavos) &&
  bracket.dezeszeseisavos.length === 2 &&
  bracket.dezeszeseisavos.every(Boolean) &&
  Array.isArray(bracket.oitavas) &&
  bracket.oitavas.length === 1 &&
  bracket.oitavas.every(Boolean) &&
  Array.isArray(bracket.quartas) &&
  bracket.quartas.length === 1 &&
  bracket.quartas.every(Boolean) &&
  Array.isArray(bracket.semis) &&
  bracket.semis.length === 1 &&
  bracket.semis.every(Boolean) &&
  [bracket.campeao, bracket.vice, bracket.terceiro, bracket.quarto].every(Boolean)
);

const games = [
  { id: 1, timeA: 'Brasil', timeB: 'Marrocos', placarA: '2', placarB: '1' },
  { id: 2, timeA: 'Haiti', timeB: 'Escócia', placarA: '1', placarB: '1' },
  { id: 3, timeA: 'Sem Rank', timeB: 'Brasil', placarA: '', placarB: '' }
];

const teamRankings = {
  Brasil: { officialRank: 6 },
  Marrocos: { officialRank: 8 },
  Haiti: { officialRank: 83 },
  Escócia: { officialRank: 43 }
};

const users = [
  { id: 1, nome: 'Ana', role: 'participant' },
  { id: 2, nome: 'Beto', role: 'participant' },
  { id: 3, nome: 'Caio', role: 'participant' },
  { id: 4, nome: 'Dana', role: 'participant' },
  { id: 99, nome: 'Admin', role: 'admin' }
];

const completeBracket = {
  dezeszeseisavos: ['Brasil', 'Escócia'],
  oitavas: ['Brasil'],
  quartas: ['Brasil'],
  semis: ['Brasil'],
  campeao: 'Brasil',
  vice: 'Escócia',
  terceiro: 'Marrocos',
  quarto: 'Haiti'
};

const submissions = {
  1: { jogosAt: 1, mataAt: 2 },
  2: { jogosAt: 1, mataAt: 2 },
  3: { mataAt: 2 },
  4: { jogosAt: 1, mataAt: 2 },
  99: { jogosAt: 1, mataAt: 2 }
};

const betsGames = {
  1: {
    1: { placarA: '2', placarB: '1' },
    2: { placarA: '1', placarB: '0' },
    3: { placarA: '0', placarB: '2' }
  },
  2: {
    1: { placarA: '2', placarB: '1' },
    2: { placarA: '0', placarB: '2' },
    3: { placarA: '1', placarB: '3' }
  },
  3: {
    1: { placarA: '1', placarB: '1' },
    2: { placarA: '0', placarB: '1' },
    3: { placarA: '0', placarB: '1' }
  },
  4: {
    1: { placarA: '3', placarB: '' },
    2: { placarA: '2', placarB: '0' },
    3: { placarA: '0', placarB: '0' }
  },
  99: {
    1: { placarA: '4', placarB: '0' },
    2: { placarA: '0', placarB: '0' },
    3: { placarA: '1', placarB: '0' }
  }
};

const betsKnockout = {
  1: structuredClone(completeBracket),
  2: {
    ...structuredClone(completeBracket),
    vice: 'Argentina'
  },
  3: structuredClone(completeBracket),
  4: {
    ...structuredClone(completeBracket),
    semis: [''],
    campeao: ''
  },
  99: structuredClone(completeBracket)
};

const ranking = [
  { id: 1, nome: 'Ana', ptsJogos: 40, ptsMataMata: 120, total: 160, exatos: 2 },
  { id: 2, nome: 'Beto', ptsJogos: 20, ptsMataMata: 90, total: 110, exatos: 1 }
];

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

assert.deepEqual(eligibleUsers.map((user) => user.id), [1, 2], 'admin, sem jogosAt, sem mataAt e rascunhos incompletos devem sair da base');

const gameConsensus = buildGameConsensus({
  matches: games,
  eligibleUsers,
  betsGames,
  teamRankings
});

assert.equal(gameConsensus.mostCommonPick.match.id, 1, 'o palpite mais comum deve usar o jogo com maior contagem');
assert.equal(gameConsensus.mostCommonPick.scoreLabel, '2 x 1', 'o placar mais comum deve ser 2 x 1');
assert.equal(gameConsensus.biggestUpset.match.id, 2, 'a maior zebra deve ser Haiti x Escócia');
assert.equal(gameConsensus.biggestUpset.underdogTeam, 'Haiti', 'a zebra deve escolher o pior ranqueado vencendo o melhor');
assert.equal(gameConsensus.matches.find((match) => match.match.id === 3)?.biggestUpset, undefined, 'times sem ranking nao entram na zebra');
assert.ok(
  calculateDivergenceScore({ uniqueScores: 3, uniqueOutcomes: 3, topScoreShare: 1 / 3 }) >
  calculateDivergenceScore({ uniqueScores: 1, uniqueOutcomes: 1, topScoreShare: 1 }),
  'divergencia precisa subir com mais placares distintos'
);

const dashboard = buildConsensusDashboard({
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
});

assert.equal(dashboard.eligibleCount, 2, 'a base elegivel deve ter dois apostadores');
assert.equal(dashboard.knockoutConsensus.champion[0].team, 'Brasil', 'Brasil deve liderar o consenso de campeao');
assert.equal(dashboard.knockoutConsensus.champion[0].supporterNames[0], 'Ana', 'o consenso deve carregar os nomes dos apostadores');
assert.equal(dashboard.biggestUpset.supporterNames[0], 'Ana', 'a zebra deve carregar o nome de quem bancou o resultado');
assert.equal(dashboard.finalizedMatches[0].match.id, 2, 'o ultimo jogo finalizado deve aparecer primeiro para a narrativa');

const smallDashboard = buildConsensusDashboard({
  users: [users[0]],
  submissions,
  betsGames,
  betsKnockout,
  games,
  ranking: [ranking[0]],
  teamRankings,
  submissionFields,
  isAdminUser,
  usuarioPreencheuTodosOsJogos,
  usuarioPreencheuMataCompleta
});

assert.equal(smallDashboard.insufficientSample, true, 'menos de dois elegiveis precisa virar estado vazio');
assert.deepEqual(smallDashboard.narrativeLines, [], 'narrativa nao pode usar dados quando a amostra eh insuficiente');

const narrativeA = buildNarrativeLines({ dashboard, ranking });
const narrativeB = buildNarrativeLines({ dashboard, ranking });
assert.deepEqual(narrativeA, narrativeB, 'narrativa precisa ser deterministica');
assert.ok(narrativeA.some((line) => line.includes('Ana')), 'linhas narrativas devem citar nomes quando falam de apostadores especificos');

const zeroRankingNarrative = buildNarrativeLines({
  dashboard,
  ranking: [
    { id: 1, nome: 'Ana', ptsJogos: 0, ptsMataMata: 0, total: 0, exatos: 0 },
    { id: 2, nome: 'Beto', ptsJogos: 0, ptsMataMata: 0, total: 0, exatos: 0 }
  ]
});
assert.ok(!zeroRankingNarrative.some((line) => line.includes('lidera o ranking geral com 0 pts.')), 'nao deve falar de lider geral zerado');
assert.ok(!zeroRankingNarrative.some((line) => line.includes('lidera o mata-mata com 0 pts.')), 'nao deve falar de lider de mata zerado');

console.log('ranking consensus tests: ok');

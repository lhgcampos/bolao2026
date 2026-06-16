import assert from 'node:assert/strict';
import {
  buildEditorialStatsDashboard,
  buildHomeEditorialInsights,
  buildRankingFooterComments,
  calculateUserStyleProfiles,
  formatEditorialStatLine,
  getEligiblePredictionUsers
} from '../bolao-app/src/editorialStats.js';

const submissionFields = {
  JOGOS: 'jogosAt',
  MATA: 'mataAt'
};

const phaseLengths = {
  dezeszeseisavos: 16,
  oitavas: 8,
  quartas: 4,
  semis: 2
};

const isAdminUser = (user) => user?.role === 'admin';
const hasFilledScore = (pick) => pick?.placarA !== '' && pick?.placarB !== '' && pick?.placarA !== undefined && pick?.placarB !== undefined;
const usuarioPreencheuTodosOsJogos = (games, userGames) => games.every((game) => hasFilledScore(userGames?.[game.id]));
const usuarioPreencheuMataCompleta = (bracket = {}) => (
  Array.isArray(bracket.dezeszeseisavos) &&
  bracket.dezeszeseisavos.length === phaseLengths.dezeszeseisavos &&
  bracket.dezeszeseisavos.every(Boolean) &&
  Array.isArray(bracket.oitavas) &&
  bracket.oitavas.length === phaseLengths.oitavas &&
  bracket.oitavas.every(Boolean) &&
  Array.isArray(bracket.quartas) &&
  bracket.quartas.length === phaseLengths.quartas &&
  bracket.quartas.every(Boolean) &&
  Array.isArray(bracket.semis) &&
  bracket.semis.length === phaseLengths.semis &&
  bracket.semis.every(Boolean) &&
  [bracket.campeao, bracket.vice, bracket.terceiro, bracket.quarto].every(Boolean)
);

const fillRound = (size, team) => Array.from({ length: size }, () => team);

const buildBracket = ({ phaseTeam, campeao, vice, terceiro, quarto }) => ({
  dezeszeseisavos: fillRound(phaseLengths.dezeszeseisavos, phaseTeam),
  oitavas: fillRound(phaseLengths.oitavas, phaseTeam),
  quartas: fillRound(phaseLengths.quartas, phaseTeam),
  semis: fillRound(phaseLengths.semis, phaseTeam),
  campeao,
  vice,
  terceiro,
  quarto
});

const games = [
  { id: 1, timeA: 'Brasil', timeB: 'Haiti', placarA: '3', placarB: '0', isFinal: true },
  { id: 2, timeA: 'França', timeB: 'Argentina', placarA: '1', placarB: '0', isFinal: true },
  { id: 3, timeA: 'Marrocos', timeB: 'Escócia', placarA: '1', placarB: '2', isFinal: true },
  { id: 4, timeA: 'Fantasia', timeB: 'Brasil', placarA: '0', placarB: '2', isFinal: true },
  { id: 5, timeA: 'Espanha', timeB: 'Portugal', placarA: '3', placarB: '2', isFinal: true },
  { id: 6, timeA: 'França', timeB: 'Alemanha', placarA: '2', placarB: '1', isFinal: true },
  { id: 7, timeA: 'França', timeB: 'Espanha', placarA: '', placarB: '', isFinal: false }
];

const teamRankings = {
  Brasil: { officialRank: 6 },
  Haiti: { officialRank: 83 },
  França: { officialRank: 1 },
  Argentina: { officialRank: 3 },
  Marrocos: { officialRank: 8 },
  Escócia: { officialRank: 43 },
  Espanha: { officialRank: 2 },
  Portugal: { officialRank: 5 },
  Alemanha: { officialRank: 10 }
};

const users = [
  { id: 1, nome: 'Ana', role: 'participant' },
  { id: 2, nome: 'Beto', role: 'participant' },
  { id: 3, nome: 'Caio', role: 'participant' },
  { id: 4, nome: 'Duda', role: 'participant' },
  { id: 5, nome: 'Eva', role: 'participant' },
  { id: 99, nome: 'Admin', role: 'admin' }
];

const submissions = {
  1: { jogosAt: 1, mataAt: 2 },
  2: { jogosAt: 1, mataAt: 2 },
  3: { jogosAt: 1, mataAt: 2 },
  4: { jogosAt: 1, mataAt: 2 },
  5: { jogosAt: 1 },
  99: { jogosAt: 1, mataAt: 2 }
};

const betsGames = {
  1: {
    1: { placarA: '2', placarB: '0' },
    2: { placarA: '1', placarB: '0' },
    3: { placarA: '2', placarB: '1' },
    4: { placarA: '0', placarB: '3' },
    5: { placarA: '3', placarB: '1' },
    6: { placarA: '2', placarB: '1' },
    7: { placarA: '2', placarB: '1' }
  },
  2: {
    1: { placarA: '0', placarB: '2' },
    2: { placarA: '0', placarB: '1' },
    3: { placarA: '0', placarB: '2' },
    4: { placarA: '3', placarB: '1' },
    5: { placarA: '1', placarB: '2' },
    6: { placarA: '1', placarB: '2' },
    7: { placarA: '0', placarB: '3' }
  },
  3: {
    1: { placarA: '2', placarB: '0' },
    2: { placarA: '0', placarB: '0' },
    3: { placarA: '1', placarB: '1' },
    4: { placarA: '0', placarB: '1' },
    5: { placarA: '1', placarB: '1' },
    6: { placarA: '0', placarB: '1' },
    7: { placarA: '1', placarB: '0' }
  },
  4: {
    1: { placarA: '4', placarB: '1' },
    2: { placarA: '3', placarB: '2' },
    3: { placarA: '3', placarB: '3' },
    4: { placarA: '0', placarB: '3' },
    5: { placarA: '3', placarB: '2' },
    6: { placarA: '4', placarB: '2' },
    7: { placarA: '4', placarB: '3' }
  },
  5: {
    1: { placarA: '1', placarB: '0' },
    2: { placarA: '1', placarB: '' }
  },
  99: {
    1: { placarA: '3', placarB: '0' },
    2: { placarA: '2', placarB: '0' },
    3: { placarA: '0', placarB: '0' },
    4: { placarA: '0', placarB: '2' },
    5: { placarA: '2', placarB: '1' },
    6: { placarA: '1', placarB: '0' },
    7: { placarA: '1', placarB: '1' }
  }
};

const betsKnockout = {
  1: buildBracket({ phaseTeam: 'Brasil', campeao: 'Brasil', vice: 'França', terceiro: 'Espanha', quarto: 'Alemanha' }),
  2: buildBracket({ phaseTeam: 'Argentina', campeao: 'Argentina', vice: 'Alemanha', terceiro: 'Portugal', quarto: 'Haiti' }),
  3: buildBracket({ phaseTeam: 'Brasil', campeao: 'Brasil', vice: 'França', terceiro: 'Marrocos', quarto: 'Escócia' }),
  4: buildBracket({ phaseTeam: 'Alemanha', campeao: 'Alemanha', vice: 'Marrocos', terceiro: 'Portugal', quarto: 'Espanha' }),
  5: {
    ...buildBracket({ phaseTeam: 'Brasil', campeao: 'Brasil', vice: 'França', terceiro: 'Espanha', quarto: 'Alemanha' }),
    semis: ['Brasil']
  },
  99: buildBracket({ phaseTeam: 'Brasil', campeao: 'Brasil', vice: 'França', terceiro: 'Espanha', quarto: 'Alemanha' })
};

const baseInput = {
  users,
  submissions,
  betsGames,
  betsKnockout,
  games,
  teamRankings,
  submissionFields,
  isAdminUser,
  usuarioPreencheuTodosOsJogos,
  usuarioPreencheuMataCompleta
};

const eligibleUsers = getEligiblePredictionUsers(baseInput);
assert.deepEqual(eligibleUsers.map((user) => user.id), [1, 2, 3, 4], 'admin e usuario incompleto nao entram na base comparativa');

const profileState = calculateUserStyleProfiles(baseInput);
const profileByName = Object.fromEntries(profileState.profiles.map((profile) => [profile.userName, profile]));
const getTopProfileName = (selector) => [...profileState.profiles]
  .sort((left, right) => selector(right) - selector(left) || left.userName.localeCompare(right.userName, 'pt-BR'))[0]
  .userName;

assert.equal(profileByName.Beto.upsetCount, 6, 'a zebra precisa usar ranking FIFA e ignorar o jogo sem ranking');
assert.equal(profileByName.Caio.nearMissCount, 2, 'near miss deve contar so jogos com resultado oficial');

const dashboardA = buildEditorialStatsDashboard(baseInput);
const dashboardB = buildEditorialStatsDashboard(baseInput);

assert.equal(
  dashboardA.stats.consensusFollowerIndex.userName,
  getTopProfileName((profile) => profile.consensusFollowerHits + profile.consensusFollowerPct),
  'consensusFollowerIndex deve achar quem mais segue o placar comum'
);
assert.equal(
  dashboardA.stats.contrarianIndex.userName,
  getTopProfileName((profile) => profile.contrarianScore),
  'contrarianIndex deve achar quem mais foge do consenso'
);
assert.equal(
  dashboardA.stats.elasticScoreIndex.userName,
  getTopProfileName((profile) => profile.elasticScoreIndex),
  'elasticScoreIndex deve apontar o perfil mais aberto'
);
assert.equal(
  dashboardA.stats.lowScoreIndex.userName,
  getTopProfileName((profile) => profile.lowScoreIndex),
  'lowScoreIndex deve apontar o perfil mais fechado'
);
assert.equal(
  dashboardA.stats.upsetHunterIndex.userName,
  getTopProfileName((profile) => profile.upsetHunterIndex),
  'upsetHunterIndex deve apontar o maior cacador de zebra'
);
assert.equal(
  dashboardA.stats.drawLoverIndex.userName,
  getTopProfileName((profile) => profile.drawCount + profile.drawPct),
  'drawLoverIndex deve achar quem mais apostou em empate'
);
assert.equal(
  dashboardA.stats.lonelyPickIndex.userName,
  getTopProfileName((profile) => profile.lonelyPickCount),
  'lonelyPickIndex deve achar quem mais ficou sozinho nos placares'
);
assert.equal(
  dashboardA.stats.chaosWriterIndex.userName,
  getTopProfileName((profile) => profile.chaosWriterIndex),
  'chaosWriterIndex precisa combinar caos de forma deterministica'
);
assert.equal(
  dashboardA.stats.favoriteFollowerIndex.userName,
  getTopProfileName((profile) => profile.favoriteFollowerPct),
  'favoriteFollowerIndex deve achar quem mais seguiu o ranking FIFA'
);
assert.equal(
  dashboardA.stats.oneNilIndex.userName,
  getTopProfileName((profile) => profile.oneNilCount),
  'oneNilIndex deve achar o cirurgiao do 1x0'
);
assert.equal(
  dashboardA.stats.goalPartyIndex.userName,
  getTopProfileName((profile) => profile.goalPartyCount),
  'goalPartyIndex deve achar o festival de gols'
);

assert.deepEqual(dashboardA.homeInsights, dashboardB.homeInsights, 'selecao editorial da home precisa ser deterministica');
assert.deepEqual(dashboardA.rankingComments, dashboardB.rankingComments, 'selecao editorial do ranking precisa ser deterministica');
assert.ok(new Set(dashboardA.homeInsights.map((item) => item.userId).filter(Boolean)).size >= 3, 'home nao deve repetir sempre o mesmo usuario');

const blockedHome = buildHomeEditorialInsights({
  ...baseInput,
  canRevealComparisons: false,
  isAdminViewer: false
});
const blockedRanking = buildRankingFooterComments({
  ...baseInput,
  canRevealComparisons: false,
  isAdminViewer: false
});

assert.equal(blockedHome.locked, true, 'home precisa bloquear comparativos para usuario sem envio completo');
assert.equal(blockedHome.items.length, 0, 'home bloqueada nao pode vazar dados comparativos');
assert.equal(blockedRanking.locked, true, 'ranking precisa bloquear comparativos para usuario sem envio completo');
assert.equal(blockedRanking.items.length, 0, 'ranking bloqueado nao pode vazar dados comparativos');

const smallInput = {
  ...baseInput,
  users: [users[0], users[4], users[5]],
  submissions: {
    1: submissions[1],
    5: submissions[5],
    99: submissions[99]
  },
  betsGames: {
    1: betsGames[1],
    5: betsGames[5],
    99: betsGames[99]
  },
  betsKnockout: {
    1: betsKnockout[1],
    5: betsKnockout[5],
    99: betsKnockout[99]
  }
};

const smallDashboard = buildEditorialStatsDashboard(smallInput);
const smallHome = buildHomeEditorialInsights({
  ...smallInput,
  dashboard: smallDashboard,
  canRevealComparisons: true,
  isAdminViewer: false
});

assert.equal(smallDashboard.eligibleCount, 1, 'cenario reduzido precisa manter um unico usuario elegivel');
assert.equal(smallHome.empty, true, 'home precisa cair no estado vazio com menos de dois elegiveis');
assert.equal(smallHome.text, 'Assim que mais gente enviar tudo, o bolao comeca a revelar os estilos de palpite.');

assert.equal(formatEditorialStatLine(dashboardA.stats.contrarianIndex), dashboardA.stats.contrarianIndex.text, 'formatEditorialStatLine deve devolver a linha editorial');

console.log('editorial stats tests: ok');

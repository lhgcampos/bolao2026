import assert from 'node:assert/strict';
import { buildUserHomeInsights } from '../bolao-app/src/userHomeInsights.js';
import { buildCompetitionRanking } from '../bolao-app/src/ranking.js';

const PONTOS = {
  JOGO: { CHEIO: 20, VITORIA: 5 },
  MATA: { CAMPEAO: 100, VICE: 70, TOP3: 50, TOP4: 40, SF: 30, QF: 20, R16: 10, R32: 5 }
};

const baseUsers = [
  { id: 1, nome: 'Ana', role: 'participant' },
  { id: 2, nome: 'Bruno', role: 'participant' },
  { id: 3, nome: 'Carla', role: 'participant' },
  { id: 4, nome: 'Davi', role: 'participant' }
];

const buildRanking = (entries) => buildCompetitionRanking(entries, (entry) => entry.total, (entry) => entry.nome);

const baseMatch = { id: 1, grupo: 'A', timeA: 'Brasil', timeB: 'Japao', data: '12/06', hora: '16:00', placarA: '', placarB: '' };

const lockedInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: { 1: { 1: { placarA: '2', placarB: '1' } } },
  ranking: buildRanking(baseUsers.map((user) => ({ ...user, total: 0 }))),
  scoringRules: PONTOS,
  unlocked: false,
  pendingGroupPicksCount: 5,
  knockoutComplete: false
});

assert.equal(lockedInsight.locked, true);
assert.equal(lockedInsight.primaryLine, 'Complete seus palpites para liberar seu painel do Bolao.');

const allZeroInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '2', placarB: '1' } },
    2: { 1: { placarA: '2', placarB: '1' } },
    3: { 1: { placarA: '1', placarB: '1' } },
    4: { 1: { placarA: '0', placarB: '1' } }
  },
  ranking: buildRanking(baseUsers.map((user) => ({ ...user, total: 0 }))),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.equal(allZeroInsight.rank, 1);
assert.equal(allZeroInsight.tiedWithCount, 3);

const tiedUserInsight = buildUserHomeInsights({
  currentUserId: 2,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '1', placarB: '0' } },
    2: { 1: { placarA: '3', placarB: '0' } }
  },
  ranking: buildRanking([
    { ...baseUsers[0], total: 12 },
    { ...baseUsers[1], total: 12 },
    { ...baseUsers[2], total: 8 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.match(tiedUserInsight.secondaryLine, /empatado com 1 pessoa/);
assert.equal(tiedUserInsight.leaderLine, 'Voce esta empatado na lideranca.');

const isolatedLeaderInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: { 1: { 1: { placarA: '1', placarB: '0' } } },
  ranking: buildRanking([
    { ...baseUsers[0], total: 15 },
    { ...baseUsers[1], total: 12 },
    { ...baseUsers[2], total: 9 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.equal(isolatedLeaderInsight.leaderLine, 'Voce esta liderando por 3 pontos.');

const top3OpportunityInsight = buildUserHomeInsights({
  currentUserId: 4,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '1', placarB: '0' } },
    2: { 1: { placarA: '0', placarB: '0' } },
    3: { 1: { placarA: '0', placarB: '1' } },
    4: { 1: { placarA: '2', placarB: '1' } }
  },
  ranking: buildRanking([
    { ...baseUsers[0], total: 30 },
    { ...baseUsers[1], total: 25 },
    { ...baseUsers[2], total: 24 },
    { ...baseUsers[3], total: 10 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.ok(top3OpportunityInsight.insights.some((entry) => entry.type === 'next-match-overtake'));

const noMoveInsight = buildUserHomeInsights({
  currentUserId: 2,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '2', placarB: '1' } },
    2: { 1: { placarA: '2', placarB: '1' } }
  },
  ranking: buildRanking([
    { ...baseUsers[0], total: 20 },
    { ...baseUsers[1], total: 10 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.ok(!noMoveInsight.insights.some((entry) => entry.type === 'next-match-overtake'));

const uniquePickInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '4', placarB: '3' } },
    2: { 1: { placarA: '1', placarB: '0' } },
    3: { 1: { placarA: '1', placarB: '1' } },
    4: { 1: { placarA: '0', placarB: '1' } }
  },
  ranking: buildRanking(baseUsers.map((user) => ({ ...user, total: 0 }))),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.ok(uniquePickInsight.insights.some((entry) => entry.type === 'unique-prediction'));

const commonPickInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: {
    1: { 1: { placarA: '2', placarB: '0' } },
    2: { 1: { placarA: '2', placarB: '0' } },
    3: { 1: { placarA: '2', placarB: '0' } },
    4: { 1: { placarA: '1', placarB: '0' } }
  },
  ranking: buildRanking(baseUsers.map((user) => ({ ...user, total: 0 }))),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true
});

assert.ok(commonPickInsight.insights.some((entry) => entry.type === 'most-common-prediction'));

const championEliminatedInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: { 1: { 1: { placarA: '2', placarB: '1' } } },
  ranking: buildRanking([
    { ...baseUsers[0], total: 10 },
    { ...baseUsers[1], total: 30 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true,
  officialKnockout: {
    semis: ['Argentina', 'Franca', 'Espanha', 'Alemanha']
  },
  knockoutPredictions: {
    campeao: 'Brasil'
  }
});

assert.ok(championEliminatedInsight.insights.some((entry) => entry.type === 'champion-eliminated'));

const noChanceInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [{ ...baseMatch, placarA: '1', placarB: '0' }],
  predictions: {},
  ranking: buildRanking([
    { ...baseUsers[1], total: 150 },
    { ...baseUsers[0], total: 10 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true,
  officialKnockout: {
    dezeszeseisavos: new Array(32).fill('Equipe'),
    oitavas: new Array(16).fill('Equipe'),
    quartas: new Array(8).fill('Equipe'),
    semis: new Array(4).fill('Equipe'),
    campeao: 'Argentina',
    vice: 'Franca',
    terceiro: 'Espanha',
    quarto: 'Alemanha'
  },
  knockoutPredictions: {
    campeao: 'Brasil'
  }
});

assert.ok(noChanceInsight.insights.some((entry) => entry.type === 'no-mathematical-chance'));

const notEnoughProofInsight = buildUserHomeInsights({
  currentUserId: 1,
  users: baseUsers,
  matches: [baseMatch],
  predictions: { 1: { 1: { placarA: '2', placarB: '1' } } },
  ranking: buildRanking([
    { ...baseUsers[1], total: 150 },
    { ...baseUsers[0], total: 10 }
  ]),
  scoringRules: PONTOS,
  unlocked: true,
  knockoutComplete: true,
  officialKnockout: {},
  knockoutPredictions: {
    campeao: 'Brasil',
    vice: 'Franca',
    terceiro: 'Espanha',
    quarto: 'Alemanha',
    semis: ['Brasil', 'Franca', 'Espanha', 'Alemanha'],
    quartas: ['Brasil', 'Franca', 'Espanha', 'Alemanha'],
    oitavas: ['Brasil'],
    dezeszeseisavos: ['Brasil']
  }
});

assert.ok(!notEnoughProofInsight.insights.some((entry) => entry.type === 'no-mathematical-chance'));

console.log('user home insights tests: ok');

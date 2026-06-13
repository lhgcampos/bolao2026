import assert from 'node:assert/strict';

import { applyManualResultCorrection } from '../bolao-app/src/officialResults/applyOfficialResult.js';
import { syncOfficialResults } from '../bolao-app/src/officialResults/officialResultSync.js';
import { buildChronologicalMatchGroups, gerarJogosIniciais, sortMatchesChronologically } from '../bolao-app/src/matchData.js';

const baseMatches = gerarJogosIniciais();
const baseMatch = baseMatches.find((match) => match.id === 1);

const buildExternalMatch = (override = {}) => ({
  provider: 'football-data',
  sourceLabel: 'football-data.org',
  externalMatchId: '2001',
  status: 'FINISHED',
  startedAt: '2026-06-11T19:00:00Z',
  homeTeam: { name: 'Mexico', shortName: 'Mexico', tla: 'MEX' },
  awayTeam: { name: 'South Africa', shortName: 'South Africa', tla: 'RSA' },
  scoreHome: 2,
  scoreAway: 0,
  ...override
});

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch({ status: 'LIVE' })],
    autoApply: true
  });
  assert.equal(result.report.applied.length, 0, 'nao aplica jogo sem status final');
}

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch()],
    autoApply: true,
    appliedAt: 1_800_000_000_000
  });
  const updated = result.matches.find((match) => match.id === 1);
  assert.equal(updated.placarA, '2', 'aplica placar final valido');
  assert.equal(updated.placarB, '0', 'aplica placar final valido');
  assert.equal(updated.isFinal, true, 'resultado final precisa ficar definitivo');
}

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch({ awayTeam: { name: 'Uruguay', shortName: 'Uruguay', tla: 'URU' } })],
    autoApply: true
  });
  assert.equal(result.report.applied.length, 0, 'nao aplica se times nao batem');
}

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch({ startedAt: '2026-06-15T19:00:00Z' })],
    autoApply: true
  });
  assert.equal(result.report.applied.length, 0, 'nao aplica se a data diverge demais');
}

{
  const correctedMatch = applyManualResultCorrection(baseMatch, {
    placarA: 1,
    placarB: 1,
    appliedAt: 1_800_000_000_001,
    appliedBy: 'Admin'
  }).match;
  const result = syncOfficialResults({
    matches: baseMatches.map((match) => (match.id === correctedMatch.id ? correctedMatch : match)),
    externalMatches: [buildExternalMatch()],
    autoApply: true
  });
  const unchanged = result.matches.find((match) => match.id === correctedMatch.id);
  assert.equal(unchanged.placarA, '1', 'nao sobrescreve correcao manual');
  assert.equal(result.report.applied.length, 0, 'nao sobrescreve correcao manual');
}

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch()],
    autoApply: true,
    appliedAt: 1_800_000_000_002
  });
  const updated = result.matches.find((match) => match.id === 1);
  assert.equal(updated.resultHistory.length, 1, 'registra historico de auto-sync');
  assert.equal(updated.resultHistory[0].source, 'football-data', 'registra a fonte do auto-sync');
}

{
  const corrected = applyManualResultCorrection(baseMatch, {
    placarA: 3,
    placarB: 2,
    appliedAt: 1_800_000_000_003,
    appliedBy: 'Admin'
  }).match;
  assert.equal(corrected.resultHistory.length, 1, 'registra historico de correcao manual');
  assert.equal(corrected.resultHistory[0].source, 'manual-correction', 'marca historico manual');
}

{
  const shuffled = [
    baseMatches.find((match) => match.id === 20),
    baseMatches.find((match) => match.id === 7),
    baseMatches.find((match) => match.id === 19)
  ];
  const ordered = sortMatchesChronologically(shuffled);
  assert.deepEqual(ordered.map((match) => match.id), [7, 19, 20], 'ordena gabarito por data e hora');
}

{
  const tieA = { ...baseMatches.find((match) => match.id === 71), kickoffEt: '2026-06-27T21:00:00-04:00', id: 99 };
  const tieB = { ...baseMatches.find((match) => match.id === 72), kickoffEt: '2026-06-27T21:00:00-04:00', id: 98 };
  const ordered = sortMatchesChronologically([tieA, tieB]);
  assert.deepEqual(ordered.map((match) => match.id), [98, 99], 'usa id como desempate deterministico');
}

{
  const groups = buildChronologicalMatchGroups([
    { ...baseMatches.find((match) => match.id === 1), local: '' },
    baseMatches.find((match) => match.id === 2)
  ]);
  assert.equal(groups.length, 1, 'nao quebra quando jogo nao tem estadio ou cidade');
}

console.log('official results sync tests: ok');

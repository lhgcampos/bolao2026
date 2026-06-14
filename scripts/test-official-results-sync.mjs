import assert from 'node:assert/strict';

import { applyManualResultCorrection, clearManualResultLock } from '../bolao-app/src/officialResults/applyOfficialResult.js';
import { buildGabaritoTimeline } from '../bolao-app/src/officialResults/officialResultsView.js';
import { syncOfficialResults } from '../bolao-app/src/officialResults/officialResultSync.js';
import { buildChronologicalMatchGroups, gerarJogosIniciais, sortMatchesChronologically } from '../bolao-app/src/matchData.js';
import { deriveOfficialKnockout, mergeOfficialKnockout } from '../bolao-app/src/officialResults/tournamentSync.js';

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
  assert.equal(result.report.applied.length, 0, 'nao aplica jogo ao vivo ou parcial');
}

{
  const result = syncOfficialResults({
    matches: baseMatches,
    externalMatches: [buildExternalMatch({ status: 'SCHEDULED' })],
    autoApply: true
  });
  assert.equal(result.report.applied.length, 0, 'nao aplica resultado sem status final');
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
  assert.equal(corrected.manualLock, true, 'correcao manual ativa lock explicito');
  assert.equal(corrected.resultHistory.length, 1, 'registra historico de correcao manual');
  assert.equal(corrected.resultHistory[0].source, 'manual-correction', 'marca historico manual');
  assert.equal(corrected.resultHistory[0].manualLock, true, 'historico manual registra lock');
}

{
  const corrected = applyManualResultCorrection(baseMatch, {
    placarA: 2,
    placarB: 2,
    appliedAt: 1_800_000_000_004,
    appliedBy: 'Admin'
  }).match;
  const unlocked = clearManualResultLock(corrected, {
    appliedAt: 1_800_000_000_005,
    appliedBy: 'Admin'
  }).match;
  assert.equal(unlocked.manualLock, false, 'admin pode reativar o auto-sync apos lock manual');
  assert.equal(unlocked.resultHistory.at(-1)?.source, 'manual-override-clear', 'reativacao manual entra no historico');
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

{
  const timeline = buildGabaritoTimeline([
    baseMatches.find((match) => match.id === 20),
    baseMatches.find((match) => match.id === 7),
    baseMatches.find((match) => match.id === 19)
  ], { isAdmin: false });
  const orderedIds = timeline.flatMap((dayGroup) => dayGroup.matches.map((entry) => entry.match.id));
  assert.deepEqual(orderedIds, [7, 19, 20], 'timeline do gabarito segue ordem cronologica');
  assert.equal(timeline[0].matches[0].showAdminControls, false, 'usuario comum nao recebe controles admin no gabarito');
}

{
  const timeline = buildGabaritoTimeline([baseMatch], { isAdmin: true });
  assert.equal(timeline[0].matches[0].showAdminControls, true, 'admin recebe controles do gabarito');
}

{
  const derived = deriveOfficialKnockout([
    { roundKey: 'r32', startedAt: '2026-06-28T19:00:00Z', status: 'FT', homeTeam: { name: 'México' }, awayTeam: { name: 'Catar' }, scoreHome: 2, scoreAway: 1 },
    { roundKey: 'r16', startedAt: '2026-07-04T19:00:00Z', status: 'FT', homeTeam: { name: 'Brasil' }, awayTeam: { name: 'Argentina' }, scoreHome: 3, scoreAway: 2 },
    { roundKey: 'qf', startedAt: '2026-07-09T19:00:00Z', status: 'FT', homeTeam: { name: 'França' }, awayTeam: { name: 'Espanha' }, scoreHome: 1, scoreAway: 0 },
    { roundKey: 'sf', startedAt: '2026-07-14T19:00:00Z', status: 'FT', homeTeam: { name: 'Brasil' }, awayTeam: { name: 'França' }, scoreHome: 2, scoreAway: 0 },
    { roundKey: 'bronze', startedAt: '2026-07-18T21:00:00Z', status: 'FT', homeTeam: { name: 'Croácia' }, awayTeam: { name: 'Uruguai' }, scoreHome: 2, scoreAway: 1 },
    { roundKey: 'final', startedAt: '2026-07-19T19:00:00Z', status: 'FT', homeTeam: { name: 'Brasil' }, awayTeam: { name: 'França' }, scoreHome: 1, scoreAway: 0 }
  ]);
  assert.equal(derived.dezeszeseisavos[0], 'México', 'mata-mata deve preencher vencedores por rodada');
  assert.equal(derived.campeao, 'Brasil', 'mata-mata deve preencher campeao');
  assert.equal(derived.terceiro, 'Croácia', 'mata-mata deve preencher terceiro');

  const merged = mergeOfficialKnockout(
    { dezeszeseisavos: [''], oitavas: [''], quartas: [''], semis: [''], campeao: '', vice: '', terceiro: '', quarto: '' },
    derived
  );
  assert.equal(merged.campeao, 'Brasil', 'merge do mata-mata deve preservar campeao derivado');
}

console.log('official results sync tests: ok');

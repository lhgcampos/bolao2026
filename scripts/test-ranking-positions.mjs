import assert from 'node:assert/strict';
import { assignDenseRanks, buildDenseRanking } from '../bolao-app/src/ranking.js';

const allZero = buildDenseRanking([
  { name: 'Carlos', points: 0 },
  { name: 'Ana', points: 0 },
  { name: 'Bruno', points: 0 }
]);

assert.deepEqual(
  allZero.map(({ name, points, rank }) => ({ name, points, rank })),
  [
    { name: 'Ana', points: 0, rank: 1 },
    { name: 'Bruno', points: 0, rank: 1 },
    { name: 'Carlos', points: 0, rank: 1 }
  ],
  'todos com zero pontos devem compartilhar a posicao 1, mantendo ordem alfabetica apenas visualmente'
);

const tiedTop = buildDenseRanking([
  { name: 'Bruno', points: 10 },
  { name: 'Ana', points: 10 },
  { name: 'Carlos', points: 7 }
]);

assert.deepEqual(
  tiedTop.map(({ name, rank }) => ({ name, rank })),
  [
    { name: 'Ana', rank: 1 },
    { name: 'Bruno', rank: 1 },
    { name: 'Carlos', rank: 2 }
  ],
  'empate no topo deve gerar rank denso e preservar nome apenas como ordenacao secundaria'
);

const tiedMiddle = buildDenseRanking([
  { name: 'Ana', points: 12 },
  { name: 'Daniel', points: 8 },
  { name: 'Bruno', points: 8 },
  { name: 'Carlos', points: 5 }
]);

assert.deepEqual(
  tiedMiddle.map(({ name, rank }) => ({ name, rank })),
  [
    { name: 'Ana', rank: 1 },
    { name: 'Bruno', rank: 2 },
    { name: 'Daniel', rank: 2 },
    { name: 'Carlos', rank: 3 }
  ],
  'empate no meio nao deve pular a posicao seguinte no ranking denso'
);

const tiedBottom = buildDenseRanking([
  { name: 'Ana', points: 15 },
  { name: 'Bruno', points: 12 },
  { name: 'Daniel', points: 0 },
  { name: 'Carlos', points: 0 }
]);

assert.deepEqual(
  tiedBottom.map(({ name, rank }) => ({ name, rank })),
  [
    { name: 'Ana', rank: 1 },
    { name: 'Bruno', rank: 2 },
    { name: 'Carlos', rank: 3 },
    { name: 'Daniel', rank: 3 }
  ],
  'empate no fim deve compartilhar a mesma colocacao final'
);

const alphabeticalOnlyChangesVisualOrder = assignDenseRanks([
  { name: 'Ana', points: 8 },
  { name: 'Zeca', points: 8 },
  { name: 'Bruno', points: 4 }
]);

assert.deepEqual(
  alphabeticalOnlyChangesVisualOrder.map(({ name, rank }) => ({ name, rank })),
  [
    { name: 'Ana', rank: 1 },
    { name: 'Zeca', rank: 1 },
    { name: 'Bruno', rank: 2 }
  ],
  'a ordem alfabetica dentro do empate nao pode alterar a posicao exibida'
);

console.log('ranking position tests: ok');

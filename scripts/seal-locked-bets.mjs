import process from 'node:process';

const REMOTE_STORE_BASE = process.env.OFFICIAL_RESULTS_REMOTE_BASE || 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = process.env.OFFICIAL_RESULTS_REMOTE_NAMESPACE || 'lhgcampos-bolao2026-live-20260609';
const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  betsGames: 'bets-games',
  betsKnockout: 'bets-knockout',
  sealedBetsGames: 'sealed-bets-games',
  sealedBetsKnockout: 'sealed-bets-knockout',
  submissions: 'submissions'
};

const getRemotePathUrl = (remotePath) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${remotePath}`;

const fetchRemoteEntry = async (remotePath) => {
  const response = await fetch(getRemotePathUrl(remotePath));
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

const countFilledGames = (bets = {}) => Object.values(bets || {}).reduce((total, bet) => (
  bet && typeof bet === 'object' && bet.placarA !== '' && bet.placarB !== '' ? total + 1 : total
), 0);

const countFilledKnockout = (bracket = {}) => (
  ['dezeszeseisavos', 'oitavas', 'quartas', 'semis'].reduce(
    (total, field) => total + ((Array.isArray(bracket?.[field]) ? bracket[field] : []).filter(Boolean).length),
    0
  ) + ['campeao', 'vice', 'terceiro', 'quarto'].filter((field) => Boolean(bracket?.[field])).length
);

const pickBestRecord = ({ liveRecord = {}, sealedRecord = null, countFilled }) => {
  if (!sealedRecord || typeof sealedRecord !== 'object') return liveRecord || {};
  return countFilled(sealedRecord) >= countFilled(liveRecord || {}) ? sealedRecord : (liveRecord || {});
};

const main = async () => {
  const [meta, usersIndex] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.usersIndex)
  ]);

  const userIds = Array.from(new Set([
    ...Object.keys(usersIndex || {}),
    ...((meta?.userIds || []).map((userId) => String(userId)))
  ])).sort();

  const report = [];

  for (const userId of userIds) {
    const [betsGames, betsKnockout, sealedBetsGames, sealedBetsKnockout, submissions] = await Promise.all([
      fetchRemoteEntry(`${REMOTE_PATHS.betsGames}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.betsKnockout}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.sealedBetsGames}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.sealedBetsKnockout}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.submissions}/${userId}`)
    ]);

    const entry = {
      userId,
      jogosSealed: false,
      mataSealed: false
    };

    if (submissions?.jogosAt) {
      const payload = pickBestRecord({
        liveRecord: betsGames || {},
        sealedRecord: sealedBetsGames,
        countFilled: countFilledGames
      });
      await writeRemoteEntry(`${REMOTE_PATHS.sealedBetsGames}/${userId}`, payload);
      entry.jogosSealed = true;
      entry.jogosCount = countFilledGames(payload);
    }

    if (submissions?.mataAt) {
      const payload = pickBestRecord({
        liveRecord: betsKnockout || {},
        sealedRecord: sealedBetsKnockout,
        countFilled: countFilledKnockout
      });
      await writeRemoteEntry(`${REMOTE_PATHS.sealedBetsKnockout}/${userId}`, payload);
      entry.mataSealed = true;
      entry.mataCount = countFilledKnockout(payload);
    }

    report.push(entry);
  }

  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

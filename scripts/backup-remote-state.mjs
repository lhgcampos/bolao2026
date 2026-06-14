import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const ROOT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const REMOTE_STORE_BASE = process.env.OFFICIAL_RESULTS_REMOTE_BASE || 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = process.env.OFFICIAL_RESULTS_REMOTE_NAMESPACE || 'lhgcampos-bolao2026-live-20260609';
const OUTPUT_DIR = process.env.REMOTE_BACKUP_OUTPUT_DIR || path.join(ROOT_DIR, 'tmp', 'remote-backups');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');

const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  matches: 'matches',
  officialKnockout: 'official-knockout',
  conduct: 'conduct',
  userProfiles: 'user-profiles',
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

const outputPath = path.join(OUTPUT_DIR, `${TIMESTAMP}-${REMOTE_NAMESPACE}.json`);

const main = async () => {
  const [meta, usersIndex, matches, officialKnockout, conduct] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(REMOTE_PATHS.matches),
    fetchRemoteEntry(REMOTE_PATHS.officialKnockout),
    fetchRemoteEntry(REMOTE_PATHS.conduct)
  ]);

  const userIds = Array.from(new Set([
    ...Object.keys(usersIndex || {}),
    ...((meta?.userIds || []).map((userId) => String(userId)))
  ])).sort();

  const perUserEntries = await Promise.all(userIds.map(async (userId) => {
    const [profile, betsGames, betsKnockout, sealedBetsGames, sealedBetsKnockout, submissions] = await Promise.all([
      fetchRemoteEntry(`${REMOTE_PATHS.userProfiles}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.betsGames}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.betsKnockout}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.sealedBetsGames}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.sealedBetsKnockout}/${userId}`),
      fetchRemoteEntry(`${REMOTE_PATHS.submissions}/${userId}`)
    ]);

    return [
      userId,
      {
        profile,
        betsGames,
        betsKnockout,
        sealedBetsGames,
        sealedBetsKnockout,
        submissions
      }
    ];
  }));

  const payload = {
    exportedAt: new Date().toISOString(),
    namespace: REMOTE_NAMESPACE,
    remoteBase: REMOTE_STORE_BASE,
    meta,
    usersIndex,
    matches,
    officialKnockout,
    conduct,
    users: Object.fromEntries(perUserEntries)
  };

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(payload, null, 2));
  process.stdout.write(`${outputPath}\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

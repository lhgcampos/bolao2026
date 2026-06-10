import fs from 'node:fs/promises';
import path from 'node:path';

const REMOTE_STORE_BASE = 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = 'lhgcampos-bolao2026-live-20260609';
const REMOTE_SCHEMA_VERSION = 3;
const REMOTE_LEGACY_STATE_PATH = 'state';
const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  matches: 'matches',
  officialKnockout: 'official-knockout',
  conduct: 'conduct',
  betsGames: 'bets-games',
  betsKnockout: 'bets-knockout',
  submissions: 'submissions',
  userProfiles: 'user-profiles'
};
const AVATAR_UPLOAD_URL = 'https://bolao2026-avatar-upload.linoscheduling.workers.dev';
const ROOT_DIR = process.cwd();
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');
const REPORTS_DIR = path.join(ROOT_DIR, 'reports');

const normalizeUserNameKey = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeUser = (user) => {
  const nome = user?.nome || '';
  const nomeKey = user?.nomeKey || normalizeUserNameKey(nome);
  const role = user?.role || ((user?.id === 999 || nomeKey === 'admin') ? 'admin' : 'participant');
  return {
    ...user,
    nome,
    nomeKey,
    role
  };
};

const getRemotePathUrl = (remotePath) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${remotePath}`;
const getRemoteUserShardPath = (prefix, userId) => `${prefix}/${userId}`;

const fetchJson = async (url, options = {}) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} em ${url}`);
  }
  return response.json();
};

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

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const buildTimestamp = () => {
  const now = new Date();
  const part = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${part(now.getMonth() + 1)}-${part(now.getDate())}T${part(now.getHours())}-${part(now.getMinutes())}-${part(now.getSeconds())}`;
};

const buildRemoteUserIndexRecord = (user) => {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    nome: normalized.nome,
    nomeKey: normalized.nomeKey,
    senha: normalized.senha || '',
    role: normalized.role
  };
};

const uploadAvatarAsset = async ({ dataUrl, userId, userName }) => {
  const response = await fetch(AVATAR_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userName,
      contentType: 'image/webp',
      fileName: `avatar-${userId}.webp`,
      imageDataUrl: dataUrl
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao subir avatar do usuário ${userName} (${response.status}): ${text}`);
  }

  return response.json();
};

const fetchCurrentShardedProfiles = async (userIds) => {
  const entries = await Promise.all(userIds.map(async (userId) => {
    const profile = await fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, userId));
    return [String(userId), profile || null];
  }));

  return Object.fromEntries(entries);
};

const compareCoreState = (legacy, rebuilt) => {
  const serialize = (value) => JSON.stringify(value);
  const mismatches = [];

  if (serialize(legacy.matches || []) !== serialize(rebuilt.matches || [])) {
    mismatches.push('matches');
  }
  if (serialize(legacy.officialKnockout || {}) !== serialize(rebuilt.officialKnockout || {})) {
    mismatches.push('officialKnockout');
  }
  if (serialize(legacy.conduct || {}) !== serialize(rebuilt.conduct || {})) {
    mismatches.push('conduct');
  }

  const legacyUsers = Object.values(legacy.usersById || {}).map(normalizeUser)
    .map((user) => ({ id: user.id, nome: user.nome, senha: user.senha || '', role: user.role, nomeKey: user.nomeKey }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const rebuiltUsers = Object.values(rebuilt.usersById || {}).map(normalizeUser)
    .map((user) => ({ id: user.id, nome: user.nome, senha: user.senha || '', role: user.role, nomeKey: user.nomeKey }))
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));

  if (serialize(legacyUsers) !== serialize(rebuiltUsers)) {
    mismatches.push('usersById(core)');
  }

  const userIds = legacyUsers.map((user) => String(user.id));
  const scopedFields = [
    ['betsGames', legacy.betsGames || {}, rebuilt.betsGames || {}],
    ['betsKnockout', legacy.betsKnockout || {}, rebuilt.betsKnockout || {}],
    ['submissions', legacy.submissions || {}, rebuilt.submissions || {}]
  ];

  for (const [field, legacyMap, rebuiltMap] of scopedFields) {
    const hasMismatch = userIds.some((userId) => serialize(legacyMap[userId] || {}) !== serialize(rebuiltMap[userId] || {}));
    if (hasMismatch) mismatches.push(field);
  }

  return mismatches;
};

const main = async () => {
  await ensureDir(BACKUPS_DIR);
  await ensureDir(REPORTS_DIR);

  const timestamp = buildTimestamp();
  const legacyUrl = getRemotePathUrl(REMOTE_LEGACY_STATE_PATH);
  const legacyState = await fetchJson(legacyUrl);

  const backupPath = path.join(BACKUPS_DIR, `remote-state-backup-live-${timestamp}.json`);
  await fs.writeFile(backupPath, JSON.stringify(legacyState, null, 2));

  const legacyUsers = Object.values(legacyState.usersById || {}).map(normalizeUser);
  const currentProfiles = await fetchCurrentShardedProfiles(legacyUsers.map((user) => user.id));

  const avatarUploads = [];
  const migratedUsers = [];

  for (const user of legacyUsers) {
    const existingProfile = currentProfiles[String(user.id)] || {};
    const hasInlineAvatar = typeof user.avatar === 'string' && user.avatar.startsWith('data:image');
    const hasExternalProfileAvatar = typeof existingProfile.avatar === 'string' && /^https?:\/\//.test(existingProfile.avatar);
    let avatar = hasInlineAvatar && hasExternalProfileAvatar
      ? existingProfile.avatar
      : (user.avatar || existingProfile.avatar || '');
    let avatarKey = existingProfile.avatarKey || '';

    if (typeof avatar === 'string' && avatar.startsWith('data:image')) {
      const uploadResult = await uploadAvatarAsset({
        dataUrl: avatar,
        userId: user.id,
        userName: user.nome
      });
      avatar = uploadResult.avatarUrl || uploadResult.url || avatar;
      avatarKey = uploadResult.avatarKey || uploadResult.key || '';
      avatarUploads.push({
        userId: user.id,
        nome: user.nome,
        avatarKey,
        avatarUrl: avatar
      });
    }

    migratedUsers.push({
      ...user,
      avatar,
      avatarKey
    });
  }

  const usersIndexPayload = Object.fromEntries(
    migratedUsers.map((user) => [String(user.id), buildRemoteUserIndexRecord(user)])
  );

  const metaPayload = {
    schemaVersion: REMOTE_SCHEMA_VERSION,
    updatedAt: Date.now(),
    migratedFromLegacyUpdatedAt: legacyState.updatedAt || 0,
    userIds: migratedUsers.map((user) => user.id)
  };

  const entries = [
    [REMOTE_PATHS.meta, metaPayload],
    [REMOTE_PATHS.usersIndex, usersIndexPayload],
    [REMOTE_PATHS.matches, legacyState.matches || []],
    [REMOTE_PATHS.officialKnockout, legacyState.officialKnockout || {}],
    [REMOTE_PATHS.conduct, legacyState.conduct || {}]
  ];

  for (const user of migratedUsers) {
    const userId = String(user.id);
    entries.push(
      [getRemoteUserShardPath(REMOTE_PATHS.userProfiles, userId), { avatar: user.avatar || '', avatarKey: user.avatarKey || '' }],
      [getRemoteUserShardPath(REMOTE_PATHS.betsGames, userId), legacyState.betsGames?.[user.id] || legacyState.betsGames?.[userId] || {}],
      [getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, userId), legacyState.betsKnockout?.[user.id] || legacyState.betsKnockout?.[userId] || {}],
      [getRemoteUserShardPath(REMOTE_PATHS.submissions, userId), legacyState.submissions?.[user.id] || legacyState.submissions?.[userId] || {}]
    );
  }

  for (const [remotePath, payload] of entries) {
    await writeRemoteEntry(remotePath, payload);
  }

  const [metaCheck, usersIndexCheck, matchesCheck, officialKnockoutCheck, conductCheck] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(REMOTE_PATHS.matches),
    fetchRemoteEntry(REMOTE_PATHS.officialKnockout),
    fetchRemoteEntry(REMOTE_PATHS.conduct)
  ]);

  const rebuiltUsersById = {};
  const rebuiltBetsGames = {};
  const rebuiltBetsKnockout = {};
  const rebuiltSubmissions = {};

  for (const user of migratedUsers) {
    const userId = String(user.id);
    const [profile, betsGames, betsKnockout, submissions] = await Promise.all([
      fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, userId)),
      fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, userId)),
      fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, userId)),
      fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, userId))
    ]);

    rebuiltUsersById[userId] = normalizeUser({
      ...(usersIndexCheck?.[userId] || {}),
      ...(profile || {})
    });
    rebuiltBetsGames[userId] = betsGames || {};
    rebuiltBetsKnockout[userId] = betsKnockout || {};
    rebuiltSubmissions[userId] = submissions || {};
  }

  const rebuiltState = {
    usersById: rebuiltUsersById,
    matches: matchesCheck || [],
    betsGames: rebuiltBetsGames,
    betsKnockout: rebuiltBetsKnockout,
    officialKnockout: officialKnockoutCheck || {},
    conduct: conductCheck || {},
    submissions: rebuiltSubmissions
  };

  const mismatches = compareCoreState(legacyState, rebuiltState);

  const report = {
    migratedAt: new Date().toISOString(),
    legacyUpdatedAt: legacyState.updatedAt || null,
    shardUpdatedAt: metaCheck?.updatedAt || null,
    backupPath,
    legacyUserCount: legacyUsers.length,
    avatarInlineMigratedCount: avatarUploads.length,
    avatarInlineMigratedUsers: avatarUploads,
    writtenEntries: entries.map(([remotePath]) => remotePath),
    mismatches
  };

  const reportPath = path.join(REPORTS_DIR, `remote-shard-migration-${timestamp}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(JSON.stringify({
    ok: mismatches.length === 0,
    backupPath,
    reportPath,
    legacyUpdatedAt: legacyState.updatedAt || null,
    shardUpdatedAt: metaCheck?.updatedAt || null,
    avatarInlineMigratedCount: avatarUploads.length,
    userCount: legacyUsers.length,
    mismatches
  }, null, 2));

  if (mismatches.length) {
    process.exitCode = 1;
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

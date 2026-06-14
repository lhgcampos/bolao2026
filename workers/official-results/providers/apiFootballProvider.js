const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';

const normalizeScore = (score) => (
  Number.isInteger(score) && score >= 0 ? score : null
);

const normalizeRoundKey = (round = '') => {
  const normalized = String(round || '').toLowerCase();

  if (normalized.includes('group')) return 'group';
  if (normalized.includes('round of 32') || normalized.includes('32nd finals')) return 'r32';
  if (normalized.includes('round of 16') || normalized.includes('8th finals')) return 'r16';
  if (normalized.includes('quarter')) return 'qf';
  if (normalized.includes('semi')) return 'sf';
  if (normalized.includes('third place') || normalized.includes('3rd place')) return 'bronze';
  if (normalized === 'final') return 'final';

  return 'unknown';
};

export const fetchApiFootballMatches = async ({
  fetchImpl = fetch,
  key,
  leagueId = 1,
  season = 2026
} = {}) => {
  if (!key) {
    throw new Error('API_FOOTBALL_KEY ausente.');
  }

  const url = new URL(`${API_FOOTBALL_BASE_URL}/fixtures`);
  url.searchParams.set('league', String(leagueId));
  url.searchParams.set('season', String(season));

  const response = await fetchImpl(url, {
    headers: {
      'x-apisports-key': key
    }
  });

  if (!response.ok) {
    throw new Error(`API-Football respondeu ${response.status}`);
  }

  const payload = await response.json();
  return (payload?.response || []).map((entry) => ({
    provider: 'api-football',
    sourceLabel: 'API-Football',
    authoritative: true,
    externalMatchId: String(entry?.fixture?.id || ''),
    roundKey: normalizeRoundKey(entry?.league?.round),
    status: entry?.fixture?.status?.short || entry?.fixture?.status?.long || '',
    startedAt: entry?.fixture?.date || '',
    lastUpdated: entry?.fixture?.update || '',
    venue: entry?.fixture?.venue?.name || '',
    group: entry?.league?.round || '',
    homeTeam: {
      name: entry?.teams?.home?.name || '',
      shortName: entry?.teams?.home?.name || '',
      tla: entry?.teams?.home?.code || ''
    },
    awayTeam: {
      name: entry?.teams?.away?.name || '',
      shortName: entry?.teams?.away?.name || '',
      tla: entry?.teams?.away?.code || ''
    },
    homeWinner: Boolean(entry?.teams?.home?.winner),
    awayWinner: Boolean(entry?.teams?.away?.winner),
    scoreHome: normalizeScore(entry?.goals?.home),
    scoreAway: normalizeScore(entry?.goals?.away)
  }));
};

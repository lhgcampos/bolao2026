const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';

const normalizeScore = (score) => (
  Number.isInteger(score) && score >= 0 ? score : null
);

export const fetchFootballDataMatches = async ({
  fetchImpl = fetch,
  token,
  competitionCode = 'WC',
  season = 2026
} = {}) => {
  if (!token) {
    throw new Error('FOOTBALL_DATA_API_TOKEN ausente.');
  }

  const url = `${FOOTBALL_DATA_BASE_URL}/competitions/${competitionCode}/matches?season=${season}`;
  const response = await fetchImpl(url, {
    headers: {
      'X-Auth-Token': token
    }
  });

  if (!response.ok) {
    throw new Error(`football-data.org respondeu ${response.status}`);
  }

  const payload = await response.json();
  return (payload?.matches || []).map((match) => ({
    provider: 'football-data',
    sourceLabel: 'football-data.org',
    authoritative: true,
    externalMatchId: String(match.id),
    status: match.status || '',
    startedAt: match.utcDate,
    lastUpdated: match.lastUpdated || '',
    venue: match.venue || '',
    group: match.group || '',
    homeTeam: {
      name: match.homeTeam?.name || '',
      shortName: match.homeTeam?.shortName || '',
      tla: match.homeTeam?.tla || ''
    },
    awayTeam: {
      name: match.awayTeam?.name || '',
      shortName: match.awayTeam?.shortName || '',
      tla: match.awayTeam?.tla || ''
    },
    scoreHome: normalizeScore(match.score?.fullTime?.home),
    scoreAway: normalizeScore(match.score?.fullTime?.away)
  }));
};

const ESPN_SCOREBOARD_URL = 'https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard';

const normalizeStatus = (competition = {}, event = {}) => {
  const type = competition?.status?.type || event?.status?.type || {};
  if (type.completed || String(type.state || '').toLowerCase() === 'post') {
    return 'FT';
  }

  const detail = String(type.detail || type.shortDetail || type.description || type.name || '').trim();
  return detail || 'SCHEDULED';
};

const normalizeScore = (competitor = {}) => {
  const value = Number.parseInt(competitor?.score, 10);
  return Number.isInteger(value) && value >= 0 ? value : null;
};

const normalizeTeam = (competitor = {}) => ({
  name: competitor?.team?.displayName || competitor?.team?.name || '',
  shortName: competitor?.team?.shortDisplayName || competitor?.team?.name || '',
  tla: competitor?.team?.abbreviation || ''
});

const buildDatesRange = ({
  startDate = '20260611',
  endDate = '20260719'
} = {}) => `${startDate}-${endDate}`;

export const fetchEspnWorldCupMatches = async ({
  fetchImpl = fetch,
  startDate,
  endDate
} = {}) => {
  const dates = buildDatesRange({ startDate, endDate });
  const response = await fetchImpl(`${ESPN_SCOREBOARD_URL}?dates=${dates}`, {
    headers: {
      accept: 'application/json',
      'user-agent': 'Mozilla/5.0'
    }
  });

  if (!response.ok) {
    throw new Error(`ESPN scoreboard respondeu ${response.status}`);
  }

  const payload = await response.json();
  return (payload?.events || []).map((event) => {
    const competition = event?.competitions?.[0] || {};
    const competitors = Array.isArray(competition?.competitors) ? competition.competitors : [];
    const home = competitors.find((entry) => entry?.homeAway === 'home') || competitors[0] || {};
    const away = competitors.find((entry) => entry?.homeAway === 'away') || competitors[1] || {};

    return {
      provider: 'espn',
      sourceLabel: 'ESPN scoreboard',
      authoritative: true,
      externalMatchId: String(event?.id || competition?.id || ''),
      status: normalizeStatus(competition, event),
      startedAt: competition?.date || event?.date || '',
      lastUpdated: '',
      venue: competition?.venue?.fullName || event?.venue?.displayName || '',
      group: String(competition?.altGameNote || '')
        .replace(/^FIFA World Cup,\s*/i, '')
        .trim(),
      homeTeam: normalizeTeam(home),
      awayTeam: normalizeTeam(away),
      scoreHome: normalizeScore(home),
      scoreAway: normalizeScore(away)
    };
  });
};

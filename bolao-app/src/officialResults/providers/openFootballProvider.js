const OPEN_FOOTBALL_URL = 'https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';

const parseOffsetDate = (date, time) => {
  if (!date || !time) return null;
  const match = String(time).match(/^(\d{1,2}:\d{2})(?:\s+UTC([+-]\d+))?$/i);
  if (!match) return null;
  const [, hourMinute, offsetHours = '+0'] = match;
  const offsetNumber = Number(offsetHours);
  const signal = offsetNumber >= 0 ? '+' : '-';
  const absoluteHours = String(Math.abs(offsetNumber)).padStart(2, '0');
  return `${date}T${hourMinute}:00${signal}${absoluteHours}:00`;
};

const normalizeScore = (score, index) => {
  const value = Array.isArray(score?.ft) ? score.ft[index] : null;
  return Number.isInteger(value) && value >= 0 ? value : null;
};

export const fetchOpenFootballMatches = async ({ fetchImpl = fetch } = {}) => {
  const response = await fetchImpl(OPEN_FOOTBALL_URL);
  if (!response.ok) {
    throw new Error(`openfootball respondeu ${response.status}`);
  }

  const payload = await response.json();
  return (payload?.matches || []).map((match, index) => ({
    provider: 'openfootball',
    sourceLabel: 'openfootball/worldcup.json',
    authoritative: false,
    externalMatchId: String(index + 1),
    status: Array.isArray(match?.score?.ft) ? 'FINISHED' : 'SCHEDULED',
    startedAt: parseOffsetDate(match.date, match.time),
    lastUpdated: '',
    venue: match.ground || '',
    group: match.group || '',
    homeTeam: {
      name: match.team1 || '',
      shortName: match.team1 || '',
      tla: ''
    },
    awayTeam: {
      name: match.team2 || '',
      shortName: match.team2 || '',
      tla: ''
    },
    scoreHome: normalizeScore(match.score, 0),
    scoreAway: normalizeScore(match.score, 1)
  }));
};

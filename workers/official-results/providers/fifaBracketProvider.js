import { resolveLocalTeamName } from '../../../bolao-app/src/officialResults/matchMapping.js';
import { createEmptyOfficialBracketSlots } from '../../../bolao-app/src/officialResults/officialBracketSlots.js';

const FIFA_API_BASE_URL = 'https://api.fifa.com/api/v3';

const getPrimaryDescription = (values = []) => (
  Array.isArray(values) ? values.find((entry) => entry?.Description)?.Description || '' : ''
);

const getLocalTeamName = (team = {}) => {
  const safeTeam = team && typeof team === 'object' ? team : {};
  const resolved = resolveLocalTeamName({
    name: getPrimaryDescription(safeTeam.TeamName),
    shortName: safeTeam.ShortClubName || getPrimaryDescription(safeTeam.TeamName),
    tla: safeTeam.Abbreviation || safeTeam.IdCountry || ''
  });

  return resolved || safeTeam.ShortClubName || getPrimaryDescription(safeTeam.TeamName) || '';
};

export const buildOfficialBracketSlotsFromFifaSeasonBracket = (
  payload = {},
  { publishedAt = Date.now() } = {}
) => {
  const next = createEmptyOfficialBracketSlots();
  next.updatedAt = publishedAt;
  next.seasonId = String(payload?.IdSeason || '');

  (payload?.KnockoutStages || []).forEach((stage) => {
    (stage?.Matches || []).forEach((match) => {
      const matchNumber = Number.parseInt(match?.MatchNumber, 10);
      if (!Number.isInteger(matchNumber) || matchNumber < 73 || matchNumber > 104) return;

      const teamA = getLocalTeamName(match.HomeTeam);
      const teamB = getLocalTeamName(match.AwayTeam);
      if (!teamA && !teamB) return;

      next.matches[String(matchNumber)] = {
        teamA,
        teamB,
        placeholderA: typeof match?.PlaceHolderA === 'string' ? match.PlaceHolderA : '',
        placeholderB: typeof match?.PlaceHolderB === 'string' ? match.PlaceHolderB : '',
        publishedAt
      };
    });
  });

  return next;
};

export const fetchFifaBracketSlots = async ({
  fetchImpl = fetch,
  seasonId = 285023,
  language = 'en'
} = {}) => {
  const url = `${FIFA_API_BASE_URL}/seasonbracket/season/${seasonId}?language=${encodeURIComponent(language)}`;
  const response = await fetchImpl(url);

  if (!response.ok) {
    throw new Error(`FIFA bracket respondeu ${response.status}`);
  }

  const payload = await response.json();
  return buildOfficialBracketSlotsFromFifaSeasonBracket(payload, {
    publishedAt: Date.now()
  });
};

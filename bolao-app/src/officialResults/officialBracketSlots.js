const OFFICIAL_BRACKET_SLOTS_SCHEMA_VERSION = 1;

const normalizeMatchSlot = (entry = {}) => ({
  teamA: typeof entry.teamA === 'string' ? entry.teamA : '',
  teamB: typeof entry.teamB === 'string' ? entry.teamB : '',
  placeholderA: typeof entry.placeholderA === 'string' ? entry.placeholderA : '',
  placeholderB: typeof entry.placeholderB === 'string' ? entry.placeholderB : '',
  publishedAt: Number.isFinite(entry.publishedAt) ? entry.publishedAt : 0
});

export const createEmptyOfficialBracketSlots = () => ({
  schemaVersion: OFFICIAL_BRACKET_SLOTS_SCHEMA_VERSION,
  source: 'fifa',
  seasonId: '',
  updatedAt: 0,
  matches: {}
});

export const normalizeOfficialBracketSlots = (slots = {}) => {
  const normalized = createEmptyOfficialBracketSlots();
  normalized.source = typeof slots?.source === 'string' && slots.source ? slots.source : normalized.source;
  normalized.seasonId = typeof slots?.seasonId === 'string' ? slots.seasonId : '';
  normalized.updatedAt = Number.isFinite(slots?.updatedAt) ? slots.updatedAt : 0;

  const matches = slots?.matches && typeof slots.matches === 'object' && !Array.isArray(slots.matches)
    ? slots.matches
    : {};

  normalized.matches = Object.fromEntries(
    Object.entries(matches).map(([matchId, entry]) => [String(matchId), normalizeMatchSlot(entry)])
  );

  return normalized;
};

export const mergeOfficialBracketSlots = (existing = {}, derived = {}) => {
  const base = normalizeOfficialBracketSlots(existing);
  const next = normalizeOfficialBracketSlots(derived);
  const merged = {
    ...base,
    source: next.source || base.source,
    seasonId: next.seasonId || base.seasonId,
    updatedAt: next.updatedAt || base.updatedAt,
    matches: { ...base.matches }
  };

  Object.entries(next.matches).forEach(([matchId, entry]) => {
    const previous = merged.matches[matchId] || normalizeMatchSlot();
    merged.matches[matchId] = {
      teamA: entry.teamA || previous.teamA,
      teamB: entry.teamB || previous.teamB,
      placeholderA: entry.placeholderA || previous.placeholderA,
      placeholderB: entry.placeholderB || previous.placeholderB,
      publishedAt: Math.max(previous.publishedAt || 0, entry.publishedAt || 0)
    };
  });

  return merged;
};

export const getOfficialBracketSlot = (slots = {}, matchId) => {
  const normalized = normalizeOfficialBracketSlots(slots);
  return normalized.matches[String(matchId)] || null;
};

export const getOfficialBracketSlotTeam = (slots = {}, matchId, side = 'A') => {
  const entry = getOfficialBracketSlot(slots, matchId);
  if (!entry) return '';
  return side === 'B' ? entry.teamB : entry.teamA;
};

export const countPublishedOfficialBracketTeams = (slots = {}) => {
  const normalized = normalizeOfficialBracketSlots(slots);
  return Object.values(normalized.matches).reduce(
    (total, entry) => total + (entry.teamA ? 1 : 0) + (entry.teamB ? 1 : 0),
    0
  );
};

export const countPublishedOfficialBracketMatches = (slots = {}) => {
  const normalized = normalizeOfficialBracketSlots(slots);
  return Object.values(normalized.matches).filter((entry) => entry.teamA || entry.teamB).length;
};

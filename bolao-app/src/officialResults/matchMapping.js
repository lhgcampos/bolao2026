import { TEAM_FIFA_RANKINGS } from '../fifaTeamRankings.js';
import { JOGOS_FASE_DE_GRUPOS, parseMatchDateTime } from '../matchData.js';

const MAX_KICKOFF_DRIFT_MS = 12 * 60 * 60 * 1000;

const normalizeText = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9]+/g, ' ')
  .trim()
  .toLowerCase();

const TEAM_ALIASES = new Map([
  ['mexico', 'México'],
  ['south africa', 'África do Sul'],
  ['south korea', 'Coreia do Sul'],
  ['korea republic', 'Coreia do Sul'],
  ['republic of korea', 'Coreia do Sul'],
  ['czech republic', 'Rep. Tcheca'],
  ['czechia', 'Rep. Tcheca'],
  ['cote d ivoire', 'Costa do Marfim'],
  ['ivory coast', 'Costa do Marfim'],
  ['united states', 'EUA'],
  ['usa', 'EUA'],
  ['usa mens national team', 'EUA'],
  ['saudi arabia', 'Arábia Saudita'],
  ['cape verde', 'Cabo Verde'],
  ['cabo verde islands', 'Cabo Verde'],
  ['dr congo', 'RD Congo'],
  ['congo dr', 'RD Congo'],
  ['democratic republic of congo', 'RD Congo'],
  ['bosnia and herzegovina', 'Bósnia'],
  ['qatar', 'Catar'],
  ['morocco', 'Marrocos'],
  ['scotland', 'Escócia'],
  ['germany', 'Alemanha'],
  ['ecuador', 'Equador'],
  ['netherlands', 'Holanda'],
  ['belgium', 'Bélgica'],
  ['iran', 'Irã'],
  ['new zealand', 'Nova Zelândia'],
  ['spain', 'Espanha'],
  ['france', 'França'],
  ['senegal', 'Senegal'],
  ['iraq', 'Iraque'],
  ['norway', 'Noruega'],
  ['austria', 'Áustria'],
  ['jordan', 'Jordânia'],
  ['uzbekistan', 'Uzbequistão'],
  ['colombia', 'Colômbia'],
  ['england', 'Inglaterra'],
  ['croatia', 'Croácia'],
  ['ghana', 'Gana'],
  ['panama', 'Panamá'],
  ['turkiye', 'Turquia'],
  ['turkey', 'Turquia'],
  ['switzerland', 'Suíça'],
  ['japan', 'Japão'],
  ['sweden', 'Suécia'],
  ['tunisia', 'Tunísia'],
  ['egypt', 'Egito'],
  ['uruguay', 'Uruguai'],
  ['argentina', 'Argentina'],
  ['algeria', 'Argélia'],
  ['portugal', 'Portugal'],
  ['canada', 'Canadá'],
  ['brazil', 'Brasil'],
  ['haiti', 'Haiti'],
  ['paraguay', 'Paraguai'],
  ['australia', 'Austrália'],
  ['curacao', 'Curaçao']
]);

const LOCAL_TEAM_BY_CODE = new Map(
  Object.entries(TEAM_FIFA_RANKINGS).map(([localName, meta]) => [meta.code, localName])
);

const LOCAL_TEAM_BY_NORMALIZED_NAME = new Map(
  Object.keys(TEAM_FIFA_RANKINGS).map((teamName) => [normalizeText(teamName), teamName])
);

export const resolveLocalTeamName = (team = {}) => {
  const code = String(team.tla || team.code || team.fifaCode || '').trim().toUpperCase();
  if (code && LOCAL_TEAM_BY_CODE.has(code)) {
    return LOCAL_TEAM_BY_CODE.get(code);
  }

  const normalizedCandidates = [
    normalizeText(team.name),
    normalizeText(team.shortName)
  ].filter(Boolean);

  for (const normalized of normalizedCandidates) {
    if (LOCAL_TEAM_BY_NORMALIZED_NAME.has(normalized)) {
      return LOCAL_TEAM_BY_NORMALIZED_NAME.get(normalized);
    }
    if (TEAM_ALIASES.has(normalized)) {
      return TEAM_ALIASES.get(normalized);
    }
  }

  return null;
};

const resolveKickoffDeltaMs = (localMatch, externalMatch) => (
  Math.abs(parseMatchDateTime(localMatch) - new Date(externalMatch.startedAt).getTime())
);

export const mapExternalMatchToLocal = (externalMatch, localMatches = JOGOS_FASE_DE_GRUPOS) => {
  const localHomeTeam = resolveLocalTeamName(externalMatch.homeTeam);
  const localAwayTeam = resolveLocalTeamName(externalMatch.awayTeam);

  if (!localHomeTeam || !localAwayTeam) {
    return {
      matched: false,
      confidence: 'low',
      reason: 'team-name-unresolved',
      localHomeTeam,
      localAwayTeam
    };
  }

  const candidates = localMatches.filter((match) => (
    match.timeA === localHomeTeam &&
    match.timeB === localAwayTeam
  ));

  if (candidates.length !== 1) {
    return {
      matched: false,
      confidence: 'low',
      reason: candidates.length ? 'ambiguous-local-match' : 'local-match-not-found',
      localHomeTeam,
      localAwayTeam
    };
  }

  const [localMatch] = candidates;

  if (!externalMatch.startedAt) {
    return {
      matched: false,
      confidence: 'low',
      reason: 'missing-external-kickoff',
      localHomeTeam,
      localAwayTeam,
      localMatch
    };
  }

  const kickoffDeltaMs = resolveKickoffDeltaMs(localMatch, externalMatch);
  if (kickoffDeltaMs > MAX_KICKOFF_DRIFT_MS) {
    return {
      matched: false,
      confidence: 'low',
      reason: 'kickoff-mismatch',
      localHomeTeam,
      localAwayTeam,
      localMatch,
      kickoffDeltaMs
    };
  }

  return {
    matched: true,
    confidence: 'high',
    reason: 'home-away-and-kickoff-match',
    localHomeTeam,
    localAwayTeam,
    localMatch,
    kickoffDeltaMs
  };
};

export const getKickoffDriftLimitMs = () => MAX_KICKOFF_DRIFT_MS;

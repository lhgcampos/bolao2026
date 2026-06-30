import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { MATA_MATA_CONFIG } from '../constants.js';
import { getOfficialBracketSlot } from '../officialResults/officialBracketSlots.js';
import { getKnockoutPhaseOfficialState } from '../officialResults/knockoutPhaseScoring.js';
import { getKnockoutPhaseParticipantEntries } from '../knockoutPhaseParticipants.js';
import { resolveLocalTeamName } from '../officialResults/matchMapping.js';

const FLAG_BY_TEAM = {
  Alemanha: 'de',
  'África do Sul': 'za',
  Argélia: 'dz',
  Argentina: 'ar',
  'Arábia Saudita': 'sa',
  Austrália: 'au',
  Áustria: 'at',
  Bélgica: 'be',
  Bósnia: 'ba',
  Brasil: 'br',
  Canadá: 'ca',
  'Cabo Verde': 'cv',
  Catar: 'qa',
  Colômbia: 'co',
  'Coreia do Sul': 'kr',
  'Costa do Marfim': 'ci',
  Croácia: 'hr',
  Curaçao: 'cw',
  Egito: 'eg',
  Equador: 'ec',
  Escócia: 'gb-sct',
  Espanha: 'es',
  EUA: 'us',
  França: 'fr',
  Gana: 'gh',
  Haiti: 'ht',
  Holanda: 'nl',
  Inglaterra: 'gb-eng',
  Irã: 'ir',
  Iraque: 'iq',
  Japão: 'jp',
  Jordânia: 'jo',
  Marrocos: 'ma',
  México: 'mx',
  Noruega: 'no',
  'Nova Zelândia': 'nz',
  Panamá: 'pa',
  Paraguai: 'py',
  Portugal: 'pt',
  'RD Congo': 'cd',
  'Rep. Tcheca': 'cz',
  Senegal: 'sn',
  Suécia: 'se',
  Suíça: 'ch',
  Tunísia: 'tn',
  Turquia: 'tr',
  Uruguai: 'uy',
  Uzbequistão: 'uz',
  Canada: 'ca',
  'Bosnia and Herzegovina': 'ba',
  Czechia: 'cz',
  Germany: 'de',
  'Côte d’Ivoire': 'ci',
  "Cote d'Ivoire": 'ci',
  Curacao: 'cw',
  Netherlands: 'nl',
  'United States': 'us',
  USA: 'us',
  England: 'gb-eng',
  Scotland: 'gb-sct',
  'DR Congo': 'cd'
};

const TEAM_SHORT_LABELS = {
  Alemanha: 'ALE',
  'África do Sul': 'AFS',
  Argélia: 'AGL',
  Argentina: 'ARG',
  'Arábia Saudita': 'ARA',
  Austrália: 'AUS',
  Áustria: 'AUT',
  Bélgica: 'BEL',
  Bósnia: 'BOS',
  Brasil: 'BRA',
  Canadá: 'CAN',
  'Cabo Verde': 'CAB',
  Catar: 'CAT',
  Colômbia: 'COL',
  'Coreia do Sul': 'CDS',
  'Costa do Marfim': 'CDM',
  Croácia: 'CRO',
  Curaçao: 'CUR',
  Egito: 'EGI',
  Equador: 'EQU',
  Escócia: 'ESC',
  Espanha: 'ESP',
  EUA: 'EUA',
  França: 'FRA',
  Gana: 'GAN',
  Haiti: 'HAI',
  Holanda: 'HOL',
  Inglaterra: 'ING',
  Irã: 'IRA',
  Iraque: 'IRQ',
  Japão: 'JAP',
  Jordânia: 'JOR',
  Marrocos: 'MAR',
  México: 'MEX',
  Noruega: 'NOR',
  'Nova Zelândia': 'NZL',
  Panamá: 'PAN',
  Paraguai: 'PAR',
  Portugal: 'POR',
  'RD Congo': 'RDC',
  'Rep. Tcheca': 'RTC',
  Senegal: 'SEN',
  Suécia: 'SUE',
  Suíça: 'SUI',
  Tunísia: 'TUN',
  Turquia: 'TUR',
  Uruguai: 'URU',
  Uzbequistão: 'UZB'
};

const PHASES = {
  r32: 'dezeszeseisavos',
  r16: 'oitavas',
  qf: 'quartas',
  sf: 'semis'
};
const APP_BASE_URL = import.meta.env.BASE_URL || '/';

const BRACKET_PANEL_STYLES = `
.bracket-panel-header{display:flex;align-items:center;justify-content:space-between;gap:10px}
.bracket-panel-header h2{margin:0;color:var(--app-text-primary);font-size:18px;font-weight:900}
.bracket-panel-header p{margin:4px 0 0;color:var(--app-text-muted);font-size:12px;font-weight:700}
.bracket-panel-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px}
.bracket-view-select{min-height:40px;max-width:240px;border:1px solid var(--app-border-soft);border-radius:12px;background:var(--app-surface-card-strong);color:var(--app-text-primary);padding:8px 34px 8px 12px;font-size:12px;font-weight:800}
.bracket-panel-legend{display:inline-flex;min-height:40px;align-items:center;gap:8px;border:1px solid var(--app-accent-emerald-border);border-radius:999px;background:var(--app-accent-emerald-bg);color:var(--app-accent-emerald-text);padding:8px 12px;font-size:11px;font-weight:800}
.bracket-legend-dot{width:12px;height:12px;border-radius:999px;background:#16a34a;box-shadow:0 0 0 4px rgba(34,197,94,.18)}
.bracket-panel-shell{overflow:visible;padding:8px}
.bracket-scroll{display:flex;justify-content:center;overflow:visible;border-radius:22px;background:var(--app-surface-card-strong)}
.bracket-stage{--bracket-scale:.46;position:relative;flex:0 0 auto;width:calc(1480px * var(--bracket-scale));height:calc(980px * var(--bracket-scale));min-width:calc(1480px * var(--bracket-scale))}
.bracket-canvas{position:absolute;top:0;left:0;width:1480px;height:980px;transform:scale(var(--bracket-scale));transform-origin:top left;background:linear-gradient(90deg,rgba(148,163,184,.08) 1px,transparent 1px),linear-gradient(180deg,rgba(148,163,184,.08) 1px,transparent 1px),var(--app-surface-card-strong);background-size:74px 74px}
.bracket-mobile{display:none}
.bracket-lines{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.bracket-lines path{fill:none;stroke:#94a3b8;stroke-linecap:round;stroke-linejoin:round;stroke-width:3;opacity:.72}
.bracket-node-position{position:absolute;z-index:2;transform:translate(-50%,-50%)}
.bracket-team-node{display:flex;min-width:68px;align-items:center;gap:8px;color:var(--app-text-primary)}
.bracket-team-node--left{flex-direction:row}
.bracket-team-node--right{flex-direction:row-reverse}
.bracket-team-node--center{flex-direction:column}
.bracket-team-flag{display:grid;place-items:center;flex:0 0 auto;overflow:hidden;border:4px solid #cbd5e1;border-radius:999px;background:#f8fafc;box-shadow:0 8px 18px -14px rgba(15,23,42,.7)}
.bracket-team-node.is-correct .bracket-team-flag{border-color:#00b759;box-shadow:0 0 0 6px rgba(0,183,89,.24),0 12px 22px -12px rgba(0,128,80,.75)}
.bracket-team-node.is-empty .bracket-team-flag{border-style:dashed;background:var(--app-surface-muted)}
.bracket-team-flag img{width:100%;height:100%;object-fit:cover}
.bracket-team-flag span{color:var(--app-text-muted);font-size:20px;font-weight:900}
.bracket-team-code{max-width:92px;overflow:hidden;color:var(--app-text-secondary);font-size:36px;font-weight:900;line-height:1;text-overflow:ellipsis;white-space:nowrap}
.bracket-team-node--sm .bracket-team-flag{width:48px;height:48px}
.bracket-team-node--sm .bracket-team-code{font-size:32px}
.bracket-team-node--md .bracket-team-flag{width:58px;height:58px}
.bracket-team-node--lg .bracket-team-flag{width:72px;height:72px}
.bracket-team-node--xl .bracket-team-flag{width:86px;height:86px}
.bracket-team-node--champion .bracket-team-flag{width:136px;height:136px;border-width:7px}
.bracket-team-node--champion .bracket-team-code{display:none}
.bracket-center-label{position:absolute;z-index:3;top:286px;left:740px;width:180px;transform:translateX(-50%);text-align:center}
.bracket-center-label div{color:var(--app-text-muted);font-size:34px;font-weight:800;line-height:1}
.bracket-center-label strong{display:block;margin-top:6px;color:var(--app-text-primary);font-size:42px;font-weight:900;line-height:1.05}
.bracket-podium{position:absolute;z-index:3;top:746px;left:740px;display:grid;width:500px;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;transform:translateX(-50%)}
.bracket-podium-chip{min-width:0;border:1px solid var(--app-border-soft);border-radius:16px;background:var(--app-surface-soft);padding:16px 14px;text-align:center}
.bracket-podium-chip.is-correct{border-color:#00b759;background:rgba(0,183,89,.14);box-shadow:inset 0 0 0 1px rgba(0,183,89,.32),0 8px 18px -16px rgba(0,128,80,.8)}
.bracket-podium-chip span{display:block;color:var(--app-text-muted);font-size:20px;font-weight:900}
.bracket-podium-chip strong{display:block;margin-top:8px;overflow:hidden;color:var(--app-text-primary);font-size:26px;font-weight:900;text-overflow:ellipsis;white-space:nowrap}
.bracket-mobile-hero{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:8px;border:1px solid var(--app-accent-emerald-border);border-radius:18px;background:var(--app-accent-emerald-bg);padding:8px}
.bracket-mobile-hero .bracket-team-node{min-width:0}
.bracket-mobile-hero .bracket-team-node--xl .bracket-team-flag{width:58px;height:58px;border-width:4px}
.bracket-mobile-title span{display:block;color:var(--app-text-muted);font-size:11px;font-weight:900}
.bracket-mobile-title strong{display:block;margin-top:2px;overflow:hidden;color:var(--app-text-primary);font-size:18px;font-weight:900;line-height:1.05;text-overflow:ellipsis;white-space:nowrap}
.bracket-mobile-phases{margin-top:8px;display:grid;gap:6px}
.bracket-mobile-phase{border:1px solid var(--app-border-soft);border-radius:14px;background:var(--app-surface-soft);padding:6px}
.bracket-mobile-phase-title{display:flex;align-items:center;justify-content:space-between;gap:8px;color:var(--app-text-muted);font-size:10px;font-weight:900;text-transform:uppercase}
.bracket-mobile-team-grid{margin-top:5px;display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:3px}
.bracket-mobile-team{display:grid;min-width:0;place-items:center;gap:2px}
.bracket-mobile-team .bracket-team-flag{width:22px;height:22px;border-width:2px}
.bracket-mobile-team.is-correct .bracket-team-flag{border-color:#00b759;box-shadow:0 0 0 3px rgba(0,183,89,.24)}
.bracket-mobile-team.is-empty .bracket-team-flag{border-style:dashed;background:var(--app-surface-muted)}
.bracket-mobile-team-code{max-width:100%;overflow:hidden;color:var(--app-text-secondary);font-size:8px;font-weight:900;line-height:1;text-overflow:ellipsis;white-space:nowrap}
.bracket-mobile-podium{margin-top:8px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
.bracket-mobile-podium .bracket-podium-chip{padding:6px 5px;border-radius:12px}
.bracket-mobile-podium .bracket-podium-chip strong{font-size:9px}
@media (max-width:640px){.bracket-panel-header{align-items:stretch;flex-direction:column}.bracket-panel-actions{align-items:stretch;flex-direction:column}.bracket-view-select{max-width:none;width:100%}.bracket-panel-shell{overflow:hidden;padding:8px}.bracket-scroll{justify-content:flex-start;overflow-x:auto;overflow-y:hidden;-webkit-overflow-scrolling:touch}.bracket-stage{margin:0 auto}.bracket-mobile{display:none}}
`;

const ROUND_BY_MATCH_ID = new Map(
  [
    ...MATA_MATA_CONFIG.r32.map((match, index) => [match.id, { round: 'r32', phaseKey: PHASES.r32, index, match }]),
    ...MATA_MATA_CONFIG.r16.map((match, index) => [match.id, { round: 'r16', phaseKey: PHASES.r16, index, match }]),
    ...MATA_MATA_CONFIG.qf.map((match, index) => [match.id, { round: 'qf', phaseKey: PHASES.qf, index, match }]),
    ...MATA_MATA_CONFIG.sf.map((match, index) => [match.id, { round: 'sf', phaseKey: PHASES.sf, index, match }])
  ]
);

const normalizeTeam = (team) => {
  const label = typeof team === 'string' ? team.trim() : '';
  if (!label) return '';
  return resolveLocalTeamName({ name: label, shortName: label }) || label;
};

const isRealTeam = (team) => {
  const label = normalizeTeam(team);
  if (!label) return false;
  if (label === 'A definir' || label === 'Aguardando oficial') return false;
  if (label.startsWith('Venc. ')) return false;
  if (label.startsWith('3o de ') || label.startsWith('3º de ')) return false;
  return true;
};

const getTeamLabel = (team) => {
  const normalized = normalizeTeam(team);
  if (!normalized) return '---';
  return TEAM_SHORT_LABELS[normalized] || normalized.slice(0, 3).toUpperCase();
};

const getFlagPath = (team) => {
  const normalized = normalizeTeam(team);
  const code = FLAG_BY_TEAM[normalized] || FLAG_BY_TEAM[team];
  return code ? `${APP_BASE_URL}flags/${code}.svg` : '';
};

const getPick = (source, phaseKey, index) => {
  const picks = Array.isArray(source?.[phaseKey]) ? source[phaseKey] : [];
  return normalizeTeam(picks[index] || '');
};

const collectR32MatchIds = (matchId) => {
  const entry = ROUND_BY_MATCH_ID.get(matchId);
  if (!entry) return [];
  if (entry.round === 'r32') return [matchId];
  return [
    ...collectR32MatchIds(entry.match.feedA),
    ...collectR32MatchIds(entry.match.feedB)
  ];
};

const makePoint = (x, y) => ({ x, y });

const BRACKET_ADVANCEMENT_MATCHES = [
  ...MATA_MATA_CONFIG.r16,
  ...MATA_MATA_CONFIG.qf,
  ...MATA_MATA_CONFIG.sf,
  { id: 104, feedA: 101, feedB: 102 }
];

const getAdvancementPlaceholder = (value) => String(value || '').trim().toUpperCase().replace(/\s+/g, '');

const getDefaultViewId = (currentUser, modoAdmin) => (
  modoAdmin ? 'real' : String(currentUser?.id || 'real')
);

function TeamNode({ team, correct = false, size = 'md', align = 'center', title = '' }) {
  const normalizedTeam = normalizeTeam(team);
  const flagPath = getFlagPath(normalizedTeam);
  const label = getTeamLabel(normalizedTeam);
  const displayTitle = title || normalizedTeam || 'A definir';

  return (
    <div
      className={`bracket-team-node bracket-team-node--${size} bracket-team-node--${align} ${correct ? 'is-correct' : ''} ${!isRealTeam(normalizedTeam) ? 'is-empty' : ''}`}
      title={displayTitle}
      aria-label={displayTitle}
    >
      <div className="bracket-team-flag">
        {flagPath && isRealTeam(normalizedTeam)
          ? <img src={flagPath} alt="" loading="lazy" />
          : <span>{label}</span>}
      </div>
      <span className="bracket-team-code">{label}</span>
    </div>
  );
}

function PodiumChip({ label, team, correct }) {
  return (
    <div className={`bracket-podium-chip ${correct ? 'is-correct' : ''}`}>
      <span>{label}</span>
      <strong>{normalizeTeam(team) || 'A definir'}</strong>
    </div>
  );
}

function MobileTeamChip({ team, correct }) {
  const normalizedTeam = normalizeTeam(team);
  const flagPath = getFlagPath(normalizedTeam);
  const label = getTeamLabel(normalizedTeam);

  return (
    <div className={`bracket-mobile-team ${correct ? 'is-correct' : ''} ${!isRealTeam(normalizedTeam) ? 'is-empty' : ''}`} title={normalizedTeam || 'A definir'}>
      <div className="bracket-team-flag">
        {flagPath && isRealTeam(normalizedTeam)
          ? <img src={flagPath} alt="" loading="lazy" />
          : <span>{label}</span>}
      </div>
      <span className="bracket-mobile-team-code">{label}</span>
    </div>
  );
}

function useBracketScale() {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.46);

  useEffect(() => {
    const updateScale = () => {
      const node = ref.current;
      if (!node) return;
      const width = node.querySelector('.bracket-scroll')?.clientWidth || node.clientWidth || 0;
      const viewportHeight = window.innerHeight || 900;
      const topOffset = node.getBoundingClientRect().top || 0;
      const availableHeight = Math.max(240, viewportHeight - topOffset - 24);
      const isPhone = window.matchMedia?.('(max-width: 640px)').matches;
      const nextScale = isPhone
        ? Math.min(availableHeight / 980, 0.46)
        : Math.min(width / 1480, availableHeight / 980, 0.46);
      setScale(Math.max(0.22, Number.isFinite(nextScale) ? nextScale : 0.46));
    };

    updateScale();
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(updateScale) : null;
    if (observer && ref.current) observer.observe(ref.current);
    window.addEventListener('resize', updateScale);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  return [ref, scale];
}

function BracketPanel({
  currentUser,
  modoAdmin,
  jogosReais,
  participanteUsuarios = [],
  palpitesJogos = {},
  palpitesUsuarioAtual,
  palpitesMataMata = {},
  palpitesMataUsuarioAtual,
  gabaritoMataMata,
  officialBracketSlots,
  condutaGrupos
}) {
  const [scaleRef, bracketScale] = useBracketScale();
  const [selectedViewId, setSelectedViewId] = useState(() => getDefaultViewId(currentUser, modoAdmin));

  useEffect(() => {
    setSelectedViewId(getDefaultViewId(currentUser, modoAdmin));
  }, [currentUser?.id, modoAdmin]);

  useEffect(() => {
    const scroller = scaleRef.current?.querySelector('.bracket-scroll');
    if (!scroller || !window.matchMedia?.('(max-width: 640px)').matches) return;
    scroller.scrollLeft = Math.max(0, (scroller.scrollWidth - scroller.clientWidth) / 2);
  }, [bracketScale, selectedViewId, scaleRef]);

  const participantOptions = useMemo(() => {
    const participants = [...participanteUsuarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const currentId = String(currentUser?.id || '');
    const currentParticipant = participants.find((user) => String(user.id) === currentId);
    const others = participants.filter((user) => String(user.id) !== currentId);

    return [
      ...(currentParticipant ? [{ id: String(currentParticipant.id), label: 'Meu chaveamento', user: currentParticipant }] : []),
      ...others.map((user) => ({ id: String(user.id), label: user.nome, user })),
      { id: 'real', label: 'Real/oficial', user: null }
    ];
  }, [participanteUsuarios, currentUser?.id]);

  const normalizedSelectedViewId = participantOptions.some((option) => option.id === selectedViewId)
    ? selectedViewId
    : getDefaultViewId(currentUser, modoAdmin);
  const selectedOption = participantOptions.find((option) => option.id === normalizedSelectedViewId) || participantOptions[0];
  const selectedUser = selectedOption?.user || null;
  const isOfficialView = selectedOption?.id === 'real';

  const bracket = useMemo(() => {
    const selectedUserId = selectedUser?.id;
    const source = isOfficialView
      ? (gabaritoMataMata || {})
      : (palpitesMataMata[selectedUserId] || (String(selectedUserId) === String(currentUser?.id) ? palpitesMataUsuarioAtual : {}) || {});
    const selectedGamePredictions = isOfficialView
      ? undefined
      : (palpitesJogos[selectedUserId] || (String(selectedUserId) === String(currentUser?.id) ? palpitesUsuarioAtual : {}) || {});
    const officialStates = {
      dezeszeseisavos: getKnockoutPhaseOfficialState({ phaseKey: 'dezeszeseisavos', officialKnockout: gabaritoMataMata, officialBracketSlots }),
      oitavas: getKnockoutPhaseOfficialState({ phaseKey: 'oitavas', officialKnockout: gabaritoMataMata, officialBracketSlots }),
      quartas: getKnockoutPhaseOfficialState({ phaseKey: 'quartas', officialKnockout: gabaritoMataMata, officialBracketSlots }),
      semis: getKnockoutPhaseOfficialState({ phaseKey: 'semis', officialKnockout: gabaritoMataMata, officialBracketSlots })
    };
    const fallbackR32Participants = getKnockoutPhaseParticipantEntries({
      phaseKey: 'dezeszeseisavos',
      knockoutBets: source,
      matches: jogosReais,
      gamePredictions: selectedGamePredictions,
      conduct: condutaGrupos
    });
    const r32Sides = fallbackR32Participants.reduce((acc, entry) => {
      if (!acc[entry.matchId]) acc[entry.matchId] = {};
      acc[entry.matchId][entry.side] = normalizeTeam(entry.team);
      return acc;
    }, {});
    if (isOfficialView) {
      MATA_MATA_CONFIG.r32.forEach((match) => {
        const slot = getOfficialBracketSlot(officialBracketSlots, match.id);
        if (!slot) return;
        if (!r32Sides[match.id]) r32Sides[match.id] = {};
        r32Sides[match.id].A = normalizeTeam(slot.teamA) || r32Sides[match.id].A || '';
        r32Sides[match.id].B = normalizeTeam(slot.teamB) || r32Sides[match.id].B || '';
      });
    }
    const isPhaseCorrect = (phaseKey, team) => {
      const normalized = normalizeTeam(team);
      return Boolean(normalized && officialStates[phaseKey]?.teamSet?.has(normalized));
    };
    const isFinalistCorrect = (team) => {
      const normalized = normalizeTeam(team);
      return Boolean(normalized && [gabaritoMataMata?.campeao, gabaritoMataMata?.vice].map(normalizeTeam).includes(normalized));
    };
    const getOfficialMatchWinner = (matchId) => {
      const winnerPlaceholder = `W${matchId}`;
      const parent = BRACKET_ADVANCEMENT_MATCHES.find((match) => (
        match.feedA === matchId
        || match.feedB === matchId
        || getAdvancementPlaceholder(getOfficialBracketSlot(officialBracketSlots, match.id)?.placeholderA) === winnerPlaceholder
        || getAdvancementPlaceholder(getOfficialBracketSlot(officialBracketSlots, match.id)?.placeholderB) === winnerPlaceholder
      ));
      const parentSlot = parent ? getOfficialBracketSlot(officialBracketSlots, parent.id) : null;
      if (!parentSlot) return '';

      if (parent.feedA === matchId || getAdvancementPlaceholder(parentSlot.placeholderA) === winnerPlaceholder) {
        return normalizeTeam(parentSlot.teamA);
      }
      if (parent.feedB === matchId || getAdvancementPlaceholder(parentSlot.placeholderB) === winnerPlaceholder) {
        return normalizeTeam(parentSlot.teamB);
      }
      return '';
    };
    const getMatchWinner = (matchId) => {
      if (isOfficialView) return getOfficialMatchWinner(matchId);
      const entry = ROUND_BY_MATCH_ID.get(matchId);
      if (!entry) return '';
      return getPick(source, entry.phaseKey, entry.index);
    };
    const getWinnerCorrect = (entry, winner) => {
      if (entry.round === 'r32') return isPhaseCorrect('oitavas', winner);
      if (entry.round === 'r16') return isPhaseCorrect('quartas', winner);
      if (entry.round === 'qf') return isPhaseCorrect('semis', winner);
      return isFinalistCorrect(winner);
    };
    const pickPhase = (phaseKey, length, correctPhaseKey) => (
      Array.from({ length }, (_, index) => {
        const team = getPick(source, phaseKey, index);
        return {
          team,
          correct: correctPhaseKey === 'finalistas'
            ? isFinalistCorrect(team)
            : isPhaseCorrect(correctPhaseKey, team)
        };
      })
    );
    const halves = [
      { side: 'left', semifinalId: 101 },
      { side: 'right', semifinalId: 102 }
    ];
    const nodeMap = new Map();
    const nodes = [];
    const lines = [];
    const canvasHeight = 980;
    const leafStartY = 50;
    const leafGap = 54;
    const sideX = {
      left: { leaf: 74, r32: 194, r16: 330, qf: 466, sf: 604 },
      right: { leaf: 1406, r32: 1286, r16: 1150, qf: 1014, sf: 876 }
    };

    const addNode = (key, point, node) => {
      nodeMap.set(key, point);
      nodes.push({ key, point, ...node });
    };
    const addLine = (fromKey, toKey) => {
      const from = nodeMap.get(fromKey);
      const to = nodeMap.get(toKey);
      if (from && to) lines.push({ key: `${fromKey}->${toKey}`, from, to });
    };

    halves.forEach(({ side, semifinalId }) => {
      const align = side === 'left' ? 'right' : 'left';
      const r32Ids = collectR32MatchIds(semifinalId);
      r32Ids.forEach((matchId, matchPosition) => {
        const sideTeams = [r32Sides[matchId]?.A || '', r32Sides[matchId]?.B || ''];
        sideTeams.forEach((team, sideIndex) => {
          const rowIndex = matchPosition * 2 + sideIndex;
          const key = `${side}-leaf-${matchId}-${sideIndex}`;
          addNode(key, makePoint(sideX[side].leaf, leafStartY + rowIndex * leafGap), {
            team,
            size: 'sm',
            align,
            correct: isPhaseCorrect('dezeszeseisavos', team),
            title: team || 'A definir'
          });
        });
        const entry = ROUND_BY_MATCH_ID.get(matchId);
        const winner = getMatchWinner(matchId);
        const winnerKey = `${side}-r32-${matchId}`;
        const winnerY = leafStartY + (matchPosition * 2 + 0.5) * leafGap;
        addNode(winnerKey, makePoint(sideX[side].r32, winnerY), {
          team: winner,
          size: 'md',
          align,
          correct: getWinnerCorrect(entry, winner),
          title: winner || `Vencedor do jogo ${matchId}`
        });
        addLine(`${side}-leaf-${matchId}-0`, winnerKey);
        addLine(`${side}-leaf-${matchId}-1`, winnerKey);
      });

      const r16Ids = [...new Set(r32Ids.map((matchId) => {
        const parent = MATA_MATA_CONFIG.r16.find((match) => match.feedA === matchId || match.feedB === matchId);
        return parent?.id;
      }).filter(Boolean))];
      r16Ids.forEach((matchId) => {
        const entry = ROUND_BY_MATCH_ID.get(matchId);
        const winner = getMatchWinner(matchId);
        const feedPoints = [entry.match.feedA, entry.match.feedB].map((feedId) => nodeMap.get(`${side}-r32-${feedId}`)).filter(Boolean);
        const y = feedPoints.reduce((total, point) => total + point.y, 0) / Math.max(feedPoints.length, 1);
        const key = `${side}-r16-${matchId}`;
        addNode(key, makePoint(sideX[side].r16, y), {
          team: winner,
          size: 'md',
          align,
          correct: getWinnerCorrect(entry, winner),
          title: winner || `Vencedor do jogo ${matchId}`
        });
        addLine(`${side}-r32-${entry.match.feedA}`, key);
        addLine(`${side}-r32-${entry.match.feedB}`, key);
      });

      const qfIds = [...new Set(r16Ids.map((matchId) => {
        const parent = MATA_MATA_CONFIG.qf.find((match) => match.feedA === matchId || match.feedB === matchId);
        return parent?.id;
      }).filter(Boolean))];
      qfIds.forEach((matchId) => {
        const entry = ROUND_BY_MATCH_ID.get(matchId);
        const winner = getMatchWinner(matchId);
        const feedPoints = [entry.match.feedA, entry.match.feedB].map((feedId) => nodeMap.get(`${side}-r16-${feedId}`)).filter(Boolean);
        const y = feedPoints.reduce((total, point) => total + point.y, 0) / Math.max(feedPoints.length, 1);
        const key = `${side}-qf-${matchId}`;
        addNode(key, makePoint(sideX[side].qf, y), {
          team: winner,
          size: 'lg',
          align,
          correct: getWinnerCorrect(entry, winner),
          title: winner || `Vencedor do jogo ${matchId}`
        });
        addLine(`${side}-r16-${entry.match.feedA}`, key);
        addLine(`${side}-r16-${entry.match.feedB}`, key);
      });

      const sfEntry = ROUND_BY_MATCH_ID.get(semifinalId);
      const finalist = getMatchWinner(semifinalId);
      const sfFeedPoints = [sfEntry.match.feedA, sfEntry.match.feedB].map((feedId) => nodeMap.get(`${side}-qf-${feedId}`)).filter(Boolean);
      const sfY = sfFeedPoints.reduce((total, point) => total + point.y, 0) / Math.max(sfFeedPoints.length, 1);
      const sfKey = `${side}-sf-${semifinalId}`;
      addNode(sfKey, makePoint(sideX[side].sf, sfY), {
        team: finalist,
        size: 'xl',
        align,
        correct: getWinnerCorrect(sfEntry, finalist),
        title: finalist || `Finalista do jogo ${semifinalId}`
      });
      addLine(`${side}-qf-${sfEntry.match.feedA}`, sfKey);
      addLine(`${side}-qf-${sfEntry.match.feedB}`, sfKey);
    });

    const champion = normalizeTeam(source?.campeao || '');
    const championPoint = makePoint(740, canvasHeight / 2);
    addNode('champion', championPoint, {
      team: champion,
      size: 'champion',
      align: 'center',
      correct: Boolean(champion && normalizeTeam(gabaritoMataMata?.campeao) === champion),
      title: champion || 'Campeão'
    });
    addLine('left-sf-101', 'champion');
    addLine('right-sf-102', 'champion');

    return {
      nodes,
      lines,
      champion,
      championCorrect: Boolean(champion && normalizeTeam(gabaritoMataMata?.campeao) === champion),
      mobilePhases: [
        { title: '16 avos', teams: pickPhase('dezeszeseisavos', 16, 'oitavas') },
        { title: 'Oitavas', teams: pickPhase('oitavas', 8, 'quartas') },
        { title: 'Quartas', teams: pickPhase('quartas', 4, 'semis') },
        { title: 'Semis', teams: pickPhase('semis', 2, 'finalistas') }
      ],
      podium: {
        vice: normalizeTeam(source?.vice || ''),
        terceiro: normalizeTeam(source?.terceiro || ''),
        quarto: normalizeTeam(source?.quarto || '')
      }
    };
  }, [currentUser?.id, gabaritoMataMata, palpitesMataMata, palpitesMataUsuarioAtual, palpitesJogos, jogosReais, palpitesUsuarioAtual, officialBracketSlots, condutaGrupos, selectedUser, isOfficialView]);

  const viewerLabel = isOfficialView
    ? 'Real/oficial'
    : String(selectedUser?.id) === String(currentUser?.id)
      ? currentUser?.nome || 'Seu chaveamento'
      : selectedUser?.nome || 'Apostador';

  return (
    <div className="animate-fade-in space-y-4">
      <style>{BRACKET_PANEL_STYLES}</style>
      <div className="theme-glass-card bracket-panel-header p-5">
        <div>
          <h2>Chaveamento</h2>
          <p>{viewerLabel}</p>
        </div>
        <div className="bracket-panel-actions">
          <select
            className="bracket-view-select"
            value={selectedOption?.id || normalizedSelectedViewId}
            onChange={(event) => setSelectedViewId(event.target.value)}
            aria-label="Escolher chaveamento"
          >
            {participantOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.label}</option>
            ))}
          </select>
          <div className="bracket-panel-legend">
            <span className="bracket-legend-dot"></span>
            Acertos confirmados ate agora
          </div>
        </div>
      </div>

      <div ref={scaleRef} className="theme-glass-card bracket-panel-shell">
        <div className="bracket-scroll" aria-label="Chaveamento completo">
          <div className="bracket-stage" style={{ '--bracket-scale': bracketScale }}>
            <div className="bracket-canvas">
              <svg className="bracket-lines" viewBox="0 0 1480 980" aria-hidden="true">
                {bracket.lines.map((line) => (
                  <path
                    key={line.key}
                    d={`M ${line.from.x} ${line.from.y} H ${(line.from.x + line.to.x) / 2} V ${line.to.y} H ${line.to.x}`}
                  />
                ))}
              </svg>
              {bracket.nodes.map((node) => (
                <div
                  key={node.key}
                  className="bracket-node-position"
                  style={{ left: node.point.x, top: node.point.y }}
                >
                  <TeamNode
                    team={node.team}
                    correct={node.correct}
                    size={node.size}
                    align={node.align}
                    title={node.title}
                  />
                </div>
              ))}
              <div className="bracket-center-label">
                <div>Campeão</div>
                <strong>{bracket.champion || 'A definir'}</strong>
              </div>
              <div className="bracket-podium">
                <PodiumChip label="Vice" team={bracket.podium.vice} correct={Boolean(bracket.podium.vice && normalizeTeam(gabaritoMataMata?.vice) === bracket.podium.vice)} />
                <PodiumChip label="3º" team={bracket.podium.terceiro} correct={Boolean(bracket.podium.terceiro && normalizeTeam(gabaritoMataMata?.terceiro) === bracket.podium.terceiro)} />
                <PodiumChip label="4º" team={bracket.podium.quarto} correct={Boolean(bracket.podium.quarto && normalizeTeam(gabaritoMataMata?.quarto) === bracket.podium.quarto)} />
              </div>
            </div>
          </div>
        </div>
        <div className="bracket-mobile" aria-label="Chaveamento compacto">
          <div className="bracket-mobile-hero">
            <TeamNode
              team={bracket.champion}
              correct={bracket.championCorrect}
              size="xl"
              align="center"
              title={bracket.champion || 'Campeão'}
            />
            <div className="bracket-mobile-title">
              <span>Campeão</span>
              <strong>{bracket.champion || 'A definir'}</strong>
            </div>
          </div>
          <div className="bracket-mobile-podium">
            <PodiumChip label="Vice" team={bracket.podium.vice} correct={Boolean(bracket.podium.vice && normalizeTeam(gabaritoMataMata?.vice) === bracket.podium.vice)} />
            <PodiumChip label="3º" team={bracket.podium.terceiro} correct={Boolean(bracket.podium.terceiro && normalizeTeam(gabaritoMataMata?.terceiro) === bracket.podium.terceiro)} />
            <PodiumChip label="4º" team={bracket.podium.quarto} correct={Boolean(bracket.podium.quarto && normalizeTeam(gabaritoMataMata?.quarto) === bracket.podium.quarto)} />
          </div>
          <div className="bracket-mobile-phases">
            {bracket.mobilePhases.map((phase) => (
              <div key={phase.title} className="bracket-mobile-phase">
                <div className="bracket-mobile-phase-title">
                  <span>{phase.title}</span>
                  <span>{phase.teams.filter((entry) => entry.correct).length}/{phase.teams.length}</span>
                </div>
                <div className="bracket-mobile-team-grid">
                  {phase.teams.map((entry, index) => (
                    <MobileTeamChip key={`${phase.title}-${index}`} team={entry.team} correct={entry.correct} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BracketPanel);

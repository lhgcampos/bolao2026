import React, { memo, useEffect, useRef } from 'react';
import AvatarBadge from './AvatarBadge.jsx';
import { GRUPOS_2026, buildChronologicalMatchGroups, formatBrazilMatchSchedule, parseMatchDateTime } from '../matchData';
import { GLASS_CARD, GLASS_INPUT, TEXT_MUTED } from '../styles.js';
import { MATA_MATA_CONFIG, PONTOS, SUBMISSION_FIELDS } from '../constants.js';
import { calcularPontosJogo, formatSubmissionDate, getWinnerOfMatch } from '../utils.js';
import { evaluateKnockoutPhasePick, getKnockoutPhaseOfficialState } from '../officialResults/knockoutPhaseScoring.js';
import { buildKnockoutReviewCopy, getOfficialKnockoutMatchup } from '../officialResults/knockoutReviewPresentation.js';
import { getMatchResultVariant } from '../officialResults/officialResultsView';

const PANEL_STAGE_OPTIONS = [
  { id: 'todos', label: 'Painel completo' },
  { id: 'grupos', label: '1a Fase' },
  { id: 'r32', label: '16 avos' },
  { id: 'r16', label: 'Oitavas' },
  { id: 'qf', label: 'Quartas' },
  { id: 'sf', label: 'Semifinais' },
  { id: 'podio', label: 'Pódio final' }
];

const buildStatus = (variant) => {
  if (variant === 'cravou') return { label: 'Cravou', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
  if (variant === 'winner') return { label: 'Acertou vencedor', tone: 'border-sky-200 bg-sky-50 text-sky-700', dot: 'bg-sky-500' };
  if (variant === 'correct') return { label: 'Acertou', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
  if (variant === 'partial') return { label: 'Oficial parcial', tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
  if (variant === 'error') return { label: 'Errou', tone: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' };
  if (variant === 'waiting-real') return { label: 'Aguardando real', tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
  if (variant === 'waiting-official') return { label: 'Aguardando oficial', tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
  if (variant === 'duplicate') return { label: 'Duplicado', tone: 'border-slate-200 bg-slate-50 text-slate-600', dot: 'bg-slate-400' };
  if (variant === 'temporary') return { label: 'Temporário', tone: 'border-orange-200 bg-orange-50 text-orange-700', dot: 'bg-orange-500' };
  return { label: 'Sem palpite', tone: 'border-slate-200 bg-slate-50 text-slate-500', dot: 'bg-slate-400' };
};

function ReviewSheet({
  reviewSearch,
  setReviewSearch,
  reviewGroupFilter,
  setReviewGroupFilter,
  reviewGameSort,
  setReviewGameSort,
  reviewPhaseFilter,
  setReviewPhaseFilter,
  participanteUsuarios,
  jogosReais,
  palpitesJogos,
  submissoes,
  palpitesMataMata,
  gabaritoMataMata,
  officialBracketSlots,
  condutaGrupos,
  getR32Team,
  buildThirdPlaceAllocation,
  scrollToMatchId,
  scrollRequestKey
}) {
  const rowRefs = useRef({});
  const searchTerm = reviewSearch.trim().toLowerCase();
  const usersFiltrados = [...participanteUsuarios]
    .filter((user) => !searchTerm || user.nome.toLowerCase().includes(searchTerm))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const participantColumnCount = Math.max(usersFiltrados.length, 1);
  const reviewGridTemplate = `308px repeat(${participantColumnCount}, minmax(196px, 1fr))`;
  const reviewDescription = 'O painel segue a sequencia completa do bolao: 1a Fase, mata-mata e podio final. No mata-mata, cada coluna mostra o confronto daquela chave, o time escolhido pelo usuario e o que ja pontuou.';

  const setRowRef = (rowId, surface) => (node) => {
    if (!rowRefs.current[rowId]) rowRefs.current[rowId] = {};

    if (node) {
      rowRefs.current[rowId][surface] = node;
      return;
    }

    delete rowRefs.current[rowId][surface];
    if (!Object.keys(rowRefs.current[rowId]).length) delete rowRefs.current[rowId];
  };

  useEffect(() => {
    if (!scrollToMatchId || !scrollRequestKey) return undefined;

    const animationFrameId = window.requestAnimationFrame(() => {
      const rowNodes = Object.values(rowRefs.current[String(scrollToMatchId)] || {});
      const targetNode = rowNodes.find((node) => node && node.offsetParent !== null) || rowNodes.find(Boolean);
      if (!targetNode) return;
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [scrollRequestKey, scrollToMatchId]);

  const compareByDate = (a, b) => (
    parseMatchDateTime(a) - parseMatchDateTime(b) ||
    a.grupo.localeCompare(b.grupo, 'pt-BR') ||
    a.id - b.id
  );

  const compareByGroup = (a, b) => (
    a.grupo.localeCompare(b.grupo, 'pt-BR') ||
    parseMatchDateTime(a) - parseMatchDateTime(b) ||
    a.id - b.id
  );

  const includeGroupStage = reviewPhaseFilter === 'todos' || reviewPhaseFilter === 'grupos';
  const shouldApplyGroupFilter = reviewPhaseFilter === 'grupos';
  const jogosFiltrados = jogosReais
    .filter((jogo) => !shouldApplyGroupFilter || reviewGroupFilter === 'todos' || jogo.grupo === reviewGroupFilter)
    .sort(reviewGameSort === 'group' ? compareByGroup : compareByDate);

  const gameRows = jogosFiltrados.map((jogo) => {
    const realPreenchido = jogo.placarA !== '' && jogo.placarB !== '';
    const schedule = formatBrazilMatchSchedule(jogo);
    const resultVariant = getMatchResultVariant(jogo);

    return {
      id: `game-${jogo.id}`,
      kind: 'game',
      matchId: jogo.id,
      grupo: jogo.grupo,
      dataHora: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
      local: jogo.local,
      timeA: jogo.timeA,
      timeB: jogo.timeB,
      sectionTone: 'bg-sky-50 text-sky-700',
      summaryTone: 'text-sky-700',
      real: realPreenchido ? `${jogo.placarA} x ${jogo.placarB}` : '—',
      realStatus: resultVariant === 'final'
        ? buildStatus('correct')
        : resultVariant === 'temporary'
          ? buildStatus('temporary')
          : null,
      realStatusLabel: resultVariant === 'final'
        ? 'Placar oficial'
        : resultVariant === 'temporary'
          ? 'Placar temporário'
          : 'Aguardando definição',
      palpites: usersFiltrados.map((user) => {
        const palpite = palpitesJogos[user.id]?.[jogo.id];
        const palpitePreenchido = Boolean(palpite && palpite.placarA !== '' && palpite.placarB !== '');
        const resultado = palpitePreenchido && realPreenchido
          ? calcularPontosJogo(palpite.placarA, palpite.placarB, jogo.placarA, jogo.placarB)
          : null;

        let status = buildStatus();
        if (palpitePreenchido && !realPreenchido) status = buildStatus('waiting-real');
        if (resultado?.pts === PONTOS.JOGO.CHEIO) status = buildStatus('cravou');
        if (resultado?.pts === PONTOS.JOGO.VITORIA) status = buildStatus('winner');
        if (resultado && resultado.pts === 0) status = buildStatus('error');

        return {
          userId: user.id,
          palpite: palpitePreenchido ? `${palpite.placarA} x ${palpite.placarB}` : '—',
          status,
          pontos: resultado?.pts ?? 0,
          envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.JOGOS])
        };
      })
    };
  });

  const gameRowsByMatchId = new Map(gameRows.map((row) => [row.matchId, row]));
  const groupedGameSections = reviewGameSort === 'group'
    ? Object.entries(
      gameRows.reduce((acc, row) => {
        if (!acc[row.grupo]) acc[row.grupo] = [];
        acc[row.grupo].push(row);
        return acc;
      }, {})
    ).sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB, 'pt-BR'))
      .map(([grupo, rows]) => ({
        id: `games-group-${grupo}`,
        title: `Grupo ${grupo}`,
        sectionTone: 'bg-sky-50 text-sky-700',
        rows
      }))
    : buildChronologicalMatchGroups(jogosFiltrados).map((dayGroup) => ({
      id: `games-day-${dayGroup.dayKey}`,
      title: dayGroup.dayLabel,
      sectionTone: 'bg-sky-50 text-sky-700',
      rows: dayGroup.matches
        .map((match) => gameRowsByMatchId.get(match.id))
        .filter(Boolean)
    }));

  const userCompletedGroupStage = (userGameBets = {}) => jogosReais.every((jogo) => {
    if (jogo.placarA !== '' && jogo.placarB !== '') return true;
    const palpite = userGameBets?.[jogo.id];
    return Boolean(palpite && palpite.placarA !== '' && palpite.placarB !== '');
  });

  const resolveUserThirdPlaceLabel = (match, allocation, groupStageComplete) => {
    if (!match.refThirdGroups) return null;
    if (!groupStageComplete) return 'A definir';
    return allocation[match.id] || `3o de ${match.refThirdGroups.join('/')}`;
  };

  const resolveUserKnockoutSides = (phaseKey, match, userId) => {
    if (phaseKey === 'dezeszeseisavos') {
      const userGameBets = palpitesJogos[userId] || {};
      const groupStageComplete = userCompletedGroupStage(userGameBets);
      const thirdPlaceAllocation = buildThirdPlaceAllocation(
        jogosReais,
        userGameBets,
        condutaGrupos,
        groupStageComplete
      );

      return {
        sideA: getR32Team(match.refA, jogosReais, userGameBets, condutaGrupos),
        sideB: match.refThirdGroups
          ? resolveUserThirdPlaceLabel(match, thirdPlaceAllocation, groupStageComplete)
          : getR32Team(match.refB, jogosReais, userGameBets, condutaGrupos)
      };
    }

    const userKnockoutBets = palpitesMataMata[userId] || {};
    return {
      sideA: getWinnerOfMatch(match.feedA, userKnockoutBets) || `Venc. ${match.feedA}`,
      sideB: getWinnerOfMatch(match.feedB, userKnockoutBets) || `Venc. ${match.feedB}`
    };
  };

  const resolveKnockoutSides = (phaseKey, match) => {
    const officialMatchup = getOfficialKnockoutMatchup(officialBracketSlots, match.id);

    if (phaseKey === 'dezeszeseisavos' && match?.label?.includes(' x ')) {
      const [sideA, sideB] = match.label.split(' x ');
      return {
        sideA: officialMatchup.teamA || officialMatchup.placeholderA || sideA,
        sideB: officialMatchup.teamB || officialMatchup.placeholderB || sideB
      };
    }

    return {
      sideA: officialMatchup.teamA || getWinnerOfMatch(match.feedA, gabaritoMataMata) || officialMatchup.placeholderA || `Venc. ${match.feedA}`,
      sideB: officialMatchup.teamB || getWinnerOfMatch(match.feedB, gabaritoMataMata) || officialMatchup.placeholderB || `Venc. ${match.feedB}`
    };
  };

  const buildPhaseKnockoutPalpites = ({ phaseKey, points, pickIndex, match }) => usersFiltrados.map((user) => {
    const userMata = palpitesMataMata[user.id] || {};
    const phasePicks = userMata[phaseKey] || [];
    const palpite = phasePicks[pickIndex] || '';
    const userMatchup = resolveUserKnockoutSides(phaseKey, match, user.id);
    const review = evaluateKnockoutPhasePick({
      phaseKey,
      pick: palpite,
      pickIndex,
      allPicks: phasePicks,
      points,
      officialKnockout: gabaritoMataMata,
      officialBracketSlots,
      successLabel: 'Acertou'
    });
    const reviewCopy = buildKnockoutReviewCopy({ review, pick: palpite, points });

    let status = buildStatus();
    if (review.state === 'waiting-official') status = buildStatus('waiting-official');
    if (review.state === 'partial-pending') status = buildStatus('partial');
    if (review.state === 'partial-confirmed' || review.state === 'confirmed') status = buildStatus('correct');
    if (review.state === 'duplicate') status = buildStatus('duplicate');
    if (review.state === 'error') status = buildStatus('error');

    return {
      userId: user.id,
      palpite: palpite || '—',
      status,
      pontos: review.pointsAwarded,
      userMatchup,
      reviewCopy,
      envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.MATA])
    };
  });

  const buildPodiumPalpites = ({ official, points, getter }) => usersFiltrados.map((user) => {
    const palpite = getter(palpitesMataMata[user.id] || {});
    const preenchido = Boolean(palpite);
    const pontos = preenchido && official !== '—' && palpite === official ? points : 0;
    let status = buildStatus();
    if (preenchido && official === '—') status = buildStatus('waiting-official');
    if (pontos > 0) status = buildStatus('correct');
    if (preenchido && official !== '—' && pontos === 0) status = buildStatus('error');

    return {
      userId: user.id,
      palpite: palpite || '—',
      status,
      pontos,
      reviewCopy: official === '—'
        ? {
          badgeLabel: preenchido ? 'Aguardando oficial' : 'Sem palpite',
          pointsLabel: '0 pts por enquanto',
          caption: preenchido
            ? 'A comparacao aparece quando a posicao oficial sair.'
            : 'Nenhuma escolha foi registrada para esta posicao.'
        }
        : pontos > 0
          ? {
            badgeLabel: 'Acertou',
            pointsLabel: `+${points} pts`,
            caption: `Voce acertou esta posicao oficial: ${official}.`
          }
          : {
            badgeLabel: 'Errou',
            pointsLabel: '0 pts',
            caption: preenchido
              ? `Oficial: ${official}.`
              : 'Nenhuma escolha foi registrada para esta posicao.'
          },
      envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.MATA])
    };
  });

  const knockoutSections = [
    { id: 'r32', title: '16 avos de final', phaseKey: 'dezeszeseisavos', points: PONTOS.MATA.R32, list: MATA_MATA_CONFIG.r32 },
    { id: 'r16', title: 'Oitavas de final', phaseKey: 'oitavas', points: PONTOS.MATA.R16, list: MATA_MATA_CONFIG.r16 },
    { id: 'qf', title: 'Quartas de final', phaseKey: 'quartas', points: PONTOS.MATA.QF, list: MATA_MATA_CONFIG.qf },
    { id: 'sf', title: 'Semifinais', phaseKey: 'semis', points: PONTOS.MATA.SF, list: MATA_MATA_CONFIG.sf }
  ].map((section) => ({
    ...section,
    sectionTone: 'bg-violet-50 text-violet-700',
    rows: section.list.map((match, idx) => {
      const schedule = formatBrazilMatchSchedule(match);
      const { sideA, sideB } = resolveKnockoutSides(section.phaseKey, match);
      const officialMatchup = getOfficialKnockoutMatchup(officialBracketSlots, match.id);
      const officialState = getKnockoutPhaseOfficialState({
        phaseKey: section.phaseKey,
        officialKnockout: gabaritoMataMata,
        officialBracketSlots
      });
      const official = officialMatchup.hasPublishedTeams || officialMatchup.placeholderA || officialMatchup.placeholderB
        ? `${officialMatchup.labelA} x ${officialMatchup.labelB}`
        : '—';
      const officialMeta = officialState.isClosed
        ? `${section.points} pts em jogo`
        : officialState.isPartial
          ? `${officialState.publishedCount}/${officialState.expectedCount} times publicados`
          : 'Aguardando definicao';

      return {
        id: `match-${match.id}`,
        kind: 'match',
        summaryTone: 'text-violet-700',
        metaTop: section.title,
        metaBottom: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
        metaNote: match.local,
        matchupTitle: `Jogo ${match.id}`,
        matchupSubtitle: 'Publicacao oficial desta fase',
        sideA,
        sideB,
        official,
        officialBadgeLabel: officialState.isPartial ? 'Publicacao parcial' : 'Oficial',
        officialMeta,
        palpites: buildPhaseKnockoutPalpites({
          phaseKey: section.phaseKey,
          points: section.points,
          pickIndex: idx,
          match
        })
      };
    })
  }));

  const finalInfo = MATA_MATA_CONFIG.final[0];
  const bronzeInfo = MATA_MATA_CONFIG.bronzeFinal[0];
  const finalSchedule = formatBrazilMatchSchedule(finalInfo);
  const bronzeSchedule = formatBrazilMatchSchedule(bronzeInfo);

  const podiumSection = {
    id: 'podio',
    title: 'Pódio final',
    sectionTone: 'bg-amber-50 text-amber-700',
    rows: [
      {
        id: 'podio-campeao',
        metaTop: 'Pódio final',
        metaBottom: `${finalSchedule.day}/${finalSchedule.month} • ${finalSchedule.time} BR`,
        metaNote: finalInfo.local,
        matchupTitle: 'Campeão',
        matchupSubtitle: 'Escolha o vencedor da final',
        official: gabaritoMataMata.campeao || '—',
        officialMeta: `${PONTOS.MATA.CAMPEAO} pts`,
        points: PONTOS.MATA.CAMPEAO,
        field: 'campeao'
      },
      {
        id: 'podio-vice',
        metaTop: 'Pódio final',
        metaBottom: `${finalSchedule.day}/${finalSchedule.month} • ${finalSchedule.time} BR`,
        metaNote: finalInfo.local,
        matchupTitle: 'Vice',
        matchupSubtitle: 'Derrotado da final',
        official: gabaritoMataMata.vice || '—',
        officialMeta: `${PONTOS.MATA.VICE} pts`,
        points: PONTOS.MATA.VICE,
        field: 'vice'
      },
      {
        id: 'podio-terceiro',
        metaTop: 'Pódio final',
        metaBottom: `${bronzeSchedule.day}/${bronzeSchedule.month} • ${bronzeSchedule.time} BR`,
        metaNote: bronzeInfo.local,
        matchupTitle: '3º lugar',
        matchupSubtitle: 'Vencedor da disputa do bronze',
        official: gabaritoMataMata.terceiro || '—',
        officialMeta: `${PONTOS.MATA.TOP3} pts`,
        points: PONTOS.MATA.TOP3,
        field: 'terceiro'
      },
      {
        id: 'podio-quarto',
        metaTop: 'Pódio final',
        metaBottom: `${bronzeSchedule.day}/${bronzeSchedule.month} • ${bronzeSchedule.time} BR`,
        metaNote: bronzeInfo.local,
        matchupTitle: '4º lugar',
        matchupSubtitle: 'Derrotado da disputa do bronze',
        official: gabaritoMataMata.quarto || '—',
        officialMeta: `${PONTOS.MATA.TOP4} pts`,
        points: PONTOS.MATA.TOP4,
        field: 'quarto'
      }
    ].map((row) => ({
      ...row,
      kind: 'podium',
      summaryTone: 'text-amber-700',
      officialBadgeLabel: 'Oficial',
      palpites: buildPodiumPalpites({
        official: row.official,
        points: row.points,
        getter: (userMata) => userMata[row.field]
      })
    }))
  };

  const knockoutAndPodiumSections = [...knockoutSections, podiumSection]
    .filter((section) => reviewPhaseFilter === 'todos' || section.id === reviewPhaseFilter);

  const panelSections = [
    ...(includeGroupStage ? groupedGameSections : []),
    ...knockoutAndPodiumSections
  ];

  const linhas = panelSections.flatMap((section) => section.rows);
  const usersFiltradosById = Object.fromEntries(usersFiltrados.map((user) => [user.id, user]));
  const reviewCountLabel = `${linhas.length} linha${linhas.length === 1 ? '' : 's'} visíveis`;

  const getColumnSubmissionLabel = (userId) => {
    const jogosEnviados = Boolean(submissoes[userId]?.[SUBMISSION_FIELDS.JOGOS]);
    const mataEnviado = Boolean(submissoes[userId]?.[SUBMISSION_FIELDS.MATA]);
    if (jogosEnviados && mataEnviado) return '1a fase e mata enviados';
    if (jogosEnviados) return '1a fase enviada';
    if (mataEnviado) return 'Mata-mata enviado';
    return 'Rascunho';
  };

  const formatMatchupLabel = (sideA, sideB) => `${sideA || 'A definir'} x ${sideB || 'A definir'}`;

  const renderParticipantCard = (row, palpite) => {
    if (row.kind === 'match') {
      return (
        <div className={`rounded-[18px] border px-3 py-3 text-left shadow-[0_14px_24px_-24px_rgba(15,23,42,0.95)] ${palpite.status.tone}`}>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu confronto</div>
          <div className="mt-1 text-[13px] font-black leading-snug text-slate-900">
            {formatMatchupLabel(palpite.userMatchup?.sideA, palpite.userMatchup?.sideB)}
          </div>

          <div className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu vencedor</div>
          <div className="mt-1 text-[17px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>

          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/85 px-2.5 py-1">
            <span className={`h-2.5 w-2.5 rounded-full ${palpite.status.dot}`}></span>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em]">{palpite.reviewCopy.badgeLabel}</span>
          </div>
          <div className="mt-2 text-[13px] font-black leading-none text-slate-900">{palpite.reviewCopy.pointsLabel}</div>
          <div className="mt-1.5 text-[10px] leading-snug text-slate-600">{palpite.reviewCopy.caption}</div>
          <div className="mt-2 text-[9px] leading-tight text-slate-500">{palpite.envio}</div>
        </div>
      );
    }

    if (row.kind === 'podium') {
      return (
        <div className={`rounded-[18px] border px-3 py-3 text-left shadow-[0_14px_24px_-24px_rgba(15,23,42,0.95)] ${palpite.status.tone}`}>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Sua escolha</div>
          <div className="mt-1 text-[17px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-black/5 bg-white/85 px-2.5 py-1">
            <span className={`h-2.5 w-2.5 rounded-full ${palpite.status.dot}`}></span>
            <span className="text-[9px] font-bold uppercase tracking-[0.16em]">{palpite.reviewCopy.badgeLabel}</span>
          </div>
          <div className="mt-2 text-[13px] font-black leading-none text-slate-900">{palpite.reviewCopy.pointsLabel}</div>
          <div className="mt-1.5 text-[10px] leading-snug text-slate-600">{palpite.reviewCopy.caption}</div>
          <div className="mt-2 text-[9px] leading-tight text-slate-500">{palpite.envio}</div>
        </div>
      );
    }

    return (
      <div className={`rounded-[18px] border px-2 py-2.5 text-center shadow-[0_14px_24px_-24px_rgba(15,23,42,0.95)] ${palpite.status.tone}`}>
        <div className="text-base font-black tracking-[-0.04em] text-slate-900 leading-none">{palpite.palpite}</div>
        <div className="mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-2 py-0.5">
          <span className={`h-2.5 w-2.5 rounded-full ${palpite.status.dot}`}></span>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em]">{palpite.status.label}</span>
        </div>
        <div className="mt-1.5 text-[10px] font-bold text-slate-700">{palpite.pontos} pts</div>
        <div className="mt-1 text-[9px] leading-tight text-slate-500">{palpite.envio}</div>
      </div>
    );
  };

  const renderSummaryCell = (row) => {
    if (row.kind === 'game') {
      return (
        <div className="theme-review-summary rounded-[14px] border border-slate-200 px-2.5 py-2 shadow-[0_10px_20px_-22px_rgba(15,23,42,0.4)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${row.summaryTone}`}>Grupo {row.grupo} • {row.dataHora}</div>
            </div>
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
              <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {row.realStatusLabel === 'Placar temporário' ? 'Ao vivo' : 'Oficial'}
              </span>
              {row.real}
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <span>Jogo {row.matchId}</span>
            <span className="text-slate-400">•</span>
            <span>Até {PONTOS.JOGO.CHEIO} pts</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-slate-900">
            <span className="truncate">{row.timeA}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">x</span>
            <span className="truncate">{row.timeB}</span>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-600">
            <span className="truncate">{row.local}</span>
            <span className={`inline-flex items-center gap-1 truncate rounded-full px-2 py-1 text-right font-semibold ${row.realStatus?.tone || 'bg-slate-100 text-slate-500'}`}>
              {row.realStatus && <span className={`h-2 w-2 rounded-full ${row.realStatus.dot}`}></span>}
              {row.realStatusLabel}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className="theme-review-summary rounded-[14px] border border-slate-200 px-2.5 py-2 shadow-[0_10px_20px_-22px_rgba(15,23,42,0.4)]">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className={`text-[10px] font-bold uppercase tracking-[0.16em] ${row.summaryTone}`}>{row.metaTop} • {row.metaBottom}</div>
          </div>
          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
            <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">{row.officialBadgeLabel}</span>
            {row.official}
          </div>
        </div>

        <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          <span>{row.matchupTitle}</span>
          <span className="text-slate-400">•</span>
          <span>{row.kind === 'match' ? row.officialMeta : row.matchupSubtitle}</span>
        </div>

        {row.kind === 'match' ? (
          <div className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-slate-900">
            <span className="truncate">{row.sideA}</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">x</span>
            <span className="truncate">{row.sideB}</span>
          </div>
        ) : (
          <div className="mt-1.5 text-[13px] font-bold text-slate-900">{row.matchupSubtitle}</div>
        )}

        <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-600">
          <span className="truncate">{row.metaNote}</span>
          {row.kind === 'match' && <span className="shrink-0 font-semibold text-slate-600">{row.officialMeta}</span>}
          {row.kind === 'podium' && <span className="shrink-0 font-semibold text-slate-600">{row.officialMeta}</span>}
        </div>
      </div>
    );
  };

  const renderMobileParticipantRow = (row, palpite) => {
    const user = usersFiltradosById[palpite.userId];

    if (row.kind === 'match') {
      return (
        <div key={palpite.userId} className="px-3 py-3">
          <div className="flex items-center gap-3">
            <AvatarBadge user={user} size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-slate-800">{user?.nome || 'Participante'}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${palpite.status.dot}`}></span>
                <span className="truncate">{palpite.reviewCopy.badgeLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>
              <div className="mt-0.5 text-[10px] font-semibold text-slate-600">{palpite.reviewCopy.pointsLabel}</div>
            </div>
          </div>
          <div className="mt-2 rounded-[16px] border border-slate-200 bg-white/80 px-3 py-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Seu confronto</div>
            <div className="mt-1 text-[12px] font-bold text-slate-900">
              {formatMatchupLabel(palpite.userMatchup?.sideA, palpite.userMatchup?.sideB)}
            </div>
            <div className="mt-1 text-[10px] leading-snug text-slate-600">{palpite.reviewCopy.caption}</div>
            <div className="mt-1 text-[9px] text-slate-500">{palpite.envio}</div>
          </div>
        </div>
      );
    }

    if (row.kind === 'podium') {
      return (
        <div key={palpite.userId} className="px-3 py-3">
          <div className="flex items-center gap-3">
            <AvatarBadge user={user} size="sm" className="shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-bold text-slate-800">{user?.nome || 'Participante'}</div>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
                <span className={`h-2 w-2 rounded-full ${palpite.status.dot}`}></span>
                <span className="truncate">{palpite.reviewCopy.badgeLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>
              <div className="mt-0.5 text-[10px] font-semibold text-slate-600">{palpite.reviewCopy.pointsLabel}</div>
            </div>
          </div>
          <div className="mt-2 text-[10px] leading-snug text-slate-600">{palpite.reviewCopy.caption}</div>
          <div className="mt-1 text-[9px] text-slate-500">{palpite.envio}</div>
        </div>
      );
    }

    return (
      <div key={palpite.userId} className="flex items-center gap-3 px-3 py-2.5">
        <AvatarBadge user={user} size="sm" className="shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[12px] font-bold text-slate-800">{user?.nome || 'Participante'}</div>
          <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
            <span className={`h-2 w-2 rounded-full ${palpite.status.dot}`}></span>
            <span className="truncate">{palpite.status.label}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[15px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>
          <div className="mt-0.5 text-[10px] font-semibold text-slate-600">{palpite.pontos} pts</div>
          <div className="mt-0.5 text-[9px] text-slate-500">{palpite.envio}</div>
        </div>
      </div>
    );
  };

  const renderMobileRowCard = (row) => (
    <div
      key={row.id}
      ref={setRowRef(row.id, 'mobile')}
      data-match-row-id={row.id}
      className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_16px_32px_-28px_rgba(15,23,42,0.38)]"
    >
      <div className="p-3">
        {renderSummaryCell(row)}
      </div>
      <div className="border-t border-slate-100 bg-slate-50/55">
        {row.palpites.map((palpite, index) => (
          <div key={`${row.id}-${palpite.userId}`} className={index > 0 ? 'border-t border-slate-100' : ''}>
            {renderMobileParticipantRow(row, palpite)}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`${GLASS_CARD} p-4 space-y-3 lg:p-4`}>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-[15px] font-black uppercase tracking-[0.12em] text-slate-900">Planilha de Palpites</h3>
            <p className={`mt-1 max-w-4xl text-[12px] leading-snug ${TEXT_MUTED}`}>{reviewDescription}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <span className="font-black text-slate-900">{usersFiltrados.length}</span>
              {usersFiltrados.length === 1 ? 'apostador' : 'apostadores'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
              <span className="font-black text-slate-900">{linhas.length}</span>
              {reviewCountLabel}
            </span>
          </div>
          <div className="grid gap-2 lg:min-w-[720px] lg:grid-cols-[minmax(0,1fr)_220px_200px]">
            <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Filtrar participantes por nome" className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`} />
            <select
              value={reviewPhaseFilter}
              onChange={(e) => setReviewPhaseFilter(e.target.value)}
              className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
            >
              {PANEL_STAGE_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            {reviewPhaseFilter === 'grupos' ? (
              <select
                value={reviewGroupFilter}
                onChange={(e) => setReviewGroupFilter(e.target.value)}
                className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
              >
                <option value="todos">Todos os grupos</option>
                {Object.keys(GRUPOS_2026).map((grupo) => <option key={grupo} value={grupo}>{`Grupo ${grupo}`}</option>)}
              </select>
            ) : (
              <select
                value={reviewGameSort}
                onChange={(e) => setReviewGameSort(e.target.value)}
                className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
              >
                <option value="date">1a fase por data e hora</option>
                <option value="group">1a fase por grupo</option>
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="text-[11px] text-slate-500">Legenda:</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Cravou / acertou</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Acertou vencedor</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando / oficial parcial</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Duplicado</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Sem palpite</span>
        </div>
        <div className={`text-[11px] ${TEXT_MUTED}`}>
          Arraste na horizontal para comparar os apostadores. O painel abre mirando o proximo item da sequencia completa.
        </div>
      </div>

      <div className="space-y-4 lg:hidden">
        {linhas.length === 0 && (
          <div className={`${GLASS_CARD} px-4 py-10 text-center text-slate-500`}>Nenhum registro encontrado com os filtros atuais.</div>
        )}

        {panelSections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${section.sectionTone}`}>
              {section.title}
            </div>
            <div className="space-y-3">
              {section.rows.map((row) => renderMobileRowCard(row))}
            </div>
          </div>
        ))}
      </div>

      <div className={`${GLASS_CARD} hidden overflow-hidden lg:block`}>
        <div data-testid="review-scroll-container" className="max-h-[calc(100vh-220px)] overflow-auto overscroll-contain">
          <div className="min-w-max text-xs bg-white">
            <div
              className="sticky top-0 z-40 grid border-b border-slate-200 bg-slate-50/95 text-[10px] uppercase text-slate-500 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.55)] backdrop-blur"
              style={{ gridTemplateColumns: reviewGridTemplate }}
            >
              <div className="sticky left-0 z-50 border-r border-slate-200 bg-slate-50/95 px-4 py-3 font-bold backdrop-blur">Resumo do confronto</div>
              {usersFiltrados.map((user) => (
                <div key={user.id} className="border-r border-slate-100 px-2 py-2.5 text-center last:border-r-0">
                  <div className="flex items-center justify-center gap-2">
                    <AvatarBadge user={user} size="sm" className="lg:w-12 lg:h-12 lg:text-base" />
                    <div className="max-w-[96px] truncate font-bold normal-case text-[11px] text-slate-700">{user.nome}</div>
                  </div>
                  <div className="mt-0.5 text-[9px] font-semibold text-slate-400">
                    {getColumnSubmissionLabel(user.id)}
                  </div>
                </div>
              ))}
            </div>

            {linhas.length === 0 && (
              <div className="px-4 py-10 text-center text-slate-500">Nenhum registro encontrado com os filtros atuais.</div>
            )}

            {panelSections.map((section) => (
              <div key={section.id} className="border-b border-slate-100 last:border-0">
                <div className="border-b border-slate-200 bg-white px-4 py-3">
                  <div className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${section.sectionTone}`}>
                    {section.title}
                  </div>
                </div>

                {section.rows.map((row) => (
                  <div
                    key={row.id}
                    ref={setRowRef(row.id, 'desktop')}
                    data-match-row-id={row.id}
                    className="grid border-b border-slate-100 bg-white last:border-0"
                    style={{ gridTemplateColumns: reviewGridTemplate }}
                  >
                    <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2.5 py-2.5">
                      {renderSummaryCell(row)}
                    </div>

                    {row.palpites.map((palpite) => (
                      <div key={`${row.id}-${palpite.userId}`} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
                        {renderParticipantCard(row, palpite)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReviewSheet);

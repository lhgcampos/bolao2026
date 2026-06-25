import React, { memo, useEffect, useRef } from 'react';
import AvatarBadge from './AvatarBadge.jsx';
import { GRUPOS_2026, buildChronologicalMatchGroups, formatBrazilMatchSchedule, parseMatchDateTime } from '../matchData';
import { GLASS_CARD, GLASS_INPUT, TEXT_MUTED } from '../styles.js';
import { MATA_MATA_CONFIG, PONTOS, SUBMISSION_FIELDS } from '../constants.js';
import { formatScoreDisplay, formatSubmissionDate, calcularPontosJogo, getWinnerOfMatch } from '../utils.js';
import { getOfficialBracketSlotTeam } from '../officialResults/officialBracketSlots.js';
import { evaluateKnockoutPhasePick, getKnockoutPhaseOfficialState } from '../officialResults/knockoutPhaseScoring.js';
import { getMatchResultVariant } from '../officialResults/officialResultsView';

function ReviewSheet({
  reviewMode,
  setReviewMode,
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
  scrollToMatchId,
  scrollRequestKey
}) {
  const searchTerm = reviewSearch.trim().toLowerCase();
  const isGameMode = reviewMode === 'jogos';
  const gameRowRefs = useRef({});
  const usersFiltrados = [...participanteUsuarios]
    .filter((user) => !searchTerm || user.nome.toLowerCase().includes(searchTerm))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

  const participantColumnCount = Math.max(usersFiltrados.length, 1);
  const reviewSummaryWidth = isGameMode ? 268 : 282;
  const participantColumnMinWidth = isGameMode ? 142 : 148;
  const reviewGridTemplate = `${reviewSummaryWidth}px repeat(${participantColumnCount}, minmax(${participantColumnMinWidth}px, 1fr))`;
  const reviewDescription = isGameMode
    ? 'Cada confronto fica resumido na primeira coluna, deixando mais espaço para comparar os placares dos participantes. Placares temporários aparecem sinalizados.'
    : 'Cada vaga do mata-mata e do pódio fica condensada numa coluna-resumo, com foco total na leitura dos apostadores.';
  const reviewSubmissionField = isGameMode ? SUBMISSION_FIELDS.JOGOS : SUBMISSION_FIELDS.MATA;

  const setGameRowRef = (rowId, surface) => (node) => {
    if (!gameRowRefs.current[rowId]) {
      gameRowRefs.current[rowId] = {};
    }

    if (node) {
      gameRowRefs.current[rowId][surface] = node;
      return;
    }

    delete gameRowRefs.current[rowId][surface];
    if (!Object.keys(gameRowRefs.current[rowId]).length) {
      delete gameRowRefs.current[rowId];
    }
  };

  useEffect(() => {
    if (!isGameMode || !scrollToMatchId || !scrollRequestKey) return undefined;

    const animationFrameId = window.requestAnimationFrame(() => {
      const rowNodes = Object.values(gameRowRefs.current[scrollToMatchId] || {});
      const targetNode = rowNodes.find((node) => node && node.offsetParent !== null) || rowNodes.find(Boolean);
      if (!targetNode) return;
      targetNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isGameMode, scrollRequestKey, scrollToMatchId]);

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

  const renderParticipantCard = (palpite) => (
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

  const jogosFiltrados = jogosReais
    .filter((jogo) => reviewGroupFilter === 'todos' || jogo.grupo === reviewGroupFilter)
    .sort(reviewGameSort === 'group' ? compareByGroup : compareByDate);

  const gameRows = jogosFiltrados.map((jogo) => {
    const realPreenchido = jogo.placarA !== '' && jogo.placarB !== '';
    const schedule = formatBrazilMatchSchedule(jogo);
    const resultVariant = getMatchResultVariant(jogo);

    return {
      id: jogo.id,
      grupo: jogo.grupo,
      dataHora: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
      local: jogo.local,
      timeA: jogo.timeA,
      timeB: jogo.timeB,
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

  const gameRowsById = new Map(gameRows.map((row) => [row.id, row]));
  const groupedGameRows = reviewGameSort === 'group'
    ? Object.entries(
      gameRows.reduce((acc, row) => {
        if (!acc[row.grupo]) acc[row.grupo] = [];
        acc[row.grupo].push(row);
        return acc;
      }, {})
    ).sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB, 'pt-BR'))
      .map(([grupo, rows]) => ({
        id: grupo,
        title: `Grupo ${grupo}`,
        rows
      }))
    : buildChronologicalMatchGroups(jogosFiltrados).map((dayGroup) => ({
      id: dayGroup.dayKey,
      title: dayGroup.dayLabel,
      rows: dayGroup.matches
        .map((match) => gameRowsById.get(match.id))
        .filter(Boolean)
    }));

  const knockoutPhaseOptions = [
    { id: 'r32', label: '32 avos' },
    { id: 'r16', label: 'Oitavas' },
    { id: 'qf', label: 'Quartas' },
    { id: 'sf', label: 'Semifinais' },
    { id: 'podio', label: 'Pódio final' }
  ];

  const resolveKnockoutSides = (phaseKey, match) => {
    const officialTeamA = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'A');
    const officialTeamB = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'B');

    if (phaseKey === 'dezeszeseisavos' && match?.label?.includes(' x ')) {
      const [sideA, sideB] = match.label.split(' x ');
      return {
        sideA: officialTeamA || sideA,
        sideB: officialTeamB || sideB
      };
    }

    return {
      sideA: officialTeamA || getWinnerOfMatch(match.feedA, gabaritoMataMata) || `Venc. ${match.feedA}`,
      sideB: officialTeamB || getWinnerOfMatch(match.feedB, gabaritoMataMata) || `Venc. ${match.feedB}`
    };
  };

  const buildPhaseKnockoutPalpites = ({ phaseKey, points, pickIndex }) => usersFiltrados.map((user) => {
    const userMata = palpitesMataMata[user.id] || {};
    const phasePicks = userMata[phaseKey] || [];
    const palpite = phasePicks[pickIndex] || '';
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
      envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.MATA])
    };
  });

  const knockoutSections = [
    { id: 'r32', title: '32 avos de final', phaseKey: 'dezeszeseisavos', points: PONTOS.MATA.R32, list: MATA_MATA_CONFIG.r32 },
    { id: 'r16', title: 'Oitavas de final', phaseKey: 'oitavas', points: PONTOS.MATA.R16, list: MATA_MATA_CONFIG.r16 },
    { id: 'qf', title: 'Quartas de final', phaseKey: 'quartas', points: PONTOS.MATA.QF, list: MATA_MATA_CONFIG.qf },
    { id: 'sf', title: 'Semifinais', phaseKey: 'semis', points: PONTOS.MATA.SF, list: MATA_MATA_CONFIG.sf }
  ].map((section) => ({
    ...section,
    rows: section.list.map((match, idx) => {
      const schedule = formatBrazilMatchSchedule(match);
      const { sideA, sideB } = resolveKnockoutSides(section.phaseKey, match);
      const officialState = getKnockoutPhaseOfficialState({
        phaseKey: section.phaseKey,
        officialKnockout: gabaritoMataMata,
        officialBracketSlots
      });
      const officialTeamA = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'A');
      const officialTeamB = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'B');
      const official = [officialTeamA, officialTeamB].filter(Boolean).join(' / ') || '—';
      const officialMeta = officialState.isClosed
        ? `${section.points} pts em jogo`
        : officialState.isPartial
          ? 'Oficial parcial'
          : 'Aguardando definicao';

      return {
        id: `${section.id}-${match.id}`,
        kind: 'match',
        metaTop: section.title,
        metaBottom: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
        metaNote: match.local,
        matchupTitle: `Jogo ${match.id}`,
        matchupSubtitle: `${section.points} pts em jogo`,
        sideA,
        sideB,
        official,
        officialBadgeLabel: officialState.isPartial ? 'Oficial parcial' : 'Oficial',
        officialMeta,
        palpites: buildPhaseKnockoutPalpites({
          phaseKey: section.phaseKey,
          points: section.points,
          pickIndex: idx
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
    rows: [
      {
        id: 'campeao',
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
        id: 'vice',
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
        id: 'terceiro',
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
        id: 'quarto',
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
      officialBadgeLabel: 'Oficial',
      palpites: buildPodiumPalpites({
        official: row.official,
        points: row.points,
        getter: (userMata) => userMata[row.field]
      })
    }))
  };

  const groupedKnockoutRows = [...knockoutSections, podiumSection]
    .filter((section) => reviewPhaseFilter === 'todos' || section.id === reviewPhaseFilter);

  const linhas = isGameMode ? gameRows : groupedKnockoutRows.flatMap((section) => section.rows);
  const reviewCountLabel = isGameMode
    ? `${linhas.length} jogo${linhas.length === 1 ? '' : 's'} visíveis`
    : `${linhas.length} linha${linhas.length === 1 ? '' : 's'} da chave`;
  const usersFiltradosById = Object.fromEntries(usersFiltrados.map((user) => [user.id, user]));

  const renderSummaryCell = (row) => {
    if (isGameMode) {
      return (
        <div className="theme-review-summary rounded-[14px] border border-slate-200 px-2.5 py-2 shadow-[0_10px_20px_-22px_rgba(15,23,42,0.4)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Grupo {row.grupo} • {row.dataHora}</div>
            </div>
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
              <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">
                {row.realStatusLabel === 'Placar temporário' ? 'Ao vivo' : 'Oficial'}
              </span>
              {row.real}
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
            <span>Jogo {row.id}</span>
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
            <span className={`inline-flex items-center gap-1 truncate rounded-full px-2 py-1 text-right font-semibold ${
              row.realStatus?.tone || 'bg-slate-100 text-slate-500'
            }`}>
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
            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">{row.metaTop} • {row.metaBottom}</div>
          </div>
          <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
            <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-500">{row.officialBadgeLabel || 'Oficial'}</span>
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
        </div>
      </div>
    );
  };

  const renderMobileParticipantRow = (palpite) => {
    const user = usersFiltradosById[palpite.userId];
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
      ref={isGameMode ? setGameRowRef(row.id, 'mobile') : undefined}
      data-match-row-id={isGameMode ? row.id : undefined}
      className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_16px_32px_-28px_rgba(15,23,42,0.38)]"
    >
      <div className="p-3">
        {renderSummaryCell(row)}
      </div>
      <div className="border-t border-slate-100 bg-slate-50/55">
        {row.palpites.map((palpite, index) => (
          <div key={`${row.id}-${palpite.userId}`} className={index > 0 ? 'border-t border-slate-100' : ''}>
            {renderMobileParticipantRow(palpite)}
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
          <div className="flex gap-2 rounded-full bg-slate-100 p-1 self-start">
            <button onClick={() => setReviewMode('jogos')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'jogos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Fase de Grupos</button>
            <button onClick={() => setReviewMode('mata')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'mata' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Mata-mata</button>
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
          <div className="grid gap-2 lg:min-w-[720px] lg:grid-cols-[minmax(0,1fr)_210px_170px]">
            <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Filtrar participantes por nome" className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`} />
            <select
              value={isGameMode ? reviewGroupFilter : reviewPhaseFilter}
              onChange={(e) => isGameMode ? setReviewGroupFilter(e.target.value) : setReviewPhaseFilter(e.target.value)}
              className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
            >
              <option value="todos">{isGameMode ? 'Todos os grupos' : 'Todas as fases'}</option>
              {(isGameMode
                ? Object.keys(GRUPOS_2026).map((grupo) => ({ id: grupo, label: `Grupo ${grupo}` }))
                : knockoutPhaseOptions
              ).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
            </select>
            {isGameMode && (
              <select
                value={reviewGameSort}
                onChange={(e) => setReviewGameSort(e.target.value)}
                className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
              >
                <option value="date">Ordenar por data e hora</option>
                <option value="group">Ordenar por grupo</option>
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
          <span className="text-[11px] text-slate-500">Legenda:</span>
          {reviewMode === 'jogos' && (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Cravou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Acertou vencedor</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando real</span>
            </>
          )}
          {reviewMode === 'mata' && (
            <>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Acertou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Oficial parcial</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando oficial</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Duplicado</span>
            </>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Sem palpite</span>
        </div>
        <div className={`text-[11px] ${TEXT_MUTED}`}>
          Arraste na horizontal para comparar os apostadores.
        </div>
      </div>

      <div className="space-y-4 lg:hidden">
        {linhas.length === 0 && (
          <div className={`${GLASS_CARD} px-4 py-10 text-center text-slate-500`}>Nenhum registro encontrado com os filtros atuais.</div>
        )}

        {reviewMode === 'jogos' ? (
          <>
            {groupedGameRows.map((group) => (
              <div key={group.id} className="space-y-3">
                <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                  {group.title}
                </div>
                <div className="space-y-3">
                  {group.rows.map((row) => renderMobileRowCard(row))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            {groupedKnockoutRows.map((section) => (
              <div key={section.id} className="space-y-3">
                <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                  {section.title}
                </div>
                <div className="space-y-3">
                  {section.rows.map((row) => renderMobileRowCard(row))}
                </div>
              </div>
            ))}
          </>
        )}
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
                    {submissoes[user.id]?.[reviewSubmissionField] ? 'Enviado' : 'Rascunho'}
                  </div>
                </div>
              ))}
            </div>

            {linhas.length === 0 && (
              <div className="px-4 py-10 text-center text-slate-500">Nenhum registro encontrado com os filtros atuais.</div>
            )}

            {reviewMode === 'jogos' ? (
              <>
                {groupedGameRows.map((group) => (
                  <div key={group.id} className="border-b border-slate-100 last:border-0">
                    <div className="border-b border-slate-200 bg-white px-4 py-3">
                      <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                        {group.title}
                      </div>
                    </div>

                    {group.rows.map((row) => (
                      <div
                        key={row.id}
                        ref={setGameRowRef(row.id, 'desktop')}
                        data-match-row-id={row.id}
                        className="grid border-b border-slate-100 bg-white last:border-0"
                        style={{ gridTemplateColumns: reviewGridTemplate }}
                      >
                        <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2.5 py-2.5">
                          {renderSummaryCell(row)}
                        </div>

                        {row.palpites.map((palpite) => (
                          <div key={`${row.id}-${palpite.userId}`} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
                            {renderParticipantCard(palpite)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            ) : (
              <>
                {groupedKnockoutRows.map((section) => (
                  <div key={section.id} className="border-b border-slate-100 last:border-0">
                    <div className="border-b border-slate-200 bg-white px-4 py-3">
                      <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                        {section.title}
                      </div>
                    </div>

                    {section.rows.map((row) => (
                      <div
                        key={row.id}
                        className="grid border-b border-slate-100 bg-white last:border-0"
                        style={{ gridTemplateColumns: reviewGridTemplate }}
                      >
                        <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2.5 py-2.5">
                          {renderSummaryCell(row)}
                        </div>

                        {row.palpites.map((palpite) => (
                          <div key={`${row.id}-${palpite.userId}`} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
                            {renderParticipantCard(palpite)}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(ReviewSheet);

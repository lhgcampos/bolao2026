import React, { memo } from 'react';
import { ChevronDown, Lock } from '../lucideIcons';
import { PONTOS } from '../constants.js';
import { getKnockoutPhaseOfficialState } from '../officialResults/knockoutPhaseScoring.js';
import { getOfficialKnockoutMatchup } from '../officialResults/knockoutReviewPresentation.js';
import { GLASS_CARD, GLASS_INPUT, TEXT_MUTED } from '../styles.js';
import { getWinnerOfMatch } from '../utils.js';
import { formatBrazilMatchSchedule, formatOfficialKickoffHint } from '../matchData';
import { getKnockoutPhaseMatchReview } from '../knockoutPhaseParticipants.js';

function RestrictedMatchDropdown({
  match,
  idx,
  phaseKey,
  modoAdmin,
  palpitesTravadosMata,
  gabaritoMataMata,
  palpitesMataMata,
  currentUser,
  jogosReais,
  palpitesUsuarioAtual,
  condutaGrupos,
  gruposCompletos,
  officialBracketSlots,
  alocacaoTerceiros,
  atualizarMataMata,
  getR32Team,
  getThirdPlaceCandidate,
  points
}) {
  let userTeamA;
  let userTeamB;

  if (phaseKey === 'dezeszeseisavos') {
    userTeamA = getR32Team(match.refA, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos);
    userTeamB = match.refThirdGroups
      ? getThirdPlaceCandidate(match, alocacaoTerceiros, gruposCompletos)
      : getR32Team(match.refB, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos);
  } else {
    const source = modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {});
    userTeamA = getWinnerOfMatch(match.feedA, source) || `Venc. ${match.feedA}`;
    userTeamB = getWinnerOfMatch(match.feedB, source) || `Venc. ${match.feedB}`;
  }

  const phasePicks = modoAdmin ? (gabaritoMataMata[phaseKey] || []) : (palpitesMataMata[currentUser.id]?.[phaseKey] || []);
  const currentValue = phasePicks?.[idx];
  const options = [userTeamA, userTeamB].filter((team) => team && team !== 'A definir' && !team.includes('Aguardando') && !team.includes('Venc.') && !team.startsWith('3º de '));
  const normalizedOptions = currentValue && !options.includes(currentValue)
    ? [currentValue, ...options]
    : options;
  const isReady = options.length === 2;
  const isLocked = !modoAdmin && palpitesTravadosMata;
  const officialState = getKnockoutPhaseOfficialState({
    phaseKey,
    officialKnockout: gabaritoMataMata,
    officialBracketSlots
  });
  const matchPoints = points ?? (
    phaseKey === 'dezeszeseisavos'
      ? PONTOS.MATA.R32
      : phaseKey === 'oitavas'
        ? PONTOS.MATA.R16
        : phaseKey === 'quartas'
          ? PONTOS.MATA.QF
          : PONTOS.MATA.SF
  );
  const matchReview = getKnockoutPhaseMatchReview({
    phaseKey,
    match,
    points: matchPoints,
    knockoutBets: modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {}),
    matches: jogosReais,
    gamePredictions: palpitesUsuarioAtual,
    conduct: condutaGrupos,
    officialKnockout: gabaritoMataMata,
    officialBracketSlots
  });
  const officialMatchup = getOfficialKnockoutMatchup(officialBracketSlots, match.id);
  const adminOfficialLabelA = officialMatchup.hasPublishedTeams || officialMatchup.placeholderA ? officialMatchup.labelA : (userTeamA || 'A definir');
  const adminOfficialLabelB = officialMatchup.hasPublishedTeams || officialMatchup.placeholderB ? officialMatchup.labelB : (userTeamB || 'A definir');
  const phaseProgressLabel = officialState.expectedCount
    ? `${officialState.publishedCount}/${officialState.expectedCount} times publicados`
    : `${officialState.publishedCount} times publicados`;
  const schedule = formatBrazilMatchSchedule(match);
  const officialKickoffHint = formatOfficialKickoffHint(match);
  const showReviewMode = !modoAdmin && isLocked;
  const phaseBadge = officialState.isClosed
    ? 'Oficial fechado'
    : officialState.isPartial
      ? 'Oficial parcial'
      : 'Aguardando oficial';
  const phaseBadgeTone = officialState.isClosed
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : officialState.isPartial
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-slate-200 bg-slate-50 text-slate-600';
  const pointsValueLabel = `${matchReview.totalPoints} pts`;
  const pointsValueTone = matchReview.totalPoints > 0
    ? 'text-emerald-700'
    : matchReview.wrongSides > 0
      ? 'text-rose-700'
      : 'text-slate-900';
  const pointsPanelTone = matchReview.totalPoints > 0
    ? 'bg-emerald-50/65'
    : matchReview.wrongSides > 0
      ? 'bg-rose-50/65'
      : 'bg-white';

  const renderMatchupCell = ({ labelA, labelB, selectedTeam = '' }) => {
    const teams = [labelA || 'A definir', labelB || 'A definir'];

    return (
      <div className="flex flex-wrap items-center gap-2">
        {teams.map((team, teamIndex) => {
          const isSelected = Boolean(selectedTeam) && team === selectedTeam;
          const isPlaceholder = team === 'Aguardando oficial' || team === 'A definir';
          return (
            <React.Fragment key={`${team}-${teamIndex}`}>
              {teamIndex > 0 && <span className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">x</span>}
              <span className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[12px] font-bold ${isSelected
                ? 'border-sky-200 bg-sky-50 text-sky-700'
                : isPlaceholder
                  ? 'border-slate-200 bg-slate-50 text-slate-400'
                  : 'border-slate-200 bg-white text-slate-900'}`}>
                {team}
              </span>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  if (modoAdmin) {
    return (
      <div className={`${GLASS_CARD} mb-3 p-4 lg:p-5`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>{schedule.day}/{schedule.month} • {schedule.time} BR</span>
              {match.local && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{match.local}</span>}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Jogo {match.id}</span>
            </div>
            {officialKickoffHint && <div className="mt-2 text-[13px] text-slate-500">{officialKickoffHint}</div>}
          </div>
          <div className={`self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${phaseBadgeTone}`}>
            {phaseBadge}
          </div>
        </div>

        <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Confronto oficial atual</div>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
            <div className={`text-right text-[15px] font-bold lg:text-[18px] ${adminOfficialLabelA && adminOfficialLabelA !== 'A definir' ? 'text-slate-900' : 'text-slate-400'}`}>{adminOfficialLabelA}</div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-500 lg:min-w-[112px]">
              x
            </div>
            <div className={`text-left text-[15px] font-bold lg:text-[18px] ${adminOfficialLabelB && adminOfficialLabelB !== 'A definir' ? 'text-slate-900' : 'text-slate-400'}`}>{adminOfficialLabelB}</div>
          </div>
          <div className="mt-3 text-[13px] text-slate-500">
            {isReady
              ? 'Use este confronto para conferir os dados e preencher o classificado oficial.'
              : 'Aguardando os dois lados oficiais para liberar o preenchimento deste confronto.'}
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Classificado oficial</div>
          <div className="relative mt-3">
            {(!isReady || isLocked) && <Lock size={12} className={`absolute left-3 top-4 ${TEXT_MUTED}`} />}
            <select value={currentValue || ''} onChange={(event) => atualizarMataMata(phaseKey, event.target.value, idx)} disabled={!isReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base font-medium appearance-none ${(!isReady || isLocked) && 'pl-8 text-slate-400'}`}>
              <option value="">{isReady ? 'Selecione o classificado oficial' : 'Aguardando confronto oficial'}</option>
              {normalizedOptions.map((team) => <option key={team} value={team}>{team}</option>)}
            </select>
            {isReady && <ChevronDown size={14} className={`absolute right-3 top-4 pointer-events-none ${TEXT_MUTED}`} />}
          </div>
          <div className="mt-3 text-[13px] text-slate-500">
            {currentValue
              ? `Classificado oficial marcado: ${currentValue}.`
              : isReady
                ? 'Nenhum classificado oficial foi marcado neste confronto ainda.'
                : 'O seletor sera liberado assim que os dois lados estiverem definidos.'}
          </div>
        </div>
      </div>
    );
  }

  if (showReviewMode) {
    return (
      <div className={`${GLASS_CARD} mb-3 p-4 lg:p-5 ${!isReady ? 'opacity-60' : ''}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              <span>{schedule.day}/{schedule.month} • {schedule.time} BR</span>
              {match.local && <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-slate-700">{match.local}</span>}
              <span className="rounded-full border border-slate-300 bg-slate-100 px-2 py-1 text-slate-700">Jogo {match.id}</span>
            </div>
            {officialKickoffHint && <div className="mt-2 text-[13px] text-slate-600">{officialKickoffHint}</div>}
          </div>
          <div className={`self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${phaseBadgeTone}`}>
            {phaseBadge}
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-300 bg-white shadow-[0_18px_36px_-28px_rgba(15,23,42,0.28)]">
          <div
            className="hidden gap-px bg-slate-300 lg:grid"
            style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) 180px' }}
          >
            <div className="bg-white px-4 py-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Jogo real</div>
              {renderMatchupCell({ labelA: officialMatchup.labelA, labelB: officialMatchup.labelB })}
            </div>
            <div className="bg-slate-50/55 px-4 py-4">
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Jogo do usuário</div>
              {renderMatchupCell({ labelA: userTeamA, labelB: userTeamB, selectedTeam: currentValue })}
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">Seu vencedor neste jogo: {currentValue || 'Sem palpite'}</div>
            </div>
            <div className={`${pointsPanelTone} px-4 py-4 md:text-right`}>
              <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Pontos</div>
              <div className={`text-[24px] font-black tracking-[-0.04em] ${pointsValueTone}`}>{pointsValueLabel}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">{matchReview.badgeLabel}</div>
            </div>
          </div>

          <div className="grid gap-px bg-slate-300 lg:hidden">
            <div className="bg-slate-100 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Jogo real</div>
            <div className="bg-white px-4 py-4">
              {renderMatchupCell({ labelA: officialMatchup.labelA, labelB: officialMatchup.labelB })}
            </div>
            <div className="bg-slate-100 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Jogo do usuário</div>
            <div className="bg-slate-50/55 px-4 py-4">
              {renderMatchupCell({ labelA: userTeamA, labelB: userTeamB, selectedTeam: currentValue })}
              <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-700">Seu vencedor neste jogo: {currentValue || 'Sem palpite'}</div>
            </div>
            <div className="bg-slate-100 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700">Pontos</div>
            <div className="bg-white px-4 py-4">
              <div className={`text-[24px] font-black tracking-[-0.04em] ${pointsValueTone}`}>{pointsValueLabel}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-90">{matchReview.badgeLabel}</div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-100/80 px-4 py-3 text-[11px] text-slate-600">
            {phaseProgressLabel}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${GLASS_CARD} p-4 mb-3 ${(!isReady || isLocked) && 'opacity-60'}`}>
      <div className={`flex justify-between items-start text-[10px] font-bold uppercase mb-3 ${TEXT_MUTED} gap-3`}>
        <div className="flex flex-col gap-1">
          <span>{schedule.day}/{schedule.month} • {schedule.time} BR</span>
          {officialKickoffHint && <span className="text-[9px] font-semibold normal-case text-slate-400">{officialKickoffHint}</span>}
        </div>
        <div className="text-right">
          <div>{match.local}</div>
          <div className="mt-1 text-[9px] font-semibold text-slate-400">Jogo {match.id}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs font-bold truncate max-w-[45%] text-right ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{userTeamA}</span>
        <span className={`text-[10px] px-2 ${TEXT_MUTED}`}>vs</span>
        <span className={`text-xs font-bold truncate max-w-[45%] text-left ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{userTeamB}</span>
      </div>
      <div className="relative">
        {(!isReady || isLocked) && <Lock size={12} className={`absolute left-3 top-4 ${TEXT_MUTED}`} />}
        <select value={currentValue || ''} onChange={(event) => atualizarMataMata(phaseKey, event.target.value, idx)} disabled={!isReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base font-medium appearance-none ${(!isReady || isLocked) && 'pl-8 text-slate-400'}`}>
          <option value="">{isLocked ? 'Palpite enviado' : isReady ? 'Quem vence?' : 'Defina os anteriores'}</option>
          {normalizedOptions.map((team) => <option key={team} value={team}>{team}</option>)}
        </select>
        {!isLocked && isReady && <ChevronDown size={14} className={`absolute right-3 top-4 pointer-events-none ${TEXT_MUTED}`} />}
      </div>
    </div>
  );
}

export default memo(RestrictedMatchDropdown);

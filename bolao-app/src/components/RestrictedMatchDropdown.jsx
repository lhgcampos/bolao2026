import React, { memo } from 'react';
import { ChevronDown, Lock } from '../lucideIcons';
import { PONTOS } from '../constants.js';
import { getOfficialBracketSlotTeam } from '../officialResults/officialBracketSlots.js';
import { evaluateKnockoutPhasePick } from '../officialResults/knockoutPhaseScoring.js';
import { GLASS_CARD, GLASS_INPUT, TEXT_MUTED } from '../styles.js';
import { getWinnerOfMatch } from '../utils.js';
import { formatBrazilMatchSchedule, formatOfficialKickoffHint } from '../matchData';

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
  let timeA;
  let timeB;
  if (phaseKey === 'dezeszeseisavos') {
    const officialTeamA = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'A');
    const officialTeamB = getOfficialBracketSlotTeam(officialBracketSlots, match.id, 'B');
    timeA = officialTeamA || getR32Team(match.refA, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos);
    timeB = officialTeamB || (
      match.refThirdGroups
        ? getThirdPlaceCandidate(match, alocacaoTerceiros, gruposCompletos)
        : getR32Team(match.refB, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos)
    );
  } else {
    const source = modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {});
    timeA = getWinnerOfMatch(match.feedA, source) || `Venc. ${match.feedA}`;
    timeB = getWinnerOfMatch(match.feedB, source) || `Venc. ${match.feedB}`;
  }
  const phasePicks = modoAdmin ? (gabaritoMataMata[phaseKey] || []) : (palpitesMataMata[currentUser.id]?.[phaseKey] || []);
  const currentValue = phasePicks?.[idx];
  const options = [timeA, timeB].filter((t) => t && t !== 'A definir' && !t.includes('Aguardando') && !t.includes('Venc.') && !t.startsWith('3º de '));
  const normalizedOptions = currentValue && !options.includes(currentValue)
    ? [currentValue, ...options]
    : options;
  const isReady = options.length === 2;
  const isLocked = !modoAdmin && palpitesTravadosMata;
  const review = evaluateKnockoutPhasePick({
    phaseKey,
    pick: currentValue,
    pickIndex: idx,
    allPicks: phasePicks,
    points: points ?? (
      phaseKey === 'dezeszeseisavos'
        ? PONTOS.MATA.R32
        : phaseKey === 'oitavas'
          ? PONTOS.MATA.R16
          : phaseKey === 'quartas'
            ? PONTOS.MATA.QF
            : PONTOS.MATA.SF
    ),
    officialKnockout: gabaritoMataMata,
    officialBracketSlots,
    successLabel: 'Acertou o classificado'
  });
  const schedule = formatBrazilMatchSchedule(match);
  const officialKickoffHint = formatOfficialKickoffHint(match);
  const showReviewMode = !modoAdmin && isLocked;

  if (showReviewMode) {
    return (
      <div className={`${GLASS_CARD} mb-3 p-4 lg:p-5 ${!isReady ? 'opacity-60' : ''}`}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
              <span>{schedule.day}/{schedule.month} • {schedule.time} BR</span>
              {match.local && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{match.local}</span>}
              <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">Jogo {match.id}</span>
            </div>
            {officialKickoffHint && <div className="mt-2 text-[13px] text-slate-500">{officialKickoffHint}</div>}
          </div>
          <div className={`self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${review.tone}`}>
            {review.label}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
          <div className={`text-right text-[15px] font-bold lg:text-[18px] ${isReady ? 'text-slate-900' : 'text-slate-400'}`}>{timeA}</div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-center text-sm font-black uppercase tracking-[0.18em] text-slate-500 lg:min-w-[112px]">
            x
          </div>
          <div className={`text-left text-[15px] font-bold lg:text-[18px] ${isReady ? 'text-slate-900' : 'text-slate-400'}`}>{timeB}</div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
            <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu palpite</div>
            <div className="mt-3 text-[22px] font-black text-slate-900 lg:text-[26px]">
              {currentValue || 'Sem palpite'}
            </div>
            <div className="mt-2 text-[13px] leading-snug text-slate-500">
              {currentValue ? 'Escolha enviada para este confronto.' : 'Nenhum classificado foi escolhido neste confronto.'}
            </div>
          </div>
                      <div className={`rounded-[20px] border px-4 py-4 ${review.tone}`}>
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em]">{review.label}</div>
                        <div className="mt-3 text-[20px] font-black lg:text-[24px]">{review.detail}</div>
                        <div className="mt-2 text-[13px] leading-snug opacity-80">
              {review.officialState.isClosed
                ? 'A fase ja tem lista oficial completa para pontuacao.'
                : review.officialState.isPartial
                  ? 'A FIFA ja publicou parte dos classificados desta fase.'
                  : 'A comparacao aparece quando a definicao oficial sair.'}
                        </div>
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
        <span className={`text-xs font-bold truncate max-w-[45%] text-right ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{timeA}</span>
        <span className={`text-[10px] px-2 ${TEXT_MUTED}`}>vs</span>
        <span className={`text-xs font-bold truncate max-w-[45%] text-left ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{timeB}</span>
      </div>
      <div className="relative">
        {(!isReady || isLocked) && <Lock size={12} className={`absolute left-3 top-4 ${TEXT_MUTED}`} />}
        <select value={currentValue || ''} onChange={(e) => atualizarMataMata(phaseKey, e.target.value, idx)} disabled={!isReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base font-medium appearance-none ${(!isReady || isLocked) && 'pl-8 text-slate-400'}`}>
          <option value="">{isLocked ? 'Palpite enviado' : isReady ? 'Quem vence?' : 'Defina os anteriores'}</option>
          {normalizedOptions.map((team) => <option key={team} value={team}>{team}</option>)}
        </select>
        {!isLocked && isReady && <ChevronDown size={14} className={`absolute right-3 top-4 pointer-events-none ${TEXT_MUTED}`} />}
      </div>
    </div>
  );
}

export default memo(RestrictedMatchDropdown);

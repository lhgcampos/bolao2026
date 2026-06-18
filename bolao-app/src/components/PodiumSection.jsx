import React, { memo } from 'react';
import { Crown, ChevronDown, ChevronUp } from '../lucideIcons';
import { MATA_MATA_CONFIG, PONTOS } from '../constants.js';
import { GLASS_CARD, GLASS_INPUT, TEXT_MUTED } from '../styles.js';
import { buildChoiceReview, getRunnerUp, getWinnerOfMatch } from '../utils.js';
import { formatBrazilMatchSchedule, formatOfficialKickoffHint } from '../matchData';

function PodiumSection({
  modoAdmin,
  gabaritoMataMata,
  palpitesMataMata,
  currentUser,
  atualizarMataMata,
  palpitesTravadosMata,
  secaoExpandida,
  setSecaoExpandida
}) {
  const dataSource = modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {});
  const finalista1 = getWinnerOfMatch(101, dataSource);
  const finalista2 = getWinnerOfMatch(102, dataSource);
  const semi1A = getWinnerOfMatch(97, dataSource);
  const semi1B = getWinnerOfMatch(98, dataSource);
  const perdedor1 = getRunnerUp(finalista1, semi1A, semi1B);
  const semi2A = getWinnerOfMatch(99, dataSource);
  const semi2B = getWinnerOfMatch(100, dataSource);
  const perdedor2 = getRunnerUp(finalista2, semi2A, semi2B);
  const finalistas = [finalista1, finalista2].filter(Boolean);
  const disputantes3 = [perdedor1, perdedor2].filter(Boolean);
  const isFinalReady = finalistas.length === 2;
  const is3rdReady = disputantes3.length === 2;
  const isLocked = !modoAdmin && palpitesTravadosMata;
  const finalInfo = MATA_MATA_CONFIG.final[0];
  const bronzeInfo = MATA_MATA_CONFIG.bronzeFinal[0];
  const finalSchedule = formatBrazilMatchSchedule(finalInfo);
  const bronzeSchedule = formatBrazilMatchSchedule(bronzeInfo);
  const finalKickoffHint = formatOfficialKickoffHint(finalInfo);
  const bronzeKickoffHint = formatOfficialKickoffHint(bronzeInfo);
  const renderFeedback = (field) => {
    if (modoAdmin || !gabaritoMataMata[field]) return null;
    if (dataSource[field] === gabaritoMataMata[field]) return <span className="ml-2 text-[10px] text-green-400 font-bold">(Acertou!)</span>;
    return <span className="ml-2 text-[10px] text-red-400 font-bold">(X)</span>;
  };
  const showReviewMode = !modoAdmin && isLocked;
  const podiumReviewCards = [
    {
      id: 'campeao',
      title: 'Campeão',
      schedule: finalSchedule,
      location: finalInfo.local,
      kickoffHint: finalKickoffHint,
      choice: dataSource.campeao,
      official: gabaritoMataMata.campeao || '',
      points: PONTOS.MATA.CAMPEAO
    },
    {
      id: 'vice',
      title: 'Vice',
      schedule: finalSchedule,
      location: finalInfo.local,
      kickoffHint: finalKickoffHint,
      choice: dataSource.vice,
      official: gabaritoMataMata.vice || '',
      points: PONTOS.MATA.VICE
    },
    {
      id: 'terceiro',
      title: '3º lugar',
      schedule: bronzeSchedule,
      location: bronzeInfo.local,
      kickoffHint: bronzeKickoffHint,
      choice: dataSource.terceiro,
      official: gabaritoMataMata.terceiro || '',
      points: PONTOS.MATA.TOP3
    },
    {
      id: 'quarto',
      title: '4º lugar',
      schedule: bronzeSchedule,
      location: bronzeInfo.local,
      kickoffHint: bronzeKickoffHint,
      choice: dataSource.quarto,
      official: gabaritoMataMata.quarto || '',
      points: PONTOS.MATA.TOP4
    }
  ];

  return (
    <div className={`${GLASS_CARD} mb-3 transition-all ${secaoExpandida === 'podium' ? 'ring-1 ring-yellow-500/50' : ''}`}>
      <button onClick={() => setSecaoExpandida(secaoExpandida === 'podium' ? null : 'podium')} className="theme-podium-header flex min-h-13 w-full items-center justify-between p-4"><div className="flex items-center gap-3"><Crown className="text-yellow-500" size={18} /><span className="font-bold text-sm text-slate-900 uppercase tracking-wide">Pódio Final</span></div>{secaoExpandida === 'podium' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
      {secaoExpandida === 'podium' && (
        <div className="space-y-4 border-t border-slate-200 p-4">
          {showReviewMode ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {podiumReviewCards.map((card) => {
                const review = buildChoiceReview({
                  choice: card.choice,
                  official: card.official,
                  points: card.points,
                  successLabel: 'Acertou a posição'
                });

                return (
                  <div key={card.id} className={`${GLASS_CARD} p-4 lg:p-5`}>
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          <span>{card.schedule.day}/{card.schedule.month} • {card.schedule.time} BR</span>
                          {card.location && <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{card.location}</span>}
                        </div>
                        {card.kickoffHint && <div className="mt-2 text-[13px] text-slate-500">{card.kickoffHint}</div>}
                      </div>
                      <div className={`self-start rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${review.tone}`}>
                        {review.label}
                      </div>
                    </div>
                    <div className="mt-5 text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">{card.title}</div>
                    <div className="mt-4 grid gap-3">
                      <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Seu palpite</div>
                        <div className="mt-3 text-[22px] font-black text-slate-900 lg:text-[26px]">{card.choice || 'Sem palpite'}</div>
                        <div className="mt-2 text-[13px] leading-snug text-slate-500">
                          {card.choice ? 'Escolha enviada para esta posição.' : 'Nenhuma escolha foi registrada para esta posição.'}
                        </div>
                      </div>
                      <div className={`rounded-[20px] border px-4 py-4 ${review.tone}`}>
                        <div className="text-[11px] font-bold uppercase tracking-[0.16em]">{review.label}</div>
                        <div className="mt-3 text-[20px] font-black lg:text-[24px]">{review.detail}</div>
                        <div className="mt-2 text-[13px] leading-snug opacity-80">
                          {card.official
                            ? `Oficial: ${card.official}`
                            : 'A comparação aparece quando a posição oficial for definida.'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className={`${GLASS_CARD} bg-amber-50/70 p-3`}>
                  <div className="text-[10px] font-bold uppercase text-amber-700">Final oficial</div>
                  <div className="mt-2 text-xs font-semibold text-slate-900">{finalSchedule.day}/{finalSchedule.month} • {finalSchedule.time} BR</div>
                  <div className={`mt-1 text-[10px] ${TEXT_MUTED}`}>{finalInfo.local}</div>
                  {finalKickoffHint && <div className="mt-1 text-[10px] text-slate-400">{finalKickoffHint}</div>}
                </div>
                <div className={`${GLASS_CARD} bg-orange-50/70 p-3`}>
                  <div className="text-[10px] font-bold uppercase text-orange-700">3º lugar oficial</div>
                  <div className="mt-2 text-xs font-semibold text-slate-900">{bronzeSchedule.day}/{bronzeSchedule.month} • {bronzeSchedule.time} BR</div>
                  <div className={`mt-1 text-[10px] ${TEXT_MUTED}`}>{bronzeInfo.local}</div>
                  {bronzeKickoffHint && <div className="mt-1 text-[10px] text-slate-400">{bronzeKickoffHint}</div>}
                </div>
              </div>
              <div className="space-y-2">
                <label className="mb-3 block text-center text-[10px] font-bold uppercase text-amber-700">Grande Final {renderFeedback('campeao')}</label>
                <div className={`${GLASS_CARD} bg-amber-50/60 p-4`}>
                  <select value={dataSource.campeao || ''} onChange={e => { atualizarMataMata('campeao', e.target.value, null); const vice = finalistas.find(f => f !== e.target.value); if (vice) atualizarMataMata('vice', vice, null); }} disabled={!isFinalReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base border-yellow-500/30 focus:border-yellow-500 text-slate-800`}>
                    <option value="">Quem será Campeão?</option>
                    {[dataSource.campeao, ...finalistas].filter((team, index, list) => team && list.indexOf(team) === index).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {dataSource.vice && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>Vice: <span className="text-slate-800">{dataSource.vice}</span> {renderFeedback('vice')}</div>}
                </div>
              </div>
              <div className="space-y-2 pt-2">
                <label className="mb-3 block text-center text-[10px] font-bold uppercase text-orange-700">3º Lugar {renderFeedback('terceiro')}</label>
                <div className={`${GLASS_CARD} bg-orange-50/60 p-4`}>
                  <select value={dataSource.terceiro || ''} onChange={e => { atualizarMataMata('terceiro', e.target.value, null); const quarto = disputantes3.find(t => t !== e.target.value); if (quarto) atualizarMataMata('quarto', quarto, null); }} disabled={!is3rdReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base border-orange-500/30 focus:border-orange-500 text-slate-800`}>
                    <option value="">Quem fica em 3º?</option>
                    {[dataSource.terceiro, ...disputantes3].filter((team, index, list) => team && list.indexOf(team) === index).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {dataSource.quarto && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>4º Lugar: <span className="text-slate-800">{dataSource.quarto}</span> {renderFeedback('quarto')}</div>}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(PodiumSection);

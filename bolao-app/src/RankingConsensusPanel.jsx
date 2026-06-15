import React from 'react';
import { AlertCircle, Flame, Radar, ShieldAlert, Sparkles, Target, Trophy } from './lucideIcons';
import { formatMatchName } from './rankingConsensus';

const PANEL_CARD = 'rounded-[28px] border border-slate-200/80 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl';
const METRIC_CARD = 'rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4';
const CHIP = 'rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-sky-900';

const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

const SubmissionStatus = ({ label, complete }) => (
  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <span className="text-xs font-semibold text-slate-600">{label}</span>
    <span className={`text-xs font-bold uppercase tracking-[0.16em] ${complete ? 'text-emerald-700' : 'text-amber-700'}`}>
      {complete ? 'Enviado' : 'Nao enviado'}
    </span>
  </div>
);

const ConsensusList = ({ title, entries, emptyText }) => (
  <div className={METRIC_CARD}>
    <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
      <Trophy size={14} />
      {title}
    </div>
    {entries.length ? (
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div key={`${title}-${entry.team}`} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-3 shadow-sm">
            <div className="min-w-0">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">#{index + 1}</div>
              <div className="truncate text-sm font-semibold text-slate-900">{entry.team}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">{entry.count} voto{entry.count === 1 ? '' : 's'}</div>
              <div className="text-[11px] text-slate-500">{formatPercent(entry.share)}</div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm leading-relaxed text-slate-500">{emptyText}</p>
    )}
  </div>
);

export default function RankingConsensusPanel({
  canSee,
  dashboard,
  jogosSubmitted,
  mataSubmitted
}) {
  if (!canSee) {
    return (
      <section className={`${PANEL_CARD} overflow-hidden`}>
        <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_50%,#ecfeff_100%)] px-5 py-5 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white shadow-lg">
              <Radar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900">Radar do Bolao bloqueado</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
                Envie todos os palpites da fase de grupos e do mata-mata para liberar a comparacao por consenso. Rascunhos nao entram no calculo.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 p-5 sm:grid-cols-2 sm:p-6">
          <SubmissionStatus label="Fase de grupos" complete={jogosSubmitted} />
          <SubmissionStatus label="Mata-mata" complete={mataSubmitted} />
        </div>
      </section>
    );
  }

  if (!dashboard) return null;

  const championTop = dashboard.knockoutConsensus?.champion?.[0] || null;

  return (
    <section className={`${PANEL_CARD} overflow-hidden`}>
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_35%,#ecfeff_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles size={14} />
              Radar do Bolao
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Consenso, zebra e narrativa do ranking</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
              Base: {dashboard.eligibleCount} apostadores com palpites completos e enviados.
            </p>
          </div>
          {championTop && (
            <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-left shadow-sm">
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700">Campeao do povo</div>
              <div className="mt-1 text-lg font-black text-emerald-950">{championTop.team}</div>
              <div className="text-xs text-emerald-800">{championTop.count} voto{championTop.count === 1 ? '' : 's'} ({formatPercent(championTop.share)})</div>
            </div>
          )}
        </div>
      </div>

      {dashboard.insufficientSample ? (
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <p className="text-sm leading-relaxed">
              Ainda nao ha amostra suficiente para consenso. O painel aparece quando pelo menos 2 apostadores enviarem tudo.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {dashboard.narrativeLines.map((line) => (
              <span key={line} className={CHIP}>{line}</span>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Target size={14} />
                Palpite mais comum
              </div>
              {dashboard.mostCommonPick ? (
                <>
                  <div className="text-lg font-black text-slate-950">{dashboard.mostCommonPick.scoreLabel}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{dashboard.mostCommonPick.matchName}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {dashboard.mostCommonPick.count} de {dashboard.eligibleCount} apostadores foram nesse placar.
                  </p>
                  {dashboard.topCommonPicks.length > 1 && (
                    <div className="mt-4 space-y-2 border-t border-slate-200 pt-3">
                      {dashboard.topCommonPicks.slice(0, 3).map((entry) => (
                        <div key={`${entry.match.id}-${entry.scoreLabel}`} className="flex items-center justify-between gap-3 text-xs text-slate-500">
                          <span className="truncate">{entry.matchName} {entry.scoreLabel}</span>
                          <span className="shrink-0 font-bold text-slate-700">{entry.count} voto{entry.count === 1 ? '' : 's'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ainda nao ha um placar dominante entre os palpites enviados.</p>
              )}
            </div>

            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <ShieldAlert size={14} />
                Maior zebra
              </div>
              {dashboard.biggestUpset ? (
                <>
                  <div className="text-lg font-black text-slate-950">{dashboard.biggestUpset.underdogTeam}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">contra {dashboard.biggestUpset.favoriteTeam}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {dashboard.biggestUpset.count} apostador{dashboard.biggestUpset.count === 1 ? '' : 'es'} bancou{dashboard.biggestUpset.count === 1 ? '' : 'ram'} esse resultado.
                  </p>
                  <div className="mt-3 inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700">
                    Diferenca FIFA: +{dashboard.biggestUpset.rankGap} posicoes
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ninguem bancou zebra pesada ainda.</p>
              )}
            </div>

            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Flame size={14} />
                Jogo com maior divergencia
              </div>
              {dashboard.biggestDivergence ? (
                <>
                  <div className="text-lg font-black text-slate-950">{dashboard.biggestDivergence.matchName}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {dashboard.biggestDivergence.uniqueScores} placares diferentes e apostas nos {dashboard.biggestDivergence.uniqueOutcomes} caminhos do jogo.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm">Score {dashboard.biggestDivergence.divergenceScore.toFixed(1)}</span>
                    <span className="rounded-full bg-white px-3 py-1 shadow-sm">{Math.round(dashboard.biggestDivergence.topScoreShare * 100)}% no placar lider</span>
                  </div>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">O bolao esta bem alinhado: nenhum jogo rachou de verdade ainda.</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <ConsensusList
              title="Top 3 campeoes escolhidos"
              entries={(dashboard.knockoutConsensus?.champion || []).slice(0, 3)}
              emptyText="Ainda nao ha campeao do povo definido."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <ConsensusList
                title="Vice mais citado"
                entries={(dashboard.knockoutConsensus?.vice || []).slice(0, 2)}
                emptyText="Sem consenso de vice por enquanto."
              />
              <ConsensusList
                title="Finalistas mais escolhidos"
                entries={(dashboard.knockoutConsensus?.finalists || []).slice(0, 4)}
                emptyText="Sem finalistas recorrentes por enquanto."
              />
            </div>
          </div>

          {dashboard.finalizedWithoutExactHits?.length > 0 && (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Jogos sem cravada</div>
              <div className="flex flex-wrap gap-2">
                {dashboard.finalizedWithoutExactHits.slice(0, 4).map(({ match }) => (
                  <span key={`no-exact-${match.id}`} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
                    {formatMatchName(match)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

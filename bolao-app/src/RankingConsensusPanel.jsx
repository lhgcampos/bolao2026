import React from 'react';
import { AlertCircle, Radar, Sparkles, Trophy } from './lucideIcons';

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
  const viceTop = dashboard.knockoutConsensus?.vice?.[0] || null;
  const thirdTop = dashboard.knockoutConsensus?.third?.[0] || null;
  const finalPairTop = dashboard.knockoutConsensus?.finalPairs?.[0] || null;

  return (
    <section className={`${PANEL_CARD} overflow-hidden`}>
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_35%,#ecfeff_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles size={14} />
              Radar do Bolao
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Consenso de mata-mata, pódio e narrativa do ranking</h2>
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

          <div className="grid gap-4 lg:grid-cols-4">
            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Trophy size={14} />
                Campeão do povo
              </div>
              {championTop ? (
                <>
                  <div className="text-lg font-black text-slate-950">{championTop.team}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{championTop.count} voto{championTop.count === 1 ? '' : 's'}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {formatPercent(championTop.share)} da base fechou com esse campeão.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ainda nao ha campeao do povo definido.</p>
              )}
            </div>

            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Trophy size={14} />
                Vice do povo
              </div>
              {viceTop ? (
                <>
                  <div className="text-lg font-black text-slate-950">{viceTop.team}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{viceTop.count} voto{viceTop.count === 1 ? '' : 's'}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {formatPercent(viceTop.share)} da base colocou esse vice.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ainda nao ha vice dominante.</p>
              )}
            </div>

            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Trophy size={14} />
                3º lugar do povo
              </div>
              {thirdTop ? (
                <>
                  <div className="text-lg font-black text-slate-950">{thirdTop.team}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{thirdTop.count} voto{thirdTop.count === 1 ? '' : 's'}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {formatPercent(thirdTop.share)} da base colocou esse time no bronze.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ainda nao ha bronze dominante.</p>
              )}
            </div>

            <div className={METRIC_CARD}>
              <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                <Trophy size={14} />
                Final mais montada
              </div>
              {finalPairTop ? (
                <>
                  <div className="text-lg font-black text-slate-950">{finalPairTop.label}</div>
                  <div className="mt-1 text-sm font-semibold text-slate-700">{finalPairTop.count} chave{finalPairTop.count === 1 ? '' : 's'}</div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    {formatPercent(finalPairTop.share)} da base repetiu essa final.
                  </p>
                </>
              ) : (
                <p className="text-sm leading-relaxed text-slate-500">Ainda nao existe uma final repetida com força.</p>
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
                title="Semifinalistas mais escolhidos"
                entries={(dashboard.knockoutConsensus?.semifinalists || []).slice(0, 4)}
                emptyText="Sem semifinalistas recorrentes por enquanto."
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

import React from 'react';
import { AlertCircle, Lock, MessageCircle, Radar, Sparkles, Target, Trophy } from '../lucideIcons';
import { formatEditorialStatLine } from '../editorialStats.js';
import { GLASS_CARD } from '../styles.js';

const SUB_CARD = 'rounded-[24px] border border-slate-200 bg-white/90 p-4 shadow-sm';
const METRIC_CARD = 'rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 shadow-sm';
const CHIP = 'rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-semibold tracking-wide text-sky-900';
const INSIGHT_TONE = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  neutral: 'border-sky-200 bg-sky-50 text-sky-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950'
};

const formatPercent = (value) => `${Math.round((value || 0) * 100)}%`;

const LockedBlock = ({ title, text, jogosSubmitted, mataSubmitted }) => (
  <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-amber-950">
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
      <Lock size={14} />
      {title}
    </div>
    <p className="mt-3 text-sm leading-relaxed">{text}</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border border-amber-200/70 bg-white/70 px-4 py-3 text-xs font-semibold text-amber-900">
        Fase de grupos: {jogosSubmitted ? 'enviada' : 'pendente'}
      </div>
      <div className="rounded-2xl border border-amber-200/70 bg-white/70 px-4 py-3 text-xs font-semibold text-amber-900">
        Mata-mata: {mataSubmitted ? 'enviado' : 'pendente'}
      </div>
    </div>
  </div>
);

const ConsensusMetric = ({ title, value, detail }) => (
  <article className={METRIC_CARD}>
    <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</div>
    <div className="mt-3 text-xl font-black text-slate-950">{value}</div>
    <p className="mt-2 text-sm leading-relaxed text-slate-600">{detail}</p>
  </article>
);

export default function InsightsHubPanel({
  personalInsight,
  editorialInsight,
  consensusDashboard,
  canSeeConsensus,
  jogosSubmitted,
  mataSubmitted,
  isAdminViewer,
  onNavigateToClosestMatch
}) {
  const championTop = consensusDashboard?.knockoutConsensus?.champion?.[0] || null;
  const mostCommonPick = consensusDashboard?.mostCommonPick || null;
  const biggestUpset = consensusDashboard?.biggestUpset || null;
  const divergence = consensusDashboard?.biggestDivergence || null;
  const personalCards = personalInsight?.insights || [];
  const editorialCards = editorialInsight?.items || [];
  const showConsensus = Boolean(canSeeConsensus && consensusDashboard && !consensusDashboard.insufficientSample);
  const heroTitle = 'Informações';
  const heroSecondary = personalInsight?.secondaryLine || (showConsensus
    ? `Base atual: ${consensusDashboard.eligibleCount} apostadores com palpites completos.`
    : 'Assim que você concluir os envios, o painel mostra seu cenário e o comportamento do grupo.');

  return (
    <section
      className={`${GLASS_CARD} cursor-pointer overflow-hidden transition-transform hover:-translate-y-0.5`}
      role="button"
      tabIndex={0}
      onClick={() => onNavigateToClosestMatch?.()}
      onKeyDown={(event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        onNavigateToClosestMatch?.();
      }}
    >
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_38%,#ecfeff_100%)] px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles size={14} />
              {heroTitle}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-[15px]">{heroSecondary}</p>
            {personalInsight?.leaderLine && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{personalInsight.leaderLine}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[210px]">
            {typeof personalInsight?.rank === 'number' && (
              <div className={SUB_CARD}>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Posição</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{personalInsight.rank}º</div>
              </div>
            )}
            {typeof personalInsight?.points === 'number' && (
              <div className={SUB_CARD}>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pontos</div>
                <div className="mt-1 text-2xl font-black text-emerald-700">{personalInsight.points}</div>
              </div>
            )}
            <div className={SUB_CARD}>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Fase de grupos</div>
              <div className="mt-1 text-sm font-black text-slate-950">{jogosSubmitted ? 'Enviada' : 'Pendente'}</div>
            </div>
            <div className={SUB_CARD}>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Mata-mata</div>
              <div className="mt-1 text-sm font-black text-slate-950">{mataSubmitted ? 'Enviado' : 'Pendente'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {personalCards.length > 0 && (
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              <Trophy size={14} />
              Seu momento
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {personalCards.slice(0, 3).map((entry) => (
                <article
                  key={`${entry.type}-${entry.text}`}
                  className={`rounded-[24px] border px-4 py-4 shadow-sm ${INSIGHT_TONE[entry.tone] || INSIGHT_TONE.neutral}`}
                >
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                    <Target size={14} />
                    Insight pessoal
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">{entry.text}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <Radar size={14} />
            Leitura do bolão
          </div>
          {showConsensus ? (
            <div className="space-y-4">
              {consensusDashboard.narrativeLines?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {consensusDashboard.narrativeLines.slice(0, 6).map((line) => (
                    <span key={line} className={CHIP}>{line}</span>
                  ))}
                </div>
              )}
              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
                {championTop && (
                  <ConsensusMetric
                    title="Campeão do povo"
                    value={championTop.team}
                    detail={`${championTop.count} voto${championTop.count === 1 ? '' : 's'} (${formatPercent(championTop.share)})`}
                  />
                )}
                {mostCommonPick && (
                  <ConsensusMetric
                    title="Placar mais comum"
                    value={mostCommonPick.scoreLabel}
                    detail={`${mostCommonPick.matchName} • ${mostCommonPick.count} de ${consensusDashboard.eligibleCount} apostadores`}
                  />
                )}
                {biggestUpset && (
                  <ConsensusMetric
                    title="Maior zebra"
                    value={biggestUpset.underdogTeam}
                    detail={`${biggestUpset.count} apostador${biggestUpset.count === 1 ? '' : 'es'} bancou${biggestUpset.count === 1 ? '' : 'ram'} contra ${biggestUpset.favoriteTeam}`}
                  />
                )}
                {divergence && (
                  <ConsensusMetric
                    title="Maior divergência"
                    value={divergence.matchName}
                    detail={`${divergence.uniqueScores} placares diferentes e ${divergence.uniqueOutcomes} caminhos do jogo`}
                  />
                )}
              </div>
            </div>
          ) : (
            <LockedBlock
              title="Comparações do bolão"
              text="Esse bloco aparece quando houver pelo menos dois apostadores com fase de grupos e mata-mata completos e enviados."
              jogosSubmitted={jogosSubmitted}
              mataSubmitted={mataSubmitted}
            />
          )}
        </div>

        <div>
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            <MessageCircle size={14} />
            Estatísticas e recortes
          </div>
          {editorialInsight?.locked || editorialInsight?.empty ? (
            <LockedBlock
              title={editorialInsight?.title || 'Estatísticas editoriais'}
              text={editorialInsight?.text || 'Assim que houver base suficiente, este bloco reúne recortes comparativos do bolão.'}
              jogosSubmitted={jogosSubmitted}
              mataSubmitted={mataSubmitted}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-3">
              {editorialCards.slice(0, 3).map((item) => (
                <article key={item.id} className={METRIC_CARD}>
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    <Sparkles size={12} />
                    {item.title}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{formatEditorialStatLine(item)}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        {isAdminViewer && !showConsensus && (
          <div className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-4 text-slate-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-slate-500" />
            <p className="text-sm leading-relaxed">
              Como administrador, você já vê o gabarito e a planilha. As comparações do bolão entram aqui automaticamente assim que a base de envios completos crescer.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

import React from 'react';
import { AlertCircle, Lock, MessageCircle, Radar, Sparkles, Target, Trophy } from '../lucideIcons';
import { formatEditorialStatLine } from '../editorialStats.js';
import { GLASS_CARD, TEXT_MUTED } from '../styles.js';

const SUB_CARD = 'theme-insights-subcard rounded-[24px] p-4 shadow-sm';
const METRIC_CARD = 'theme-insights-metric-card rounded-[24px] p-4 shadow-sm';
const CHIP = 'theme-insights-chip rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide';
const INSIGHT_TONE = {
  positive: 'theme-toned-card-positive',
  neutral: 'theme-toned-card-neutral',
  warning: 'theme-toned-card-warning'
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
    <div className={`text-[11px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>{title}</div>
    <div className="mt-3 text-xl font-black text-slate-950">{value}</div>
    <p className={`mt-2 text-sm leading-relaxed ${TEXT_MUTED}`}>{detail}</p>
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
  const viceTop = consensusDashboard?.knockoutConsensus?.vice?.[0] || null;
  const thirdTop = consensusDashboard?.knockoutConsensus?.third?.[0] || null;
  const finalPairTop = consensusDashboard?.knockoutConsensus?.finalPairs?.[0] || null;
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
      <div className="theme-insights-hero border-b border-slate-200/80 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <Sparkles size={14} />
              {heroTitle}
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-[15px]">{heroSecondary}</p>
            {personalInsight?.leaderLine && (
              <p className={`mt-2 text-sm leading-relaxed ${TEXT_MUTED}`}>{personalInsight.leaderLine}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[210px]">
            {typeof personalInsight?.rank === 'number' && (
              <div className={SUB_CARD}>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>Posição</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{personalInsight.rank}º</div>
              </div>
            )}
            {typeof personalInsight?.points === 'number' && (
              <div className={SUB_CARD}>
                <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>Pontos</div>
                <div className="mt-1 text-2xl font-black text-emerald-700">{personalInsight.points}</div>
              </div>
            )}
            <div className={SUB_CARD}>
              <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>Fase de grupos</div>
              <div className="mt-1 text-sm font-black text-slate-950">{jogosSubmitted ? 'Enviada' : 'Pendente'}</div>
            </div>
            <div className={SUB_CARD}>
              <div className={`text-[10px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>Mata-mata</div>
              <div className="mt-1 text-sm font-black text-slate-950">{mataSubmitted ? 'Enviado' : 'Pendente'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {personalCards.length > 0 && (
          <div>
            <div className={`mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>
              <Trophy size={14} />
              Seu momento
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {personalCards.slice(0, 3).map((entry) => (
                <article
                  key={`${entry.type}-${entry.text}`}
                  className={`rounded-[24px] px-4 py-4 shadow-sm ${INSIGHT_TONE[entry.tone] || INSIGHT_TONE.neutral}`}
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
          <div className={`mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>
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
                {viceTop && (
                  <ConsensusMetric
                    title="Vice do povo"
                    value={viceTop.team}
                    detail={`${viceTop.count} voto${viceTop.count === 1 ? '' : 's'} (${formatPercent(viceTop.share)})`}
                  />
                )}
                {thirdTop && (
                  <ConsensusMetric
                    title="3º lugar do povo"
                    value={thirdTop.team}
                    detail={`${thirdTop.count} voto${thirdTop.count === 1 ? '' : 's'} para o bronze`}
                  />
                )}
                {finalPairTop && (
                  <ConsensusMetric
                    title="Final mais montada"
                    value={finalPairTop.label}
                    detail={`${finalPairTop.count} chave${finalPairTop.count === 1 ? '' : 's'} repetem essa final`}
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
          <div className={`mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>
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
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {editorialCards.slice(0, 4).map((item) => (
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

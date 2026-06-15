import React from 'react';
import { Lock, Sparkles, Swords, Target, Trophy } from './lucideIcons';

const TONE_STYLES = {
  positive: 'border-emerald-200 bg-emerald-50 text-emerald-950',
  neutral: 'border-sky-200 bg-sky-50 text-sky-950',
  warning: 'border-amber-200 bg-amber-50 text-amber-950'
};

const getInsightIcon = (type, locked) => {
  if (locked) return Lock;
  if (type === 'next-match-overtake' || type === 'next-match-focus') return Swords;
  if (type === 'current-rank-summary') return Trophy;
  if (type === 'unique-prediction' || type === 'most-common-prediction') return Target;
  return Sparkles;
};

export default function MyBolaoCard({ insight }) {
  if (!insight) return null;

  const locked = Boolean(insight.locked);
  const headlineIcon = getInsightIcon(locked ? 'locked' : 'current-rank-summary', locked);
  const HeadlineIcon = headlineIcon;

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fcff_0%,#ffffff_35%,#f0fdfa_100%)] shadow-[0_24px_70px_-34px_rgba(15,23,42,0.35)]">
      <div className="border-b border-slate-200/80 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
              <HeadlineIcon size={14} />
              {insight.title}
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 sm:text-[30px]">
              {insight.primaryLine}
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-700 sm:text-[15px]">{insight.secondaryLine}</p>
            {insight.leaderLine && (
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{insight.leaderLine}</p>
            )}
          </div>

          {!locked && typeof insight.rank === 'number' && (
            <div className="grid grid-cols-2 gap-3 sm:min-w-[168px]">
              <div className="rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Posicao</div>
                <div className="mt-1 text-2xl font-black text-slate-950">{insight.rank}º</div>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Pontos</div>
                <div className="mt-1 text-2xl font-black text-emerald-700">{insight.points}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-3 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {(insight.insights || []).map((entry) => {
          const Icon = getInsightIcon(entry.type, false);
          return (
            <article
              key={`${entry.type}-${entry.text}`}
              className={`rounded-[24px] border px-4 py-4 shadow-sm ${TONE_STYLES[entry.tone] || TONE_STYLES.neutral}`}
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                <Icon size={14} />
                Insight real
              </div>
              <p className="mt-3 text-sm leading-relaxed">{entry.text}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

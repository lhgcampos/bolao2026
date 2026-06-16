import React from 'react';
import { Lock, MessageCircle, Sparkles } from './lucideIcons';
import { formatEditorialStatLine } from './editorialStats.js';

const PANEL = 'rounded-[28px] border border-slate-200/80 bg-white/88 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl';

const StatCard = ({ item }) => (
  <article className="rounded-[24px] border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
        <Sparkles size={12} />
        {item.title}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{item.type}</div>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-slate-700">{formatEditorialStatLine(item)}</p>
  </article>
);

const LockedState = ({ title, text, empty = false, eligibleCount = 0 }) => (
  <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-amber-950">
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em]">
      <Lock size={14} />
      {title}
    </div>
    <p className="mt-3 text-sm leading-relaxed">{text}</p>
    {empty && eligibleCount > 0 && (
      <p className="mt-2 text-xs font-semibold text-amber-800">Base elegivel: {eligibleCount}</p>
    )}
  </div>
);

export function EditorialInsightsBlock({ insight }) {
  if (!insight) return null;

  return (
    <section className={`${PANEL} overflow-hidden`}>
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#eff6ff_0%,#ffffff_45%,#ecfeff_100%)] px-5 py-5 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          <Sparkles size={14} />
          {insight.title}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {insight.locked || insight.empty ? (
          <LockedState
            title={insight.title}
            text={insight.text}
            empty={insight.empty}
            eligibleCount={insight.eligibleCount || 0}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-3">
            {(insight.items || []).slice(0, 3).map((item) => (
              <StatCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export function EditorialCommentsSection({ comments }) {
  if (!comments) return null;

  return (
    <section className={`${PANEL} overflow-hidden`}>
      <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,#fff7ed_0%,#ffffff_45%,#fefce8_100%)] px-5 py-5 sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
          <MessageCircle size={14} />
          {comments.title}
        </div>
      </div>
      <div className="p-5 sm:p-6">
        {comments.locked || comments.empty ? (
          <LockedState
            title={comments.title}
            text={comments.text}
            empty={comments.empty}
            eligibleCount={comments.eligibleCount || 0}
          />
        ) : (
          <div className="space-y-3">
            {(comments.items || []).map((item) => (
              <article key={item.id} className="rounded-[22px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                    {item.title}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                    {item.score}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{formatEditorialStatLine(item)}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

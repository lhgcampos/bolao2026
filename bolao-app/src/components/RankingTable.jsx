import React, { memo, useMemo } from 'react';
import RankingConsensusPanel from '../RankingConsensusPanel';
import { EditorialCommentsSection } from '../EditorialStatsBlocks';
import AvatarBadge from './AvatarBadge.jsx';
import { GLASS_CARD, TEXT_HIGHLIGHT, TEXT_MUTED } from '../styles.js';

function RankingTable({
  currentUser,
  currentUserCanSeeConsensusPanel,
  ranking,
  matchResultSummary,
  usuarios,
  submissoes,
  palpitesJogos,
  palpitesMataMata,
  jogosReais,
  jogosEnviadosAt,
  mataEnviadosAt,
  buildConsensusDashboard,
  rankingFooterComments,
  teamRankings,
  submissionFields,
  isAdminUser,
  usuarioPreencheuTodosOsJogos,
  usuarioPreencheuMataCompleta
}) {
  const consensusDashboard = useMemo(() => {
    if (!currentUserCanSeeConsensusPanel) return null;
    return buildConsensusDashboard({
      users: usuarios,
      submissions: submissoes,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      games: jogosReais,
      ranking,
      teamRankings,
      submissionFields,
      isAdminUser,
      usuarioPreencheuTodosOsJogos,
      usuarioPreencheuMataCompleta
    });
  }, [
    currentUserCanSeeConsensusPanel,
    usuarios,
    submissoes,
    palpitesJogos,
    palpitesMataMata,
    jogosReais,
    ranking,
    buildConsensusDashboard,
    teamRankings,
    submissionFields,
    isAdminUser,
    usuarioPreencheuTodosOsJogos,
    usuarioPreencheuMataCompleta
  ]);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className={`${GLASS_CARD} p-4 text-center`}>
        {matchResultSummary.temporary > 0 ? (
          <p className={`text-xs ${TEXT_MUTED}`}>
            Ranking provisório ao vivo: <strong className="text-amber-700">{matchResultSummary.temporary} placar{matchResultSummary.temporary === 1 ? '' : 'es'} temporário{matchResultSummary.temporary === 1 ? '' : 's'}</strong> ainda podem mudar até o Admin marcar o resultado como definitivo.
          </p>
        ) : matchResultSummary.final > 0 ? (
          <p className={`text-xs ${TEXT_MUTED}`}>
            Ranking fechado com <strong className="text-slate-900">{matchResultSummary.final} resultado{matchResultSummary.final === 1 ? '' : 's'} definitivo{matchResultSummary.final === 1 ? '' : 's'}</strong> já lançado{matchResultSummary.final === 1 ? '' : 's'} pelo Admin.
          </p>
        ) : (
          <p className={`text-xs ${TEXT_MUTED}`}>A pontuação só aparece quando o <strong className="text-slate-900">Admin</strong> preenche os resultados.</p>
        )}
      </div>
      <div className="space-y-3 lg:hidden">
        {ranking.map((user) => (
          <div key={user.id} className={`${GLASS_CARD} p-4 ${user.id === currentUser.id ? 'ring-2 ring-sky-200' : ''}`}>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
                {user.rank}
              </div>
              <AvatarBadge user={user} size="sm" className="h-10 w-10 text-sm" />
              <div className="min-w-0 flex-1">
                <div className={`truncate text-sm font-bold ${user.id === currentUser.id ? 'text-sky-700' : 'text-slate-900'}`}>
                  {user.nome} {user.id === currentUser.id && '(Você)'}
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-slate-50 px-2 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Jogos</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{user.ptsJogos}</div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-2 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">Mata</div>
                    <div className="mt-1 text-sm font-black text-slate-900">{user.ptsMataMata}</div>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-2 py-2">
                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Total</div>
                    <div className="mt-1 text-sm font-black text-emerald-700">{user.total}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className={`${GLASS_CARD} hidden overflow-hidden lg:block`}>
        <table className="w-full text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><tr><th className="p-4 text-center">#</th><th className="p-4 text-left">Nome</th><th className="p-4 text-center">Jogos</th><th className="p-4 text-center">Mata</th><th className="p-4 text-center text-slate-900">Total</th></tr></thead>
          <tbody>{ranking.map((user) => (
            <tr key={user.id} className={`border-b border-slate-100 last:border-0 ${user.id === currentUser.id ? 'bg-sky-50' : ''}`}>
              <td className={`p-4 text-center font-bold ${TEXT_MUTED}`}>{user.rank}</td>
              <td className={`p-4 ${user.id === currentUser.id ? 'text-sky-700' : TEXT_HIGHLIGHT}`}>
                <div className="flex items-center gap-3">
                  <AvatarBadge user={user} size="md" className="shrink-0 lg:w-14 lg:h-14 lg:text-lg" />
                  <span className="font-bold">{user.nome} {user.id === currentUser.id && '(Você)'}</span>
                </div>
              </td>
              <td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsJogos}</td>
              <td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsMataMata}</td>
              <td className="p-4 text-center text-sm font-bold text-emerald-700">{user.total}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <RankingConsensusPanel
        canSee={currentUserCanSeeConsensusPanel}
        dashboard={consensusDashboard}
        jogosSubmitted={Boolean(jogosEnviadosAt)}
        mataSubmitted={Boolean(mataEnviadosAt)}
      />
      <EditorialCommentsSection comments={rankingFooterComments} />
    </div>
  );
}

export default memo(RankingTable);

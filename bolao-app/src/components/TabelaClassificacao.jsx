import React, { memo } from 'react';
import { GRUPOS_2026 } from '../matchData';
import { GLASS_CARD, GLASS_INPUT, TEXT_HIGHLIGHT } from '../styles.js';
import { getMatchResultVariant } from '../officialResults/officialResultsView';

function TabelaClassificacao({
  grupo,
  currentUser,
  calcularTabelaGrupo,
  jogosReais,
  palpitesJogos,
  condutaGrupos,
  modoAdmin,
  atualizarCondutaGrupo,
  getShortCountryName
}) {
  const tabela = calcularTabelaGrupo(grupo, jogosReais, palpitesJogos[currentUser?.id], condutaGrupos);
  const jogosDoGrupo = jogosReais.filter((jogo) => jogo.grupo === grupo);
  const grupoTemporario = jogosDoGrupo.some((jogo) => getMatchResultVariant(jogo) === 'temporary');
  const statColumns = [
    { key: 'p', label: 'P' },
    { key: 'j', label: 'J' },
    { key: 'v', label: 'V' },
    { key: 'e', label: 'E' },
    { key: 'd', label: 'D' },
    { key: 'gp', label: 'GP' },
    { key: 'gc', label: 'GC' },
    { key: 'sg', label: 'SG' }
  ];

  return (
    <div className={`${GLASS_CARD} overflow-hidden mb-4`}>
      <div className="bg-white/5 px-2.5 py-2.5 flex justify-between items-center border-b border-white/5 gap-2">
        <span className="font-bold text-[12px] uppercase tracking-[0.16em] text-slate-700">Classificação - Grupo {grupo}</span>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          !modoAdmin
            ? 'bg-blue-400/10 text-blue-500'
            : grupoTemporario
              ? 'bg-orange-100 text-orange-700'
              : 'bg-emerald-100 text-emerald-700'
        }`}>
          {!modoAdmin ? 'Simulada' : grupoTemporario ? 'Ao vivo' : 'Oficial'}
        </span>
      </div>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="min-w-[420px] w-full table-fixed text-[10px] text-slate-700 sm:text-[11px]">
          <thead>
            <tr className="border-b border-white/5 text-slate-500">
              <th className="w-6 px-0.5 py-2 text-center">#</th>
              <th className="px-1 py-2 text-left">Seleção</th>
              {statColumns.map((column) => (
                <th key={column.key} className="w-6 px-0.5 py-2 text-center font-semibold">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tabela.map((time, idx) => {
              let posColor = '';
              if (idx < 2) posColor = 'border-l-2 border-l-green-500 bg-green-500/5';
              else if (idx === 2) posColor = 'border-l-2 border-l-yellow-500 bg-yellow-500/5';
              else posColor = 'border-l-2 border-l-transparent opacity-50';
              return (
                <tr key={time.time} className={`border-b border-white/5 last:border-0 ${posColor}`}>
                  <td className="px-0.5 py-2 text-center font-bold text-slate-600">{idx + 1}</td>
                  <td className={`px-1 py-2 font-semibold leading-tight ${TEXT_HIGHLIGHT}`}>
                    <span className="block truncate">{getShortCountryName(time.time)}</span>
                  </td>
                  {statColumns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-0.5 py-2 text-center ${column.key === 'p' ? 'font-bold text-slate-800' : 'text-slate-600'}`}
                    >
                      {time[column.key]}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modoAdmin && (
        <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50/90">
          <div className="text-[11px] uppercase font-bold text-slate-700">Fair play / conduta FIFA</div>
          {GRUPOS_2026[grupo].map((time) => {
            const registro = condutaGrupos?.[grupo]?.[time] || {};
            return (
              <div key={time} className="grid grid-cols-[minmax(0,1fr)_44px_44px_44px_44px] gap-2 items-center">
                <span className="truncate text-[12px] font-medium text-slate-700">{time}</span>
                <input type="number" min="0" inputMode="numeric" value={registro.amarelos ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amarelos', e.target.value)} className={`${GLASS_INPUT} h-11 text-center text-base text-slate-700`} placeholder="A" title="Amarelos" />
                <input type="number" min="0" inputMode="numeric" value={registro.vermelhoIndireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoIndireto', e.target.value)} className={`${GLASS_INPUT} h-11 text-center text-base text-slate-700`} placeholder="2A" title="Vermelho indireto" />
                <input type="number" min="0" inputMode="numeric" value={registro.vermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-11 text-center text-base text-slate-700`} placeholder="VD" title="Vermelho direto" />
                <input type="number" min="0" inputMode="numeric" value={registro.amareloEVermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amareloEVermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-11 text-center text-base text-slate-700`} placeholder="A+V" title="Amarelo + vermelho direto" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(TabelaClassificacao);

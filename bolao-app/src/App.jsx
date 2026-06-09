import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Calendar, Settings, Plus, User, Trash2, Medal, Crown, List, ChevronDown, ChevronUp, AlertCircle, MapPin, Calculator, Lock, LogOut, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';

// --- DADOS ESTRUTURAIS ---
const GRUPOS_2026 = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'Rep. Tcheca'],
  B: ['Canadá', 'Suíça', 'Catar', 'Bósnia'],
  C: ['Brasil', 'Marrocos', 'Escócia', 'Haiti'],
  D: ['EUA', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Equador', 'Curaçao', 'Costa do Marfim'],
  F: ['Holanda', 'Japão', 'Tunísia', 'Suécia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Uruguai', 'Arábia Saudita', 'Cabo Verde'],
  I: ['França', 'Senegal', 'Noruega', 'Iraque'],
  J: ['Argentina', 'Áustria', 'Argélia', 'Jordânia'],
  K: ['Portugal', 'Colômbia', 'Uzbequistão', 'RD Congo'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá']
};

const TODOS_TIMES = Object.values(GRUPOS_2026).flat().sort();

const PONTOS = {
  JOGO: { CHEIO: 20, VITORIA: 5 },
  MATA: { CAMPEAO: 100, VICE: 70, TOP3: 50, TOP4: 40, SF: 30, QF: 20, R16: 10, R32: 5 }
};

const PONTOS_CONDUTA = {
  AMARELO: -1,
  VERMELHO_INDIRETO: -3,
  VERMELHO_DIRETO: -4,
  AMARELO_E_VERMELHO_DIRETO: -5
};

// --- CONFIGURAÇÃO INICIAL ---
const gerarJogosIniciais = () => {
  let jogos = [];
  let id = 1;
  const locais = ['Cid. México', 'Nova York', 'Los Angeles', 'Toronto', 'Dallas', 'Miami', 'Guadalajara', 'Atlanta', 'Vancouver', 'Seattle', 'San Francisco', 'Houston'];
  Object.entries(GRUPOS_2026).forEach(([grupo, times]) => {
    jogos.push({ id: id++, grupo, timeA: times[0], timeB: times[1], placarA: '', placarB: '', data: '11/06', hora: '15:00', local: locais[id % 12] });
    jogos.push({ id: id++, grupo, timeA: times[2], timeB: times[3], placarA: '', placarB: '', data: '11/06', hora: '18:00', local: locais[(id+1) % 12] });
    jogos.push({ id: id++, grupo, timeA: times[0], timeB: times[2], placarA: '', placarB: '', data: '17/06', hora: '16:00', local: locais[(id+2) % 12] });
    jogos.push({ id: id++, grupo, timeA: times[3], timeB: times[1], placarA: '', placarB: '', data: '17/06', hora: '20:00', local: locais[(id+3) % 12] });
    jogos.push({ id: id++, grupo, timeA: times[3], timeB: times[0], placarA: '', placarB: '', data: '24/06', hora: '17:00', local: locais[(id+4) % 12] });
    jogos.push({ id: id++, grupo, timeA: times[1], timeB: times[2], placarA: '', placarB: '', data: '24/06', hora: '17:00', local: locais[(id+5) % 12] });
  });
  return jogos;
};

// --- CONFIGURAÇÃO MATA-MATA ---
const MATA_MATA_CONFIG = {
  r32: [
    { id: 73, label: "2A x 2B", data: "28/06", local: "Los Angeles", refA: "2A", refB: "2B" },
    { id: 74, label: "1E x 3A/B/C/D/F", data: "29/06", local: "Boston", refA: "1E", refThirdGroups: ['A', 'B', 'C', 'D', 'F'] },
    { id: 75, label: "1F x 2C", data: "29/06", local: "Monterrey", refA: "1F", refB: "2C" },
    { id: 76, label: "1C x 2F", data: "29/06", local: "Houston", refA: "1C", refB: "2F" },
    { id: 77, label: "1I x 3C/D/F/G/H", data: "30/06", local: "Nova York/Nova Jersey", refA: "1I", refThirdGroups: ['C', 'D', 'F', 'G', 'H'] },
    { id: 78, label: "2E x 2I", data: "30/06", local: "Dallas", refA: "2E", refB: "2I" },
    { id: 79, label: "1A x 3C/E/F/H/I", data: "30/06", local: "Cid. México", refA: "1A", refThirdGroups: ['C', 'E', 'F', 'H', 'I'] },
    { id: 80, label: "1L x 3E/H/I/J/K", data: "01/07", local: "Atlanta", refA: "1L", refThirdGroups: ['E', 'H', 'I', 'J', 'K'] },
    { id: 81, label: "1D x 3B/E/F/I/J", data: "01/07", local: "San Francisco", refA: "1D", refThirdGroups: ['B', 'E', 'F', 'I', 'J'] },
    { id: 82, label: "1G x 3A/E/H/I/J", data: "01/07", local: "Seattle", refA: "1G", refThirdGroups: ['A', 'E', 'H', 'I', 'J'] },
    { id: 83, label: "2K x 2L", data: "02/07", local: "Toronto", refA: "2K", refB: "2L" },
    { id: 84, label: "1H x 2J", data: "02/07", local: "Los Angeles", refA: "1H", refB: "2J" },
    { id: 85, label: "1B x 3E/F/G/I/J", data: "02/07", local: "Vancouver", refA: "1B", refThirdGroups: ['E', 'F', 'G', 'I', 'J'] },
    { id: 86, label: "1J x 2H", data: "03/07", local: "Miami", refA: "1J", refB: "2H" },
    { id: 87, label: "1K x 3D/E/I/J/L", data: "03/07", local: "Kansas City", refA: "1K", refThirdGroups: ['D', 'E', 'I', 'J', 'L'] },
    { id: 88, label: "2D x 2G", data: "03/07", local: "Dallas", refA: "2D", refB: "2G" },
  ],
  r16: [
    { id: 89, feedA: 73, feedB: 74, data: "04/07", local: "Houston" },
    { id: 90, feedA: 75, feedB: 76, data: "04/07", local: "Seattle" },
    { id: 91, feedA: 77, feedB: 78, data: "05/07", local: "Atlanta" },
    { id: 92, feedA: 79, feedB: 80, data: "05/07", local: "Cid. México" },
    { id: 93, feedA: 81, feedB: 82, data: "06/07", local: "Vancouver" },
    { id: 94, feedA: 83, feedB: 84, data: "06/07", local: "Filadélfia" },
    { id: 95, feedA: 85, feedB: 86, data: "07/07", local: "Miami" },
    { id: 96, feedA: 87, feedB: 88, data: "07/07", local: "Nova York" }
  ],
  qf: [
    { id: 97, feedA: 89, feedB: 90, data: "09/07", local: "Boston" },
    { id: 98, feedA: 91, feedB: 92, data: "10/07", local: "Los Angeles" },
    { id: 99, feedA: 93, feedB: 94, data: "11/07", local: "Miami" },
    { id: 100, feedA: 95, feedB: 96, data: "11/07", local: "Kansas City" }
  ],
  sf: [
    { id: 101, feedA: 97, feedB: 98, data: "14/07", local: "Dallas" },
    { id: 102, feedA: 99, feedB: 100, data: "15/07", local: "Atlanta" }
  ]
};

// --- LÓGICA DE NEGÓCIO ---
const getTeamConductScore = (grupo, time, condutaGrupos) => {
  const registro = condutaGrupos?.[grupo]?.[time];
  if (!registro) return 0;
  if (typeof registro.score === 'number' && !Number.isNaN(registro.score)) return registro.score;
  const amarelos = Number(registro.amarelos || 0);
  const vermelhoIndireto = Number(registro.vermelhoIndireto || 0);
  const vermelhoDireto = Number(registro.vermelhoDireto || 0);
  const amareloEVermelhoDireto = Number(registro.amareloEVermelhoDireto || 0);
  return (
    amarelos * PONTOS_CONDUTA.AMARELO +
    vermelhoIndireto * PONTOS_CONDUTA.VERMELHO_INDIRETO +
    vermelhoDireto * PONTOS_CONDUTA.VERMELHO_DIRETO +
    amareloEVermelhoDireto * PONTOS_CONDUTA.AMARELO_E_VERMELHO_DIRETO
  );
};

const calcularMiniTabela = (timesEmpatados, jogosProcessados) => {
  const mini = {};
  timesEmpatados.forEach((time) => {
    mini[time] = { p: 0, sg: 0, gp: 0 };
  });

  jogosProcessados.forEach((jogo) => {
    if (!timesEmpatados.includes(jogo.timeA) || !timesEmpatados.includes(jogo.timeB)) return;

    mini[jogo.timeA].gp += jogo.pA;
    mini[jogo.timeA].sg += jogo.pA - jogo.pB;
    mini[jogo.timeB].gp += jogo.pB;
    mini[jogo.timeB].sg += jogo.pB - jogo.pA;

    if (jogo.pA > jogo.pB) {
      mini[jogo.timeA].p += 3;
    } else if (jogo.pB > jogo.pA) {
      mini[jogo.timeB].p += 3;
    } else {
      mini[jogo.timeA].p += 1;
      mini[jogo.timeB].p += 1;
    }
  });

  return mini;
};

const compararCritBase = (a, b, rankKey = 'rankFifa') => (
  b.p - a.p ||
  b.sg - a.sg ||
  b.gp - a.gp ||
  b.conduta - a.conduta ||
  (a[rankKey] ?? Number.MAX_SAFE_INTEGER) - (b[rankKey] ?? Number.MAX_SAFE_INTEGER) ||
  a.time.localeCompare(b.time, 'pt-BR')
);

const resolverEmpateGrupoFifa = (linhas, jogosProcessados) => {
  if (linhas.length <= 1) return linhas;

  const miniTabela = calcularMiniTabela(linhas.map((linha) => linha.time), jogosProcessados);
  const enriquecidas = linhas.map((linha) => ({
    ...linha,
    miniP: miniTabela[linha.time].p,
    miniSg: miniTabela[linha.time].sg,
    miniGp: miniTabela[linha.time].gp
  }));

  enriquecidas.sort((a, b) =>
    b.miniP - a.miniP ||
    b.miniSg - a.miniSg ||
    b.miniGp - a.miniGp
  );

  const grupos = [];
  enriquecidas.forEach((linha) => {
    const ultimo = grupos[grupos.length - 1];
    if (
      ultimo &&
      ultimo[0].miniP === linha.miniP &&
      ultimo[0].miniSg === linha.miniSg &&
      ultimo[0].miniGp === linha.miniGp
    ) {
      ultimo.push(linha);
      return;
    }
    grupos.push([linha]);
  });

  return grupos.flatMap((grupoEmpatado) => {
    if (grupoEmpatado.length === 1) return grupoEmpatado;
    if (grupoEmpatado.length !== linhas.length) {
      return resolverEmpateGrupoFifa(
        grupoEmpatado.map(({ miniP, miniSg, miniGp, ...resto }) => resto),
        jogosProcessados
      );
    }
    return grupoEmpatado
      .map(({ miniP, miniSg, miniGp, ...resto }) => resto)
      .sort((a, b) => compararCritBase(a, b));
  });
};

const ordenarTabelaGrupoFifa = (linhas, jogosProcessados) => {
  const porPontos = [...linhas].sort((a, b) => b.p - a.p);
  const grupos = [];

  porPontos.forEach((linha) => {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo[0].p === linha.p) {
      ultimo.push(linha);
      return;
    }
    grupos.push([linha]);
  });

  return grupos.flatMap((grupoEmpatado) => (
    grupoEmpatado.length === 1 ? grupoEmpatado : resolverEmpateGrupoFifa(grupoEmpatado, jogosProcessados)
  ));
};

const calcularTabelaGrupo = (grupo, jogos, palpitesUsuario, condutaGrupos = {}) => {
  const times = GRUPOS_2026[grupo];
  const tabela = {};
  const jogosProcessados = [];
  times.forEach(time => {
    tabela[time] = {
      time,
      grupo,
      p: 0,
      j: 0,
      v: 0,
      e: 0,
      d: 0,
      gp: 0,
      gc: 0,
      sg: 0,
      conduta: getTeamConductScore(grupo, time, condutaGrupos)
    };
  });
  const jogosDoGrupo = jogos.filter(j => j.grupo === grupo);
  jogosDoGrupo.forEach(jogo => {
    let gA = jogo.placarA, gB = jogo.placarB;
    if (gA === '' || gB === '') {
      const p = palpitesUsuario?.[jogo.id];
      if (p && p.placarA !== '' && p.placarB !== '') { gA = p.placarA; gB = p.placarB; }
    }
    if (gA !== '' && gB !== '') {
      const pA = parseInt(gA), pB = parseInt(gB);
      jogosProcessados.push({ timeA: jogo.timeA, timeB: jogo.timeB, pA, pB });
      tabela[jogo.timeA].j++; tabela[jogo.timeA].gp += pA; tabela[jogo.timeA].gc += pB; tabela[jogo.timeA].sg += (pA - pB);
      tabela[jogo.timeB].j++; tabela[jogo.timeB].gp += pB; tabela[jogo.timeB].gc += pA; tabela[jogo.timeB].sg += (pB - pA);
      if (pA > pB) { tabela[jogo.timeA].v++; tabela[jogo.timeA].p += 3; tabela[jogo.timeB].d++; }
      else if (pB > pA) { tabela[jogo.timeB].v++; tabela[jogo.timeB].p += 3; tabela[jogo.timeA].d++; }
      else { tabela[jogo.timeA].e++; tabela[jogo.timeA].p += 1; tabela[jogo.timeB].e++; tabela[jogo.timeB].p += 1; }
    }
  });
  return ordenarTabelaGrupoFifa(Object.values(tabela), jogosProcessados);
};

const ordenarTerceirosFifa = (terceiros) => [...terceiros].sort((a, b) => compararCritBase(a, b));

const resolverConfrontosTerceiros = (melhoresTerceiros, slotsDisponiveis) => {
  let solucao = null;
  const ordenados = ordenarTerceirosFifa(melhoresTerceiros);
  const backtrack = (index, alocados, usados) => {
    if (solucao) return;
    if (index === slotsDisponiveis.length) { solucao = alocados; return; }
    const slot = slotsDisponiveis[index];
    if (!slot.refThirdGroups) {
      backtrack(index + 1, alocados, usados);
      return;
    }
    for (const timeAtual of ordenados) {
      if (usados.has(timeAtual.time)) continue;
      if (!slot.refThirdGroups.includes(timeAtual.grupo)) continue;
      const proximosUsados = new Set(usados);
      proximosUsados.add(timeAtual.time);
      backtrack(index + 1, { ...alocados, [slot.id]: timeAtual.time }, proximosUsados);
    }
  };
  backtrack(0, {}, new Set());
  return solucao || {};
};

const placarPreenchido = (placarA, placarB) => (
  placarA !== '' &&
  placarB !== '' &&
  placarA !== undefined &&
  placarB !== undefined &&
  placarA !== null &&
  placarB !== null
);

const faseDeGruposCompleta = (jogos, palpitesUsuario) => jogos.every((jogo) => {
  if (placarPreenchido(jogo.placarA, jogo.placarB)) return true;
  const palpite = palpitesUsuario?.[jogo.id];
  return placarPreenchido(palpite?.placarA, palpite?.placarB);
});

const getR32Team = (ref, jogos, palpitesUsuario, condutaGrupos, gruposCompletos) => {
  if (!gruposCompletos) return "A definir";
  if (!ref) return "???";
  if (ref.length === 2) {
    const pos = parseInt(ref[0]);
    const grp = ref[1];
    const tabela = calcularTabelaGrupo(grp, jogos, palpitesUsuario, condutaGrupos);
    return tabela[pos-1]?.time || "A definir";
  }
  return null;
};

const getThirdPlaceCandidate = (match, alocacaoTerceiros, gruposCompletos) => {
  if (!match.refThirdGroups) return null;
  if (!gruposCompletos) return "A definir";
  return alocacaoTerceiros[match.id] || `3º de ${match.refThirdGroups.join('/')}`;
};

const calcularPontosJogo = (palpiteA, palpiteB, realA, realB) => {
  if (palpiteA === '' || palpiteB === '' || realA === '' || realB === '') return null;
  const pA = parseInt(palpiteA); const pB = parseInt(palpiteB);
  const rA = parseInt(realA); const rB = parseInt(realB);
  if (pA === rA && pB === rB) return { pts: PONTOS.JOGO.CHEIO, label: 'NA MOSCA!', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
  const diffP = pA - pB; const diffR = rA - rB;
  if (Math.sign(diffP) === Math.sign(diffR)) {
    return { pts: PONTOS.JOGO.VITORIA, label: 'VENCEDOR', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' };
  }
  return { pts: 0, label: 'ERROU', color: 'text-red-400 bg-red-500/20 border-red-500/30' };
};

const getWinnerOfMatch = (matchId, source) => {
  if (!source) return null;
  if (matchId >= 73 && matchId <= 88) return source.dezeszeseisavos?.[matchId - 73];
  if (matchId >= 89 && matchId <= 96) return source.oitavas?.[matchId - 89];
  if (matchId >= 97 && matchId <= 100) return source.quartas?.[matchId - 97];
  if (matchId >= 101 && matchId <= 102) return source.semis?.[matchId - 101];
  return null;
};

// --- ESTILOS MAC STYLE ---
const GLASS_CARD = "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg rounded-2xl";
const GLASS_INPUT = "bg-black/20 border border-white/10 rounded-lg text-white focus:border-white/30 focus:outline-none transition-all placeholder:text-white/20";
const GLASS_BTN_PRIMARY = "bg-gradient-to-r from-blue-600/80 to-blue-500/80 hover:from-blue-500 hover:to-blue-400 text-white font-semibold shadow-lg backdrop-blur-sm border border-white/10 rounded-xl transition-all active:scale-95";
const GLASS_BTN_SECONDARY = "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 rounded-xl transition-all active:scale-95";
const TEXT_MUTED = "text-white/40";
const TEXT_HIGHLIGHT = "text-white/90";

// --- SUB-COMPONENTES UI ---
const LoginScreen = ({ onLogin, users }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !password.trim()) { setError('Preencha nome e senha'); return; }
    if (name.toLowerCase() === 'admin') {
      if (password === 'qwer') { onLogin(999, 'Admin', 'qwer'); return; } 
      else { setError('Senha de Administrador incorreta.'); return; }
    }
    const existingUser = users.find(u => u.nome.toLowerCase() === name.trim().toLowerCase());
    if (isRegistering) {
      if (existingUser) { setError('Nome já existe. Tente fazer login.'); } 
      else { onLogin(Date.now(), name.trim(), password.trim()); }
    } else {
      if (existingUser) {
        if (existingUser.senha === password.trim()) { onLogin(existingUser.id, existingUser.nome, existingUser.senha); } 
        else { setError('Senha incorreta.'); }
      } else { setError('Usuário não encontrado. Crie uma conta.'); }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 font-sans bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
      <div className={`${GLASS_CARD} w-full max-w-sm p-8 relative overflow-hidden`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80"></div>
        <div className="flex justify-center mb-6">
          <div className="bg-white/5 p-4 rounded-full shadow-inner border border-white/5">
            <Trophy size={40} className="text-yellow-400 drop-shadow-md" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-1 tracking-tight">BOLÃO 2026</h1>
        <p className={`text-center text-xs uppercase tracking-widest font-semibold mb-8 ${TEXT_MUTED}`}>Acesso Seguro</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Nome de Usuário</label>
            <div className="relative"><User size={18} className={`absolute left-3.5 top-3.5 ${TEXT_MUTED}`} /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: João Silva" className={`${GLASS_INPUT} w-full pl-11 p-3.5 text-sm`}/></div>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Senha</label>
            <div className="relative"><Lock size={18} className={`absolute left-3.5 top-3.5 ${TEXT_MUTED}`} /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha secreta" className={`${GLASS_INPUT} w-full pl-11 pr-11 p-3.5 text-sm`}/><button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3.5 top-3.5 hover:text-white transition-colors ${TEXT_MUTED}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {error && <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20"><AlertCircle size={14} /> {error}</div>}
          <button type="submit" className={`${GLASS_BTN_PRIMARY} w-full py-3.5 mt-2 flex items-center justify-center gap-2`}>{isRegistering ? 'Criar Conta' : 'Entrar'} <ArrowRight size={18} /></button>
        </form>
        <div className="mt-8 text-center"><button onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className={`text-xs hover:text-white transition-colors underline decoration-white/30 hover:decoration-white ${TEXT_MUTED}`}>{isRegistering ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Criar nova.'}</button></div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null); 
  const [abaAtiva, setAbaAtiva] = useState('jogos');
  const [secaoExpandida, setSecaoExpandida] = useState('r32');
  const [alocacaoTerceiros, setAlocacaoTerceiros] = useState({});
  const [resetConfirm, setResetConfirm] = useState(false);

  const [usuarios, setUsuarios] = useState(() => JSON.parse(localStorage.getItem('bolao26_users')) || []);
  const [jogosReais, setJogosReais] = useState(() => JSON.parse(localStorage.getItem('bolao26_matches')) || gerarJogosIniciais());
  const [palpitesJogos, setPalpitesJogos] = useState(() => JSON.parse(localStorage.getItem('bolao26_bets_games')) || {});
  const [palpitesMataMata, setPalpitesMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_bets_knockout_v2')) || {});
  const [gabaritoMataMata, setGabaritoMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_official_knockout_v2')) || {});
  const [condutaGrupos, setCondutaGrupos] = useState(() => JSON.parse(localStorage.getItem('bolao26_group_conduct')) || {});

  useEffect(() => { localStorage.setItem('bolao26_users', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('bolao26_matches', JSON.stringify(jogosReais)); }, [jogosReais]);
  useEffect(() => { localStorage.setItem('bolao26_bets_games', JSON.stringify(palpitesJogos)); }, [palpitesJogos]);
  useEffect(() => { localStorage.setItem('bolao26_bets_knockout_v2', JSON.stringify(palpitesMataMata)); }, [palpitesMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_official_knockout_v2', JSON.stringify(gabaritoMataMata)); }, [gabaritoMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_group_conduct', JSON.stringify(condutaGrupos)); }, [condutaGrupos]);

  const modoAdmin = currentUser?.nome?.toLowerCase() === 'admin'; 
  const palpitesUsuarioAtual = currentUser ? palpitesJogos[currentUser.id] : undefined;
  const gruposCompletos = currentUser ? faseDeGruposCompleta(jogosReais, modoAdmin ? undefined : palpitesUsuarioAtual) : false;

  useEffect(() => {
    if (!currentUser) return;
    if (!gruposCompletos) {
      setAlocacaoTerceiros({});
      return;
    }
    const tabelaGeral = {};
    Object.keys(GRUPOS_2026).forEach(g => { tabelaGeral[g] = calcularTabelaGrupo(g, jogosReais, palpitesUsuarioAtual, condutaGrupos); });
    const terceiros = [];
    Object.values(tabelaGeral).forEach(t => { if(t[2]) terceiros.push(t[2]); });
    terceiros.sort((a, b) => compararCritBase(a, b));
    const top8 = terceiros.slice(0, 8);
    const slots = MATA_MATA_CONFIG.r32.filter(match => match.refThirdGroups);
    const resultado = resolverConfrontosTerceiros(top8, slots);
    setAlocacaoTerceiros(resultado);
  }, [jogosReais, palpitesUsuarioAtual, condutaGrupos, currentUser, gruposCompletos]);

  const handleLogin = (id, nome, senha) => {
    if (nome === 'Admin' && !usuarios.find(u => u.nome === 'Admin')) {
      const adminUser = { id: 999, nome: 'Admin', senha: 'qwer' };
      setUsuarios([...usuarios, adminUser]);
    } else if (!usuarios.find(u => u.id === id)) {
      setUsuarios([...usuarios, { id, nome, senha }]); 
    }
    setCurrentUser({ id, nome });
  };

  const handleLogout = () => setCurrentUser(null);
  const atualizarJogo = (id, c, v) => setJogosReais(p => p.map(j => j.id === id ? { ...j, [c]: v } : j));
  const atualizarPalpite = (id, c, v) => setPalpitesJogos(p => ({ ...p, [currentUser.id]: { ...(p[currentUser.id] || {}), [id]: { ...(p[currentUser.id]?.[id] || { placarA: '', placarB: '' }), [c]: v } } }));
  const atualizarCondutaGrupo = (grupo, time, campo, valor) => {
    setCondutaGrupos((anterior) => ({
      ...anterior,
      [grupo]: {
        ...(anterior[grupo] || {}),
        [time]: {
          ...(anterior[grupo]?.[time] || {}),
          [campo]: valor
        }
      }
    }));
  };
  const atualizarMataMata = (c, v, i) => {
    const setter = modoAdmin ? setGabaritoMataMata : setPalpitesMataMata;
    setter(p => {
      const root = modoAdmin ? p : (p[currentUser.id] || {});
      const val = i !== null ? [...(root[c] || [])] : v;
      if (i !== null) val[i] = v;
      return modoAdmin ? { ...p, [c]: val } : { ...p, [currentUser.id]: { ...root, [c]: val } };
    });
  };

  const handleReset = () => {
    if (resetConfirm) { localStorage.clear(); window.location.reload(); } 
    else { setResetConfirm(true); setTimeout(() => setResetConfirm(false), 3000); }
  };

  const RankingTable = () => {
    const ranking = useMemo(() => {
      return usuarios.map(user => {
        let ptsJogos = 0, ptsMataMata = 0, exatos = 0;
        jogosReais.forEach(jogo => {
          if (jogo.placarA !== '' && jogo.placarB !== '') {
            const aposta = palpitesJogos[user.id]?.[jogo.id];
            if (aposta && aposta.placarA !== '' && aposta.placarB !== '') {
              const res = calcularPontosJogo(aposta.placarA, aposta.placarB, jogo.placarA, jogo.placarB);
              if (res) { ptsJogos += res.pts; if (res.pts === PONTOS.JOGO.CHEIO) exatos++; }
            }
          }
        });
        const userMM = palpitesMataMata[user.id] || {};
        if (gabaritoMataMata.campeao && userMM.campeao === gabaritoMataMata.campeao) ptsMataMata += PONTOS.MATA.CAMPEAO;
        if (gabaritoMataMata.vice && userMM.vice === gabaritoMataMata.vice) ptsMataMata += PONTOS.MATA.VICE;
        if (gabaritoMataMata.terceiro && userMM.terceiro === gabaritoMataMata.terceiro) ptsMataMata += PONTOS.MATA.TOP3;
        if (gabaritoMataMata.quarto && userMM.quarto === gabaritoMataMata.quarto) ptsMataMata += PONTOS.MATA.TOP4;
        const checkPhase = (field, points) => {
           const official = gabaritoMataMata[field] || [];
           const userBet = userMM[field] || [];
           userBet.forEach((betTeam) => { if (betTeam && official.includes(betTeam)) { ptsMataMata += points; } });
        };
        checkPhase('semis', PONTOS.MATA.SF); checkPhase('quartas', PONTOS.MATA.QF); checkPhase('oitavas', PONTOS.MATA.R16); checkPhase('dezeszeseisavos', PONTOS.MATA.R32);
        return { ...user, ptsJogos, ptsMataMata, total: ptsJogos + ptsMataMata, exatos };
      }).sort((a, b) => b.total - a.total || b.exatos - a.exatos);
    }, [usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata]);

    return (
      <div className="space-y-4 animate-fade-in">
        <div className={`${GLASS_CARD} p-4 text-center`}>
          <p className={`text-xs ${TEXT_MUTED}`}>A pontuação só aparece quando o <strong className="text-white">Admin</strong> preenche os resultados.</p>
        </div>
        <div className={`${GLASS_CARD} overflow-hidden`}>
          <table className="w-full text-xs">
            <thead className="bg-white/5 text-white/40 font-bold uppercase text-[9px] border-b border-white/5"><tr><th className="p-4 text-center">#</th><th className="p-4 text-left">Nome</th><th className="p-4 text-center">Jogos</th><th className="p-4 text-center">Mata</th><th className="p-4 text-center text-white">Total</th></tr></thead>
            <tbody>{ranking.map((user, idx) => (<tr key={user.id} className={`border-b border-white/5 last:border-0 ${user.id === currentUser.id ? 'bg-blue-500/10' : ''}`}><td className={`p-4 text-center font-bold ${TEXT_MUTED}`}>{idx + 1}</td><td className={`p-4 font-bold ${user.id === currentUser.id ? 'text-blue-400' : TEXT_HIGHLIGHT}`}>{user.nome} {user.id === currentUser.id && '(Você)'}</td><td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsJogos}</td><td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsMataMata}</td><td className="p-4 text-center font-bold text-green-400 text-sm">{user.total}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const TabelaClassificacao = ({ grupo }) => {
    const tabela = calcularTabelaGrupo(grupo, jogosReais, palpitesJogos[currentUser.id], condutaGrupos);
    return (
      <div className={`${GLASS_CARD} overflow-hidden mb-4`}>
        <div className="bg-white/5 px-4 py-2.5 flex justify-between items-center border-b border-white/5">
          <span className={`font-bold text-xs uppercase tracking-wider ${TEXT_MUTED}`}>Classificação - Grupo {grupo}</span>
          <span className="text-[10px] text-blue-400 font-medium bg-blue-400/10 px-2 py-0.5 rounded-full">{modoAdmin ? 'Oficial' : 'Simulada'}</span>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className={`text-white/40 border-b border-white/5`}>
              <th className="p-2.5 text-center w-8">#</th><th className="p-2.5 text-left">Seleção</th><th className="p-2.5 text-center font-bold text-white w-8">P</th><th className="p-2.5 text-center w-8 hidden sm:table-cell">J</th><th className="p-2.5 text-center w-8 hidden sm:table-cell">SG</th><th className="p-2.5 text-center w-8 sm:hidden">S</th>
            </tr>
          </thead>
          <tbody>
            {tabela.map((time, idx) => {
              let posColor = "";
              if (idx < 2) posColor = "border-l-2 border-l-green-500 bg-green-500/5";
              else if (idx === 2) posColor = "border-l-2 border-l-yellow-500 bg-yellow-500/5";
              else posColor = "border-l-2 border-l-transparent opacity-50";
              return (
                <tr key={time.time} className={`border-b border-white/5 last:border-0 ${posColor}`}>
                  <td className={`p-2.5 text-center font-bold ${TEXT_MUTED}`}>{idx + 1}</td><td className={`p-2.5 font-medium truncate max-w-[120px] ${TEXT_HIGHLIGHT}`}>{time.time}</td><td className="p-2.5 text-center font-bold text-white bg-white/5 rounded mx-1">{time.p}</td><td className={`p-2.5 text-center ${TEXT_MUTED} hidden sm:table-cell`}>{time.j}</td><td className={`p-2.5 text-center ${TEXT_MUTED} hidden sm:table-cell`}>{time.sg}</td><td className={`p-2.5 text-center ${TEXT_MUTED} sm:hidden`}>{time.sg}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {modoAdmin && (
          <div className="border-t border-white/5 p-3 space-y-2 bg-black/10">
            <div className={`text-[10px] uppercase font-bold ${TEXT_MUTED}`}>Fair play / conduta FIFA</div>
            {GRUPOS_2026[grupo].map((time) => {
              const registro = condutaGrupos?.[grupo]?.[time] || {};
              return (
                <div key={time} className="grid grid-cols-[minmax(0,1fr)_44px_44px_44px_44px] gap-2 items-center">
                  <span className="truncate text-[11px] text-white/80">{time}</span>
                  <input type="number" min="0" value={registro.amarelos ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amarelos', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs`} placeholder="A" title="Amarelos" />
                  <input type="number" min="0" value={registro.vermelhoIndireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoIndireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs`} placeholder="2A" title="Vermelho indireto" />
                  <input type="number" min="0" value={registro.vermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs`} placeholder="VD" title="Vermelho direto" />
                  <input type="number" min="0" value={registro.amareloEVermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amareloEVermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs`} placeholder="A+V" title="Amarelo + vermelho direto" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const RestrictedMatchDropdown = ({ match, idx, phaseKey }) => {
    let timeA, timeB;
    if (phaseKey === 'dezeszeseisavos') {
      timeA = getR32Team(match.refA, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos);
      timeB = match.refThirdGroups
        ? getThirdPlaceCandidate(match, alocacaoTerceiros, gruposCompletos)
        : getR32Team(match.refB, jogosReais, palpitesUsuarioAtual, condutaGrupos, gruposCompletos);
    } else {
      const source = modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {});
      timeA = getWinnerOfMatch(match.feedA, source) || `Venc. ${match.feedA}`;
      timeB = getWinnerOfMatch(match.feedB, source) || `Venc. ${match.feedB}`;
    }
    const currentValue = modoAdmin ? gabaritoMataMata[phaseKey]?.[idx] : palpitesMataMata[currentUser.id]?.[phaseKey]?.[idx];
    const options = [timeA, timeB].filter(t => t && t !== 'A definir' && !t.includes("Aguardando") && !t.includes("Venc.") && !t.startsWith('3º de '));
    const isReady = options.length === 2;
    let feedback = null;
    if (!modoAdmin && gabaritoMataMata[phaseKey]?.[idx]) {
      const officialWinner = gabaritoMataMata[phaseKey][idx];
      if (currentValue === officialWinner) { feedback = <div className="text-center text-[10px] bg-green-500/20 text-green-400 font-bold border border-green-500/30 rounded-lg p-1.5 mb-3 backdrop-blur-sm">Acertou!</div>; } 
      else { feedback = <div className="text-center text-[10px] bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-lg p-1.5 mb-3 backdrop-blur-sm">Errou (Era {officialWinner})</div>; }
    }

    return (
      <div className={`${GLASS_CARD} p-4 mb-3 ${!isReady && 'opacity-60'}`}>
        <div className={`flex justify-between items-center text-[10px] font-bold uppercase mb-3 ${TEXT_MUTED}`}><span>{match.data} • {match.local}</span><span>JOGO {match.id}</span></div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold truncate max-w-[45%] text-right ${isReady ? 'text-white' : TEXT_MUTED}`}>{timeA}</span>
          <span className={`text-[10px] px-2 ${TEXT_MUTED}`}>vs</span>
          <span className={`text-xs font-bold truncate max-w-[45%] text-left ${isReady ? 'text-white' : TEXT_MUTED}`}>{timeB}</span>
        </div>
        {feedback}
        <div className="relative">
          {!isReady && <Lock size={12} className={`absolute left-3 top-3.5 ${TEXT_MUTED}`} />}
          <select value={currentValue || ""} onChange={(e) => atualizarMataMata(phaseKey, e.target.value, idx)} disabled={!isReady} className={`${GLASS_INPUT} w-full p-3 text-xs font-medium appearance-none ${!isReady && 'pl-8 cursor-not-allowed text-white/30'}`}>
            <option value="">{isReady ? "Quem vence?" : "Defina os anteriores"}</option>{isReady && <><option value={timeA}>{timeA}</option><option value={timeB}>{timeB}</option></>}
          </select>
          {isReady && <ChevronDown size={14} className={`absolute right-3 top-3.5 pointer-events-none ${TEXT_MUTED}`} />}
        </div>
      </div>
    );
  };

  const PodiumSection = () => {
    const dataSource = modoAdmin ? gabaritoMataMata : (palpitesMataMata[currentUser.id] || {});
    const finalista1 = getWinnerOfMatch(101, dataSource);
    const finalista2 = getWinnerOfMatch(102, dataSource);
    const semi1A = getWinnerOfMatch(97, dataSource);
    const semi1B = getWinnerOfMatch(98, dataSource);
    const perdedor1 = finalista1 === semi1A ? semi1B : semi1A;
    const semi2A = getWinnerOfMatch(99, dataSource);
    const semi2B = getWinnerOfMatch(100, dataSource);
    const perdedor2 = finalista2 === semi2A ? semi2B : semi2A;
    const finalistas = [finalista1, finalista2].filter(Boolean);
    const disputantes3 = [perdedor1, perdedor2].filter(Boolean);
    const isFinalReady = finalistas.length === 2;
    const is3rdReady = disputantes3.length === 2;
    const renderFeedback = (field) => {
      if (modoAdmin || !gabaritoMataMata[field]) return null;
      if (dataSource[field] === gabaritoMataMata[field]) return <span className="ml-2 text-[10px] text-green-400 font-bold">(Acertou!)</span>;
      return <span className="ml-2 text-[10px] text-red-400 font-bold">(X)</span>;
    };

    return (
      <div className={`${GLASS_CARD} mb-3 transition-all ${secaoExpandida === 'podium' ? 'ring-1 ring-yellow-500/50' : ''}`}>
        <button onClick={() => setSecaoExpandida(secaoExpandida === 'podium' ? null : 'podium')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-transparent"><div className="flex items-center gap-3"><Crown className="text-yellow-400" size={18} /><span className="font-bold text-sm text-white uppercase tracking-wide">Pódio Final</span></div>{secaoExpandida === 'podium' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        {secaoExpandida === 'podium' && (
          <div className="p-4 space-y-4 border-t border-white/5">
            <div className="space-y-2">
              <label className="text-[10px] text-yellow-400 font-bold uppercase block text-center mb-3">Grande Final {renderFeedback('campeao')}</label>
              <div className={`${GLASS_CARD} p-4 bg-black/20`}>
                <select value={dataSource.campeao || ""} onChange={e => { atualizarMataMata('campeao', e.target.value, null); const vice = finalistas.find(f => f !== e.target.value); if (vice) atualizarMataMata('vice', vice, null); }} disabled={!isFinalReady} className={`${GLASS_INPUT} w-full p-3 text-xs border-yellow-500/30 focus:border-yellow-500 text-yellow-100`}>
                  <option value="">Quem será Campeão?</option>{isFinalReady && finalistas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {dataSource.vice && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>Vice: <span className="text-white">{dataSource.vice}</span> {renderFeedback('vice')}</div>}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-[10px] text-orange-400 font-bold uppercase block text-center mb-3">3º Lugar {renderFeedback('terceiro')}</label>
              <div className={`${GLASS_CARD} p-4 bg-black/20`}>
                <select value={dataSource.terceiro || ""} onChange={e => { atualizarMataMata('terceiro', e.target.value, null); const quarto = disputantes3.find(t => t !== e.target.value); if (quarto) atualizarMataMata('quarto', quarto, null); }} disabled={!is3rdReady} className={`${GLASS_INPUT} w-full p-3 text-xs border-orange-500/30 focus:border-orange-500 text-orange-100`}>
                  <option value="">Quem fica em 3º?</option>{is3rdReady && disputantes3.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {dataSource.quarto && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>4º Lugar: <span className="text-white">{dataSource.quarto}</span> {renderFeedback('quarto')}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) return <LoginScreen onLogin={handleLogin} users={usuarios} />;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans pb-28 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black">
      <header className="sticky top-0 z-20 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 px-5 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border border-white/10">{currentUser.nome.charAt(0).toUpperCase()}</div>
          <div><h1 className="text-sm font-bold text-white leading-tight">{currentUser.nome}</h1><p className={`text-[10px] font-medium tracking-wide ${TEXT_MUTED}`}>{modoAdmin ? 'ADMINISTRADOR' : 'Participante'}</p></div>
        </div>
        <button onClick={handleLogout} className={`p-2.5 rounded-full hover:bg-white/5 transition-colors ${TEXT_MUTED} hover:text-white`}><LogOut size={18} /></button>
      </header>

      <main className="p-5 max-w-lg mx-auto">
        {abaAtiva === 'jogos' && (
          <div className="space-y-8 animate-fade-in">
            {modoAdmin && <div className="bg-red-500/10 text-red-400 text-xs p-3 rounded-xl text-center border border-red-500/20 font-bold backdrop-blur-sm">MODO GABARITO ATIVO</div>}
            {Object.keys(GRUPOS_2026).map(grupo => (
              <div key={grupo} className="relative">
                <h3 className="text-sm font-bold text-white mb-4 pl-3 border-l-2 border-yellow-500 tracking-wide">GRUPO {grupo}</h3>
                <TabelaClassificacao grupo={grupo} />
                <div className="space-y-3">
                  {jogosReais.filter(j => j.grupo === grupo).map(jogo => {
                    const palpite = palpitesJogos[currentUser.id]?.[jogo.id] || { placarA: '', placarB: '' };
                    const valA = modoAdmin ? jogo.placarA : palpite.placarA;
                    const valB = modoAdmin ? jogo.placarB : palpite.placarB;
                    return (
                      <div key={jogo.id} className={`${GLASS_CARD} p-4`}>
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase mb-4 text-white/30">
                          <span className="flex items-center gap-1"><Calendar size={10} /> {jogo.data} • {jogo.hora}</span><span className="bg-white/5 px-2 py-0.5 rounded">{jogo.local}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-1/3 text-right text-xs font-bold truncate text-white/90">{jogo.timeA}</span>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" value={valA} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarA', e.target.value) : atualizarPalpite(jogo.id, 'placarA', e.target.value)} className={`${GLASS_INPUT} w-10 h-10 text-center text-sm font-bold`} />
                            <span className="text-xs text-white/30 font-light">X</span>
                            <input type="number" min="0" value={valB} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarB', e.target.value) : atualizarPalpite(jogo.id, 'placarB', e.target.value)} className={`${GLASS_INPUT} w-10 h-10 text-center text-sm font-bold`} />
                          </div>
                          <span className="w-1/3 text-left text-xs font-bold truncate text-white/90">{jogo.timeB}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {abaAtiva === 'matamata' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 mb-6 backdrop-blur-sm">
              <div className="bg-blue-500/20 p-2 rounded-full"><Calculator className="text-blue-400" size={18} /></div>
              <p className="text-[11px] text-blue-100 leading-snug">Seus palpites da fase de grupos preenchem automaticamente os confrontos abaixo.</p>
            </div>
            {[
              { id: 'r32', title: '32-avos (Top 32)', list: MATA_MATA_CONFIG.r32, key: 'dezeszeseisavos', pts: PONTOS.MATA.R32 },
              { id: 'r16', title: 'Oitavas de Final', list: MATA_MATA_CONFIG.r16, key: 'oitavas', pts: PONTOS.MATA.R16 },
              { id: 'qf', title: 'Quartas de Final', list: MATA_MATA_CONFIG.qf, key: 'quartas', pts: PONTOS.MATA.QF },
              { id: 'sf', title: 'Semifinais', list: MATA_MATA_CONFIG.sf, key: 'semis', pts: PONTOS.MATA.SF }
            ].map(section => (
              <div key={section.id}>
                <button onClick={() => setSecaoExpandida(secaoExpandida === section.id ? null : section.id)} className={`${GLASS_CARD} w-full flex items-center justify-between p-4 mb-2 hover:bg-white/10 transition-colors`}>
                  <span className="text-sm font-bold text-white tracking-wide">{section.title}</span>
                  {secaoExpandida === section.id ? <ChevronUp size={16} className={TEXT_MUTED} /> : <ChevronDown size={16} className={TEXT_MUTED} />}
                </button>
                {secaoExpandida === section.id && (
                  <div className="mt-2 mb-6">{section.list.map((match, idx) => <RestrictedMatchDropdown key={match.id} match={match} idx={idx} phaseKey={section.key} points={section.pts} />)}</div>
                )}
              </div>
            ))}
            <PodiumSection />
          </div>
        )}

        {abaAtiva === 'ranking' && <RankingTable />}
        
        {abaAtiva === 'regras' && (
          <div className="space-y-6 animate-fade-in">
             <div className={`${GLASS_CARD} p-6`}>
               <h3 className="font-bold text-sm mb-6 text-white flex items-center gap-2 uppercase tracking-wide"><List size={18} className="text-blue-400"/> Pontuação Detalhada</h3>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <div className={`text-[10px] font-bold ${TEXT_MUTED} border-b border-white/5 pb-1 mb-2`}>FASE DE GRUPOS</div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Placar Exato</span><span className="font-bold text-green-400">{PONTOS.JOGO.CHEIO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Apenas Vencedor</span><span className="font-bold text-yellow-400">{PONTOS.JOGO.VITORIA} pts</span></div>
                    <div className="mt-2 text-[10px] text-white/50 italic p-2 border-l-2 border-red-400 pl-3">Não há pontos por saldo de gols.</div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className={`text-[10px] font-bold ${TEXT_MUTED} border-b border-white/5 pb-1 mb-2`}>MATA-MATA (POR ACERTO)</div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Acertar Time 16-avos</span><span className="font-bold text-white">{PONTOS.MATA.R32} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Acertar Time Oitavas</span><span className="font-bold text-white">{PONTOS.MATA.R16} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Acertar Time Quartas</span><span className="font-bold text-white">{PONTOS.MATA.QF} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Acertar Time Semis</span><span className="font-bold text-purple-400">{PONTOS.MATA.SF} pts</span></div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className={`text-[10px] font-bold ${TEXT_MUTED} border-b border-white/5 pb-1 mb-2`}>PÓDIO FINAL</div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Campeão</span><span className="font-bold text-yellow-400">{PONTOS.MATA.CAMPEAO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>Vice</span><span className="font-bold text-slate-300">{PONTOS.MATA.VICE} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>3º Lugar</span><span className="font-bold text-orange-400">{PONTOS.MATA.TOP3} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-black/20 rounded-lg border border-white/5"><span>4º Lugar</span><span className="font-bold text-white/70">{PONTOS.MATA.TOP4} pts</span></div>
                 </div>
               </div>
               <button onClick={handleReset} className={`w-full mt-6 py-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${resetConfirm ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' : 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10'}`}><Trash2 size={14} /> {resetConfirm ? 'CLIQUE PARA CONFIRMAR' : 'RESETAR TUDO'}</button>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex justify-between gap-8 shadow-2xl z-50 max-w-[90%] w-auto">
        <button onClick={() => setAbaAtiva('jogos')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'jogos' ? 'text-blue-400 scale-110' : 'text-white/40 hover:text-white/60'}`}><Calendar size={20} strokeWidth={abaAtiva === 'jogos' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('matamata')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'matamata' ? 'text-blue-400 scale-110' : 'text-white/40 hover:text-white/60'}`}><Crown size={20} strokeWidth={abaAtiva === 'matamata' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('ranking')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'ranking' ? 'text-blue-400 scale-110' : 'text-white/40 hover:text-white/60'}`}><Trophy size={20} strokeWidth={abaAtiva === 'ranking' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('regras')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'regras' ? 'text-blue-400 scale-110' : 'text-white/40 hover:text-white/60'}`}><List size={20} strokeWidth={abaAtiva === 'regras' ? 2.5 : 2} /></button>
      </nav>
    </div>
  );
}

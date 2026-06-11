import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Calendar, Settings, Plus, User, Trash2, Medal, Crown, List, ChevronDown, ChevronUp, AlertCircle, MapPin, Calculator, Lock, LogOut, ArrowRight, Check, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { THIRD_PLACE_ASSIGNMENTS } from './thirdPlaceAssignments';
import { TEAM_FIFA_RANKINGS } from './fifaTeamRankings';
import RankingConsensusPanel from './RankingConsensusPanel';
import { buildConsensusDashboard } from './rankingConsensus';
import { buildCompetitionRanking } from './ranking';

// --- DADOS ESTRUTURAIS ---
const GRUPOS_2026 = {
  A: ['México', 'África do Sul', 'Coreia do Sul', 'Rep. Tcheca'],
  B: ['Canadá', 'Bósnia', 'Catar', 'Suíça'],
  C: ['Brasil', 'Marrocos', 'Haiti', 'Escócia'],
  D: ['EUA', 'Paraguai', 'Austrália', 'Turquia'],
  E: ['Alemanha', 'Costa do Marfim', 'Curaçao', 'Equador'],
  F: ['Holanda', 'Japão', 'Suécia', 'Tunísia'],
  G: ['Bélgica', 'Egito', 'Irã', 'Nova Zelândia'],
  H: ['Espanha', 'Cabo Verde', 'Arábia Saudita', 'Uruguai'],
  I: ['França', 'Senegal', 'Iraque', 'Noruega'],
  J: ['Argentina', 'Argélia', 'Áustria', 'Jordânia'],
  K: ['Portugal', 'RD Congo', 'Uzbequistão', 'Colômbia'],
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá']
};

// Agenda oficial da fase de grupos publicada pela FIFA em 10/04/2026.
// `kickoffEt` preserva o horario oficial em Eastern Time; `data`/`hora` sao exibidos no horario do Brasil.
const JOGOS_FASE_DE_GRUPOS = [
  { id: 1, grupo: 'A', timeA: 'México', timeB: 'África do Sul', kickoffEt: '2026-06-11T15:00:00-04:00', data: '11/06', hora: '16:00', horaEt: '15:00', local: 'Cid. México' },
  { id: 2, grupo: 'A', timeA: 'Coreia do Sul', timeB: 'Rep. Tcheca', kickoffEt: '2026-06-11T20:00:00-04:00', data: '11/06', hora: '21:00', horaEt: '20:00', local: 'Guadalajara' },
  { id: 3, grupo: 'A', timeA: 'Rep. Tcheca', timeB: 'África do Sul', kickoffEt: '2026-06-18T12:00:00-04:00', data: '18/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 4, grupo: 'A', timeA: 'México', timeB: 'Coreia do Sul', kickoffEt: '2026-06-18T21:00:00-04:00', data: '18/06', hora: '22:00', horaEt: '21:00', local: 'Guadalajara' },
  { id: 5, grupo: 'A', timeA: 'Rep. Tcheca', timeB: 'México', kickoffEt: '2026-06-24T21:00:00-04:00', data: '24/06', hora: '22:00', horaEt: '21:00', local: 'Cid. México' },
  { id: 6, grupo: 'A', timeA: 'África do Sul', timeB: 'Coreia do Sul', kickoffEt: '2026-06-24T21:00:00-04:00', data: '24/06', hora: '22:00', horaEt: '21:00', local: 'Monterrey' },
  { id: 7, grupo: 'B', timeA: 'Canadá', timeB: 'Bósnia', kickoffEt: '2026-06-12T15:00:00-04:00', data: '12/06', hora: '16:00', horaEt: '15:00', local: 'Toronto' },
  { id: 8, grupo: 'B', timeA: 'Catar', timeB: 'Suíça', kickoffEt: '2026-06-13T15:00:00-04:00', data: '13/06', hora: '16:00', horaEt: '15:00', local: 'San Francisco Bay Area' },
  { id: 9, grupo: 'B', timeA: 'Suíça', timeB: 'Bósnia', kickoffEt: '2026-06-18T15:00:00-04:00', data: '18/06', hora: '16:00', horaEt: '15:00', local: 'Los Angeles' },
  { id: 10, grupo: 'B', timeA: 'Canadá', timeB: 'Catar', kickoffEt: '2026-06-18T18:00:00-04:00', data: '18/06', hora: '19:00', horaEt: '18:00', local: 'Vancouver' },
  { id: 11, grupo: 'B', timeA: 'Suíça', timeB: 'Canadá', kickoffEt: '2026-06-24T15:00:00-04:00', data: '24/06', hora: '16:00', horaEt: '15:00', local: 'Vancouver' },
  { id: 12, grupo: 'B', timeA: 'Bósnia', timeB: 'Catar', kickoffEt: '2026-06-24T15:00:00-04:00', data: '24/06', hora: '16:00', horaEt: '15:00', local: 'Seattle' },
  { id: 13, grupo: 'C', timeA: 'Haiti', timeB: 'Escócia', kickoffEt: '2026-06-13T21:00:00-04:00', data: '13/06', hora: '22:00', horaEt: '21:00', local: 'Boston' },
  { id: 14, grupo: 'C', timeA: 'Brasil', timeB: 'Marrocos', kickoffEt: '2026-06-13T18:00:00-04:00', data: '13/06', hora: '19:00', horaEt: '18:00', local: 'Nova York/Nova Jersey' },
  { id: 15, grupo: 'C', timeA: 'Escócia', timeB: 'Marrocos', kickoffEt: '2026-06-19T18:00:00-04:00', data: '19/06', hora: '19:00', horaEt: '18:00', local: 'Boston' },
  { id: 16, grupo: 'C', timeA: 'Brasil', timeB: 'Haiti', kickoffEt: '2026-06-19T20:30:00-04:00', data: '19/06', hora: '21:30', horaEt: '20:30', local: 'Filadélfia' },
  { id: 17, grupo: 'C', timeA: 'Escócia', timeB: 'Brasil', kickoffEt: '2026-06-24T18:00:00-04:00', data: '24/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 18, grupo: 'C', timeA: 'Marrocos', timeB: 'Haiti', kickoffEt: '2026-06-24T18:00:00-04:00', data: '24/06', hora: '19:00', horaEt: '18:00', local: 'Atlanta' },
  { id: 19, grupo: 'D', timeA: 'EUA', timeB: 'Paraguai', kickoffEt: '2026-06-12T21:00:00-04:00', data: '12/06', hora: '22:00', horaEt: '21:00', local: 'Los Angeles' },
  { id: 20, grupo: 'D', timeA: 'Austrália', timeB: 'Turquia', kickoffEt: '2026-06-13T00:00:00-04:00', data: '13/06', hora: '01:00', horaEt: '00:00', local: 'Vancouver' },
  { id: 21, grupo: 'D', timeA: 'Turquia', timeB: 'Paraguai', kickoffEt: '2026-06-19T23:00:00-04:00', data: '20/06', hora: '00:00', horaEt: '23:00', local: 'San Francisco Bay Area' },
  { id: 22, grupo: 'D', timeA: 'EUA', timeB: 'Austrália', kickoffEt: '2026-06-19T15:00:00-04:00', data: '19/06', hora: '16:00', horaEt: '15:00', local: 'Seattle' },
  { id: 23, grupo: 'D', timeA: 'Turquia', timeB: 'EUA', kickoffEt: '2026-06-25T22:00:00-04:00', data: '25/06', hora: '23:00', horaEt: '22:00', local: 'Los Angeles' },
  { id: 24, grupo: 'D', timeA: 'Paraguai', timeB: 'Austrália', kickoffEt: '2026-06-25T22:00:00-04:00', data: '25/06', hora: '23:00', horaEt: '22:00', local: 'San Francisco Bay Area' },
  { id: 25, grupo: 'E', timeA: 'Costa do Marfim', timeB: 'Equador', kickoffEt: '2026-06-14T19:00:00-04:00', data: '14/06', hora: '20:00', horaEt: '19:00', local: 'Filadélfia' },
  { id: 26, grupo: 'E', timeA: 'Alemanha', timeB: 'Curaçao', kickoffEt: '2026-06-14T13:00:00-04:00', data: '14/06', hora: '14:00', horaEt: '13:00', local: 'Houston' },
  { id: 27, grupo: 'E', timeA: 'Alemanha', timeB: 'Costa do Marfim', kickoffEt: '2026-06-20T16:00:00-04:00', data: '20/06', hora: '17:00', horaEt: '16:00', local: 'Toronto' },
  { id: 28, grupo: 'E', timeA: 'Equador', timeB: 'Curaçao', kickoffEt: '2026-06-20T20:00:00-04:00', data: '20/06', hora: '21:00', horaEt: '20:00', local: 'Kansas City' },
  { id: 29, grupo: 'E', timeA: 'Curaçao', timeB: 'Costa do Marfim', kickoffEt: '2026-06-25T16:00:00-04:00', data: '25/06', hora: '17:00', horaEt: '16:00', local: 'Filadélfia' },
  { id: 30, grupo: 'E', timeA: 'Equador', timeB: 'Alemanha', kickoffEt: '2026-06-25T21:00:00-04:00', data: '25/06', hora: '22:00', horaEt: '21:00', local: 'Nova York/Nova Jersey' },
  { id: 31, grupo: 'F', timeA: 'Holanda', timeB: 'Japão', kickoffEt: '2026-06-14T16:00:00-04:00', data: '14/06', hora: '17:00', horaEt: '16:00', local: 'Dallas' },
  { id: 32, grupo: 'F', timeA: 'Suécia', timeB: 'Tunísia', kickoffEt: '2026-06-14T22:00:00-04:00', data: '14/06', hora: '23:00', horaEt: '22:00', local: 'Monterrey' },
  { id: 33, grupo: 'F', timeA: 'Holanda', timeB: 'Suécia', kickoffEt: '2026-06-20T13:00:00-04:00', data: '20/06', hora: '14:00', horaEt: '13:00', local: 'Houston' },
  { id: 34, grupo: 'F', timeA: 'Tunísia', timeB: 'Japão', kickoffEt: '2026-06-20T00:00:00-04:00', data: '20/06', hora: '01:00', horaEt: '00:00', local: 'Monterrey' },
  { id: 35, grupo: 'F', timeA: 'Japão', timeB: 'Suécia', kickoffEt: '2026-06-25T19:00:00-04:00', data: '25/06', hora: '20:00', horaEt: '19:00', local: 'Dallas' },
  { id: 36, grupo: 'F', timeA: 'Tunísia', timeB: 'Holanda', kickoffEt: '2026-06-25T19:00:00-04:00', data: '25/06', hora: '20:00', horaEt: '19:00', local: 'Kansas City' },
  { id: 37, grupo: 'G', timeA: 'Bélgica', timeB: 'Egito', kickoffEt: '2026-06-15T15:00:00-04:00', data: '15/06', hora: '16:00', horaEt: '15:00', local: 'Seattle' },
  { id: 38, grupo: 'G', timeA: 'Irã', timeB: 'Nova Zelândia', kickoffEt: '2026-06-15T21:00:00-04:00', data: '15/06', hora: '22:00', horaEt: '21:00', local: 'Los Angeles' },
  { id: 39, grupo: 'G', timeA: 'Bélgica', timeB: 'Irã', kickoffEt: '2026-06-21T15:00:00-04:00', data: '21/06', hora: '16:00', horaEt: '15:00', local: 'Los Angeles' },
  { id: 40, grupo: 'G', timeA: 'Nova Zelândia', timeB: 'Egito', kickoffEt: '2026-06-21T21:00:00-04:00', data: '21/06', hora: '22:00', horaEt: '21:00', local: 'Vancouver' },
  { id: 41, grupo: 'G', timeA: 'Egito', timeB: 'Irã', kickoffEt: '2026-06-26T23:00:00-04:00', data: '27/06', hora: '00:00', horaEt: '23:00', local: 'Seattle' },
  { id: 42, grupo: 'G', timeA: 'Nova Zelândia', timeB: 'Bélgica', kickoffEt: '2026-06-26T23:00:00-04:00', data: '27/06', hora: '00:00', horaEt: '23:00', local: 'Vancouver' },
  { id: 43, grupo: 'H', timeA: 'Arábia Saudita', timeB: 'Uruguai', kickoffEt: '2026-06-14T18:00:00-04:00', data: '14/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 44, grupo: 'H', timeA: 'Espanha', timeB: 'Cabo Verde', kickoffEt: '2026-06-14T12:00:00-04:00', data: '14/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 45, grupo: 'H', timeA: 'Uruguai', timeB: 'Cabo Verde', kickoffEt: '2026-06-21T18:00:00-04:00', data: '21/06', hora: '19:00', horaEt: '18:00', local: 'Miami' },
  { id: 46, grupo: 'H', timeA: 'Espanha', timeB: 'Arábia Saudita', kickoffEt: '2026-06-21T12:00:00-04:00', data: '21/06', hora: '13:00', horaEt: '12:00', local: 'Atlanta' },
  { id: 47, grupo: 'H', timeA: 'Cabo Verde', timeB: 'Arábia Saudita', kickoffEt: '2026-06-26T20:00:00-04:00', data: '26/06', hora: '21:00', horaEt: '20:00', local: 'Houston' },
  { id: 48, grupo: 'H', timeA: 'Uruguai', timeB: 'Espanha', kickoffEt: '2026-06-26T20:00:00-04:00', data: '26/06', hora: '21:00', horaEt: '20:00', local: 'Guadalajara' },
  { id: 49, grupo: 'I', timeA: 'Iraque', timeB: 'Noruega', kickoffEt: '2026-06-16T18:00:00-04:00', data: '16/06', hora: '19:00', horaEt: '18:00', local: 'Boston' },
  { id: 50, grupo: 'I', timeA: 'França', timeB: 'Senegal', kickoffEt: '2026-06-16T21:00:00-04:00', data: '16/06', hora: '22:00', horaEt: '21:00', local: 'Nova York/Nova Jersey' },
  { id: 51, grupo: 'I', timeA: 'Noruega', timeB: 'Senegal', kickoffEt: '2026-06-21T21:00:00-04:00', data: '21/06', hora: '22:00', horaEt: '21:00', local: 'Dallas' },
  { id: 52, grupo: 'I', timeA: 'França', timeB: 'Iraque', kickoffEt: '2026-06-21T17:00:00-04:00', data: '21/06', hora: '18:00', horaEt: '17:00', local: 'Nova York/Nova Jersey' },
  { id: 53, grupo: 'I', timeA: 'Noruega', timeB: 'França', kickoffEt: '2026-06-26T15:00:00-04:00', data: '26/06', hora: '16:00', horaEt: '15:00', local: 'Boston' },
  { id: 54, grupo: 'I', timeA: 'Senegal', timeB: 'Iraque', kickoffEt: '2026-06-26T15:00:00-04:00', data: '26/06', hora: '16:00', horaEt: '15:00', local: 'Toronto' },
  { id: 55, grupo: 'J', timeA: 'Áustria', timeB: 'Jordânia', kickoffEt: '2026-06-16T00:00:00-04:00', data: '16/06', hora: '01:00', horaEt: '00:00', local: 'San Francisco Bay Area' },
  { id: 56, grupo: 'J', timeA: 'Argentina', timeB: 'Argélia', kickoffEt: '2026-06-16T21:00:00-04:00', data: '16/06', hora: '22:00', horaEt: '21:00', local: 'Kansas City' },
  { id: 57, grupo: 'J', timeA: 'Argentina', timeB: 'Áustria', kickoffEt: '2026-06-22T13:00:00-04:00', data: '22/06', hora: '14:00', horaEt: '13:00', local: 'Dallas' },
  { id: 58, grupo: 'J', timeA: 'Jordânia', timeB: 'Argélia', kickoffEt: '2026-06-22T23:00:00-04:00', data: '23/06', hora: '00:00', horaEt: '23:00', local: 'San Francisco Bay Area' },
  { id: 59, grupo: 'J', timeA: 'Argélia', timeB: 'Áustria', kickoffEt: '2026-06-27T22:00:00-04:00', data: '27/06', hora: '23:00', horaEt: '22:00', local: 'Kansas City' },
  { id: 60, grupo: 'J', timeA: 'Jordânia', timeB: 'Argentina', kickoffEt: '2026-06-27T22:00:00-04:00', data: '27/06', hora: '23:00', horaEt: '22:00', local: 'Dallas' },
  { id: 61, grupo: 'K', timeA: 'Portugal', timeB: 'RD Congo', kickoffEt: '2026-06-17T13:00:00-04:00', data: '17/06', hora: '14:00', horaEt: '13:00', local: 'Houston' },
  { id: 62, grupo: 'K', timeA: 'Uzbequistão', timeB: 'Colômbia', kickoffEt: '2026-06-17T22:00:00-04:00', data: '17/06', hora: '23:00', horaEt: '22:00', local: 'Cid. México' },
  { id: 63, grupo: 'K', timeA: 'Portugal', timeB: 'Uzbequistão', kickoffEt: '2026-06-23T13:00:00-04:00', data: '23/06', hora: '14:00', horaEt: '13:00', local: 'Houston' },
  { id: 64, grupo: 'K', timeA: 'Colômbia', timeB: 'RD Congo', kickoffEt: '2026-06-23T22:00:00-04:00', data: '23/06', hora: '23:00', horaEt: '22:00', local: 'Guadalajara' },
  { id: 65, grupo: 'K', timeA: 'Colômbia', timeB: 'Portugal', kickoffEt: '2026-06-27T19:30:00-04:00', data: '27/06', hora: '20:30', horaEt: '19:30', local: 'Miami' },
  { id: 66, grupo: 'K', timeA: 'RD Congo', timeB: 'Uzbequistão', kickoffEt: '2026-06-27T19:30:00-04:00', data: '27/06', hora: '20:30', horaEt: '19:30', local: 'Atlanta' },
  { id: 67, grupo: 'L', timeA: 'Gana', timeB: 'Panamá', kickoffEt: '2026-06-17T19:00:00-04:00', data: '17/06', hora: '20:00', horaEt: '19:00', local: 'Toronto' },
  { id: 68, grupo: 'L', timeA: 'Inglaterra', timeB: 'Croácia', kickoffEt: '2026-06-17T16:00:00-04:00', data: '17/06', hora: '17:00', horaEt: '16:00', local: 'Dallas' },
  { id: 69, grupo: 'L', timeA: 'Inglaterra', timeB: 'Gana', kickoffEt: '2026-06-22T16:00:00-04:00', data: '22/06', hora: '17:00', horaEt: '16:00', local: 'Boston' },
  { id: 70, grupo: 'L', timeA: 'Panamá', timeB: 'Croácia', kickoffEt: '2026-06-22T19:00:00-04:00', data: '22/06', hora: '20:00', horaEt: '19:00', local: 'Toronto' },
  { id: 71, grupo: 'L', timeA: 'Panamá', timeB: 'Inglaterra', kickoffEt: '2026-06-27T17:00:00-04:00', data: '27/06', hora: '18:00', horaEt: '17:00', local: 'Nova York/Nova Jersey' },
  { id: 72, grupo: 'L', timeA: 'Croácia', timeB: 'Gana', kickoffEt: '2026-06-27T17:00:00-04:00', data: '27/06', hora: '18:00', horaEt: '17:00', local: 'Filadélfia' }
];

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

const ADMIN_USER_ID = 999;
const SUBMISSION_FIELDS = {
  JOGOS: 'jogosAt',
  MATA: 'mataAt'
};
const REMOTE_STORE_BASE = 'https://mantledb.sh/v2';
const REMOTE_NAMESPACE = 'lhgcampos-bolao2026-live-20260609';
const REMOTE_SCHEMA_VERSION = 3;
const REMOTE_LEGACY_STATE_PATH = 'state';
const REMOTE_PATHS = {
  meta: 'meta',
  usersIndex: 'users-index',
  matches: 'matches',
  officialKnockout: 'official-knockout',
  conduct: 'conduct',
  betsGames: 'bets-games',
  betsKnockout: 'bets-knockout',
  submissions: 'submissions',
  userProfiles: 'user-profiles'
};
const PENDING_SYNC_KEY = 'bolao26_pending_sync_v1';
const SYNC_DEBOUNCE_MS = 900;
const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/K3WYefFWkzY09iK1csJtZA?mode=gi_t';
const REMOTE_POLL_MS = 5000;
const COUNTRY_SHORT_NAMES = {
  'África do Sul': 'Afr. Sul',
  'Coreia do Sul': 'Cor. Sul',
  'Rep. Tcheca': 'Rep. Tch.',
  'Costa do Marfim': 'C. Marfim',
  'Nova Zelândia': 'Nova Zel.',
  'Arábia Saudita': 'Arábia S.',
  'Cabo Verde': 'C. Verde',
  'RD Congo': 'RD Congo'
};
const AVATAR_MAX_FILE_BYTES = 2 * 1024 * 1024;
const AVATAR_MAX_OUTPUT_BYTES = 48 * 1024;
const AVATAR_MAX_DIMENSION = 160;
const AVATAR_UPLOAD_URL = import.meta.env.VITE_AVATAR_UPLOAD_URL || 'https://bolao2026-avatar-upload.linoscheduling.workers.dev';
const AVATAR_PUBLIC_BASE_URL = import.meta.env.VITE_AVATAR_PUBLIC_BASE_URL || 'https://pub-56fbf4716fdc4ab69e70b4c56f28fccf.r2.dev';
const DEMO_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAYAAABv7bNHAAABpUlEQVR4nO3QwQ3CMBQFQYz//8u2g0QdW0dManIeZDV4SSQdlqzTeWYIAAAAAAAAAAB4m7vN3Wf9eR9n3rV7h9t7n5f4q2w8b0v2m2vV8f9bKf9t8m9bM4QGg9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rej9F6P0Xo/Rer8BX3kD6XhSx8AAAAASUVORK5CYII=';
// --- CONFIGURAÇÃO INICIAL ---
const buildPairKey = (timeA, timeB) => [timeA, timeB].sort().join('||');

const findOfficialMatchForPair = (match) => {
  if (!match?.grupo || !match?.timeA || !match?.timeB) return null;
  const pairKey = buildPairKey(match.timeA, match.timeB);
  return JOGOS_FASE_DE_GRUPOS.find(
    (officialMatch) => officialMatch.grupo === match.grupo && buildPairKey(officialMatch.timeA, officialMatch.timeB) === pairKey
  ) || null;
};

const getShortCountryName = (name) => COUNTRY_SHORT_NAMES[name] || name;

const normalizePersistedGameData = (matches = [], betsGames = {}) => {
  const officialMatches = JOGOS_FASE_DE_GRUPOS.map((match) => ({ ...match, placarA: '', placarB: '' }));
  const officialById = new Map(officialMatches.map((match) => [match.id, match]));
  const migrationBySourceId = new Map();

  matches.forEach((match) => {
    const officialMatch = findOfficialMatchForPair(match);
    if (!officialMatch) return;

    const swapScores = officialMatch.timeA === match.timeB && officialMatch.timeB === match.timeA;
    migrationBySourceId.set(String(match.id), { targetId: officialMatch.id, swapScores });

    officialById.set(officialMatch.id, {
      ...officialById.get(officialMatch.id),
      placarA: swapScores ? (match.placarB ?? '') : (match.placarA ?? ''),
      placarB: swapScores ? (match.placarA ?? '') : (match.placarB ?? '')
    });
  });

  const normalizedBetsGames = Object.fromEntries(
    Object.entries(betsGames || {}).map(([userId, userBets]) => {
      const nextUserBets = {};

      Object.entries(userBets || {}).forEach(([matchId, bet]) => {
        const migration = migrationBySourceId.get(String(matchId));
        if (!migration || !bet) return;

        nextUserBets[migration.targetId] = migration.swapScores
          ? { ...bet, placarA: bet.placarB ?? '', placarB: bet.placarA ?? '' }
          : { ...bet };
      });

      return [userId, nextUserBets];
    })
  );

  return {
    matches: [...officialById.values()],
    betsGames: normalizedBetsGames
  };
};

const gerarJogosIniciais = () => JOGOS_FASE_DE_GRUPOS.map((match) => ({ ...match, placarA: '', placarB: '' }));

// Agenda oficial do mata-mata publicada pela FIFA em 10/04/2026.
// `kickoffEt` preserva o horario oficial em Eastern Time; a exibicao em tela usa o horario do Brasil.
const MATA_MATA_CONFIG = {
  r32: [
    { id: 73, label: "2A x 2B", kickoffEt: "2026-06-28T15:00:00-04:00", horaEt: "15:00", local: "Los Angeles", refA: "2A", refB: "2B" },
    { id: 74, label: "1E x 3A/B/C/D/F", kickoffEt: "2026-06-28T16:30:00-04:00", horaEt: "16:30", local: "Boston", refA: "1E", refThirdGroups: ['A', 'B', 'C', 'D', 'F'] },
    { id: 75, label: "1F x 2C", kickoffEt: "2026-06-29T21:00:00-04:00", horaEt: "21:00", local: "Monterrey", refA: "1F", refB: "2C" },
    { id: 76, label: "1C x 2F", kickoffEt: "2026-06-29T13:00:00-04:00", horaEt: "13:00", local: "Houston", refA: "1C", refB: "2F" },
    { id: 77, label: "1I x 3C/D/F/G/H", kickoffEt: "2026-06-30T17:00:00-04:00", horaEt: "17:00", local: "Nova York/Nova Jersey", refA: "1I", refThirdGroups: ['C', 'D', 'F', 'G', 'H'] },
    { id: 78, label: "2E x 2I", kickoffEt: "2026-06-30T13:00:00-04:00", horaEt: "13:00", local: "Dallas", refA: "2E", refB: "2I" },
    { id: 79, label: "1A x 3C/E/F/H/I", kickoffEt: "2026-06-30T21:00:00-04:00", horaEt: "21:00", local: "Cid. México", refA: "1A", refThirdGroups: ['C', 'E', 'F', 'H', 'I'] },
    { id: 80, label: "1L x 3E/H/I/J/K", kickoffEt: "2026-07-01T12:00:00-04:00", horaEt: "12:00", local: "Atlanta", refA: "1L", refThirdGroups: ['E', 'H', 'I', 'J', 'K'] },
    { id: 81, label: "1D x 3B/E/F/I/J", kickoffEt: "2026-07-01T20:00:00-04:00", horaEt: "20:00", local: "San Francisco Bay Area", refA: "1D", refThirdGroups: ['B', 'E', 'F', 'I', 'J'] },
    { id: 82, label: "1G x 3A/E/H/I/J", kickoffEt: "2026-07-01T16:00:00-04:00", horaEt: "16:00", local: "Seattle", refA: "1G", refThirdGroups: ['A', 'E', 'H', 'I', 'J'] },
    { id: 83, label: "2K x 2L", kickoffEt: "2026-07-02T19:00:00-04:00", horaEt: "19:00", local: "Toronto", refA: "2K", refB: "2L" },
    { id: 84, label: "1H x 2J", kickoffEt: "2026-07-02T15:00:00-04:00", horaEt: "15:00", local: "Los Angeles", refA: "1H", refB: "2J" },
    { id: 85, label: "1B x 3E/F/G/I/J", kickoffEt: "2026-07-02T23:00:00-04:00", horaEt: "23:00", local: "Vancouver", refA: "1B", refThirdGroups: ['E', 'F', 'G', 'I', 'J'] },
    { id: 86, label: "1J x 2H", kickoffEt: "2026-07-03T18:00:00-04:00", horaEt: "18:00", local: "Miami", refA: "1J", refB: "2H" },
    { id: 87, label: "1K x 3D/E/I/J/L", kickoffEt: "2026-07-03T21:30:00-04:00", horaEt: "21:30", local: "Kansas City", refA: "1K", refThirdGroups: ['D', 'E', 'I', 'J', 'L'] },
    { id: 88, label: "2D x 2G", kickoffEt: "2026-07-03T14:00:00-04:00", horaEt: "14:00", local: "Dallas", refA: "2D", refB: "2G" },
  ],
  r16: [
    { id: 89, feedA: 74, feedB: 77, kickoffEt: "2026-07-04T17:00:00-04:00", horaEt: "17:00", local: "Filadélfia" },
    { id: 90, feedA: 73, feedB: 75, kickoffEt: "2026-07-04T13:00:00-04:00", horaEt: "13:00", local: "Houston" },
    { id: 91, feedA: 76, feedB: 78, kickoffEt: "2026-07-05T16:00:00-04:00", horaEt: "16:00", local: "Nova York/Nova Jersey" },
    { id: 92, feedA: 79, feedB: 80, kickoffEt: "2026-07-05T20:00:00-04:00", horaEt: "20:00", local: "Cid. México" },
    { id: 93, feedA: 83, feedB: 84, kickoffEt: "2026-07-06T15:00:00-04:00", horaEt: "15:00", local: "Dallas" },
    { id: 94, feedA: 81, feedB: 82, kickoffEt: "2026-07-06T20:00:00-04:00", horaEt: "20:00", local: "Seattle" },
    { id: 95, feedA: 86, feedB: 88, kickoffEt: "2026-07-07T12:00:00-04:00", horaEt: "12:00", local: "Atlanta" },
    { id: 96, feedA: 85, feedB: 87, kickoffEt: "2026-07-07T16:00:00-04:00", horaEt: "16:00", local: "Vancouver" }
  ],
  qf: [
    { id: 97, feedA: 89, feedB: 90, kickoffEt: "2026-07-09T16:00:00-04:00", horaEt: "16:00", local: "Boston" },
    { id: 98, feedA: 93, feedB: 94, kickoffEt: "2026-07-10T15:00:00-04:00", horaEt: "15:00", local: "Los Angeles" },
    { id: 99, feedA: 91, feedB: 92, kickoffEt: "2026-07-11T17:00:00-04:00", horaEt: "17:00", local: "Miami" },
    { id: 100, feedA: 95, feedB: 96, kickoffEt: "2026-07-11T21:00:00-04:00", horaEt: "21:00", local: "Kansas City" }
  ],
  sf: [
    { id: 101, feedA: 97, feedB: 98, kickoffEt: "2026-07-14T15:00:00-04:00", horaEt: "15:00", local: "Dallas" },
    { id: 102, feedA: 99, feedB: 100, kickoffEt: "2026-07-15T15:00:00-04:00", horaEt: "15:00", local: "Atlanta" }
  ],
  bronzeFinal: [
    { id: 103, kickoffEt: "2026-07-18T17:00:00-04:00", horaEt: "17:00", local: "Miami", titulo: "Disputa do 3º lugar" }
  ],
  final: [
    { id: 104, kickoffEt: "2026-07-19T15:00:00-04:00", horaEt: "15:00", local: "Nova York/Nova Jersey", titulo: "Final" }
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

const getTeamOfficialRank = (team) => TEAM_FIFA_RANKINGS[team]?.officialRank ?? Number.MAX_SAFE_INTEGER;

const compareOfficialRanking = (a, b) => (
  getTeamOfficialRank(a.time) - getTeamOfficialRank(b.time)
);

const compararCritBase = (a, b) => (
  b.p - a.p ||
  b.sg - a.sg ||
  b.gp - a.gp ||
  b.conduta - a.conduta ||
  compareOfficialRanking(a, b) ||
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
  const ordenados = ordenarTerceirosFifa(melhoresTerceiros);
  const gruposQualificados = ordenados
    .map((time) => time.grupo)
    .sort()
    .join('');
  const combinacaoOficial = THIRD_PLACE_ASSIGNMENTS[gruposQualificados];

  if (combinacaoOficial) {
    const terceiroPorGrupo = Object.fromEntries(
      ordenados.map((time) => [`3${time.grupo}`, time.time])
    );

    return Object.fromEntries(
      slotsDisponiveis
        .filter((slot) => combinacaoOficial[String(slot.id)])
        .map((slot) => [slot.id, terceiroPorGrupo[combinacaoOficial[String(slot.id)]] || null])
        .filter(([, time]) => Boolean(time))
    );
  }

  let solucao = null;
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

const usuarioPreencheuTodosOsJogos = (jogos, palpitesUsuario) => jogos.every((jogo) => {
  const palpite = palpitesUsuario?.[jogo.id];
  return placarPreenchido(palpite?.placarA, palpite?.placarB);
});

const contarJogosPendentes = (jogos, palpitesUsuario) => jogos.reduce((total, jogo) => {
  const palpite = palpitesUsuario?.[jogo.id];
  return placarPreenchido(palpite?.placarA, palpite?.placarB) ? total : total + 1;
}, 0);

const usuarioPreencheuMataCompleta = (palpitesUsuario = {}) => (
  Array.isArray(palpitesUsuario.dezeszeseisavos) &&
  palpitesUsuario.dezeszeseisavos.length === MATA_MATA_CONFIG.r32.length &&
  palpitesUsuario.dezeszeseisavos.every(Boolean) &&
  Array.isArray(palpitesUsuario.oitavas) &&
  palpitesUsuario.oitavas.length === MATA_MATA_CONFIG.r16.length &&
  palpitesUsuario.oitavas.every(Boolean) &&
  Array.isArray(palpitesUsuario.quartas) &&
  palpitesUsuario.quartas.length === MATA_MATA_CONFIG.qf.length &&
  palpitesUsuario.quartas.every(Boolean) &&
  Array.isArray(palpitesUsuario.semis) &&
  palpitesUsuario.semis.length === MATA_MATA_CONFIG.sf.length &&
  palpitesUsuario.semis.every(Boolean) &&
  [palpitesUsuario.campeao, palpitesUsuario.vice, palpitesUsuario.terceiro, palpitesUsuario.quarto].every(Boolean)
);

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

const createEmptyKnockoutBracket = () => ({
  dezeszeseisavos: Array(MATA_MATA_CONFIG.r32.length).fill(''),
  oitavas: Array(MATA_MATA_CONFIG.r16.length).fill(''),
  quartas: Array(MATA_MATA_CONFIG.qf.length).fill(''),
  semis: Array(MATA_MATA_CONFIG.sf.length).fill(''),
  campeao: '',
  vice: '',
  terceiro: '',
  quarto: ''
});

const isResolvedKnockoutTeam = (team) => (
  Boolean(team) &&
  team !== 'A definir' &&
  team !== '???' &&
  !team.startsWith('3º de ') &&
  !team.includes('Venc.') &&
  !team.includes('Aguardando')
);

const buildThirdPlaceAllocation = (jogos, palpitesUsuario, condutaGrupos, gruposCompletos = faseDeGruposCompleta(jogos, palpitesUsuario)) => {
  if (!gruposCompletos) return {};
  const tabelaGeral = {};
  Object.keys(GRUPOS_2026).forEach((grupo) => {
    tabelaGeral[grupo] = calcularTabelaGrupo(grupo, jogos, palpitesUsuario, condutaGrupos);
  });
  const terceiros = [];
  Object.values(tabelaGeral).forEach((tabela) => {
    if (tabela[2]) terceiros.push(tabela[2]);
  });
  terceiros.sort((a, b) => compararCritBase(a, b));
  return resolverConfrontosTerceiros(
    terceiros.slice(0, 8),
    MATA_MATA_CONFIG.r32.filter((match) => match.refThirdGroups)
  );
};

const getKnockoutMatchOptions = ({
  match,
  phaseKey,
  source,
  jogos,
  palpitesUsuario,
  condutaGrupos,
  gruposCompletos,
  alocacaoTerceiros
}) => {
  if (phaseKey === 'dezeszeseisavos') {
    const teamA = getR32Team(match.refA, jogos, palpitesUsuario, condutaGrupos, gruposCompletos);
    const teamB = match.refThirdGroups
      ? getThirdPlaceCandidate(match, alocacaoTerceiros, gruposCompletos)
      : getR32Team(match.refB, jogos, palpitesUsuario, condutaGrupos, gruposCompletos);
    return [teamA, teamB].filter((team, index, list) => (
      isResolvedKnockoutTeam(team) && list.indexOf(team) === index
    ));
  }

  return [getWinnerOfMatch(match.feedA, source), getWinnerOfMatch(match.feedB, source)].filter((team, index, list) => (
    isResolvedKnockoutTeam(team) && list.indexOf(team) === index
  ));
};

const getRunnerUp = (winner, teamA, teamB) => {
  if (!winner || !teamA || !teamB) return '';
  if (winner === teamA) return teamB;
  if (winner === teamB) return teamA;
  return '';
};

const sanitizeKnockoutBracket = ({ bracket = {}, jogos, palpitesUsuario, condutaGrupos = {} }) => {
  const sanitized = createEmptyKnockoutBracket();
  const gruposCompletos = faseDeGruposCompleta(jogos, palpitesUsuario);
  if (!gruposCompletos) return sanitized;

  const alocacaoTerceiros = buildThirdPlaceAllocation(jogos, palpitesUsuario, condutaGrupos, gruposCompletos);
  const phaseConfigs = [
    ['dezeszeseisavos', MATA_MATA_CONFIG.r32],
    ['oitavas', MATA_MATA_CONFIG.r16],
    ['quartas', MATA_MATA_CONFIG.qf],
    ['semis', MATA_MATA_CONFIG.sf]
  ];

  phaseConfigs.forEach(([phaseKey, matches]) => {
    matches.forEach((match, idx) => {
      const options = getKnockoutMatchOptions({
        match,
        phaseKey,
        source: sanitized,
        jogos,
        palpitesUsuario,
        condutaGrupos,
        gruposCompletos,
        alocacaoTerceiros
      });

      sanitized[phaseKey][idx] = options.length === 2 && options.includes(bracket[phaseKey]?.[idx])
        ? bracket[phaseKey][idx]
        : '';
    });
  });

  const finalistas = sanitized.semis.filter(Boolean);
  if (finalistas.length === 2 && finalistas.includes(bracket.campeao)) {
    sanitized.campeao = bracket.campeao;
    sanitized.vice = finalistas.find((time) => time !== bracket.campeao) || '';
  }

  const runnerUpSemi1 = getRunnerUp(sanitized.semis[0], sanitized.quartas[0], sanitized.quartas[1]);
  const runnerUpSemi2 = getRunnerUp(sanitized.semis[1], sanitized.quartas[2], sanitized.quartas[3]);
  const disputantes3 = [runnerUpSemi1, runnerUpSemi2].filter(Boolean);
  if (disputantes3.length === 2 && disputantes3.includes(bracket.terceiro)) {
    sanitized.terceiro = bracket.terceiro;
    sanitized.quarto = disputantes3.find((time) => time !== bracket.terceiro) || '';
  }

  return sanitized;
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

const buildPlanilhaDemoData = () => {
  const matches = gerarJogosIniciais().map((match, index) => ({
    ...match,
    placarA: String((index + 2) % 4),
    placarB: String(index % 3)
  }));

  const users = [
    { id: 101, nome: 'Ana Turbo', senha: '123', role: 'participant', avatar: DEMO_AVATAR },
    { id: 102, nome: 'Beto Foguete', senha: '123', role: 'participant', avatar: DEMO_AVATAR },
    { id: ADMIN_USER_ID, nome: 'Admin', senha: 'qwer', role: 'admin', avatar: DEMO_AVATAR }
  ];

  const betsGames = { 101: {}, 102: {} };
  matches.forEach((match, index) => {
    const a = Number(match.placarA);
    const b = Number(match.placarB);
    betsGames[101][match.id] = index % 3 === 0
      ? { placarA: String(a), placarB: String(b) }
      : index % 3 === 1
        ? { placarA: String(a + 1), placarB: String(b + 1) }
        : { placarA: String(Math.max(0, b + 1)), placarB: String(Math.max(0, a - 1)) };
    betsGames[102][match.id] = index % 4 === 0
      ? { placarA: String(a), placarB: String(b) }
      : index % 4 === 1
        ? { placarA: String(a), placarB: String(Math.max(0, b + 2)) }
        : index % 4 === 2
          ? { placarA: String(a + 1), placarB: String(b) }
          : { placarA: String(Math.max(0, b)), placarB: String(Math.max(0, a)) };
  });

  const officialKnockout = {
    dezeszeseisavos: ['México', 'Canadá', 'Brasil', 'Alemanha', 'Holanda', 'Bélgica', 'Espanha', 'França', 'Argentina', 'Portugal', 'Inglaterra', 'EUA', 'Marrocos', 'Suíça', 'Croácia', 'Uruguai'],
    oitavas: ['México', 'Brasil', 'Holanda', 'França', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
    quartas: ['Brasil', 'França', 'Argentina', 'Uruguai'],
    semis: ['Brasil', 'Argentina'],
    campeao: 'Brasil',
    vice: 'Argentina',
    terceiro: 'França',
    quarto: 'Uruguai'
  };

  const betsKnockout = {
    101: {
      dezeszeseisavos: ['México', 'Canadá', 'Brasil', 'Alemanha', 'Holanda', 'Bélgica', 'Espanha', 'França', 'Argentina', 'Portugal', 'Inglaterra', 'EUA', 'Marrocos', 'Suíça', 'Croácia', 'Uruguai'],
      oitavas: ['México', 'Brasil', 'Holanda', 'França', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
      quartas: ['Brasil', 'França', 'Argentina', 'Uruguai'],
      semis: ['Brasil', 'Argentina'],
      campeao: 'Brasil',
      vice: 'Argentina',
      terceiro: 'França',
      quarto: 'Uruguai'
    },
    102: {
      dezeszeseisavos: ['México', 'Suíça', 'Brasil', 'Equador', 'Holanda', 'Egito', 'Espanha', 'Noruega', 'Argentina', 'Colômbia', 'Inglaterra', 'Paraguai', 'Marrocos', 'Canadá', 'Croácia', 'Uruguai'],
      oitavas: ['México', 'Brasil', 'Holanda', 'Noruega', 'Argentina', 'Inglaterra', 'Marrocos', 'Uruguai'],
      quartas: ['Brasil', 'Noruega', 'Argentina', 'Uruguai'],
      semis: ['Brasil', 'Uruguai'],
      campeao: 'Brasil',
      vice: 'Uruguai',
      terceiro: 'Argentina',
      quarto: 'Noruega'
    }
  };

  const submissions = {
    101: {
      jogosAt: new Date('2026-06-09T08:15:00Z').getTime(),
      mataAt: new Date('2026-06-09T08:40:00Z').getTime()
    },
    102: {
      jogosAt: new Date('2026-06-09T09:05:00Z').getTime(),
      mataAt: new Date('2026-06-09T09:25:00Z').getTime()
    }
  };

  return {
    users,
    matches,
    betsGames,
    betsKnockout,
    officialKnockout,
    submissions,
    conduct: {},
    adminUser: normalizeUser(users.find((user) => user.id === ADMIN_USER_ID))
  };
};

const createInitialAppState = () => ({
  users: [],
  matches: gerarJogosIniciais(),
  betsGames: {},
  betsKnockout: {},
  officialKnockout: {},
  conduct: {},
  submissions: {}
});

const buildStateDocument = ({
  users,
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions
}, { includeUpdatedAt = true } = {}) => ({
  schemaVersion: REMOTE_SCHEMA_VERSION,
  ...(includeUpdatedAt ? { updatedAt: Date.now() } : {}),
  usersById: Object.fromEntries(users.map((user) => [user.id, user])),
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions
});

const buildStateSnapshot = (state) => JSON.stringify(buildStateDocument(state, { includeUpdatedAt: false }));

const buildRemoteUserIndexRecord = (user) => {
  const normalized = normalizeUser(user);
  return {
    id: normalized.id,
    nome: normalized.nome || '',
    nomeKey: normalized.nomeKey || normalizeUserNameKey(normalized.nome || ''),
    senha: normalized.senha || '',
    role: normalized.role || 'participant'
  };
};

const buildRemoteUserProfileRecord = (user) => ({
  avatar: user?.avatar || ''
});

const buildRemoteUsersIndex = (users = []) => Object.fromEntries(
  users.map((user) => {
    const normalized = normalizeUser(user);
    return [String(normalized.id), buildRemoteUserIndexRecord(normalized)];
  })
);

const parseRemotePayload = (payload) => {
  const fallback = createInitialAppState();
  if (!payload || typeof payload !== 'object') return fallback;

  const users = Object.values(payload.usersById || {}).map(normalizeUser);
  const normalizedGameData = normalizePersistedGameData(payload.matches, payload.betsGames);

  return {
    users,
    matches: Array.isArray(payload.matches) && payload.matches.length ? normalizedGameData.matches : fallback.matches,
    betsGames: normalizedGameData.betsGames,
    betsKnockout: payload.betsKnockout || {},
    officialKnockout: payload.officialKnockout || {},
    conduct: payload.conduct || {},
    submissions: payload.submissions || {}
  };
};

const getRemotePathUrl = (path) => `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${path}`;
const getRemoteUserShardPath = (prefix, userId) => `${prefix}/${userId}`;

const fetchRemoteEntry = async (path) => {
  const response = await fetch(getRemotePathUrl(path));
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Falha ao ler base online (${response.status})`);
  return response.json();
};

const fetchLegacyRemoteState = async () => fetchRemoteEntry(REMOTE_LEGACY_STATE_PATH);

const fetchShardedRemoteState = async () => {
  const [metaDoc, usersIndexDoc, matchesDoc, officialKnockoutDoc, conductDoc] = await Promise.all([
    fetchRemoteEntry(REMOTE_PATHS.meta),
    fetchRemoteEntry(REMOTE_PATHS.usersIndex),
    fetchRemoteEntry(REMOTE_PATHS.matches),
    fetchRemoteEntry(REMOTE_PATHS.officialKnockout),
    fetchRemoteEntry(REMOTE_PATHS.conduct)
  ]);

  const hasShardState = [metaDoc, usersIndexDoc, matchesDoc, officialKnockoutDoc, conductDoc].some((entry) => entry !== null);
  if (!hasShardState) return null;

  const usersIndex = usersIndexDoc && typeof usersIndexDoc === 'object' && !Array.isArray(usersIndexDoc) ? usersIndexDoc : {};
  const userIds = Array.from(new Set([
    ...Object.keys(usersIndex),
    ...((metaDoc?.userIds || []).map((userId) => String(userId)))
  ]));

  const [userProfiles, betsGamesDocs, betsKnockoutDocs, submissionsDocs] = await Promise.all([
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.userProfiles, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsGames, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, userId)))),
    Promise.all(userIds.map((userId) => fetchRemoteEntry(getRemoteUserShardPath(REMOTE_PATHS.submissions, userId))))
  ]);

  const usersById = {};
  const betsGames = {};
  const betsKnockout = {};
  const submissions = {};

  userIds.forEach((userId, index) => {
    const userCore = usersIndex[userId];
    if (userCore) {
      usersById[userId] = normalizeUser({
        ...userCore,
        ...(userProfiles[index] || {})
      });
    }
    if (betsGamesDocs[index] && typeof betsGamesDocs[index] === 'object') {
      betsGames[userId] = betsGamesDocs[index];
    }
    if (betsKnockoutDocs[index] && typeof betsKnockoutDocs[index] === 'object') {
      betsKnockout[userId] = betsKnockoutDocs[index];
    }
    if (submissionsDocs[index] && typeof submissionsDocs[index] === 'object') {
      submissions[userId] = submissionsDocs[index];
    }
  });

  return {
    schemaVersion: metaDoc?.schemaVersion || REMOTE_SCHEMA_VERSION,
    updatedAt: metaDoc?.updatedAt || 0,
    usersById,
    matches: Array.isArray(matchesDoc) ? matchesDoc : [],
    betsGames,
    betsKnockout,
    officialKnockout: officialKnockoutDoc || {},
    conduct: conductDoc || {},
    submissions,
    __authoritative: {
      users: usersIndexDoc !== null,
      matches: matchesDoc !== null,
      officialKnockout: officialKnockoutDoc !== null,
      conduct: conductDoc !== null
    }
  };
};

const mergeRemoteRecordMap = (baseMap = {}, overrideMap = {}) => ({
  ...(baseMap && typeof baseMap === 'object' ? baseMap : {}),
  ...(overrideMap && typeof overrideMap === 'object' ? overrideMap : {})
});

const mergeRemotePayloads = (legacyPayload, shardedPayload) => {
  if (!legacyPayload) return shardedPayload;
  if (!shardedPayload) return legacyPayload;

  const authoritative = shardedPayload.__authoritative || {};

  return {
    schemaVersion: shardedPayload.schemaVersion || legacyPayload.schemaVersion || REMOTE_SCHEMA_VERSION,
    updatedAt: Math.max(legacyPayload.updatedAt || 0, shardedPayload.updatedAt || 0),
    usersById: authoritative.users
      ? (shardedPayload.usersById || {})
      : mergeRemoteRecordMap(legacyPayload.usersById, shardedPayload.usersById),
    matches: authoritative.matches
      ? (Array.isArray(shardedPayload.matches) ? shardedPayload.matches : [])
      : (Array.isArray(shardedPayload.matches) && shardedPayload.matches.length ? shardedPayload.matches : legacyPayload.matches),
    betsGames: mergeRemoteRecordMap(legacyPayload.betsGames, shardedPayload.betsGames),
    betsKnockout: mergeRemoteRecordMap(legacyPayload.betsKnockout, shardedPayload.betsKnockout),
    officialKnockout: authoritative.officialKnockout
      ? (shardedPayload.officialKnockout || {})
      : (shardedPayload.officialKnockout || legacyPayload.officialKnockout || {}),
    conduct: authoritative.conduct
      ? (shardedPayload.conduct || {})
      : (shardedPayload.conduct || legacyPayload.conduct || {}),
    submissions: mergeRemoteRecordMap(legacyPayload.submissions, shardedPayload.submissions)
  };
};

const fetchRemoteState = async () => {
  const [legacyPayload, shardedPayload] = await Promise.all([
    fetchLegacyRemoteState(),
    fetchShardedRemoteState()
  ]);

  return mergeRemotePayloads(legacyPayload, shardedPayload);
};

const mergeRemoteState = (baseState, localState, { currentUserId = null, isAdmin = false } = {}) => {
  const baseUsers = Object.fromEntries((baseState.users || []).map((user) => [user.id, normalizeUser(user)]));
  const localUsers = Object.fromEntries((localState.users || []).map((user) => [user.id, normalizeUser(user)]));

  const mergedUsers = isAdmin
    ? Object.values(localUsers)
    : Object.values({
        ...baseUsers,
        ...(currentUserId ? { [currentUserId]: localUsers[currentUserId] || baseUsers[currentUserId] } : {})
      }).filter(Boolean);

  const mergeOwnedRecordMap = (baseMap = {}, localMap = {}) => {
    if (isAdmin) return { ...baseMap };
    const next = { ...baseMap };
    if (currentUserId && Object.prototype.hasOwnProperty.call(localMap || {}, currentUserId)) {
      next[currentUserId] = localMap[currentUserId];
    }
    return next;
  };

  return {
    users: mergedUsers,
    matches: isAdmin ? (localState.matches || baseState.matches || gerarJogosIniciais()) : (baseState.matches || gerarJogosIniciais()),
    betsGames: mergeOwnedRecordMap(baseState.betsGames, localState.betsGames),
    betsKnockout: mergeOwnedRecordMap(baseState.betsKnockout, localState.betsKnockout),
    officialKnockout: isAdmin ? (localState.officialKnockout || baseState.officialKnockout || {}) : (baseState.officialKnockout || {}),
    conduct: isAdmin ? (localState.conduct || baseState.conduct || {}) : (baseState.conduct || {}),
    submissions: mergeOwnedRecordMap(baseState.submissions, localState.submissions)
  };
};

const writeRemoteEntry = async (path, payload) => {
  const response = await fetch(getRemotePathUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falha ao gravar base online (${response.status})`);
  }
};

const writeRemoteState = async (state, { currentUserId = null, isAdmin = false } = {}) => {
  const normalizedUsers = (state.users || []).map(normalizeUser);
  const updatedAt = Date.now();
  const entries = [
    [
      REMOTE_PATHS.meta,
      {
        schemaVersion: REMOTE_SCHEMA_VERSION,
        updatedAt,
        userIds: normalizedUsers.map((user) => user.id)
      }
    ],
    [REMOTE_PATHS.usersIndex, buildRemoteUsersIndex(normalizedUsers)]
  ];

  if (isAdmin || !currentUserId) {
    entries.push(
      [REMOTE_PATHS.matches, state.matches || []],
      [REMOTE_PATHS.officialKnockout, state.officialKnockout || {}],
      [REMOTE_PATHS.conduct, state.conduct || {}]
    );
  }

  if (!isAdmin || !currentUserId) {
    const scopedUserIds = currentUserId ? [currentUserId] : normalizedUsers.map((user) => user.id);
    scopedUserIds.forEach((userId) => {
      const normalizedId = String(userId);
      const user = normalizedUsers.find((candidate) => String(candidate.id) === normalizedId);
      if (!user) return;

      entries.push(
        [getRemoteUserShardPath(REMOTE_PATHS.userProfiles, normalizedId), buildRemoteUserProfileRecord(user)],
        [getRemoteUserShardPath(REMOTE_PATHS.betsGames, normalizedId), state.betsGames?.[userId] || {}],
        [getRemoteUserShardPath(REMOTE_PATHS.betsKnockout, normalizedId), state.betsKnockout?.[userId] || {}],
        [getRemoteUserShardPath(REMOTE_PATHS.submissions, normalizedId), state.submissions?.[userId] || {}]
      );
    });
  }

  await Promise.all(entries.map(([path, payload]) => writeRemoteEntry(path, payload)));
  return updatedAt;
};

const syncRemoteStateWithPatch = async (localState, options = {}) => {
  const remotePayload = await fetchRemoteState();
  const mergedState = mergeRemoteState(
    remotePayload ? parseRemotePayload(remotePayload) : createInitialAppState(),
    localState,
    options
  );
  const updatedAt = await writeRemoteState(mergedState, options);
  return { mergedState, updatedAt };
};

const readPendingSync = () => {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SYNC_KEY) || 'null');
  } catch {
    return null;
  }
};

const savePendingSync = (pending) => {
  localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify({
    ...pending,
    savedAt: Date.now()
  }));
};

const clearPendingSync = () => {
  localStorage.removeItem(PENDING_SYNC_KEY);
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
  reader.readAsDataURL(file);
});

const getSerializedSize = (value) => new TextEncoder().encode(String(value || '')).length;

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('Não foi possível abrir a imagem.'));
  image.src = src;
});

const processAvatarFile = async (file) => {
  if (!file) throw new Error('Selecione um arquivo JPG ou PNG.');
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    throw new Error('Use apenas JPG ou PNG.');
  }
  if (file.size > AVATAR_MAX_FILE_BYTES) {
    throw new Error('O arquivo precisa ter no máximo 2 MB.');
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(1, AVATAR_MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.88;
  let output = canvas.toDataURL('image/webp', quality);

  while (getSerializedSize(output) > AVATAR_MAX_OUTPUT_BYTES && quality > 0.45) {
    quality -= 0.08;
    output = canvas.toDataURL('image/webp', quality);
  }

  if (getSerializedSize(output) > AVATAR_MAX_OUTPUT_BYTES) {
    throw new Error('A imagem ficou grande demais mesmo após compactar.');
  }

  return output;
};

const uploadAvatarAsset = async ({ dataUrl, userId, userName }) => {
  if (!dataUrl) return { avatar: '', avatarKey: '' };
  if (!AVATAR_UPLOAD_URL) {
    return { avatar: dataUrl, avatarKey: '' };
  }

  const response = await fetch(AVATAR_UPLOAD_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      userName,
      contentType: 'image/webp',
      fileName: `avatar-${userId || Date.now()}.webp`,
      imageDataUrl: dataUrl
    })
  });

  if (!response.ok) {
    throw new Error(`Falha ao enviar imagem (${response.status})`);
  }

  const payload = await response.json();
  const avatarUrl = payload.avatarUrl
    || payload.url
    || (payload.key && AVATAR_PUBLIC_BASE_URL ? `${AVATAR_PUBLIC_BASE_URL.replace(/\/$/, '')}/${payload.key}` : '');

  if (!avatarUrl) {
    throw new Error('Upload concluído sem URL do avatar.');
  }

  return {
    avatar: avatarUrl,
    avatarKey: payload.avatarKey || payload.key || ''
  };
};

const normalizeUserNameKey = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

const normalizeUser = (user) => {
  if (!user) return user;
  const nome = user.nome || '';
  const nomeKey = user.nomeKey || normalizeUserNameKey(nome);
  const role = user.role || ((user.id === ADMIN_USER_ID || nomeKey === 'admin') ? 'admin' : 'participant');
  return { ...user, nomeKey, role, avatar: user.avatar || '' };
};

const isAdminUser = (user) => user?.role === 'admin' || user?.id === ADMIN_USER_ID;
const findUserByName = (users, inputName) => users.find((user) => user.nomeKey === normalizeUserNameKey(inputName));

const formatSubmissionDate = (timestamp) => {
  if (!timestamp) return 'Rascunho';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(timestamp));
};

const formatBrazilMatchSchedule = (match) => {
  if (match?.kickoffEt) {
    const kickoff = new Date(match.kickoffEt);
    const parts = new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(kickoff);

    const getPart = (type) => parts.find((part) => part.type === type)?.value || '00';
    const day = Number(getPart('day'));
    const month = Number(getPart('month'));
    const time = `${getPart('hour')}:${getPart('minute')}`;

    return {
      day,
      month,
      time,
      label: `${day}/${month} - ${time} BR`
    };
  }

  const [day = '01', month = '01'] = String(match?.data || '01/01').split('/');
  return {
    day: Number(day),
    month: Number(month),
    time: match?.hora || '00:00',
    label: `${Number(day)}/${Number(month)} - ${match?.hora || '00:00'} BR`
  };
};

const formatOfficialKickoffHint = (match) => {
  if (!match?.kickoffEt || !match?.horaEt) return null;
  return `Oficial FIFA: ${match.horaEt} ET`;
};

const parseMatchDateTime = (match) => {
  if (match?.kickoffEt) {
    return new Date(match.kickoffEt).getTime();
  }

  const [day, month] = String(match.data || '01/01').split('/').map(Number);
  const [hour, minute] = String(match.hora || '00:00').split(':').map(Number);
  return new Date(2026, (month || 1) - 1, day || 1, hour || 0, minute || 0).getTime();
};

const AvatarBadge = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-[11px] lg:w-8 lg:h-8 lg:text-xs',
    md: 'w-9 h-9 text-sm lg:w-11 lg:h-11 lg:text-base',
    lg: 'w-14 h-14 text-lg lg:w-[68px] lg:h-[68px] lg:text-[22px]'
  };

  const sizeClass = sizes[size] || sizes.md;
  const initials = (user?.nome || '?').trim().charAt(0).toUpperCase();

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.nome}
        className={`${sizeClass} rounded-full border border-white/70 object-cover shadow-lg ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg border border-white/60 ${className}`}>
      {initials}
    </div>
  );
};

// --- ESTILOS LIGHT ---
const GLASS_CARD = "rounded-[28px] border border-slate-200/80 bg-white shadow-[0_18px_60px_-28px_rgba(15,23,42,0.25)]";
const GLASS_INPUT = "rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:border-sky-400 focus:bg-white focus:outline-none transition-all disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400";
const GLASS_BTN_PRIMARY = "bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-semibold shadow-[0_16px_40px_-18px_rgba(14,116,144,0.55)] rounded-xl transition-all active:scale-95";
const GLASS_BTN_SECONDARY = "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-all active:scale-95";
const TEXT_MUTED = "text-slate-600";
const TEXT_HIGHLIGHT = "text-slate-800";

// --- SUB-COMPONENTES UI ---
const LoginScreen = ({ onLogin, onRefreshUsers, users, syncStatus = 'online', syncError = '', isDemoMode = false }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !password.trim()) { setError('Preencha nome e senha'); return; }
    if (normalizeUserNameKey(name) === 'admin') {
      if (password === 'qwer') { onLogin(999, 'Admin', 'qwer'); return; } 
      else { setError('Senha de Administrador incorreta.'); return; }
    }

    let availableUsers = users;
    let existingUser = findUserByName(availableUsers, name);

    if ((!existingUser || isRegistering) && onRefreshUsers) {
      setAuthLoading(true);
      try {
        availableUsers = await onRefreshUsers();
        existingUser = findUserByName(availableUsers, name);
      } catch (refreshError) {
        setError(refreshError.message || 'Não foi possível atualizar a lista de usuários.');
        setAuthLoading(false);
        return;
      }
      setAuthLoading(false);
    }

    if (isRegistering) {
      if (existingUser) {
        setError('Nome já existe. Tente fazer login.');
      } else {
        const newUserId = Date.now();
        setAuthLoading(true);
        try {
          const uploadedAvatar = avatarPreview
            ? await uploadAvatarAsset({ dataUrl: avatarPreview, userId: newUserId, userName: name.trim() })
            : { avatar: '', avatarKey: '' };

          onLogin(newUserId, name.trim(), password.trim(), {
            avatar: uploadedAvatar.avatar,
            avatarKey: uploadedAvatar.avatarKey
          });
        } catch (uploadError) {
          setError(uploadError.message || 'Não foi possível enviar a imagem.');
        } finally {
          setAuthLoading(false);
        }
      }
    } else {
      if (existingUser) {
        if (existingUser.senha === password.trim()) { onLogin(existingUser.id, existingUser.nome, existingUser.senha, existingUser); } 
        else { setError('Senha incorreta.'); }
      } else { setError('Usuário não encontrado. Crie uma conta.'); }
    }
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setAvatarLoading(true);
    setError('');

    try {
      const avatar = await processAvatarFile(file);
      setAvatarPreview(avatar);
    } catch (avatarError) {
      setError(avatarError.message || 'Não foi possível preparar a imagem.');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-4 py-6 text-slate-900 font-sans sm:px-6">
      <div className="w-full max-w-md space-y-4">
      <div className={`${GLASS_CARD} w-full p-6 md:p-8 relative overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_70%)]"></div>
        <div className="flex justify-center mb-6">
          <div className="bg-sky-50 p-4 rounded-full shadow-inner border border-sky-100">
            <Trophy size={40} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight text-slate-900">BOLÃO 2026</h1>
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noreferrer"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 transition-colors hover:bg-emerald-100"
        >
          <MessageCircle size={16} />
          Entrar no grupo do WhatsApp
        </a>
        {!isDemoMode && (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] font-semibold text-slate-700">Base online</span>
              <span className={`text-[11px] font-bold ${
                syncStatus === 'online'
                  ? 'text-emerald-600'
                  : syncStatus === 'syncing' || syncStatus === 'connecting'
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }`}>
                {syncStatus === 'online' && 'Online'}
                {syncStatus === 'syncing' && 'Sincronizando'}
                {syncStatus === 'connecting' && 'Conectando'}
                {syncStatus === 'offline' && 'Falha de sync'}
              </span>
            </div>
            {syncError && <div className="mt-2 text-[11px] text-rose-600">{syncError}</div>}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Nome de Usuário</label>
            <div className="relative"><User size={18} className={`absolute left-3.5 top-4 ${TEXT_MUTED}`} /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Fera Braba" className={`${GLASS_INPUT} min-h-13 w-full pl-11 p-3.5 text-base`}/></div>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Senha</label>
            <div className="relative"><Lock size={18} className={`absolute left-3.5 top-4 ${TEXT_MUTED}`} /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha secreta" className={`${GLASS_INPUT} min-h-13 w-full pl-11 pr-12 p-3.5 text-base`}/><button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3.5 top-3.5 rounded-full p-1 hover:text-slate-800 transition-colors ${TEXT_MUTED}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {isRegistering && (
            <div className="space-y-3">
              <label className={`text-[10px] font-bold uppercase ml-1 block ${TEXT_MUTED}`}>Imagem do Perfil</label>
              <div className="flex items-center gap-3">
                <AvatarBadge user={{ nome: name || 'Novo usuário', avatar: avatarPreview }} size="lg" />
                <div className="flex-1">
                  <label className={`${GLASS_BTN_SECONDARY} flex min-h-12 cursor-pointer items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest`}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarChange} />
                    {avatarLoading ? 'Processando...' : avatarPreview ? 'Trocar imagem' : 'Escolher imagem'}
                  </label>
                  <p className={`mt-2 text-[11px] ${TEXT_MUTED}`}>JPG ou PNG, até 2 MB.</p>
                </div>
              </div>
            </div>
          )}
          {error && <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-200"><AlertCircle size={14} /> {error}</div>}
          <button type="submit" disabled={authLoading} className={`${GLASS_BTN_PRIMARY} w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}>{authLoading ? 'Verificando...' : isRegistering ? 'Criar Conta' : 'Entrar'} <ArrowRight size={18} /></button>
        </form>
        <div className="mt-8 text-center"><button onClick={() => { setIsRegistering(!isRegistering); setError(''); setAvatarPreview(''); }} className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 hover:decoration-slate-700">{isRegistering ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Criar nova.'}</button></div>
      </div>
      </div>
    </div>
  );
};

export default function App() {
  const isDemoMode = useMemo(() => new URLSearchParams(window.location.search).get('demo') === 'planilha', []);
  const [currentUser, setCurrentUser] = useState(null); 
  const [abaAtiva, setAbaAtiva] = useState('jogos');
  const [secaoExpandida, setSecaoExpandida] = useState('r32');
  const [alocacaoTerceiros, setAlocacaoTerceiros] = useState({});
  const [resetConfirm, setResetConfirm] = useState(false);
  const [userDeleteConfirmId, setUserDeleteConfirmId] = useState(null);
  const [reviewMode, setReviewMode] = useState('jogos');
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewGroupFilter, setReviewGroupFilter] = useState('todos');
  const [reviewPhaseFilter, setReviewPhaseFilter] = useState('todos');
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isDemoMode ? 'demo' : 'connecting');
  const [syncError, setSyncError] = useState('');
  const avatarInputRef = useRef(null);
  const remoteReadyRef = useRef(false);
  const remoteUpdatedAtRef = useRef(0);
  const skipNextRemoteSyncRef = useRef(false);
  const remoteSnapshotRef = useRef('');
  const pendingSyncTimeoutRef = useRef(null);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL
    }).catch((error) => {
      console.error('Falha ao registrar service worker', error);
    });

    return undefined;
  }, []);

  const [bootstrapState] = useState(() => {
    const savedUsers = JSON.parse(localStorage.getItem('bolao26_users')) || [];
    const savedMatches = JSON.parse(localStorage.getItem('bolao26_matches')) || [];
    const savedBetsGames = JSON.parse(localStorage.getItem('bolao26_bets_games')) || {};
    const normalizedGameData = normalizePersistedGameData(savedMatches, savedBetsGames);

    return {
      users: savedUsers.map(normalizeUser),
      matches: savedMatches.length ? normalizedGameData.matches : gerarJogosIniciais(),
      betsGames: savedMatches.length ? normalizedGameData.betsGames : savedBetsGames
    };
  });

  const [usuarios, setUsuarios] = useState(() => bootstrapState.users);
  const [jogosReais, setJogosReais] = useState(() => bootstrapState.matches);
  const [palpitesJogos, setPalpitesJogos] = useState(() => bootstrapState.betsGames);
  const [palpitesMataMata, setPalpitesMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_bets_knockout_v2')) || {});
  const [gabaritoMataMata, setGabaritoMataMata] = useState(() => JSON.parse(localStorage.getItem('bolao26_official_knockout_v2')) || {});
  const [condutaGrupos, setCondutaGrupos] = useState(() => JSON.parse(localStorage.getItem('bolao26_group_conduct')) || {});
  const [submissoes, setSubmissoes] = useState(() => JSON.parse(localStorage.getItem('bolao26_submissions')) || {});

  useEffect(() => { localStorage.setItem('bolao26_users', JSON.stringify(usuarios)); }, [usuarios]);
  useEffect(() => { localStorage.setItem('bolao26_matches', JSON.stringify(jogosReais)); }, [jogosReais]);
  useEffect(() => { localStorage.setItem('bolao26_bets_games', JSON.stringify(palpitesJogos)); }, [palpitesJogos]);
  useEffect(() => { localStorage.setItem('bolao26_bets_knockout_v2', JSON.stringify(palpitesMataMata)); }, [palpitesMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_official_knockout_v2', JSON.stringify(gabaritoMataMata)); }, [gabaritoMataMata]);
  useEffect(() => { localStorage.setItem('bolao26_group_conduct', JSON.stringify(condutaGrupos)); }, [condutaGrupos]);
  useEffect(() => { localStorage.setItem('bolao26_submissions', JSON.stringify(submissoes)); }, [submissoes]);

  const applyAppState = (nextState, nextUpdatedAt = Date.now()) => {
    skipNextRemoteSyncRef.current = true;
    setUsuarios((nextState.users || []).map(normalizeUser));
    setJogosReais(nextState.matches || gerarJogosIniciais());
    setPalpitesJogos(nextState.betsGames || {});
    setPalpitesMataMata(nextState.betsKnockout || {});
    setGabaritoMataMata(nextState.officialKnockout || {});
    setCondutaGrupos(nextState.conduct || {});
    setSubmissoes(nextState.submissions || {});
    remoteUpdatedAtRef.current = nextUpdatedAt;
    remoteSnapshotRef.current = buildStateSnapshot({
      users: (nextState.users || []).map(normalizeUser),
      matches: nextState.matches || gerarJogosIniciais(),
      betsGames: nextState.betsGames || {},
      betsKnockout: nextState.betsKnockout || {},
      officialKnockout: nextState.officialKnockout || {},
      conduct: nextState.conduct || {},
      submissions: nextState.submissions || {}
    });
    setCurrentUser((current) => {
      if (!current) return current;
      const updatedUser = (nextState.users || []).find((user) => user.id === current.id);
      return updatedUser ? normalizeUser(updatedUser) : current;
    });
  };

  useEffect(() => {
    if (!isDemoMode) return;
    const demo = buildPlanilhaDemoData();
    applyAppState({
      users: demo.users,
      matches: demo.matches,
      betsGames: demo.betsGames,
      betsKnockout: demo.betsKnockout,
      officialKnockout: demo.officialKnockout,
      conduct: demo.conduct,
      submissions: demo.submissions
    });
    setCurrentUser(demo.adminUser);
    setAbaAtiva('painel');
    setReviewMode('jogos');
    setReviewSearch('');
    setReviewGroupFilter('todos');
    setReviewPhaseFilter('todos');
    setSyncStatus('demo');
  }, [isDemoMode]);

  const flushPendingSync = async () => {
    if (isDemoMode || syncInFlightRef.current) return;
    const pending = readPendingSync();
    if (!pending?.state) return;

    syncInFlightRef.current = true;
    try {
      setSyncStatus('syncing');
      setSyncError('');
      const syncResult = await syncRemoteStateWithPatch(pending.state, pending.options || {});
      remoteUpdatedAtRef.current = syncResult.updatedAt || Date.now();
      remoteSnapshotRef.current = pending.snapshot || buildStateSnapshot(syncResult.mergedState || pending.state);
      clearPendingSync();
      setSyncStatus('online');
    } catch (error) {
      setSyncStatus('offline');
      setSyncError(error.message || 'Falha ao salvar dados online.');
    } finally {
      syncInFlightRef.current = false;
    }
  };

  useEffect(() => {
    if (isDemoMode) return;

    let cancelled = false;

    const bootstrapRemoteState = async () => {
      try {
        setSyncStatus('connecting');
        setSyncError('');
        const remotePayload = await fetchRemoteState();
        if (cancelled) return;

        if (!remotePayload) {
          const initialState = mergeRemoteState(createInitialAppState(), {
            users: bootstrapState.users,
            matches: bootstrapState.matches,
            betsGames: bootstrapState.betsGames,
            betsKnockout: JSON.parse(localStorage.getItem('bolao26_bets_knockout_v2')) || {},
            officialKnockout: JSON.parse(localStorage.getItem('bolao26_official_knockout_v2')) || {},
            conduct: JSON.parse(localStorage.getItem('bolao26_group_conduct')) || {},
            submissions: JSON.parse(localStorage.getItem('bolao26_submissions')) || {}
          });
          const initialUpdatedAt = await writeRemoteState(initialState);
          if (cancelled) return;
          applyAppState(initialState, initialUpdatedAt);
          remoteReadyRef.current = true;
          setSyncStatus('online');
          if (readPendingSync()) flushPendingSync();
          return;
        }

        applyAppState(parseRemotePayload(remotePayload), remotePayload.updatedAt || Date.now());
        remoteReadyRef.current = true;
        setSyncStatus('online');
        if (readPendingSync()) flushPendingSync();
      } catch (error) {
        if (cancelled) return;
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao conectar com a base online.');
      }
    };

    bootstrapRemoteState();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode || !remoteReadyRef.current) return;

    const intervalId = window.setInterval(async () => {
      try {
        if (readPendingSync()) return;
        const remotePayload = await fetchRemoteState();
        if (!remotePayload) return;
        const remoteUpdatedAt = remotePayload.updatedAt || 0;
        if (remoteUpdatedAt <= remoteUpdatedAtRef.current) return;
        applyAppState(parseRemotePayload(remotePayload), remoteUpdatedAt);
        setSyncStatus('online');
        setSyncError('');
      } catch (error) {
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao atualizar dados online.');
      }
    }, REMOTE_POLL_MS);

    return () => window.clearInterval(intervalId);
  }, [isDemoMode]);

  useEffect(() => {
    if (isDemoMode) return undefined;

    const handleOnline = () => { flushPendingSync(); };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') flushPendingSync();
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isDemoMode]);

  const modoAdmin = isAdminUser(currentUser); 

  useEffect(() => {
    if (isDemoMode || !remoteReadyRef.current) return;
    if (skipNextRemoteSyncRef.current) {
      skipNextRemoteSyncRef.current = false;
      return;
    }

    const snapshot = buildStateSnapshot({
      users: usuarios,
      matches: jogosReais,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      officialKnockout: gabaritoMataMata,
      conduct: condutaGrupos,
      submissions: submissoes
    });

    if (snapshot === remoteSnapshotRef.current) return;

    const pending = {
      state: {
        users: usuarios,
        matches: jogosReais,
        betsGames: palpitesJogos,
        betsKnockout: palpitesMataMata,
        officialKnockout: gabaritoMataMata,
        conduct: condutaGrupos,
        submissions: submissoes
      },
      options: { currentUserId: currentUser?.id || null, isAdmin: modoAdmin },
      snapshot
    };

    savePendingSync(pending);

    if (pendingSyncTimeoutRef.current) {
      window.clearTimeout(pendingSyncTimeoutRef.current);
    }

    pendingSyncTimeoutRef.current = window.setTimeout(() => {
      flushPendingSync();
    }, SYNC_DEBOUNCE_MS);

    return () => {
      if (pendingSyncTimeoutRef.current) {
        window.clearTimeout(pendingSyncTimeoutRef.current);
        pendingSyncTimeoutRef.current = null;
      }
    };
  }, [isDemoMode, usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata, condutaGrupos, submissoes]);

  const palpitesUsuarioAtual = currentUser ? palpitesJogos[currentUser.id] : undefined;
  const palpitesMataUsuarioAtual = currentUser ? (palpitesMataMata[currentUser.id] || {}) : {};
  const gruposCompletos = currentUser ? faseDeGruposCompleta(jogosReais, modoAdmin ? undefined : palpitesUsuarioAtual) : false;
  const jogosEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.JOGOS] : null;
  const mataEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.MATA] : null;
  const palpitesTravadosJogos = !modoAdmin && Boolean(jogosEnviadosAt);
  const palpitesTravadosMata = !modoAdmin && Boolean(mataEnviadosAt);
  const jogosPendentesUsuario = currentUser ? contarJogosPendentes(jogosReais, palpitesUsuarioAtual) : 0;
  const currentUserCanSeeConsensusPanel = modoAdmin || (
    Boolean(jogosEnviadosAt) &&
    Boolean(mataEnviadosAt) &&
    usuarioPreencheuTodosOsJogos(jogosReais, palpitesUsuarioAtual) &&
    usuarioPreencheuMataCompleta(palpitesMataUsuarioAtual)
  );
  const participanteUsuarios = useMemo(
    () => usuarios.filter((user) => !isAdminUser(user)),
    [usuarios]
  );

  useEffect(() => {
    if (!currentUser) return;
    if (!gruposCompletos) {
      setAlocacaoTerceiros({});
      return;
    }
    setAlocacaoTerceiros(
      buildThirdPlaceAllocation(
        jogosReais,
        modoAdmin ? undefined : palpitesUsuarioAtual,
        condutaGrupos,
        gruposCompletos
      )
    );
  }, [jogosReais, palpitesUsuarioAtual, condutaGrupos, currentUser, gruposCompletos]);

  useEffect(() => {
    setPalpitesMataMata((current) => {
      let changed = false;
      const next = { ...current };

      participanteUsuarios.forEach((user) => {
        const sanitized = sanitizeKnockoutBracket({
          bracket: current[user.id] || {},
          jogos: jogosReais,
          palpitesUsuario: palpitesJogos[user.id],
          condutaGrupos
        });

        if (JSON.stringify(current[user.id] || createEmptyKnockoutBracket()) !== JSON.stringify(sanitized)) {
          next[user.id] = sanitized;
          changed = true;
        }
      });

      return changed ? next : current;
    });
  }, [participanteUsuarios, jogosReais, palpitesJogos, condutaGrupos]);

  useEffect(() => {
    setGabaritoMataMata((current) => {
      const sanitized = sanitizeKnockoutBracket({
        bracket: current,
        jogos: jogosReais,
        palpitesUsuario: undefined,
        condutaGrupos
      });

      return JSON.stringify(current) === JSON.stringify(sanitized) ? current : sanitized;
    });
  }, [jogosReais, condutaGrupos]);

  const handleLogin = (id, nome, senha, extraUser = {}) => {
    const normalizedUser = normalizeUser({ id, nome, senha, ...extraUser });

    if (isAdminUser(normalizedUser) && !usuarios.find(isAdminUser)) {
      setUsuarios([...usuarios, normalizedUser]);
    } else if (!usuarios.find(u => u.id === id)) {
      setUsuarios([...usuarios, normalizedUser]); 
    }
    setCurrentUser(normalizedUser);
  };

  const refreshUsersForLogin = async () => {
    const remotePayload = await fetchRemoteState();
    if (!remotePayload) return usuarios;
    const nextState = parseRemotePayload(remotePayload);
    applyAppState(nextState, remotePayload.updatedAt || Date.now());
    return nextState.users || [];
  };

  const handleLogout = () => setCurrentUser(null);
  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!currentUser || !file) return;

    setAvatarLoading(true);
    setAvatarError('');

    try {
      const preparedAvatar = await processAvatarFile(file);
      const uploadedAvatar = await uploadAvatarAsset({
        dataUrl: preparedAvatar,
        userId: currentUser.id,
        userName: currentUser.nome
      });
      const updatedUser = {
        ...currentUser,
        avatar: uploadedAvatar.avatar,
        avatarKey: uploadedAvatar.avatarKey || currentUser.avatarKey || ''
      };

      setUsuarios((current) => current.map((user) => (
        user.id === currentUser.id
          ? { ...user, avatar: uploadedAvatar.avatar, avatarKey: uploadedAvatar.avatarKey || user.avatarKey || '' }
          : user
      )));
      setCurrentUser(updatedUser);
    } catch (error) {
      setAvatarError(error.message || 'Não foi possível salvar a imagem.');
    } finally {
      setAvatarLoading(false);
    }
  };
  const handleRemoveAvatar = () => {
    if (!currentUser) return;
    setAvatarError('');
    setUsuarios((current) => current.map((user) => (
      user.id === currentUser.id ? { ...user, avatar: '', avatarKey: '' } : user
    )));
    setCurrentUser((current) => ({ ...current, avatar: '', avatarKey: '' }));
  };
  const atualizarJogo = (id, c, v) => setJogosReais(p => p.map(j => j.id === id ? { ...j, [c]: v } : j));
  const atualizarPalpite = (id, c, v) => {
    if (palpitesTravadosJogos) return;
    setPalpitesJogos(p => ({ ...p, [currentUser.id]: { ...(p[currentUser.id] || {}), [id]: { ...(p[currentUser.id]?.[id] || { placarA: '', placarB: '' }), [c]: v } } }));
  };
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
    if (palpitesTravadosMata && !modoAdmin) return;
    const setter = modoAdmin ? setGabaritoMataMata : setPalpitesMataMata;
    setter(p => {
      const root = modoAdmin ? p : (p[currentUser.id] || {});
      const val = i !== null ? [...(root[c] || [])] : v;
      if (i !== null) val[i] = v;
      const updatedRoot = { ...root, [c]: val };
      const sanitizedRoot = sanitizeKnockoutBracket({
        bracket: updatedRoot,
        jogos: jogosReais,
        palpitesUsuario: modoAdmin ? undefined : palpitesJogos[currentUser.id],
        condutaGrupos
      });

      return modoAdmin ? sanitizedRoot : { ...p, [currentUser.id]: sanitizedRoot };
    });
  };

  const handleSubmitSection = async (field) => {
    if (!currentUser || modoAdmin) return;
    if (field === SUBMISSION_FIELDS.MATA && !jogosEnviadosAt) return;

    const nextSubmissoes = {
      ...submissoes,
      [currentUser.id]: {
        ...(submissoes[currentUser.id] || {}),
        [field]: Date.now()
      }
    };

    const nextState = {
      users: usuarios,
      matches: jogosReais,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      officialKnockout: gabaritoMataMata,
      conduct: condutaGrupos,
      submissions: nextSubmissoes
    };

    try {
      setSyncStatus('syncing');
      setSyncError('');
      const syncResult = await syncRemoteStateWithPatch(nextState, { currentUserId: currentUser.id, isAdmin: modoAdmin });
      remoteUpdatedAtRef.current = syncResult.updatedAt || Date.now();
      remoteSnapshotRef.current = buildStateSnapshot(syncResult.mergedState || nextState);
      clearPendingSync();
      setSubmissoes(nextSubmissoes);
      setSyncStatus('online');
    } catch (error) {
      setSyncStatus('offline');
      setSyncError(error.message || 'Falha ao salvar dados online.');
    }
  };

  const handleReset = async () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }

    const initialState = createInitialAppState();
    if (!isDemoMode) {
      try {
        await writeRemoteState(initialState);
      } catch (error) {
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao resetar a base online.');
        return;
      }
    }

    localStorage.clear();
    window.location.reload();
  };

  const handleDeleteUser = (userId) => {
    const targetUser = usuarios.find((user) => user.id === userId);
    if (!modoAdmin || isAdminUser(targetUser)) return;

    if (userDeleteConfirmId !== userId) {
      setUserDeleteConfirmId(userId);
      setTimeout(() => setUserDeleteConfirmId((current) => (current === userId ? null : current)), 3000);
      return;
    }

    setUsuarios((current) => current.filter((user) => user.id !== userId));
    setPalpitesJogos((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setPalpitesMataMata((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setSubmissoes((current) => {
      const next = { ...current };
      delete next[userId];
      return next;
    });
    setUserDeleteConfirmId(null);
  };

  const RankingTable = () => {
    const ranking = useMemo(() => {
      const rankingEntries = usuarios.filter((user) => !isAdminUser(user)).map(user => {
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
      });

      return buildCompetitionRanking(rankingEntries, (user) => user.total, (user) => user.nome);
    }, [usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata]);

    const consensusDashboard = useMemo(() => {
      if (!currentUserCanSeeConsensusPanel) return null;
      return buildConsensusDashboard({
        users: usuarios,
        submissions: submissoes,
        betsGames: palpitesJogos,
        betsKnockout: palpitesMataMata,
        games: jogosReais,
        ranking,
        teamRankings: TEAM_FIFA_RANKINGS,
        submissionFields: SUBMISSION_FIELDS,
        isAdminUser,
        usuarioPreencheuTodosOsJogos,
        usuarioPreencheuMataCompleta
      });
    }, [currentUserCanSeeConsensusPanel, usuarios, submissoes, palpitesJogos, palpitesMataMata, jogosReais, ranking]);

    return (
      <div className="space-y-4 animate-fade-in">
        <div className={`${GLASS_CARD} p-4 text-center`}>
          <p className={`text-xs ${TEXT_MUTED}`}>A pontuação só aparece quando o <strong className="text-slate-900">Admin</strong> preenche os resultados.</p>
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
                    <AvatarBadge user={user} size="sm" className="lg:w-12 lg:h-12 lg:text-base" />
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
      </div>
    );
  };

  const ReviewSheet = () => {
    const searchTerm = reviewSearch.trim().toLowerCase();
    const isGameMode = reviewMode === 'jogos';
    const usersFiltrados = [...participanteUsuarios]
      .filter((user) => !searchTerm || user.nome.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    const participantColumnCount = Math.max(usersFiltrados.length, 1);
    const reviewSummaryWidth = isGameMode ? 268 : 282;
    const participantColumnMinWidth = isGameMode ? 142 : 148;
    const reviewGridTemplate = `${reviewSummaryWidth}px repeat(${participantColumnCount}, minmax(${participantColumnMinWidth}px, 1fr))`;
    const reviewDescription = isGameMode
      ? 'Cada confronto fica resumido na primeira coluna, deixando mais espaço para comparar os placares dos participantes.'
      : 'Cada vaga do mata-mata e do pódio fica condensada numa coluna-resumo, com foco total na leitura dos apostadores.';
    const reviewSubmissionField = isGameMode ? SUBMISSION_FIELDS.JOGOS : SUBMISSION_FIELDS.MATA;

    const buildStatus = (variant) => {
      if (variant === 'cravou') return { label: 'Cravou', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
      if (variant === 'winner') return { label: 'Acertou vencedor', tone: 'border-sky-200 bg-sky-50 text-sky-700', dot: 'bg-sky-500' };
      if (variant === 'correct') return { label: 'Acertou', tone: 'border-emerald-200 bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
      if (variant === 'error') return { label: 'Errou', tone: 'border-rose-200 bg-rose-50 text-rose-700', dot: 'bg-rose-500' };
      if (variant === 'waiting-real') return { label: 'Aguardando real', tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
      if (variant === 'waiting-official') return { label: 'Aguardando oficial', tone: 'border-amber-200 bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
      return { label: 'Sem palpite', tone: 'border-slate-200 bg-slate-50 text-slate-500', dot: 'bg-slate-400' };
    };

    const renderParticipantCard = (palpite) => (
      <div className={`rounded-[18px] border px-2 py-2.5 text-center shadow-[0_14px_24px_-24px_rgba(15,23,42,0.95)] ${palpite.status.tone}`}>
        <div className="text-base font-black tracking-[-0.04em] text-slate-900 leading-none">{palpite.palpite}</div>
        <div className="mt-1.5 inline-flex items-center justify-center gap-1.5 rounded-full border border-black/5 bg-white/80 px-2 py-0.5">
          <span className={`h-2.5 w-2.5 rounded-full ${palpite.status.dot}`}></span>
          <span className="text-[9px] font-bold uppercase tracking-[0.16em]">{palpite.status.label}</span>
        </div>
        <div className="mt-1.5 text-[10px] font-bold text-slate-700">{palpite.pontos} pts</div>
        <div className="mt-1 text-[9px] leading-tight text-slate-400">{palpite.envio}</div>
      </div>
    );

    const jogosFiltrados = jogosReais
      .filter((jogo) => reviewGroupFilter === 'todos' || jogo.grupo === reviewGroupFilter)
      .sort((a, b) => (
        parseMatchDateTime(a) - parseMatchDateTime(b) ||
        a.grupo.localeCompare(b.grupo, 'pt-BR') ||
        a.id - b.id
      ));

    const gameRows = jogosFiltrados.map((jogo) => {
      const realPreenchido = placarPreenchido(jogo.placarA, jogo.placarB);
      const schedule = formatBrazilMatchSchedule(jogo);

      return {
        id: jogo.id,
        grupo: jogo.grupo,
        dataHora: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
        local: jogo.local,
        timeA: jogo.timeA,
        timeB: jogo.timeB,
        real: realPreenchido ? `${jogo.placarA} x ${jogo.placarB}` : '—',
        palpites: usersFiltrados.map((user) => {
          const palpite = palpitesJogos[user.id]?.[jogo.id];
          const palpitePreenchido = placarPreenchido(palpite?.placarA, palpite?.placarB);
          const resultado = palpitePreenchido && realPreenchido
            ? calcularPontosJogo(palpite.placarA, palpite.placarB, jogo.placarA, jogo.placarB)
            : null;

          let status = buildStatus();
          if (palpitePreenchido && !realPreenchido) status = buildStatus('waiting-real');
          if (resultado?.pts === PONTOS.JOGO.CHEIO) status = buildStatus('cravou');
          if (resultado?.pts === PONTOS.JOGO.VITORIA) status = buildStatus('winner');
          if (resultado && resultado.pts === 0) status = buildStatus('error');

          return {
            userId: user.id,
            palpite: palpitePreenchido ? `${palpite.placarA} x ${palpite.placarB}` : '—',
            status,
            pontos: resultado?.pts ?? 0,
            envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.JOGOS])
          };
        })
      };
    });

    const groupedGameRows = Object.entries(
      gameRows.reduce((acc, row) => {
        if (!acc[row.grupo]) acc[row.grupo] = [];
        acc[row.grupo].push(row);
        return acc;
      }, {})
    ).sort(([grupoA], [grupoB]) => grupoA.localeCompare(grupoB, 'pt-BR'));

    const knockoutPhaseOptions = [
      { id: 'r32', label: '32-avos' },
      { id: 'r16', label: 'Oitavas' },
      { id: 'qf', label: 'Quartas' },
      { id: 'sf', label: 'Semifinais' },
      { id: 'podio', label: 'Pódio final' }
    ];

    const resolveKnockoutSides = (phaseKey, match) => {
      if (phaseKey === 'dezeszeseisavos' && match?.label?.includes(' x ')) {
        const [sideA, sideB] = match.label.split(' x ');
        return { sideA, sideB };
      }

      return {
        sideA: getWinnerOfMatch(match.feedA, gabaritoMataMata) || `Venc. ${match.feedA}`,
        sideB: getWinnerOfMatch(match.feedB, gabaritoMataMata) || `Venc. ${match.feedB}`
      };
    };

    const buildKnockoutPalpites = ({ official, points, getter }) => usersFiltrados.map((user) => {
      const palpite = getter(palpitesMataMata[user.id] || {});
      const preenchido = Boolean(palpite);
      const pontos = preenchido && official !== '—' && palpite === official ? points : 0;
      let status = buildStatus();
      if (preenchido && official === '—') status = buildStatus('waiting-official');
      if (pontos > 0) status = buildStatus('correct');
      if (preenchido && official !== '—' && pontos === 0) status = buildStatus('error');

      return {
        userId: user.id,
        palpite: palpite || '—',
        status,
        pontos,
        envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.MATA])
      };
    });

    const knockoutSections = [
      { id: 'r32', title: '32-avos de final', phaseKey: 'dezeszeseisavos', points: PONTOS.MATA.R32, list: MATA_MATA_CONFIG.r32 },
      { id: 'r16', title: 'Oitavas de final', phaseKey: 'oitavas', points: PONTOS.MATA.R16, list: MATA_MATA_CONFIG.r16 },
      { id: 'qf', title: 'Quartas de final', phaseKey: 'quartas', points: PONTOS.MATA.QF, list: MATA_MATA_CONFIG.qf },
      { id: 'sf', title: 'Semifinais', phaseKey: 'semis', points: PONTOS.MATA.SF, list: MATA_MATA_CONFIG.sf }
    ].map((section) => ({
      ...section,
      rows: section.list.map((match, idx) => {
        const schedule = formatBrazilMatchSchedule(match);
        const { sideA, sideB } = resolveKnockoutSides(section.phaseKey, match);
        const official = gabaritoMataMata[section.phaseKey]?.[idx] || '—';

        return {
          id: `${section.id}-${match.id}`,
          kind: 'match',
          metaTop: section.title,
          metaBottom: `${schedule.day}/${schedule.month} • ${schedule.time} BR`,
          metaNote: match.local,
          matchupTitle: `Jogo ${match.id}`,
          matchupSubtitle: `${section.points} pts em jogo`,
          sideA,
          sideB,
          official,
          officialMeta: official === '—' ? 'Aguardando definição' : `${section.points} pts`,
          palpites: buildKnockoutPalpites({
            official,
            points: section.points,
            getter: (userMata) => userMata[section.phaseKey]?.[idx]
          })
        };
      })
    }));

    const finalInfo = MATA_MATA_CONFIG.final[0];
    const bronzeInfo = MATA_MATA_CONFIG.bronzeFinal[0];
    const finalSchedule = formatBrazilMatchSchedule(finalInfo);
    const bronzeSchedule = formatBrazilMatchSchedule(bronzeInfo);

    const podiumSection = {
      id: 'podio',
      title: 'Pódio final',
      rows: [
        {
          id: 'campeao',
          metaTop: 'Pódio final',
          metaBottom: `${finalSchedule.day}/${finalSchedule.month} • ${finalSchedule.time} BR`,
          metaNote: finalInfo.local,
          matchupTitle: 'Campeão',
          matchupSubtitle: 'Escolha o vencedor da final',
          official: gabaritoMataMata.campeao || '—',
          officialMeta: `${PONTOS.MATA.CAMPEAO} pts`,
          points: PONTOS.MATA.CAMPEAO,
          field: 'campeao'
        },
        {
          id: 'vice',
          metaTop: 'Pódio final',
          metaBottom: `${finalSchedule.day}/${finalSchedule.month} • ${finalSchedule.time} BR`,
          metaNote: finalInfo.local,
          matchupTitle: 'Vice',
          matchupSubtitle: 'Derrotado da final',
          official: gabaritoMataMata.vice || '—',
          officialMeta: `${PONTOS.MATA.VICE} pts`,
          points: PONTOS.MATA.VICE,
          field: 'vice'
        },
        {
          id: 'terceiro',
          metaTop: 'Pódio final',
          metaBottom: `${bronzeSchedule.day}/${bronzeSchedule.month} • ${bronzeSchedule.time} BR`,
          metaNote: bronzeInfo.local,
          matchupTitle: '3º lugar',
          matchupSubtitle: 'Vencedor da disputa do bronze',
          official: gabaritoMataMata.terceiro || '—',
          officialMeta: `${PONTOS.MATA.TOP3} pts`,
          points: PONTOS.MATA.TOP3,
          field: 'terceiro'
        },
        {
          id: 'quarto',
          metaTop: 'Pódio final',
          metaBottom: `${bronzeSchedule.day}/${bronzeSchedule.month} • ${bronzeSchedule.time} BR`,
          metaNote: bronzeInfo.local,
          matchupTitle: '4º lugar',
          matchupSubtitle: 'Derrotado da disputa do bronze',
          official: gabaritoMataMata.quarto || '—',
          officialMeta: `${PONTOS.MATA.TOP4} pts`,
          points: PONTOS.MATA.TOP4,
          field: 'quarto'
        }
      ].map((row) => ({
        ...row,
        kind: 'podium',
        palpites: buildKnockoutPalpites({
          official: row.official,
          points: row.points,
          getter: (userMata) => userMata[row.field]
        })
      }))
    };

    const groupedKnockoutRows = [...knockoutSections, podiumSection]
      .filter((section) => reviewPhaseFilter === 'todos' || section.id === reviewPhaseFilter);

    const linhas = isGameMode ? gameRows : groupedKnockoutRows.flatMap((section) => section.rows);
    const reviewCountLabel = isGameMode
      ? `${linhas.length} jogo${linhas.length === 1 ? '' : 's'} visíveis`
      : `${linhas.length} linha${linhas.length === 1 ? '' : 's'} da chave`;
    const usersFiltradosById = Object.fromEntries(usersFiltrados.map((user) => [user.id, user]));

    const renderSummaryCell = (row) => {
      if (isGameMode) {
        return (
          <div className="rounded-[14px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] px-2.5 py-2 shadow-[0_10px_20px_-22px_rgba(15,23,42,0.4)]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-sky-700">Grupo {row.grupo} • {row.dataHora}</div>
              </div>
              <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
                <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">Oficial</span>
                {row.real}
              </div>
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              <span>Jogo {row.id}</span>
              <span className="text-slate-300">•</span>
              <span>Até {PONTOS.JOGO.CHEIO} pts</span>
            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-slate-900">
              <span className="truncate">{row.timeA}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">x</span>
              <span className="truncate">{row.timeB}</span>
            </div>

            <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-500">
              <span className="truncate">{row.local}</span>
              <span className="truncate text-right font-semibold">{row.real === '—' ? 'Aguardando definição' : 'Placar oficial'}</span>
            </div>
          </div>
        );
      }

      return (
        <div className="rounded-[14px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfbff_100%)] px-2.5 py-2 shadow-[0_10px_20px_-22px_rgba(15,23,42,0.4)]">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-700">{row.metaTop} • {row.metaBottom}</div>
            </div>
            <div className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-black text-slate-900 shadow-sm">
              <span className="mr-1 text-[8px] font-bold uppercase tracking-[0.18em] text-slate-400">Oficial</span>
              {row.official}
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            <span>{row.matchupTitle}</span>
            <span className="text-slate-300">•</span>
            <span>{row.kind === 'match' ? row.officialMeta : row.matchupSubtitle}</span>
          </div>

          {row.kind === 'match' ? (
            <div className="mt-1.5 flex items-center gap-2 text-[13px] font-bold text-slate-900">
              <span className="truncate">{row.sideA}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">x</span>
              <span className="truncate">{row.sideB}</span>
            </div>
          ) : (
            <div className="mt-1.5 text-[13px] font-bold text-slate-900">{row.matchupSubtitle}</div>
          )}

          <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-500">
            <span className="truncate">{row.metaNote}</span>
            {row.kind === 'match' && <span className="shrink-0 font-semibold text-slate-500">{row.official === '—' ? 'Aguardando definição' : row.officialMeta}</span>}
          </div>
        </div>
      );
    };

    const renderMobileParticipantRow = (palpite) => {
      const user = usersFiltradosById[palpite.userId];
      return (
        <div key={palpite.userId} className="flex items-center gap-3 px-3 py-2.5">
          <AvatarBadge user={user} size="sm" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[12px] font-bold text-slate-800">{user?.nome || 'Participante'}</div>
            <div className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
              <span className={`h-2 w-2 rounded-full ${palpite.status.dot}`}></span>
              <span className="truncate">{palpite.status.label}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[15px] font-black tracking-[-0.03em] text-slate-900">{palpite.palpite}</div>
            <div className="mt-0.5 text-[10px] font-semibold text-slate-600">{palpite.pontos} pts</div>
            <div className="mt-0.5 text-[9px] text-slate-400">{palpite.envio}</div>
          </div>
        </div>
      );
    };

    const renderMobileRowCard = (row) => (
      <div key={row.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_16px_32px_-28px_rgba(15,23,42,0.38)]">
        <div className="p-3">
          {renderSummaryCell(row)}
        </div>
        <div className="border-t border-slate-100 bg-slate-50/55">
          {row.palpites.map((palpite, index) => (
            <div key={`${row.id}-${palpite.userId}`} className={index > 0 ? 'border-t border-slate-100' : ''}>
              {renderMobileParticipantRow(palpite)}
            </div>
          ))}
        </div>
      </div>
    );

    return (
      <div className="space-y-4 animate-fade-in">
        <div className={`${GLASS_CARD} p-4 space-y-3 lg:p-4`}>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-[15px] font-black uppercase tracking-[0.12em] text-slate-900">Planilha de Palpites</h3>
              <p className={`mt-1 max-w-4xl text-[12px] leading-snug ${TEXT_MUTED}`}>{reviewDescription}</p>
            </div>
            <div className="flex gap-2 rounded-full bg-slate-100 p-1 self-start">
              <button onClick={() => setReviewMode('jogos')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'jogos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Fase de Grupos</button>
              <button onClick={() => setReviewMode('mata')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'mata' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Mata-mata</button>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                <span className="font-black text-slate-900">{usersFiltrados.length}</span>
                {usersFiltrados.length === 1 ? 'apostador' : 'apostadores'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                <span className="font-black text-slate-900">{linhas.length}</span>
                {reviewCountLabel}
              </span>
            </div>
            <div className="grid gap-2 lg:min-w-[520px] lg:grid-cols-[minmax(0,1fr)_210px]">
              <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Filtrar participantes por nome" className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`} />
              <select
                value={isGameMode ? reviewGroupFilter : reviewPhaseFilter}
                onChange={(e) => isGameMode ? setReviewGroupFilter(e.target.value) : setReviewPhaseFilter(e.target.value)}
                className={`${GLASS_INPUT} min-h-12 px-3 py-2.5 text-base`}
              >
                <option value="todos">{isGameMode ? 'Todos os grupos' : 'Todas as fases'}</option>
                {(isGameMode
                  ? Object.keys(GRUPOS_2026).map((grupo) => ({ id: grupo, label: `Grupo ${grupo}` }))
                  : knockoutPhaseOptions
                ).map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold text-slate-500">
            <span className="text-[11px] text-slate-500">Legenda:</span>
            {reviewMode === 'jogos' && (
              <>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Cravou</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Acertou vencedor</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando real</span>
              </>
            )}
            {reviewMode === 'mata' && (
              <>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Acertou</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2.5 py-1 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando oficial</span>
              </>
            )}
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Sem palpite</span>
          </div>
          <div className={`text-[11px] ${TEXT_MUTED}`}>
            Arraste na horizontal para comparar os apostadores.
          </div>
        </div>

        <div className="space-y-4 lg:hidden">
          {linhas.length === 0 && (
            <div className={`${GLASS_CARD} px-4 py-10 text-center text-slate-400`}>Nenhum registro encontrado com os filtros atuais.</div>
          )}

          {reviewMode === 'jogos' ? (
            <>
              {groupedGameRows.map(([grupo, rows]) => (
                <div key={grupo} className="space-y-3">
                  <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                    Grupo {grupo}
                  </div>
                  <div className="space-y-3">
                    {rows.map((row) => renderMobileRowCard(row))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {groupedKnockoutRows.map((section) => (
                <div key={section.id} className="space-y-3">
                  <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                    {section.title}
                  </div>
                  <div className="space-y-3">
                    {section.rows.map((row) => renderMobileRowCard(row))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        <div className={`${GLASS_CARD} hidden overflow-hidden lg:block`}>
          <div className="max-h-[calc(100vh-220px)] overflow-auto overscroll-contain">
            <div className="min-w-max text-xs bg-white">
              <div
                className="sticky top-0 z-40 grid border-b border-slate-200 bg-slate-50/95 text-[10px] uppercase text-slate-500 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.55)] backdrop-blur"
                style={{ gridTemplateColumns: reviewGridTemplate }}
              >
                <div className="sticky left-0 z-50 border-r border-slate-200 bg-slate-50/95 px-4 py-3 font-bold backdrop-blur">Resumo do confronto</div>
                {usersFiltrados.map((user) => (
                  <div key={user.id} className="border-r border-slate-100 px-2 py-2.5 text-center last:border-r-0">
                    <div className="flex items-center justify-center gap-2">
                      <AvatarBadge user={user} size="sm" className="lg:w-12 lg:h-12 lg:text-base" />
                      <div className="max-w-[96px] truncate font-bold normal-case text-[11px] text-slate-700">{user.nome}</div>
                    </div>
                    <div className="mt-0.5 text-[9px] font-semibold text-slate-400">
                      {submissoes[user.id]?.[reviewSubmissionField] ? 'Enviado' : 'Rascunho'}
                    </div>
                  </div>
                ))}
              </div>

              {linhas.length === 0 && (
                <div className="px-4 py-10 text-center text-slate-400">Nenhum registro encontrado com os filtros atuais.</div>
              )}

              {reviewMode === 'jogos' ? (
                <>
                  {groupedGameRows.map(([grupo, rows]) => (
                    <div key={grupo} className="border-b border-slate-100 last:border-0">
                      <div className="border-b border-slate-200 bg-white px-4 py-3">
                        <div className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-sky-700">
                          Grupo {grupo}
                        </div>
                      </div>

                      {rows.map((row) => (
                        <div
                          key={row.id}
                          className="grid border-b border-slate-100 bg-white last:border-0"
                          style={{ gridTemplateColumns: reviewGridTemplate }}
                        >
                          <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2.5 py-2.5">
                            {renderSummaryCell(row)}
                          </div>

                          {row.palpites.map((palpite) => (
                            <div key={`${row.id}-${palpite.userId}`} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
                              {renderParticipantCard(palpite)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {groupedKnockoutRows.map((section) => (
                    <div key={section.id} className="border-b border-slate-100 last:border-0">
                      <div className="border-b border-slate-200 bg-white px-4 py-3">
                        <div className="inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-violet-700">
                          {section.title}
                        </div>
                      </div>

                      {section.rows.map((row) => (
                        <div
                          key={row.id}
                          className="grid border-b border-slate-100 bg-white last:border-0"
                          style={{ gridTemplateColumns: reviewGridTemplate }}
                        >
                          <div className="sticky left-0 z-20 border-r border-slate-200 bg-white px-2.5 py-2.5">
                            {renderSummaryCell(row)}
                          </div>

                          {row.palpites.map((palpite) => (
                            <div key={`${row.id}-${palpite.userId}`} className="border-r border-slate-100 px-2 py-3 last:border-r-0">
                              {renderParticipantCard(palpite)}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TabelaClassificacao = ({ grupo }) => {
    const tabela = calcularTabelaGrupo(grupo, jogosReais, palpitesJogos[currentUser.id], condutaGrupos);
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
          <span className="shrink-0 rounded-full bg-blue-400/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">{modoAdmin ? 'Oficial' : 'Simulada'}</span>
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
              let posColor = "";
              if (idx < 2) posColor = "border-l-2 border-l-green-500 bg-green-500/5";
              else if (idx === 2) posColor = "border-l-2 border-l-yellow-500 bg-yellow-500/5";
              else posColor = "border-l-2 border-l-transparent opacity-50";
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
    const isLocked = !modoAdmin && palpitesTravadosMata;
    let feedback = null;
    if (!modoAdmin && gabaritoMataMata[phaseKey]?.[idx]) {
      const officialWinner = gabaritoMataMata[phaseKey][idx];
      if (currentValue === officialWinner) { feedback = <div className="text-center text-[10px] bg-green-500/20 text-green-400 font-bold border border-green-500/30 rounded-lg p-1.5 mb-3 backdrop-blur-sm">Acertou!</div>; } 
      else { feedback = <div className="text-center text-[10px] bg-red-500/20 text-red-400 font-bold border border-red-500/30 rounded-lg p-1.5 mb-3 backdrop-blur-sm">Errou (Era {officialWinner})</div>; }
    }
    const schedule = formatBrazilMatchSchedule(match);
    const officialKickoffHint = formatOfficialKickoffHint(match);

    return (
      <div className={`${GLASS_CARD} p-4 mb-3 ${(!isReady || isLocked) && 'opacity-60'}`}>
        <div className={`flex justify-between items-start text-[10px] font-bold uppercase mb-3 ${TEXT_MUTED} gap-3`}>
          <div className="flex flex-col gap-1">
            <span>{schedule.day}/{schedule.month} • {schedule.time} BR</span>
            {officialKickoffHint && <span className="text-[9px] font-semibold normal-case text-slate-400">{officialKickoffHint}</span>}
          </div>
          <div className="text-right">
            <div>{match.local}</div>
            <div className="mt-1 text-[9px] font-semibold text-slate-400">Jogo {match.id}</div>
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-bold truncate max-w-[45%] text-right ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{timeA}</span>
          <span className={`text-[10px] px-2 ${TEXT_MUTED}`}>vs</span>
          <span className={`text-xs font-bold truncate max-w-[45%] text-left ${isReady ? 'text-slate-800' : TEXT_MUTED}`}>{timeB}</span>
        </div>
        {feedback}
        <div className="relative">
          {(!isReady || isLocked) && <Lock size={12} className={`absolute left-3 top-4 ${TEXT_MUTED}`} />}
          <select value={currentValue || ""} onChange={(e) => atualizarMataMata(phaseKey, e.target.value, idx)} disabled={!isReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base font-medium appearance-none ${(!isReady || isLocked) && 'pl-8 text-slate-400'}`}>
            <option value="">{isLocked ? "Palpite enviado" : isReady ? "Quem vence?" : "Defina os anteriores"}</option>{isReady && <><option value={timeA}>{timeA}</option><option value={timeB}>{timeB}</option></>}
          </select>
          {!isLocked && isReady && <ChevronDown size={14} className={`absolute right-3 top-4 pointer-events-none ${TEXT_MUTED}`} />}
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

    return (
      <div className={`${GLASS_CARD} mb-3 transition-all ${secaoExpandida === 'podium' ? 'ring-1 ring-yellow-500/50' : ''}`}>
        <button onClick={() => setSecaoExpandida(secaoExpandida === 'podium' ? null : 'podium')} className="flex min-h-13 w-full items-center justify-between bg-gradient-to-r from-yellow-500/10 to-transparent p-4"><div className="flex items-center gap-3"><Crown className="text-yellow-500" size={18} /><span className="font-bold text-sm text-slate-900 uppercase tracking-wide">Pódio Final</span></div>{secaoExpandida === 'podium' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        {secaoExpandida === 'podium' && (
          <div className="space-y-4 border-t border-slate-200 p-4">
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
                <select value={dataSource.campeao || ""} onChange={e => { atualizarMataMata('campeao', e.target.value, null); const vice = finalistas.find(f => f !== e.target.value); if (vice) atualizarMataMata('vice', vice, null); }} disabled={!isFinalReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base border-yellow-500/30 focus:border-yellow-500 text-slate-800`}>
                  <option value="">Quem será Campeão?</option>{isFinalReady && finalistas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {dataSource.vice && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>Vice: <span className="text-slate-800">{dataSource.vice}</span> {renderFeedback('vice')}</div>}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="mb-3 block text-center text-[10px] font-bold uppercase text-orange-700">3º Lugar {renderFeedback('terceiro')}</label>
              <div className={`${GLASS_CARD} bg-orange-50/60 p-4`}>
                <select value={dataSource.terceiro || ""} onChange={e => { atualizarMataMata('terceiro', e.target.value, null); const quarto = disputantes3.find(t => t !== e.target.value); if (quarto) atualizarMataMata('quarto', quarto, null); }} disabled={!is3rdReady || isLocked} className={`${GLASS_INPUT} min-h-12 w-full p-3 text-base border-orange-500/30 focus:border-orange-500 text-slate-800`}>
                  <option value="">Quem fica em 3º?</option>{is3rdReady && disputantes3.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {dataSource.quarto && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>4º Lugar: <span className="text-slate-800">{dataSource.quarto}</span> {renderFeedback('quarto')}</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onRefreshUsers={refreshUsersForLogin}
        users={usuarios}
        syncStatus={syncStatus}
        syncError={syncError}
        isDemoMode={isDemoMode}
      />
    );
  }

  const navItems = [
    { id: 'jogos', icon: Calendar, label: 'Fase de Grupos' },
    { id: 'matamata', icon: Crown, label: 'Mata-mata' },
    { id: 'ranking', icon: Trophy, label: 'Ranking' },
    { id: 'painel', icon: Medal, label: 'Painel' },
    { id: 'regras', icon: List, label: 'Pontuação' }
  ];

  return (
    <div className="app-shell min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] text-slate-900 font-sans pb-28 lg:pb-10">
      <header className="app-topbar sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <AvatarBadge user={currentUser} size="md" />
          <div><h1 className="text-sm font-bold text-slate-900 leading-tight">{currentUser.nome}</h1><p className={`text-[10px] font-medium tracking-wide ${TEXT_MUTED}`}>{modoAdmin ? 'ADMINISTRADOR' : 'Participante'}</p></div>
        </div>
        <button onClick={handleLogout} className={`min-h-11 min-w-11 rounded-full p-2.5 hover:bg-slate-100 transition-colors ${TEXT_MUTED} hover:text-slate-800`}><LogOut size={18} /></button>
      </header>

      <main className="mx-auto max-w-[1720px] px-4 py-4 lg:grid lg:grid-cols-[244px_minmax(0,1fr)] lg:gap-6 lg:px-6 xl:px-8 lg:py-8">
        <aside className="hidden lg:block">
          <div className="sticky top-8 space-y-5">
            <div className={`${GLASS_CARD} p-5`}>
              <div className="flex items-center gap-4">
                <AvatarBadge user={currentUser} size="lg" />
                <div className="min-w-0">
                  <h1 className="truncate text-base font-bold text-slate-900">{currentUser.nome}</h1>
                  <p className={`mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${TEXT_MUTED}`}>{modoAdmin ? 'Administrador' : 'Participante'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900">
                <LogOut size={14} />
                Sair
              </button>
            </div>

            <div className={`${GLASS_CARD} p-3`}>
              <div className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = abaAtiva === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setAbaAtiva(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                        active
                          ? 'bg-sky-600 text-white shadow-[0_18px_40px_-24px_rgba(2,132,199,0.9)]'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 max-w-xl mx-auto w-full lg:max-w-none">
        {!isDemoMode && (
          <div className={`${GLASS_CARD} mb-5 px-4 py-3`}>
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold text-slate-700">Base online</div>
              <div className={`text-[11px] font-bold ${
                syncStatus === 'online'
                  ? 'text-emerald-600'
                  : syncStatus === 'syncing' || syncStatus === 'connecting'
                    ? 'text-amber-600'
                    : 'text-rose-600'
              }`}>
                {syncStatus === 'online' && 'Online'}
                {syncStatus === 'syncing' && 'Sincronizando'}
                {syncStatus === 'connecting' && 'Conectando'}
                {syncStatus === 'offline' && 'Falha de sync'}
              </div>
            </div>
            {syncError && <div className="mt-2 text-[11px] text-rose-600">{syncError}</div>}
          </div>
        )}
        {!modoAdmin && (
          <div className={`${GLASS_CARD} p-5 mb-5`}>
            <div className="flex items-center gap-4">
              <AvatarBadge user={currentUser} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-bold text-slate-900">Sua foto no bolão</div>
                <div className={`mt-1 text-xs ${TEXT_MUTED}`}>JPG ou PNG, até 2 MB. A imagem é reduzida automaticamente.</div>
                {avatarError && <div className="mt-2 text-xs text-rose-600">{avatarError}</div>}
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={handleAvatarSelected}
              />
              <button
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarLoading}
                className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {avatarLoading ? 'Enviando...' : currentUser.avatar ? 'Trocar imagem' : 'Enviar imagem'}
              </button>
              {currentUser.avatar && (
                <button onClick={handleRemoveAvatar} className={`${GLASS_BTN_SECONDARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest`}>
                  Remover
                </button>
              )}
            </div>
          </div>
        )}
        {abaAtiva === 'jogos' && (
          <div className="space-y-8 animate-fade-in">
            {!modoAdmin && (
              <div className={`${GLASS_CARD} p-5 flex flex-col gap-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Envio da fase de grupos</h3>
                    <p className={`text-xs mt-1 ${TEXT_MUTED}`}>Depois de enviar, seus placares desta etapa ficam travados.</p>
                  </div>
                  {palpitesTravadosJogos && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Check size={12} /> Enviado</span>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`text-xs ${TEXT_MUTED}`}>
                    {palpitesTravadosJogos
                      ? `Enviado em ${formatSubmissionDate(jogosEnviadosAt)}`
                      : jogosPendentesUsuario > 0
                        ? `Faltam ${jogosPendentesUsuario} jogo${jogosPendentesUsuario === 1 ? '' : 's'} para liberar o envio.`
                        : 'Tudo pronto para enviar.'}
                  </span>
                  {!palpitesTravadosJogos && (
                    <button
                      onClick={() => handleSubmitSection(SUBMISSION_FIELDS.JOGOS)}
                      disabled={!usuarioPreencheuTodosOsJogos(jogosReais, palpitesUsuarioAtual)}
                      className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Enviar palpites
                    </button>
                  )}
                </div>
              </div>
            )}
            {modoAdmin && <div className="bg-red-50 text-red-500 text-xs p-3 rounded-xl text-center border border-red-200 font-bold">MODO GABARITO ATIVO</div>}
            {Object.keys(GRUPOS_2026).map(grupo => (
              <div key={grupo} className="relative">
                <h3 className="mb-4 pl-3 border-l-2 border-yellow-500 text-[15px] font-bold tracking-wide text-slate-700">GRUPO {grupo}</h3>
                <TabelaClassificacao grupo={grupo} />
                <div className="space-y-3">
                  {jogosReais.filter(j => j.grupo === grupo).map(jogo => {
                    const palpite = palpitesJogos[currentUser.id]?.[jogo.id] || { placarA: '', placarB: '' };
                    const valA = modoAdmin ? jogo.placarA : palpite.placarA;
                    const valB = modoAdmin ? jogo.placarB : palpite.placarB;
                    const schedule = formatBrazilMatchSchedule(jogo);
                    const officialKickoffHint = formatOfficialKickoffHint(jogo);
                    return (
                      <div key={jogo.id} className={`${GLASS_CARD} p-4`}>
                        <div className="mb-4 flex flex-col gap-2 text-[11px] font-bold uppercase text-slate-500 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex flex-col gap-1 min-w-0">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {schedule.day}/{schedule.month} • {schedule.time} BR</span>
                            {officialKickoffHint && <span className="text-[10px] font-semibold normal-case text-slate-500">{officialKickoffHint}</span>}
                          </div>
                          <span className="w-fit rounded-full bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{jogo.local}</span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
                          <span className="text-right text-[13px] font-bold leading-tight text-slate-800 sm:text-[14px]">{jogo.timeA}</span>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" inputMode="numeric" disabled={palpitesTravadosJogos && !modoAdmin} value={valA} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarA', e.target.value) : atualizarPalpite(jogo.id, 'placarA', e.target.value)} className={`${GLASS_INPUT} h-12 w-12 text-center text-base font-bold`} />
                            <span className="text-sm text-slate-500 font-light">X</span>
                            <input type="number" min="0" inputMode="numeric" disabled={palpitesTravadosJogos && !modoAdmin} value={valB} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarB', e.target.value) : atualizarPalpite(jogo.id, 'placarB', e.target.value)} className={`${GLASS_INPUT} h-12 w-12 text-center text-base font-bold`} />
                          </div>
                          <span className="text-left text-[13px] font-bold leading-tight text-slate-800 sm:text-[14px]">{jogo.timeB}</span>
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
            {!modoAdmin && (
              <div className={`${GLASS_CARD} p-5 flex flex-col gap-4`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Envio do mata-mata</h3>
                    <p className={`text-xs mt-1 ${TEXT_MUTED}`}>Quando você enviar, chaves e pódio final não poderão mais ser alterados.</p>
                  </div>
                  {palpitesTravadosMata && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><Check size={12} /> Enviado</span>}
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className={`text-xs ${TEXT_MUTED}`}>{palpitesTravadosMata ? `Enviado em ${formatSubmissionDate(mataEnviadosAt)}` : jogosEnviadosAt ? 'Complete toda a chave e o pódio para enviar.' : 'Envie a fase de grupos antes de liberar o envio do mata-mata.'}</span>
                  {!palpitesTravadosMata && (
                    <button
                      onClick={() => handleSubmitSection(SUBMISSION_FIELDS.MATA)}
                      disabled={!jogosEnviadosAt || !usuarioPreencheuMataCompleta(palpitesMataUsuarioAtual)}
                      className={`${GLASS_BTN_PRIMARY} min-h-12 px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      Enviar mata-mata
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 bg-sky-50 p-4 rounded-2xl border border-sky-200 mb-6">
              <div className="bg-white p-2 rounded-full border border-sky-100"><Calculator className="text-sky-500" size={18} /></div>
              <p className="text-[11px] text-sky-900 leading-snug">Seus palpites da fase de grupos preenchem automaticamente os confrontos abaixo.</p>
            </div>
            {[
              { id: 'r32', title: '32-avos (Top 32)', list: MATA_MATA_CONFIG.r32, key: 'dezeszeseisavos', pts: PONTOS.MATA.R32 },
              { id: 'r16', title: 'Oitavas de Final', list: MATA_MATA_CONFIG.r16, key: 'oitavas', pts: PONTOS.MATA.R16 },
              { id: 'qf', title: 'Quartas de Final', list: MATA_MATA_CONFIG.qf, key: 'quartas', pts: PONTOS.MATA.QF },
              { id: 'sf', title: 'Semifinais', list: MATA_MATA_CONFIG.sf, key: 'semis', pts: PONTOS.MATA.SF }
            ].map(section => (
              <div key={section.id}>
                <button onClick={() => setSecaoExpandida(secaoExpandida === section.id ? null : section.id)} className={`${GLASS_CARD} w-full flex min-h-13 items-center justify-between p-4 mb-2 hover:bg-white/10 transition-colors`}>
                  <span className="text-sm font-bold text-slate-900 tracking-wide">{section.title}</span>
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
        {abaAtiva === 'painel' && <ReviewSheet />}
        
        {abaAtiva === 'regras' && (
          <div className="space-y-6 animate-fade-in">
             <div className={`${GLASS_CARD} p-6`}>
               <h3 className="font-bold text-sm mb-6 text-slate-900 flex items-center gap-2 uppercase tracking-wide"><List size={18} className="text-sky-600"/> Pontuação Detalhada</h3>
               <div className="space-y-4">
                 <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">FASE DE GRUPOS</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Placar Exato</span><span className="font-bold text-emerald-700">{PONTOS.JOGO.CHEIO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Apenas Vencedor</span><span className="font-bold text-amber-700">{PONTOS.JOGO.VITORIA} pts</span></div>
                    <div className="mt-2 text-[10px] text-slate-500 italic p-2 border-l-2 border-rose-300 pl-3">Não há pontos por saldo de gols.</div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">MATA-MATA (POR ACERTO)</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time 16-avos</span><span className="font-bold text-slate-900">{PONTOS.MATA.R32} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Oitavas</span><span className="font-bold text-slate-900">{PONTOS.MATA.R16} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Quartas</span><span className="font-bold text-slate-900">{PONTOS.MATA.QF} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Acertar Time Semis</span><span className="font-bold text-indigo-700">{PONTOS.MATA.SF} pts</span></div>
                 </div>
                 <div className="space-y-2 pt-2">
                    <div className="text-[10px] font-bold text-slate-500 border-b border-slate-200 pb-1 mb-2">PÓDIO FINAL</div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Campeão</span><span className="font-bold text-amber-700">{PONTOS.MATA.CAMPEAO} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>Vice</span><span className="font-bold text-slate-700">{PONTOS.MATA.VICE} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>3º Lugar</span><span className="font-bold text-orange-700">{PONTOS.MATA.TOP3} pts</span></div>
                    <div className="flex justify-between text-xs p-3 bg-white/80 rounded-lg border border-slate-200 text-slate-700"><span>4º Lugar</span><span className="font-bold text-slate-600">{PONTOS.MATA.TOP4} pts</span></div>
                 </div>
               </div>
               <button onClick={handleReset} className={`w-full mt-6 min-h-12 py-4 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all ${resetConfirm ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/40' : 'border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10'}`}><Trash2 size={14} /> {resetConfirm ? 'CLIQUE PARA CONFIRMAR' : 'RESETAR TUDO'}</button>
             </div>
             {modoAdmin && (
               <div className={`${GLASS_CARD} p-6`}>
                 <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900"><User size={18} className="text-red-500" /> Gerenciar Usuários</h3>
                 <p className={`text-xs mb-5 ${TEXT_MUTED}`}>Apague participantes e remova junto os palpites salvos deles. A conta Admin fica protegida.</p>
                 <div className="space-y-3">
                   {usuarios.map((user) => {
                     const adminUser = isAdminUser(user);
                     const isConfirming = userDeleteConfirmId === user.id;
                     return (
                       <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                         <div className="min-w-0">
                           <div className="truncate text-sm font-bold text-slate-900">{user.nome}</div>
                           <div className={`text-[10px] uppercase tracking-wide ${TEXT_MUTED}`}>{adminUser ? 'Administrador protegido' : 'Participante'}</div>
                         </div>
                         <button
                           onClick={() => handleDeleteUser(user.id)}
                           disabled={adminUser}
                           className={`shrink-0 rounded-lg border px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                             adminUser
                               ? 'cursor-not-allowed border-slate-200 bg-white text-slate-300'
                                : isConfirming
                                  ? 'border-red-500 bg-red-600 text-white shadow-lg shadow-red-900/40'
                                  : 'border-red-500/30 bg-red-500/5 text-red-400 hover:bg-red-500/10'
                           }`}
                         >
                           {adminUser ? 'Protegido' : isConfirming ? 'Confirmar exclusão' : 'Apagar'}
                         </button>
                       </div>
                     );
                   })}
                 </div>
               </div>
             )}
          </div>
        )}
        </section>
      </main>

      <nav className="mobile-bottom-nav fixed left-1/2 z-50 flex w-[min(96vw,32rem)] -translate-x-1/2 justify-between gap-1 rounded-[28px] border border-slate-200 bg-white/95 px-2 py-2 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = abaAtiva === item.id;
          return (
            <button key={item.id} onClick={() => setAbaAtiva(item.id)} className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-all ${active ? 'bg-sky-50 text-sky-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}>
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

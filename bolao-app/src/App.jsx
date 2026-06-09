import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Trophy, Calendar, Settings, Plus, User, Trash2, Medal, Crown, List, ChevronDown, ChevronUp, AlertCircle, MapPin, Calculator, Lock, LogOut, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { THIRD_PLACE_ASSIGNMENTS } from './thirdPlaceAssignments';

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
const REMOTE_STATE_PATH = 'state';
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
const AVATAR_MAX_OUTPUT_BYTES = 180 * 1024;
const AVATAR_MAX_DIMENSION = 160;
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

const buildRemotePayload = ({
  users,
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions
}) => ({
  schemaVersion: 2,
  updatedAt: Date.now(),
  usersById: Object.fromEntries(users.map((user) => [user.id, user])),
  matches,
  betsGames,
  betsKnockout,
  officialKnockout,
  conduct,
  submissions
});

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

const remoteStateUrl = `${REMOTE_STORE_BASE}/${REMOTE_NAMESPACE}/${REMOTE_STATE_PATH}`;

const fetchRemoteState = async () => {
  const response = await fetch(remoteStateUrl);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Falha ao ler base online (${response.status})`);
  return response.json();
};

const writeRemoteState = async (payload) => {
  const response = await fetch(remoteStateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Falha ao gravar base online (${response.status})`);
  }
};

const patchRemoteState = async (patch) => {
  const response = await fetch(remoteStateUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...patch,
      updatedAt: Date.now()
    })
  });

  if (response.status === 404) {
    const current = createInitialAppState();
    await writeRemoteState(buildRemotePayload(current));
    return patchRemoteState(patch);
  }

  if (!response.ok) {
    throw new Error(`Falha ao sincronizar base online (${response.status})`);
  }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
  reader.readAsDataURL(file);
});

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

  while (output.length > AVATAR_MAX_OUTPUT_BYTES && quality > 0.45) {
    quality -= 0.08;
    output = canvas.toDataURL('image/webp', quality);
  }

  if (output.length > AVATAR_MAX_OUTPUT_BYTES) {
    throw new Error('A imagem ficou grande demais mesmo após compactar.');
  }

  return output;
};

const normalizeUser = (user) => {
  if (!user) return user;
  const nome = user.nome || '';
  const role = user.role || ((user.id === ADMIN_USER_ID || nome.toLowerCase() === 'admin') ? 'admin' : 'participant');
  return { ...user, role };
};

const isAdminUser = (user) => user?.role === 'admin' || user?.id === ADMIN_USER_ID;

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

const formatMatchMeta = (match) => {
  const schedule = formatBrazilMatchSchedule(match);
  return {
    top: `Grupo ${match.grupo}`,
    bottom: schedule.label
  };
};

const AvatarBadge = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-9 h-9 text-sm',
    lg: 'w-14 h-14 text-lg'
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
const LoginScreen = ({ onLogin, users, syncStatus = 'online', syncError = '', isDemoMode = false }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

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
      else { onLogin(Date.now(), name.trim(), password.trim(), { avatar: avatarPreview }); }
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] text-slate-900 p-6 font-sans">
      <div className={`${GLASS_CARD} w-full max-w-sm p-8 md:p-10 relative overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_70%)]"></div>
        <div className="flex justify-center mb-6">
          <div className="bg-sky-50 p-4 rounded-full shadow-inner border border-sky-100">
            <Trophy size={40} className="text-amber-500" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8 tracking-tight text-slate-900">BOLÃO 2026</h1>
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
            <div className="relative"><User size={18} className={`absolute left-3.5 top-3.5 ${TEXT_MUTED}`} /><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Fera Braba" className={`${GLASS_INPUT} w-full pl-11 p-3.5 text-sm`}/></div>
          </div>
          <div>
            <label className={`text-[10px] font-bold uppercase ml-1 mb-1.5 block ${TEXT_MUTED}`}>Senha</label>
            <div className="relative"><Lock size={18} className={`absolute left-3.5 top-3.5 ${TEXT_MUTED}`} /><input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Sua senha secreta" className={`${GLASS_INPUT} w-full pl-11 pr-11 p-3.5 text-sm`}/><button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3.5 top-3.5 hover:text-slate-800 transition-colors ${TEXT_MUTED}`}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
          </div>
          {isRegistering && (
            <div className="space-y-3">
              <label className={`text-[10px] font-bold uppercase ml-1 block ${TEXT_MUTED}`}>Imagem do Perfil</label>
              <div className="flex items-center gap-3">
                <AvatarBadge user={{ nome: name || 'Novo usuário', avatar: avatarPreview }} size="lg" />
                <div className="flex-1">
                  <label className={`${GLASS_BTN_SECONDARY} flex cursor-pointer items-center justify-center px-4 py-3 text-xs font-bold uppercase tracking-widest`}>
                    <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleAvatarChange} />
                    {avatarLoading ? 'Processando...' : avatarPreview ? 'Trocar imagem' : 'Escolher imagem'}
                  </label>
                  <p className={`mt-2 text-[11px] ${TEXT_MUTED}`}>JPG ou PNG, até 2 MB.</p>
                </div>
              </div>
            </div>
          )}
          {error && <div className="flex items-center gap-2 text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-200"><AlertCircle size={14} /> {error}</div>}
          <button type="submit" className={`${GLASS_BTN_PRIMARY} w-full py-3.5 mt-2 flex items-center justify-center gap-2`}>{isRegistering ? 'Criar Conta' : 'Entrar'} <ArrowRight size={18} /></button>
        </form>
        <div className="mt-8 text-center"><button onClick={() => { setIsRegistering(!isRegistering); setError(''); setAvatarPreview(''); }} className="text-xs text-slate-500 hover:text-slate-800 transition-colors underline decoration-slate-300 hover:decoration-slate-700">{isRegistering ? 'Já tenho conta. Fazer Login.' : 'Não tem conta? Criar nova.'}</button></div>
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
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(isDemoMode ? 'demo' : 'connecting');
  const [syncError, setSyncError] = useState('');
  const avatarInputRef = useRef(null);
  const remoteReadyRef = useRef(false);
  const remoteUpdatedAtRef = useRef(0);
  const skipNextRemoteSyncRef = useRef(false);
  const remoteSnapshotRef = useRef('');

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
    remoteSnapshotRef.current = JSON.stringify(buildRemotePayload({
      users: (nextState.users || []).map(normalizeUser),
      matches: nextState.matches || gerarJogosIniciais(),
      betsGames: nextState.betsGames || {},
      betsKnockout: nextState.betsKnockout || {},
      officialKnockout: nextState.officialKnockout || {},
      conduct: nextState.conduct || {},
      submissions: nextState.submissions || {}
    }));
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
    setSyncStatus('demo');
  }, [isDemoMode]);

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
          const initialState = createInitialAppState();
          await writeRemoteState(buildRemotePayload(initialState));
          if (cancelled) return;
          applyAppState(initialState, Date.now());
          remoteReadyRef.current = true;
          setSyncStatus('online');
          return;
        }

        applyAppState(parseRemotePayload(remotePayload), remotePayload.updatedAt || Date.now());
        remoteReadyRef.current = true;
        setSyncStatus('online');
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
    if (isDemoMode || !remoteReadyRef.current) return;
    if (skipNextRemoteSyncRef.current) {
      skipNextRemoteSyncRef.current = false;
      return;
    }

    const payload = buildRemotePayload({
      users: usuarios,
      matches: jogosReais,
      betsGames: palpitesJogos,
      betsKnockout: palpitesMataMata,
      officialKnockout: gabaritoMataMata,
      conduct: condutaGrupos,
      submissions: submissoes
    });
    const snapshot = JSON.stringify(payload);

    if (snapshot === remoteSnapshotRef.current) return;

    let cancelled = false;

    const syncRemoteState = async () => {
      try {
        setSyncStatus('syncing');
        setSyncError('');
        await writeRemoteState(payload);
        if (cancelled) return;
        remoteUpdatedAtRef.current = payload.updatedAt;
        remoteSnapshotRef.current = snapshot;
        setSyncStatus('online');
      } catch (error) {
        if (cancelled) return;
        setSyncStatus('offline');
        setSyncError(error.message || 'Falha ao salvar dados online.');
      }
    };

    syncRemoteState();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, usuarios, jogosReais, palpitesJogos, palpitesMataMata, gabaritoMataMata, condutaGrupos, submissoes]);

  const modoAdmin = isAdminUser(currentUser); 
  const palpitesUsuarioAtual = currentUser ? palpitesJogos[currentUser.id] : undefined;
  const palpitesMataUsuarioAtual = currentUser ? (palpitesMataMata[currentUser.id] || {}) : {};
  const gruposCompletos = currentUser ? faseDeGruposCompleta(jogosReais, modoAdmin ? undefined : palpitesUsuarioAtual) : false;
  const jogosEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.JOGOS] : null;
  const mataEnviadosAt = currentUser ? submissoes[currentUser.id]?.[SUBMISSION_FIELDS.MATA] : null;
  const palpitesTravadosJogos = !modoAdmin && Boolean(jogosEnviadosAt);
  const palpitesTravadosMata = !modoAdmin && Boolean(mataEnviadosAt);
  const participanteUsuarios = usuarios.filter((user) => !isAdminUser(user));

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

  const handleLogin = (id, nome, senha, extraUser = {}) => {
    const normalizedUser = normalizeUser({ id, nome, senha, ...extraUser });

    if (isAdminUser(normalizedUser) && !usuarios.find(isAdminUser)) {
      setUsuarios([...usuarios, normalizedUser]);
    } else if (!usuarios.find(u => u.id === id)) {
      setUsuarios([...usuarios, normalizedUser]); 
    }
    setCurrentUser(normalizedUser);
  };

  const handleLogout = () => setCurrentUser(null);
  const handleAvatarSelected = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!currentUser || !file) return;

    setAvatarLoading(true);
    setAvatarError('');

    try {
      const avatar = await processAvatarFile(file);
      const updatedUser = { ...currentUser, avatar };

      setUsuarios((current) => current.map((user) => (
        user.id === currentUser.id ? { ...user, avatar } : user
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
      user.id === currentUser.id ? { ...user, avatar: '' } : user
    )));
    setCurrentUser((current) => ({ ...current, avatar: '' }));
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
      return modoAdmin ? { ...p, [c]: val } : { ...p, [currentUser.id]: { ...root, [c]: val } };
    });
  };

  const handleSubmitSection = (field) => {
    if (!currentUser || modoAdmin) return;
    if (field === SUBMISSION_FIELDS.MATA && !jogosEnviadosAt) return;
    setSubmissoes((current) => ({
      ...current,
      [currentUser.id]: {
        ...(current[currentUser.id] || {}),
        [field]: Date.now()
      }
    }));
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
        await writeRemoteState(buildRemotePayload(initialState));
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
      return usuarios.filter((user) => !isAdminUser(user)).map(user => {
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
            <tbody>{ranking.map((user, idx) => (
              <tr key={user.id} className={`border-b border-white/5 last:border-0 ${user.id === currentUser.id ? 'bg-blue-500/10' : ''}`}>
                <td className={`p-4 text-center font-bold ${TEXT_MUTED}`}>{idx + 1}</td>
                <td className={`p-4 ${user.id === currentUser.id ? 'text-blue-400' : TEXT_HIGHLIGHT}`}>
                  <div className="flex items-center gap-3">
                    <AvatarBadge user={user} size="sm" />
                    <span className="font-bold">{user.nome} {user.id === currentUser.id && '(Você)'}</span>
                  </div>
                </td>
                <td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsJogos}</td>
                <td className={`p-4 text-center ${TEXT_MUTED}`}>{user.ptsMataMata}</td>
                <td className="p-4 text-center font-bold text-green-400 text-sm">{user.total}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    );
  };

  const ReviewSheet = () => {
    const searchTerm = reviewSearch.trim().toLowerCase();
    const usersFiltrados = [...participanteUsuarios]
      .filter((user) => !searchTerm || user.nome.toLowerCase().includes(searchTerm))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

    const jogosFiltrados = jogosReais
      .filter((jogo) => reviewGroupFilter === 'todos' || jogo.grupo === reviewGroupFilter)
      .sort((a, b) => (
        parseMatchDateTime(a) - parseMatchDateTime(b) ||
        a.grupo.localeCompare(b.grupo, 'pt-BR') ||
        a.id - b.id
      ));

    const gameRows = jogosFiltrados.map((jogo) => {
      const realPreenchido = placarPreenchido(jogo.placarA, jogo.placarB);

      return {
        id: jogo.id,
        grupoMeta: formatMatchMeta(jogo),
        confronto: `${jogo.timeA} x ${jogo.timeB}`,
        real: realPreenchido ? `${jogo.placarA} x ${jogo.placarB}` : '—',
        palpites: usersFiltrados.map((user) => {
          const palpite = palpitesJogos[user.id]?.[jogo.id];
          const palpitePreenchido = placarPreenchido(palpite?.placarA, palpite?.placarB);
          const resultado = palpitePreenchido && realPreenchido
            ? calcularPontosJogo(palpite.placarA, palpite.placarB, jogo.placarA, jogo.placarB)
            : null;

          let status = { label: 'Sem palpite', tone: 'bg-slate-100 text-slate-500' };
          if (palpitePreenchido && !realPreenchido) status = { label: 'Aguardando real', tone: 'bg-amber-100 text-amber-700' };
          if (resultado?.pts === PONTOS.JOGO.CHEIO) status = { label: 'Cravou', tone: 'bg-emerald-100 text-emerald-700' };
          if (resultado?.pts === PONTOS.JOGO.VITORIA) status = { label: 'Vencedor', tone: 'bg-sky-100 text-sky-700' };
          if (resultado && resultado.pts === 0) status = { label: 'Errou', tone: 'bg-rose-100 text-rose-700' };

          return {
            userId: user.id,
            usuario: user.nome,
            palpite: palpitePreenchido ? `${palpite.placarA} x ${palpite.placarB}` : '—',
            status,
            pontos: resultado?.pts ?? 0,
            envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.JOGOS]),
            enviado: Boolean(submissoes[user.id]?.[SUBMISSION_FIELDS.JOGOS])
          };
        })
      };
    });

    const knockoutRows = usersFiltrados.flatMap((user) => {
      const userMata = palpitesMataMata[user.id] || {};
      const phaseRows = [
        ...MATA_MATA_CONFIG.r32.map((match, idx) => ({
          id: `${user.id}-r32-${match.id}`,
          usuario: user.nome,
          etapa: '32-avos',
          disputa: `Jogo ${match.id}`,
          palpite: userMata.dezeszeseisavos?.[idx] || '—',
          oficial: gabaritoMataMata.dezeszeseisavos?.[idx] || '—',
          pontos: userMata.dezeszeseisavos?.[idx] && userMata.dezeszeseisavos?.[idx] === gabaritoMataMata.dezeszeseisavos?.[idx] ? PONTOS.MATA.R32 : 0
        })),
        ...MATA_MATA_CONFIG.r16.map((match, idx) => ({
          id: `${user.id}-r16-${match.id}`,
          usuario: user.nome,
          etapa: 'Oitavas',
          disputa: `Jogo ${match.id}`,
          palpite: userMata.oitavas?.[idx] || '—',
          oficial: gabaritoMataMata.oitavas?.[idx] || '—',
          pontos: userMata.oitavas?.[idx] && userMata.oitavas?.[idx] === gabaritoMataMata.oitavas?.[idx] ? PONTOS.MATA.R16 : 0
        })),
        ...MATA_MATA_CONFIG.qf.map((match, idx) => ({
          id: `${user.id}-qf-${match.id}`,
          usuario: user.nome,
          etapa: 'Quartas',
          disputa: `Jogo ${match.id}`,
          palpite: userMata.quartas?.[idx] || '—',
          oficial: gabaritoMataMata.quartas?.[idx] || '—',
          pontos: userMata.quartas?.[idx] && userMata.quartas?.[idx] === gabaritoMataMata.quartas?.[idx] ? PONTOS.MATA.QF : 0
        })),
        ...MATA_MATA_CONFIG.sf.map((match, idx) => ({
          id: `${user.id}-sf-${match.id}`,
          usuario: user.nome,
          etapa: 'Semis',
          disputa: `Jogo ${match.id}`,
          palpite: userMata.semis?.[idx] || '—',
          oficial: gabaritoMataMata.semis?.[idx] || '—',
          pontos: userMata.semis?.[idx] && userMata.semis?.[idx] === gabaritoMataMata.semis?.[idx] ? PONTOS.MATA.SF : 0
        })),
        {
          id: `${user.id}-campeao`,
          usuario: user.nome,
          etapa: 'Pódio',
          disputa: 'Campeão',
          palpite: userMata.campeao || '—',
          oficial: gabaritoMataMata.campeao || '—',
          pontos: userMata.campeao && userMata.campeao === gabaritoMataMata.campeao ? PONTOS.MATA.CAMPEAO : 0
        },
        {
          id: `${user.id}-vice`,
          usuario: user.nome,
          etapa: 'Pódio',
          disputa: 'Vice',
          palpite: userMata.vice || '—',
          oficial: gabaritoMataMata.vice || '—',
          pontos: userMata.vice && userMata.vice === gabaritoMataMata.vice ? PONTOS.MATA.VICE : 0
        },
        {
          id: `${user.id}-terceiro`,
          usuario: user.nome,
          etapa: 'Pódio',
          disputa: '3º lugar',
          palpite: userMata.terceiro || '—',
          oficial: gabaritoMataMata.terceiro || '—',
          pontos: userMata.terceiro && userMata.terceiro === gabaritoMataMata.terceiro ? PONTOS.MATA.TOP3 : 0
        },
        {
          id: `${user.id}-quarto`,
          usuario: user.nome,
          etapa: 'Pódio',
          disputa: '4º lugar',
          palpite: userMata.quarto || '—',
          oficial: gabaritoMataMata.quarto || '—',
          pontos: userMata.quarto && userMata.quarto === gabaritoMataMata.quarto ? PONTOS.MATA.TOP4 : 0
        }
      ];

      return phaseRows.map((row) => {
        let status = { label: 'Sem palpite', tone: 'bg-slate-100 text-slate-500' };
        if (row.palpite !== '—' && row.oficial === '—') status = { label: 'Aguardando oficial', tone: 'bg-amber-100 text-amber-700' };
        if (row.pontos > 0) status = { label: 'Acertou', tone: 'bg-emerald-100 text-emerald-700' };
        if (row.palpite !== '—' && row.oficial !== '—' && row.pontos === 0) status = { label: 'Errou', tone: 'bg-rose-100 text-rose-700' };
        return {
          ...row,
          status,
          envio: formatSubmissionDate(submissoes[user.id]?.[SUBMISSION_FIELDS.MATA])
        };
      });
    });

    const linhas = reviewMode === 'jogos' ? gameRows : knockoutRows;

    return (
      <div className="space-y-4 animate-fade-in">
        <div className={`${GLASS_CARD} p-5 space-y-4`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Planilha de Palpites</h3>
              <p className={`text-xs mt-1 ${TEXT_MUTED}`}>Cada linha mostra um confronto, o placar real e os palpites dos participantes lado a lado.</p>
            </div>
            <div className="flex gap-2 rounded-full bg-slate-100 p-1">
              <button onClick={() => setReviewMode('jogos')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'jogos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Jogos</button>
              <button onClick={() => setReviewMode('mata')} className={`px-3 py-1.5 text-[11px] font-bold rounded-full transition-colors ${reviewMode === 'mata' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>Mata-mata</button>
            </div>
          </div>
          {reviewMode === 'jogos' && (
            <div className="flex flex-wrap gap-2 text-[10px] font-semibold text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Cravou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-sky-700"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Acertou vencedor</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1.5 text-rose-700"><span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span> Errou</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700"><span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span> Aguardando real</span>
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-slate-600"><span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span> Sem palpite</span>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_150px]">
            <input value={reviewSearch} onChange={(e) => setReviewSearch(e.target.value)} placeholder="Filtrar colunas por usuário" className={`${GLASS_INPUT} px-4 py-3 text-sm`} />
            <select value={reviewGroupFilter} onChange={(e) => setReviewGroupFilter(e.target.value)} disabled={reviewMode !== 'jogos'} className={`${GLASS_INPUT} px-4 py-3 text-sm`}>
              <option value="todos">Todos os grupos</option>
              {Object.keys(GRUPOS_2026).map((grupo) => <option key={grupo} value={grupo}>Grupo {grupo}</option>)}
            </select>
          </div>
        </div>

        <div className={`${GLASS_CARD} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                {reviewMode === 'jogos' ? (
                  <tr>
                    <th className="px-4 py-3 text-left min-w-[140px]">Grupo / Data</th>
                    <th className="px-4 py-3 text-left min-w-[220px]">Confronto</th>
                    <th className="px-4 py-3 text-center min-w-[96px]">Real</th>
                    {usersFiltrados.map((user) => (
                      <th key={user.id} className="px-4 py-3 text-center min-w-[180px]">
                        <div className="flex items-center justify-center gap-2">
                          <AvatarBadge user={user} size="sm" />
                          <div className="font-bold text-slate-700 normal-case text-[11px]">{user.nome}</div>
                        </div>
                        <div className="mt-1 text-[9px] font-medium text-slate-400">
                          {submissoes[user.id]?.[SUBMISSION_FIELDS.JOGOS] ? 'Enviado' : 'Rascunho'}
                        </div>
                      </th>
                    ))}
                  </tr>
                ) : (
                  <tr>
                    <th className="px-4 py-3 text-left">Usuário</th>
                    <th className="px-4 py-3 text-left">Etapa</th>
                    <th className="px-4 py-3 text-left">Disputa</th>
                    <th className="px-4 py-3 text-left">Palpite</th>
                    <th className="px-4 py-3 text-left">Oficial</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Pts</th>
                    <th className="px-4 py-3 text-center">Envio</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {linhas.length === 0 && (
                  <tr>
                    <td colSpan={reviewMode === 'jogos' ? 3 + Math.max(usersFiltrados.length, 1) : 8} className="px-4 py-10 text-center text-slate-400">Nenhum registro encontrado com os filtros atuais.</td>
                  </tr>
                )}
                {reviewMode === 'jogos' && gameRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 text-slate-500">
                      <div className="leading-tight">
                        <div>{row.grupoMeta.top}</div>
                        <div>{row.grupoMeta.bottom}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{row.confronto}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">{row.real}</td>
                    {row.palpites.map((palpite) => (
                      <td key={`${row.id}-${palpite.userId}`} className="px-4 py-3 align-top">
                        <div className={`rounded-2xl border px-3 py-3 text-center ${
                          palpite.status.label === 'Cravou'
                            ? 'border-emerald-200 bg-emerald-50'
                            : palpite.status.label === 'Vencedor'
                              ? 'border-sky-200 bg-sky-50'
                              : palpite.status.label === 'Errou'
                                ? 'border-rose-200 bg-rose-50'
                                : palpite.status.label === 'Aguardando real'
                                  ? 'border-amber-200 bg-amber-50'
                                  : 'border-slate-200 bg-slate-50'
                        }`}>
                          <div className="text-sm font-bold text-slate-900">{palpite.palpite}</div>
                          <div className="mt-2 flex justify-center">
                            <span className={`h-3 w-3 rounded-full ${
                              palpite.status.label === 'Cravou'
                                ? 'bg-emerald-500'
                                : palpite.status.label === 'Vencedor'
                                  ? 'bg-sky-500'
                                  : palpite.status.label === 'Errou'
                                    ? 'bg-rose-500'
                                    : palpite.status.label === 'Aguardando real'
                                      ? 'bg-amber-500'
                                      : 'bg-slate-400'
                            }`}></span>
                          </div>
                          <div className="mt-2 text-[10px] font-semibold text-sky-700">{palpite.pontos} pts</div>
                          <div className="mt-1 text-[10px] text-slate-400">{palpite.envio}</div>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                {reviewMode === 'mata' && knockoutRows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <AvatarBadge user={usuarios.find((user) => user.nome === row.usuario)} size="sm" />
                        <span>{row.usuario}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{row.etapa}</td>
                    <td className="px-4 py-3 text-slate-700">{row.disputa}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.palpite}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.oficial}</td>
                    <td className="px-4 py-3 text-center"><span className={`inline-flex rounded-full px-2.5 py-1 font-bold ${row.status.tone}`}>{row.status.label}</span></td>
                    <td className="px-4 py-3 text-center font-bold text-sky-700">{row.pontos}</td>
                    <td className="px-4 py-3 text-center text-slate-500">{row.envio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <table className="w-full table-fixed text-[10px] text-slate-700 sm:text-[11px]">
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
        {modoAdmin && (
          <div className="border-t border-slate-200 p-3 space-y-2 bg-slate-50/90">
            <div className="text-[11px] uppercase font-bold text-slate-700">Fair play / conduta FIFA</div>
            {GRUPOS_2026[grupo].map((time) => {
              const registro = condutaGrupos?.[grupo]?.[time] || {};
              return (
                <div key={time} className="grid grid-cols-[minmax(0,1fr)_44px_44px_44px_44px] gap-2 items-center">
                  <span className="truncate text-[12px] font-medium text-slate-700">{time}</span>
                  <input type="number" min="0" value={registro.amarelos ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amarelos', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs text-slate-700`} placeholder="A" title="Amarelos" />
                  <input type="number" min="0" value={registro.vermelhoIndireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoIndireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs text-slate-700`} placeholder="2A" title="Vermelho indireto" />
                  <input type="number" min="0" value={registro.vermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'vermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs text-slate-700`} placeholder="VD" title="Vermelho direto" />
                  <input type="number" min="0" value={registro.amareloEVermelhoDireto ?? ''} onChange={e => atualizarCondutaGrupo(grupo, time, 'amareloEVermelhoDireto', e.target.value)} className={`${GLASS_INPUT} h-9 text-center text-xs text-slate-700`} placeholder="A+V" title="Amarelo + vermelho direto" />
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
          <span className={`text-xs font-bold truncate max-w-[45%] text-right ${isReady ? 'text-white' : TEXT_MUTED}`}>{timeA}</span>
          <span className={`text-[10px] px-2 ${TEXT_MUTED}`}>vs</span>
          <span className={`text-xs font-bold truncate max-w-[45%] text-left ${isReady ? 'text-white' : TEXT_MUTED}`}>{timeB}</span>
        </div>
        {feedback}
        <div className="relative">
          {(!isReady || isLocked) && <Lock size={12} className={`absolute left-3 top-3.5 ${TEXT_MUTED}`} />}
          <select value={currentValue || ""} onChange={(e) => atualizarMataMata(phaseKey, e.target.value, idx)} disabled={!isReady || isLocked} className={`${GLASS_INPUT} w-full p-3 text-xs font-medium appearance-none ${(!isReady || isLocked) && 'pl-8 text-slate-400'}`}>
            <option value="">{isLocked ? "Palpite enviado" : isReady ? "Quem vence?" : "Defina os anteriores"}</option>{isReady && <><option value={timeA}>{timeA}</option><option value={timeB}>{timeB}</option></>}
          </select>
          {!isLocked && isReady && <ChevronDown size={14} className={`absolute right-3 top-3.5 pointer-events-none ${TEXT_MUTED}`} />}
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
        <button onClick={() => setSecaoExpandida(secaoExpandida === 'podium' ? null : 'podium')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-yellow-500/10 to-transparent"><div className="flex items-center gap-3"><Crown className="text-yellow-400" size={18} /><span className="font-bold text-sm text-white uppercase tracking-wide">Pódio Final</span></div>{secaoExpandida === 'podium' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
        {secaoExpandida === 'podium' && (
          <div className="p-4 space-y-4 border-t border-white/5">
            <div className="grid gap-3 md:grid-cols-2">
              <div className={`${GLASS_CARD} p-3 bg-black/20`}>
                <div className="text-[10px] font-bold uppercase text-yellow-400">Final oficial</div>
                <div className="mt-2 text-xs font-semibold text-white">{finalSchedule.day}/{finalSchedule.month} • {finalSchedule.time} BR</div>
                <div className={`mt-1 text-[10px] ${TEXT_MUTED}`}>{finalInfo.local}</div>
                {finalKickoffHint && <div className="mt-1 text-[10px] text-slate-400">{finalKickoffHint}</div>}
              </div>
              <div className={`${GLASS_CARD} p-3 bg-black/20`}>
                <div className="text-[10px] font-bold uppercase text-orange-400">3º lugar oficial</div>
                <div className="mt-2 text-xs font-semibold text-white">{bronzeSchedule.day}/{bronzeSchedule.month} • {bronzeSchedule.time} BR</div>
                <div className={`mt-1 text-[10px] ${TEXT_MUTED}`}>{bronzeInfo.local}</div>
                {bronzeKickoffHint && <div className="mt-1 text-[10px] text-slate-400">{bronzeKickoffHint}</div>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-yellow-400 font-bold uppercase block text-center mb-3">Grande Final {renderFeedback('campeao')}</label>
              <div className={`${GLASS_CARD} p-4 bg-black/20`}>
                <select value={dataSource.campeao || ""} onChange={e => { atualizarMataMata('campeao', e.target.value, null); const vice = finalistas.find(f => f !== e.target.value); if (vice) atualizarMataMata('vice', vice, null); }} disabled={!isFinalReady || isLocked} className={`${GLASS_INPUT} w-full p-3 text-xs border-yellow-500/30 focus:border-yellow-500 text-slate-800`}>
                  <option value="">Quem será Campeão?</option>{isFinalReady && finalistas.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {dataSource.vice && <div className={`mt-3 text-center text-[10px] ${TEXT_MUTED}`}>Vice: <span className="text-white">{dataSource.vice}</span> {renderFeedback('vice')}</div>}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <label className="text-[10px] text-orange-400 font-bold uppercase block text-center mb-3">3º Lugar {renderFeedback('terceiro')}</label>
              <div className={`${GLASS_CARD} p-4 bg-black/20`}>
                <select value={dataSource.terceiro || ""} onChange={e => { atualizarMataMata('terceiro', e.target.value, null); const quarto = disputantes3.find(t => t !== e.target.value); if (quarto) atualizarMataMata('quarto', quarto, null); }} disabled={!is3rdReady || isLocked} className={`${GLASS_INPUT} w-full p-3 text-xs border-orange-500/30 focus:border-orange-500 text-slate-800`}>
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

  if (!currentUser) {
    return (
      <LoginScreen
        onLogin={handleLogin}
        users={usuarios}
        syncStatus={syncStatus}
        syncError={syncError}
        isDemoMode={isDemoMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#f4f7fb_100%)] text-slate-900 font-sans pb-28">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-slate-200 px-5 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <AvatarBadge user={currentUser} size="md" />
          <div><h1 className="text-sm font-bold text-slate-900 leading-tight">{currentUser.nome}</h1><p className={`text-[10px] font-medium tracking-wide ${TEXT_MUTED}`}>{modoAdmin ? 'ADMINISTRADOR' : 'Participante'}</p></div>
        </div>
        <button onClick={handleLogout} className={`p-2.5 rounded-full hover:bg-slate-100 transition-colors ${TEXT_MUTED} hover:text-slate-800`}><LogOut size={18} /></button>
      </header>

      <main className="p-5 max-w-lg mx-auto">
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
            <div className="mt-4 flex gap-3">
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
                className={`${GLASS_BTN_PRIMARY} px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {avatarLoading ? 'Enviando...' : currentUser.avatar ? 'Trocar imagem' : 'Enviar imagem'}
              </button>
              {currentUser.avatar && (
                <button onClick={handleRemoveAvatar} className={`${GLASS_BTN_SECONDARY} px-4 py-3 text-xs uppercase tracking-widest`}>
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
                  <span className={`text-xs ${TEXT_MUTED}`}>{palpitesTravadosJogos ? `Enviado em ${formatSubmissionDate(jogosEnviadosAt)}` : 'Preencha todos os jogos antes de enviar.'}</span>
                  {!palpitesTravadosJogos && (
                    <button
                      onClick={() => handleSubmitSection(SUBMISSION_FIELDS.JOGOS)}
                      disabled={!usuarioPreencheuTodosOsJogos(jogosReais, palpitesUsuarioAtual)}
                      className={`${GLASS_BTN_PRIMARY} px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
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
                        <div className="flex justify-between items-start text-[11px] font-bold uppercase mb-4 text-slate-500 gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="flex items-center gap-1"><Calendar size={10} /> {schedule.day}/{schedule.month} • {schedule.time} BR</span>
                            {officialKickoffHint && <span className="text-[10px] font-semibold normal-case text-slate-500">{officialKickoffHint}</span>}
                          </div>
                          <span className="bg-slate-100 px-2 py-0.5 rounded-full text-[10px] text-slate-600 text-right">{jogo.local}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="w-1/3 text-right text-[13px] font-bold truncate text-slate-800">{jogo.timeA}</span>
                          <div className="flex items-center gap-2">
                            <input type="number" min="0" disabled={palpitesTravadosJogos && !modoAdmin} value={valA} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarA', e.target.value) : atualizarPalpite(jogo.id, 'placarA', e.target.value)} className={`${GLASS_INPUT} w-10 h-10 text-center text-sm font-bold`} />
                            <span className="text-sm text-slate-500 font-light">X</span>
                            <input type="number" min="0" disabled={palpitesTravadosJogos && !modoAdmin} value={valB} onChange={e => modoAdmin ? atualizarJogo(jogo.id, 'placarB', e.target.value) : atualizarPalpite(jogo.id, 'placarB', e.target.value)} className={`${GLASS_INPUT} w-10 h-10 text-center text-sm font-bold`} />
                          </div>
                          <span className="w-1/3 text-left text-[13px] font-bold truncate text-slate-800">{jogo.timeB}</span>
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
                      className={`${GLASS_BTN_PRIMARY} px-4 py-3 text-xs uppercase tracking-widest disabled:cursor-not-allowed disabled:opacity-50`}
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
        {abaAtiva === 'painel' && <ReviewSheet />}
        
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
             {modoAdmin && (
               <div className={`${GLASS_CARD} p-6`}>
                 <h3 className="font-bold text-sm mb-2 text-white flex items-center gap-2 uppercase tracking-wide"><User size={18} className="text-red-400" /> Gerenciar Usuários</h3>
                 <p className={`text-xs mb-5 ${TEXT_MUTED}`}>Apague participantes e remova junto os palpites salvos deles. A conta Admin fica protegida.</p>
                 <div className="space-y-3">
                   {usuarios.map((user) => {
                     const adminUser = isAdminUser(user);
                     const isConfirming = userDeleteConfirmId === user.id;
                     return (
                       <div key={user.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3">
                         <div className="min-w-0">
                           <div className="truncate text-sm font-bold text-white">{user.nome}</div>
                           <div className={`text-[10px] uppercase tracking-wide ${TEXT_MUTED}`}>{adminUser ? 'Administrador protegido' : 'Participante'}</div>
                         </div>
                         <button
                           onClick={() => handleDeleteUser(user.id)}
                           disabled={adminUser}
                           className={`shrink-0 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                             adminUser
                               ? 'cursor-not-allowed border-white/10 text-white/25'
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
      </main>

      <nav className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 px-5 py-3 rounded-full flex justify-between gap-6 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.35)] z-50 max-w-[94%] w-auto">
        <button onClick={() => setAbaAtiva('jogos')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'jogos' ? 'text-sky-600 scale-110' : 'text-slate-400 hover:text-slate-700'}`}><Calendar size={20} strokeWidth={abaAtiva === 'jogos' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('matamata')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'matamata' ? 'text-sky-600 scale-110' : 'text-slate-400 hover:text-slate-700'}`}><Crown size={20} strokeWidth={abaAtiva === 'matamata' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('ranking')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'ranking' ? 'text-sky-600 scale-110' : 'text-slate-400 hover:text-slate-700'}`}><Trophy size={20} strokeWidth={abaAtiva === 'ranking' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('painel')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'painel' ? 'text-sky-600 scale-110' : 'text-slate-400 hover:text-slate-700'}`}><Medal size={20} strokeWidth={abaAtiva === 'painel' ? 2.5 : 2} /></button>
        <button onClick={() => setAbaAtiva('regras')} className={`flex flex-col items-center gap-1 transition-all ${abaAtiva === 'regras' ? 'text-sky-600 scale-110' : 'text-slate-400 hover:text-slate-700'}`}><List size={20} strokeWidth={abaAtiva === 'regras' ? 2.5 : 2} /></button>
      </nav>
    </div>
  );
}

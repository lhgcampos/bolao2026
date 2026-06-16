export const PONTOS = {
  JOGO: { CHEIO: 20, VITORIA: 5 },
  MATA: { CAMPEAO: 100, VICE: 70, TOP3: 50, TOP4: 40, SF: 30, QF: 20, R16: 10, R32: 5 }
};

export const PONTOS_CONDUTA = {
  AMARELO: -1,
  VERMELHO_INDIRETO: -3,
  VERMELHO_DIRETO: -4,
  AMARELO_E_VERMELHO_DIRETO: -5
};

export const SUBMISSION_FIELDS = {
  JOGOS: 'jogosAt',
  MATA: 'mataAt'
};

// Agenda oficial do mata-mata baseada nos horarios locais publicados pela FIFA; a exibicao em tela usa o horario do Brasil.
// `kickoffEt` guarda o instante real do jogo com o offset do estadio; `horaEt` preserva a hora local oficial publicada pela FIFA.
export const MATA_MATA_CONFIG = {
  r32: [
    { id: 73, label: "2A x 2B", kickoffEt: "2026-06-28T12:00:00-07:00", horaEt: "12:00", local: "Los Angeles", refA: "2A", refB: "2B" },
    { id: 74, label: "1E x 3A/B/C/D/F", kickoffEt: "2026-06-29T16:30:00-04:00", horaEt: "16:30", local: "Boston", refA: "1E", refThirdGroups: ['A', 'B', 'C', 'D', 'F'] },
    { id: 75, label: "1F x 2C", kickoffEt: "2026-06-29T19:00:00-06:00", horaEt: "19:00", local: "Monterrey", refA: "1F", refB: "2C" },
    { id: 76, label: "1C x 2F", kickoffEt: "2026-06-29T12:00:00-05:00", horaEt: "12:00", local: "Houston", refA: "1C", refB: "2F" },
    { id: 77, label: "1I x 3C/D/F/G/H", kickoffEt: "2026-06-30T17:00:00-04:00", horaEt: "17:00", local: "Nova York/Nova Jersey", refA: "1I", refThirdGroups: ['C', 'D', 'F', 'G', 'H'] },
    { id: 78, label: "2E x 2I", kickoffEt: "2026-06-30T12:00:00-05:00", horaEt: "12:00", local: "Dallas", refA: "2E", refB: "2I" },
    { id: 79, label: "1A x 3C/E/F/H/I", kickoffEt: "2026-06-30T19:00:00-06:00", horaEt: "19:00", local: "Cid. México", refA: "1A", refThirdGroups: ['C', 'E', 'F', 'H', 'I'] },
    { id: 80, label: "1L x 3E/H/I/J/K", kickoffEt: "2026-07-01T12:00:00-04:00", horaEt: "12:00", local: "Atlanta", refA: "1L", refThirdGroups: ['E', 'H', 'I', 'J', 'K'] },
    { id: 81, label: "1D x 3B/E/F/I/J", kickoffEt: "2026-07-01T17:00:00-07:00", horaEt: "17:00", local: "San Francisco Bay Area", refA: "1D", refThirdGroups: ['B', 'E', 'F', 'I', 'J'] },
    { id: 82, label: "1G x 3A/E/H/I/J", kickoffEt: "2026-07-01T13:00:00-07:00", horaEt: "13:00", local: "Seattle", refA: "1G", refThirdGroups: ['A', 'E', 'H', 'I', 'J'] },
    { id: 83, label: "2K x 2L", kickoffEt: "2026-07-02T19:00:00-04:00", horaEt: "19:00", local: "Toronto", refA: "2K", refB: "2L" },
    { id: 84, label: "1H x 2J", kickoffEt: "2026-07-02T12:00:00-07:00", horaEt: "12:00", local: "Los Angeles", refA: "1H", refB: "2J" },
    { id: 85, label: "1B x 3E/F/G/I/J", kickoffEt: "2026-07-02T20:00:00-07:00", horaEt: "20:00", local: "Vancouver", refA: "1B", refThirdGroups: ['E', 'F', 'G', 'I', 'J'] },
    { id: 86, label: "1J x 2H", kickoffEt: "2026-07-03T18:00:00-04:00", horaEt: "18:00", local: "Miami", refA: "1J", refB: "2H" },
    { id: 87, label: "1K x 3D/E/I/J/L", kickoffEt: "2026-07-03T20:30:00-05:00", horaEt: "20:30", local: "Kansas City", refA: "1K", refThirdGroups: ['D', 'E', 'I', 'J', 'L'] },
    { id: 88, label: "2D x 2G", kickoffEt: "2026-07-03T13:00:00-05:00", horaEt: "13:00", local: "Dallas", refA: "2D", refB: "2G" },
  ],
  r16: [
    { id: 89, feedA: 74, feedB: 77, kickoffEt: "2026-07-04T17:00:00-04:00", horaEt: "17:00", local: "Filadélfia" },
    { id: 90, feedA: 73, feedB: 75, kickoffEt: "2026-07-04T12:00:00-05:00", horaEt: "12:00", local: "Houston" },
    { id: 91, feedA: 76, feedB: 78, kickoffEt: "2026-07-05T16:00:00-04:00", horaEt: "16:00", local: "Nova York/Nova Jersey" },
    { id: 92, feedA: 79, feedB: 80, kickoffEt: "2026-07-05T18:00:00-06:00", horaEt: "18:00", local: "Cid. México" },
    { id: 93, feedA: 83, feedB: 84, kickoffEt: "2026-07-06T14:00:00-05:00", horaEt: "14:00", local: "Dallas" },
    { id: 94, feedA: 81, feedB: 82, kickoffEt: "2026-07-06T17:00:00-07:00", horaEt: "17:00", local: "Seattle" },
    { id: 95, feedA: 86, feedB: 88, kickoffEt: "2026-07-07T12:00:00-04:00", horaEt: "12:00", local: "Atlanta" },
    { id: 96, feedA: 85, feedB: 87, kickoffEt: "2026-07-07T13:00:00-07:00", horaEt: "13:00", local: "Vancouver" }
  ],
  qf: [
    { id: 97, feedA: 89, feedB: 90, kickoffEt: "2026-07-09T16:00:00-04:00", horaEt: "16:00", local: "Boston" },
    { id: 98, feedA: 93, feedB: 94, kickoffEt: "2026-07-10T12:00:00-07:00", horaEt: "12:00", local: "Los Angeles" },
    { id: 99, feedA: 91, feedB: 92, kickoffEt: "2026-07-11T17:00:00-04:00", horaEt: "17:00", local: "Miami" },
    { id: 100, feedA: 95, feedB: 96, kickoffEt: "2026-07-11T20:00:00-05:00", horaEt: "20:00", local: "Kansas City" }
  ],
  sf: [
    { id: 101, feedA: 97, feedB: 98, kickoffEt: "2026-07-14T14:00:00-05:00", horaEt: "14:00", local: "Dallas" },
    { id: 102, feedA: 99, feedB: 100, kickoffEt: "2026-07-15T15:00:00-04:00", horaEt: "15:00", local: "Atlanta" }
  ],
  bronzeFinal: [
    { id: 103, kickoffEt: "2026-07-18T17:00:00-04:00", horaEt: "17:00", local: "Miami", titulo: "Disputa do 3º lugar" }
  ],
  final: [
    { id: 104, kickoffEt: "2026-07-19T15:00:00-04:00", horaEt: "15:00", local: "Nova York/Nova Jersey", titulo: "Final" }
  ]
};

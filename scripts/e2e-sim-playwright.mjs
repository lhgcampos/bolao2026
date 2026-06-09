import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const APP_URL = 'http://localhost:5173/'
const REPORT_DIR = path.resolve('reports')
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots')
const VIDEO_DIR = path.join(REPORT_DIR, 'videos')

const groups = {
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
  L: ['Inglaterra', 'Croácia', 'Gana', 'Panamá'],
}

const groupMatchOrder = Object.fromEntries(
  Object.entries(groups).map(([groupName, teams]) => [
    groupName,
    [
      [teams[0], teams[1]],
      [teams[2], teams[3]],
      [teams[0], teams[2]],
      [teams[3], teams[1]],
      [teams[3], teams[0]],
      [teams[1], teams[2]],
    ],
  ]),
)

const baselineScores = (teams) => [
  [teams[0], teams[1], 2, 0],
  [teams[2], teams[3], 1, 0],
  [teams[0], teams[2], 1, 1],
  [teams[3], teams[1], 0, 2],
  [teams[3], teams[0], 0, 3],
  [teams[1], teams[2], 2, 1],
]

const officialMatches = Object.fromEntries(
  Object.entries(groups).map(([groupName, teams]) => [groupName, baselineScores(teams)]),
)

officialMatches.A = [
  ['México', 'África do Sul', 2, 0],
  ['Coreia do Sul', 'Rep. Tcheca', 1, 1],
  ['México', 'Coreia do Sul', 1, 0],
  ['Rep. Tcheca', 'África do Sul', 0, 2],
  ['Rep. Tcheca', 'México', 0, 1],
  ['África do Sul', 'Coreia do Sul', 2, 2],
]

officialMatches.B = [
  ['Canadá', 'Suíça', 2, 0],
  ['Catar', 'Bósnia', 1, 0],
  ['Canadá', 'Catar', 1, 1],
  ['Bósnia', 'Suíça', 0, 2],
  ['Bósnia', 'Canadá', 1, 3],
  ['Suíça', 'Catar', 2, 2],
]

const baselinePredictions = Object.fromEntries(
  Object.entries(officialMatches).map(([groupName, matches]) => [
    groupName,
    matches.map(([, , goalsA, goalsB]) => [goalsA, goalsB]),
  ]),
)

const users = [
  {
    name: 'Ana',
    password: 'ana123',
    predictions: {
      ...baselinePredictions,
      A: [[2, 0], [1, 1], [1, 0], [0, 2], [0, 1], [2, 2]],
      B: [[2, 0], [1, 0], [1, 1], [0, 2], [1, 3], [2, 2]],
    },
    r32Pick: 'Catar',
  },
  {
    name: 'Bruno',
    password: 'bruno123',
    predictions: {
      ...baselinePredictions,
      A: [[1, 0], [0, 0], [2, 1], [0, 1], [0, 2], [1, 1]],
      B: [[1, 0], [2, 1], [0, 0], [1, 2], [0, 1], [1, 1]],
    },
    r32Pick: 'África do Sul',
  },
  {
    name: 'Carla',
    password: 'carla123',
    predictions: {
      ...baselinePredictions,
      A: [[0, 1], [2, 1], [0, 2], [1, 0], [1, 1], [0, 3]],
      B: [[2, 0], [1, 0], [1, 1], [0, 2], [1, 3], [2, 2]],
    },
    r32Pick: 'Catar',
  },
  {
    name: 'Diego',
    password: 'diego123',
    predictions: {
      ...baselinePredictions,
      A: [[0, 3], [3, 0], [1, 2], [2, 0], [2, 2], [0, 1]],
      B: [[0, 2], [0, 1], [2, 0], [2, 1], [2, 0], [1, 0]],
    },
    r32Pick: 'Suíça',
  },
  {
    name: 'Eva',
    password: 'eva123',
    predictions: {
      ...baselinePredictions,
      A: [[2, 0], [1, 1], [1, 0], ['', ''], ['', ''], ['', '']],
      B: [[2, 0], [1, 0], ['', ''], ['', ''], ['', ''], ['', '']],
    },
    r32Pick: null,
  },
]

const officialR32Winner = 'Catar'

const points = {
  jogo: { cheio: 20, vencedor: 5 },
  mata: { r32: 5 },
}

function ensureArray(value) {
  return Array.isArray(value) ? value : []
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

function computeMatchPoints(prediction, actual) {
  const [pA, pB] = prediction
  const [, , rA, rB] = actual
  if (pA === '' || pB === '') return 0
  if (Number(pA) === rA && Number(pB) === rB) return points.jogo.cheio
  const diffP = Number(pA) - Number(pB)
  const diffR = rA - rB
  return Math.sign(diffP) === Math.sign(diffR) ? points.jogo.vencedor : 0
}

function computeExpected(usersData) {
  const expected = {}

  for (const user of usersData) {
    let gamePoints = 0
    for (const [groupName, matches] of Object.entries(officialMatches)) {
      const predicted = ensureArray(user.predictions[groupName])
      matches.forEach((actualMatch, index) => {
        const prediction = predicted[index] || ['', '']
        gamePoints += computeMatchPoints(prediction, actualMatch)
      })
    }

    let knockoutPoints = 0
    if (user.r32Pick === officialR32Winner) knockoutPoints += points.mata.r32

    expected[user.name] = {
      jogos: gamePoints,
      mata: knockoutPoints,
      total: gamePoints + knockoutPoints,
    }
  }

  return expected
}

async function clearAppState(page) {
  await page.goto(APP_URL, { waitUntil: 'networkidle' })
  await page.evaluate(() => window.localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
}

async function registerUser(page, user) {
  await page.getByRole('button', { name: 'Não tem conta? Criar nova.' }).click()
  await page.getByPlaceholder('Ex: João Silva').fill(user.name)
  await page.getByPlaceholder('Sua senha secreta').fill(user.password)
  await page.getByRole('button', { name: /Criar Conta/i }).click()
  await page.waitForSelector('header')
}

async function loginAdmin(page) {
  await page.getByPlaceholder('Ex: João Silva').fill('Admin')
  await page.getByPlaceholder('Sua senha secreta').fill('qwer')
  await page.getByRole('button', { name: /Entrar/i }).click()
  await page.waitForSelector('header')
}

async function logout(page) {
  await page.locator('header button').click()
  await page.waitForSelector('text=BOLÃO 2026')
}

async function groupSection(page, groupName) {
  return page.locator('div.relative').filter({
    has: page.getByRole('heading', { name: `GRUPO ${groupName}` }),
  }).first()
}

async function fillGroupPredictions(page, groupName, predictions) {
  const section = await groupSection(page, groupName)
  const matchCards = section.locator(':scope > div.space-y-3 > div')
  await matchCards.first().waitFor()

  for (let i = 0; i < groupMatchOrder[groupName].length; i += 1) {
    const [goalsA, goalsB] = predictions[i]
    if (goalsA === '' || goalsB === '') continue
    const inputs = matchCards.nth(i).locator('input[type="number"]')
    await inputs.nth(0).fill(String(goalsA))
    await inputs.nth(1).fill(String(goalsB))
  }
}

async function fillAllGroups(page, predictionsByGroup) {
  for (const groupName of Object.keys(groups)) {
    await fillGroupPredictions(page, groupName, predictionsByGroup[groupName])
  }
}

async function openKnockout(page) {
  await page.locator('nav button').nth(1).click()
  await page.waitForTimeout(300)
}

async function openGames(page) {
  await page.locator('nav button').nth(0).click()
  await page.waitForTimeout(300)
}

async function openRanking(page) {
  await page.locator('nav button').nth(2).click()
  await page.waitForSelector('table')
}

async function selectFirstR32Winner(page, teamName) {
  await openKnockout(page)
  const select = page.locator('main select').first()
  if (!teamName) return false
  const options = await select.locator('option').allTextContents()
  if (!options.includes(teamName)) return false
  await select.selectOption({ label: teamName })
  return true
}

async function readRanking(page) {
  return page.locator('tbody tr').evaluateAll((rows) => rows.map((row) => {
    const cells = Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() || '')
    return {
      position: cells[0],
      name: cells[1].replace(/\s+\(Você\)$/, ''),
      jogos: Number(cells[2]),
      mata: Number(cells[3]),
      total: Number(cells[4]),
    }
  }))
}

async function writeReport(data) {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
  await fs.mkdir(VIDEO_DIR, { recursive: true })

  const jsonPath = path.join(REPORT_DIR, 'e2e-simulation-report.json')
  const mdPath = path.join(REPORT_DIR, 'e2e-simulation-report.md')

  await fs.writeFile(jsonPath, JSON.stringify(data, null, 2))

  const lines = [
    '# Relatório E2E do Bolão 2026',
    '',
    `- Data: ${new Date().toISOString()}`,
    `- URL testada: ${APP_URL}`,
    `- Status: ${data.success ? 'PASSOU' : 'FALHOU'}`,
    '',
    '## Cenário',
    '',
    '- 5 usuários cadastrados e preenchidos via UI.',
    '- 1 admin (`Admin` / `qwer`) preenchendo resultados oficiais via UI.',
    '- Todos os 12 grupos foram preenchidos para liberar corretamente o mata-mata.',
    '- Validação de pontuação da fase de grupos completa e do `JOGO 73` do mata-mata.',
    '',
    '## Resultado da comparação',
    '',
  ]

  for (const row of data.comparison) {
    lines.push(`- ${row.name}: esperado ${row.expected.total} (${row.expected.jogos} jogos + ${row.expected.mata} mata), exibido ${row.actual.total} (${row.actual.jogos} jogos + ${row.actual.mata} mata)${row.ok ? '' : ' [DIVERGENTE]'}`)
  }

  lines.push('', '## Observações', '')
  for (const note of data.notes) lines.push(`- ${note}`)
  lines.push('', '## Evidências', '')
  for (const shot of data.screenshots) lines.push(`- Screenshot: ${shot}`)
  for (const video of data.videos) lines.push(`- Vídeo: ${video}`)

  await fs.writeFile(mdPath, `${lines.join('\n')}\n`)
  return { jsonPath, mdPath }
}

async function main() {
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true })
  await fs.mkdir(VIDEO_DIR, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 2200 },
    recordVideo: { dir: VIDEO_DIR, size: { width: 1280, height: 720 } },
  })
  const page = await context.newPage()

  try {
    await clearAppState(page)

    const userResults = []
    for (const user of users) {
      await registerUser(page, user)
      await openGames(page)
      await fillAllGroups(page, user.predictions)
      const selected = await selectFirstR32Winner(page, user.r32Pick)
      userResults.push({ name: user.name, r32Selected: selected ? user.r32Pick : null })
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${user.name.toLowerCase()}-filled.png`), fullPage: true })
      await logout(page)
    }

    await loginAdmin(page)
    await openGames(page)
    await fillAllGroups(page, baselinePredictions)
    await selectFirstR32Winner(page, officialR32Winner)
    await openRanking(page)
    const ranking = await readRanking(page)
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'ranking-final.png'), fullPage: true })

    const expected = computeExpected(users.map((user) => {
      const result = userResults.find((entry) => entry.name === user.name)
      return { ...clone(user), r32Pick: result?.r32Selected ?? null }
    }))

    const comparison = users.map((user) => {
      const actual = ranking.find((row) => row.name === user.name) || { jogos: NaN, mata: NaN, total: NaN }
      const expectedRow = expected[user.name]
      const ok = actual.jogos === expectedRow.jogos && actual.mata === expectedRow.mata && actual.total === expectedRow.total
      return { name: user.name, expected: expectedRow, actual, ok }
    })

    const success = comparison.every((item) => item.ok)
    const adminRow = ranking.find((row) => row.name === 'Admin')

    await context.close()

    const videos = (await fs.readdir(VIDEO_DIR))
      .filter((file) => file.endsWith('.webm'))
      .map((file) => path.join(VIDEO_DIR, file))

    const notes = [
      success
        ? 'Pontuação dos 5 usuários bateu com o cálculo esperado neste cenário.'
        : 'Houve divergência entre a pontuação exibida e a esperada.',
      adminRow
        ? `O usuário Admin aparece no ranking com total ${adminRow.total}.`
        : 'O usuário Admin não aparece no ranking.',
      'As capturas incluem o estado após o preenchimento de cada usuário e a tabela final do ranking.',
    ]

    const reportPaths = await writeReport({
      success,
      ranking,
      comparison,
      notes,
      screenshots: [
        path.join(SCREENSHOT_DIR, 'ana-filled.png'),
        path.join(SCREENSHOT_DIR, 'bruno-filled.png'),
        path.join(SCREENSHOT_DIR, 'carla-filled.png'),
        path.join(SCREENSHOT_DIR, 'diego-filled.png'),
        path.join(SCREENSHOT_DIR, 'eva-filled.png'),
        path.join(SCREENSHOT_DIR, 'ranking-final.png'),
      ],
      videos,
    })

    if (!success) {
      throw new Error(`Pontuação divergente. Relatórios em ${reportPaths.mdPath} e ${reportPaths.jsonPath}`)
    }

    console.log(JSON.stringify({ success, reportPaths, comparison, notes, videos }, null, 2))
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

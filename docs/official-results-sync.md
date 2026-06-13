# Sync automático de resultados oficiais

## Variáveis de ambiente

```bash
OFFICIAL_RESULTS_PROVIDER=espn
OFFICIAL_RESULTS_AUTO_APPLY=true
OFFICIAL_RESULTS_DRY_RUN=false
OFFICIAL_RESULTS_REMOTE_BASE=https://mantledb.sh/v2
OFFICIAL_RESULTS_REMOTE_NAMESPACE=lhgcampos-bolao2026-live-20260609
ESPN_WORLD_CUP_START_DATE=20260611
ESPN_WORLD_CUP_END_DATE=20260719
```

## Providers suportados

- `espn` (gratuito, sem token)
- `football-data`
- `openfootball` (somente apoio de calendário/comparação, não aplica sozinho)
- múltiplos providers em fallback por comparação: `espn,openfootball`

## Execução manual

```bash
npm run sync:official-results
```

## Cron sugerido

```bash
*/10 * * * * cd /caminho/do/projeto && npm run sync:official-results >> /var/log/bolao-official-results.log 2>&1
```

## GitHub Actions

O repositório inclui o workflow `.github/workflows/sync-official-results.yml`, que roda a cada 10 minutos e também permite execução manual.

## Regras operacionais

- Só aplica resultado com status final reconhecido.
- Não sobrescreve jogo com `manualOverride`.
- Em conflito entre providers para o mesmo jogo, o sync registra conflito e não aplica nada.
- `OFFICIAL_RESULTS_DRY_RUN=true` mantém relatório sem gravar no storage remoto.

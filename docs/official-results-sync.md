# Sync automático de resultados oficiais

## Variáveis de ambiente

```bash
FOOTBALL_DATA_API_TOKEN=
OFFICIAL_RESULTS_PROVIDER=football-data
OFFICIAL_RESULTS_AUTO_APPLY=true
OFFICIAL_RESULTS_DRY_RUN=false
OFFICIAL_RESULTS_REMOTE_BASE=https://mantledb.sh/v2
OFFICIAL_RESULTS_REMOTE_NAMESPACE=lhgcampos-bolao2026-live-20260609
```

## Providers suportados

- `football-data`
- `openfootball` (somente apoio de calendário/comparação, não aplica sozinho)
- múltiplos providers em fallback por comparação: `football-data,openfootball`

## Execução manual

```bash
npm run sync:official-results
```

## Cron sugerido

```bash
*/10 * * * * cd /caminho/do/projeto && FOOTBALL_DATA_API_TOKEN=... npm run sync:official-results >> /var/log/bolao-official-results.log 2>&1
```

## Regras operacionais

- Só aplica resultado com status final reconhecido.
- Não sobrescreve jogo com `manualOverride`.
- Em conflito entre providers para o mesmo jogo, o sync registra conflito e não aplica nada.
- `OFFICIAL_RESULTS_DRY_RUN=true` mantém relatório sem gravar no storage remoto.

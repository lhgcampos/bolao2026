# Auto-sync oficial de resultados

## O que mudou

O fluxo principal agora é um job server-side agendado no Cloudflare Worker `workers/official-results-sync.js`.

Ele:

- busca resultados finais em provider gratuito server-side
- aplica automaticamente apenas placares finalizados e validados
- grava histórico por jogo
- grava diagnóstico global em `official-results-sync-status` e `official-results-sync-history`
- respeita `manualLock` para não sobrescrever correções manuais
- atualiza `matches` e `official-knockout`, fazendo o ranking refletir o novo gabarito pelo fluxo normal do app

O script `npm run sync:official-results` ficou apenas como runner de suporte para debug e dry-run local. Ele não é mais o mecanismo principal de produção.

## Provider principal

Prioridade atual:

- `football-data`
- `api-football` como fallback opcional

Não há scraping de ESPN/FIFA/HTML e nenhum token vai para o frontend.

## Variáveis server-side

```bash
OFFICIAL_RESULTS_PROVIDER=football-data
OFFICIAL_RESULTS_AUTO_APPLY=true
OFFICIAL_RESULTS_DRY_RUN=false
OFFICIAL_RESULTS_REMOTE_BASE=https://mantledb.sh/v2
OFFICIAL_RESULTS_REMOTE_NAMESPACE=lhgcampos-bolao2026-live-20260609
FOOTBALL_DATA_API_TOKEN=
FOOTBALL_DATA_COMPETITION_CODE=WC
FOOTBALL_DATA_SEASON=2026
API_FOOTBALL_KEY=
API_FOOTBALL_LEAGUE_ID=1
API_FOOTBALL_SEASON=2026
OFFICIAL_RESULTS_SYNC_HISTORY_LIMIT=40
```

## Cloudflare Cron

Config principal:

- [cloudflare/official-results-sync.wrangler.toml](/Users/luizcampos/Desktop/PROJ/bolao2026/cloudflare/official-results-sync.wrangler.toml)

Cron ativo:

```txt
*/10 * * * *
```

## Execução local de suporte

```bash
OFFICIAL_RESULTS_DRY_RUN=true npm run sync:official-results
```

## Regras operacionais

- só aplica resultado com status final reconhecido
- não aplica jogo ao vivo, parcial, suspenso, cancelado ou adiado
- não aplica quando o match local não bate com segurança por times e horário
- não sobrescreve jogo com `manualLock`
- em conflito entre providers para o mesmo jogo, registra conflito e não aplica
- `OFFICIAL_RESULTS_DRY_RUN=true` gera relatório sem gravar no storage remoto

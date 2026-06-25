## Avatar Upload Worker

Este worker recebe um `data:image/...;base64,...` do front e grava o arquivo no R2.

### Variáveis esperadas

- `AVATARS_BUCKET`
  - Binding R2 com os arquivos dos avatares.
- `PUBLIC_AVATAR_BASE_URL`
  - URL pública usada para servir os arquivos.
  - Exemplo: `https://pub-xxxxxxxx.r2.dev`
- `ALLOWED_ORIGINS`
  - Lista separada por vírgula com as origens autorizadas a chamar o upload.
  - Exemplo: `https://lhgcampos.github.io,http://localhost:5174,http://127.0.0.1:4175`

### Contrato do endpoint

`POST` JSON:

```json
{
  "userId": "1781031132421",
  "userName": "LuizH",
  "fileName": "avatar-1781031132421.webp",
  "contentType": "image/webp",
  "imageDataUrl": "data:image/webp;base64,..."
}
```

Resposta:

```json
{
  "ok": true,
  "key": "avatars/1781031132421/1781119999999-luizh.webp",
  "avatarUrl": "https://pub-xxxxxxxx.r2.dev/avatars/1781031132421/1781119999999-luizh.webp"
}
```

### Front-end

Configure no build do Vite:

- `VITE_AVATAR_UPLOAD_URL`
- `VITE_AVATAR_PUBLIC_BASE_URL`

Se `VITE_AVATAR_UPLOAD_URL` não estiver configurada, o app mantém fallback inline comprimido para não quebrar usuários existentes.

## Official Results Sync Worker

O arquivo [cloudflare/official-results-sync.wrangler.toml](/Users/luizcampos/Desktop/PROJ/bolao2026/cloudflare/official-results-sync.wrangler.toml) configura o worker cron do auto-sync oficial.

Pontos principais:

- entrypoint: [workers/official-results-sync.js](/Users/luizcampos/Desktop/PROJ/bolao2026/workers/official-results-sync.js)
- cron: `*/10 * * * *`
- provider principal: `football-data`
- fallback opcional: `api-football`

Secrets esperados no deploy:

- `FOOTBALL_DATA_API_TOKEN`
- `API_FOOTBALL_KEY` opcional

Esse worker atualiza:

- `matches`
- `official-knockout`
- `official-bracket-slots`
- `official-results-sync-status`
- `official-results-sync-history`

Vars adicionais do bracket oficial FIFA:

- `OFFICIAL_BRACKET_SLOTS_ENABLED=true`
- `FIFA_BRACKET_SEASON_ID=285023`
- `FIFA_BRACKET_LANGUAGE=en`

O frontend só consome esse estado remoto; ele não chama providers externos nem exige confirmação manual para aplicar placares finais.

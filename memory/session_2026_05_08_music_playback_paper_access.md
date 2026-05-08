# Session 2026-05-08 - Music Playback Paper Access

## Pedido

Verificar por que no reproduce musica en la invitacion personalizada:

- Evento: `boda-conce-eume`
- Token: `772d591daff904d71ad225945a15f19caea2b7d483781fbcb10b547bc5e1787e`
- Link de musica esperado: `https://youtu.be/Zp9V76_1dTY?list=PL5tjfSPzC_uq1RTTFgLOpz3CD2TnLveUb`

## Hallazgos

- Produccion en Pi ya tenia la musica guardada correctamente en `event_config.music`.
- La invitacion personalizada tambien recibia el `event_config.music` correcto desde `/api/events/boda-conce-eume/invitations/{token}`.
- El evento usa `invitation_skin = paper-access`.
- `music.autoplay = true`, pero navegadores modernos pueden bloquear autoplay sin gesto explicito del usuario.
- En `PaperAccessSkin`, la tarjeta visible de musica mostraba la pista, pero no estaba conectada al reproductor global `MusicPlayer`.
- `MusicPlayer` podia extraer el video ID de `youtu.be/Zp9V76_1dTY`, pero no preservaba el parametro `list` de playlists en el embed.

## Decisiones

- Mantener `music` como configuracion parametrizada del evento, sin hardcodear URL ni datos de boda en componentes.
- Agregar un canal interno de eventos de UI para pedir reproduccion al reproductor global desde skins desacopladas.
- Conectar la tarjeta de musica de `paper-access` al reproductor real usando gesto explicito del usuario.
- Preservar `list` en links de YouTube para soportar URLs con playlist.

## Cambios Implementados

- `frontend/src/lib/musicPlayerEvents.ts`
  - Define `eventique:music-player:play`.
  - Define `eventique:music-player:toggle`.
  - Expone helpers `requestMusicPlayback()` y `requestMusicToggle()`.

- `frontend/src/components/MusicPlayer.tsx`
  - Soporta parametro `list` en embed de YouTube.
  - Escucha eventos globales de reproduccion/toggle.
  - Centraliza `playCurrent`, `pauseCurrent` y `toggle` con `useCallback`.

- `frontend/src/sections/PaperAccessSkin.tsx`
  - La tarjeta `MusicPaperCard` ahora usa un `button` accesible.
  - El boton dispara `requestMusicPlayback()` y reproduce la pista actual.

## Validaciones

- Build local: `npm run build` en `frontend` OK.
- Deploy Pi:
  - `docker compose build frontend`
  - `docker compose up -d frontend`
  - `docker compose ps` con `frontend` healthy.
- Ruta publica validada:
  - `GET http://localhost:5176/e/boda-conce-eume/i/772d...` responde `200 OK`.
- Config personalizada validada:
  - `skin = paper-access`
  - `music.enabled = true`
  - `music.autoplay = true`
  - `tracks[0].url = https://youtu.be/Zp9V76_1dTY?list=PL5tjfSPzC_uq1RTTFgLOpz3CD2TnLveUb`
- Suite funcional Pi:
  - `docs/test_suite.py` contra `http://localhost:5176/api`
  - Resultado: `56/56` OK.

## Estado

El problema no era falta de configuracion del link. Era una desconexion UX/logica entre la tarjeta de musica del nuevo formato `paper-access` y el reproductor global, agravada por politicas de autoplay del navegador. Queda corregido y desplegado en Pi.

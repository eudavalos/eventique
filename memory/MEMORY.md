# Eventique - Memory Index

**Last Updated**: 2026-05-10 (stable maps links all skins)

---

## Sessions

- [session_2026_05_10_stable_maps_links_all_skins.md](session_2026_05_10_stable_maps_links_all_skins.md) - Capa comun `getVenueMapsUrl` para evitar Firebase Dynamic Links en todas las plantillas; produccion actualizada a URLs finales Google Maps; deploy Pi, suite 57/57 y validacion Playwright mobile.
- [session_2026_05_09_mobile_venue_scroll.md](session_2026_05_09_mobile_venue_scroll.md) - Ajuste mobile para `VenuesEnvelope`: cada recinto como panel/hoja con altura util, scroll-margin, snap de proximidad, indicador entre lugares, deploy Pi y validacion Playwright mobile.
- [session_2026_05_09_personalized_rsvp_decline_fix.md](session_2026_05_09_personalized_rsvp_decline_fix.md) - Correccion del error React #31 al rechazar RSVP personalizado: backend acepta `guest_count=0` solo si `attending=false`, frontend normaliza errores API estructurados, deploy Pi, prueba real y suite 57/57.
- [session_2026_05_09_realistic_floral_decor_envelope_paper.md](session_2026_05_09_realistic_floral_decor_envelope_paper.md) - Decoracion floral realista reutilizable para `Envelope (GO Party)` y `Paper Access`, con pinoquio verde + rosas blancas, controles Admin por skin, decoracion por-card, deploy Pi y suite 56/56.
- [session_2026_05_09_paper_floral_decor.md](session_2026_05_09_paper_floral_decor.md) - Decoracion parametrizada para `paper-access` con pinoquio verde y rosas blancas; Admin controla enabled/style/density/opacity, deploy Pi, token activo validado y suite 56/56.
- [session_2026_05_08_toggle_paper_music_card.md](session_2026_05_08_toggle_paper_music_card.md) - Nuevo flag parametrizado `paper_music_card_enabled` para mostrar/ocultar la tarjeta completa de musica en `paper-access`; Admin checkbox, merge/config/tipos/test/catalogo, deploy Pi y suite 56/56.
- [session_2026_05_08_remove_paper_music_prompt.md](session_2026_05_08_remove_paper_music_prompt.md) - Remocion parametrizada del texto superior de la tarjeta de musica `paper-access`; `paper_music_prompt` vacio ya no renderiza y Admin puede persistir string vacio; deploy Pi y suite 56/56.
- [session_2026_05_08_music_playback_paper_access.md](session_2026_05_08_music_playback_paper_access.md) - Investigacion de musica en `paper-access`: link YouTube estaba guardado, la tarjeta visible no disparaba el reproductor; se agrego canal interno `eventique:music-player:*`, soporte playlist `list`, deploy Pi y suite 56/56.
- [session_2026_05_08_personalized_config_investigation.md](session_2026_05_08_personalized_config_investigation.md) - Investigacion de link personalizado `772d...`; config `paper-access` es por evento, hay duplicado operativo de invitado Ilde, y se reforzo `App.tsx` para aplicar `event_config` del payload personalizado como fallback inmediato.
- [session_2026_05_08_qa50_event_scenarios.md](session_2026_05_08_qa50_event_scenarios.md) - Catalogo parametrizado de 50 escenarios QA, runner API para Pi, cobertura de tipos/skins/modos/musica/regalos/recintos/RSVP/invitados, documentacion operativa.
- [session_2026_05_08_paper_access_skin.md](session_2026_05_08_paper_access_skin.md) - Implementacion de nueva skin `paper-access`, paleta `paper-olive`, configuracion full desde Admin, merge explicito, test `TC-020A`, deploy Pi y suite 56/56.
- [session_2026_05_08_example2_reference_analysis.md](session_2026_05_08_example2_reference_analysis.md) - Analisis exhaustivo de `docs/example2`: video vertical Canva/Amorea style, 15 frames, estetica papel/off-white/olive/callas, secciones detectadas, implicacion de nueva skin `paper-access`/`canva-floral`.
- [session_2026_05_08_whatsapp_preview_shortlinks.md](session_2026_05_08_whatsapp_preview_shortlinks.md) - WhatsApp preview con Open Graph, link corto/enmascarado `/s/{short_code}` de 16 chars, `{invitation_url}` usa short_url, asset `og-eventique.jpg`, deploy Pi, commit ec68c63, protocolo de memoria reforzado por iteracion.
- [session_2026_04_26_fases5_7_implementation.md](session_2026_04_26_fases5_7_implementation.md) - Fases 5-7: Admin dashboard, safe empty states public UX, SMTP validation + health endpoint.
- [session_2026_04_26_hallazgos_implementation.md](session_2026_04_26_hallazgos_implementation.md) - Hallazgos audit implementation: token endpoint, Swagger docs, RSVP nav.
- [session_2026_04_26_phases11_12_complete.md](session_2026_04_26_phases11_12_complete.md) - Fases 11-12: testing checklist + deployment scripts.

---

## Current Rules

- Guardar memoria/contexto en cada iteracion relevante del chat: investigacion, decisiones, requerimientos, problemas, validaciones, deploys y commits.
- Actualizar `CLAUDE.md`, `settings.local.json` y el indice de memoria cuando cambie arquitectura, negocio, endpoints, deploy o protocolo operativo.
- La memoria externa canonica sigue en `C:/Users/EuDavalos/.claude/projects/D--Proyectos-Eventos-Boda/memory/`.

# Eventique - Memory Index

**Last Updated**: 2026-05-08 (QA 50 event scenarios + Paper Access skin + example2 reference + WhatsApp preview)

---

## Sessions

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

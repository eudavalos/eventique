-- Script para crear eventos de prueba en SQLite
-- Uso: sqlite3 data/eventique.db < scripts/create_test_events.sql

-- 1. BODA — Concepción & Eumelio
INSERT OR IGNORE INTO events (slug, name, admin_token, created_at)
VALUES ('boda-concepcion-eumelio', 'Boda Concepción & Eumelio', 'token-boda-concepcion-eumelio', datetime('now'));

INSERT OR IGNORE INTO event_config (event_slug, event_type, config_json, updated_at)
VALUES ('boda-concepcion-eumelio', 'boda', '{"eventName":"Concepción & Eumelio","eventDate":"2026-12-05T00:00:00","eventType":"boda","venue":{"name":"Salón de Eventos","location":"CDMX"},"palette":"nature","sections":{"hero":{"enabled":true,"subtitle":"Nos alegra invitarte"},"countdown":{"enabled":true,"label":"Nos casamos en"},"ourStory":{"enabled":true,"title":"Nuestra Historia"},"schedule":{"enabled":true,"title":"Agenda del Día"},"accommodation":{"enabled":true,"title":"Dónde Hospedarse"},"gallery":{"enabled":true,"title":"Momentos"},"rsvp":{"enabled":true,"title":"Confirma tu asistencia"},"footer":{"enabled":true}}}', datetime('now'));

-- 2. CUMPLEAÑOS — Ana 30 años
INSERT OR IGNORE INTO events (slug, name, admin_token, created_at)
VALUES ('cumple-ana-30', 'Cumpleaños Ana - 30 años', 'token-cumple-ana-30', datetime('now'));

INSERT OR IGNORE INTO event_config (event_slug, event_type, config_json, updated_at)
VALUES ('cumple-ana-30', 'cumpleaños', '{"eventName":"Ana cumple 30","eventDate":"2026-06-10T18:00:00","eventType":"cumpleaños","venue":{"name":"Rooftop Bar","location":"CDMX"},"palette":"modern","sections":{"hero":{"enabled":true,"subtitle":"¡Celebra conmigo!"},"countdown":{"enabled":true,"label":"Falta"},"gallery":{"enabled":true,"title":"Momentos"},"rsvp":{"enabled":true,"title":"¿Vienes?"},"footer":{"enabled":true}}}', datetime('now'));

-- 3. BAUTISMO — Sofía & Lucas
INSERT OR IGNORE INTO events (slug, name, admin_token, created_at)
VALUES ('bautismo-sofialucas', 'Bautismo Sofía & Lucas', 'token-bautismo-sofialucas', datetime('now'));

INSERT OR IGNORE INTO event_config (event_slug, event_type, config_json, updated_at)
VALUES ('bautismo-sofialucas', 'bautismo', '{"eventName":"Bautismo de Sofía y Lucas","eventDate":"2026-06-25T12:00:00","eventType":"bautismo","venue":{"name":"Iglesia San José","location":"Querétaro"},"palette":"soft","sections":{"hero":{"enabled":true,"subtitle":"Los bendecimos"},"countdown":{"enabled":true},"ourStory":{"enabled":true,"title":"Nuestras Historias"},"schedule":{"enabled":true},"accommodation":{"enabled":true},"gallery":{"enabled":true},"rsvp":{"enabled":true},"footer":{"enabled":true}}}', datetime('now'));

-- 4. QUINCEAÑERA — Isabel
INSERT OR IGNORE INTO events (slug, name, admin_token, created_at)
VALUES ('quinceañera-isabel', 'Quinceañera Isabel', 'token-quinceañera-isabel', datetime('now'));

INSERT OR IGNORE INTO event_config (event_slug, event_type, config_json, updated_at)
VALUES ('quinceañera-isabel', 'quinceañera', '{"eventName":"Isabel Cumple 15","eventDate":"2026-07-25T19:00:00","eventType":"quinceañera","venue":{"name":"Salón Versalles","location":"Guanajuato"},"palette":"romantic","sections":{"hero":{"enabled":true,"subtitle":"De niña a mujer"},"countdown":{"enabled":true,"label":"Ya falta poco"},"ourStory":{"enabled":true,"title":"Mi Vida en 15 Años"},"schedule":{"enabled":true,"title":"Itinerario"},"gallery":{"enabled":true,"title":"Galería"},"rsvp":{"enabled":true,"title":"Confirma tu asistencia"},"footer":{"enabled":true}}}', datetime('now'));

-- 5. CORPORATIVO — TechConf 2026
INSERT OR IGNORE INTO events (slug, name, admin_token, created_at)
VALUES ('corporativo-techconf2026', 'Conferencia Tech 2026', 'token-corporativo-techconf2026', datetime('now'));

INSERT OR IGNORE INTO event_config (event_slug, event_type, config_json, updated_at)
VALUES ('corporativo-techconf2026', 'corporativo', '{"eventName":"TechConf 2026","eventDate":"2026-08-24T09:00:00","eventType":"corporativo","venue":{"name":"Centro de Convenciones","location":"CDMX"},"palette":"corporate","sections":{"hero":{"enabled":true,"subtitle":"Únete a nosotros"},"countdown":{"enabled":true,"label":"Próximamente"},"schedule":{"enabled":true,"title":"Agenda de Conferencias"},"accommodation":{"enabled":true,"title":"Hoteles Recomendados"},"gallery":{"enabled":true,"title":"Ediciones Anteriores"},"rsvp":{"enabled":true,"title":"Registrate"},"footer":{"enabled":true}}}', datetime('now'));

-- Verificar eventos creados
SELECT 'EVENTOS CREADOS:' as resultado;
SELECT slug, name, 'local: http://localhost:5176/e/' || slug as url_local, 'prod: https://eventique.tecnopowerpy.top/e/' || slug as url_prod FROM events ORDER BY created_at DESC;

# ORDEN MAESTRA PARA CLAUDE CODE HAIKU — EVENTIQUE ENTERPRISE

## Contexto del proyecto

Repositorio: `https://github.com/eudavalos/eventique`  
Proyecto: **Eventique** — plataforma de invitaciones digitales multi-evento, con frontend React/Vite, backend FastAPI, SQLite, Docker Compose, Nginx y despliegue en Raspberry Pi.

Estado actual detectado en el proyecto:

- Ya existe arquitectura multi-evento mediante `Event`, `EventConfig`, `RSVP` y `Media`.
- Ya existe API FastAPI con autenticación Bearer, configuración centralizada, rate limit parcial, sanitización parcial, subida de media, RSVP, eventos y configuración dinámica.
- Ya existe admin web con secciones, eventos, media, RSVP, temas, QR y configuración visual.
- Ya existe conversión frontend de RSVP camelCase a payload backend snake_case.
- **No existe todavía un módulo completo enterprise de lista de invitados / invitaciones personalizadas / cupos exactos / enlaces únicos / tracking de apertura / RSVP vinculado al invitado.**

Esta orden tiene prioridad sobre cualquier interpretación débil o incompleta. El objetivo es implementar una funcionalidad robusta, profesional, parametrizable y usable por personas no técnicas.

---

# MISIÓN PRINCIPAL

Implementar en Eventique un módulo enterprise completo de **Invitados e Invitaciones Digitales Personalizadas**, de inicio a fin, con administración, seguridad, control, UX/UI, pruebas funcionales locales, documentación, memoria de contexto y preparación para despliegue en Raspberry Pi.

La aplicación debe quedar funcional en ambos modos:

1. **Modo genérico:** una invitación pública por evento.
2. **Modo personalizado:** invitación única por invitado/familia con saludo dinámico, cupos exactos, link único, QR único, RSVP asociado, tracking de apertura y reglas condicionales.
3. **Modo híbrido:** permite invitación pública y también invitaciones personalizadas.

---

# REGLAS ABSOLUTAS DE EJECUCIÓN

## 1. Prohibido hardcodear

NO SE ACEPTA ninguna línea de hardcodeo innecesario.

Todo valor configurable debe venir de una de estas fuentes, según corresponda:

- Variables de entorno vía `.env` y `api/settings.py`.
- Configuración dinámica por evento guardada en base de datos.
- `settings.local.json` para valores técnicos del proyecto/contexto.
- Constantes tipadas centralizadas si son valores de dominio estables y documentados.
- Formularios de administración si el valor debe ser modificable por usuario no técnico.

Ejemplos de cosas que NO deben quedar hardcodeadas:

- Textos visibles al usuario final.
- Límites de cupos.
- Estados visibles.
- Máximos de importación.
- Rutas públicas base.
- Formatos de CSV.
- Políticas de tracking.
- Días de expiración de invitación.
- Reglas de RSVP.
- Mensajes de error.
- Configuración de seguridad.
- URL de producción.
- Configuración de email.
- Nombres de eventos, invitados, novios, sedes o datos reales.

Si falta un dato real, NO inventarlo. Crear un campo configurable, usar placeholder claramente marcado o documentar el dato pendiente.

## 2. No romper funcionalidad existente

Mantener funcionando:

- Invitación genérica `/e/:slug`.
- Evento default `/`.
- Admin `/admin` y `/e/:slug/admin`.
- RSVP existente.
- Media upload.
- Configuración dinámica.
- Multi-evento.
- Docker Compose.
- Raspberry Pi deployment.

Cualquier cambio debe ser backward-compatible o tener migración segura.

## 3. UX/UI enterprise para usuario no técnico

Cada opción nueva debe tener:

- Título claro.
- Descripción corta.
- Ayuda contextual.
- Estados vacíos bien diseñados.
- Confirmaciones antes de acciones destructivas.
- Mensajes de éxito/error entendibles.
- Indicadores de carga.
- Validaciones visuales.
- Diseño responsive mobile/desktop.
- Accesibilidad básica: labels, foco, contraste, navegación por teclado cuando aplique.

El usuario no técnico debe poder entender qué hace cada botón sin leer código ni documentación técnica.

## 4. Seguridad primero

Implementar seguridad real, no decorativa:

- Tokens únicos no predecibles.
- No exponer tokens administrativos.
- No guardar tokens sensibles en texto plano cuando aplique.
- Validar permisos por evento.
- Validar cupos en backend, no solo frontend.
- Validar que un invitado no pueda confirmar cupos superiores a los asignados.
- Evitar enumeración de invitados.
- Rate limiting para endpoints públicos sensibles.
- Sanitización de inputs.
- Validaciones Pydantic estrictas.
- Control de archivos importados.
- No filtrar información de otros invitados.
- No devolver datos internos innecesarios en endpoints públicos.

## 5. Iteración automática

Trabaja por fases. Al terminar una fase, pasar automáticamente a la siguiente.

Solo detenerse ante:

- Riesgo destructivo irreversible sin backup.
- Credenciales faltantes para conectar a Raspberry Pi.
- Error externo no resoluble localmente.
- Ambigüedad que cambie el modelo de negocio de forma crítica.

En esos casos, documentar claramente el bloqueo, pero avanzar con todo lo demás que sea posible.

## 6. Memoria y documentación obligatoria por iteración

En cada iteración significativa del trabajo, actualizar memoria/contexto del proyecto.

Realizar las siguientes tareas automáticamente:

0. Guardar todo lo investigado en memoria.
1. Guardar todas las validaciones en memoria.
2. Guardar lo importante en el contexto/memoria del proyecto.
3. Actuar como asistente de documentación técnica.
4. Analizar el contexto de la sesión y actualizar:
   - `CLAUDE.md`
   - `settings.local.json`
   - archivo de sesión en `memory/session_YYYY_MM_DD_<tema>.md`
   - índice `memory/MEMORY.md`

No repetir cosas irrelevantes. Priorizar arquitectura, lógica, decisiones, problemas, validaciones y negocio.

---

# FASE 0 — AUDITORÍA INICIAL Y BACKUP

Antes de tocar código:

1. Revisar estructura actual del repo.
2. Revisar `api/main.py`, `api/models.py`, `api/schemas.py`, `api/settings.py`, `api/database.py`.
3. Revisar `frontend/src/App.tsx`, `frontend/src/lib/api.ts`, `frontend/src/pages/AdminPage.tsx`, `frontend/src/types/index.ts`.
4. Revisar `docker-compose.yml`, `api/Dockerfile`, `frontend/Dockerfile`, `nginx/nginx.conf`.
5. Revisar `CLAUDE.md`, `settings.local.json`, `README.md`, `DEPLOY.md`.
6. Crear backup local de base de datos si existe:
   - `data/eventique.db`
   - cualquier archivo SQLite existente.
7. Crear branch de trabajo:
   - `feature/guest-invitations-enterprise`
8. Registrar en memoria:
   - fecha/hora
   - estado inicial
   - archivos revisados
   - riesgos detectados
   - plan de implementación

Criterio de aceptación:

- Existe backup si había DB.
- Existe branch de trabajo.
- Está documentado el estado inicial.

---

# FASE 1 — MODELO DE DATOS ENTERPRISE PARA INVITADOS

Diseñar e implementar entidades persistentes para invitaciones personalizadas.

## 1.1 Nuevas entidades requeridas

Agregar modelos SQLAlchemy, esquemas Pydantic y migraciones seguras para:

### GuestInvitation

Representa una invitación personalizada por persona, pareja, familia o grupo.

Campos mínimos:

- `id`
- `event_slug`
- `display_name`
- `contact_name`
- `email`
- `phone`
- `group_name`
- `guest_type`
- `status`
- `invitation_mode`
- `allowed_passes`
- `confirmed_passes`
- `declined_passes`
- `token_lookup`
- `token_hash`
- `public_slug`
- `notes`
- `tags_json`
- `conditional_flags_json`
- `metadata_json`
- `first_opened_at`
- `last_opened_at`
- `open_count`
- `last_rsvp_at`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `is_active`
- `blocked_reason`

### GuestMember

Representa miembros individuales dentro de una invitación familiar/grupal.

Campos mínimos:

- `id`
- `event_slug`
- `invitation_id`
- `full_name`
- `member_type`
- `age_group`
- `menu_preference`
- `dietary_restrictions`
- `attending`
- `notes`
- `created_at`
- `updated_at`

### InvitationOpenEvent

Registro de apertura/visualización.

Campos mínimos:

- `id`
- `event_slug`
- `invitation_id`
- `opened_at`
- `ip_hash`
- `user_agent_hash`
- `source`
- `metadata_json`

No guardar IP cruda salvo que esté parametrizado y documentado por privacidad.

### InvitationAuditLog

Auditoría de acciones administrativas.

Campos mínimos:

- `id`
- `event_slug`
- `entity_type`
- `entity_id`
- `action`
- `before_json`
- `after_json`
- `performed_at`
- `performed_by_type`
- `performed_by_ref`

## 1.2 Estados permitidos

Centralizar estados en tipos/enums documentados:

- `draft`
- `pending`
- `sent`
- `opened`
- `confirmed`
- `declined`
- `partial`
- `blocked`
- `expired`

No usar strings sueltos repetidos por el código.

## 1.3 Modos de invitación por evento

Agregar a configuración de evento:

- `invitation_mode`: `generic | personalized | hybrid`
- `allow_public_rsvp`
- `require_invitation_token_for_rsvp`
- `track_invitation_opens`
- `max_open_events_per_invitation`
- `invitation_token_expiration_days`
- `allow_guest_self_edit`
- `allow_guest_member_names`
- `allow_guest_count_change`
- `rsvp_enforce_pass_limit`
- `show_reserved_passes_message`
- `public_invitation_fallback_enabled`

Estos valores deben ser configurables desde admin y persistidos en DB.

Criterio de aceptación:

- Modelos creados.
- Migración segura creada.
- No se pierden datos existentes.
- App levanta con DB vacía y con DB existente.
- Eventos actuales siguen funcionando.

---

# FASE 2 — MIGRACIONES SEGURAS Y CONTROLADAS

El proyecto actualmente usa creación/migración manual en startup. Para esta funcionalidad, implementar una estrategia segura.

Requerimientos:

1. Antes de modificar tablas, crear backup automático configurable.
2. Implementar migraciones idempotentes.
3. Evitar carreras con múltiples workers.
4. Si se mantiene migración manual, encapsularla en un módulo dedicado, no dispersa en `main.py`.
5. Registrar versión de schema en tabla `schema_migrations` o equivalente.
6. Documentar cómo correr migraciones local y en Raspberry Pi.

Criterio de aceptación:

- Migración puede ejecutarse más de una vez sin romper.
- Migración funciona con DB existente.
- Migración funciona con DB limpia.
- Existe log claro de migración aplicada.

---

# FASE 3 — API BACKEND PARA INVITACIONES PERSONALIZADAS

Implementar endpoints FastAPI completos.

## 3.1 Endpoints públicos

### Obtener invitación personalizada

`GET /events/{event_slug}/invitations/{token}`

Debe:

- Validar token.
- Validar evento activo.
- Validar invitación activa.
- Registrar apertura si está habilitado.
- No exponer token hash ni datos internos.
- Retornar configuración pública del evento + datos personalizados mínimos.

Respuesta esperada:

- datos del evento
- datos visibles del invitado
- cupos permitidos
- estado RSVP
- flags condicionales
- secciones visibles
- mensajes personalizados
- URLs de mapas/calendario si existen

### Confirmar RSVP personalizado

`POST /events/{event_slug}/invitations/{token}/rsvp`

Debe:

- Validar token.
- Validar cupos.
- Asociar RSVP a `invitation_id`.
- Actualizar estado de invitación.
- Actualizar `confirmed_passes`, `declined_passes`, `last_rsvp_at`.
- Guardar restricciones alimentarias, canciones, mensaje y miembros si aplica.
- Enviar notificaciones si email está configurado.
- Responder con mensaje claro para frontend.

### Registrar apertura explícita opcional

`POST /events/{event_slug}/invitations/{token}/open`

Debe existir solo si aporta valor y no duplica el GET.

## 3.2 Endpoints administrativos

Todos deben requerir token admin del evento o superadmin.

### Invitados

- `GET /events/{event_slug}/guests`
- `POST /events/{event_slug}/guests`
- `GET /events/{event_slug}/guests/{id}`
- `PUT /events/{event_slug}/guests/{id}`
- `PATCH /events/{event_slug}/guests/{id}/status`
- `DELETE /events/{event_slug}/guests/{id}` o soft delete configurable
- `POST /events/{event_slug}/guests/{id}/regenerate-link`
- `GET /events/{event_slug}/guests/{id}/qr`
- `GET /events/{event_slug}/guests/{id}/audit`

### Importación/exportación

- `POST /events/{event_slug}/guests/import/preview`
- `POST /events/{event_slug}/guests/import/commit`
- `GET /events/{event_slug}/guests/export.csv`
- `GET /events/{event_slug}/guests/template.csv`

La importación debe tener modo preview antes de guardar.

### Estadísticas

- `GET /events/{event_slug}/guests/stats`

Debe devolver:

- total invitados/invitaciones
- cupos totales
- cupos confirmados
- cupos rechazados
- pendientes
- abiertos
- no abiertos
- confirmados
- rechazados
- parciales
- bloqueados
- tasa de apertura
- tasa de confirmación

## 3.3 Validaciones backend obligatorias

- `allowed_passes >= 0`
- `confirmed_passes <= allowed_passes`
- email válido si se proporciona
- phone sanitizado si se proporciona
- token único
- public_slug único por evento si aplica
- no permitir acciones sobre invitados de otro evento
- no devolver registros cross-tenant
- no permitir RSVP si invitación está bloqueada/expirada/inactiva
- no permitir superar cupo aunque el frontend sea manipulado

Criterio de aceptación:

- Endpoints funcionan con Swagger.
- Endpoints devuelven errores claros.
- No hay fuga de datos internos.
- No hay acceso cross-event.

---

# FASE 4 — FRONTEND PÚBLICO DE INVITACIÓN PERSONALIZADA

Implementar ruta pública nueva:

`/e/:slug/i/:token`

Debe cargar:

- configuración dinámica del evento
- datos personalizados del invitado/familia
- cupos reservados
- secciones condicionales
- RSVP personalizado

## 4.1 UX pública requerida

La invitación debe mostrar, según configuración:

- Saludo dinámico:
  - `¡Hola Juan y María!`
  - `Familia González, nos encantaría que nos acompañen`
- Mensaje de cupos:
  - `Hemos reservado 2 lugares para ustedes.`
- Estado si ya confirmó:
  - `Ya recibimos tu confirmación. Puedes revisar los detalles aquí.`
- Botón RSVP claro.
- Botón Google Maps/Waze si hay URL configurada.
- Botón agregar al calendario.
- QR o pase digital si está habilitado.
- Información condicional solo para ese invitado.
- Diseño responsive premium.

## 4.2 Manejo de errores públicos

Crear pantallas profesionales para:

- Invitación no encontrada.
- Invitación expirada.
- Invitación bloqueada.
- Evento no encontrado.
- RSVP cerrado.
- Error de red.

Nunca mostrar mensajes técnicos crudos.

## 4.3 Privacidad

No mostrar email/teléfono del invitado salvo que esté configurado y sea necesario.

Criterio de aceptación:

- `/e/:slug/i/:token` carga correctamente.
- Saludo y cupos cambian según invitado.
- Secciones condicionales funcionan.
- Estados de error se ven profesionales.

---

# FASE 5 — RSVP PERSONALIZADO Y CONTROL DE CUPOS

Modificar el RSVP para soportar ambos flujos:

1. RSVP genérico existente.
2. RSVP personalizado asociado a invitación.

## 5.1 Reglas del RSVP personalizado

- Si la invitación tiene `allowed_passes = 2`, no permitir confirmar 3.
- Si `allow_guest_member_names = true`, permitir cargar nombres de asistentes.
- Si `allow_guest_count_change = false`, mostrar cupos fijos sin selector editable.
- Si `allow_guest_count_change = true`, permitir elegir hasta el máximo asignado.
- Si RSVP ya existe, mostrar estado y permitir edición solo si `allow_guest_self_edit = true`.
- Si RSVP está cerrado por fecha, bloquear con mensaje claro.

## 5.2 Datos a guardar

Guardar como mínimo:

- asistencia sí/no/parcial
- cantidad confirmada
- nombres de miembros si aplica
- restricciones alimentarias
- canción sugerida
- mensaje
- timestamp
- fuente: `generic` o `personalized`
- invitation_id si aplica

Criterio de aceptación:

- No se puede superar cupo desde UI ni manipulando payload.
- RSVP queda vinculado a la invitación correcta.
- Stats reflejan los cupos correctamente.

---

# FASE 6 — ADMIN UI ENTERPRISE PARA GUEST LIST

Agregar nueva pestaña principal en admin:

`Invitados`

Debe ser visible para admin del evento y superadmin.

## 6.1 Dashboard de invitados

Mostrar cards resumidas:

- Total invitaciones
- Cupos totales
- Confirmados
- Pendientes
- Abiertos
- No abiertos
- Rechazados
- Tasa de apertura
- Tasa de confirmación

## 6.2 Tabla/listado profesional

Columnas mínimas:

- Nombre visible
- Contacto
- Email/teléfono
- Cupos
- Confirmados
- Estado
- Aperturas
- Última apertura
- Último RSVP
- Tags
- Acciones

Acciones:

- Ver detalle
- Editar
- Copiar link
- Ver QR
- Regenerar link
- Bloquear/desbloquear
- Eliminar o archivar

Debe incluir:

- búsqueda
- filtros por estado
- filtros por tags
- ordenamiento
- paginación
- estados vacíos
- loading skeleton o loading claro
- exportar CSV
- importar CSV

## 6.3 Formulario crear/editar invitado

Debe ser entendible para usuario no técnico.

Campos:

- Nombre visible en invitación
- Nombre de contacto
- Email
- Teléfono
- Grupo/familia
- Cantidad de pases reservados
- Tipo de invitado
- Tags
- Notas internas
- Flags condicionales
- Estado
- Miembros del grupo/familia

Cada campo debe tener ayuda breve.

## 6.4 Importación CSV enterprise

Flujo obligatorio:

1. Descargar plantilla.
2. Subir CSV.
3. Validar archivo.
4. Mostrar preview.
5. Mostrar errores por fila.
6. Permitir corregir o cancelar.
7. Confirmar importación.
8. Mostrar resumen final.

Columnas sugeridas:

- `display_name`
- `contact_name`
- `email`
- `phone`
- `group_name`
- `allowed_passes`
- `guest_type`
- `tags`
- `conditional_flags`
- `notes`

No guardar nada durante preview.

## 6.5 QR y compartir

Cada invitado debe tener:

- link único
- botón copiar link
- QR individual
- descarga del QR como imagen si es viable
- vista previa del mensaje para WhatsApp

El texto de WhatsApp debe ser parametrizable desde admin, usando variables:

- `{display_name}`
- `{event_name}`
- `{invitation_url}`
- `{allowed_passes}`
- `{event_date}`

Criterio de aceptación:

- Usuario no técnico puede crear invitado, copiar link, ver QR y confirmar RSVP sin tocar código.
- Importación CSV tiene preview y validaciones.
- Admin no se rompe en mobile.

---

# FASE 7 — CONFIGURACIÓN DE MODO DE INVITACIÓN EN ADMIN

Agregar sección en configuración del evento:

`Modo de invitación`

Opciones:

- Genérica
- Personalizada
- Híbrida

Cada opción debe explicar consecuencias:

- Genérica: cualquiera con link puede ver/confirmar.
- Personalizada: solo invitados con link único pueden confirmar.
- Híbrida: permite ambos flujos.

Agregar toggles configurables:

- Requerir link personalizado para RSVP.
- Mostrar cupos reservados.
- Permitir edición de RSVP por invitado.
- Permitir que invitado escriba nombres de acompañantes.
- Permitir cambio de cantidad dentro del cupo.
- Registrar apertura de invitación.
- Habilitar secciones privadas.
- Habilitar QR por invitado.
- Habilitar mensaje WhatsApp personalizado.

Criterio de aceptación:

- Cambiar modo afecta comportamiento público inmediatamente en próximo page load.
- Configuración queda persistida.

---

# FASE 8 — SECCIONES CONDICIONALES POR INVITADO

Implementar lógica para que ciertas secciones o bloques se muestren solo a invitados con flags/tags.

Ejemplos:

- `after_party`
- `cena_ensayo`
- `ceremonia_civil`
- `solo_adultos`
- `menu_infantil`
- `transporte`
- `hospedaje_vip`
- `mesa_familia`

No hardcodear estos flags como única lista cerrada. Deben poder configurarse desde admin o desde configuración del evento.

## Requerimientos

- Admin debe permitir definir flags disponibles por evento.
- Invitado puede tener uno o varios flags.
- Las secciones pueden declarar visibilidad por flags.
- Frontend público filtra secciones según flags.
- Backend nunca debe devolver secciones privadas que no corresponden si el modo requiere privacidad fuerte.

Criterio de aceptación:

- Dos invitados del mismo evento pueden ver información distinta según flags.

---

# FASE 9 — TRACKING DE APERTURA Y ANALÍTICA

Implementar tracking respetuoso y configurable.

## 9.1 Datos mínimos

- Primera apertura.
- Última apertura.
- Cantidad de aperturas.
- Fuente/canal si viene por query param permitido.
- Estadísticas agregadas.

## 9.2 Privacidad

- No guardar IP cruda por defecto.
- Hashear IP/User-Agent si se usa para deduplicar.
- Hacer configurable el nivel de tracking.
- Documentar en admin qué significa tracking.

## 9.3 Admin analytics

Mostrar:

- invitaciones enviadas/creadas
- abiertas
- no abiertas
- confirmadas
- pendientes
- rechazadas
- últimas aperturas
- ranking de pendientes

Criterio de aceptación:

- Abrir una invitación actualiza tracking.
- Admin muestra métricas comprensibles.

---

# FASE 10 — SEGURIDAD Y CONTROL DE ACCESO

Endurecer seguridad de todo el flujo.

Requerimientos:

1. Tokens de invitación no predecibles.
2. Token público debe poder rotarse.
3. Guardar hash del token completo y un lookup corto no sensible para búsqueda eficiente si aplica.
4. No exponer token hash jamás.
5. Soft-delete o archivado configurable para invitados.
6. Rate limiting específico para:
   - obtener invitación
   - confirmar RSVP
   - check RSVP
   - importación CSV
   - regenerar links
7. Validar permisos por evento en cada endpoint admin.
8. Validar datos con Pydantic.
9. Sanitizar entradas de texto.
10. Registrar auditoría de acciones críticas.

Acciones críticas:

- crear invitado
- editar invitado
- eliminar/archivar invitado
- bloquear invitado
- regenerar link
- importar CSV
- modificar modo de invitación
- cambiar cupos

Criterio de aceptación:

- No hay endpoints públicos que filtren información interna.
- No hay acceso a invitados de otro evento.
- No hay superación de cupos.
- Acciones críticas quedan auditadas.

---

# FASE 11 — EMAIL / WHATSAPP / MENSAJES PARAMETRIZABLES

No implementar integraciones externas inventadas. Solo lo que se pueda hacer correctamente con lo disponible.

## 11.1 Email

Si SMTP está configurado:

- Permitir enviar confirmación al invitado.
- Permitir notificar al admin.
- Permitir plantilla configurable por evento.
- No hardcodear asunto ni contenido.

## 11.2 WhatsApp

No enviar automáticamente por WhatsApp si no hay API real configurada.

Implementar:

- Generador de mensaje WhatsApp.
- Botón abrir WhatsApp con link preparado.
- Plantilla configurable por evento.

Variables permitidas:

- `{display_name}`
- `{event_name}`
- `{event_date}`
- `{allowed_passes}`
- `{invitation_url}`
- `{rsvp_deadline}`

Criterio de aceptación:

- Admin puede copiar/abrir mensaje personalizado sin tocar código.

---

# FASE 12 — CALENDARIO, MAPAS Y LINKS ÚTILES

Agregar soporte profesional para:

- Google Maps
- Waze si URL está configurada
- Google Calendar
- Apple Calendar / archivo `.ics` si viable

Todo debe depender de config del evento.

No inventar ubicaciones, fechas ni direcciones.

Criterio de aceptación:

- Invitado puede abrir ubicación y calendario desde invitación personalizada.

---

# FASE 13 — PRUEBAS FUNCIONALES Y TÉCNICAS

Ejecutar pruebas locales completas.

## 13.1 Backend

Probar:

- Healthcheck.
- Crear evento.
- Crear invitado.
- Listar invitados.
- Obtener invitación pública por token.
- Registrar apertura.
- RSVP personalizado dentro de cupo.
- Intento de RSVP por encima del cupo debe fallar.
- Invitado bloqueado no puede confirmar.
- Export CSV.
- Import CSV preview.
- Import CSV commit.
- Regenerar link.
- Stats.

## 13.2 Frontend

Ejecutar:

- `npm install` si hace falta.
- `npm run lint` si está configurado.
- `npm run build`.
- Prueba manual local con navegador:
  - admin login
  - pestaña invitados
  - crear invitado
  - copiar link
  - abrir link personalizado
  - confirmar RSVP
  - revisar admin stats
  - probar mobile/responsive

## 13.3 Docker local

Ejecutar:

- `docker compose build`
- `docker compose up -d`
- `docker compose ps`
- `curl http://localhost:5176/`
- `curl http://localhost:5176/api/health`

## 13.4 Iteración obligatoria

Si algo falla:

1. Diagnosticar.
2. Corregir.
3. Volver a ejecutar pruebas.
4. Repetir hasta pasar.
5. Documentar cada error y corrección en memoria.

Criterio de aceptación:

- Build frontend pasa.
- API levanta.
- Docker levanta.
- Flujo personalizado completo funciona localmente.
- No hay errores TypeScript.
- No hay errores críticos en consola.

---

# FASE 14 — DOCUMENTACIÓN ENTERPRISE

Actualizar documentación:

## Archivos obligatorios

- `README.md`
- `DEPLOY.md`
- `CLAUDE.md`
- `settings.local.json`
- `memory/MEMORY.md`
- nuevo archivo `docs/GUEST_INVITATIONS.md`
- nuevo archivo `docs/TEST_PLAN_GUEST_INVITATIONS.md`

## Documentar

- Modelo de datos.
- Endpoints.
- Flujo admin.
- Flujo público.
- Modos de invitación.
- CSV template.
- Seguridad.
- Tracking.
- Pruebas realizadas.
- Cómo desplegar en Raspberry Pi.
- Cómo revertir si algo falla.

Criterio de aceptación:

- Documentación permite que otro desarrollador continúe el proyecto.
- Usuario no técnico entiende cómo usar el módulo.

---

# FASE 15 — SINCRONIZACIÓN Y DESPLIEGUE A RASPBERRY PI

Solo realizar esta fase después de pasar pruebas locales.

Destino: `eudavalos@raspberrypi`

## 15.1 Preparación

Antes de sincronizar:

1. Confirmar branch limpio o documentar archivos modificados.
2. Hacer backup local y remoto de DB.
3. Confirmar que `.env` remoto tiene variables necesarias.
4. Confirmar que no se suben secretos al repo.

## 15.2 Sincronización sugerida

Usar `rsync` o `scp` de forma segura.

Ejemplo orientativo, ajustar según estructura real:

```bash
rsync -av --exclude node_modules --exclude frontend/dist --exclude data --exclude uploads --exclude .env ./ eudavalos@raspberrypi:~/Boda/
```

## 15.3 Deploy remoto

En Raspberry Pi:

```bash
cd ~/Boda
docker compose build
docker compose up -d --force-recreate
docker compose ps
docker compose logs --tail=100
curl -s http://localhost:5176/ | head -5
curl -s http://localhost:5176/api/health
```

## 15.4 Validación remota

Validar:

- Invitación pública.
- Admin.
- Crear invitado.
- Abrir link personalizado.
- Confirmar RSVP.
- Ver stats.
- Ver logs sin errores críticos.

Si no hay acceso SSH o credenciales, documentar bloqueo claramente y dejar instrucciones exactas para ejecutar manualmente.

Criterio de aceptación:

- Aplicación funcionando en Raspberry Pi.
- Docker sano.
- Flujo personalizado operativo.

---

# FASE 16 — CRITERIOS FINALES DE ACEPTACIÓN

No considerar terminado hasta cumplir TODO:

- Existe módulo Invitados en admin.
- Se puede crear invitado/familia con cupos.
- Se genera link único y QR único.
- Invitación personalizada muestra saludo dinámico.
- Invitación personalizada muestra cupos reservados.
- RSVP personalizado respeta cupos en backend.
- RSVP queda asociado al invitado.
- Admin muestra estados y métricas.
- Tracking de apertura funciona.
- Importación CSV con preview funciona.
- Exportación CSV funciona.
- Secciones condicionales funcionan.
- Modo genérico sigue funcionando.
- Modo personalizado funciona.
- Modo híbrido funciona.
- No hay datos reales inventados.
- No hay hardcodeo innecesario.
- Configuración está centralizada/parametrizada.
- Build frontend pasa.
- API pasa healthcheck.
- Docker local pasa.
- Documentación actualizada.
- Memoria/contexto actualizados.
- Despliegue remoto validado o bloqueo documentado.

---

# SALIDA FINAL ESPERADA DE CLAUDE CODE

Al finalizar, entregar un resumen profesional con:

1. Fases ejecutadas.
2. Archivos modificados.
3. Modelos nuevos.
4. Endpoints nuevos.
5. Pantallas nuevas.
6. Variables nuevas de configuración.
7. Pruebas ejecutadas y resultado.
8. Comandos ejecutados.
9. Errores encontrados y solución.
10. Estado del despliegue local.
11. Estado del despliegue Raspberry Pi.
12. Pendientes reales, si existen.
13. Confirmación de que no se inventaron datos reales.
14. Confirmación de que no quedan hardcodeos innecesarios.

No declarar éxito si no se probaron las cosas. Si algo no pudo probarse, decir exactamente qué no se pudo probar y por qué.

---

# NOTA DE CALIDAD

Implementar esto como producto vendible. No como demo. No como parche. No como código rápido.

La meta es que Eventique deje de ser solo una invitación digital bonita y pase a ser una plataforma real de gestión de invitados, con experiencia personalizada, control logístico, cupos exactos, seguimiento y administración profesional.

# Orden Enterprise para Claude Code Haiku — Eventique

> Proyecto: `eudavalos/eventique`  
> Objetivo: dejar Eventique funcional, seguro, administrable, parametrizable y usable por usuarios no técnicos.  
> Modo de trabajo: implementación iterativa, fase por fase, sin pedir confirmación entre subtareas salvo acciones destructivas irreversibles.

---

## 1. Rol y nivel de exigencia

Actúa como **arquitecto senior full-stack, auditor de seguridad, diseñador UX/UI enterprise y DevOps engineer** para el proyecto Eventique.

Debes implementar, corregir, documentar, probar y preparar el despliegue de la aplicación con estándar profesional de producto vendible. El resultado debe ser robusto, mantenible, entendible para usuarios no técnicos y coherente con la arquitectura actual del proyecto.

No actúes como generador superficial de código. Debes analizar el proyecto real, detectar inconsistencias, corregirlas y validar el comportamiento completo.

---

## 2. Reglas absolutas

### 2.1 Cero hardcodeo injustificado

NO SE ACEPTA ninguna línea nueva de hardcodeo de valores configurables.

Todo valor que pueda cambiar por ambiente, cliente, evento, negocio, límite, texto visible, puerto, URL, tamaño, seguridad, feature flag, timeout, política o comportamiento debe estar parametrizado.

Valores parametrizables obligatorios:

- Puertos.
- URLs.
- Límites de subida.
- Tipos MIME permitidos.
- Extensiones permitidas.
- Timeouts.
- Número máximo de invitados.
- Textos visibles del sistema.
- Mensajes de error.
- Paletas, temas, fuentes.
- Configuración SMTP.
- Seguridad, rate limit, CORS.
- Parámetros de sesión/admin.
- Flags de funcionalidades.
- Rutas públicas y privadas.
- Opciones de UI.
- Reglas de validación de formularios.
- Configuración de despliegue.

Si encuentras un valor hardcodeado existente, clasifícalo:

1. Si es realmente constante técnica universal, documenta por qué puede quedarse.
2. Si es configurable, muévelo a configuración.
3. Si no sabes si debe ser configurable, no inventes: deja nota clara en memoria/contexto y usa una configuración segura por defecto.

### 2.2 No inventar

NO inventes rutas, archivos, variables, servicios, credenciales, dominios, tokens ni configuraciones.

Antes de modificar:

1. Inspecciona archivos reales.
2. Verifica nombres reales.
3. Revisa contratos frontend/backend.
4. Comprueba Docker, API, tipos y formularios.
5. Si falta información, usa un default parametrizado y documenta la incertidumbre.

### 2.3 No romper compatibilidad

Mantén compatibilidad con:

- Evento default `/`.
- Admin default `/admin`.
- Eventos multi-tenant `/e/:slug`.
- Admin por evento `/e/:slug/admin`.
- Endpoints legacy `/event-config`, `/rsvp`, `/rsvp/check`, etc.
- Despliegue actual en Raspberry Pi.
- Docker Compose actual.
- Cloudflare Tunnel como servicio externo del host, no dentro de Docker.

### 2.4 Seguridad primero

Todo flujo administrativo debe ser seguro por defecto:

- Tokens nunca deben exponerse públicamente.
- No guardar nuevos secretos en git.
- No imprimir tokens en consola.
- No loguear contraseñas, SMTP, tokens ni datos sensibles.
- Validar entradas en backend, no solo frontend.
- Validar permisos por evento.
- Separar superadmin de admin por evento.
- Evitar path traversal en media.
- Controlar tamaño y tipo real de archivos.
- Agregar rate limit configurable para endpoints sensibles.
- Endurecer headers HTTP.
- Mantener CORS parametrizado y estricto.
- Si se guarda token por evento, migrar hacia hash o implementar estrategia segura compatible.

### 2.5 UX/UI para usuario no técnico

Cada opción del admin debe ser clara para alguien sin conocimientos técnicos.

Debe existir:

- Etiqueta clara.
- Descripción breve.
- Placeholder útil.
- Validación visible.
- Mensajes de error entendibles.
- Confirmaciones antes de acciones destructivas.
- Feedback visual al guardar, cargar, fallar o completar.
- Estados vacíos profesionales.
- Estados de carga.
- Indicadores de cambios sin guardar.
- Diseño responsive.
- Navegación consistente.
- Separación clara entre configuración básica, contenido, multimedia, eventos, seguridad y publicación.

No uses nombres técnicos como `slug`, `event_config`, `JSON`, `token`, `payload` en UI final sin explicación simple.

---

## 3. Contexto técnico inicial conocido

El proyecto Eventique usa:

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion.
- Backend: FastAPI, SQLAlchemy, Pydantic v2, SQLite.
- Deploy: Docker Compose con Nginx + FastAPI.
- Producción objetivo: Raspberry Pi 5.
- API bajo `/api` vía Nginx.
- Base de datos en `/app/data/eventique.db`.
- Multi-tenancy por `event_slug`.
- Admin protegido por Bearer token.
- Media upload para imágenes/audio.
- Config dinámica guardada en SQLite.

Problemas detectados previamente que debes verificar y corregir:

1. Posible incompatibilidad frontend/backend en RSVP:
   - Frontend envía campos camelCase: `guestCount`, `dietaryRestrictions`, `songRequest`.
   - Backend espera snake_case: `guest_count`, `dietary_restrictions`, `song_request`.
   - Frontend usa `attending: "yes" | "no"`.
   - Backend espera `attending: bool`.

2. Variables SMTP:
   - `.env.example` define variables SMTP.
   - `docker-compose.yml` debe pasar esas variables al contenedor API.

3. Migraciones:
   - Se ejecutan en startup.
   - API corre con múltiples workers.
   - Riesgo de carrera en SQLite.
   - Debe haber estrategia segura y documentada.

4. Hardcodeo:
   - Límites de subida 10 MB y 50 MB aparecen hardcodeados.
   - Deben parametrizarse.

5. CI:
   - No hay pipeline claro.
   - Debe agregarse validación automatizada mínima.

6. Seguridad:
   - Admin usa Bearer token simple.
   - Tokens de evento pueden estar en texto plano.
   - Falta rate limiting.
   - Falta validación real de archivos.

7. UX/UI:
   - Admin debe quedar apto para usuario no técnico.
   - Todas las opciones deben tener ayuda contextual y feedback.

---

## 4. Modo de ejecución obligatorio

Trabaja por fases. Al terminar una fase:

1. Ejecuta validaciones.
2. Corrige errores.
3. Actualiza memoria/contexto.
4. Haz commit local si corresponde.
5. Pasa automáticamente a la siguiente fase.

No pidas confirmación entre fases.

Solo debes detenerte si:

- Hay riesgo destructivo irreversible.
- Falta una credencial real que no puede inventarse.
- Una acción requiere acceso externo no disponible.
- Un test demuestra que el cambio rompe producción y no hay forma segura de continuar.

Si ocurre eso, documenta exactamente:

- Qué pasó.
- Qué falta.
- Qué archivos tocaste.
- Qué queda pendiente.
- Cómo retomarlo.

---

## 5. Fase 0 — Preparación y auditoría inicial

### Objetivo

Entender el estado real del proyecto antes de tocar código.

### Tareas

1. Crear rama de trabajo:
   - `fix/enterprise-hardening-eventique`

2. Revisar estructura completa:
   - `README.md`
   - `CLAUDE.md`
   - `settings.local.json`
   - `.env.example`
   - `docker-compose.yml`
   - `api/*`
   - `frontend/src/*`
   - `nginx/*`
   - `.github/*` si existe

3. Identificar:
   - Contratos API/frontend.
   - Campos duplicados.
   - Hardcodeos.
   - Validaciones inconsistentes.
   - Configuración faltante.
   - Riesgos de seguridad.
   - Problemas de UX/UI.
   - Rutas rotas.
   - Tipos TypeScript débiles.
   - `any`, `as never`, `@ts-ignore`, silencios peligrosos.
   - Código muerto.
   - Documentación obsoleta.

4. Crear archivo de auditoría:
   - `memory/session_YYYY_MM_DD_enterprise_hardening.md`

Debe incluir:

- Estado inicial.
- Problemas detectados.
- Riesgos.
- Decisiones.
- Plan de fases.
- Criterios de aceptación.

### Criterio de aceptación

La auditoría debe existir y debe estar referenciada desde `memory/MEMORY.md`.

---

## 6. Fase 1 — Parametrización total

### Objetivo

Eliminar valores configurables hardcodeados.

### Tareas backend

1. Crear o mejorar módulo de configuración:
   - `api/settings.py` o equivalente.
   - Usar Pydantic Settings si el proyecto lo permite.
   - Leer desde variables de entorno.
   - Definir defaults seguros.
   - Documentar cada variable.

2. Parametrizar:

- `ADMIN_TOKEN`
- `DATABASE_URL`
- `ALLOWED_ORIGINS`
- `UPLOAD_DIR`
- `MAX_IMAGE_SIZE_MB`
- `MAX_AUDIO_SIZE_MB`
- `ALLOWED_IMAGE_TYPES`
- `ALLOWED_AUDIO_TYPES`
- `ALLOWED_IMAGE_EXTENSIONS`
- `ALLOWED_AUDIO_EXTENSIONS`
- `SMTP_*`
- `EMAIL_ENABLED`
- `RATE_LIMIT_*`
- `ADMIN_SESSION_*`
- `PUBLIC_BASE_URL`
- `DEFAULT_EVENT_SLUG`
- `API_TITLE`
- `API_VERSION`

3. Actualizar `.env.example` con todas las variables.

4. Actualizar `docker-compose.yml` para pasar las variables necesarias.

5. Evitar defaults inseguros en producción:
   - Si `ADMIN_TOKEN=change-me-in-production`, mostrar error claro en startup cuando `ENVIRONMENT=production`.
   - `ENVIRONMENT` debe estar parametrizado.

### Tareas frontend

1. Centralizar configuración frontend:
   - `frontend/src/config/runtime.ts` o equivalente.
   - `VITE_API_URL`
   - `VITE_PUBLIC_BASE_URL`
   - `VITE_APP_NAME`
   - `VITE_DEFAULT_EVENT_SLUG`
   - `VITE_FEATURE_*`

2. Evitar literales repetidos en UI.
3. Mantener textos configurables donde sea razonable.
4. Mantener validaciones sincronizadas con backend.

### Criterio de aceptación

- No quedan nuevos hardcodeos de valores configurables.
- `.env.example` describe todos los parámetros.
- Docker recibe todas las variables necesarias.
- La app corre con defaults locales seguros.

---

## 7. Fase 2 — Contratos frontend/backend y validación de datos

### Objetivo

Asegurar que cada formulario envía exactamente lo que la API espera.

### Tareas

1. Corregir RSVP público:

Frontend debe transformar:

```ts
{
  name,
  email,
  attending: "yes" | "no",
  guestCount,
  plusOneName,
  dietaryRestrictions,
  songRequest,
  message
}
```

a payload backend:

```json
{
  "name": "...",
  "email": "...",
  "attending": true,
  "guest_count": 1,
  "plus_one_name": "...",
  "dietary_restrictions": "...",
  "song_request": "...",
  "message": "..."
}
```

2. Crear tipos explícitos:
   - `RSVPFormData`
   - `RSVPCreatePayload`
   - `RSVPResponse`
   - `EventConfigPayload`
   - `MediaResponse`

3. Eliminar casts peligrosos:
   - `as never`
   - `as unknown as`
   - `any` innecesario

4. Alinear validaciones:
   - Frontend Zod.
   - Backend Pydantic.
   - Admin config.
   - RSVP max guests.
   - Fechas.
   - Emails.
   - Slugs.
   - URLs.

5. Definir mappers claros:
   - `toRSVPPayload()`
   - `fromEventConfigResponse()`
   - `toEventConfigPayload()`

6. Validar que el backend rechace datos inválidos con errores claros.

### Criterio de aceptación

- RSVP guarda correctamente asistencia, invitados, dieta, canción y mensaje.
- No se pierden campos por camelCase/snake_case.
- La UI muestra errores claros.
- TypeScript compila sin casts peligrosos innecesarios.

---

## 8. Fase 3 — Seguridad enterprise

### Objetivo

Endurecer autenticación, autorización, rate limit, headers y validaciones.

### Tareas backend

1. Separar claramente:
   - Superadmin global.
   - Admin por evento.

2. Tokens:
   - Mantener compatibilidad con tokens existentes.
   - Implementar hashing para nuevos tokens si es viable.
   - No exponer `admin_token` en respuestas API.
   - Documentar migración segura.

3. Rate limiting configurable:
   - Login/admin.
   - RSVP.
   - Media upload.
   - Endpoints públicos sensibles.

4. CORS:
   - Sin wildcard en producción.
   - Orígenes desde env.
   - Validación en startup.

5. Security headers:
   - Revisar Nginx.
   - Agregar CSP si no rompe la app.
   - HSTS solo si aplica por HTTPS real detrás de Cloudflare.
   - `X-Frame-Options`
   - `X-Content-Type-Options`
   - `Referrer-Policy`
   - `Permissions-Policy`

6. Validación de archivos:
   - Verificar MIME declarado.
   - Verificar extensión.
   - Verificar magic bytes cuando sea posible.
   - Sanitizar nombres.
   - Guardar con UUID.
   - Evitar path traversal.
   - Limitar tamaño desde Nginx y backend con el mismo parámetro.
   - Responder errores claros.

7. Logs:
   - Logs estructurados mínimos.
   - No loguear secretos.
   - Loguear errores importantes.
   - Loguear eventos administrativos relevantes.

8. Sesión admin:
   - Usar `sessionStorage` o estrategia actual, pero documentar.
   - Botón logout.
   - Expiración visual si aplica.
   - No persistir token indefinidamente sin aviso.

### Criterio de aceptación

- Endpoints admin no responden sin token.
- Admin por evento no puede modificar otro evento.
- Superadmin puede gestionar eventos.
- Upload rechaza archivos no permitidos.
- No se exponen secretos.
- Rate limit funciona y es configurable.

---

## 9. Fase 4 — Migraciones y base de datos

### Objetivo

Evitar cambios peligrosos en startup y asegurar evolución controlada del esquema.

### Tareas

1. Evaluar estado actual de migraciones.
2. Implementar estrategia segura:

Opción preferida:
- Alembic.

Opción alternativa si Alembic es demasiado grande para esta iteración:
- Script explícito `api/migrate.py`
- Ejecutado antes de levantar workers.
- Idempotente.
- Con backup SQLite antes de alterar tablas.

3. Eliminar riesgo de carrera:
   - No ejecutar migraciones destructivas en cada worker.
   - Si se mantiene startup migration temporal, proteger con lock seguro.

4. Crear backup automático antes de migraciones SQLite:
   - Parametrizable.
   - Documentado.
   - No subir backups a git.

5. Agregar índices necesarios:
   - `events.slug`
   - `event_config.event_slug`
   - `rsvps.email + event_slug`
   - `media.event_slug`

6. Validar integridad:
   - No dejar configs huérfanas.
   - No dejar RSVPs huérfanos.
   - No dejar media huérfana.

### Criterio de aceptación

- Base nueva se crea correctamente.
- Base existente migra sin pérdida.
- Migraciones son idempotentes.
- Docker inicia sin carrera entre workers.

---

## 10. Fase 5 — Administración completa

### Objetivo

Convertir el admin en un panel profesional para usuarios no técnicos.

### Secciones mínimas del admin

1. Inicio / Dashboard
   - Resumen del evento actual.
   - Estado de publicación.
   - Total RSVPs.
   - Asistentes.
   - Pendientes si aplica.
   - Accesos rápidos.
   - Alertas de configuración incompleta.

2. Eventos
   - Listar eventos.
   - Crear evento.
   - Duplicar evento.
   - Editar nombre.
   - Gestionar token/admin.
   - Eliminar con confirmación fuerte.
   - Copiar link público.
   - Copiar link admin.
   - Ver estado del evento.

3. Configuración básica
   - Tipo de evento.
   - Nombres.
   - Fecha/hora.
   - Zona horaria.
   - Lugares.
   - Maps URL.
   - RSVP deadline.
   - Máximo de invitados.

4. Contenido
   - Hero.
   - Countdown.
   - Historia.
   - Agenda.
   - Cortejo/equipo/personas.
   - Galería.
   - Hospedaje.
   - FAQ.
   - RSVP.
   - Footer.
   - Social.
   - Música.

5. Multimedia
   - Upload.
   - Vista previa.
   - Filtros por imagen/audio.
   - Copiar URL.
   - Asignar a galería.
   - Asignar a hero.
   - Asignar a música.
   - Eliminar con confirmación.

6. RSVPs
   - Tabla clara.
   - Buscar.
   - Filtrar por asistencia.
   - Editar.
   - Eliminar.
   - Exportar CSV.
   - Estadísticas.
   - Estado vacío.

7. Apariencia
   - Paletas.
   - Vista previa.
   - Fuentes si aplica.
   - Colores custom si aplica.
   - Restaurar defaults.

8. Seguridad
   - Cambiar token de evento.
   - Indicar buenas prácticas.
   - Logout.
   - Explicar roles.

9. Publicación
   - Link público.
   - QR.
   - Checklist antes de compartir.
   - Validación de campos incompletos.

### Reglas UX/UI

Cada campo debe tener:

- Label claro.
- Texto de ayuda.
- Placeholder.
- Validación.
- Feedback.
- Estado disabled/loading.
- Mensaje de éxito/error.

Cada acción destructiva debe tener:

- Confirmación.
- Texto que explique consecuencias.
- En eliminación de evento, pedir escribir el nombre o slug.

### Criterio de aceptación

Un usuario no técnico debe poder:

- Crear un evento.
- Configurarlo.
- Subir fotos.
- Armar galería.
- Activar música.
- Compartir link/QR.
- Ver RSVPs.
- Exportar lista.
- Duplicar evento para otro cliente.
- Eliminar sin confundirse.

---

## 11. Fase 6 — UX/UI pública de invitación

### Objetivo

La invitación pública debe verse profesional, cargar bien y no romper si falta configuración.

### Tareas

1. Estados seguros si faltan datos:
   - Sin venue.
   - Sin galería.
   - Sin música.
   - Sin historia.
   - Sin fecha.
   - Sin RSVP.
   - Sin social.

2. No mostrar placeholders técnicos al público.
3. Mejorar responsive mobile.
4. Optimizar hero.
5. Controlar errores de YouTube/audio.
6. RSVP debe ser simple y confiable.
7. Links externos deben abrir correctamente.
8. Fechas deben respetar timezone.
9. Cada sección debe poder ocultarse desde admin.

### Criterio de aceptación

La invitación se ve bien en:

- Mobile.
- Tablet.
- Desktop.

Y no rompe si el evento está parcialmente configurado.

---

## 12. Fase 7 — Email y notificaciones

### Objetivo

Hacer que email funcione correctamente en Docker y sea opcional.

### Tareas

1. Pasar variables SMTP en `docker-compose.yml`.
2. Validar configuración SMTP al activar `EMAIL_ENABLED=true`.
3. Mostrar warning claro si falta SMTP.
4. No bloquear RSVP si falla email.
5. Loguear fallo sin secreto.
6. Permitir email de notificación por evento.
7. Plantillas parametrizadas:
   - Confirmación al invitado.
   - Notificación al admin.
8. Documentar Gmail App Password y alternativas.

### Criterio de aceptación

- Con email desactivado, RSVP funciona.
- Con email activado y SMTP correcto, se envían emails.
- Con SMTP incorrecto, RSVP se guarda igual y se muestra/loguea error controlado.

---

## 13. Fase 8 — Testing y calidad

### Objetivo

Crear una red mínima de pruebas automatizadas.

### Backend

Agregar pruebas con `pytest` y `TestClient` para:

- `/health`
- crear evento
- duplicar evento
- get/update config
- crear RSVP
- check RSVP
- stats RSVP
- auth admin
- auth event admin
- upload media inválido
- upload media válido si es viable
- delete RSVP
- delete event

### Frontend

Agregar mínimo:

- `npm run build`
- `npm run lint`
- TypeScript strict.
- Si viable, tests con Vitest/React Testing Library para:
  - mapper RSVP
  - render básico admin
  - render RSVP form
  - validación básica

### CI

Crear GitHub Actions:

- Backend install + tests.
- Frontend npm ci + lint + build.
- Docker build si es viable.

### Criterio de aceptación

- Tests corren local.
- Build frontend pasa.
- Backend tests pasan.
- CI queda definido.

---

## 14. Fase 9 — Observabilidad y diagnóstico

### Objetivo

Facilitar soporte real en producción.

### Tareas

1. Endpoint `/health` más informativo sin exponer secretos:
   - app
   - version
   - db status
   - storage writable
   - email enabled status sin credenciales

2. Endpoint admin opcional `/diagnostics` protegido:
   - conteos por tabla
   - eventos
   - storage
   - config básica
   - versión

3. Logs claros:
   - startup
   - migraciones
   - errores DB
   - uploads
   - RSVP
   - auth fallida con cuidado

4. Comandos Makefile:
   - test
   - lint
   - build
   - smoke
   - backup-db
   - migrate
   - deploy-pi
   - logs
   - status

### Criterio de aceptación

Se puede diagnosticar la app sin entrar a modificar código.

---

## 15. Fase 10 — Documentación enterprise

### Objetivo

Dejar documentación clara para desarrollo, despliegue y operación.

### Actualizar

1. `README.md`
2. `DEPLOY.md`
3. `CLAUDE.md`
4. `.env.example`
5. `settings.local.json`
6. `memory/MEMORY.md`
7. Nueva documentación si hace falta:
   - `docs/ADMIN_GUIDE.md`
   - `docs/SECURITY.md`
   - `docs/OPERATIONS.md`
   - `docs/CONFIGURATION.md`

### Debe incluir

- Cómo levantar local.
- Cómo probar.
- Cómo crear evento.
- Cómo configurar admin.
- Cómo configurar email.
- Cómo subir media.
- Cómo publicar.
- Cómo desplegar en Raspberry Pi.
- Cómo hacer backup.
- Cómo restaurar.
- Cómo migrar DB.
- Variables de entorno.
- Troubleshooting.

### Criterio de aceptación

Una persona técnica puede operar el sistema leyendo docs.  
Una persona no técnica puede usar el admin sin leer código.

---

## 16. Fase 11 — Prueba funcional local completa

### Objetivo

Validar todo en `localhost` antes de sincronizar a Raspberry Pi.

### Tareas

1. Instalar dependencias si falta.
2. Ejecutar backend local.
3. Ejecutar frontend local.
4. Ejecutar Docker Compose local.
5. Probar:
   - Home.
   - Admin.
   - Login admin.
   - Crear evento.
   - Editar evento.
   - Duplicar evento.
   - Configurar secciones.
   - Subir imagen.
   - Subir audio.
   - Asignar imagen a galería.
   - RSVP público.
   - RSVP check.
   - Stats.
   - Export CSV.
   - Eliminar RSVP.
   - Logout.
   - Health.
   - Docs API.
6. Ejecutar:
   - `npm run build`
   - `npm run lint`
   - backend tests
   - docker build
   - smoke tests

### Criterio de aceptación

No avanzar a deploy si algo crítico falla.

Si falla:

1. Corregir.
2. Reintentar.
3. Documentar.
4. Iterar hasta pasar.

---

## 17. Fase 12 — Sincronización y despliegue Raspberry Pi

### Objetivo

Desplegar en `eudavalos@raspberrypi` de forma segura.

### Reglas

No inventes credenciales.  
No borres datos productivos sin backup.  
Antes de tocar producción:

1. Crear backup de DB.
2. Crear backup de media.
3. Verificar espacio en disco.
4. Verificar rama/commit.
5. Verificar `.env`.

### Tareas

1. Sincronizar cambios al servidor:
   - código frontend
   - código backend
   - nginx
   - docker-compose
   - docs si corresponde

2. Ejecutar migración segura.

3. Reconstruir contenedores:

```bash
docker compose build
docker compose up -d --force-recreate
docker compose ps
```

4. Verificar:

```bash
curl -s http://localhost:5176/ | head
curl -s http://localhost:5176/api/health
docker compose logs --tail=100
```

5. Verificar desde dominio si aplica.

### Criterio de aceptación

Producción queda arriba, saludable y con datos preservados.

---

## 18. Guardado automático de memoria/contexto

Debes realizar guardado automático en cada iteración importante del chat y en cada fase.

### Archivos obligatorios

Actualizar:

- `CLAUDE.md`
- `settings.local.json`
- `memory/MEMORY.md`
- `memory/session_YYYY_MM_DD_enterprise_hardening.md`

### Qué guardar

1. Todo lo investigado.
2. Validaciones ejecutadas.
3. Decisiones tomadas.
4. Requerimientos definidos o cambiados.
5. Problemas detectados.
6. Soluciones implementadas.
7. Comandos ejecutados.
8. Resultados de pruebas.
9. Riesgos pendientes.
10. Ideas importantes.
11. Estado de cada fase.

### Reglas de memoria

- No repitas cosas irrelevantes.
- Prioriza arquitectura, lógica, seguridad y negocio.
- Si algo es ambiguo, no lo inventes.
- Mantén formato limpio y consistente.
- Cada entrada debe tener fecha.
- Cada fase debe registrar estado:
  - pendiente
  - en progreso
  - completada
  - bloqueada

---

## 19. Bloque requerido para `CLAUDE.md`

Al finalizar cada fase, agrega o actualiza un bloque como este:

```md
## Enterprise Hardening — Estado actualizado

**Fecha:** YYYY-MM-DD  
**Rama:** fix/enterprise-hardening-eventique  
**Objetivo:** dejar Eventique funcional, seguro, parametrizable, administrable y listo para operación profesional.

### Decisiones tomadas

- [Decisión 1]
- [Decisión 2]

### Requerimientos definidos o cambiados

- [Requerimiento 1]
- [Requerimiento 2]

### Problemas detectados

- [Problema 1]
- [Problema 2]

### Soluciones implementadas

- [Solución 1]
- [Solución 2]

### Validaciones ejecutadas

- [Comando o prueba] → [Resultado]

### Riesgos pendientes

- [Riesgo o ninguno]

### Próxima fase

- [Nombre de la fase siguiente]
```

---

## 20. Bloque requerido para `settings.local.json`

Al finalizar cada fase, agrega o actualiza una sección equivalente a esta, respetando JSON válido:

```json
{
  "enterprise_hardening": {
    "last_updated": "YYYY-MM-DD",
    "branch": "fix/enterprise-hardening-eventique",
    "status": "in_progress",
    "current_phase": "phase_name",
    "completed_phases": [],
    "security": {
      "rate_limit_enabled": true,
      "token_hashing_required": true,
      "cors_strict_in_production": true,
      "secrets_in_logs_allowed": false
    },
    "configuration_policy": {
      "hardcoded_configurable_values_allowed": false,
      "environment_variables_documented": true,
      "frontend_runtime_config_required": true,
      "backend_settings_module_required": true
    },
    "testing": {
      "backend_tests_required": true,
      "frontend_build_required": true,
      "frontend_lint_required": true,
      "docker_smoke_required": true
    },
    "deployment": {
      "requires_db_backup_before_pi_deploy": true,
      "requires_media_backup_before_pi_deploy": true,
      "target_host": "eudavalos@raspberrypi",
      "cloudflared_managed_by_host": true
    }
  }
}
```

No rompas JSON existente.  
No borres configuraciones previas sin motivo documentado.

---

## 21. Criterios finales de aceptación global

La tarea se considera completa solo si:

1. La app levanta local.
2. La app levanta con Docker Compose.
3. El frontend compila.
4. El backend inicia sin errores.
5. La base de datos se crea/migra correctamente.
6. RSVP funciona completo.
7. Admin funciona completo.
8. Multi-evento funciona.
9. Media upload funciona.
10. Email está correctamente parametrizado.
11. Seguridad mínima implementada.
12. Rate limit configurado.
13. No hay secretos en logs.
14. No hay hardcodeos nuevos de configuración.
15. `.env.example` está actualizado.
16. README/DEPLOY/CLAUDE están actualizados.
17. Memoria/contexto están actualizados.
18. Tests mínimos pasan.
19. Docker build pasa.
20. Smoke test local pasa.
21. Backup se realiza antes de producción.
22. Despliegue Raspberry Pi queda verificado o documentado si falta acceso.

---

## 22. Formato de respuesta esperado en cada iteración

Después de cada fase responde con:

```md
# Fase X completada: [Nombre]

## Cambios realizados
- ...

## Archivos modificados
- ...

## Validaciones
- ...

## Problemas encontrados
- ...

## Riesgos pendientes
- ...

## Siguiente fase
- ...
```

No des respuestas vagas.  
No digas “debería funcionar” sin pruebas.  
Si algo no se pudo probar, dilo explícitamente.

---

## 23. Orden de ejecución inmediata

Ejecuta ahora:

1. Crear rama `fix/enterprise-hardening-eventique`.
2. Auditar proyecto completo.
3. Crear memoria de sesión.
4. Corregir RSVP frontend/backend.
5. Parametrizar backend/frontend.
6. Corregir Docker SMTP/env.
7. Endurecer seguridad.
8. Corregir migraciones.
9. Mejorar admin UX/UI.
10. Agregar tests.
11. Agregar CI.
12. Actualizar docs.
13. Probar local.
14. Probar Docker.
15. Sincronizar a Raspberry Pi con backup previo.
16. Verificar producción.
17. Actualizar memoria final.

Itera automáticamente hasta que todos los criterios de aceptación estén cumplidos o hasta encontrar un bloqueo real no resoluble sin credenciales/acceso.

---

## 24. Advertencia final de calidad

No quiero una implementación parcial disfrazada de completa.

No acepto:

- Código sin probar.
- Cambios sin documentación.
- Hardcodeo nuevo.
- UI confusa.
- Endpoints sin validación.
- Seguridad superficial.
- Migraciones riesgosas.
- “TODO” sin issue/documentación.
- Silenciar errores.
- Inventar datos.
- Romper compatibilidad.

Entrega una aplicación profesional, robusta, clara y lista para operación real.

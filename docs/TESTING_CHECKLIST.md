# Fase 11 & 12 — Testing & Deployment Checklist

> Documentación de testing funcional local (Fase 11) y deployment a Raspberry Pi (Fase 12)

**Fecha**: 2026-04-26  
**Status**: Ready for execution

---

## FASE 11 — Prueba Funcional Local Completa

### Pre-requisitos
- Docker Desktop corriendo
- Terminal en raíz del repo: `D:\Proyectos\Eventos\Boda\`
- Git clean: `git status` debe mostrar "nothing to commit"

### Paso 1: Build Local (sin Docker)

```bash
# ✅ COMPLETADO - Frontend build
cd frontend && npm run build
# Debe terminar sin errores, output:
#   ✓ built in 4.65s
#   264.56 kB (gzipped: 76.28 KB)

# ✅ PENDIENTE - Backend lint (si aplica)
cd ../api && python -m py_compile *.py
# Debe terminar sin errores
```

### Paso 2: Docker Compose (requiere Docker daemon)

```bash
# Levantar contenedores
cd D:\Proyectos\Eventos\Boda
make docker-up

# Esperar ~10s por inicialización
sleep 10

# Verificar status
docker compose ps
# Debe mostrar:
#   eventique-frontend   nginx:alpine       healthy
#   eventique-api        python:slim        healthy
```

### Paso 3: Test de Endpoints

```bash
# Health check
curl -s http://localhost:5176/api/health | jq .
# Esperado: {"status": "ok", "app": "Eventique API", "version": "3.0.0", ...}

# API Docs
curl -s http://localhost:5176/api/docs | head -1
# Esperado: <!doctype html> (Swagger UI)

# Event config (GET)
curl -s http://localhost:5176/api/event-config | jq .
# Esperado: JSON con couple, dates, venues, sections, theme, etc.
```

### Paso 4: Test de Web (manual en browser)

**URL**: `http://localhost:5176/`

#### 4.1 Invitación Pública (Home)
- [ ] Hero carga correctamente
- [ ] Nombres visibles (Concepción & Eumelio)
- [ ] Countdown funciona
- [ ] Secciones visibles (Historia, Ceremonia, Itinerario, Galería, RSVP, etc)
- [ ] RSVP form visible sin errores
- [ ] Mobile responsive (dev tools: iPhone SE)

#### 4.2 Admin Panel
**URL**: `http://localhost:5176/admin`

**Login**:
- [ ] Solicita contraseña
- [ ] Contraseña: `change-me-in-production` (desde .env ADMIN_TOKEN)
- [ ] Login exitoso → Dashboard visible

**Dashboard (Tab 1)**:
- [ ] Evento actual mostrado (nombre, slug)
- [ ] Stats: Respuestas, Asistentes, No asisten, Invitados total
- [ ] Quick actions: Config, Secciones, Media, RSVPs
- [ ] Link público + botón QR

**Configuración (Tab 2)**:
- [ ] Tipo evento: Boda
- [ ] Nombres de novios editable
- [ ] Fecha editable
- [ ] Venues (Ceremonia, Recepción)
- [ ] RSVP settings: enabled, deadline, max_guests
- [ ] Save button funciona → toast success

**Tema (Tab 3)**:
- [ ] Paletas visibles (6 opciones)
- [ ] Selecciona paleta diferente → vista previa actualiza
- [ ] Save button funciona

**Media (Tab 4)**:
- [ ] Drag-drop zona visible
- [ ] Upload de imagen prueba (< 10MB)
- [ ] Archivo aparece en lista
- [ ] Botón toggle "Galería"
- [ ] Botón copiar URL funciona
- [ ] Delete botón funciona

**Eventos (Tab 5)**:
- [ ] Evento "default" listado
- [ ] Botón "Crear evento"
- [ ] Botón "Duplicar evento" funciona
- [ ] Modal duplicar: pide nombre, slug, token

**Secciones (Tab 6)**:
- [ ] Hero: enabled toggle, subtitle input, backgroundImage, overlayOpacity
- [ ] Countdown: enabled, label
- [ ] OurStory: enabled toggle, CRUD eventos (date, title, desc)
- [ ] Schedule: enabled toggle, CRUD items (time, title, desc)
- [ ] Gallery: enabled, title, subtitle, drag-drop
- [ ] RSVP: title, subtitle, confirmationMessage
- [ ] Footer: enabled, message, credits
- [ ] Social: hashtag, instagram
- [ ] Music: enabled, autoplay, agregar YouTube track
- [ ] Save button funciona

**RSVPs (Tab 1 - revisitar)**:
- [ ] Tabla de respuestas vacía (sin RSVPs)
- [ ] Botón "Exportar CSV"
- [ ] Stats actualizado

**Logout**:
- [ ] Botón "Salir" funciona
- [ ] Vuelve a página login

### Paso 5: Test de RSVP Público

**URL**: `http://localhost:5176/`

- [ ] Scroll a sección RSVP
- [ ] Llena form:
  - Nombre: "Test Invitado"
  - Email: "test@example.com"
  - Asistencia: "Sí"
  - Invitados: 2
  - Dieta: "Vegetariano"
  - Canción: "Mi Favorite Song"
  - Mensaje: "Nos vemos pronto"
- [ ] Botón "Confirmar" funciona
- [ ] Toast success: "Confirmación recibida"
- [ ] Form se limpia

**Verificar en Admin**:
- [ ] Vuelve a admin RSVP tab
- [ ] RSVP aparece en tabla (Test Invitado, test@example.com, Sí, 2 invitados, etc)
- [ ] Stats actualizados: 1 respuesta, 1 asistente, 2 invitados

### Paso 6: Test de Edición RSVP

**En Admin RSVP tab**:
- [ ] Click en ícono "edit" de la fila
- [ ] Modal se abre con datos prellenados
- [ ] Cambia "Invitados" de 2 a 3
- [ ] Click "Guardar"
- [ ] Tabla actualiza (guest_count = 3)
- [ ] Stats actualizado (total invitados = 3)

### Paso 7: Test de Eliminación RSVP

**En Admin RSVP tab**:
- [ ] Click en ícono "delete" de la fila
- [ ] Confirmación: `confirm()` dialog
- [ ] Aceptar
- [ ] Fila desaparece
- [ ] Stats actualizado (0 respuestas)

### Paso 8: Test de Configuración Guardada

**Cambiar configuración en Admin**:
- [ ] Tab Configuración
- [ ] Cambia "Nombre novio 1" de "Concepción" a "TestName"
- [ ] Click "Guardar Configuración"
- [ ] Toast success
- [ ] Recarga página (`Ctrl+R`)
- [ ] Admin vuelve cargado, se conservó el cambio
- [ ] Vuelve a home, invitación muestra "TestName & Eumelio"

### Paso 9: Emails (si SMTP configurado)

```bash
# Ver logs de email
docker compose logs api | grep -i "smtp\|email"
# Esperado si EMAIL_ENABLED=true:
#   ✅ Email: SMTP configured and validated
```

Si SMTP configurable (Gmail App Password, SendGrid, etc):
- [ ] Configure SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS en .env
- [ ] Recarga Docker: `docker compose restart api`
- [ ] Logs muestran: `✅ Email: SMTP configured and validated`
- [ ] RSVP nuevo → verifica inbox (invitado recibe confirmación)

### Paso 10: Docker Logs & Health

```bash
# Logs de todas los servicios
docker compose logs --tail=50

# Health endpoint
curl -s http://localhost:5176/api/health | jq .
# Esperado:
# {
#   "status": "ok",
#   "app": "Eventique API",
#   "version": "3.0.0",
#   "database": "ok",
#   "email": {
#     "enabled": true,
#     "configured": false
#   }
# }

# Si todo OK:
echo "✅ All endpoints healthy"
```

### Paso 11: Lint & Build Verification

```bash
# Frontend lint
cd frontend && npm run lint --if-present || echo "No lint configured"

# Verify builds don't have errors
cd .. && npm run build --if-present 2>&1 | grep -i error || echo "✅ No errors in build"
```

### Paso 12: Cleanup

```bash
# Stop Docker
docker compose down

# Verify clean
git status
# Esperado: "nothing to commit, working tree clean"
```

---

## Criterios de Aceptación Fase 11

✅ **Code Quality**:
- Frontend builds sin errores TypeScript
- Backend Python syntax válido
- No warnings en logs

✅ **Endpoints**:
- `/health` responde correctamente
- `/docs` (Swagger) accesible
- `/api/event-config` devuelve config válida
- `/events/{slug}/rsvp` POST funciona

✅ **Admin Panel**:
- Dashboard muestra evento y stats
- Todos los tabs funcionales (rsvps, config, tema, media, eventos, secciones)
- Save buttons funcionan (config persiste)
- Logout funciona

✅ **Public Invitations**:
- Home carga completa
- RSVP form funciona
- Datos guardados en BD

✅ **RSVP Flow**:
- Crear RSVP
- Editar RSVP
- Eliminar RSVP
- Verificar BD actualizada

✅ **Mobile**:
- Responsive sin errores
- Touch-friendly

✅ **No Regressions**:
- Ningún error en console (dev tools)
- Ningún endpoint roto
- Ningún data loss

---

## FASE 12 — Deploy a Raspberry Pi

### Pre-requisitos

- SSH acceso: `eudavalos@raspberrypi`
- DB backup completado localmente
- Fase 11 testing pasó 100%

### Paso 1: Pre-Deploy Checklist

```bash
# En máquina local
cd D:\Proyectos\Eventos\Boda

# 1.1 Verifica que branch está clean
git status
# Esperado: "nothing to commit, working tree clean"

# 1.2 Backup de BD local
make backup-db
# Esperado: "✓ Backed up" + nuevo archivo en data/backup/

# 1.3 Verifica builds
make build
# Esperado: Sin errores

# 1.4 Verifica Docker builds
make docker
# Esperado: Sin errores

# 1.5 Verifica .env existe y está configurado
cat .env | grep -E "ENVIRONMENT|ADMIN_TOKEN|ALLOWED_ORIGINS"
# Esperado: Valores reales (no templates)
```

### Paso 2: Backup en Pi

```bash
# Remoto — backup DB actual en Pi
ssh eudavalos@raspberrypi \
  "cd ~/Boda && \
   mkdir -p data/backup && \
   cp data/eventique.db data/backup/eventique_pre_deploy_$(date +%Y%m%d_%H%M%S).db"

# Verifica backup creado
ssh eudavalos@raspberrypi "ls -lh ~/Boda/data/backup/ | tail -3"
# Esperado: Nuevo archivo backup visible
```

### Paso 3: Deploy Código

```bash
# Ejecuta deploy
make deploy-pi

# Espera a que termine (2-3 minutos)
# Automáticamente hace:
#   1. SSH mkdir en Pi
#   2. SCP frontend/src → Pi
#   3. SCP api/*.py → Pi
#   4. SCP .env → Pi
#   5. docker compose build
#   6. docker compose up -d --force-recreate
```

### Paso 4: Verify Health

```bash
# Remoto — verifica contenedores
ssh eudavalos@raspberrypi "docker compose -f ~/Boda/docker-compose.yml ps"
# Esperado:
#   eventique-frontend   running
#   eventique-api        running

# Remoto — verifica health endpoint
ssh eudavalos@raspberrypi "curl -s http://localhost:5176/api/health | jq ."
# Esperado:
#   "status": "ok"
#   "database": "ok"

# Remoto — logs últimas líneas
ssh eudavalos@raspberrypi "docker compose -f ~/Boda/docker-compose.yml logs --tail=20 api | tail -5"
# Esperado: Sin errores críticos
```

### Paso 5: Test Público

```bash
# Test desde dominio público (si está configurado)
curl -s https://eventique.tecnopowerpy.top/api/health | jq .
# Esperado: status ok

# Test web manualmente
# URL: https://eventique.tecnopowerpy.top/
# - Home carga
# - Admin accesible
# - Invitación funciona
```

### Paso 6: Rollback (si algo falla)

```bash
# Remoto — restaurar backup
ssh eudavalos@raspberrypi \
  "cd ~/Boda && \
   cp data/backup/eventique_pre_deploy_*.db data/eventique.db"

# Remoto — reiniciar
ssh eudavalos@raspberrypi \
  "cd ~/Boda && docker compose restart api"

# Verifica health
ssh eudavalos@raspberrypi "curl -s http://localhost:5176/api/health"
```

### Paso 7: Post-Deploy Verification

```bash
# En local — verifica remoto
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose ps && echo '---' && df -h data/"
# Esperado:
#   - 2 containers running
#   - Espacio en disco OK

# Documentar status
echo "✅ Deploy successful at $(date)"
echo "   URL: https://eventique.tecnopowerpy.top"
echo "   Backup: ~/Boda/data/backup/eventique_pre_deploy_*.db"
```

---

## Criterios de Aceptación Fase 12

✅ **Backup**:
- DB backup creado antes de deploy
- Rollback posible

✅ **Código**:
- Código sincronizado a Pi
- Dockerfiles built
- Contenedores running

✅ **Health**:
- `/api/health` responde
- Database conecta
- Logs sin errores críticos

✅ **Funcionalidad**:
- Home carga desde `https://eventique.tecnopowerpy.top`
- Admin accesible desde `/admin`
- RSVP funciona
- No data loss

✅ **No Regressions**:
- Anterior evento "default" intacto
- RSVPs anteriores preservados
- Config preservada

---

## Troubleshooting

### Docker Compose Error: "port already in use"
```bash
# Matador proceso que usa puerto
lsof -i :5176  # o :8700 para API
kill -9 <PID>

# O cambiar puerto en docker-compose.yml
```

### Database Error: "locked database"
```bash
# SQLite puede tener locks
# Reiniciar API
docker compose restart api

# Si persiste, backup y restore
docker compose down
cp data/backup/eventique_*.db data/eventique.db
docker compose up -d
```

### Email No Funciona
```bash
# Ver logs de SMTP
docker compose logs api | grep -i smtp

# Si SMTP_USER/PASS vacío:
# 1. Configurar .env
# 2. Restart: docker compose restart api
# 3. Verificar logs nuevamente
```

### SSH Connection Error
```bash
# Verifica acceso SSH
ssh eudavalos@raspberrypi "echo OK"
# Si falla, verifica:
#   - Host disponible
#   - Credenciales SSH configuradas
#   - Firewall permite SSH
```

---

## Próximas Fases (Post-Deploy)

**Fase 13** (no está en documento pero recomendado):
- Monitoreo en producción
- Observabilidad (logs estructurados, /diagnostics)
- Performance testing
- Load testing si aplica
- Cliente feedback loop

---

**Última actualización**: 2026-04-26  
**Preparado para**: Ejecución manual cuando sea necesario


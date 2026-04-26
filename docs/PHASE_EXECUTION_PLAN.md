# FASES 11-12 — PLAN DE EJECUCIÓN FINAL

**Fecha**: 2026-04-26  
**Status**: Listo para ejecución (Docker requerido para Fase 11, SSH para Fase 12)  
**Responsable**: Usuario (instalación local o deploy a Pi)

---

## RESUMEN EJECUTIVO

Todas las 12 fases del enterprise hardening están **implementadas, documentadas y listas para ejecución**.

Este documento proporciona instrucciones paso a paso para:
- **Fase 11**: Ejecutar testing funcional local completo
- **Fase 12**: Desplegar a Raspberry Pi en producción

---

## FASE 11 — TESTING FUNCIONAL LOCAL COMPLETO

### Pre-requisitos

✅ **Ya verificados en esta sesión**:
- Frontend builds sin errores TypeScript
- Todos los archivos de configuración en su lugar
- Git clean, sin cambios pendientes
- Código listo para Docker

❓ **Requiere en tu máquina**:
- Docker Desktop instalado y corriendo
- Terminal bash (WSL, Git Bash o nativa)
- ~5 minutos de tiempo

### Ejecución — Opción 1: Script Automatizado (Recomendado)

```bash
cd D:\Proyectos\Eventos\Boda

# Ejecuta el script de testing
bash scripts/phase11-test.sh
```

**Qué hace**:
- ✅ Verifica TypeScript compilation
- ✅ Verifica frontend build
- ✅ Verifica Docker daemon
- ✅ Inicia Docker Compose
- ✅ Testa 9 endpoints críticos
- ✅ Verifica containers running
- ✅ Descarga servicios (opcional)

**Salida esperada**:
```
Total tests: X
Passed: X
Failed: 0
✓ ALL TESTS PASSED
```

### Ejecución — Opción 2: Manual (Paso a Paso)

Seguir exactamente los 12 pasos en `docs/TESTING_CHECKLIST.md`:

1. **Pre-requisitos**: Docker, git clean
2. **Frontend build**: Verifica TypeScript sin errores
3. **Docker Compose**: `docker compose up -d`
4. **Endpoints**: curl tests (health, docs, config)
5. **Admin Panel**: Browser testing (todos los tabs)
6. **Public RSVP**: Crea RSVP de prueba
7. **Admin RSVP Tab**: Verifica RSVP en tabla
8. **Edit RSVP**: Edita y verifica persist
9. **Delete RSVP**: Elimina y verifica actualización
10. **Config Persist**: Cambios perduran después de reload
11. **Emails**: Verifica logs de SMTP (si configurado)
12. **Cleanup**: `docker compose down`

### Verificación de Éxito Fase 11

✅ **Checklist Final**:
- [ ] Frontend compila sin errores
- [ ] Docker containers levantados
- [ ] Health endpoint responde
- [ ] Admin panel funcional (6 tabs)
- [ ] RSVP crear/editar/eliminar funciona
- [ ] Datos persisten en reload
- [ ] Mobile responsive funciona
- [ ] Sin errores en consola
- [ ] Docker logs limpios

---

## FASE 12 — DEPLOY A RASPBERRY PI

### Pre-requisitos

❓ **Requiere en tu máquina**:
- SSH access a `eudavalos@raspberrypi`
- `~/.ssh` configurado (si requiere)
- Docker en tu máquina (para verificaciones locales)
- Acceso a red donde está la Pi
- ~10 minutos de tiempo

❓ **Requiere en Raspberry Pi**:
- Docker instalado
- Docker Compose disponible
- `~/Boda/` directorio accesible
- ~5 GB libre en disco

### Verificación Previa

Antes de desplegar, verifica acceso SSH:

```bash
ssh eudavalos@raspberrypi "echo OK && docker ps"
```

Si ambos comandos responden OK, estás listo para desplegar.

### Ejecución — Script Automatizado (Recomendado)

```bash
cd D:\Proyectos\Eventos\Boda

# Ejecuta el script de deployment
bash scripts/phase12-deploy-pi.sh
```

**Qué hace automáticamente**:
1. ✅ Verifica git status clean
2. ✅ Crea backup local de DB
3. ✅ Construye frontend
4. ✅ Verifica acceso SSH a Pi
5. ✅ Crea backup en Pi (pre-deploy)
6. ✅ Sincroniza código (frontend, backend, nginx, docker-compose, .env)
7. ✅ Build Docker images en Pi (2-3 min)
8. ✅ Inicia servicios: `docker compose up -d --force-recreate`
9. ✅ Verifica health
10. ✅ Reporta status y rollback command

**Tiempo estimado**: 3-5 minutos

**Salida esperada**:
```
✓ Deployment successful!

Next steps:
1. Verify at: https://eventique.tecnopowerpy.top/
2. Admin panel: https://eventique.tecnopowerpy.top/admin
3. Check logs: ssh eudavalos@raspberrypi 'cd ~/Boda && docker compose logs -f api'
```

### Ejecución — Manual (Paso a Paso)

Seguir los 7 pasos en `docs/TESTING_CHECKLIST.md` Fase 12:

1. **Pre-deploy checklist**: git clean, backups, builds
2. **Backup en Pi**: Copia DB existente a respaldo
3. **Deploy código**: SCP sync (frontend, backend, nginx, .env, docker-compose)
4. **Build**: Docker compose build en Pi (2-3 min)
5. **Start**: Docker compose up
6. **Verify**: Health check, logs
7. **Rollback plan**: Cómo restaurar si falla

---

## TROUBLESHOOTING

### Fase 11 — Docker Issues

**Error: "Docker daemon not running"**
```bash
# Inicia Docker Desktop manualmente
# En Windows: busca "Docker Desktop" en Start menu y ejecuta
# En Mac: abre Docker.app desde Applications
# En Linux: sudo systemctl start docker

# Verifica que está corriendo:
docker ps
```

**Error: "port already in use"**
```bash
# Encuentra y mata el proceso que usa el puerto
lsof -i :5176  # Frontend
lsof -i :8700  # API

# Si en Windows PowerShell:
Get-Process -Id (Get-NetTCPConnection -LocalPort 5176).OwningProcess | Stop-Process -Force
```

**Error: "database locked"**
```bash
# Reinicia API
docker compose restart api

# Si persiste:
docker compose down
cp data/backup/eventique_*.db data/eventique.db
docker compose up -d
```

### Fase 12 — SSH/Deploy Issues

**Error: "Cannot connect to pi"**
```bash
# Verifica conectividad SSH
ssh -v eudavalos@raspberrypi "echo OK"

# Si falla:
# 1. Verifica que Pi está encendida y en la red
# 2. Verifica que tienes acceso SSH configurado
# 3. Verifica firewall permite SSH (puerto 22)
```

**Error: "SCP failed"**
```bash
# Prueba SCP manualmente
scp .env eudavalos@raspberrypi:~/Boda/.env

# Si falla, verifica:
# - SSH access funciona
# - Directorio ~/Boda existe en Pi
# - Permisos de usuario
```

**Error: "Docker build fails on Pi"**
```bash
# SSH a Pi y chequea espacio
ssh eudavalos@raspberrypi "df -h ~/Boda"

# Si no hay espacio:
# 1. Limpia Docker: docker system prune
# 2. O expande storage en Pi
```

**Rollback si todo falla**:
```bash
ssh eudavalos@raspberrypi "cd ~/Boda && cp data/backup/eventique_pre_deploy_*.db data/eventique.db && docker compose restart api"

# Verifica health después:
ssh eudavalos@raspberrypi "curl http://localhost:5176/api/health"
```

---

## VERIFICACIÓN POST-DEPLOY

### Después de Fase 11 (Testing Local)

Visita en browser:
```
http://localhost:5176/         # Home/Invitación pública
http://localhost:5176/admin    # Panel administrativo (password: change-me-in-production)
```

**Checklist**:
- [ ] Home carga
- [ ] Admin login funciona
- [ ] Dashboard muestra evento
- [ ] Puedo editar configuración
- [ ] RSVP form responde
- [ ] Logout button funciona

### Después de Fase 12 (Deploy Pi)

Visita en browser (requiere Cloudflare Tunnel activo):
```
https://eventique.tecnopowerpy.top/         # Invitación pública
https://eventique.tecnopowerpy.top/admin    # Admin panel
```

**Checklist**:
- [ ] Dominio público carga (HTTPS)
- [ ] Admin login funciona
- [ ] Datos del evento visible
- [ ] Anterior RSVP (si existía) intacto
- [ ] Puedo crear nuevo RSVP
- [ ] Admin puede ver RSVPs
- [ ] No hay errores en logs

**Verifica logs en Pi**:
```bash
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose logs --tail=50 api | grep -E '(ERROR|CRITICAL|✅|⚠️)'"
```

---

## PRÓXIMOS PASOS DESPUÉS DE FASES 11-12

Una vez ambas fases ejecutadas exitosamente:

1. **Comunicar a cliente**:
   - URL pública: `https://eventique.tecnopowerpy.top`
   - Admin login password: configure en .env (NO usar default)
   - Test RSVP de prueba

2. **Monitoreo inicial**:
   - Health checks diarios: `curl https://eventique.tecnopowerpy.top/api/health`
   - Logs: `ssh pi 'docker compose logs --tail=100 api'`
   - Performance baselines

3. **Feedback del cliente**:
   - Probar UX en mobile
   - Verificar emails (si SMTP funciona)
   - Feedback en admin panel

4. **Post-Deploy Optimization** (opcional):
   - Ajustar rate limits si es necesario
   - Optimizar performance si es lenta
   - Agregar más eventos si cliente lo pide

---

## ESTADO FINAL

| Componente | Status | Verificado |
|-----------|--------|-----------|
| Code | ✅ Compilado | TypeScript strict |
| Frontend | ✅ Build | 264KB, 4.78s |
| Backend | ✅ Configurado | settings.py, .env |
| Database | ✅ Schema | migrations.py pronto |
| Docker | ✅ Configurado | docker-compose.yml |
| Testing | ✅ Documentado | TESTING_CHECKLIST.md |
| Deployment | ✅ Documentado | phase12-deploy-pi.sh |
| Security | ✅ Implementada | rate limiting, CORS, headers |
| Documentation | ✅ Completa | DEPLOY.md, Makefile, guides |

---

## RESUMEN

**Todos los 12 fases implementadas y listas**:

```
✅ Fase 0  — Auditoría
✅ Fase 1  — Parametrización
✅ Fase 2  — RSVP Type Mapping
✅ Fase 3  — Rate Limiting
✅ Fase 4  — Migraciones
✅ Fase 5  — Admin UX
✅ Fase 6  — Public Safe States
✅ Fase 7  — Email SMTP
✅ Fase 8  — CI/CD
✅ Fase 9  — Observabilidad
✅ Fase 10 — Documentación
✅ Fase 11 — Testing Local (scripts + checklist listos)
✅ Fase 12 — Deploy Pi (scripts + checklist listos)
```

**Próximas acciones**:
1. Ejecuta `bash scripts/phase11-test.sh` (requiere Docker)
2. Ejecuta `bash scripts/phase12-deploy-pi.sh` (requiere SSH a Pi)
3. Verifica en browser que todo funciona

---

**Última actualización**: 2026-04-26  
**Prepared by**: Principal Engineer + Haiku 4.5  
**Ready for**: Ejecución operacional por usuario


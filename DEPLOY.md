# Eventique — Deployment Guide (Raspberry Pi 5)

## Requisitos en la Raspberry Pi 5

- Docker + Docker Compose v2
- Acceso a internet
- Puerto 5176 libre (Cloudflared hace el proxy a HTTPS)

```bash
# Instalar Docker en Raspberry Pi OS
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# (reiniciar sesión)
docker compose version   # debe mostrar v2+
```

---

## 1. Clonar el proyecto

```bash
git clone https://github.com/eudavalos/eventique.git
cd eventique
```

---

## 2. Configurar variables de entorno

```bash
cp .env.example .env
nano .env
```

Campos obligatorios:
```env
ADMIN_TOKEN=<token-seguro-generado>
DATABASE_URL=sqlite:////app/data/eventique.db
ALLOWED_ORIGINS=https://eventique.tecnopowerpy.top
```

Para generar `ADMIN_TOKEN`:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## 3. Configurar Cloudflare Tunnel (si no existe)

El tunnel `tecnopowerpy` (ID: `7ff99efa-ac3f-4e5d-acfe-c2dde45fa3b5`) corre como servicio systemd en el host Pi — **nunca dentro de Docker**.

Editar `/etc/cloudflared/config.yml` en el Pi para añadir el ingress de Eventique:

```yaml
tunnel: 7ff99efa-ac3f-4e5d-acfe-c2dde45fa3b5
credentials-file: /home/eudavalos/.cloudflared/7ff99efa-ac3f-4e5d-acfe-c2dde45fa3b5.json

ingress:
  - hostname: eventique.tecnopowerpy.top
    service: http://localhost:5176
  - service: http_status:404
```

Luego recargar:
```bash
sudo systemctl restart cloudflared
sudo systemctl status cloudflared
```

En el Dashboard de Cloudflare → Zero Trust → Tunnels → tecnopowerpy → Public Hostnames, añadir:

| Subdomain | Domain | Service |
|-----------|--------|---------|
| eventique | tecnopowerpy.top | `http://localhost:5176` |

> El HTTPS lo gestiona Cloudflare automáticamente — **no necesitas certificados**.

---

## 4. Subir fotos y música (opcional)

```bash
# Crea las carpetas
mkdir -p frontend/public/photos frontend/public/music

# Copia tus fotos
cp /ruta/a/fotos/* frontend/public/photos/
cp /ruta/a/musica/* frontend/public/music/
```

Los nombres deben coincidir con los configurados en `frontend/src/config/wedding.ts`.

---

## 5. Desplegar

```bash
make deploy
```

O manualmente:
```bash
docker compose build
docker compose up -d
docker compose logs -f
```

---

## 6. Verificar

```bash
make status        # Ver estado de contenedores
make logs-api      # Ver logs del backend RSVP
curl -s http://localhost:8700/health   # API health
curl -s http://localhost:5176/         # Frontend OK
```

La aplicación estará disponible en:
- **https://eventique.tecnopowerpy.top** — invitación pública
- **https://eventique.tecnopowerpy.top/admin** — panel de administración
- **https://eventique.tecnopowerpy.top/api/docs** — Swagger UI (API)

---

## Panel de Administración

Accede a `/admin` con la contraseña definida en `ADMIN_TOKEN`.

Funcionalidades:
- Ver y eliminar confirmaciones de asistencia (RSVPs)
- Estadísticas en tiempo real (total, asistirán, no asistirán, total invitados)
- Configurar tipo de evento, nombres, fechas, recintos desde la UI
- Cambiar paleta de colores con preview en vivo
- Exportar RSVPs a CSV

---

## Actualizar configuración del evento

Desde el panel `/admin` → tab "Configuración", cambiar cualquier campo y guardar. Los cambios se reflejan en el próximo page load sin rebuild ni SSH.

Para cambios de código (nuevo diseño, funcionalidad):

```bash
# En Windows, copiar cambios al Pi:
scp -r /d/Proyectos/Eventos/Boda/frontend/src eudavalos@raspberrypi:~/Boda/frontend/
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose build && docker compose up -d --force-recreate"
```

---

## Troubleshooting

```bash
# Ver logs de todos los servicios
docker compose logs --tail=50

# API no responde
docker compose logs api
# → Verificar DATABASE_URL en .env, verificar que /app/data existe y tiene permisos

# Contenedores no levantan
docker compose ps
docker compose down && docker compose build --no-cache && docker compose up -d

# Cloudflare Tunnel no conecta
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -n 50
# → Verificar /etc/cloudflared/config.yml y que hostname existe en Cloudflare Dashboard

# DB corrupta o migración necesaria
docker compose exec api python3 -c "from api.models import Base; from api.database import engine; Base.metadata.create_all(bind=engine); print('Tables OK')"
```

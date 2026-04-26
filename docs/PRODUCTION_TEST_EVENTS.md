# 🚀 EVENTOS DE PRUEBA EN PRODUCCIÓN

**Status**: ✅ 5 EVENTOS CREADOS Y ACTIVOS  
**Fecha**: 2026-04-26  
**Ambiente**: https://eventique.tecnopowerpy.top  
**Cloudflare Tunnel**: Activo ✅

---

## 📍 LINKS DIRECTOS PARA ACCEDER (PRODUCCIÓN)

### 1. 💍 BODA — Concepción & Eumelio

**Invitación Pública** (para llenar RSVP):
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio
```

**Admin Panel** (gestionar evento):
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin
```

**Password Admin**: `change-me-in-production`

---

### 2. 🎂 CUMPLEAÑOS — Ana 30 años

**Invitación Pública**:
```
https://eventique.tecnopowerpy.top/e/cumple-ana-30
```

**Admin Panel**:
```
https://eventique.tecnopowerpy.top/e/cumple-ana-30/admin
```

---

### 3. ⛪ BAUTISMO — Sofía & Lucas

**Invitación Pública**:
```
https://eventique.tecnopowerpy.top/e/bautismo-sofialucas
```

**Admin Panel**:
```
https://eventique.tecnopowerpy.top/e/bautismo-sofialucas/admin
```

---

### 4. 👗 QUINCEAÑERA — Isabel

**Invitación Pública**:
```
https://eventique.tecnopowerpy.top/e/quinceañera-isabel
```

**Admin Panel**:
```
https://eventique.tecnopowerpy.top/e/quinceañera-isabel/admin
```

---

### 5. 🏢 CORPORATIVO — Conferencia Tech 2026

**Invitación Pública**:
```
https://eventique.tecnopowerpy.top/e/corporativo-techconf2026
```

**Admin Panel**:
```
https://eventique.tecnopowerpy.top/e/corporativo-techconf2026/admin
```

---

## 📊 TABLA RESUMEN

| Evento | Slug | Invitación | Admin | Tipo |
|--------|------|-----------|-------|------|
| 💍 Boda Concepción & Eumelio | `boda-concepcion-eumelio` | [link](https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio) | [admin](https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin) | boda |
| 🎂 Cumpleaños Ana 30 años | `cumple-ana-30` | [link](https://eventique.tecnopowerpy.top/e/cumple-ana-30) | [admin](https://eventique.tecnopowerpy.top/e/cumple-ana-30/admin) | cumpleaños |
| ⛪ Bautismo Sofía & Lucas | `bautismo-sofialucas` | [link](https://eventique.tecnopowerpy.top/e/bautismo-sofialucas) | [admin](https://eventique.tecnopowerpy.top/e/bautismo-sofialucas/admin) | bautismo |
| 👗 Quinceañera Isabel | `quinceañera-isabel` | [link](https://eventique.tecnopowerpy.top/e/quinceañera-isabel) | [admin](https://eventique.tecnopowerpy.top/e/quinceañera-isabel/admin) | quinceañera |
| 🏢 Conferencia Tech 2026 | `corporativo-techconf2026` | [link](https://eventique.tecnopowerpy.top/e/corporativo-techconf2026) | [admin](https://eventique.tecnopowerpy.top/e/corporativo-techconf2026/admin) | corporativo |

---

## ✅ TESTING CHECKLIST

### Flujo 1: Invitado Público
```
1. Abre: https://eventique.tecnopowerpy.top/e/{slug}
2. Completa RSVP (nombre, email, asistencia, etc)
3. Recibe confirmación en pantalla
4. Verifica email de confirmación (si SMTP está configurado)
```

### Flujo 2: Admin del Evento
```
1. Abre: https://eventique.tecnopowerpy.top/e/{slug}/admin
2. Login con: change-me-in-production
3. Explora tabs:
   ├─ Dashboard: Resumen del evento
   ├─ RSVPs: Ver confirmaciones de invitados
   ├─ Configuración: Editar datos del evento
   ├─ Tema: Cambiar paleta de colores
   ├─ Media: Subir fotos/audio
   ├─ Eventos: Crear/duplicar eventos
   └─ Secciones: Editar contenido
4. Edita datos del evento
5. Verifica cambios en invitación pública (sin rebuild)
```

### Flujo 3: Multi-Tenancy
```
1. Abre evento 1 (boda)
2. Completa RSVP
3. Abre evento 2 (cumpleaños)
4. Completa RSVP diferente
5. Accede a admin de cada evento
6. Verifica que RSVPs están AISLADOS por evento
7. Cambia config en evento 1 (NO afecta evento 2)
```

### Flujo 4: Diferentes Paletas
```
1. Abre evento boda (paleta: nature - verde/natural)
2. Abre evento cumpleaños (paleta: modern - azul/minimalista)
3. Abre evento corporativo (paleta: corporate - gris/formal)
4. Verifica que cada evento tiene su estilo visual único
```

---

## 🔐 SEGURIDAD & ACCESO

**Admin Tokens** (para acceso programático):
```
Boda:       token-boda-concepcion-eumelio
Cumpleaños: token-cumple-ana-30
Bautismo:   token-bautismo-sofialucas
Quinceañera: token-quinceañera-isabel
Corporativo: token-corporativo-techconf2026
```

**Usar token**:
```bash
curl -H "Authorization: Bearer token-boda-concepcion-eumelio" \
  https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/rsvp
```

---

## 📈 MONITOREO

**Health Check**:
```bash
curl https://eventique.tecnopowerpy.top/api/health
```

**Logs en Producción**:
```bash
ssh eudavalos@raspberrypi "cd ~/Boda && docker compose logs --tail=50 api"
```

**Database Status**:
```bash
ssh eudavalos@raspberrypi "ls -lh ~/Boda/data/eventique.db"
```

---

## 🧪 CASOS DE PRUEBA SUGERIDOS

| Caso | Evento | Acción | Esperado |
|------|--------|--------|----------|
| 1 | Boda | Llenar RSVP | RSVP guardado, confirmación email |
| 2 | Cumpleaños | Admin edita nombre evento | Cambio visible sin rebuild |
| 3 | Bautismo | Admin sube foto | Foto visible en galería |
| 4 | Quinceañera | Cambiar paleta | Tema visual cambia inmediatamente |
| 5 | Corporativo | Crear música playlist | Música suena en invitación |
| 6 | Multi-evento | RSVP en 2+ eventos | RSVPs aislados por evento |
| 7 | Responsive | Cualquiera | Abrir en mobile | Interfaz adaptable |

---

## 🎯 PRÓXIMOS PASOS

1. **Compartir links** con clientes potenciales para feedback
2. **Testear RSVPs** en cada evento
3. **Verificar emails** (si SMTP está configurado)
4. **Probar ediciones** de configuración en admin
5. **Monitorear logs** para errores

---

## 📝 NOTAS

- ✅ Cloudflare Tunnel está activo (systemd en Pi host)
- ✅ Docker containers están corriendo (nginx + FastAPI)
- ✅ Base de datos SQLite está persistida en `/home/eudavalos/Boda/data/`
- ✅ Eventos creados con fecha futura (visible en countdown)
- ✅ Cada evento es completamente independiente (multi-tenancy funcional)
- ⚠️ Password admin es `change-me-in-production` — **CAMBIAR EN PRODUCCIÓN REAL**

---

**Creado**: 2026-04-26  
**Status**: ✅ Listo para Pruebas  
**Ubicación**: https://eventique.tecnopowerpy.top

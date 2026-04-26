# Guía de Eventos de Prueba

**Objetivo**: Crear 5 eventos de prueba con diferentes tipos para testear la funcionalidad multi-tenancy.

**Eventos que se crearán**:
1. 💍 **Boda** — Concepción & Eumelio (2026-12-05)
2. 🎂 **Cumpleaños** — Ana 30 años (2026-06-10)
3. ⛪ **Bautismo** — Sofía & Lucas (2026-06-25)
4. 👗 **Quinceañera** — Isabel (2026-07-25)
5. 🏢 **Corporativo** — TechConf 2026 (2026-08-24)

---

## Opción 1: Con Docker (Recomendado)

### Paso 1: Iniciar Docker Compose

```bash
cd D:\Proyectos\Eventos\Boda
docker compose up -d
```

Espera a que los contenedores estén listos (15-20 segundos).

### Paso 2: Ejecutar script Python

```bash
docker compose exec api python scripts/create_test_events.py
```

**Salida esperada**:
```
✅ boda-concepcion-eumelio - Creado (boda)
✅ cumple-ana-30 - Creado (cumpleaños)
✅ bautismo-sofialucas - Creado (bautismo)
✅ quinceañera-isabel - Creado (quinceañera)
✅ corporativo-techconf2026 - Creado (corporativo)

==============================================================
Total eventos creados: 5
==============================================================

📍 LINKS PARA ACCEDER A CADA EVENTO:

Boda Concepción & Eumelio
  Tipo: boda
  Local:  http://localhost:5176/e/boda-concepcion-eumelio
  Prod:   https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio
...
```

---

## Opción 2: Con SQLite Directo (Local, sin Docker)

### Requisito
- SQLite3 instalado en tu máquina

### Ejecución

```bash
cd D:\Proyectos\Eventos\Boda
sqlite3 data/eventique.db < scripts/create_test_events.sql
```

**Salida esperada**:
```
EVENTOS CREADOS:
boda-concepcion-eumelio|Boda Concepción & Eumelio|local: http://localhost:5176/e/boda-concepcion-eumelio|prod: https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio
cumple-ana-30|Cumpleaños Ana - 30 años|local: http://localhost:5176/e/cumple-ana-30|prod: https://eventique.tecnopowerpy.top/e/cumple-ana-30
...
```

---

## Opción 3: Manual (Python con venv)

### Paso 1: Crear y activar venv

```bash
cd D:\Proyectos\Eventos\Boda
python -m venv venv

# En Windows:
venv\Scripts\activate

# En Mac/Linux:
source venv/bin/activate
```

### Paso 2: Instalar dependencias

```bash
pip install -r requirements.txt
```

### Paso 3: Ejecutar script

```bash
python scripts/create_test_events.py
```

---

## Links de Acceso por Tipo

| Tipo | Slug | Local | Admin Token |
|------|------|-------|------------|
| 💍 Boda | `boda-concepcion-eumelio` | `http://localhost:5176/e/boda-concepcion-eumelio` | `token-boda-concepcion-eumelio` |
| 🎂 Cumpleaños | `cumple-ana-30` | `http://localhost:5176/e/cumple-ana-30` | `token-cumple-ana-30` |
| ⛪ Bautismo | `bautismo-sofialucas` | `http://localhost:5176/e/bautismo-sofialucas` | `token-bautismo-sofialucas` |
| 👗 Quinceañera | `quinceañera-isabel` | `http://localhost:5176/e/quinceañera-isabel` | `token-quinceañera-isabel` |
| 🏢 Corporativo | `corporativo-techconf2026` | `http://localhost:5176/e/corporativo-techconf2026` | `token-corporativo-techconf2026` |

---

## Testing de Eventos

### Para Invitado (Cliente Público)

1. **Abre el evento** en browser:
   ```
   http://localhost:5176/e/boda-concepcion-eumelio
   ```

2. **Completa el RSVP**:
   - Nombre: p.ej., "Juan García"
   - Email: p.ej., "juan@example.com"
   - Attendance: Sí / No
   - Guests: Cantidad
   - Dietary restrictions (opcional)
   - Song request (opcional)
   - Message (opcional)

3. **Verifica**:
   - Recibe confirmación en pantalla
   - Email de confirmación (si SMTP está configurado)

### Para Admin (Gestión de Eventos)

1. **Accede al admin** del evento:
   ```
   http://localhost:5176/e/boda-concepcion-eumelio/admin
   ```

2. **Login** con password (por defecto: `change-me-in-production`)

3. **Explora tabs**:
   - **Dashboard**: Resumen del evento
   - **RSVPs**: Ver confirmaciones
   - **Configuración**: Editar datos del evento
   - **Tema**: Cambiar paleta de colores
   - **Media**: Subir fotos/audio
   - **Eventos**: Crear/duplicar eventos
   - **Secciones**: Editar Hero, Countdown, etc.

### Para Superadmin (Multi-tenancy)

1. **Accede a panel general**:
   ```
   http://localhost:5176/admin
   ```

2. **Ver todos los eventos**:
   - Listar eventos
   - Estadísticas globales
   - Crear eventos para clientes

---

## Testing Completo

### Flujo 1: Evento Nuevo
```
1. Abre invitación pública
2. Llena RSVP
3. Accede a admin del evento
4. Ve tu RSVP en la tabla
5. Edita/elimina tu RSVP
6. Verifica cambios persisten
```

### Flujo 2: Múltiples Eventos
```
1. Abre evento 1 (boda)
2. Completa RSVP
3. Abre evento 2 (cumpleaños)
4. Completa RSVP diferente
5. Verifica que RSVPs están aislados por evento
6. Accede a admin de cada evento
7. Confirma datos separados
```

### Flujo 3: Configuración Dinámica
```
1. Abre admin de evento
2. Cambia nombre, fecha, paleta
3. Guarda cambios
4. Abre invitación pública
5. Verifica cambios aparecen sin rebuild
```

---

## Troubleshooting

### Error: "sqlite3 command not found"
```bash
# En Windows, usar PowerShell:
$env:Path += ";C:\Program Files\Git\usr\bin"
sqlite3 data/eventique.db < scripts/create_test_events.sql

# O usar WSL:
wsl sqlite3 data/eventique.db < scripts/create_test_events.sql
```

### Error: "database is locked"
```bash
# Asegurate que no hay otros procesos usando la BD
# Intenta cerrar Docker:
docker compose down

# Luego ejecuta el script SQL
sqlite3 data/eventique.db < scripts/create_test_events.sql

# Reinicia Docker
docker compose up -d
```

### Error: "EventConfig table not found"
```bash
# Las migraciones no se ejecutaron
# Ejecuta con Docker:
docker compose up -d

# El API ejecutará migraciones automáticamente
# Espera 10 segundos y ejecuta el script:
docker compose exec api python scripts/create_test_events.py
```

---

## Limpieza (Opcional)

### Eliminar todos los eventos de prueba

```bash
sqlite3 data/eventique.db << EOF
DELETE FROM event_config WHERE event_slug IN (
  'boda-concepcion-eumelio',
  'cumple-ana-30',
  'bautismo-sofialucas',
  'quinceañera-isabel',
  'corporativo-techconf2026'
);

DELETE FROM events WHERE slug IN (
  'boda-concepcion-eumelio',
  'cumple-ana-30',
  'bautismo-sofialucas',
  'quinceañera-isabel',
  'corporativo-techconf2026'
);

SELECT 'Eventos de prueba eliminados' as resultado;
EOF
```

---

## Próximos Pasos

1. ✅ Crear eventos de prueba (este documento)
2. 🔄 Testear RSVP en múltiples eventos
3. 📸 Subir media (fotos, audio)
4. 📝 Editar secciones por evento
5. 🚀 Deploy a Pi (scripts/phase12-deploy-pi.sh)

---

**Última actualización**: 2026-04-26  
**Estado**: Listo para testing

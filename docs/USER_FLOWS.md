# EVENTIQUE — FLUJOS DE USO

> Guía completa de cómo usan la aplicación los diferentes actores

**Versión**: 3.0.0  
**Fecha**: 2026-04-26

---

## ACTORES Y ROLES

1. **Cliente** (Event Owner) — Persona que organiza el evento
2. **Invitado** (Guest) — Persona que recibe la invitación
3. **Admin** (interno) — Soporte técnico que gestiona la plataforma

---

## FLUJO 1: CLIENTE CREA Y CONFIGURA EVENTO

### Paso 1: Acceder al Admin Panel

**URL**: `https://eventique.tecnopowerpy.top/admin`  
**O**: `http://localhost:5176/admin` (desarrollo local)

```
┌─────────────────────────────────────┐
│  ADMIN LOGIN                        │
├─────────────────────────────────────┤
│ Ingresa contraseña del evento       │
│ (Proporcionada por admin interno)   │
│                                     │
│ [Contraseña: ***]                   │
│ [Ingresar]                          │
└─────────────────────────────────────┘
        ↓
   ✅ Acceso concedido
```

### Paso 2: Dashboard Inicial

Después de login, ve el **Dashboard** (Inicio tab):

```
┌─────────────────────────────────────────────────────────┐
│ EVENTIQUE ADMIN                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Evento actual                                          │
│  ├─ Nombre: Boda de Concepción & Eumelio             │
│  ├─ ID: default                                        │
│  └─ Tipo: Boda                                         │
│                                                         │
│  Resumen                                                │
│  ├─ Confirmaciones: 0                                  │
│  ├─ Asistentes: 0                                      │
│  ├─ No asisten: 0                                      │
│  └─ Invitados total: 0                                 │
│                                                         │
│  Accesos rápidos                                        │
│  ├─ [Editar configuración]   ← Nombres, fecha, lugares│
│  ├─ [Editar secciones]       ← Historia, agenda, etc  │
│  ├─ [Subir multimedia]        ← Fotos, videos, música │
│  └─ [Ver confirmaciones]      ← RSVP responses       │
│                                                         │
│  Link público de invitación                             │
│  └─ [Copiar link] [Ver QR]                            │
└─────────────────────────────────────────────────────────┘
```

### Paso 3: Editar Configuración Básica

Tab: **Configuración**

```
┌─────────────────────────────────────────────────────────┐
│ CONFIGURACIÓN                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Tipo de evento                                          │
│ └─ [Boda ▼]  (Boda/Cumpleaños/Bautismo/etc)          │
│                                                         │
│ Detalles de la pareja                                   │
│ ├─ Novio/a 1: [Concepción          ]                  │
│ ├─ Novio/a 2: [Eumelio             ]                  │
│ └─ Nombres: [Concepción & Eumelio  ]                  │
│                                                         │
│ Fecha y hora                                            │
│ ├─ Ceremonia: [2026-12-05 14:30    ]                  │
│ ├─ Zona horaria: [America/Mexico_City ▼]              │
│ └─ Mostrar como: [5 de diciembre, 2026 ▼]             │
│                                                         │
│ Ceremonia                                               │
│ ├─ Nombre: [Iglesia San Juan          ]                │
│ ├─ Dirección: [Calle Principal 123    ]                │
│ ├─ Ciudad: [San Francisco             ]                │
│ ├─ País: [México                      ]                │
│ └─ [Ver en Maps]                                       │
│                                                         │
│ Recepción                                               │
│ ├─ Nombre: [Salón de Eventos Cristal ]                 │
│ ├─ Dirección: [Av. Secundaria 456    ]                │
│ ├─ Ciudad: [San Francisco             ]                │
│ ├─ País: [México                      ]                │
│ └─ [Ver en Maps]                                       │
│                                                         │
│ RSVP                                                    │
│ ├─ ☑ Habilitar RSVP                                    │
│ ├─ Fecha límite: [2026-11-20         ]                 │
│ └─ Máximo de invitados por persona: [4]               │
│                                                         │
│ [Guardar Configuración]                                 │
│ ✅ Guardado correctamente                              │
└─────────────────────────────────────────────────────────┘
```

### Paso 4: Personalizar Tema

Tab: **Tema**

```
┌─────────────────────────────────────────────────────────┐
│ TEMA                                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Selecciona una paleta:                                  │
│                                                         │
│ ☐ Nature     [🎨 Verde/Oro oscuro]      ← SELECTED    │
│ ☐ Rose Gold  [🎨 Rosa/Oro claro ]                      │
│ ☐ Garden     [🎨 Verde/Oro suave]                      │
│ ☐ Navy Gold  [🎨 Azul marino/Oro]                      │
│ ☐ Sage       [🎨 Gris/Oro neutro]                      │
│ ☐ Midnight   [🎨 Purpura/Dorado]                       │
│                                                         │
│ Vista previa de invitación:                             │
│ ┌─────────────────────────────────────┐               │
│ │ [Preview con colores seleccionados] │               │
│ │ Concepción & Eumelio                │               │
│ │ 5 de diciembre, 2026                │               │
│ │ San Francisco, México               │               │
│ └─────────────────────────────────────┘               │
│                                                         │
│ [Guardar Tema]                                          │
└─────────────────────────────────────────────────────────┘
```

### Paso 5: Subir Multimedia

Tab: **Media**

```
┌─────────────────────────────────────────────────────────┐
│ MEDIA                                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Arrastra imágenes aquí (max 10MB cada una)             │
│ ┌─────────────────────────────────────────────────────┐│
│ │  🖼️  Arrastra archivos aquí                         ││
│ │      O [Selecciona archivos]                         ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Archivos subidos:                                       │
│                                                         │
│ 1. foto-boda-1.jpg (2.3 MB)                            │
│    [🖼️ Preview] [🎵 Galería] [🎬 Hero] [📋 Copiar URL]│
│    [Eliminar]                                           │
│                                                         │
│ 2. foto-boda-2.jpg (1.8 MB)                            │
│    [🖼️ Preview] [🎵 Galería] [🎬 Hero] [📋 Copiar URL]│
│    [Eliminar]                                           │
│                                                         │
│ 3. musica-de-fondo.mp3 (5.2 MB)                        │
│    [🔊 Preview] [🎵 Música] [📋 Copiar URL]           │
│    [Eliminar]                                           │
│                                                         │
│ YouTube Tracks:                                         │
│ ├─ Track 1: "Canción Romántica" (zqlkbbJ003w)         │
│ │  [Reproducir] [Eliminar]                            │
│ └─ [+ Agregar track de YouTube]                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 6: Editar Secciones

Tab: **Secciones** (Edita contenido de la invitación)

```
┌─────────────────────────────────────────────────────────┐
│ SECCIONES                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ HERO SECTION                                            │
│ ├─ ☑ Habilitada                                        │
│ ├─ Subtítulo: [Nos encantaría tu presencia]           │
│ ├─ Imagen de fondo: [Selecciona foto ▼]               │
│ └─ Opacidad del overlay: [━━●━━] 45%                  │
│                                                         │
│ COUNTDOWN                                               │
│ ├─ ☑ Habilitada                                        │
│ └─ Texto: [Falta poco para nuestro gran día]          │
│                                                         │
│ HISTORIA                                                │
│ ├─ ☑ Habilitada                                        │
│ ├─ Título: [Nuestra Historia]                          │
│ ├─ Eventos de la relación:                             │
│ │  ├─ 2020-01-15: "Nos conocimos" (descripción)       │
│ │  ├─ 2023-06-20: "Primera cita" (descripción)        │
│ │  └─ [+ Agregar evento]                              │
│ └─ [Guardar]                                           │
│                                                         │
│ AGENDA                                                  │
│ ├─ ☑ Habilitada                                        │
│ ├─ Título: [Cronograma del Día]                        │
│ ├─ Eventos:                                             │
│ │  ├─ 14:30 - Ceremonia (Iglesia)                      │
│ │  ├─ 15:30 - Fotos (Parque)                           │
│ │  ├─ 17:00 - Recepción (Salón)                        │
│ │  └─ [+ Agregar evento]                              │
│ └─ [Guardar]                                           │
│                                                         │
│ GALERÍA                                                 │
│ ├─ ☑ Habilitada                                        │
│ ├─ Fotos agregadas: 5                                  │
│ └─ Puedes arrastrar para reordenar                     │
│                                                         │
│ RSVP                                                    │
│ ├─ Título: [Confirma tu asistencia]                    │
│ ├─ Subtítulo: [Nos encantaría contar contigo]         │
│ └─ Mensaje de confirmación: [Gracias por confirmar!]  │
│                                                         │
│ REDES SOCIALES                                          │
│ ├─ Hashtag: [#BoAmelio]                                │
│ └─ Instagram: [@concepcionandeumelio]                  │
│                                                         │
│ MÚSICA                                                  │
│ ├─ ☑ Habilitada                                        │
│ ├─ ☑ Autoplay                                          │
│ └─ Tracks: 1 YouTube + 2 archivos                      │
│                                                         │
│ [Guardar Todas las Secciones]                           │
│ ✅ Secciones actualizadas                              │
└─────────────────────────────────────────────────────────┘
```

### Paso 7: Ver RSVPs

Tab: **RSVPs**

```
┌─────────────────────────────────────────────────────────┐
│ RSVPS                                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Estadísticas                                            │
│ ├─ Respuestas: 25                                      │
│ ├─ Asistentes: 23                                      │
│ ├─ No asisten: 2                                       │
│ └─ Total invitados: 45                                 │
│                                                         │
│ [Exportar CSV]                                          │
│                                                         │
│ Tabla de respuestas:                                    │
│                                                         │
│ | Nombre | Email | Asiste | Invitados | Dieta | Fecha |
│ |--------|-------|--------|-----------|-------|-------|
│ | Juan García | juan@ex.com | ✅ Sí | 2 | Ninguna | 2026-11-15 |
│ | María López | maria@ex.com | ✅ Sí | 1 | Vegetariano | 2026-11-14 |
│ | Carlos Ruiz | carlos@ex.com | ❌ No | 0 | - | 2026-11-20 |
│ ...                                                     │
│                                                         │
│ [Editar ✏️] [Eliminar 🗑️]  ← por cada RSVP           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 8: Publicar y Compartir

Desde el **Dashboard**:

```
┌─────────────────────────────────────────────────────────┐
│ Link público de invitación                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ URL: https://eventique.tecnopowerpy.top/e/default     │
│                                                         │
│ [Copiar link]  → Copia a portapapeles                  │
│ [Ver QR]       → Muestra código QR para compartir      │
│                                                         │
│ Comparte con invitados:                                 │
│ • WhatsApp                                              │
│ • Email                                                 │
│ • Redes sociales                                        │
│ • O imprime el QR                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## FLUJO 2: INVITADO RECIBE Y RESPONDE RSVP

### Paso 1: Acceder a la Invitación

**Recibe**: Link o QR desde el cliente

```
Hola, te invitamos a nuestra boda:
https://eventique.tecnopowerpy.top/e/default

O escanea este QR → [QR IMAGE]
```

**O dirección directa**: `https://eventique.tecnopowerpy.top/`

### Paso 2: Ver Invitación Pública

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  🎎 HERO SECTION                                        │
│  ═════════════════════════════════════════════════════ │
│                                                         │
│              Concepción & Eumelio                       │
│                                                         │
│              5 de diciembre, 2026                       │
│            San Francisco, México                        │
│                                                         │
│         [Confirmar asistencia] ← RSVP button           │
│         ↓ Scroll                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ COUNTDOWN                                               │
│ ├─ Falta poco para nuestro gran día                     │
│ ├─ 234 días, 12 horas, 45 minutos                      │
│ └─ [Countdown timer animado]                            │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ NUESTRA HISTORIA                                        │
│ ├─ 2020: Nos conocimos (descripción)                    │
│ ├─ 2023: Primera cita (descripción)                     │
│ └─ [Timeline visual]                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ CEREMONIA & RECEPCIÓN                                   │
│ ├─ Ceremonia: Iglesia San Juan                         │
│ │  └─ [Ver en Maps]                                    │
│ ├─ Recepción: Salón de Eventos Cristal                 │
│ │  └─ [Ver en Maps]                                    │
│ └─ [Direcciones]                                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ CRONOGRAMA DEL DÍA                                      │
│ ├─ 14:30 → Ceremonia (Iglesia)                         │
│ ├─ 15:30 → Fotos (Parque)                              │
│ ├─ 17:00 → Recepción (Salón)                           │
│ └─ [Timeline visual]                                    │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ GALERÍA                                                 │
│ ├─ [Foto 1] [Foto 2] [Foto 3] [Foto 4] [Foto 5]       │
│ └─ [Lightbox al hacer click]                           │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ CONFIRMA TU ASISTENCIA                                  │
│ └─ [RSVP FORM ↓]                                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ REDES SOCIALES                                          │
│ ├─ Hashtag: #BoAmelio                                   │
│ ├─ Instagram: @concepcionandeumelio                     │
│ └─ [Links a redes sociales]                             │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ FOOTER                                                  │
│ └─ © 2026 Powered by Eventique                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 3: Llenar Formulario RSVP

```
┌─────────────────────────────────────────────────────────┐
│ CONFIRMA TU ASISTENCIA                                  │
│ "Nos encantaría contar contigo"                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Nombre completo *                                       │
│ [Juan García García          ]                          │
│                                                         │
│ Email *                                                 │
│ [juan.garcia@email.com       ]                          │
│                                                         │
│ ¿Asistirás? *                                           │
│ ⦿ Sí, ¡Me encantaría!  ○ No podré asistir             │
│                                                         │
│ Número de invitados (incluyéndote) *                    │
│ [2 ▼]  (Máximo: 4 personas)                            │
│                                                         │
│ Acompañante (si aplica)                                 │
│ [María García López          ]                          │
│                                                         │
│ Restricciones dietéticas (opcional)                     │
│ [Vegetariano                 ]                          │
│                                                         │
│ Canción especial (opcional)                             │
│ [Nuestra canción es "La Vida es Bella"] ]              │
│                                                         │
│ Mensaje para los novios (opcional)                      │
│ [¡Que sea el mejor día de vuestras vidas!]            │
│                                                         │
│ [Confirmar mi asistencia]                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
        ↓
   ✅ Guardado
```

### Paso 4: Confirmación

```
┌─────────────────────────────────────────────────────────┐
│ ✅ ¡CONFIRMACIÓN RECIBIDA!                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 💚 ¡Gracias, Juan!                                      │
│                                                         │
│ Recibimos tu respuesta para la boda de                 │
│ Concepción & Eumelio.                                  │
│                                                         │
│ ¡Estamos emocionados de compartir este                 │
│ momento contigo!                                        │
│                                                         │
│ Detalles confirmados:                                   │
│ • Asistencia: Sí (2 invitados)                         │
│ • Dieta: Vegetariano                                   │
│ • Email de confirmación enviado ✉️                     │
│                                                         │
│ Te enviaremos más información próximamente.             │
│                                                         │
│ [Cerrar]                                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Paso 5: Email de Confirmación

```
📧 EMAIL RECIBIDO

Asunto: Confirmación — Boda de Concepción & Eumelio

═════════════════════════════════════════════════════════

¡Gracias, Juan!

Recibimos tu respuesta para la boda de Concepción & Eumelio.

¡Estamos emocionados de compartir este momento contigo!

═════════════════════════════════════════════════════════

Detalles:
- Nombre: Juan García García
- Email: juan.garcia@email.com
- Asistencia: ✅ Sí
- Invitados: 2
- Dieta: Vegetariano
- Canción: "La Vida es Bella"

═════════════════════════════════════════════════════════

Boda de Concepción & Eumelio
5 de diciembre, 2026
San Francisco, México

[Ver invitación completa]

Este correo fue enviado automáticamente. No responder.
```

---

## FLUJO 3: CLIENTE GESTIONA RSVPs Y PREPARA EVENTO

### Paso 1: Monitoreo de Confirmaciones

**Tab RSVPs** — Se actualiza en tiempo real:

```
Confirmaciones recibidas: 25 / 100 invitados

Asistentes confirmados: 23 personas
- Invitados adicionales: 45 (23 + 22 acompañantes)

No asistentes: 2 personas

Pendientes: 73 invitados sin respuesta
```

### Paso 2: Acciones Administrativas

**En tab RSVPs, para cada respuesta**:

```
| Juan García | juan@ex.com | ✅ Sí | 2 | Vegetariano | 2026-11-15 |
  └─ [Editar RSVP] [Eliminar RSVP]
```

**Editar RSVP**:
- Cambiar nombre, asistencia, número de invitados, dieta, etc.
- Guardar cambios (actualiza en BD)

**Eliminar RSVP**:
- Confirmar eliminación
- Se quita de la lista

### Paso 3: Exportar Datos

**Botón "Exportar CSV"**:

```
descarga: rsvps-boda-2026-12-05.csv

Formato:
Nombre,Email,Asiste,Invitados,Dieta,Canción,Mensaje,Fecha

Juan García,juan@ex.com,Sí,2,Vegetariano,La Vida es Bella,Que sea el mejor día,2026-11-15
María López,maria@ex.com,Sí,1,Sin restricciones,Sin preferencia,¡Éxito!,2026-11-14
...
```

### Paso 4: Últimas Preparaciones

**Última semana antes del evento**:

1. **Revisar confirmaciones**: ¿Cuántos van a asistir?
2. **Revisar restricciones dietéticas**: Comunicar al catering
3. **Revisar música**: Confirmar playlist con DJ
4. **Revisar detalles**: Nombres, lugares, horarios correctos
5. **Enviar recordatorio** (manual si lo desea)

**En la plataforma**:
- Admin puede ver todos los datos en RSVPs tab
- Exporta CSV para compartir con catering, DJ, etc.
- Puede editar cualquier RSVP si hay cambios

---

## FLUJO 4: EVENTOS MÚLTIPLES (Multi-Tenancy)

### Cliente A Crea Evento 1 (Boda)

```
Admin → Eventos tab → [+ Crear evento]

Nombre: Boda de Concepción & Eumelio
Slug: boda-concepcion-eumelio
Token: [auto-generado]

↓
URL: https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio
Admin: https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin
```

### Cliente B Crea Evento 2 (Cumpleaños)

```
Admin → Eventos tab → [+ Crear evento]

Nombre: Cumpleaños de Ana
Slug: cumpleaños-ana
Token: [auto-generado]

↓
URL: https://eventique.tecnopowerpy.top/e/cumpleaños-ana
Admin: https://eventique.tecnopowerpy.top/e/cumpleaños-ana/admin
```

### Ambos Eventos Independientes

```
Evento 1:
├─ Configuración independiente
├─ RSVPs independientes
├─ Media independiente (fotos, música)
└─ 25 RSVPs

Evento 2:
├─ Configuración independiente
├─ RSVPs independientes
├─ Media independiente (fotos, música)
└─ 30 RSVPs
```

### Duplicar Evento (Para Nuevo Cliente)

```
Admin → Eventos tab → [Duplicar evento]

Selecciona evento a duplicar: "Boda de Concepción & Eumelio"
↓
Modal: Duplicar evento
├─ Nombre nuevo: [Boda de Juan & María]
├─ Slug: [boda-juan-maria]
└─ Token: [auto-generado]

[Duplicar]
↓
✅ Evento duplicado
   - Copia toda la configuración
   - Copia secciones
   - Copia media
   - ❌ NO copia RSVPs
   - Nuevo token de admin
```

---

## FLUJO 5: ADMIN INTERNO (Soporte Técnico)

### Crear Evento para Cliente

```
1. Cliente contacta a admin interno
   "Quiero crear una invitación para mi boda"

2. Admin interno:
   ├─ Crea evento en plataforma
   ├─ Genera token único
   ├─ Envía al cliente:
   │  ├─ Link de invitación pública
   │  ├─ Link de admin panel
   │  └─ Password para admin
   └─ Da instrucciones básicas
```

### Monitorear Eventos

```
Admin interno dashboard:
├─ Total eventos activos: 42
├─ Total RSVPs: 1,247
├─ Eventos en última semana: 5
└─ Health status: ✅ OK

Alertas:
├─ ⚠️ 3 eventos sin RSVPs (revisar)
├─ ⚠️ 1 evento sin multimedia
└─ ✅ 0 errores críticos
```

### Soporte a Clientes

```
Cliente: "¿Cómo cambio el token de admin?"
Admin: "En panel admin, tab Eventos, click en el evento, 
        botón 'Cambiar token'"

Cliente: "¿Puedo tener un acompañante extra?"
Admin: "Sí, edita tu RSVP en el tab RSVPs o crea una nueva"

Cliente: "¿Cómo exporto la lista de invitados?"
Admin: "En tab RSVPs, botón 'Exportar CSV' descarga 
        los datos en Excel"
```

---

## ESTADOS TRANSVERSALES

### 1. MÓVIL (Invitado)

```
Invitado abre link en celular:
├─ Diseño responsive automático
├─ Invitación se adapta a pantalla
├─ RSVP form es fácil de llenar
└─ Confirmación clara
```

### 2. DESKTOP (Cliente Admin)

```
Cliente abre admin en desktop:
├─ Panel completo con todos los tabs
├─ Formularios amplios y claros
├─ Tablas legibles
└─ Botones de acción visibles
```

### 3. EMAILING (Automático)

```
Cuando invitado confirma RSVP:
├─ Email 1: Confirmación al invitado
│  └─ "Gracias por confirmar tu asistencia"
├─ Email 2: Notificación al cliente
│  └─ "Nuevo RSVP: Juan García (2 invitados)"
└─ (Si SMTP configurado)
```

---

## TIMELINE TÍPICO DE USO

```
6 SEMANAS ANTES:
└─ Cliente crea evento en plataforma
   ├─ Configura nombres, fecha, lugares
   ├─ Sube fotos y música
   ├─ Edita secciones (historia, agenda, etc)
   └─ Genera link de invitación

4-5 SEMANAS ANTES:
└─ Cliente comparte link/QR con invitados
   ├─ WhatsApp, email, redes sociales
   └─ Algunos comienzan a confirmar

1-3 SEMANAS ANTES:
└─ RSVPs se acumulan
   ├─ Cliente monitorea confirmaciones
   ├─ Admin exporta CSV para catering/DJ
   └─ Cambios últimos a evento si es necesario

1 SEMANA ANTES:
└─ Cierre de RSVP (deadline)
   ├─ Cliente revisa lista final
   ├─ Revisa restricciones dietéticas
   └─ Confirma detalles con proveedores

DÍA DEL EVENTO:
└─ Invitados acceden a invitación
   ├─ Ven mapa, cronograma, dirección
   ├─ Pueden ver galería de fotos
   └─ Escuchan música
```

---

## RESUMEN DE ACTORES Y ACCIONES

| Actor | Acciones Principales | Frecuencia |
|-------|----------------------|-----------|
| **Invitado** | Ver invitación, llenar RSVP | 1 vez |
| **Cliente (Host)** | Crear evento, configurar, monitorear RSVPs | Múltiples |
| **Admin (Soporte)** | Crear cuenta, monitorear, dar soporte | Según sea necesario |

---

## CASOS DE USO ESPECIALES

### 1. Cambiar de Parecer (Invitado)

```
Invitado confirma "Sí" → Luego confirma "No"
├─ Accede a invitación nuevamente
├─ Llena RSVP de nuevo
└─ Sistema sobrescribe la anterior
   (Últimas respuesta gana)
```

### 2. Invitado Adicional de Última Hora

```
Cliente: "Un amigo quiere ir, ¿puedo agregar?"
Opción 1: Cliente crea nuevo RSVP manualmente en admin
Opción 2: Invitado edita su RSVP aumenta número invitados
```

### 3. Evento Pospuesto

```
Cliente: "Debemos reprogramar para el 2027"
Acción: Tab Configuración → Cambiar fecha
        ↓
        Automáticamente:
        ├─ Invitación pública se actualiza
        ├─ Countdown se recalcula
        ├─ Email de cambio se envía a RSVPs (si aplica)
        └─ Invitados ven fecha nueva si revisitan
```

---

**Documentación completada: 2026-04-26**


# Guía de Usuario — Eventique
## Tu Invitación Digital Inteligente

**Versión**: 2.0 Enterprise  
**Actualizado**: Mayo 2026  
**Soporte**: eudavalos91@gmail.com

---

## ¿Qué es Eventique?

Eventique es tu invitación digital personalizada para bodas y eventos especiales. Es como una página web exclusiva para tu evento — tus invitados la abren en el celular o computadora y ven todos los detalles de tu celebración de una manera moderna y elegante.

**No es una app que se descarga.** Se abre directo en el navegador, igual que cualquier página web. No requiere instalar nada.

---

## Índice

1. [Guía de inicio rápido (30 minutos)](#1-guía-de-inicio-rápido-30-minutos)
2. [Acceder a tu evento](#2-acceder-a-tu-evento)
3. [Panel de Administración](#3-panel-de-administración)
4. [Personalizar el diseño (Tab Tema)](#4-personalizar-el-diseño-tab-tema)
5. [Configuración general (Tab Config)](#5-configuración-general-tab-config)
6. [Gestionar archivos (Tab Media)](#6-gestionar-archivos-tab-media)
7. [Editar secciones (Tab Secciones)](#7-editar-secciones-tab-secciones)
8. [Gestionar invitados (Tab Invitados)](#8-gestionar-invitados-tab-invitados)
9. [Ver confirmaciones (Tab RSVPs)](#9-ver-confirmaciones-tab-rsvps)
10. [Gestionar eventos (Tab Eventos)](#10-gestionar-eventos-tab-eventos)
11. [Flujo completo: enviar invitaciones por WhatsApp](#11-flujo-completo-enviar-invitaciones-por-whatsapp)
12. [Estilos de invitación disponibles](#12-estilos-de-invitación-disponibles)
13. [Checklist pre-evento](#13-checklist-pre-evento)
14. [Solución de problemas frecuentes](#14-solución-de-problemas-frecuentes)
15. [Glosario de términos](#15-glosario-de-términos)
16. [Mejores prácticas](#16-mejores-prácticas)
17. [Preguntas frecuentes](#17-preguntas-frecuentes)

---

## 1. Guía de inicio rápido (30 minutos)

Esta sección es para quien recibe Eventique por primera vez y quiere tener la invitación funcionando lo más rápido posible.

### Lo que necesitás antes de empezar:
- La **URL de tu evento** (ej. `https://eventique.tecnopowerpy.top/e/tu-boda`)
- Tu **contraseña de administrador** (token) — te la envió el administrador del sistema
- Una **foto de portada** (JPG o PNG, la mejor que tengas de los novios)
- Los **datos básicos** de tu evento: fecha, lugares, hora

### Paso 1 — Entrá al panel de administración (2 minutos)
1. Abrí tu navegador (Chrome, Safari o cualquiera)
2. Escribí tu URL de evento + `/admin` al final:
   ```
   https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin
   ```
3. Ingresá tu contraseña de administrador
4. ¡Ya estás dentro!

### Paso 2 — Cargá los datos de tu evento (5 minutos)
1. Clic en el tab **Config**
2. Completá:
   - Nombres de los novios
   - Fecha del evento
   - Lugar de la ceremonia (nombre + dirección + enlace Google Maps)
   - Lugar de la recepción (si hay dos lugares)
3. Clic en **Guardar Config** (botón azul al final)

### Paso 3 — Elegí los colores (2 minutos)
1. Clic en el tab **Tema**
2. Mirá las paletas de colores disponibles y clic en la que más te guste
3. Clic en **Guardar Tema**

### Paso 4 — Subí la foto de portada (5 minutos)
1. Clic en el tab **Media**
2. Clic en **Subir archivo**
3. Seleccioná tu foto de portada (JPG o PNG)
4. Esperá que suba (barra de progreso)
5. Una vez subida, anotá la URL de la foto que aparece
6. Andá al tab **Secciones → Hero (Portada)**
7. Pegá esa URL en el campo **"Imagen de fondo"**
8. Clic en **Guardar**

### Paso 5 — Mirá cómo quedó (2 minutos)
1. Abrí una nueva pestaña del navegador
2. Escribí tu URL de evento (sin el `/admin`)
3. ¡Ves tu invitación! Si no ves los cambios, actualizá la página (tecla F5)

### Paso 6 — Cargá tus invitados (10 minutos)
1. Clic en el tab **Invitados**
2. Si ya tenés una lista en Excel:
   - Clic en **Exportar Plantilla** → abrí el CSV que descargó
   - Completá los datos en Excel → guardá como CSV
   - Clic en **Importar CSV** → subí el archivo → revisá la previsualización → Confirmar
3. Si no tenés lista:
   - Clic en **Nuevo Invitado** para cada persona → completá el formulario → Guardar

### Paso 7 — Enviá las primeras invitaciones (3 minutos)
1. En el tab **Invitados**, clic en el ícono de WhatsApp de un invitado
2. Revisá el mensaje que se generó
3. Clic en **Abrir WhatsApp** → elegí el contacto → enviá

¡Listo! Tu evento está funcionando y tus invitados pueden ver la invitación y confirmar asistencia.

---

## 2. Acceder a tu evento

### La invitación pública
Tu invitación tiene una dirección web única (URL). Por ejemplo:
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio
```

Comparte esa dirección con tus invitados por WhatsApp, Instagram, email, o donde prefieras. Cuando la abran, verán toda la información de tu evento.

### Invitación personalizada
Si configuraste invitaciones personalizadas, cada invitado tiene su propio enlace único:
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/i/CODIGO-UNICO
```

Ese enlace muestra el nombre del invitado, cuántos lugares tiene reservados, y solo él puede confirmar su asistencia con el cupo exacto que le asignaste.

### La diferencia entre los dos tipos de enlace

| Enlace público | Enlace personalizado |
|----------------|---------------------|
| Cualquiera puede abrirlo | Solo ese invitado lo tiene |
| Cualquiera puede confirmar | Solo ese invitado puede confirmar |
| No muestra nombre personalizado | Saluda al invitado por su nombre |
| Sin límite de cupos | Cupo exacto asignado por vos |
| Sirve para difusión general | Sirve para control exacto de asistencia |

---

## 3. Panel de Administración

El panel de administración es donde controlas todo de tu evento. Es como el "tablero de control" de tu invitación.

### Cómo entrar
Agrega `/admin` al final de tu URL de evento:
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin
```

Necesitarás una contraseña (token de administrador). Esta contraseña la tienes en el correo de configuración inicial de tu evento.

### El panel tiene 7 secciones (tabs)

| Tab | Para qué sirve |
|-----|---------------|
| **RSVPs** | Ver quiénes confirmaron asistencia |
| **Config** | Configurar datos básicos del evento |
| **Tema** | Cambiar colores y apariencia visual |
| **Media** | Subir fotos y música |
| **Secciones** | Editar cada parte de tu invitación |
| **Invitados** | Gestionar lista de invitados personalizados |
| **Eventos** | Gestionar múltiples eventos (solo administrador) |

### Cómo navegar el panel
- Clic en el nombre del tab para cambiar de sección
- Los cambios **no se guardan automáticamente** — siempre buscá el botón **Guardar** o **Confirmar** antes de cambiar de tab
- Si cerrás el navegador sin guardar, los cambios se pierden
- Podés abrir la invitación pública en otra pestaña para ver los cambios en tiempo real

---

## 4. Personalizar el diseño (Tab Tema)

Aquí controlas cómo se ve tu invitación: colores, tipografías y estilo.

### Paletas de colores disponibles

Hay 22 combinaciones de colores profesionales organizadas por categoría:

**Para bodas:**
| Paleta | Descripción | Cuándo usarla |
|--------|-------------|---------------|
| **Ocean** | Azul marino elegante | Bodas clásicas y formales |
| **Rose** | Rosado romántico | Bodas tradicionales |
| **Sage** | Verde salvia suave | Bodas en jardín o campo |
| **Ivory** | Marfil neutro | Bodas minimalistas |
| **Champagne** | Dorado suave | Bodas de lujo |
| **Nature** | Verde bosque natural | Bodas campestres |
| **Olive** | Verde oliva oscuro | Skin Envelope (GoParty) |

**Colores premium:**
| Paleta | Descripción | Cuándo usarla |
|--------|-------------|---------------|
| **Platinum** | Gris plateado | Ultra moderno y ejecutivo |
| **Sapphire** | Azul zafiro | Impactante y distinguido |
| **Emerald** | Verde esmeralda | Lujoso y vibrante |
| **Coral** | Coral cálido | Festivo y alegre |
| **Lavender** | Lavanda pastel | Suave y romántico |
| **Teal** | Verde azulado | Fresco y contemporáneo |
| **Burgundy** | Borgoña intenso | Dramático y elegante |
| **Gold Premium** | Dorado brillante | Máximo lujo |

**Para otros eventos:**
| Paleta | Descripción | Cuándo usarla |
|--------|-------------|---------------|
| **Pink** | Rosado vibrante | Quinceañeras, baby shower |
| **Purple** | Violeta oscuro | Quinceañeras, cumpleaños |
| **Blue** | Azul cielo | Cumpleaños, bautismos |
| **Ocean Blue** | Azul profundo | Corporativos, graduaciones |
| **Mint** | Verde menta | Eventos frescos y modernos |
| **Peach** | Durazno suave | Bodas casuales, fiestas |
| **Slate** | Gris azulado | Corporativos, graduaciones |

### Cómo cambiar la paleta
1. Ir a **Tab Tema**
2. Click en la paleta deseada — se resaltará con un borde azul
3. Podés previsualizar cómo se verá antes de guardar
4. Click en **Guardar Tema**
5. La invitación actualiza los colores automáticamente al abrir

> **Tip**: Probá varias paletas antes de decidirte. No hay límite de cambios.

---

## 5. Configuración general (Tab Config)

Aquí van los datos fundamentales de tu evento.

### Datos del evento
- **Nombre del evento**: Ej. "Boda Concepción & Eumelio"
- **Fecha de la ceremonia**: La fecha exacta en formato YYYY-MM-DD (ej. 2026-06-07)
- **Tipo de evento**: Boda, quinceañera, cumpleaños, bautismo, graduación, corporativo, etc.
- **Nombres de los novios / protagonistas**: El nombre que aparece en el encabezado de la invitación

### Recintos (dónde se celebra)
Podés tener dos recintos: **Ceremonia** y **Recepción**. Para cada uno:

| Campo | Ejemplo | Obligatorio |
|-------|---------|-------------|
| Nombre del lugar | "Iglesia de San Pedro Claver" | Sí |
| Dirección completa | "Mcal López 542, Carapeguá" | Recomendado |
| Enlace Google Maps | URL de Google Maps | Opcional pero muy útil |
| Hora de inicio | "16:00" | Recomendado |
| Descripción adicional | "Acceso por portón lateral" | Opcional |

**Cómo obtener un enlace de Google Maps:**
1. Buscá el lugar en Google Maps
2. Clic en "Compartir" → "Copiar enlace"
3. Pegá ese enlace en Eventique

### Modo de invitaciones
Controla cómo funcionan las confirmaciones:

| Modo | Qué significa | Cuándo usarlo |
|------|--------------|---------------|
| **Genérico** | Cualquier persona puede confirmar asistencia | Eventos abiertos, sin control de cupos |
| **Personalizado** | Solo invitados con su enlace propio pueden confirmar | Control total de quién asiste |
| **Híbrido** | Los invitados personalizados usan su enlace; los demás pueden confirmar normalmente | Mayoría con invitación personal + algunos sin control |

### Opciones avanzadas de invitaciones

| Opción | Qué hace |
|--------|---------|
| **RSVP público** | Permite confirmar sin enlace personal |
| **Requerir token** | Solo invitados con enlace personal pueden confirmar |
| **Rastrear aperturas** | Registra cada vez que un invitado abre su enlace |
| **Permitir auto-edición** | El invitado puede modificar su confirmación |
| **Mostrar nombres de acompañantes** | El formulario pide los nombres de quienes van |
| **Permitir cambio de cantidad** | El invitado puede ajustar cuántas personas van |
| **Controlar cupo estricto** | Rechaza si intenta confirmar más cupos de los asignados |

### Plantilla de mensaje WhatsApp
Personalizá el texto del mensaje que se envía por WhatsApp para cada invitado.

**Variables disponibles:**
- `{display_name}` → Nombre del invitado
- `{event_name}` → Nombre de tu evento
- `{invitation_url}` → Enlace único del invitado
- `{allowed_passes}` → Cantidad de cupos asignados

**Ejemplo de plantilla:**
```
¡Hola {display_name}! ✨

Es con mucha alegría que te invitamos a nuestra boda.

Podés ver todos los detalles y confirmar tu asistencia en:
{invitation_url}

Tenés {allowed_passes} lugar(es) reservado(s). ❤️

¡Esperamos verte!
```

### Sección de regalos (Obsequio)
Si querés informar opciones de regalo:
1. Activá el toggle **"Sección Regalos"**
2. Ingresá el título (ej. "Registro de Obsequios")
3. Agregá cuentas bancarias:
   - Clic en **+ Cuenta**
   - Ingresá el label (ej. "Bancop – CBU") y el número de cuenta
4. Los invitados verán esta información al final de la invitación

---

## 6. Gestionar archivos (Tab Media)

Aquí subís las fotos y música que aparecen en tu invitación.

### Subir fotos

**Pasos:**
1. Clic en **Subir archivo** (o arrastrá los archivos directamente)
2. Seleccioná las fotos desde tu celular o computadora
3. Esperá que suba — verás una barra de progreso
4. La foto aparece en la lista con su miniatura

**Especificaciones:**
- **Formatos aceptados**: JPG, PNG, WEBP
- **Tamaño máximo por foto**: 10 MB
- **Recomendación de resolución**: Al menos 1200x800 píxeles para que se vea nítida en pantalla grande

### Agregar fotos a la galería
Una vez subida, cada foto tiene un botón **"Galería"**:
- **Verde (activo)**: La foto aparece en la sección galería de tu invitación
- **Gris (inactivo)**: La foto está guardada en el sistema pero no se muestra

Clic en ese botón para activar/desactivar. El cambio se aplica inmediatamente.

### Usar una foto como portada (Hero)
1. Subí la foto en Tab Media
2. Copiá la URL que aparece junto a la foto (botón "Copiar URL" o similar)
3. Andá a Tab Secciones → Hero (Portada)
4. Pegá la URL en el campo **"Imagen de fondo"**
5. Ajustá la opacidad si la foto oscurece demasiado los textos
6. Clic en **Guardar**

### Subir música

**Pasos:**
1. Clic en **Subir archivo**
2. Seleccioná un archivo de audio desde tu computadora
3. Aparece en la lista con un ícono de nota musical

**Especificaciones:**
- **Formatos aceptados**: MP3, OGG, M4A
- **Tamaño máximo por audio**: 50 MB

### Agregar música al reproductor
El botón **"Music"** activa/desactiva la pista en el reproductor de música de tu invitación.

> **Tip**: También podés agregar música de YouTube directamente desde Tab Secciones → Música, sin necesidad de descargar y subir archivos.

### Eliminar archivos
Clic en el ícono de basura junto al archivo. El sistema te pedirá confirmación antes de borrarlo definitivamente.

> **Atención**: Si eliminás una foto que está asignada como portada o en la galería, esa imagen dejará de verse en la invitación.

---

## 7. Editar secciones (Tab Secciones)

Esta es la sección más completa. Aquí editás cada "bloque" de tu invitación.

### Cómo funciona
Cada sección de tu invitación (portada, historia, venues, etc.) aparece como un editor desplegable. Clic en el nombre de la sección para abrirla y editarla.

**Regla de oro**: Siempre hacé clic en **Guardar** dentro de cada sección antes de pasar a la siguiente.

---

### Portada (Hero)
La primera imagen que ve el invitado al abrir la invitación.

**Campos configurables:**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Activar/desactivar | Mostrar u ocultar esta sección | ✓ Activado |
| Subtítulo | Texto debajo del nombre de la pareja | "Los invitan a compartir su felicidad" |
| Imagen de fondo | URL de la foto principal | (URL de foto subida en Media) |
| Opacidad del fondo | Qué tan oscura se ve la imagen (0-100%) | 40% |
| Indicador de scroll | La flechita animada "deslizá hacia abajo" | ✓ Mostrar |

**Recomendaciones:**
- Usá una foto horizontal (landscape) — se ve mejor como fondo
- Si el texto no se lee bien, aumentá la opacidad (hace la foto más oscura)
- Si querés que la foto se vea más clara, bajá la opacidad

---

### Cuenta Regresiva (Countdown)
Un contador animado que muestra días, horas, minutos y segundos que faltan para el evento.

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Activar/desactivar | Mostrar u ocultar el contador | ✓ Activado |
| Texto del contador | La etiqueta que aparece arriba | "Faltan para el gran día" |

> La fecha que usa el contador se toma de la fecha de ceremonia en Tab Config.

---

### Nuestra Historia (OurStory)
La línea de tiempo de la pareja — los momentos importantes de su relación.

**Cómo agregar un hito:**
1. Clic en **+ Agregar hito**
2. Completá:
   - **Fecha**: Ej. "15 de marzo 2019"
   - **Título**: Ej. "Nuestro primer encuentro"
   - **Descripción**: Ej. "Nos conocimos en la universidad durante una charla de..."
3. Clic en **Guardar hito**

Podés agregar tantos hitos como quieras. Se muestran en orden cronológico.

**Cómo editar/borrar un hito:**
- Clic en el ícono de lápiz para editar
- Clic en el ícono de basura para eliminar

---

### Itinerario (Schedule)
El programa del día del evento: qué pasa y a qué hora.

**Cómo agregar un item:**
1. Clic en **+ Agregar item**
2. Completá:
   - **Hora**: Ej. "16:00"
   - **Título**: Ej. "Ceremonia religiosa"
   - **Descripción**: Ej. "Iglesia de San Pedro Claver, Carapeguá"
3. Clic en **Guardar**

**Ejemplo de itinerario:**
```
16:00 — Ceremonia religiosa
        Iglesia de San Pedro Claver

17:30 — Cocktail de bienvenida
        Jardín del Club de Pesca

19:00 — Cena y fiesta
        Salón principal
```

---

### Cortejo / Padrinos (WeddingParty)
Los integrantes del cortejo nupcial o padrinos del evento.

**Campos por miembro:**
- **Nombre completo**
- **Rol**: Ej. "Dama de honor", "Padrino", "Paje"
- **Lado**: Novia / Novio / Ambos
- **Descripción**: Texto corto sobre esa persona (opcional)
- **Foto**: URL de una foto (opcional)

---

### Hospedaje (Accommodation)
Hoteles y alojamientos recomendados para invitados que viajan de lejos.

**Campos por hotel:**
| Campo | Descripción |
|-------|-------------|
| Nombre | "Hotel Casino Carapeguá" |
| Dirección | "Av. Principal 123" |
| Teléfono | "+595 983 123 456" |
| Sitio web | URL del hotel (opcional) |
| Estrellas | 1 a 5 estrellas |
| Rango de precio | Ej. "GS 150.000 – 250.000 por noche" |
| Notas | Ej. "Pedir descuento por boda X" |

---

### Galería (Gallery)
Las fotos de tu evento que aparecen en un carrusel o grid visual.

| Campo | Descripción |
|-------|-------------|
| Activar/desactivar | Mostrar u ocultar la galería |
| Título | Ej. "Nuestra Historia en Fotos" |
| Subtítulo | Texto secundario debajo del título |

> Las fotos en sí se asignan desde **Tab Media** → botón "Galería" en cada foto.

**Orden de las fotos**: Las fotos aparecen en el orden en que fueron activadas en Tab Media.

---

### RSVP (Confirmación de asistencia)
El formulario donde los invitados confirman si van a tu evento.

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Título | Encabezado del formulario | "¿Venís a la fiesta?" |
| Subtítulo | Texto explicativo | "Confirmá tu asistencia antes del 1° de junio" |
| Mensaje de confirmación | Lo que ve el invitado al confirmar | "¡Gracias! ¡Te esperamos con los brazos abiertos!" |

---

### Pie de página (Footer)
Lo que aparece al final de la invitación.

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Activar/desactivar | Mostrar u ocultar el pie | ✓ Activado |
| Mensaje | Texto principal del pie | "Concepción & Eumelio · Junio 2026" |
| Créditos | Texto secundario | "Hecho con ❤ en Eventique" |

---

### Redes Sociales (Social)
| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Hashtag | Para que los invitados compartan fotos | `#BodaConcepcionEumelio` |
| Usuario Instagram | Tu arroba de Instagram | `@concepcion_y_eumelio` |

El hashtag y el usuario de Instagram aparecen al final de la invitación invitando a los asistentes a etiquetar sus fotos.

---

### Música (Music)
El reproductor de música que suena de fondo mientras el invitado navega la invitación.

| Campo | Descripción |
|-------|-------------|
| Activar/desactivar | Encender o apagar el reproductor |
| Reproducción automática | Si la música empieza sola al abrir la invitación |

**Agregar canción de YouTube:**
1. Clic en **+ Agregar track**
2. Pegá la URL de YouTube (ej. `https://www.youtube.com/watch?v=zqlkbbJ003w`)
3. Escribí el título y el artista
4. Clic en **Guardar**

**Quitar una canción:**
Clic en el ícono de basura junto al nombre del track.

> **Tip**: La reproducción automática puede no funcionar en algunos celulares porque los navegadores modernos bloquean el audio sin interacción del usuario. Es normal.

---

### Skin de Invitación (Estilo visual)
Elige entre dos estilos de invitación completos:

**Classic** — El estilo estándar con todas las secciones descritas arriba.

**Envelope (GoParty)** — Estilo inspirado en el trend viral de videos. Ver [Sección 12](#12-estilos-de-invitación-disponibles) para descripción completa.

**Campos extra del skin Envelope:**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| Texto apertura del sobre | Texto que aparece sobre el sobre cerrado | "Tenemos el honor de invitarlos" |
| Etiqueta "Tocá aquí" | El texto del botón para abrir | "Tocá para abrir tu invitación" |
| Subtítulo del collage | Texto en el collage de cards | "Nuestra Celebración" |
| Separador del monograma | El símbolo entre las iniciales | `&` |
| Etiqueta ceremonia | Nombre del primer venue | "Ceremonia religiosa" |
| Etiqueta recepción | Nombre del segundo venue | "Fiesta de celebración" |
| Ícono ceremonia | Ícono SVG para el venue 1 | Iglesia / Copa / Corazón / Estrella / Música |
| Ícono recepción | Ícono SVG para el venue 2 | Iglesia / Copa / Corazón / Estrella / Música |
| Código de vestimenta | Título del dress code | "Vestimenta" |
| Valor del dress code | El detalle del dress code | "Formal / Semiformal" |
| Texto pie polaroid | Texto al final de la galería | "¡Te esperamos!" |
| Blanco y negro | Filtro B&W en la galería polaroid | ✓ / ✗ |

---

## 8. Gestionar invitados (Tab Invitados)

Esta sección es el corazón del sistema de invitaciones personalizadas.

### Panel de estadísticas
En la parte superior ves un resumen rápido con cuatro indicadores clave:

| Indicador | Qué significa |
|-----------|--------------|
| Total invitaciones | Cuántos invitados tenés creados en el sistema |
| Cupos totales | La suma de todos los lugares asignados a todos los invitados |
| Confirmados | Cuántos ya confirmaron asistencia (toda su mesa o parte) |
| Pendientes | Cuántos todavía no respondieron |

La **barra de colores** bajo los indicadores muestra visualmente la proporción de cada estado.

### Estados de un invitado

| Estado | Color | Qué significa |
|--------|-------|--------------|
| **Pendiente** | Amarillo | No respondió aún |
| **Confirmado** | Verde | Confirmó todos sus cupos |
| **Parcial** | Naranja | Confirmó algunos pero no todos sus cupos |
| **Rechazado** | Rojo | Respondió que no va |
| **Bloqueado** | Gris | Bloqueado manualmente (no puede confirmar) |

### Tabla de invitados
Lista completa de todos tus invitados con:
- **Nombre completo y email**
- **Cupos**: Cuántos lugares tiene ese invitado (total y confirmados)
- **Estado**: Con el color del estado actual
- **Apertura**: Si abrió su invitación o no (✓ / ✗)
- **Acciones**: Botones para QR, WhatsApp, editar, cambiar estado, eliminar

### Buscar y filtrar

**Buscador:**
Escribí un nombre o email en la caja de búsqueda. La lista se filtra en tiempo real.

**Filtro por estado:**
El menú desplegable "Estado" muestra todos, o solo los de un estado específico. Útil para ver solo "Pendientes" y saber a quiénes llamar.

### Crear un invitado manualmente

1. Clic en **Nuevo Invitado** (botón verde o azul en la esquina superior)
2. Completá el formulario:

| Campo | Obligatorio | Descripción |
|-------|-------------|-------------|
| Nombre completo (display_name) | ✓ | Nombre que aparece en la invitación |
| Nombre de contacto | ✗ | Nombre de la persona de contacto (si es diferente) |
| Email | ✗ | Para enviar notificaciones |
| Teléfono | ✗ | Para WhatsApp |
| Cupos permitidos | ✓ | Cuántas personas puede llevar (ej. 2 para pareja) |
| Nota personal | ✗ | Mensaje que solo ve ese invitado en su invitación |
| Grupo / Mesa | ✗ | Para organizar (ej. "Mesa 3 - Familia") |
| Tipo de invitado | ✗ | Familia, amigo, compañero, VIP, etc. |
| Etiquetas | ✗ | Para filtrar y organizar (ej. "familia", "amigos") |

3. Clic en **Guardar**
4. El sistema genera automáticamente un enlace único para ese invitado

### Importar invitados desde Excel o CSV

Si ya tenés una lista de invitados en Excel, podés importarla masivamente en vez de cargarlos uno por uno.

**Paso 1: Obtener la plantilla**
1. Clic en **Exportar Plantilla** (o "Descargar Template")
2. Se descarga un archivo CSV de ejemplo con el formato correcto
3. Abrí ese archivo en Excel (o Google Sheets)

**Paso 2: Completar la plantilla**
Completá los datos de tus invitados. Columnas disponibles:

| Columna | Obligatoria | Descripción | Ejemplo |
|---------|-------------|-------------|---------|
| display_name | ✓ | Nombre completo | "Familia Rodríguez" |
| allowed_passes | ✓ | Cantidad de cupos | 3 |
| email | ✗ | Email de contacto | "juan@email.com" |
| phone | ✗ | Teléfono (con código de país) | "+595 981 123 456" |
| group_name | ✗ | Grupo o mesa | "Mesa 5" |
| notes | ✗ | Nota personal | "Confirmar silla de bebé" |
| tags | ✗ | Etiquetas separadas por coma | "familia,vip" |

**Paso 3: Guardar como CSV**
- En Excel: Archivo → Guardar como → CSV (delimitado por comas)
- En Google Sheets: Archivo → Descargar → CSV

**Paso 4: Importar en Eventique**
1. Clic en **Importar CSV**
2. Seleccioná el archivo CSV
3. Aparece una **previsualización** con todos los invitados que se van a importar
4. Revisá que los datos estén correctos (nombre, cupos, email)
5. Si algo está mal, cancelá, corregí el CSV, y volvé a importar
6. Si todo está bien, clic en **Confirmar Importación**

**Resultado:** Todos los invitados de la planilla se crean en el sistema con su enlace único.

> **Importante**: Si hay errores en algunas filas (ej. falta el nombre), esas filas se saltan y el resto se importa igual. El sistema te muestra un resumen de cuántas se importaron y cuántas tuvieron error.

### Exportar la lista de invitados
1. Clic en **Exportar CSV**
2. Se descarga un CSV con todos los invitados y su estado actual

Útil para:
- Tener una copia de seguridad
- Compartir el estado de las confirmaciones con quien organiza el evento
- Analizar los datos en Excel

### Generar QR para un invitado

**¿Para qué sirve el QR?**
El QR es una imagen que, al escanearse con la cámara del celular, abre directamente la invitación personalizada de ese invitado. Podés imprimirlo en tarjetas físicas de invitación.

**Cómo generar el QR:**
1. En la fila del invitado, clic en el ícono QR (cuadradito con patrones)
2. Aparece una ventana con el código QR
3. Clic derecho en la imagen → Guardar imagen → imprimirlo

### Enviar invitación por WhatsApp
1. En la fila del invitado, clic en el ícono de WhatsApp (ícono verde)
2. Aparece el mensaje pre-generado con el enlace personalizado del invitado
3. Revisá el mensaje
4. Clic en **Abrir WhatsApp** → WhatsApp se abre con el número del invitado y el mensaje listo
5. Solo hacé clic en "Enviar"

### Cambiar el estado de un invitado manualmente
Útil si alguien te confirmó por teléfono y querés marcarlo como confirmado en el sistema.

1. En la fila del invitado, clic en el ícono de edición (lápiz) o en el estado actual
2. Seleccioná el nuevo estado: Pendiente / Confirmado / Rechazado / Bloqueado
3. Si bloqueás a un invitado, escribí el motivo (ej. "No pudimos contactar")
4. Clic en **Guardar**

### Ver el historial de un invitado (Auditoría)
Podés ver todo lo que pasó con ese invitado: cuándo se creó, cuándo abrió su enlace, cuándo confirmó, si su estado cambió.

1. En la fila del invitado, clic en **Ver auditoría** (ícono de historial)
2. Aparece una lista cronológica de todas las acciones

### Eliminar un invitado
Clic en el ícono de basura. El invitado no se borra definitivamente — se marca como inactivo y su enlace deja de funcionar, pero el historial queda guardado.

---

## 9. Ver confirmaciones (Tab RSVPs)

Aquí ves la lista de todas las confirmaciones de asistencia recibidas en tiempo real.

### Información por cada confirmación:
- **Nombre** del confirmante
- **Email**
- **Asiste** (Sí / No)
- **Cantidad de personas** que van
- **Restricciones alimentarias** (si las informaron)
- **Canción favorita** (si la informaron)
- **Mensaje** personal (si dejaron uno)
- **Fecha y hora** exacta de la confirmación

### Estadísticas rápidas
En la parte superior ves:
- Total de confirmaciones recibidas
- Cuántos van
- Cuántos no van
- Total de personas (contando todos los cupos)

### Editar una confirmación
Si alguien confirmó con datos incorrectos (ej. nombre mal escrito o cantidad de personas equivocada):
1. Clic en el ícono de edición (lápiz) en esa fila
2. Modificá los datos
3. Clic en **Guardar**

### Eliminar una confirmación
Si alguien confirmó por error o ya no puede ir:
1. Clic en el ícono de basura
2. Confirmá la eliminación
3. Esa persona puede volver a confirmar si quiere

---

## 10. Gestionar eventos (Tab Eventos)

> Esta sección es para el administrador general del sistema, no para el administrador de un evento específico.

Si tenés acceso de superadministrador, podés:

### Ver todos los eventos
Lista completa de todos los eventos del sistema con su slug (nombre técnico), nombre, y estado.

### Crear un nuevo evento
1. Clic en **Nuevo Evento**
2. Completá:
   - **Slug**: Nombre técnico único (solo letras, números y guiones, sin espacios). Ej. `boda-maria-juan-2026`
   - **Nombre**: Nombre descriptivo. Ej. "Boda María & Juan - Julio 2026"
   - **Token de administrador**: La contraseña del admin de ese evento
3. Clic en **Crear**

### Clonar un evento
Útil para crear una nueva boda basada en la configuración de un evento anterior:
1. Clic en **Clonar** junto al evento que querés copiar
2. Escribí el nuevo slug y nombre
3. Clic en **Clonar** — se crea una copia completa con toda la configuración

### Eliminar un evento
1. Clic en **Eliminar** junto al evento
2. Confirmá la eliminación
3. Se eliminan todos los datos del evento (config, RSVPs, invitados, archivos)

> **Atención**: La eliminación es permanente e irreversible.

---

## 11. Flujo completo: enviar invitaciones por WhatsApp

Esta es la guía paso a paso del flujo completo, desde cero hasta que el invitado tiene su enlace.

### Fase 1: Preparación (hacer una sola vez)

**1. Configurar el mensaje de WhatsApp**
- Ir a Tab Config → sección "Plantilla de mensaje WhatsApp"
- Editar el texto con las variables `{display_name}`, `{invitation_url}`, `{allowed_passes}`
- Guardar

**2. Activar el rastreo de aperturas** (recomendado)
- Ir a Tab Config → Opciones avanzadas
- Activar "Rastrear aperturas"
- Guardar

### Fase 2: Cargar los invitados

**Opción A — Importar desde Excel (recomendada para listas grandes)**
1. Exportar plantilla CSV → completar en Excel → importar como CSV
2. Verificar que todos los invitados se crearon correctamente en la tabla

**Opción B — Carga manual (recomendada para menos de 20 invitados)**
1. Por cada invitado: Nuevo Invitado → completar formulario → Guardar

### Fase 3: Enviar los mensajes

**Para cada invitado:**
1. Tab Invitados → encontrar el invitado (buscar por nombre)
2. Clic en ícono de WhatsApp
3. Revisar el mensaje pre-generado
4. Si el invitado tiene teléfono cargado: clic en "Abrir WhatsApp" → mensaje listo para enviar
5. Si no tiene teléfono: copiar el enlace del mensaje → pegarlo manualmente en WhatsApp

**Tip de eficiencia**: Podés ordenar la tabla por estado para ver primero los pendientes y enviarles recordatorio.

### Fase 4: Seguimiento (hasta el evento)

**Revisar periódicamente:**
- Tab Invitados → filtrar por "Pendiente" → ver quiénes no respondieron aún
- Enviarles un recordatorio por WhatsApp (mismo proceso que el envío inicial)
- Tab RSVPs → ver el total de personas confirmadas para planificar logística

**Antes del evento:**
- Tab Invitados → Exportar CSV → compartir con el organizador del evento
- Ver el total de personas confirmadas para avisar al recinto

---

## 12. Estilos de invitación disponibles

### Estilo Classic (Clásico)
El estilo estándar de Eventique. Flujo vertical con todas las secciones:

1. **Portada** — Foto de fondo + nombres de la pareja + subtítulo
2. **Cuenta regresiva** — Días / Horas / Minutos hasta el evento
3. **Saludo personalizado** — Aparece si el invitado accede con su enlace único
4. **Nuestra historia** — Línea de tiempo con los hitos de la pareja
5. **Venues / Recintos** — Lugares con mapa interactivo
6. **Itinerario** — Programa del día con horarios
7. **Cortejo / Padrinos** — Los integrantes del cortejo nupcial
8. **Galería de fotos** — Carrusel o grid de fotos
9. **Hospedaje** — Opciones de alojamiento para invitados de lejos
10. **FAQ** — Preguntas frecuentes
11. **RSVP** — Formulario de confirmación de asistencia
12. **Registro de regalos** — Información bancaria para obsequios
13. **Pie de página** — Mensaje final y hashtag

---

### Estilo Envelope (GoParty)
Inspirado en el trend viral de videos de invitaciones en redes sociales.

**¿Cómo activarlo?**
1. Tab Secciones → Skin de Invitación → seleccioná **"Envelope (GoParty)"**
2. Tab Tema → seleccioná paleta **"Olive"** (recomendada para este skin)
3. Guardar en ambos tabs

**Flujo de la invitación Envelope:**

**Pantalla 1 — El sobre**
El invitado ve un sobre elegante con:
- Sello de cera dorado al centro
- Texto personalizable sobre el sobre
- Botón/indicación "Tocá aquí" animado

Al tocar el sobre, se reproduce una animación de apertura y la pantalla hace scroll automático.

**Pantalla 2 — Collage de cards**
Tres tarjetas aparecen en pantalla una tras otra con animación staggered:
- **Card 1**: Monograma con las iniciales de la pareja y el separador (&)
- **Card 2**: Fecha del evento en tipografía floral decorativa
- **Card 3**: Diseño floral con sobre ilustrado
- **Badge**: Cuenta regresiva en formato zigzag en la esquina

**Pantalla 3 — Venues sobre fondo olive**
Los recintos se muestran sobre un fondo verde oliva oscuro con:
- Nombre del lugar
- Icono SVG de línea personalizable (iglesia, copas de champagne, corazón, estrella, nota musical)
- Botón "Ver Ubicación" que abre Google Maps

**Pantalla 4 — Código de vestimenta** (si está activado)
Sección con:
- Ícono ilustrado de pareja (novia y novio)
- Título del código de vestimenta
- Descripción del dress code (ej. "Formal / Semiformal")
- Fondo olive consistente con el resto del skin

**Pantalla 5 — RSVP**
Formulario de confirmación de asistencia integrado.

**Pantalla 6 — Galería Polaroid** (si está activada)
Fotos en estilo Polaroid con:
- Rotación aleatoria de cada foto (como fotos físicas esparcidas)
- Filtro blanco y negro opcional
- Texto personalizable al pie de la galería

**Pantalla 7 — Pie de página**
Mensaje final configurado en Tab Secciones → Footer.

---

## 13. Checklist pre-evento

Usá esta lista para asegurarte de que todo está listo antes del gran día.

### 4 semanas antes

- [ ] Invitación pública funciona al abrir la URL en el celular
- [ ] Los datos básicos están correctos (nombres, fecha, lugar, hora)
- [ ] La foto de portada se ve bien en celular y en computadora
- [ ] Los dos recintos tienen dirección y enlace a Google Maps
- [ ] La paleta de colores elegida
- [ ] El itinerario del día está cargado
- [ ] Todos los invitados cargados en el sistema con su cupo correcto
- [ ] El mensaje de WhatsApp personalizado y revisado
- [ ] Las invitaciones enviadas a todos los invitados

### 2 semanas antes

- [ ] Revisar Tab Invitados → filtrar pendientes → enviar recordatorio a quienes no respondieron
- [ ] Verificar que los enlaces de todos los invitados funcionan (abrir uno o dos al azar)
- [ ] Estadísticas de apertura: ¿quiénes no abrieron su invitación? → considerá llamarlos

### 1 semana antes

- [ ] Exportar CSV de invitados confirmados → compartir con el organizador del recinto
- [ ] Verificar total de personas confirmadas para informar al catering
- [ ] Si hubo cancelaciones, actualizar el estado de esos invitados en el sistema

### El día del evento

- [ ] Exportar CSV final de confirmados
- [ ] Tener el link del panel de admin disponible en el celular por si hay cambios de último momento

---

## 14. Solución de problemas frecuentes

### "Abrí la invitación y no veo mis cambios"

**Solución:**
1. Actualizá la página (F5 en computadora, o deslizá hacia abajo para refrescar en celular)
2. Si sigue igual, vaciá el caché del navegador:
   - Chrome: Ctrl + Shift + R (PC) o Cmd + Shift + R (Mac)
   - Celular: cerrar Chrome completamente y volver a abrir

### "Guardé en el admin pero los cambios no aparecen en la invitación"

**Verificar:**
1. ¿Hiciste clic en el botón "Guardar" o "Confirmar" dentro de la sección que editaste?
2. ¿Guardaste en el tab correcto? (Tema, Config, Secciones tienen sus propios botones de guardar)
3. Actualizá la página de la invitación

### "El botón de WhatsApp no abre WhatsApp"

**Posibles causas:**
- **Celular**: WhatsApp debe estar instalado. Si el celular tiene WhatsApp Web, puede abrir en el navegador.
- **Computadora**: Solo funciona si tenés WhatsApp Web configurado (`web.whatsapp.com`)
- **Alternativa**: Copiá el texto del mensaje y envialo manualmente

### "Un invitado dice que su enlace no funciona"

**Verificar:**
1. En Tab Invitados, buscá a ese invitado
2. Verificá que `is_active` sea activo (no eliminado)
3. Verificá que el estado no sea "Bloqueado"
4. Si regeneraste el token recientemente, el enlace viejo ya no funciona — enviá el nuevo

**Para obtener el enlace correcto:**
1. En la fila del invitado, clic en **Ver detalle** o en el ícono de WhatsApp
2. El mensaje de WhatsApp tiene el enlace actualizado

### "Un invitado intentó confirmar y le aparece un error"

**Causas comunes:**
- **"Cupos excedidos"**: Intentó confirmar más personas de las que tiene asignadas. Normal — el sistema lo rechaza intencionalmente.
- **"Ya confirmaste"**: Ya confirmó antes. Si quiere cambiar, necesita la opción "Permitir auto-edición" activa en Config.
- **"Invitación no encontrada"**: El enlace es incorrecto o el token fue regenerado.

### "No puedo entrar al panel de administración"

**Verificar:**
1. La URL es correcta: `https://eventique.tecnopowerpy.top/e/tu-evento/admin`
2. El token es exactamente el correcto (sin espacios al inicio o al final)
3. El token no tiene mayúsculas/minúsculas alteradas

**Si nada funciona**: Contactar al administrador del sistema (eudavalos91@gmail.com).

### "La música no suena automáticamente"

Esto es **normal**. Los navegadores modernos (Chrome, Safari, Firefox) bloquean el audio automático hasta que el usuario interactúa con la página. El invitado verá el reproductor de música y puede tocarlo para iniciar la reproducción.

### "Las fotos de la galería se ven distorsionadas"

**Solución:**
- Subí fotos con una relación de aspecto horizontal (landscape)
- Evitá fotos muy verticales (retrato/portrait) en la galería — se recortan
- Resolución mínima recomendada: 800x600 píxeles

---

## 15. Glosario de términos

**Admin / Panel de administración**
La parte privada del sistema donde el organizador configura todo. Se accede con una contraseña (token) desde la URL con `/admin`.

**CSV (Comma-Separated Values)**
Un tipo de archivo de texto que Excel puede abrir y guardar. Es como una tabla pero en formato texto. Eventique lo usa para importar y exportar listas de invitados.

**Cupos / Passes**
La cantidad de personas que puede llevar un invitado. Si un invitado tiene 3 cupos, puede confirmar hasta 3 personas.

**Enlace / Link personalizado**
La URL única que tiene cada invitado. Solo él la recibe y usarla para confirmar asistencia y ver su nombre en la invitación.

**Estado del invitado**
Indica en qué situación está ese invitado: Pendiente (no respondió), Confirmado (respondió sí), Rechazado (respondió no), Bloqueado (no puede confirmar), Parcial (confirmó menos cupos de los que tiene).

**Historial de auditoría**
El registro cronológico de todo lo que le pasó a un invitado: cuándo se creó, cuándo abrió su enlace, cuándo confirmó, etc.

**Paleta de colores**
El conjunto de colores que define la apariencia visual de toda la invitación: color principal, color secundario, fondo, textos.

**RSVP (Répondez S'il Vous Plaît)**
Término francés que significa "Confirme su asistencia". Es la confirmación de asistencia de los invitados.

**Skin / Estilo visual**
El diseño general de la invitación. Eventique tiene dos skins: Classic (clásico) y Envelope (GoParty, estilo sobre interactivo).

**Slug**
El nombre técnico único de un evento en la URL. Ej. en `eventique.../e/boda-juan-maria`, el slug es `boda-juan-maria`. Solo puede tener letras minúsculas, números y guiones.

**Soft-delete (eliminación suave)**
Cuando "eliminás" un invitado, en realidad no se borra de la base de datos — se marca como inactivo. Esto protege el historial de acciones. El enlace del invitado deja de funcionar, pero los datos quedan guardados para auditoría.

**Token**
La contraseña de acceso. El token de administrador permite entrar al panel admin. El token de invitado es el código único en la URL personalizada de cada invitado.

**URL (Uniform Resource Locator)**
La dirección web. Ej. `https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio`.

**WhatsApp template**
La plantilla de texto que se usa para generar el mensaje de WhatsApp. Contiene variables (`{display_name}`, `{invitation_url}`, etc.) que se reemplazan con los datos del invitado.

---

## 16. Mejores prácticas

### Para la foto de portada
- Usá una foto en modo horizontal (landscape) — se adapta mejor a celulares y computadoras
- Fotos con el sujeto centrado funcionan mejor que las muy simétricas
- Evitá fotos muy claras o muy oscuras — la opacidad puede compensar hasta cierto punto
- Resolución recomendada: 1920x1080 píxeles o más

### Para los textos
- Usá nombres completos en los hitos de "Nuestra Historia" para que los invitados sepan de quién hablan
- En el itinerario, especificá la dirección además del nombre del lugar
- En el mensaje de WhatsApp, tuteá o ustedeá de forma consistente con tu estilo

### Para los cupos de invitados
- Asigná siempre cupos exactos — evitá poner cupos de más "por si acaso"
- Familias con hijos chicos: usá "3 cupos" si van padres + 1 hijo, aunque el niño no ocupe asiento
- Si no querés controlar cupos exactos, podés activar solo el modo "Genérico" en Config

### Para las fotos de galería
- Entre 8 y 16 fotos es ideal — más de 20 puede hacer lenta la carga
- Mezclá fotos de distintos momentos: románticas, informales, con amigos, en lugares especiales
- Comprimí las fotos antes de subirlas para que carguen rápido (gratuito en squoosh.app)

### Para el envío de WhatsApp
- Enviá las invitaciones con al menos 3-4 semanas de anticipación
- Enviá un recordatorio 1-2 semanas antes si hay pendientes
- Verificá que los teléfonos de los invitados estén guardados en tu celular antes de enviar

### Para el skin Envelope
- Siempre usá con la paleta "Olive" — está diseñado para verse bien con esos colores
- La foto de portada no se usa en Envelope — las cards del collage son el protagonista
- El dress code es opcional pero muy valorado por los invitados

---

## 17. Preguntas frecuentes

### ¿Cómo consigo la dirección web de mi invitación?
El administrador del sistema te da la URL de tu evento. También está en los emails de configuración inicial.

### ¿La invitación funciona en celular?
Sí. Eventique está diseñada con prioridad en celular (mobile-first). Funciona perfectamente en Android e iPhone, en Chrome, Safari, Firefox, y cualquier navegador moderno.

### ¿Puedo cambiar los colores después de haberla enviado a mis invitados?
Sí. Podés cambiar la paleta de colores, los textos, las fotos y cualquier configuración en cualquier momento. Los cambios se ven inmediatamente (al actualizar la página) en la invitación. Tus invitados que ya tienen el enlace no necesitan un enlace nuevo.

### ¿Mis invitados tienen que crear una cuenta?
No. Solo necesitan el enlace. Lo abren, ven la invitación y confirman asistencia. Sin registro, sin contraseña, sin descargar ninguna app.

### ¿Cómo sé si mis invitados abrieron la invitación?
Si tenés activada la opción "Rastrear aperturas" en Tab Config, en la columna "Apertura" de la lista de invitados verás si abrieron el enlace o no, y cuántas veces.

### ¿Puedo ver quién confirmó asistencia en tiempo real?
Sí. Tab RSVPs se actualiza cada vez que entrás. Ves cada confirmación con nombre, cantidad de personas y fecha exacta.

### ¿Qué pasa si un invitado quiere cambiar su confirmación?
Si la opción "Permitir auto-edición" está activada en Config, el invitado puede volver a su enlace y modificar su confirmación. Si no está activada, el administrador puede editarla desde Tab RSVPs.

### ¿Puedo agregar música de Spotify?
Actualmente se soporta YouTube y archivos de audio subidos directamente. No hay integración con Spotify.

### ¿Cuántas fotos puedo subir a la galería?
No hay límite técnico, pero recomendamos entre 8 y 20 fotos para que la galería cargue rápido en celulares. El tamaño máximo por foto es 10 MB.

### ¿Puedo usar Eventique para un evento que no es una boda?
Sí. Eventique soporta: boda, quinceañera, cumpleaños, bautismo, graduación, corporativo y más. Los textos predeterminados se adaptan automáticamente según el tipo de evento.

### ¿Qué pasa si olvido la contraseña del admin?
Contactá al administrador del sistema (eudavalos91@gmail.com) para recuperar el token de acceso.

### ¿La invitación funciona sin internet?
No. Eventique es una aplicación web que requiere conexión a internet para funcionar.

### ¿Puedo duplicar el evento para otra boda en el futuro?
Si tenés acceso de superadministrador, sí. Desde Tab Eventos → Clonar.

### ¿Cómo se usa el QR de un invitado?
El código QR, al escanearse con la cámara del celular, abre directamente la invitación personalizada de ese invitado. Podés imprimirlo en tarjetas físicas de invitación.

### ¿Qué pasa si un invitado comparte su enlace con otra persona?
El enlace está vinculado a su cupo. Si alguien intenta confirmar más personas de las asignadas, el sistema lo rechaza. Si ya está confirmado, el enlace ya no acepta nuevas confirmaciones (a menos que "auto-edición" esté activada).

### ¿Puedo ocultar ciertas secciones de la invitación?
Sí. Cada sección en Tab Secciones tiene un toggle "Activar/Desactivar". Las secciones desactivadas no aparecen en la invitación pero sus datos quedan guardados.

### ¿Hay límite de invitados que puedo cargar?
No hay un límite establecido. El sistema está diseñado para manejar desde 10 hasta varios miles de invitados.

---

## Contacto y soporte

**Administrador**: Eumelio Dávalos  
**Email**: eudavalos91@gmail.com  
**Plataforma**: Eventique by Tecnopowerpy  
**URL**: https://eventique.tecnopowerpy.top

---

*Eventique — Hacemos que tu invitación sea tan especial como tu evento.*

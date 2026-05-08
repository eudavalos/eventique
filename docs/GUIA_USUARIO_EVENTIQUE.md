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

1. [Acceder a tu evento](#1-acceder-a-tu-evento)
2. [Panel de Administración](#2-panel-de-administración)
3. [Personalizar el diseño (Tab Tema)](#3-personalizar-el-diseño-tab-tema)
4. [Configuración general (Tab Config)](#4-configuración-general-tab-config)
5. [Gestionar archivos (Tab Media)](#5-gestionar-archivos-tab-media)
6. [Editar secciones (Tab Secciones)](#6-editar-secciones-tab-secciones)
7. [Gestionar invitados (Tab Invitados)](#7-gestionar-invitados-tab-invitados)
8. [Ver confirmaciones (Tab RSVPs)](#8-ver-confirmaciones-tab-rsvps)
9. [Gestionar eventos (Tab Eventos)](#9-gestionar-eventos-tab-eventos)
10. [Enviar invitaciones por WhatsApp](#10-enviar-invitaciones-por-whatsapp)
11. [Estilos de invitación disponibles](#11-estilos-de-invitación-disponibles)
12. [Preguntas frecuentes](#12-preguntas-frecuentes)

---

## 1. Acceder a tu evento

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

Ese enlace muestra el nombre del invitado, cuántos lugares tiene reservados, y solo él puede confirmar su asistencia.

---

## 2. Panel de Administración

El panel de administración es donde controlas todo de tu evento. Es como el "tablero de control" de tu invitación.

### Cómo entrar
Agrega `/admin` al final de tu URL de evento:
```
https://eventique.tecnopowerpy.top/e/boda-concepcion-eumelio/admin
```

Necesitarás una contraseña (token de administrador). Esta contraseña la tienes en el correo de configuración inicial de tu evento.

### El panel tiene 7 secciones (tabs):

| Tab | Para qué sirve |
|-----|---------------|
| **RSVPs** | Ver quiénes confirmaron asistencia |
| **Config** | Configurar datos básicos del evento |
| **Tema** | Cambiar colores y apariencia visual |
| **Media** | Subir fotos y música |
| **Secciones** | Editar cada parte de tu invitación |
| **Invitados** | Gestionar lista de invitados personalizados |
| **Eventos** | Gestionar múltiples eventos (solo administrador) |

---

## 3. Personalizar el diseño (Tab Tema)

Aquí controlas cómo se ve tu invitación: colores, tipografías y estilo.

### Paletas de colores disponibles

Hay 22 combinaciones de colores profesionales organizadas por categoría:

**Para bodas:**
| Paleta | Descripción |
|--------|-------------|
| **Ocean** | Azul marino elegante — sofisticado y atemporal |
| **Rose** | Rosado romántico — clásico para bodas |
| **Sage** | Verde salvia suave — natural y delicado |
| **Ivory** | Marfil neutro — minimalista y elegante |
| **Champagne** | Dorado suave — lujoso y cálido |
| **Olive** | Verde oliva oscuro — estilo envelope GoParty |

**Colores premium:**
| Paleta | Descripción |
|--------|-------------|
| **Platinum** | Gris plateado — ultra moderno |
| **Sapphire** | Azul zafiro — impactante y distinguido |
| **Emerald** | Verde esmeralda — lujoso y vibrante |
| **Coral** | Coral cálido — festivo y alegre |
| **Lavender** | Lavanda pastel — suave y romántico |
| **Teal** | Verde azulado — fresco y contemporáneo |
| **Burgundy** | Borgoña intenso — dramático y elegante |
| **Gold Premium** | Dorado brillante — máximo lujo |

**Para quinceañeras, cumpleaños, etc.:**
Paletas como `Pink`, `Purple`, `Blue`, `Nature`, etc.

### Cómo cambiar la paleta
1. Ir a **Tab Tema**
2. Click en la paleta deseada (se resaltará en azul)
3. Click **Guardar Tema**
4. La invitación actualiza los colores automáticamente

---

## 4. Configuración general (Tab Config)

Aquí van los datos fundamentales de tu evento.

### Datos del evento
- **Nombre del evento**: Ej. "Boda Concepción & Eumelio"
- **Fecha**: La fecha de tu boda o celebración
- **Tipo de evento**: Boda, quinceañera, cumpleaños, etc.
- **Nombres de la pareja**: El nombre que aparece en el encabezado

### Recintos (dónde se celebra)
Puedes tener dos recintos: **Ceremonia** y **Recepción**. Para cada uno:
- Nombre del lugar
- Dirección completa
- Enlace a Google Maps (opcional — permite que los invitados abran la ubicación)
- Hora de inicio

### Modo de invitaciones
Controla cómo funcionan las confirmaciones:

| Modo | Qué significa |
|------|--------------|
| **Genérico** | Cualquier persona puede confirmar asistencia |
| **Personalizado** | Solo invitados con su enlace propio pueden confirmar |
| **Híbrido** | Los invitados personalizados usan su enlace; los demás pueden confirmar normalmente |

### Opciones avanzadas
- **RSVP público**: Si está activado, los invitados sin enlace personal pueden confirmar
- **Requerir token**: Solo invitados con enlace personal pueden confirmar
- **Rastrear aperturas**: Saber si el invitado abrió su invitación
- **Mensajes por WhatsApp**: Plantilla del mensaje que se genera automáticamente

---

## 5. Gestionar archivos (Tab Media)

Aquí subes las fotos y música que aparecen en tu invitación.

### Subir fotos
1. Click en **Subir archivo** (o arrastra los archivos)
2. Selecciona las fotos desde tu celular o computadora
3. Espera que suba (barra de progreso)
4. La foto aparece en la lista

**Formatos aceptados**: JPG, PNG, WEBP  
**Tamaño máximo por foto**: 10 MB

### Agregar fotos a la galería
Una vez subida, cada foto tiene un botón **"Galería"**:
- Si está activo (verde): la foto aparece en la sección galería de tu invitación
- Si está inactivo (gris): la foto está guardada pero no se muestra

### Subir música
1. Click en **Subir archivo**
2. Selecciona un archivo MP3 o similar
3. Aparece en la lista con un botón **"Music"**

**Formatos aceptados**: MP3, OGG, M4A  
**Tamaño máximo por audio**: 50 MB

### Agregar música al reproductor
El botón **"Music"** agrega/quita la pista del reproductor de música de tu invitación.

> **Tip**: También puedes agregar música de YouTube desde Tab Secciones → Música

---

## 6. Editar secciones (Tab Secciones)

Esta es la sección más completa. Aquí editas cada "bloque" de tu invitación.

### Secciones disponibles

#### Hero (Portada)
La primera imagen que ve el invitado. Configura:
- **Activar/desactivar**: Mostrar u ocultar esta sección
- **Subtítulo**: Texto debajo de los nombres (ej. "Los invitan a compartir su felicidad")
- **Imagen de fondo**: La foto principal que se ve detrás de los nombres
- **Opacidad del fondo**: Qué tan oscura o transparente se ve la imagen
- **Indicador de scroll**: La flechita animada que indica "deslizá hacia abajo"

#### Cuenta Regresiva
Un contador que muestra cuántos días, horas y minutos faltan para el evento:
- **Activar/desactivar**
- **Texto del contador**: Ej. "Faltan para el gran día"

#### Nuestra Historia
La línea de tiempo de la pareja — los momentos importantes de su relación:
- **Activar/desactivar**
- **Título de la sección**
- **Agregar, editar y borrar hitos**: Cada hito tiene fecha, título y descripción

*Ejemplo de hito:*
> 📅 15 de marzo 2019 · "Nuestro primer encuentro" · "Nos conocimos en la universidad..."

#### Itinerario
El programa del día del evento:
- **Activar/desactivar**
- **Título de la sección**
- **Agregar, editar y borrar items**: Cada item tiene hora, título y descripción

*Ejemplo:*
> 🕔 16:00 · Ceremonia religiosa · Iglesia de San Pedro Claver

#### Cortejo / Padrinos
Los integrantes del cortejo o padrinos del evento:
- **Activar/desactivar**
- **Título de la sección**
- **Agregar, editar y borrar miembros**: Cada uno tiene nombre, rol, lado (novia/novio/ambos) y descripción

#### Hospedaje
Hoteles y alojamientos recomendados para los invitados que vienen de lejos:
- **Activar/desactivar**
- **Título de la sección**
- **Agregar, editar y borrar hoteles**: Nombre, dirección, teléfono, sitio web, estrellas (0-5), rango de precio, notas

#### Galería
Las fotos que compartís con tus invitados:
- **Activar/desactivar**
- **Título y subtítulo de la sección**
- Las fotos en sí se asignan desde el **Tab Media**

#### RSVP (Confirmación de asistencia)
El formulario donde los invitados confirman si van:
- **Título**: Ej. "¿Venís a la fiesta?"
- **Subtítulo**: Texto explicativo
- **Mensaje de confirmación**: Lo que ve el invitado después de confirmar

#### Pie de página (Footer)
Lo que aparece al final de la invitación:
- **Activar/desactivar**
- **Mensaje**: Ej. "Concepción & Eumelio · Junio 2026"
- **Créditos**: Texto de derechos o agradecimientos

#### Redes Sociales
- **Hashtag**: Para que los invitados compartan fotos con tu hashtag en Instagram
- **Usuario de Instagram**: Tu perfil de Instagram

#### Música
El reproductor de música que suena de fondo:
- **Activar/desactivar música**
- **Reproducción automática**: Si la música empieza sola al abrir la invitación
- **Agregar canciones de YouTube**: Pega la URL de YouTube + título + artista
- **Quitar canciones**: Botón de eliminar junto a cada pista

#### Skin de Invitación (Estilo visual)
Elige entre dos estilos de invitación:

**Classic** — El estilo estándar con todas las secciones arriba detalladas.

**Envelope (GoParty)** — Estilo inspirado en el trend de videos virales. Incluye:
- Sobre animado que se abre al tocarlo
- Cards flotantes con monograma, fecha y diseño floral
- Secciones sobre fondo verde oliva
- Código de vestimenta
- Galería estilo polaroid en blanco y negro

Cuando activas el skin **Envelope**, aparecen campos extra para configurar:
- Texto de apertura del sobre
- Etiqueta "Tocá aquí"
- Subtítulo del collage
- Separador del monograma
- Etiquetas de los venues (Ceremonia, Recepción)
- Iconos de los venues (iglesia, copa, corazón, estrella, música)
- Código de vestimenta (título + descripción)
- Texto del pie de galería polaroid
- Activar/desactivar filtro blanco y negro en la galería

---

## 7. Gestionar invitados (Tab Invitados)

Esta sección es el corazón del sistema de invitaciones personalizadas.

### Panel de estadísticas
En la parte superior ves un resumen rápido:
- **Total invitaciones**: Cuántos invitados tienes creados
- **Cupos totales**: La suma de todos los lugares asignados
- **Confirmados**: Cuántos confirmaron asistencia
- **Pendientes**: Cuántos todavía no respondieron

La barra de colores muestra la proporción de cada estado (confirmado, pendiente, rechazado, bloqueado).

### Tabla de invitados
Lista completa de todos tus invitados con:
- **Nombre y email**
- **Cupos**: Cuántos lugares tiene ese invitado
- **Estado**: Pendiente / Confirmado / Rechazado / Bloqueado
- **Apertura**: Si abrió su invitación o no
- **Acciones**: Ver QR, WhatsApp, editar, cambiar estado, eliminar

### Buscar y filtrar
- **Buscador**: Escribe un nombre o email para filtrar la lista
- **Filtro por estado**: Ver solo pendientes, confirmados, etc.

### Crear un invitado manualmente
1. Click en **Nuevo Invitado**
2. Completa el formulario:
   - **Nombre completo** (obligatorio)
   - **Email** (opcional, para enviar notificaciones)
   - **Teléfono** (opcional, para WhatsApp)
   - **Cupos permitidos**: Cuántas personas puede llevar ese invitado (ej. 2 para una pareja)
   - **Nombres de acompañantes**: Los nombres de quienes vienen con él (opcional)
   - **Nota personal**: Un mensaje personalizado que solo ve ese invitado
   - **Etiquetas**: Para organizar tus invitados (ej. "familia", "amigos trabajo")
   - **Prioridad**: Útil para ordenar o filtrar
3. Click **Guardar**
4. El sistema genera automáticamente un enlace único para ese invitado

### Importar invitados desde Excel/CSV
Si ya tenés una lista de invitados en Excel, podés importarla:

1. Click en **Exportar Plantilla** — descarga un archivo CSV de ejemplo
2. Abre el CSV en Excel y completá los datos de tus invitados:
   - `display_name`: Nombre del invitado
   - `email`: Email (puede dejarse vacío)
   - `phone`: Teléfono (puede dejarse vacío)
   - `allowed_passes`: Cuántos cupos tiene (número)
   - `member_names`: Nombres de acompañantes separados por coma
   - `personal_note`: Nota personalizada
   - `tags`: Etiquetas separadas por coma
3. Guardá el archivo como CSV
4. En Eventique, click en **Importar CSV**
5. Seleccioná el archivo → verás una **previsualización** antes de confirmar
6. Si todo se ve bien, click **Confirmar Importación**

> **Tip**: La plantilla ya tiene el formato correcto. Solo reemplazá los datos de ejemplo con los tuyos.

### Exportar lista de invitados
Click en **Exportar CSV** — descarga un archivo con todos los invitados y su estado actual. Útil para tener una copia de seguridad o para compartir con quien organiza el evento.

### Generar QR para un invitado
1. En la fila del invitado, click en el ícono **QR**
2. Aparece un código QR único de ese invitado
3. Podés imprimirlo en una tarjeta física o enviarlo por WhatsApp

El QR contiene el enlace personalizado del invitado. Al escanearlo, abre su invitación directamente.

### Enviar por WhatsApp
1. En la fila del invitado, click en el ícono **WhatsApp**
2. Aparece el mensaje pre-generado con el enlace del invitado
3. Click en **Abrir WhatsApp** → se abre WhatsApp listo para enviar

El mensaje se puede personalizar en **Tab Config → Plantilla de mensaje**.

### Cambiar el estado de un invitado
Podés cambiar el estado manualmente (útil si alguien confirmó por teléfono):
1. Click en el ícono de edición o en el estado actual
2. Seleccioná: Pendiente / Confirmado / Rechazado / Bloqueado
3. Si bloqueás a un invitado, podés escribir el motivo

### Eliminar un invitado
Click en el ícono de eliminar. El invitado no se borra definitivamente — queda en el historial pero su enlace deja de funcionar. Podés ver el historial de acciones en "Ver auditoría".

---

## 8. Ver confirmaciones (Tab RSVPs)

Aquí ves la lista de todas las confirmaciones de asistencia recibidas.

### Información que ves por cada RSVP:
- **Nombre** del confirmante
- **Email**
- **Cantidad de personas** que van
- **Fecha** en que confirmó
- **Tipo de invitado** (con token personalizado o RSVP público)

### Estadísticas rápidas
En la parte superior: total de confirmados, total de personas, y el promedio de personas por confirmación.

### Editar o eliminar un RSVP
Si alguien confirmó por error o cambió su decisión:
- Click en **Editar** → modificar nombre, email o cantidad
- Click en **Eliminar** → borrar esa confirmación

---

## 9. Gestionar eventos (Tab Eventos)

> Esta sección es para el administrador general del sistema, no para el cliente de un evento específico.

Si tenés acceso de superadministrador, podés:
- Ver todos los eventos del sistema
- Crear un nuevo evento
- **Clonar** un evento existente (duplica toda la configuración)
- Eliminar un evento

### Clonar un evento
Útil para crear una nueva boda/evento basado en uno que ya configuraste:
1. Click en **Clonar** junto al evento
2. Escribí el nombre del nuevo evento
3. Click **Clonar** — se crea una copia con toda la configuración

---

## 10. Enviar invitaciones por WhatsApp

El flujo recomendado para enviar invitaciones personalizadas es:

### Paso 1: Crear los invitados
Importá tu lista CSV o creá cada invitado manualmente (ver Sección 7).

### Paso 2: Configurar el mensaje de WhatsApp
En **Tab Config → Plantilla de mensaje WhatsApp**, podés personalizar el texto que se genera.

Variables disponibles en la plantilla:
- `{display_name}` → se reemplaza por el nombre del invitado
- `{event_name}` → nombre de tu evento
- `{invitation_url}` → enlace único del invitado
- `{allowed_passes}` → cantidad de cupos del invitado

**Ejemplo de plantilla:**
```
Hola {display_name}! 🌟

Tenemos el placer de invitarte a nuestra boda.

Accedé a tu invitación personalizada aquí:
{invitation_url}

Tenés {allowed_passes} lugar(es) reservado(s) para vos.

¡Esperamos verte! 🥂
```

### Paso 3: Enviar los mensajes
Para cada invitado:
1. Click en el ícono de **WhatsApp** en su fila
2. Revisá el mensaje pre-generado
3. Click **Abrir WhatsApp** → WhatsApp se abre con el mensaje listo
4. Solo tenés que elegir el contacto y enviar

> **Tip**: El enlace de cada invitado es único. Si alguien comparte su enlace, el sistema igual registra quién confirmó y respeta su cupo asignado.

---

## 11. Estilos de invitación disponibles

### Estilo Classic (Clásico)
El estilo estándar de Eventique. Flujo vertical con secciones:
- Portada con foto de fondo y nombre de la pareja
- Cuenta regresiva
- Nuestra historia (línea de tiempo)
- Venues / Recintos
- Itinerario del día
- Cortejo / Padrinos
- Galería de fotos
- Hospedaje
- RSVP
- Registro de regalos
- Pie de página

### Estilo Envelope (GoParty)
Inspirado en el trend viral de redes sociales. Flujo diseñado para impactar:

1. **Sobre animado** → El invitado ve un sobre con sello de cera. Al tocarlo, el sobre se abre con una animación fluida.

2. **Collage de cards flotantes** → Tres tarjetas aparecen staggered (una después de otra):
   - Card de monograma con las iniciales de la pareja
   - Card con la fecha en tipografía floral
   - Card con diseño de sobre y floral
   - Badge de cuenta regresiva en zigzag

3. **Venues sobre fondo olive** → Los recintos se muestran sobre un fondo verde oliva oscuro con iconos SVG de línea: iglesia, copas, corazón, estrella, música.

4. **Código de vestimenta** → Sección con icono de pareja (novia y novio ilustrados) y el detalle del dress code.

5. **RSVP** → Formulario de confirmación.

6. **Galería Polaroid** → Las fotos en estilo Polaroid rotadas aleatoriamente, con efecto blanco y negro si lo configurás.

7. **Pie de página**

> **Para activar**: Tab Secciones → Skin de Invitación → Seleccionar "Envelope (GoParty)" → Seleccionar paleta "Olive" en Tab Tema → Guardar.

---

## 12. Preguntas frecuentes

### ¿Cómo consigo la dirección web de mi invitación?
El administrador te da la URL de tu evento. También está en los emails de configuración inicial.

### ¿La invitación funciona en celular?
Sí, está diseñada primero para celular (mobile-first). Funciona perfectamente en Android e iPhone, en cualquier navegador (Chrome, Safari, Firefox, etc.).

### ¿Puedo cambiar los colores después de publicarla?
Sí. Podés cambiar la paleta de colores, los textos, las fotos y cualquier configuración en cualquier momento desde el panel de administración. Los cambios se ven inmediatamente en la invitación.

### ¿Mis invitados tienen que crear una cuenta?
No. Tus invitados solo necesitan el enlace. Lo abren, ven la invitación y confirman asistencia. Sin registro, sin contraseña, sin app.

### ¿Cómo sé si mis invitados abrieron la invitación?
Si tenés activada la opción "Rastrear aperturas" en Tab Config, en la columna "Apertura" de la lista de invitados verás si abrieron el enlace o no.

### ¿Puedo ver quién confirmó asistencia en tiempo real?
Sí. El Tab RSVPs se actualiza cada vez que entrás. Ves cada confirmación con nombre, cantidad de personas y fecha.

### ¿Qué pasa si un invitado quiere cambiar su confirmación?
Si la opción "Permitir auto-edición" está activada, el invitado puede volver a su enlace y modificar su confirmación. Si no está activada, el administrador puede editarla desde Tab RSVPs.

### ¿Puedo agregar música de Spotify?
Actualmente solo se soporta YouTube y archivos de audio subidos directamente. No se integra con Spotify.

### ¿Cuántas fotos puedo subir a la galería?
No hay límite estricto de cantidad, pero recomendamos entre 8 y 20 fotos para que la galería cargue rápido. El tamaño máximo por foto es 10 MB.

### ¿Puedo usar la invitación para un evento que no es una boda?
Sí. Eventique soporta varios tipos de eventos: boda, quinceañera, cumpleaños, bautismo, graduación, corporativo, y más. Según el tipo, los textos se adaptan automáticamente.

### ¿Qué pasa si pierdo la contraseña del admin?
Contactá al administrador del sistema (eudavalos91@gmail.com) para recuperar el token de acceso.

### ¿La invitación funciona sin internet?
No. Eventique es una aplicación web que requiere conexión a internet para funcionar.

### ¿Puedo duplicar mi evento para otra boda?
Si tenés acceso de superadministrador, sí. Desde Tab Eventos → Clonar.

### ¿Cómo se ve el código QR de un invitado?
Es un código QR estándar que, al escanearlo con la cámara del celular, abre directamente la invitación personalizada del invitado. Podés imprimirlo en tarjetas físicas de boda o enviarlo digitalmente.

### ¿Qué pasa si un invitado comparte su enlace con otra persona?
El enlace está vinculado al cupo asignado. Si alguien más intenta confirmar con ese enlace después de que el cupo ya fue usado, el sistema lo rechaza.

---

## Contacto y soporte

**Administrador**: Eumelio Dávalos  
**Email**: eudavalos91@gmail.com  
**Plataforma**: Eventique by Tecnopowerpy  
**URL**: https://eventique.tecnopowerpy.top

---

*Eventique — Hacemos que tu invitación sea tan especial como tu evento.*

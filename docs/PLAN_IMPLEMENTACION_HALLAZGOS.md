# Plan de Implementación — Auditoría QA Eventique

**Documento:** Revisión v1.0 — 26 de Abril, 2026  
**Hallazgos:** 31 (8 críticos, 10 altos, 9 medios, 4 bajos)  
**Metodología:** Fases por severidad + prioridad

---

## 📊 RESUMEN EJECUTIVO

| Severidad | Cantidad | Estado | Plazo |
|-----------|----------|--------|-------|
| 🔴 Crítico (P0) | 8 | **Pendiente** | Inmediato (hoy) |
| 🟠 Alto (P1) | 10 | **Pendiente** | Esta semana |
| 🟡 Medio (P2-P3) | 9 | **Pendiente** | 2-3 semanas |
| 🟢 Bajo (P3) | 4 | **Pendiente** | Backlog |

---

## FASE 1: CRÍTICO (P0) — Implementar HOY

### ✅ H-001: Bug RSVP se registra en evento incorrecto
**Tipo:** Funcional / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Auditar frontend: verificar qué endpoint usa para POST RSVP
- [ ] Auditar backend: endpoint `/api/rsvp` vs `/api/events/{slug}/rsvp`
- [ ] Si `/api/rsvp` ignora `event_slug`, modificar para extraerlo del body
- [ ] Actualizar frontend para enviar `event_slug` en el POST
- [ ] Test de integración: crear 2 eventos, hacer RSVP a cada uno, verificar slug correcto

**Archivos afectados:**
- `frontend/src/sections/RSVP.tsx` (verificar endpoint POST)
- `api/main.py` (verificar manejo de event_slug)
- `frontend/src/lib/api.ts` (rsvpApi.submit)

---

### ✅ H-002: Seguridad — API expone admin_token en texto plano
**Tipo:** Seguridad / QA  
**Estado:** PARCIALMENTE HECHO (tokens se generan pero se exponen)  
**Pasos:**
- [ ] Hashear todos los `admin_token` en BD con bcrypt/argon2
- [ ] Eliminar `admin_token` del response de `GET /api/events` (listado)
- [ ] Crear endpoint `POST /api/events/{slug}/rotate-token` (solo superadmin)
- [ ] Actualizar `EventResponse` schema para NO incluir `admin_token`
- [ ] Migración: hashear tokens existentes en BD

**Archivos afectados:**
- `api/main.py` (eliminar admin_token del listado, crear rotate endpoint)
- `api/schemas.py` (EventResponse sin admin_token)
- `api/models.py` (agregar columna admin_token_hashed si es necesario)

---

### ✅ H-003: Seguridad — XSS (API acepta HTML sin sanitización)
**Tipo:** Seguridad / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Instalar `bleach` en `requirements.txt`
- [ ] Crear middleware o función sanitización en FastAPI
- [ ] Aplicar sanitización en todos los endpoints POST/PUT que acepten texto (RSVP, config, etc.)
- [ ] Validación Pydantic: rechazar `<`, `>`, `{`, `}` en campos de texto
- [ ] Test XSS: intentar inyectar `<script>alert(1)</script>` en todos los campos

**Archivos afectados:**
- `api/requirements.txt` (agregar bleach)
- `api/main.py` (middleware sanitización)
- `api/schemas.py` (validadores Pydantic)

---

### ✅ H-004: Bug CRÍTICO — 20 imágenes rotas (apuntan a /photos/)
**Tipo:** Funcional / UI  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Identificar todas las URLs de imagen en `frontend/src/config/wedding.ts`
- [ ] Cambiar prefijo `/photos/` → `/uploads/default/` (o `/uploads/{slug}/`)
- [ ] Verificar que los archivos de imagen existen en servidor
- [ ] Implementar fallback visual: placeholder avatar con gradiente + iniciales
- [ ] Agregar `onError` handler en todos los `<img>` tags
- [ ] Test: cargar página y verificar que todas las imágenes cargan correctamente

**Archivos afectados:**
- `frontend/src/config/wedding.ts` (URLs de imagen)
- `frontend/src/sections/*` (agregar onError handlers)
- `frontend/src/components/*` (componentes con imágenes)

---

### ✅ H-005: Bug CRÍTICO — Inconsistencia venues (CDMX vs Cartagena)
**Tipo:** Funcional / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Verificar datos en BD: `SELECT venues FROM event_config WHERE slug='boda-conce-eume'`
- [ ] Actualizar BD con venues correctos (Cartagena)
- [ ] Verificar `mergeConfig()` en App.tsx: prioridad BD sobre defaults
- [ ] Test: cargar evento y verificar que venues mostrados coinciden con BD

**Archivos afectados:**
- `api/main.py` (verificar data en BD)
- `frontend/src/App.tsx` (mergeConfig venues logic)

---

### ✅ H-006: Bug CRÍTICO — Contenido incorrecto (Carlos vs Eumelio)
**Tipo:** Funcional / Contenido  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Identificar todos los textos hardcodeados con nombres de placeholder en `wedding.ts`
- [ ] Buscar: "Carlos", "Ana", "Bahía de Cartagena", otros placeholders
- [ ] Hacer estos textos editables en el admin panel (Secciones tab)
- [ ] Actualizar DB con nombres correctos para `boda-conce-eume`
- [ ] Validación admin: advertencia si texto contiene nombres de placeholder

**Archivos afectados:**
- `frontend/src/config/wedding.ts` (identificar placeholders)
- `frontend/src/pages/AdminPage.tsx` (agregar editor para textos de Historia)
- `api/main.py` (persistir textos personalizados)

---

### ✅ H-007: Bug CRÍTICO — Swagger/OpenAPI parser error
**Tipo:** Funcional / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Revisar config FastAPI: `docs_url`, `openapi_url`
- [ ] Testear Swagger UI localmente: `curl http://localhost:8700/api/docs`
- [ ] Verificar MIME type de `/api/openapi.json`
- [ ] Si problema persiste, usar Redoc como alternativa o downgrade OpenAPI a 3.0.3
- [ ] Documentar API en `/docs/API.md` como backup

**Archivos afectados:**
- `api/main.py` (FastAPI app config)

---

## FASE 2: ALTO (P1) — Esta semana

### ✅ H-008: Rate limiting en RSVP
**Tipo:** Seguridad / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Instalar `slowapi` en `requirements.txt`
- [ ] Configurar rate limiter: 3 RSVPs por IP/hora, 1 RSVP por email/evento
- [ ] Aplicar a endpoints POST `/api/rsvp` y `/api/events/{slug}/rsvp`
- [ ] Devolver error 429 con mensaje claro

**Archivos afectados:**
- `api/requirements.txt`
- `api/main.py`

---

### ✅ H-009: Validación frontend RSVP vacío
**Tipo:** UX / Funcional  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Cambiar botón "Continuar" de `type="button"` a validación explícita
- [ ] Mostrar mensajes de error debajo de campos inválidos
- [ ] Resaltar campos con borde rojo
- [ ] Deshabilitar botón visualmente hasta que todos los campos sean válidos

**Archivos afectados:**
- `frontend/src/sections/RSVP.tsx`

---

### ✅ H-010: Labels sin atributo for
**Tipo:** Accesibilidad / QA  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Auditar todos los `<label>` en el proyecto
- [ ] Asignar IDs únicos a inputs: `rsvp-name`, `rsvp-email`, etc.
- [ ] Vincular labels: `htmlFor="rsvp-name"`
- [ ] Agregar `aria-required="true"`

**Archivos afectados:**
- `frontend/src/sections/RSVP.tsx`
- `frontend/src/pages/AdminPage.tsx`
- Todos los formularios

---

### ✅ H-011: Navbar duplica botón RSVP
**Tipo:** UI / UX  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Identificar dónde está el duplicado en la navbar
- [ ] Eliminar el ítem de texto "RSVP", conservar solo el botón CTA
- [ ] Verificar que en mobile funciona correctamente

**Archivos afectados:**
- `frontend/src/components/Navbar.tsx`

---

### ✅ H-012: Tercer hotel sin link reserva
**Tipo:** Funcional / UX  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Agregar link de reserva o tel: para Casa Bocagrande Boutique
- [ ] Hacer UI consistente: todos los hoteles deben tener el mismo patrón de acciones

**Archivos afectados:**
- `frontend/src/config/wedding.ts` (datos del hotel)
- `frontend/src/sections/Accommodation.tsx` (render de hoteles)

---

### ✅ H-013: Scrollbar visual intrusiva
**Tipo:** UI  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Esconder scrollbar nativo: `::-webkit-scrollbar { display: none }`
- [ ] Si se desea un progress indicator elegante, implementarlo correctamente

**Archivos afectados:**
- `frontend/src/index.css` o `frontend/src/styles/global.css`

---

### ✅ H-014: No hay header en login admin
**Tipo:** UX  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Agregar selector de evento o indicación en pantalla de login
- [ ] Mostrar preview del nombre del evento después de ingresar el token
- [ ] Implementar localStorage para persistir token con expiración

**Archivos afectados:**
- `frontend/src/pages/AdminPage.tsx` (seción de login)

---

### ✅ H-015: Multi-step RSVP incompleto (4 pasos mostrados, solo 1 funciona)
**Tipo:** UX / Funcional  
**Estado:** PENDIENTE  
**Pasos:**
- [ ] Completar flujo multi-step: Identidad → Asistencia → Acompañantes → Preferencias
- [ ] Conectar pasos 2-4 al frontend si existen en backend
- [ ] Agregar botón "Volver" entre pasos

**Archivos afectados:**
- `frontend/src/sections/RSVP.tsx`

---

## FASE 3: MEDIO (P2-P3) — 2-3 semanas

### ✅ H-016: Hero sin imagen de fondo real
**Pasos:**
- [ ] Configurar imagen hero en BD para `boda-conce-eume`
- [ ] Implementar fallback con gradiente elegante
- [ ] Agregar preload en `<head>`

---

### ✅ H-017: Inconsistencia paleta de colores
**Pasos:**
- [ ] Definir sistema de colores coherente con CSS variables
- [ ] Agregar transición suave entre hero y secciones

---

### ✅ H-018: Fotos cortejo rotas
**Pasos:**
- [ ] Implementar avatar fallback con iniciales
- [ ] Agregar skeleton loader para imágenes

---

### ✅ H-019: Animaciones desincronizadas scroll-reveal
**Pasos:**
- [ ] Reducir threshold de IntersectionObserver a 0.1
- [ ] Reducir duración de animaciones a 400-600ms
- [ ] Respetar `prefers-reduced-motion`

---

### ✅ H-020: Sin skip navigation link
**Pasos:**
- [ ] Agregar `<a href="#main-content" class="skip-link">`
- [ ] Mostrar solo en foco de teclado

---

### ✅ H-021: Nav sin landmark ARIA
**Pasos:**
- [ ] Agregar `<nav aria-label="Navegación principal de la invitación">`

---

### ✅ H-022: Botón música sin estado dinámico
**Pasos:**
- [ ] Actualizar `aria-label` dinámicamente con estado
- [ ] Cambiar ícono visualmente (▶ / ⏸)
- [ ] Agregar indicador "reproduciendo"

---

## FASE 4: BAJO (P3) — Backlog

### ✅ H-023: Hashtag con error tipográfico (tildes)
### ✅ H-024: Footer incompleto
### ✅ H-025: Open Graph tags rotos
### ✅ H-026+: Performance / Lazy loading

---

## 📋 CHECKLIST GENERAL

- [ ] Crear branch `fix/enterprise-hardening-v2` desde `main`
- [ ] Implementar H-001 a H-007 (críticos)
- [ ] Testing exhaustivo: funcionalidad + seguridad + accesibilidad
- [ ] Merge a `main` + push a GitHub
- [ ] Deploy a Pi
- [ ] Verificación en producción

---

## 🎯 PRIORIDADES INMEDIATAS

1. **H-001** — RSVP event_slug → BLOQUEA TODO
2. **H-002** — Admin tokens hashear → SEGURIDAD
3. **H-003** — XSS sanitización → SEGURIDAD
4. **H-004** — Imágenes rotas → EXPERIENCIA VISUAL
5. **H-005** — Venues inconsistentes → CORRECCIÓN DE DATOS
6. **H-006** — Nombres placeholders → PERSONALIZACIÓN
7. **H-007** — Swagger docs → DOCUMENTACIÓN

---

## 🚀 PRÓXIMOS PASOS

1. **Ahora:** Auditar H-001 (endpoint RSVP)
2. **Hoy:** Implementar H-001 a H-007
3. **Mañana:** Testing + merge + deploy
4. **Esta semana:** H-008 a H-015

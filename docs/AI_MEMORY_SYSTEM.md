# AI Session Memory System — Enterprise Specification

**Versión**: 1.0  
**Categoría**: Architecture — AI Collaboration Protocols  
**Audiencia**: Tech Leads, Principal Engineers, AI Integration Architects  
**Aplicabilidad**: Cualquier proyecto que use Claude Code como asistente de desarrollo

---

## 1. Propósito y Filosofía

Los modelos de lenguaje no tienen memoria persistente entre conversaciones. Cada sesión comienza desde cero. Sin un sistema de memoria estructurado, el asistente:

- Repite decisiones ya tomadas (y descartadas)
- Desconoce bugs ya resueltos
- No respeta patrones de calidad establecidos
- Ignora el contexto del proyecto, sus fases y su estado actual
- No puede dar continuidad al trabajo en progreso

Este documento especifica el sistema de memoria diseñado y validado en ExMigratorAI para resolver estos problemas. El objetivo es que cada sesión comience con contexto completo, consistente y actualizado, sin que el usuario tenga que volver a explicar nada.

**Principio rector**: La memoria no reemplaza al código — documenta lo que el código no puede comunicar por sí solo: decisiones arquitectónicas, restricciones, bugs ya vistos, y el estado actual del trabajo.

---

## 2. Arquitectura del Sistema

### 2.1 Los Tres Artefactos de Persistencia

El sistema descansa en tres artefactos complementarios, cada uno con un rol específico:

```
┌─────────────────────────────────────────────────────────────────┐
│                    SISTEMA DE MEMORIA AI                         │
│                                                                   │
│  CLAUDE.md              MEMORY.md + *.md        settings.*.json │
│  ──────────             ─────────────────        ─────────────── │
│  Contrato de            Memoria semántica        Contrato de     │
│  colaboración           persistente              configuración   │
│  (en el repo)           (fuera del repo)         (en el repo)   │
│                                                                   │
│  • Quién soy            • Qué decidimos          • Umbrales      │
│  • Cómo trabajo         • Qué aprendimos          • Feature flags │
│  • Estado actual        • Qué bugs vimos          • Parámetros   │
│  • Reglas de calidad    • Qué patrones usamos     • Baseline     │
└─────────────────────────────────────────────────────────────────┘
```

**CLAUDE.md** — Se carga automáticamente en cada sesión. Es el punto de entrada primario del asistente al proyecto. Contiene el estado real del sistema, las reglas de calidad inviolables, y las decisiones arquitectónicas persistentes. Vive en el repositorio y es versionado con git.

**Directorio `memory/`** — Almacenamiento semántico estructurado. Vive fuera del repositorio (en `~/.claude/projects/<project-hash>/memory/`). No está sujeto a git, por lo que puede contener contexto libre sin afectar el historial del proyecto.

**`settings.local.json`** — Contrato técnico de configuración. Contiene todos los umbrales, parámetros, feature flags y baseline de tests. Se actualiza en cada sesión que introduzca un cambio técnico relevante.

### 2.2 Estructura de Directorios

```
~/.claude/projects/<project-hash>/
└── memory/
    ├── MEMORY.md                          ← índice maestro (siempre cargado)
    ├── architecture.md                    ← decisiones de arquitectura persistentes
    ├── feedback_testing.md                ← reglas y anti-patrones aprendidos
    ├── session_YYYY_MM_DD_<tema>.md       ← registro por sesión
    └── ...

<repo>/
├── CLAUDE.md                              ← contexto de colaboración (en git)
├── settings.local.json                    ← configuración técnica (en git)
└── docs/
    └── AI_MEMORY_SYSTEM.md                ← este documento
```

---

## 3. Los Cuatro Tipos de Memoria

### 3.1 `user` — Perfil del Desarrollador

Información sobre el rol, nivel técnico, preferencias y responsabilidades del usuario. Permite al asistente calibrar el nivel de explicación, el lenguaje técnico apropiado, y qué omitir por obvio.

**Cuándo guardar**: Al aprender detalles sobre el rol, expertise, o forma de trabajo preferida.

**Estructura**:
```markdown
---
name: developer_profile
description: Perfil técnico del desarrollador principal
type: user
---

[Descripción del rol y expertise]
```

**Ejemplo**:
```markdown
Usuario es Principal Engineer con experiencia profunda en Python y GeneXus.
Primera vez trabajando con PySide6. Prefiere respuestas cortas y directas.
No necesita explicación de patrones básicos de Python — sí necesita contexto
sobre quirks de Qt y PySide6.
```

### 3.2 `feedback` — Reglas de Colaboración

Guía sobre qué hacer y qué evitar, derivada de correcciones explícitas del usuario o de confirmaciones de enfoques no obvios. Es el tipo más crítico porque evita repetir errores.

**Cuándo guardar**: Ante cualquier corrección ("no hagas X") o confirmación de enfoque no evidente ("exacto, sigue así"). Las confirmaciones silenciosas son tan importantes como las correcciones explícitas.

**Estructura obligatoria**:
```markdown
---
name: feedback_<tema>
description: [descripción específica — usada para determinar relevancia]
type: feedback
---

[La regla o patrón en sí]

**Why**: [la razón que dio el usuario — permite juzgar casos borde]
**How to apply**: [cuándo y dónde aplica esta guía]
```

**Ejemplo**:
```markdown
NUNCA usar `.get()` sobre `sqlite3.Row`. Convertir a `dict(row)` primero.

**Why**: `sqlite3.Row` no implementa `.get()` — lanza AttributeError en runtime.
Ya provocó bug en producción (object_explorer_view.py).
**How to apply**: Cualquier código que lea rows de SQLite y use `.get()`.
```

### 3.3 `project` — Estado del Proyecto

Información sobre el trabajo en curso, decisiones tomadas, deadlines, y el "por qué" detrás de cambios que no son obvios leyendo el código. Se degrada rápido — siempre incluir fechas absolutas.

**Cuándo guardar**: Al decidir una dirección, completar una fase, detectar un blocker, o cuando el contexto de "por qué" no estará en el código.

**Estructura**:
```markdown
---
name: project_<tema>
description: [descripción específica]
type: project
---

[El hecho o decisión]

**Why**: [motivación — constraint, deadline, decisión de equipo]
**How to apply**: [cómo esta memoria debe influir en sugerencias futuras]
```

**Ejemplo**:
```markdown
Feature branch `feature/etapa6-enterprise-improvements` es la rama activa.
Main está divergido — merge conflict irresolvible sin coordinación. 
Política inviolable: NUNCA commitear a main directamente.

**Why**: origin/main tiene commit 25f7f4e divergente desde 2026-04-21. 
Merge conflicts en 13+ archivos. Coordinación explícita requerida.
**How to apply**: Todo push va a feature branch. Push a main solo con 
instrucción explícita del usuario después de resolver conflicts.
```

### 3.4 `reference` — Recursos Externos

Punteros a información en sistemas externos: Linear, Jira, Grafana, Slack, GitHub. Permite al asistente saber dónde buscar sin que el usuario tenga que repetirlo.

**Cuándo guardar**: Al mencionar un proyecto, board, channel, o URL de referencia.

**Ejemplo**:
```markdown
---
name: reference_issue_tracker
description: Dónde se rastrean bugs e issues del proyecto
type: reference
---

Issues del proyecto en GitHub bajo el repositorio eximus/ExMigratorAI.
Labels: `bug`, `enhancement`, `etapa6`, `ui`.
```

---

## 4. MEMORY.md — El Índice Maestro

`MEMORY.md` es el único archivo de memoria que se carga automáticamente en cada sesión. No contiene información — es un índice con una línea descriptiva por archivo.

**Reglas críticas**:
- Máximo 200 líneas (las líneas después son truncadas por el runtime)
- Una línea por entrada, bajo 150 caracteres
- El "hook" de cada línea debe ser suficientemente descriptivo para determinar relevancia sin abrir el archivo
- Nunca escribir contenido de memoria directamente en `MEMORY.md`

**Estructura**:
```markdown
# <Nombre del Proyecto> Memory Index

**Last Updated**: YYYY-MM-DD (descripción de la última actualización)

## Sessions
- [archivo.md](archivo.md) — descripción concisa de qué cubre

## Architecture & Decisions
- [architecture.md](architecture.md) — reglas de capas, contratos, patrones

## Testing
- [feedback_testing.md](feedback_testing.md) — patrones, anti-patrones, errores

## Project Status (YYYY-MM-DD)
- FASE 1 ✅ descripción
- FASE 2 🔲 descripción (pendiente)

## Workflow Protocols
- **Regla clave**: descripción
```

---

## 5. Protocolo de Sesión

### 5.1 Inicio de Sesión

Al comenzar una sesión nueva, el asistente debe:

1. Leer `CLAUDE.md` (cargado automáticamente)
2. Leer `MEMORY.md` (cargado automáticamente)
3. Acceder a memorias específicas relevantes al trabajo planteado
4. Verificar que las memorias con referencias a archivos o funciones específicas siguen siendo válidas (el archivo puede haber cambiado)

**Regla**: Una memoria que menciona una función o archivo es una afirmación de que existía cuando se escribió. Antes de actuar sobre ella, verificar con `grep` o lectura del archivo actual.

### 5.2 Durante la Sesión

En cada iteración significativa (tarea completada, decisión tomada, bug descubierto):

1. Guardar en el archivo de sesión `session_YYYY_MM_DD_<tema>.md`
2. Actualizar `CLAUDE.md` si hay cambios de estado o decisiones arquitectónicas
3. Actualizar `settings.local.json` si hay nuevos parámetros o cambios de configuración
4. Actualizar `MEMORY.md` con el puntero al nuevo archivo si es sesión nueva

### 5.3 Cierre de Sesión

Antes de cerrar toda sesión significativa:

- [ ] Archivo de sesión `session_YYYY_MM_DD_<tema>.md` creado y completo
- [ ] `CLAUDE.md` actualizado con estado real (no aspiracional)
- [ ] `settings.local.json` actualizado si hay cambios técnicos
- [ ] `MEMORY.md` actualizado con puntero a la sesión
- [ ] Compilación verificada: `python -m py_compile <archivos nuevos>`
- [ ] Tests validados: `python -m pytest --no-cov -q`

---

## 6. Formato de Archivo de Sesión

Cada sesión significativa genera un archivo `session_YYYY_MM_DD_<tema>.md` con frontmatter y estructura estándar:

```markdown
---
name: session_YYYY_MM_DD_<tema>
description: [descripción de una línea — qué se hizo en esta sesión]
type: project
originSessionId: [ID de sesión o tema descriptivo]
---

# Sesión YYYY-MM-DD: <TÍTULO EN MAYÚSCULAS>

**Fecha**: YYYY-MM-DD  
**Rigor**: [roles involucrados: e.g., Principal Engineer + QA Lead]  
**Modo**: [e.g., MODO ENTERPRISE — auditoría exhaustiva]  
**Resultado**: ✅ COMPLETO / 🔲 EN PROGRESO / ❌ BLOQUEADO

---

## RESUMEN EJECUTIVO

[2-3 oraciones: qué se hizo, qué cambió, cuál es el impacto]

---

## CAMBIOS REALIZADOS

### Archivos modificados:
| Archivo | Tipo de cambio | Líneas |
|---------|---------------|--------|
| path/to/file.py | feat/fix/refactor | +N/-M |

### Commits creados:
1. `<hash>`: `<mensaje>` — [descripción de qué incluye]

---

## DECISIONES TÉCNICAS

### DT1: <Título de la decisión>
**Decisión**: [qué se decidió]  
**Por qué**: [motivación — constraint, bug, requerimiento]  
**Alternativas descartadas**: [qué se consideró y por qué no]  
**Validación**: [cómo se confirmó que fue la decisión correcta]

---

## VALIDACIONES EJECUTADAS

| Validación | Resultado | Evidencia |
|------------|-----------|-----------|
| Compilación Python | ✅ PASS | py_compile sin errores |
| Test suite | ✅ N tests PASS | 0 regresiones |
| Funcionales | ✅ N/N PASS | descripción |

---

## RIESGOS Y MITIGACIONES

| Riesgo | Prob | Impacto | Mitigación |
|--------|------|---------|------------|
| [descripción] | ALTA/MEDIA/BAJA | ALTO/MEDIO/BAJO | [acción tomada] |

---

## CONTINUIDAD PARA PRÓXIMAS SESIONES

### Pendientes bloqueados:
- [tarea]: [razón del bloqueo]

### Listos para ejecutar:
- [tarea]: [prerequisitos cumplidos]

### Próxima sesión recomendada:
1. [acción concreta]
2. [acción concreta]
```

---

## 7. CLAUDE.md — Especificación

`CLAUDE.md` es el artefacto más importante del sistema. Se carga automáticamente en cada sesión y establece el contrato de colaboración completo.

### 7.1 Secciones Obligatorias

```markdown
# <Nombre del Proyecto> — Claude Code Context

**Proyecto**: [nombre] — [descripción de una línea]
**Empresa**: [nombre]
**Stack**: [tecnologías principales]
**Licencia**: [tipo]

---

## Propósito
[Qué hace el sistema. 3-5 oraciones. Sin jerga interna.]

---

## Arquitectura en capas
[Diagrama de árbol + descripción de reglas de capas]

---

## Comandos clave
[Los comandos que el asistente necesita para trabajar: tests, lint, CLI, UI]

---

## Estado del proyecto (YYYY-MM-DD)
[Estado real por fase/etapa. "Completado" solo si está en producción o validado.]

---

## Thresholds — Política de parametrización
[Reglas de zero-hardcoding. Cómo acceder a configuración.]

---

## Convenciones de código
[Las reglas de estilo específicas del proyecto, incluyendo anti-patrones conocidos]
```

### 7.2 Reglas de Mantenimiento

- **Actualizar en cada sesión significativa** — el estado en `CLAUDE.md` debe ser siempre el estado real, no el aspiracional
- **"Completado" tiene criterio estricto** — solo si pasó tests + compilación + validación funcional
- **Decisiones arquitectónicas son permanentes** — una vez documentadas, solo se cambian con decisión explícita
- **Anti-patrones conocidos se listan explícitamente** — para que el asistente no los vuelva a introducir

---

## 8. settings.local.json — Especificación

Es el contrato técnico de configuración. Toda constante numérica, umbral, flag de feature, y parámetro configurable vive aquí. No hay excepciones.

### 8.1 Estructura Tipo

```jsonc
{
  "analysis": {
    "target_mapping": {
      "p1_min_fan_in": 10,
      "p1_min_fan_out": 15,
      "p1_min_loc": 500,
      "p2_min_fan_in": 5,
      // ... todos los umbrales de análisis
    },
    "priority_bands": {
      // umbrales por tipo de analyzer
    }
  },
  "ingestion": {
    "batch_size": 500           // nunca hardcodeado en código
  },
  "reporting": {
    "default_velocity_per_week": 12
  },
  "ui": {
    "progress_hide_delay_ms": 2000,
    "max_concurrent_generations": 1,
    "generation_progress_markers": [
      "Generating",
      "Writing",
      "Complete"
    ]
  },
  "session_protocol": {
    "last_session_date": "YYYY-MM-DD",
    "test_count_baseline": 345,
    "git_workflow": {
      "protected_branches": ["main"],
      "require_feature_branch": true,
      "push_to_main_requires_coordination": true
    }
  }
}
```

### 8.2 Patrón de Acceso

Nunca leer `settings.local.json` directamente en código de análisis. Usar un accessor centralizado:

```python
# analysis/thresholds.py
from dataclasses import dataclass
import json
from pathlib import Path

@dataclass
class AnalysisThresholds:
    p1_min_fan_in: int
    p1_min_loc: int
    batch_size: int
    # ... todos los campos

_cache: AnalysisThresholds | None = None

def get_thresholds() -> AnalysisThresholds:
    global _cache
    if _cache is None:
        settings = json.loads(Path("settings.local.json").read_text())
        tm = settings["analysis"]["target_mapping"]
        _cache = AnalysisThresholds(
            p1_min_fan_in=tm["p1_min_fan_in"],
            # ...
        )
    return _cache
```

**Uso correcto**:
```python
from exmigrator.analysis.thresholds import get_thresholds
t = get_thresholds()
if fan_in > t.p1_min_fan_in:   # ✅ parametrizado
if fan_in > 10:                 # ❌ hardcoding — prohibido
```

---

## 9. Reglas de Calidad del Sistema

### 9.1 Qué NO guardar en memoria

Estas categorías pertenecen al código o al historial de git, no a la memoria:

| No guardar | Dónde pertenece |
|-----------|----------------|
| Patrones de código, arquitectura de módulos | El código mismo |
| Historial de cambios, quién cambió qué | `git log` / `git blame` |
| Soluciones a bugs específicos | Commit message del fix |
| Lo que ya está en `CLAUDE.md` | `CLAUDE.md` |
| Estado efímero de la sesión actual | Solo en el contexto de conversación |
| Lista de PRs o actividad reciente | `git log` |

### 9.2 Qué SÍ guardar

| Guardar | Tipo | Por qué no está en el código |
|---------|------|------------------------------|
| "sqlite3.Row no tiene .get()" | feedback | Es una trampa no obvia del runtime |
| "Main divergió, usar feature branch" | project | Decisión contextual, no visible en código |
| "CliRunner sin mix_stderr" | feedback | Quirk de esta versión de Click |
| "DuckDB requiere DB file-backed" | feedback | Restricción del driver, no del código |
| "El usuario prefiere respuestas cortas" | user | Preferencia personal |
| "Tests no usan mocks de DB" | feedback | Decisión de arquitectura de tests |

### 9.3 Ciclo de Vida de una Memoria

```
CREACIÓN                ACTUALIZACIÓN             RETIRO
─────────               ──────────────            ──────
Nueva sesión         →  La situación cambió    →  Ya no aplica
o corrección del        (el bug fue resuelto,     (la función fue
usuario                 la decisión fue           renombrada, la
                        revertida, etc.)          regla fue al código)
```

Una memoria desactualizada es peor que ninguna memoria. Si al verificar una memoria contra el código actual hay discrepancia, actualizar o eliminar la memoria antes de actuar sobre ella.

---

## 10. Guía de Replicación en Proyectos Nuevos

### 10.1 Checklist de Setup Inicial

**Paso 1: Crear `CLAUDE.md` en la raíz del repositorio**

```bash
# Usar el skill de inicialización si está disponible
/init
# O crear manualmente con las secciones obligatorias de §7.1
```

**Paso 2: Crear directorio de memoria**

El directorio de memoria se crea automáticamente por Claude Code en:
```
~/.claude/projects/<hash-del-proyecto>/memory/
```

El hash se deriva de la ruta absoluta del proyecto.

**Paso 3: Crear `MEMORY.md` inicial**

```markdown
# <Nombre del Proyecto> Memory Index

**Last Updated**: YYYY-MM-DD (sesión inicial)

## Architecture & Decisions
(vacío — se irá llenando)

## Project Status (YYYY-MM-DD)
- FASE 1 🔲 Descripción

## Workflow Protocols
- **Zero hardcoding**: Todos los umbrales en settings.json via accessor centralizado
```

**Paso 4: Crear `settings.local.json` (o equivalente)**

```json
{
  "session_protocol": {
    "last_session_date": "YYYY-MM-DD",
    "test_count_baseline": 0
  }
}
```

**Paso 5: Instrucción en `CLAUDE.md`**

Agregar la sección de protocolo de sesión:

```markdown
## Protocolo de Sesión

En cada sesión significativa, actualizar estos tres artefactos:

1. `memory/session_<fecha>_<tema>.md` — decisiones, validaciones, problemas
2. `CLAUDE.md` → sección "Estado del proyecto"  
3. `settings.local.json` → flags técnicos, umbrales, configuraciones nuevas

**Estándar enterprise (inviolable)**:
- ZERO valores hardcodeados en código fuente
- Todo código generado: parametrizable, robusto, con logging estructurado
```

### 10.2 Plantilla de architecture.md

```markdown
---
name: <Proyecto> Architecture Decisions
description: Decisiones arquitectónicas persistentes — capas, contratos, patrones.
type: project
---

# Arquitectura <Proyecto>

**Why**: Documentar reglas no derivables solo leyendo el código.  
**How to apply**: Antes de proponer cambios estructurales, verificar estas reglas.

---

## Reglas de capas

1. `domain/` — ZERO imports del proyecto
2. `infrastructure/` — importa `domain/` solamente
3. `<capa_n>/` — importa solo capas inferiores

## Contratos de persistencia

- Escritura solo via `<Repository class>`
- Lectura solo via `<Reader class>`
- Nunca SQL directo en capas de negocio

## Patrones de dominio

- IDs: `str` (UUID v4 o v5)
- Timestamps: UTC (`datetime.now(timezone.utc)`)
- Enums: `str, Enum` para serialización directa
```

### 10.3 Plantilla de feedback_testing.md

```markdown
---
name: Testing Patterns
description: Reglas y anti-patrones de tests. Incluye errores ya cometidos.
type: feedback
---

# Guía de Testing — <Proyecto>

**Why**: No repetir errores en tests.  
**How to apply**: Leer antes de escribir un test nuevo.

---

## Reglas establecidas

- [Patrón 1]: [descripción]
- [Patrón 2]: [descripción]

## Anti-patrones (errores cometidos)

| Anti-patrón | Corrección |
|-------------|------------|
| [error específico] | [corrección] |
```

---

## 11. Patrones Avanzados

### 11.1 Iteración Automática

En sesiones largas con múltiples subtareas del mismo bloque, el protocolo de iteración automática evita interrupciones innecesarias:

```
Instrucción de sesión en CLAUDE.md:
"Iterar automáticamente todas las subtareas de un bloque sin esperar 
confirmación entre ellas. Solo pausar ante: (a) decisión destructiva 
irreversible, (b) ambigüedad que cambia el alcance, (c) fin de bloque."
```

### 11.2 Modo Enterprise

Para sesiones críticas de auditoría o refactor masivo, declarar el modo al inicio:

```
MODO ENTERPRISE — Auditoría exhaustiva, cierre de gaps, 0 confirmaciones 
entre subtareas del mismo bloque, validación técnica completa al final.
```

El asistente actúa con rigor de Principal Engineer + QA Lead simultáneamente.

### 11.3 Zero Hardcoding Enforcement

El sistema de memoria debe incluir en `feedback_testing.md` una entrada específica sobre la política de zero hardcoding para que se aplique automáticamente:

```markdown
Zero hardcoding enforcement: NINGUNA constante numérica en código fuente de 
análisis o configuración. Toda constante va en settings.local.json y se 
accede via accessor centralizado (get_thresholds() o equivalente).

**Why**: Umbrales cambian por cliente, por KB size, por requisitos. 
Hardcodearlos hace el sistema frágil y no portable.
**How to apply**: En cada código generado, verificar que no haya literales 
numéricos en lógica de negocio. Si aparece uno, moverlo a settings.
```

### 11.4 Git Workflow Policy en Memoria

Las políticas de git que el equipo ha decidido deben estar en memoria de proyecto, no solo en documentación:

```markdown
# project memory: git_workflow_policy.md

Git Workflow: main es rama protegida. Todo trabajo en feature branches.
Push a main requiere coordinación explícita y resolución de conflictos.

**Why**: Ramas pueden divergir en proyectos con múltiples colaboradores. 
Un merge sin coordinación puede sobrescribir trabajo de otros.
**How to apply**: Siempre crear feature branch antes de trabajar. 
Push solo a origin/<feature-branch>. Never push to origin/main.
```

---

## 12. Métricas de Calidad del Sistema

Un sistema de memoria bien mantenido cumple estos criterios:

| Métrica | Objetivo | Indicador de problema |
|---------|----------|----------------------|
| Archivos en `memory/` | 1 por sesión significativa + estables | >20 archivos de sesión sin consolidar |
| Líneas en `MEMORY.md` | < 150 | >180 líneas = truncación inminente |
| Memorias verificadas antes de actuar | 100% de referencias a código | Recomendar algo que ya no existe |
| `CLAUDE.md` actualizado | Cada sesión que cambia el estado | Estado aspiracional en CLAUDE.md |
| Zero hardcoding violations | 0 en código de análisis/negocio | Cualquier literal numérico en lógica |
| Test baseline actualizado | settings.local.json tras cada suite change | Baseline desincronizado del count real |

---

## 13. Referencia Rápida — Cheatsheet

```
┌─────────────────────────────────────────────────────────────────┐
│ CHEATSHEET — SISTEMA DE MEMORIA AI                               │
├─────────────────────────────────────────────────────────────────┤
│ INICIO DE SESIÓN                                                  │
│  1. CLAUDE.md + MEMORY.md cargados automáticamente               │
│  2. Leer memorias relevantes al trabajo                           │
│  3. Verificar referencias a código (puede haber cambiado)         │
├─────────────────────────────────────────────────────────────────┤
│ DURANTE LA SESIÓN                                                 │
│  • Bug descubierto → feedback memory                              │
│  • Decisión tomada → project memory + CLAUDE.md                  │
│  • Preferencia del usuario → user memory                          │
│  • Recurso externo mencionado → reference memory                  │
├─────────────────────────────────────────────────────────────────┤
│ CIERRE DE SESIÓN                                                  │
│  ✓ session_YYYY_MM_DD_tema.md creado                             │
│  ✓ MEMORY.md actualizado (puntero a sesión)                       │
│  ✓ CLAUDE.md actualizado (estado real)                            │
│  ✓ settings.local.json actualizado (si hay cambios técnicos)      │
│  ✓ py_compile en archivos nuevos                                  │
│  ✓ pytest --no-cov -q ejecutado                                   │
├─────────────────────────────────────────────────────────────────┤
│ LO QUE NO VA EN MEMORIA                                           │
│  ✗ Código, patrones, arquitectura (está en el código)             │
│  ✗ Historial de cambios (está en git log)                         │
│  ✗ Lo que ya está en CLAUDE.md                                    │
│  ✗ Estado efímero de la sesión actual                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 14. Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-04-26 | ExMigratorAI / Claude Code | Versión inicial — documentación completa del sistema validado en producción |

---

*Este documento describe el sistema implementado y validado en ExMigratorAI (15 sesiones de trabajo, 345 tests, caso real de 2703 objetos GeneXus). Es replicable en cualquier proyecto que use Claude Code como asistente de desarrollo.*

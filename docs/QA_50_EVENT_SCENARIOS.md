# QA 50 Event Scenarios

**Objetivo**: generar y validar 50 eventos QA en Eventique usando los mismos contratos HTTP que usa el panel admin.

**Estado**: catalogo parametrizado, reproducible e idempotente.

## Cobertura

El catalogo se construye desde dimensiones soportadas por el producto:

| Dimension | Valores cubiertos |
|---|---|
| Tipos de evento | boda, cumpleanos, bautismo, quinceanera, graduacion, corporativo, primera-comunion, aniversario, baby-shower |
| Skins | classic, envelope, paper-access |
| Modos de invitacion | generic, personalized, hybrid |
| Musica | youtube-single, youtube-playlist, disabled |
| Regalos | registry, bank, both, none |
| Recintos | single, ceremony-reception |
| RSVP | open, deadline, limited, song-request |
| Invitados | general, family, vip, staff |

## Scripts

- `scripts/event_scenario_catalog.py`: fuente declarativa de los 50 escenarios.
- `scripts/seed_event_scenarios.py`: runner API para Pi/produccion.
- `scripts/create_test_events.py`: seeder directo a DB para desarrollo local.

## Ejecucion en Raspberry Pi

```bash
cd ~/Boda
TOKEN="$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2-)"
python3 scripts/seed_event_scenarios.py \
  --base-url http://localhost:5176/api \
  --frontend-url http://localhost:5176 \
  --public-base-url https://eventique.tecnopowerpy.top \
  --token "$TOKEN" \
  --count 50 \
  --prefix qa50 \
  --action seed-validate \
  --include-guests \
  --include-rsvps
```

## Validaciones del runner

El flujo valida:

- existencia de los 50 eventos `qa50-*`;
- persistencia de `event_type`, `invitation_skin`, `invitation_mode` y metadata `qa_scenario`;
- coherencia de musica habilitada/deshabilitada;
- uso de `paper-olive` para `paper-access`;
- seccion RSVP activa;
- limite de longitud de slug compatible con API;
- render de ruta publica `/e/{slug}` con respuesta HTML 200.

## Limpieza

```bash
cd ~/Boda
TOKEN="$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2-)"
python3 scripts/seed_event_scenarios.py \
  --base-url http://localhost:5176/api \
  --token "$TOKEN" \
  --prefix qa50 \
  --action cleanup
```

## Nota operativa

Los eventos QA no crean tokens admin especificos. Se administran con el `ADMIN_TOKEN` global del entorno, evitando publicar credenciales por evento.

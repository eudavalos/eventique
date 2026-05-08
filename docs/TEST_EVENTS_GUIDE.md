# Guia De Eventos De Prueba

**Objetivo**: generar 50 eventos QA con cobertura amplia de tipos, skins, modos de invitacion, musica, regalos, recintos, RSVP e invitados personalizados.

La fuente oficial del flujo es `docs/QA_50_EVENT_SCENARIOS.md`.

## Opcion Recomendada: API En Pi

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

## Opcion Local: DB Directa

```bash
cd D:\Proyectos\Eventos\Boda
py -3 scripts/create_test_events.py --count 50 --prefix qa50
```

Usar `--reset` si se quiere regenerar los eventos del prefijo:

```bash
py -3 scripts/create_test_events.py --count 50 --prefix qa50 --reset
```

## Cobertura

| Dimension | Valores |
|---|---|
| Tipos | boda, cumpleanos, bautismo, quinceanera, graduacion, corporativo, primera-comunion, aniversario, baby-shower |
| Skins | classic, envelope, paper-access |
| Modos | generic, personalized, hybrid |
| Musica | youtube-single, youtube-playlist, disabled |
| Regalos | registry, bank, both, none |
| Recintos | single, ceremony-reception |
| RSVP | open, deadline, limited, song-request |
| Invitados | general, family, vip, staff |

## Acceso

Los eventos se crean con slugs `qa50-*`.

Ejemplos:

```text
https://eventique.tecnopowerpy.top/e/qa50-01-boda-classic-gen
https://eventique.tecnopowerpy.top/e/qa50-19-boda-paper-gen
https://eventique.tecnopowerpy.top/e/qa50-50-graduacion-paper-per
```

## Validacion

Despues de generar escenarios, ejecutar la suite general:

```bash
cd ~/Boda
TOKEN="$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2-)"
python3 docs/test_suite.py --base-url http://localhost:5176/api --token "$TOKEN"
```

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

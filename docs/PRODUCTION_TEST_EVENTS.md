# Eventos QA En Produccion / Pi

**Ambiente**: `https://eventique.tecnopowerpy.top`
**Servidor**: `eudavalos@raspberrypi`
**Modelo actual**: 50 eventos QA parametrizados con prefijo `qa50`.

## Estado

El flujo anterior de 5 eventos manuales fue reemplazado por un catalogo reproducible de 50 escenarios. La documentacion operativa vive en:

- `docs/QA_50_EVENT_SCENARIOS.md`
- `docs/TEST_EVENTS_GUIDE.md`

## Comando De Generacion

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

## URLs De Referencia

```text
https://eventique.tecnopowerpy.top/e/qa50-01-boda-classic-gen
https://eventique.tecnopowerpy.top/e/qa50-10-boda-env-gen
https://eventique.tecnopowerpy.top/e/qa50-19-boda-paper-gen
https://eventique.tecnopowerpy.top/e/qa50-50-graduacion-paper-per
```

## Validacion Funcional

```bash
cd ~/Boda
TOKEN="$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2-)"
python3 docs/test_suite.py --base-url http://localhost:5176/api --token "$TOKEN"
```

## Limpieza Controlada

```bash
cd ~/Boda
TOKEN="$(grep '^ADMIN_TOKEN=' .env | cut -d= -f2-)"
python3 scripts/seed_event_scenarios.py \
  --base-url http://localhost:5176/api \
  --token "$TOKEN" \
  --prefix qa50 \
  --action cleanup
```

## Seguridad

Los escenarios QA se crean sin tokens admin especificos. La gestion se realiza con el `ADMIN_TOKEN` global del servidor.

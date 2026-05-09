# Session 2026-05-09 - Personalized RSVP Decline Fix

## Pedido

El usuario reporto que faltaba corregir un error al confirmar o rechazar desde una invitacion personalizada. La captura mostraba `Minified React error #31` renderizando un objeto con keys `{type,msg,input,ctx}`.

## Hallazgos

- El flujo personalizado enviaba `guest_count: 0` cuando el invitado rechazaba la invitacion.
- `PersonalizedRSVPCreate` exigia `guest_count >= 1`, por lo que FastAPI rechazaba el payload antes de entrar al endpoint.
- FastAPI devolvia `detail` como lista/objeto de validacion Pydantic; el frontend pasaba ese objeto directo a `toast.error`.
- React intentaba renderizar el objeto como child y disparaba el error minificado #31.

## Decisiones

- En invitaciones personalizadas, `guest_count=0` es valido solo cuando `attending=false`.
- Si `attending=true`, el backend sigue exigiendo al menos 1 asistente.
- El frontend debe normalizar cualquier error API antes de mostrarlo en toast o usarlo en logica de ruta.
- La suite enterprise debe cubrir explicitamente el rechazo personalizado con `guest_count=0`.

## Cambios

- `api/schemas.py`: `PersonalizedRSVPCreate.guest_count` permite `ge=0` y agrega `model_validator` para impedir `attending=true` con `guest_count < 1`.
- `frontend/src/lib/apiError.ts`: nuevo helper `getApiErrorMessage()` y `formatApiErrorDetail()` para convertir strings, arrays y objetos de error en texto seguro.
- `frontend/src/sections/RSVP.tsx`: RSVP personalizado y generico usan `getApiErrorMessage()` en errores.
- `frontend/src/pages/PersonalizedInvitationPage.tsx`: el catch del RSVP standalone usa `getApiErrorMessage()`.
- `frontend/src/App.tsx`: la ruta personalizada ya no asume que `detail` es string antes de llamar `toLowerCase()`.
- `docs/test_suite.py`: nuevo `TC-035B` para rechazo personalizado con `guest_count=0`.

## Validaciones

- Build local frontend: OK.
- `py -m py_compile api/schemas.py api/guests.py`: OK.
- Deploy Pi: API y frontend reconstruidos y healthy.
- Suite Pi: `57/57` OK contra `http://localhost:5176/api`.
- Prueba directa en evento real `boda-conce-eume`:
  - Invitado temporal confirmando: `201`, status `partial`, confirmed `1`.
  - Invitado temporal rechazando: `201`, status `declined`, confirmed `0`.
  - Invitados temporales eliminados al finalizar.

## Resultado

El error al rechazar queda corregido en backend y el frontend queda blindado para no romper la pagina cuando el API devuelva errores estructurados.

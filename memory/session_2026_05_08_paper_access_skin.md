# Session 2026-05-08 - Paper Access skin implementation

## Scope

Implemented the new `paper-access` invitation format based on the previously analyzed `docs/example2` reference.

## Decisions

- `paper-access` is a new first-class `InvitationSkin`, alongside `classic` and `envelope`.
- The implementation reuses existing Eventique contracts: dynamic event config, guest personalization, RSVP, music, venues, gift registry/bank gift, countdown, footer, and admin persistence.
- The reference screenshots/video remain inspiration only; no source frame or video asset was shipped as production material.
- New palette `paper-olive` is the recommended visual companion for the new format.

## New configuration surface

All Paper Access visible copy is configurable through event config:

- `paper_access_intro_label`
- `paper_access_intro_text`
- `paper_access_tap_label`
- `paper_access_guest_label`
- `paper_access_passes_label`
- `paper_music_prompt`
- `paper_music_button_label`
- `paper_parents_intro`
- `paper_calendar_title`
- `paper_calendar_button_label`
- `paper_venues_title`
- `paper_location_button_label`
- `paper_gift_intro`
- `paper_countdown_title`
- `paper_countdown_subtitle`
- `paper_countdown_days_label`
- `paper_countdown_hours_label`
- `paper_countdown_minutes_label`
- `paper_rsvp_title`

## Files changed

- `frontend/src/types/index.ts`: added `paper-access`, `paper-olive`, and Paper Access config fields.
- `frontend/src/config/wedding.ts`: added default values for all Paper Access fields.
- `frontend/src/lib/mergeConfig.ts`: added explicit DB-to-runtime merge for every Paper Access field.
- `frontend/src/lib/theme.ts`: added `paper-olive` palette.
- `frontend/src/pages/AdminPage.tsx`: added Paper Access skin selector and full field editor in Secciones tab.
- `frontend/src/pages/InvitationPage.tsx`: routed `paper-access` to the new skin.
- `frontend/src/sections/PaperAccessSkin.tsx`: new mobile-first paper/card invitation format.
- `docs/test_suite.py`: added `TC-020A` round-trip coverage for Paper Access config and `paper-olive`.

## Validation

- Local frontend build: `npm run build` passed.
- Python syntax validation: `py -3 -m py_compile docs/test_suite.py` passed.
- Deployed frontend and updated test suite to `eudavalos@raspberrypi`.
- Raspberry Pi Docker frontend rebuild completed successfully.
- Production functional suite via `http://localhost:5176/api`: 56/56 tests passed, 100% score.

## Operational note

The current production event was not forcibly switched to `paper-access`; the new format is available as a configurable option in Admin -> Secciones -> Skin de Invitacion.


# Session 2026-05-08 - Example2 reference analysis

## Scope

User requested exhaustive inspection of `D:/Proyectos/Eventos/Boda/docs/example2` to continue the current Eventique work.

## Files inspected

- `docs/example2/alignment.json`
- `docs/example2/transcript.txt`
- `docs/example2/transcript.srt`
- `docs/example2/frames/frame_000001_000000.jpg` through `frame_000015_000028.jpg`
- `docs/example2/<Canva invitation template video>.mp4`

## Technical findings

- Reference package contains one vertical MP4 and 15 extracted JPG frames.
- Video stream: H.264, 576x1024, 30 fps, about 30.2 seconds.
- Audio stream: AAC, about 30.3 seconds.
- Extracted frames: 1280x2276 JPG, every 2 seconds from 0s to 28s.
- Transcript is not useful for product requirements: only "It's so easy." from 00:00:02.060 to 00:00:03.060.
- `alignment.json` maps every frame to the same transcript segment by nearest strategy; visual frame inspection is the reliable source.

## Visual/product analysis

The reference is a mobile-first wedding invitation template shown inside an iPhone/Safari recording. It resembles a Canva/editable template from `invite.amoreaestudio.com`.

Primary aesthetic:

- Off-white/paper background.
- Olive/dark green accents.
- Elegant serif typography for headings.
- Script typography for couple names, prompts, and decorative labels.
- White calla lilies/floral cutouts.
- Paper cards, envelopes, stickers, vellum-like overlays, and soft shadows.
- 9:16 vertical long-scroll layout.

Detected sections:

- Access/hero card with couple names, city/date, dark olive envelope, tap prompt, personalized guest name, and reserved passes.
- Envelope opening sequence with photo card reveal.
- Music prompt: "Dale play para escuchar nuestra cancion" with minimal playback controls.
- Formal invitation card with parents/company text.
- Date card and "Anadelo a tu Calendario" badge.
- Ceremony and reception venue cards with location buttons.
- Dress code area: "Formal de noche", suit/dress line art, scalloped olive sticker.
- Gifts card with gift-list button.
- Countdown: large numbers for days/hours/minutes and "Para nuestro gran dia".
- RSVP confirmation card inside a green envelope with "Llena el formulario" button.

## Implementation implications

- Treat `docs/example2` as visual/reference material only. Do not reuse screenshots/video as production assets unless the owner confirms licensing.
- Best implementation path is a new skin or variant, not a replacement for the current invitation logic.
- Candidate skin name: `paper-access` or `canva-floral`.
- Reuse existing Eventique capabilities: personalized guest data, allowed passes, music, venues, calendar link, gift registry, countdown, RSVP.
- New work should be mostly presentation/components/CSS rather than backend changes.
- Continue using `useConfig()` and dynamic configuration. No hardcoded client text.

## Recommended next phase

Create a new mobile-first skin inspired by this reference:

1. Add skin option in admin/theme selection.
2. Build paper-card sections using existing config fields.
3. Add envelope/opening hero interaction for access prompt.
4. Add styled section variants for music, parents text, calendar, venue cards, dress code, gifts, countdown, and RSVP.
5. Use locally generated or owned floral/paper assets, not the source video frames.

## Validation performed

- Directory inventory completed.
- Transcript and alignment reviewed.
- MP4 metadata inspected.
- Contact sheet generated locally for visual sequence review.
- Key individual frames opened and analyzed.

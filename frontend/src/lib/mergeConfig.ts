import type { WeddingConfig, EventConfig, EventType } from '../types';

export const EVENT_TYPE_SECTION_LABELS: Record<EventType, {
  storyTitle: string; scheduleTitle: string; faqTitle: string;
  venuesTitle: string; weddingPartyTitle: string;
}> = {
  boda:               { storyTitle: 'Nuestra Historia',  scheduleTitle: 'Cronograma',           faqTitle: 'Preguntas Frecuentes', venuesTitle: 'Los Recintos',  weddingPartyTitle: 'Cortejo Nupcial'        },
  cumpleanos:         { storyTitle: 'Nuestra Historia',  scheduleTitle: 'Programa del Día',     faqTitle: 'Preguntas Frecuentes', venuesTitle: 'El Lugar',      weddingPartyTitle: 'Quienes Estarán'        },
  bautismo:           { storyTitle: 'Nuestra Historia',  scheduleTitle: 'Programa',             faqTitle: 'Preguntas Frecuentes', venuesTitle: 'Los Recintos',  weddingPartyTitle: 'Padrinos y Familia'     },
  quinceanera:        { storyTitle: 'Mi Historia',       scheduleTitle: 'Programa de la Noche', faqTitle: 'Preguntas Frecuentes', venuesTitle: 'El Salón',      weddingPartyTitle: 'Chambelanes y Damas'    },
  graduacion:         { storyTitle: 'Mi Trayectoria',    scheduleTitle: 'Programa',             faqTitle: 'Preguntas Frecuentes', venuesTitle: 'El Lugar',      weddingPartyTitle: 'Invitados de Honor'     },
  corporativo:        { storyTitle: 'Sobre el Evento',   scheduleTitle: 'Agenda',               faqTitle: 'Preguntas Frecuentes', venuesTitle: 'La Sede',       weddingPartyTitle: 'Participantes'          },
  'primera-comunion': { storyTitle: 'Su Historia',       scheduleTitle: 'Programa',             faqTitle: 'Preguntas Frecuentes', venuesTitle: 'Los Recintos',  weddingPartyTitle: 'Padrinos y Familia'     },
  aniversario:        { storyTitle: 'Nuestra Historia',  scheduleTitle: 'Itinerario',           faqTitle: 'Preguntas Frecuentes', venuesTitle: 'El Lugar',      weddingPartyTitle: 'Quienes Nos Acompañan'  },
  'baby-shower':      { storyTitle: 'Nuestra Historia',  scheduleTitle: 'Programa del Evento',  faqTitle: 'Preguntas Frecuentes', venuesTitle: 'El Lugar',      weddingPartyTitle: 'Organizadoras'          },
};

export function mergeConfig(base: WeddingConfig, dynamic: Partial<EventConfig>): WeddingConfig {
  const typeLabels = dynamic.event_type ? EVENT_TYPE_SECTION_LABELS[dynamic.event_type] : null;
  const baseSections = { ...base.sections };
  const dynamicSections = (dynamic.sections && typeof dynamic.sections === 'object') ? dynamic.sections : {};

  if (typeLabels?.storyTitle && !dynamicSections?.ourStory?.title) {
    baseSections.ourStory = { ...baseSections.ourStory, title: typeLabels.storyTitle };
  }
  if (typeLabels?.scheduleTitle && !dynamicSections?.schedule?.title) {
    baseSections.schedule = { ...baseSections.schedule, title: typeLabels.scheduleTitle };
  }
  if (typeLabels?.faqTitle && !dynamicSections?.faq?.title) {
    baseSections.faq = { ...baseSections.faq, title: typeLabels.faqTitle };
  }
  if (typeLabels?.weddingPartyTitle && !dynamicSections?.weddingParty?.title) {
    baseSections.weddingParty = { ...baseSections.weddingParty, title: typeLabels.weddingPartyTitle };
  }

  const mergedSections = { ...baseSections };
  for (const key of Object.keys(dynamicSections) as Array<keyof typeof baseSections>) {
    const dynVal = dynamicSections[key];
    if (dynVal !== undefined && typeof dynVal === 'object' && !Array.isArray(dynVal)) {
      (mergedSections as Record<string, unknown>)[key] = {
        ...(baseSections[key] as object ?? {}),
        ...dynVal,
      };
    }
  }

  const dynamicVenues = dynamic.venues;
  const mergedVenues = (dynamicVenues && !Array.isArray(dynamicVenues))
    ? dynamicVenues
    : base.venues;

  const mergedCouple = {
    ...base.couple,
    ...(dynamic.couple ?? {}),
    person1: { ...base.couple.person1, ...(dynamic.couple?.person1 ?? {}) },
    person2: { ...base.couple.person2, ...(dynamic.couple?.person2 ?? {}) },
  };

  const dyn = dynamic as Record<string, unknown>;
  return {
    ...base,
    couple: mergedCouple,
    dates: dynamic.dates ? { ...base.dates, ...dynamic.dates } : base.dates,
    venues: mergedVenues,
    theme: {
      ...base.theme,
      palette: dynamic.theme?.palette ?? base.theme.palette,
      customColors: dynamic.theme?.customColors ?? base.theme.customColors,
    },
    sections: mergedSections,
    social: dynamic.social ?? base.social,
    music: dynamic.music ?? base.music,
    venuesTitle: typeLabels?.venuesTitle ?? base.venuesTitle ?? 'Los Recintos',
    gift_registry_enabled: (dyn.gift_registry_enabled as boolean | undefined) ?? base.gift_registry_enabled ?? true,
    gift_registry_url: (dyn.gift_registry_url as string | undefined) ?? base.gift_registry_url,
    gift_registry_label: (dyn.gift_registry_label as string | undefined) ?? base.gift_registry_label,
    gift_registry_title: (dyn.gift_registry_title as string | undefined) ?? base.gift_registry_title,
    gift_registry_description: (dyn.gift_registry_description as string | undefined) ?? base.gift_registry_description,
    gift_bank_enabled: (dyn.gift_bank_enabled as boolean | undefined) ?? base.gift_bank_enabled ?? false,
    gift_bank_title: (dyn.gift_bank_title as string | undefined) ?? base.gift_bank_title,
    gift_bank_body: (dyn.gift_bank_body as string | undefined) ?? base.gift_bank_body,
    gift_bank_accounts: (dyn.gift_bank_accounts as WeddingConfig['gift_bank_accounts']) ?? base.gift_bank_accounts,
    personalized_full_view:           (dyn.personalized_full_view as boolean | undefined)          ?? base.personalized_full_view,
    personalized_hero_badge_enabled:  (dyn.personalized_hero_badge_enabled as boolean | undefined) ?? base.personalized_hero_badge_enabled,
    personalized_hero_badge_label:    (dyn.personalized_hero_badge_label as string | undefined)    ?? base.personalized_hero_badge_label,
    personalized_greeting_enabled:    (dyn.personalized_greeting_enabled as boolean | undefined)   ?? base.personalized_greeting_enabled,
    personalized_greeting_position:   (dyn.personalized_greeting_position as WeddingConfig['personalized_greeting_position']) ?? base.personalized_greeting_position,
    personalized_greeting_title:      (dyn.personalized_greeting_title as string | undefined)      ?? base.personalized_greeting_title,
    personalized_greeting_body:       (dyn.personalized_greeting_body as string | undefined)       ?? base.personalized_greeting_body,
    personalized_show_passes:         (dyn.personalized_show_passes as boolean | undefined)        ?? base.personalized_show_passes,
    personalized_passes_label:        (dyn.personalized_passes_label as string | undefined)        ?? base.personalized_passes_label,
    personalized_show_type_badge:     (dyn.personalized_show_type_badge as boolean | undefined)    ?? base.personalized_show_type_badge,
    personalized_show_countdown:      (dyn.personalized_show_countdown as boolean | undefined)     ?? base.personalized_show_countdown,
    personalized_countdown_label:     (dyn.personalized_countdown_label as string | undefined)     ?? base.personalized_countdown_label,
    conditional_flag_meta:            (dyn.conditional_flag_meta as WeddingConfig['conditional_flag_meta']) ?? base.conditional_flag_meta,
    personalized_rsvp_step1_title:            (dyn.personalized_rsvp_step1_title as string | undefined)            ?? base.personalized_rsvp_step1_title,
    personalized_rsvp_step2_attending_title:  (dyn.personalized_rsvp_step2_attending_title as string | undefined)  ?? base.personalized_rsvp_step2_attending_title,
    personalized_rsvp_step2_declined_title:   (dyn.personalized_rsvp_step2_declined_title as string | undefined)   ?? base.personalized_rsvp_step2_declined_title,
    personalized_rsvp_step2_declined_body:    (dyn.personalized_rsvp_step2_declined_body as string | undefined)    ?? base.personalized_rsvp_step2_declined_body,
    personalized_rsvp_step3_title:            (dyn.personalized_rsvp_step3_title as string | undefined)            ?? base.personalized_rsvp_step3_title,
    personalized_rsvp_confirmed_title:        (dyn.personalized_rsvp_confirmed_title as string | undefined)        ?? base.personalized_rsvp_confirmed_title,
    personalized_rsvp_confirmed_body_attending: (dyn.personalized_rsvp_confirmed_body_attending as string | undefined) ?? base.personalized_rsvp_confirmed_body_attending,
    personalized_rsvp_confirmed_body_declined:  (dyn.personalized_rsvp_confirmed_body_declined as string | undefined)  ?? base.personalized_rsvp_confirmed_body_declined,
    invitation_skin:              (dyn.invitation_skin as WeddingConfig['invitation_skin']) ?? base.invitation_skin ?? 'classic',
    envelope_opening_text:        (dyn.envelope_opening_text as string | undefined)        ?? base.envelope_opening_text,
    envelope_tap_label:           (dyn.envelope_tap_label as string | undefined)           ?? base.envelope_tap_label,
    collage_countdown_label:      (dyn.collage_countdown_label as string | undefined)      ?? base.collage_countdown_label,
    collage_subtitle:             (dyn.collage_subtitle as string | undefined)             ?? base.collage_subtitle,
    collage_monogram_separator:   (dyn.collage_monogram_separator as string | undefined)   ?? base.collage_monogram_separator,
    venues_ceremony_label:        (dyn.venues_ceremony_label as string | undefined)        ?? base.venues_ceremony_label,
    venues_reception_label:       (dyn.venues_reception_label as string | undefined)       ?? base.venues_reception_label,
    venues_ceremony_icon:         (dyn.venues_ceremony_icon as string | undefined)         ?? base.venues_ceremony_icon,
    venues_reception_icon:        (dyn.venues_reception_icon as string | undefined)        ?? base.venues_reception_icon,
    dress_code_enabled:           (dyn.dress_code_enabled as boolean | undefined)          ?? base.dress_code_enabled ?? true,
    dress_code_title:             (dyn.dress_code_title as string | undefined)             ?? base.dress_code_title,
    dress_code_value:             (dyn.dress_code_value as string | undefined)             ?? base.dress_code_value,
    gallery_polaroid_enabled:     (dyn.gallery_polaroid_enabled as boolean | undefined)    ?? base.gallery_polaroid_enabled ?? true,
    gallery_polaroid_footer_text: (dyn.gallery_polaroid_footer_text as string | undefined) ?? base.gallery_polaroid_footer_text,
    gallery_polaroid_bw:          (dyn.gallery_polaroid_bw as boolean | undefined)         ?? base.gallery_polaroid_bw ?? true,
  };
}

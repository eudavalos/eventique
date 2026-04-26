import type { PaletteKey } from '../types';
import type { EventType } from '../types';

export const palettesByEventType: Record<EventType, PaletteKey[]> = {
  boda:             ['rose-gold', 'burgundy', 'gold-premium', 'cream', 'sage', 'navy-gold', 'lavender'],
  cumpleanos:       ['coral', 'peach', 'teal', 'lavender', 'emerald', 'sapphire'],
  bautismo:         ['mint', 'lavender', 'sage', 'cream', 'ocean', 'navy-gold', 'rose-gold'],
  quinceanera:      ['lavender', 'peach', 'rose-gold', 'burgundy', 'coral', 'gold-premium'],
  graduacion:       ['sapphire', 'denim', 'navy-gold', 'platinum', 'ocean', 'emerald'],
  corporativo:      ['platinum', 'denim', 'sapphire', 'navy-gold', 'ocean', 'teal', 'emerald'],
  'primera-comunion': ['mint', 'cream', 'lavender', 'sage', 'rose-gold', 'ocean'],
  aniversario:      ['gold-premium', 'burgundy', 'rose-gold', 'mustard', 'midnight', 'navy-gold'],
  'baby-shower':    ['mint', 'peach', 'lavender', 'coral', 'cream', 'sage'],
};

export function getRecommendedPalettes(eventType: EventType): PaletteKey[] {
  return palettesByEventType[eventType] || ['nature', 'rose-gold', 'navy-gold'];
}

export function getDefaultPaletteForEventType(eventType: EventType): PaletteKey {
  const recommended = getRecommendedPalettes(eventType);
  return recommended[0];
}

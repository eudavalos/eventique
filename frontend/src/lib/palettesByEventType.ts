import type { PaletteKey } from '../types';
import type { EventType } from '../types';

export const palettesByEventType: Record<EventType, PaletteKey[]> = {
  boda: ['rose-gold', 'burgundy', 'gold-premium', 'sage', 'navy-gold', 'lavender'],
  cumpleanos: ['coral', 'teal', 'lavender', 'emerald', 'sapphire'],
  bautismo: ['lavender', 'sage', 'ocean', 'navy-gold', 'rose-gold'],
  quinceanera: ['lavender', 'rose-gold', 'burgundy', 'coral', 'gold-premium'],
  graduacion: ['sapphire', 'navy-gold', 'platinum', 'ocean', 'emerald'],
  corporativo: ['platinum', 'sapphire', 'navy-gold', 'ocean', 'teal', 'emerald'],
};

export function getRecommendedPalettes(eventType: EventType): PaletteKey[] {
  return palettesByEventType[eventType] || ['nature', 'rose-gold', 'navy-gold'];
}

export function getDefaultPaletteForEventType(eventType: EventType): PaletteKey {
  const recommended = getRecommendedPalettes(eventType);
  return recommended[0];
}

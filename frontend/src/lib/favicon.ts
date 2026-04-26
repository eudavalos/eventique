import type { EventType } from '../types';

const FAVICON_MAP: Record<string, string> = {
  boda:        '/favicon-boda.svg',
  cumpleanos:  '/favicon-cumpleanos.svg',
  cumpleaños:  '/favicon-cumpleanos.svg',
  bautismo:    '/favicon-bautismo.svg',
  quinceanera: '/favicon-quinceanera.svg',
  quinceañera: '/favicon-quinceanera.svg',
  graduacion:  '/favicon-graduacion.svg',
  graduación:  '/favicon-graduacion.svg',
  corporativo: '/favicon-corporativo.svg',
};

// Normalize accented chars so DB values ("cumpleaños") match map keys
function normalizeType(t: string): string {
  return t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function setFavicon(eventType: EventType | string): void {
  const key = normalizeType(eventType);
  const href = FAVICON_MAP[eventType] ?? FAVICON_MAP[key] ?? '/favicon.svg';
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = href;
}

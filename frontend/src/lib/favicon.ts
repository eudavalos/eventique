import type { EventType } from '../types';

const FAVICON_MAP: Record<EventType, string> = {
  boda: '/favicon-boda.svg',
  cumpleanos: '/favicon-cumpleanos.svg',
  bautismo: '/favicon-bautismo.svg',
  quinceanera: '/favicon-quinceanera.svg',
  graduacion: '/favicon-graduacion.svg',
  corporativo: '/favicon-corporativo.svg',
};

export function setFavicon(eventType: EventType): void {
  const href = FAVICON_MAP[eventType] ?? '/favicon.svg';
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    document.head.appendChild(link);
  }
  link.href = href;
}

import { format, differenceInSeconds, parseISO } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import type { Language } from '../types';

export function formatDisplayDate(isoDate: string, lang: Language = 'es'): string {
  return format(parseISO(isoDate), "EEEE, d 'de' MMMM 'de' yyyy", {
    locale: lang === 'es' ? es : enUS,
  });
}

export function getCountdown(targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
} {
  const target = parseISO(targetDate);
  const now = new Date();
  const total = differenceInSeconds(target, now);

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return { days, hours, minutes, seconds, expired: false };
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

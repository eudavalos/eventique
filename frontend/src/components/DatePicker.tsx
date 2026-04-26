import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';

type Mode = 'date' | 'datetime';

interface DatePickerProps {
  value: string;
  onChange: (next: string) => void;
  mode?: Mode;
  /**
   * Output format for the persisted string (date-fns tokens, Spanish locale).
   * If omitted, the picker stores ISO `yyyy-MM-dd` (date) or
   * `yyyy-MM-dd'T'HH:mm:ss` (datetime). Use this when you want to store and
   * display the value in a human-friendly Spanish format such as
   * "EEEE, d 'de' MMMM 'de' yyyy" → "Sábado, 5 de Diciembre de 2026".
   */
  outputFormat?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

const DATE_FMT = 'yyyy-MM-dd';
const DATETIME_FMT = "yyyy-MM-dd'T'HH:mm:ss";

function tryParse(value: string, mode: Mode, outputFormat?: string): Date | null {
  if (!value) return null;
  const base =
    mode === 'datetime'
      ? [DATETIME_FMT, "yyyy-MM-dd'T'HH:mm", DATE_FMT]
      : [DATE_FMT, DATETIME_FMT, "yyyy-MM-dd'T'HH:mm"];
  const fmts = outputFormat ? [outputFormat, ...base] : base;
  for (const fmt of fmts) {
    const parsed = parse(value, fmt, new Date(), { locale: es });
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatLabel(date: Date | null, mode: Mode, outputFormat?: string): string {
  if (!date) return '';
  if (outputFormat) return format(date, outputFormat, { locale: es });
  return mode === 'datetime'
    ? format(date, "EEEE, d 'de' MMMM 'de' yyyy · HH:mm", { locale: es })
    : format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

export function DatePicker({
  value,
  onChange,
  mode = 'date',
  outputFormat,
  placeholder,
  className = '',
  id,
}: DatePickerProps) {
  const initial = useMemo(() => tryParse(value, mode, outputFormat), [value, mode, outputFormat]);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(initial ?? new Date());
  const [hour, setHour] = useState<string>(initial ? format(initial, 'HH') : '12');
  const [minute, setMinute] = useState<string>(initial ? format(initial, 'mm') : '00');
  const [isAbove, setIsAbove] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    // Check if picker fits below, else position above
    const checkPosition = () => {
      if (containerRef.current && pickerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const pickerHeight = 400; // Approximate height
        const spaceBelow = window.innerHeight - rect.bottom;
        setIsAbove(spaceBelow < pickerHeight + 20);
      }
    };
    setTimeout(checkPosition, 0);

    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    const parsed = tryParse(value, mode, outputFormat);
    if (parsed) {
      setView((prev) => (isSameMonth(prev, parsed) ? prev : parsed));
      setHour(format(parsed, 'HH'));
      setMinute(format(parsed, 'mm'));
    }
  }, [value, mode, outputFormat]);

  const selected = initial;

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(view), { locale: es });
    const end = endOfWeek(endOfMonth(view), { locale: es });
    const out: Date[] = [];
    let cur = start;
    while (cur <= end) {
      out.push(cur);
      cur = new Date(cur.getTime() + 24 * 60 * 60 * 1000);
    }
    return out;
  }, [view]);

  const weekdayHeaders = useMemo(() => {
    const start = startOfWeek(new Date(), { locale: es });
    return Array.from({ length: 7 }, (_, i) =>
      format(new Date(start.getTime() + i * 24 * 60 * 60 * 1000), 'EEEEEE', { locale: es }),
    );
  }, []);

  const commit = (d: Date, h: string, m: string) => {
    if (mode === 'datetime') {
      const hh = Number.isFinite(Number(h)) ? Math.min(23, Math.max(0, Number(h))) : 0;
      const mm = Number.isFinite(Number(m)) ? Math.min(59, Math.max(0, Number(m))) : 0;
      const next = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hh, mm, 0, 0);
      onChange(format(next, outputFormat ?? DATETIME_FMT, { locale: es }));
    } else {
      onChange(format(d, outputFormat ?? DATE_FMT, { locale: es }));
    }
  };

  const handleDayClick = (d: Date) => {
    commit(d, hour, minute);
    if (mode === 'date') setOpen(false);
  };

  const handleTimeChange = (next: { h?: string; m?: string }) => {
    const h = next.h ?? hour;
    const m = next.m ?? minute;
    if (next.h !== undefined) setHour(next.h);
    if (next.m !== undefined) setMinute(next.m);
    if (selected) commit(selected, h, m);
  };

  const placeholderText =
    placeholder ?? (mode === 'datetime' ? 'Seleccionar fecha y hora' : 'Seleccionar fecha');

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="input-field text-left flex items-center justify-between gap-2"
      >
        <span
          className="truncate capitalize"
          style={{ color: selected ? 'var(--color-text)' : 'var(--color-text-muted)' }}
        >
          {selected ? formatLabel(selected, mode, outputFormat) : placeholderText}
        </span>
        <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      </button>

      {open && (
        <div
          ref={pickerRef}
          className="absolute w-[19rem] rounded-2xl shadow-xl p-4"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
            zIndex: 9999,
            top: isAbove ? 'auto' : undefined,
            bottom: isAbove ? 'calc(100% + 8px)' : undefined,
            marginTop: isAbove ? undefined : '8px',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setView((v) => addMonths(v, -1))}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span
              className="font-sub text-sm font-medium capitalize"
              style={{ color: 'var(--color-text)' }}
            >
              {format(view, 'MMMM yyyy', { locale: es })}
            </span>
            <button
              type="button"
              onClick={() => setView((v) => addMonths(v, 1))}
              className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {weekdayHeaders.map((d) => (
              <div
                key={d}
                className="text-[0.65rem] tracking-widest uppercase text-center font-body font-medium"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((d) => {
              const inMonth = isSameMonth(d, view);
              const isSelected = selected ? isSameDay(d, selected) : false;
              const isToday = isSameDay(d, new Date());
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  className="h-8 rounded-lg text-sm font-body transition-colors"
                  style={{
                    background: isSelected ? 'var(--color-primary)' : 'transparent',
                    color: isSelected
                      ? 'white'
                      : inMonth
                      ? 'var(--color-text)'
                      : 'var(--color-text-muted)',
                    opacity: inMonth ? 1 : 0.45,
                    border: isToday && !isSelected ? '1px solid var(--color-primary)' : '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-primary) 12%, transparent)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  {format(d, 'd')}
                </button>
              );
            })}
          </div>

          {mode === 'datetime' && (
            <div
              className="mt-4 pt-3 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <Clock className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => handleTimeChange({ h: e.target.value.padStart(2, '0').slice(-2) })}
                className="input-field !py-2 !px-3 w-16 text-center"
                aria-label="Hora"
              />
              <span style={{ color: 'var(--color-text-muted)' }}>:</span>
              <input
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => handleTimeChange({ m: e.target.value.padStart(2, '0').slice(-2) })}
                className="input-field !py-2 !px-3 w-16 text-center"
                aria-label="Minutos"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto btn-outline !py-1.5 !px-3 text-xs"
              >
                Listo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface TimePickerProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}

export function TimePicker({ value, onChange, placeholder, className = '' }: TimePickerProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field pr-10"
        placeholder={placeholder}
      />
      <Clock
        className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: 'var(--color-text-muted)' }}
      />
    </div>
  );
}

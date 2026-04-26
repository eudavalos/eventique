import { motion } from 'framer-motion';
import { useCountdown } from '../hooks/useCountdown';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentFloral } from '../components/Ornament';
import { pad } from '../lib/utils';

const units = [
  { key: 'days' as const, label: 'Días', labelEn: 'Days' },
  { key: 'hours' as const, label: 'Horas', labelEn: 'Hours' },
  { key: 'minutes' as const, label: 'Min', labelEn: 'Min' },
  { key: 'seconds' as const, label: 'Seg', labelEn: 'Sec' },
];

export default function Countdown() {
  const config = useConfig();
  const { dates, sections } = config;
  const countdown = useCountdown(dates.ceremony);
  const label = sections.countdown.label ?? 'Faltan para el gran día';
  const lang = config.theme.language;

  return (
    <div className="section-padding relative overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
      {/* Background ornament */}
      <OrnamentFloral
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30"
        size={300}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <AnimatedSection>
          <p className="text-xs tracking-[0.3em] uppercase font-body font-medium mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </p>
          <p className="font-heading text-4xl sm:text-5xl font-light mb-3" style={{ color: 'var(--color-text)' }}>
            {dates.displayDate ?? dates.ceremony.slice(0, 10)}
          </p>

          <OrnamentDivider className="max-w-xs mx-auto" />
        </AnimatedSection>

        {countdown.expired ? (
          <AnimatedSection delay={0.2}>
            <p className="font-heading text-3xl" style={{ color: 'var(--color-primary)' }}>
              ¡Hoy es el gran día! 🎉
            </p>
          </AnimatedSection>
        ) : (
          <div className="grid grid-cols-4 gap-3 sm:gap-6 mt-8 max-w-2xl mx-auto">
            {units.map(({ key, label: lbl, labelEn }, i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-full aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                  }}
                >
                  {/* Accent top line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--color-accent)' }}
                  />
                  <motion.span
                    key={countdown[key]}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="font-heading font-light leading-none"
                    style={{
                      fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {pad(countdown[key])}
                  </motion.span>
                </div>
                <span
                  className="mt-3 text-xs tracking-[0.2em] uppercase font-body font-medium"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {lang === 'es' ? lbl : labelEn}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

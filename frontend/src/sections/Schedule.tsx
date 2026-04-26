import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';

const locationColors: Record<string, string> = {
  ceremony: 'var(--color-primary)',
  reception: 'var(--color-accent)',
  other: 'var(--color-text-muted)',
};

const locationLabels: Record<string, string> = {
  ceremony: 'Ceremonia',
  reception: 'Recepción',
  other: '',
};

export default function Schedule() {
  const config = useConfig();
  const { schedule } = config.sections;
  const title = schedule.title ?? 'Itinerario del Día';

  if (!schedule.items || schedule.items.length === 0) {
    return null;
  }

  return (
    <div className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
        </AnimatedSection>

        <div className="relative">
          {/* Vertical guide line */}
          <div
            className="absolute left-[calc(7rem+1px)] top-0 bottom-0 w-px hidden sm:block"
            style={{ background: 'linear-gradient(to bottom, var(--color-primary), transparent)' }}
          />

          <div className="space-y-0">
            {schedule.items.map((item, i) => {
              const color = locationColors[item.location ?? 'other'] ?? 'var(--color-text-muted)';
              const locationLabel = locationLabels[item.location ?? 'other'] ?? '';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex gap-4 sm:gap-8 group"
                >
                  {/* Time */}
                  <div className="w-24 flex-shrink-0 text-right pt-1 hidden sm:block">
                    <span className="font-body text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {item.time}
                    </span>
                  </div>

                  {/* Dot */}
                  <div className="relative flex-shrink-0 flex flex-col items-center hidden sm:flex">
                    <div
                      className="w-3 h-3 rounded-full mt-1.5 z-10 transition-transform duration-300 group-hover:scale-125"
                      style={{ background: color, boxShadow: `0 0 0 3px var(--color-bg)` }}
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 pb-8 border-b last:border-0"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    {/* Mobile time */}
                    <div className="flex items-center gap-2 sm:hidden mb-1">
                      <Clock className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                      <span className="font-body text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {item.time}
                      </span>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-sub text-base sm:text-lg font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="font-body text-sm font-light" style={{ color: 'var(--color-text-muted)' }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      {locationLabel && (
                        <span
                          className="flex-shrink-0 ml-4 text-xs tracking-wide px-2.5 py-1 rounded-full font-body font-medium border"
                          style={{ borderColor: color, color }}
                        >
                          {locationLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

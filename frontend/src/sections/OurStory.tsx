import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentBranch } from '../components/Ornament';
import { useInView } from '../hooks/useInView';

function TimelineEntry({
  event,
  index,
  total,
}: {
  event: { date: string; title: string; description: string; photo?: string };
  index: number;
  total: number;
}) {
  const [ref, inView] = useInView<HTMLDivElement>(0.15);
  const isLast = index === total - 1;

  return (
    <div ref={ref} className="relative flex gap-6 sm:gap-10">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center flex-shrink-0">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : { scale: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 relative z-10"
          style={{
            borderColor: 'var(--color-primary)',
            background: 'var(--color-surface)',
          }}
        >
          <div
            className="absolute inset-1 rounded-full"
            style={{ background: 'var(--color-primary)' }}
          />
        </motion.div>
        {!isLast && (
          <motion.div
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex-1 w-px mt-2"
            style={{
              background: 'linear-gradient(to bottom, var(--color-primary), transparent)',
              transformOrigin: 'top',
              minHeight: '60px',
            }}
          />
        )}
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -24 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="pb-12 flex-1"
      >
        <p
          className="text-xs tracking-[0.2em] uppercase font-body font-medium mb-1"
          style={{ color: 'var(--color-accent)' }}
        >
          {event.date}
        </p>
        <h3
          className="font-heading text-2xl sm:text-3xl font-light mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          {event.title}
        </h3>
        {event.photo && (
          <div className="rounded-2xl overflow-hidden mb-4 aspect-video max-w-md">
            <img
              src={event.photo}
              alt={event.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
        )}
        <p className="font-body font-light leading-relaxed text-sm sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
          {event.description}
        </p>
      </motion.div>
    </div>
  );
}

export default function OurStory() {
  const config = useConfig();
  const { ourStory } = config.sections;
  const title = ourStory.title ?? 'Nuestra Historia';
  const subtitle = ourStory.subtitle;

  return (
    <div className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-3xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <OrnamentBranch className="mx-auto mb-6" />
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          <OrnamentDivider />
        </AnimatedSection>

        <div>
          {ourStory.events.map((event, i) => (
            <TimelineEntry
              key={i}
              event={event}
              index={i}
              total={ourStory.events.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

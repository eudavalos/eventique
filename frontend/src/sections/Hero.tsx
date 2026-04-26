import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { OrnamentRings } from '../components/Ornament';

export default function Hero() {
  const config = useConfig();
  const { couple, dates, sections } = config;
  const { hero } = sections;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;
  const overlayOpacity = hero.overlayOpacity ?? 0.45;

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 120]);
  const textY = useTransform(scrollY, [0, 400], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  const handleScroll = () => {
    const next = document.getElementById('countdown') ?? document.querySelector('section:nth-child(2)');
    next?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative h-screen min-h-[600px] overflow-hidden flex items-center justify-center">
      {/* Background image with parallax */}
      <motion.div
        className="absolute inset-0 bg-center bg-cover"
        style={{
          backgroundImage: hero.backgroundImage
            ? `url(${hero.backgroundImage})`
            : 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 50%, var(--color-accent) 100%)',
          y: bgY,
          scale: 1.15,
        }}
      />

      {/* Color overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `rgba(0,0,0,${overlayOpacity})` }}
      />

      {/* Subtle gradient vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.3) 100%)',
        }}
      />

      {/* Content */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 text-center px-6 max-w-3xl mx-auto"
      >
        {/* Parents line */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white/70 mb-6 font-body font-light"
        >
          {couple.person1.parents && couple.person2.parents
            ? `${couple.person1.parents} · ${couple.person2.parents}`
            : hero.subtitle ?? ''}
        </motion.p>

        {/* Subtitle */}
        {hero.subtitle && !(couple.person1.parents && couple.person2.parents) && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-sm tracking-[0.25em] uppercase text-white/70 mb-6 font-body font-light"
          >
            {hero.subtitle}
          </motion.p>
        )}

        {/* Rings ornament */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex justify-center mb-6"
        >
          <OrnamentRings color="rgba(255,255,255,0.5)" size={28} />
        </motion.div>

        {/* Couple names */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-light text-white leading-none mb-6"
          style={{ fontSize: 'clamp(3rem, 10vw, 6.5rem)', letterSpacing: '0.06em' }}
        >
          {names}
        </motion.h1>

        {/* Thin horizontal rule with diamond */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex items-center justify-center gap-4 mb-6"
        >
          <div className="h-px w-16 sm:w-24 bg-white/40" />
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 0L7.5 4.5L12 6L7.5 7.5L6 12L4.5 7.5L0 6L4.5 4.5L6 0Z" fill="rgba(255,255,255,0.7)" />
          </svg>
          <div className="h-px w-16 sm:w-24 bg-white/40" />
        </motion.div>

        {/* Date */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="font-sub text-white/85 text-lg sm:text-xl tracking-widest font-light mb-2"
        >
          {dates.displayDate ?? dates.ceremony.slice(0, 10)}
        </motion.p>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="font-body text-white/60 text-sm tracking-[0.2em] uppercase"
        >
          {config.venues.ceremony.city}, {config.venues.ceremony.country}
        </motion.p>

        {/* RSVP CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="mt-10"
        >
          <button
            onClick={() => document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs tracking-[0.2em] uppercase font-body font-medium transition-all duration-300"
            style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', color: 'white', border: '1px solid rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
          >
            Confirmar asistencia
          </button>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      {hero.showScrollIndicator && (
        <motion.button
          onClick={handleScroll}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
          aria-label="Siguiente sección"
        >
          <span className="text-xs tracking-[0.2em] uppercase font-body">Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.button>
      )}
    </div>
  );
}

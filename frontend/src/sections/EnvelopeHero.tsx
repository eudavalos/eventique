import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import type { WeddingConfig } from '../types';
import { FloralCardAccent, FloralDecorLayer } from '../components/RealisticFloralDecor';
import { getFloralDecorConfig } from '../lib/floralConfig';

// ── SVG: sello de cera dorado ─────────────────────────────────────────────────

function WaxSeal({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo dorado del sello */}
      <circle cx="50" cy="50" r="46" fill="url(#sealGold)" />
      {/* Borde exterior dentado */}
      <path d="M50 4 L53 14 L63 8 L61 19 L72 17 L66 26 L77 28 L68 35 L76 42 L66 44 L70 55 L60 53 L59 64 L50 59 L41 64 L40 53 L30 55 L34 44 L24 42 L32 35 L23 28 L34 26 L28 17 L39 19 L37 8 L47 14 Z" fill="url(#sealGoldDark)" opacity="0.6" />
      {/* Flor central */}
      <circle cx="50" cy="50" r="22" fill="url(#sealGoldLight)" />
      <path d="M50 32 C50 32 54 38 50 44 C46 38 50 32 50 32Z" fill="rgba(255,255,255,0.45)" />
      <path d="M50 68 C50 68 46 62 50 56 C54 62 50 68 50 68Z" fill="rgba(255,255,255,0.45)" />
      <path d="M32 50 C32 50 38 46 44 50 C38 54 32 50 32 50Z" fill="rgba(255,255,255,0.45)" />
      <path d="M68 50 C68 50 62 54 56 50 C62 46 68 50 68 50Z" fill="rgba(255,255,255,0.45)" />
      <path d="M36 36 C36 36 42 39 42 45 C38 41 36 36 36 36Z" fill="rgba(255,255,255,0.35)" />
      <path d="M64 64 C64 64 58 61 58 55 C62 59 64 64 64 64Z" fill="rgba(255,255,255,0.35)" />
      <path d="M36 64 C36 64 39 58 45 58 C41 62 36 64 36 64Z" fill="rgba(255,255,255,0.35)" />
      <path d="M64 36 C64 36 61 42 55 42 C59 38 64 36 64 36Z" fill="rgba(255,255,255,0.35)" />
      <circle cx="50" cy="50" r="9" fill="rgba(255,255,255,0.55)" />
      <circle cx="50" cy="50" r="5" fill="rgba(200,168,76,0.9)" />
      <defs>
        <radialGradient id="sealGold" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#E8C96B" />
          <stop offset="60%" stopColor="#C9A84C" />
          <stop offset="100%" stopColor="#8B6508" />
        </radialGradient>
        <radialGradient id="sealGoldDark" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#DAB84A" />
          <stop offset="100%" stopColor="#7A5500" />
        </radialGradient>
        <radialGradient id="sealGoldLight" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#F0D678" />
          <stop offset="100%" stopColor="#B8860B" />
        </radialGradient>
      </defs>
    </svg>
  );
}

// ── SVG: sobre de carta ───────────────────────────────────────────────────────

function EnvelopeSVG({ opened, color }: { opened: boolean; color: string }) {
  const config = useConfig() as WeddingConfig;
  const floral = getFloralDecorConfig(config, 'envelope_floral');

  return (
    <div className="relative w-full" style={{ maxWidth: 320 }}>
      <FloralCardAccent
        enabled={floral.enabled && floral.cardDecorEnabled}
        styleKey={floral.style}
        opacity={floral.opacity}
        corner="top-right"
        className="z-10"
      />
      <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-2xl">
        {/* Cuerpo del sobre */}
        <rect x="4" y="60" width="312" height="156" rx="8" fill={color} />
        {/* Solapa inferior (fondo) */}
        <path d="M4 68 L160 160 L316 68" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" />
        {/* Triángulos laterales internos */}
        <path d="M4 68 L4 216 L100 150 Z" fill="rgba(0,0,0,0.08)" />
        <path d="M316 68 L316 216 L220 150 Z" fill="rgba(0,0,0,0.08)" />
        {/* Solapa superior animada */}
        <motion.path
          d={opened ? "M4 60 L160 60 L316 60 Z" : "M4 60 L160 155 L316 60 Z"}
          fill={opened ? 'transparent' : color}
          animate={{ d: opened ? "M4 60 L160 0 L316 60 Z" : "M4 60 L160 155 L316 60 Z" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ filter: 'brightness(0.88)' }}
        />
        {/* Borde del sobre */}
        <rect x="4" y="60" width="312" height="156" rx="8" stroke="rgba(255,255,255,0.15)" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface EnvelopeHeroProps {
  onOpen: () => void;
}

export default function EnvelopeHero({ onOpen }: EnvelopeHeroProps) {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;
  const floral = getFloralDecorConfig(config, 'envelope_floral');
  const [opened, setOpened] = useState(false);

  const openingText  = (config.envelope_opening_text as string | undefined) ?? 'Empieza una nueva etapa en nuestras vidas';
  const tapLabel     = (config.envelope_tap_label as string | undefined) ?? 'Tocá aquí';
  const names        = config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`;
  const envelopeColor = 'var(--color-primary)';

  const handleTap = () => {
    if (opened) return;
    setOpened(true);
    setTimeout(() => onOpen(), 750);
  };

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background: `var(--color-bg)`,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
      }}
    >
      {/* Textura papel fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 80% at 50% 0%, rgba(255,255,255,0.5) 0%, transparent 60%),
            radial-gradient(ellipse 80% 60% at 0% 100%, rgba(201,168,76,0.06) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 100% 100%, rgba(201,168,76,0.04) 0%, transparent 50%)
          `,
        }}
      />

      <FloralDecorLayer
        enabled={floral.enabled}
        styleKey={floral.style}
        density={floral.density}
        opacity={floral.opacity}
        zone="hero"
      />

      {/* Texto intro */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="relative z-10 text-center px-8 mb-10"
      >
        <p
          className="font-body uppercase tracking-[0.28em] text-xs mb-4"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {openingText.split(' ').slice(0, 3).join(' ')}
        </p>
        <p
          className="font-heading font-light"
          style={{
            fontSize: 'clamp(1.1rem, 4vw, 1.5rem)',
            color: 'var(--color-text)',
            letterSpacing: '0.04em',
            lineHeight: 1.5,
            maxWidth: 320,
          }}
        >
          {openingText.split(' ').slice(3).join(' ') || openingText}
        </p>
      </motion.div>

      {/* Sobre interactivo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="relative z-10 cursor-pointer px-8"
        style={{ maxWidth: 340, width: '100%' }}
        onClick={handleTap}
      >
        {/* Sello superpuesto al sobre */}
        <div className="relative">
          <EnvelopeSVG opened={opened} color={envelopeColor} />

          {/* Label "Tocá aquí" */}
          <AnimatePresence>
            {!opened && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ paddingTop: '10%' }}
              >
                <p
                  className="font-sub italic text-base mb-3"
                  style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}
                >
                  {tapLabel}
                </p>
                <div style={{ marginTop: 4 }}>
                  <WaxSeal size={72} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring cuando cerrado */}
          {!opened && (
            <motion.div
              className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ border: `2px solid rgba(201,168,76,0.4)` }}
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.03, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </motion.div>

      {/* Nombre de la pareja en cursiva */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
        className="relative z-10 mt-10 font-heading italic"
        style={{
          fontSize: 'clamp(2rem, 8vw, 3rem)',
          color: 'var(--color-text)',
          letterSpacing: '-0.01em',
        }}
      >
        {names}
      </motion.p>

      {/* Hint scroll flecha */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 z-10"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <p className="text-xs font-body tracking-widest uppercase" style={{ fontSize: 10 }}>
          Deslizá para ver más
        </p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8"
          style={{ background: 'linear-gradient(to bottom, var(--color-text-muted), transparent)' }}
        />
      </motion.div>
    </section>
  );
}

import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import type { WeddingConfig } from '../types';

// ── SVG: pareja (novia y novio) ───────────────────────────────────────────────

function CoupleIcon({ size = 72 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Novia */}
      <circle cx="22" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      {/* Ramo */}
      <path d="M15 42 C15 42 12 38 14 35 C16 33 17 35 17 35 C17 35 16 31 19 30 C21 29 22 32 22 32 C22 32 22 28 25 28 C27 28 27 32 27 32 C27 32 28 30 30 31 C32 32 30 36 30 36 L28 42 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Vestido de novia */}
      <path d="M16 22 C16 22 14 28 13 36 L31 36 C30 28 28 22 28 22 C26 24 24 25 22 25 C20 25 18 24 16 22Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M13 36 L8 60 L36 60 L31 36Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* Velo */}
      <path d="M18 10 C18 10 20 6 24 7 C28 8 28 14 28 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.6"/>

      {/* Novio */}
      <circle cx="52" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.8"/>
      {/* Traje */}
      <path d="M44 22 L44 60 L60 60 L60 22 C58 24 55 26 52 26 C49 26 46 24 44 22Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      {/* Solapa traje */}
      <path d="M52 26 L49 36 L52 42 L55 36 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.7"/>
      {/* Corbata/moño */}
      <path d="M50 30 L52 28 L54 30 L52 33 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" opacity="0.6"/>

      {/* Línea decorativa entre ambos */}
      <line x1="32" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="1.2" opacity="0.3" strokeLinecap="round"/>
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DressCode() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;

  const enabled = (config.dress_code_enabled as boolean | undefined) !== false;
  const title   = (config.dress_code_title as string | undefined) ?? 'Código de Vestimenta';
  const value   = (config.dress_code_value as string | undefined) ?? 'Formal';

  if (!enabled) return null;

  return (
    <section
      id="vestimenta"
      className="relative overflow-hidden"
      style={{ background: 'var(--color-primary)', paddingBottom: 100 }}
    >
      {/* Separador top */}
      <div className="flex justify-center mb-8">
        <div
          style={{
            width: 1,
            height: 60,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.40), rgba(255,255,255,0.15))',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center gap-4 px-8"
      >
        {/* Icono */}
        <div
          className="flex items-center justify-center w-20 h-20 rounded-full"
          style={{
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          <span style={{ color: 'rgba(255,255,255,0.88)' }}>
            <CoupleIcon size={44} />
          </span>
        </div>

        {/* Título */}
        <p
          className="font-sub italic"
          style={{ color: 'rgba(255,255,255,0.90)', fontSize: 20 }}
        >
          {title}
        </p>

        {/* Valor */}
        <p
          className="font-body font-light tracking-[0.20em] uppercase"
          style={{ color: 'rgba(255,255,255,0.70)', fontSize: 14 }}
        >
          {value}
        </p>
      </motion.div>

      {/* Transición curva inferior */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="var(--color-primary)" />
        </svg>
      </div>
    </section>
  );
}

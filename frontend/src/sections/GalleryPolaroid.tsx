import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import type { WeddingConfig, GalleryPhoto } from '../types';

// ── Polaroid card ─────────────────────────────────────────────────────────────

function PolaroidCard({
  photo,
  rotation,
  delay,
  bw,
  zIndex,
}: {
  photo: GalleryPhoto;
  rotation: number;
  delay: number;
  bw: boolean;
  zIndex: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotation * 0.5, scale: 0.88 }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation, scale: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-visible flex-shrink-0"
      style={{
        width: 140,
        filter: 'drop-shadow(0 12px 28px rgba(0,0,0,0.22))',
        zIndex,
        transformOrigin: 'center bottom',
      }}
    >
      {/* Marco polaroid */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 4,
          padding: '8px 8px 28px 8px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        }}
      >
        {/* Imagen */}
        <div
          style={{
            width: '100%',
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            borderRadius: 2,
            background: '#e0e0e0',
          }}
        >
          <img
            src={photo.url}
            alt={photo.alt ?? ''}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              filter: bw ? 'grayscale(100%) contrast(1.05)' : 'none',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ── Floral spray para la esquina ──────────────────────────────────────────────

function FloralCorner() {
  return (
    <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M10 150 C10 150 40 100 80 70 C120 40 150 20 155 10" stroke="#4F6835" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M10 150 C10 150 20 100 40 80" stroke="#4F6835" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.5"/>
      <ellipse cx="80" cy="70" rx="10" ry="6" fill="#6E8F4A" opacity="0.7" transform="rotate(-40 80 70)"/>
      <ellipse cx="120" cy="42" rx="9" ry="5" fill="#6E8F4A" opacity="0.65" transform="rotate(-20 120 42)"/>
      <ellipse cx="45" cy="95" rx="8" ry="5" fill="#6E8F4A" opacity="0.6" transform="rotate(-60 45 95)"/>
      {[[80,60],[120,32],[50,88],[155,10]].map(([cx,cy],i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          {[0,72,144,216,288].map(a => (
            <ellipse key={a} cx={0} cy={-6} rx="3.5" ry="5.5" fill="white" opacity="0.88" transform={`rotate(${a})`}/>
          ))}
          <circle cx="0" cy="0" r="3" fill="#FFF9E0" opacity="0.95"/>
          <circle cx="0" cy="0" r="1.5" fill="#F5D060" opacity="0.85"/>
        </g>
      ))}
    </svg>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

const ROTATIONS = [-4, 3, -2.5, 4.5, -3, 2, -5, 3.5];

export default function GalleryPolaroid() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;

  const enabled    = (config.gallery_polaroid_enabled as boolean | undefined) !== false;
  const footerText = (config.gallery_polaroid_footer_text as string | undefined) ?? 'Te Esperamos';
  const bw         = (config.gallery_polaroid_bw as boolean | undefined) !== false;
  const photos     = config.sections.gallery?.photos ?? [];

  if (!enabled || photos.length === 0) return null;

  // Tomar hasta 8 fotos para la galería polaroid
  const displayPhotos = photos.slice(0, 8);

  return (
    <section
      id="galeria-polaroid"
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
        paddingTop: 80,
        paddingBottom: 80,
      }}
    >
      {/* Transición curva top desde olive */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 C480,80 960,80 1440,0 L1440,0 L0,0 Z" fill="var(--color-primary)" />
        </svg>
      </div>

      {/* Floral corner decoración */}
      <div className="absolute top-16 left-4 w-32 h-32 opacity-70 pointer-events-none">
        <FloralCorner />
      </div>
      <div className="absolute top-16 right-4 w-32 h-32 opacity-60 pointer-events-none" style={{ transform: 'scaleX(-1)' }}>
        <FloralCorner />
      </div>

      {/* Grid de polaroids */}
      <div className="relative z-10 max-w-lg mx-auto px-6 pt-8">
        <div
          className="relative flex flex-wrap justify-center gap-2"
          style={{ minHeight: 280 }}
        >
          {displayPhotos.map((photo, i) => (
            <PolaroidCard
              key={i}
              photo={photo}
              rotation={ROTATIONS[i % ROTATIONS.length]}
              delay={i * 0.1}
              bw={bw}
              zIndex={i + 1}
            />
          ))}
        </div>
      </div>

      {/* Texto script footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="text-center mt-12 relative z-10 px-6"
      >
        <p
          className="font-heading italic"
          style={{
            fontSize: 'clamp(2.2rem, 7vw, 3.2rem)',
            color: 'var(--color-text)',
            letterSpacing: '-0.01em',
          }}
        >
          {footerText}
        </p>

        {/* Línea decorativa */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <div style={{ width: 40, height: 1, background: 'var(--color-border)' }} />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent)" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <div style={{ width: 40, height: 1, background: 'var(--color-border)' }} />
        </div>
      </motion.div>
    </section>
  );
}

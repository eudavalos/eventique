import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import { useCountdown } from '../hooks/useCountdown';
import type { WeddingConfig } from '../types';

// ── Ornament floral SVG inline ────────────────────────────────────────────────

function FloralSpray({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ramas */}
      <path d="M100 170 C100 170 80 130 60 100 C40 70 30 50 50 30" stroke="#4F6835" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M100 170 C100 170 120 130 140 100 C160 70 170 50 150 30" stroke="#4F6835" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M100 140 C100 140 85 110 75 80" stroke="#4F6835" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M100 140 C100 140 115 110 125 80" stroke="#4F6835" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
      {/* Hojas */}
      <ellipse cx="50" cy="30" rx="12" ry="7" fill="#6E8F4A" opacity="0.75" transform="rotate(-30 50 30)"/>
      <ellipse cx="75" cy="65" rx="10" ry="6" fill="#6E8F4A" opacity="0.65" transform="rotate(-45 75 65)"/>
      <ellipse cx="150" cy="30" rx="12" ry="7" fill="#6E8F4A" opacity="0.75" transform="rotate(30 150 30)"/>
      <ellipse cx="125" cy="65" rx="10" ry="6" fill="#6E8F4A" opacity="0.65" transform="rotate(45 125 65)"/>
      <ellipse cx="85" cy="90" rx="9" ry="5" fill="#6E8F4A" opacity="0.6" transform="rotate(-20 85 90)"/>
      <ellipse cx="115" cy="90" rx="9" ry="5" fill="#6E8F4A" opacity="0.6" transform="rotate(20 115 90)"/>
      {/* Flores blancas */}
      {[[100, 16], [55, 28], [145, 28], [78, 72], [122, 72]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse key={angle} cx={0} cy={-7} rx="4" ry="6" fill="white" opacity="0.92" transform={`rotate(${angle})`}/>
          ))}
          <circle cx="0" cy="0" r="4" fill="#FFF9E0" opacity="0.95"/>
          <circle cx="0" cy="0" r="2" fill="#F5D060" opacity="0.85"/>
        </g>
      ))}
      {/* Flores pequeñas */}
      {[[65, 55], [135, 55], [90, 110], [110, 110]].map(([cx, cy], i) => (
        <g key={i} transform={`translate(${cx},${cy})`}>
          {[0, 90, 180, 270].map((angle) => (
            <ellipse key={angle} cx={0} cy={-4.5} rx="3" ry="4.5" fill="white" opacity="0.85" transform={`rotate(${angle})`}/>
          ))}
          <circle cx="0" cy="0" r="2.5" fill="#FFF0C0" opacity="0.9"/>
        </g>
      ))}
    </svg>
  );
}

// ── Monogram card ─────────────────────────────────────────────────────────────

function MonogramCard({ initial1, initial2, subtitle, names }: {
  initial1: string; initial2: string; subtitle: string; names: string;
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-2xl overflow-hidden"
      style={{
        background: '#FFFFFF',
        minWidth: 140,
        minHeight: 180,
        border: '1px solid rgba(0,0,0,0.06)',
      }}
    >
      {/* Ornamento diagonal SVG */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]" viewBox="0 0 140 180">
        <line x1="0" y1="180" x2="140" y2="0" stroke="#4F6835" strokeWidth="40" />
      </svg>

      {/* Monograma */}
      <div className="relative z-10 flex items-center gap-1 mb-1">
        <span className="font-heading font-semibold" style={{ fontSize: 28, color: '#2A2217', letterSpacing: '-0.02em' }}>
          {initial1}
        </span>
        <div className="flex flex-col items-center mx-1">
          {/* Ornamento floral mini */}
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <path d="M7 1 C7 1 9 5 7 9 C5 5 7 1 7 1Z" fill="#6E8F4A" opacity="0.7"/>
            <path d="M7 17 C7 17 5 13 7 9 C9 13 7 17 7 17Z" fill="#6E8F4A" opacity="0.7"/>
          </svg>
          <div style={{ width: 1, height: 24, background: '#4F6835', opacity: 0.4, margin: '2px 0' }} />
          <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
            <circle cx="7" cy="9" r="3" fill="#C9A84C" opacity="0.6"/>
          </svg>
        </div>
        <span className="font-heading font-semibold" style={{ fontSize: 28, color: '#2A2217', letterSpacing: '-0.02em' }}>
          {initial2}
        </span>
      </div>

      <div style={{ width: 30, height: 1, background: '#4F6835', opacity: 0.3, margin: '6px 0' }} />

      <p className="font-sub italic text-xs text-center" style={{ color: '#6E6050', marginBottom: 2 }}>
        {subtitle}
      </p>
      <p
        className="font-heading font-bold text-center uppercase tracking-wide"
        style={{ fontSize: 15, color: '#2A2217', letterSpacing: '0.06em', lineHeight: 1.2 }}
      >
        {names.split('&').map((n, i) => (
          <span key={i}>
            {i > 0 && <span className="font-sub italic normal-case" style={{ color: '#C9A84C', fontSize: 13 }}>&amp;</span>}
            {n.trim()}
            {i === 0 && <br />}
          </span>
        ))}
      </p>
    </div>
  );
}

// ── Date card ─────────────────────────────────────────────────────────────────

function DateCard({ displayDate, time }: { displayDate: string; time?: string }) {
  const parts = displayDate.split(',');
  const dayLine = parts[0]?.trim() ?? displayDate;
  const dateLine = parts.slice(1).join(',').trim();

  return (
    <div
      className="relative flex flex-col items-center justify-center p-6 rounded-2xl shadow-xl overflow-hidden"
      style={{
        background: 'var(--color-secondary)',
        minWidth: 130,
        minHeight: 160,
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      {/* Floral corner */}
      <FloralSpray className="absolute -bottom-4 -left-4 w-28 h-28 opacity-60 pointer-events-none" />

      <p className="font-sub italic relative z-10 mb-1" style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
        {dayLine}
      </p>
      {dateLine && (
        <p
          className="font-heading font-bold relative z-10 text-center leading-tight"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: 'var(--color-text)', letterSpacing: '-0.01em' }}
        >
          {dateLine.split(' de ')[0]}
          <br />
          <span style={{ fontSize: '0.65em', fontWeight: 400, letterSpacing: '0.02em' }}>
            {dateLine.split(' de ').slice(1).join(' de ')}
          </span>
        </p>
      )}
      {time && (
        <p
          className="relative z-10 font-body font-medium mt-2 tracking-widest uppercase"
          style={{ color: 'var(--color-accent)', fontSize: 11 }}
        >
          {time}
        </p>
      )}
    </div>
  );
}

// ── Envelope floral card (sobre abierto) ──────────────────────────────────────

function EnvelopeFloralCard({ color }: { color: string }) {
  return (
    <div
      className="relative flex items-end justify-center overflow-hidden rounded-2xl shadow-2xl"
      style={{
        background: color,
        minWidth: 130,
        minHeight: 170,
        border: '1px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Floral saliendo del sobre */}
      <div className="absolute -top-8 left-0 right-0 w-full opacity-90" style={{ height: 160 }}>
        <FloralSpray className="w-full h-full" />
      </div>

      {/* Sello dorado pequeño */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="46" fill="url(#sm-sealGold)" />
          <circle cx="50" cy="50" r="22" fill="url(#sm-sealLight)" />
          <circle cx="50" cy="50" r="9" fill="rgba(255,255,255,0.55)" />
          <circle cx="50" cy="50" r="5" fill="rgba(200,168,76,0.9)" />
          <defs>
            <radialGradient id="sm-sealGold" cx="40%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#E8C96B" />
              <stop offset="100%" stopColor="#8B6508" />
            </radialGradient>
            <radialGradient id="sm-sealLight" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#F0D678" />
              <stop offset="100%" stopColor="#B8860B" />
            </radialGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── Countdown badge estilo zigzag ─────────────────────────────────────────────

function CountdownBadge({ days, hours, minutes, seconds, label, color }: {
  days: number; hours: number; minutes: number; seconds: number; label: string; color: string;
}) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <motion.div
      className="relative flex flex-col items-center justify-center"
      animate={{ rotate: [0, -1.5, 0, 1.5, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Borde zigzag SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 120 120"
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}
      >
        <path
          d={`M 60 4
            ${Array.from({ length: 18 }, (_, i) => {
              const angle = (i * 360) / 18;
              const r = i % 2 === 0 ? 55 : 48;
              const x = 60 + r * Math.sin((angle * Math.PI) / 180);
              const y = 60 - r * Math.cos((angle * Math.PI) / 180);
              return `L ${x} ${y}`;
            }).join(' ')}
            Z`}
          fill={color}
        />
      </svg>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center" style={{ width: 110, height: 110 }}>
        <p className="font-body font-medium uppercase text-center" style={{ color: 'rgba(255,255,255,0.75)', fontSize: 8, letterSpacing: '0.15em', lineHeight: 1.3 }}>
          {label}
        </p>
        <p className="font-heading font-bold text-white text-center" style={{ fontSize: 16, letterSpacing: '0.05em', lineHeight: 1.2 }}>
          {pad(days)}:{pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function CollageHero() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;
  const countdown = useCountdown(config.dates.ceremony);

  const names        = config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`;
  const initial1     = config.couple.person1.firstName[0]?.toUpperCase() ?? 'A';
  const initial2     = config.couple.person2?.firstName?.[0]?.toUpperCase() ?? 'B';
  const subtitle     = (config.collage_subtitle as string | undefined) ?? 'Nuestra Boda';
  const cdLabel      = (config.collage_countdown_label as string | undefined) ?? 'Sólo Faltan';
  const displayDate  = config.dates.displayDate ?? config.dates.ceremony.slice(0, 10);
  const ceremonyTime = config.venues.ceremony.time;
  const envelopeColor = 'var(--color-primary)';

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.92 },
    visible: (i: number) => ({
      opacity: 1, y: 0, scale: 1,
      transition: { delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  return (
    <section
      id="collage"
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-bg)',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        paddingBottom: 80,
        paddingTop: 60,
      }}
    >
      {/* Transición curva superior */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden" style={{ height: 60 }}>
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0 C480,60 960,60 1440,0 L1440,60 L0,60 Z" fill="var(--color-bg)" />
        </svg>
      </div>

      <div className="max-w-lg mx-auto px-6 relative z-10">
        {/* Grid de cards staggered */}
        <div className="relative flex flex-wrap gap-4 justify-center items-start" style={{ minHeight: 360 }}>

          {/* Card 1: Sobre floral — arriba izquierda, rotado */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              rotate: -4,
              transformOrigin: 'bottom center',
              zIndex: 2,
              flexShrink: 0,
            }}
          >
            <EnvelopeFloralCard color={envelopeColor} />
          </motion.div>

          {/* Card 2: Monograma — arriba derecha, rotado opuesto */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              rotate: 3,
              transformOrigin: 'bottom center',
              zIndex: 3,
              flexShrink: 0,
              marginTop: 24,
            }}
          >
            <MonogramCard
              initial1={initial1}
              initial2={initial2}
              subtitle={subtitle}
              names={names}
            />
          </motion.div>

          {/* Card 3: Fecha — abajo izquierda, rotado */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              rotate: -2,
              transformOrigin: 'top center',
              zIndex: 1,
              flexShrink: 0,
              marginTop: -20,
            }}
          >
            <DateCard displayDate={displayDate} time={ceremonyTime} />
          </motion.div>

          {/* Badge countdown — superpuesto */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            style={{
              zIndex: 10,
              flexShrink: 0,
              alignSelf: 'flex-end',
              marginLeft: -20,
              marginTop: -30,
            }}
          >
            <CountdownBadge
              days={countdown.days}
              hours={countdown.hours}
              minutes={countdown.minutes}
              seconds={countdown.seconds}
              label={cdLabel}
              color="var(--color-primary)"
            />
          </motion.div>
        </div>

        {/* Flecha curva decorativa hacia abajo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex justify-center mt-10"
        >
          <svg width="32" height="48" viewBox="0 0 32 48" fill="none" style={{ color: 'var(--color-text-muted)' }}>
            <path d="M16 4 C16 4 4 20 16 44" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
            <path d="M8 38 L16 46 L24 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
          </svg>
        </motion.div>
      </div>

      {/* Transición curva inferior hacia olive */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,80 C360,0 1080,0 1440,80 L1440,80 L0,80 Z" fill="var(--color-primary)" />
        </svg>
      </div>
    </section>
  );
}

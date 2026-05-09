import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import type { WeddingConfig } from '../types';
import { FloralCardAccent, FloralDecorLayer } from '../components/RealisticFloralDecor';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function ChurchIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="32" y1="4" x2="32" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="28" y1="8" x2="36" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polygon points="32,14 22,26 42,26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="22" y="26" width="20" height="28" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/>
      <rect x="28" y="40" width="8" height="14" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="25" y="30" width="5" height="6" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="34" y="30" width="5" height="6" rx="0.5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

function ChampagneIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 8 C22 20 26 28 32 32 C38 28 42 20 40 8 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M28 8 C28 8 26 14 30 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <line x1="32" y1="32" x2="32" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      {/* Second glass */}
      <path d="M38 6 C36.5 16 40 23 45 27 C50 23 53.5 16 52 6 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" opacity="0.5"/>
      <line x1="45" y1="27" x2="45" y2="40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Bubbles */}
      <circle cx="20" cy="16" r="1.5" fill="currentColor" opacity="0.4"/>
      <circle cx="17" cy="10" r="1" fill="currentColor" opacity="0.3"/>
      <circle cx="22" cy="6" r="1.2" fill="currentColor" opacity="0.35"/>
    </svg>
  );
}

function HeartIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 50 C32 50 10 36 10 22 C10 14 16 8 24 8 C28 8 31 10 32 12 C33 10 36 8 40 8 C48 8 54 14 54 22 C54 36 32 50 32 50Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

function StarIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L36 24 L52 24 L40 34 L44 50 L32 40 L20 50 L24 34 L12 24 L28 24 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  );
}

function MusicIcon({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 48 L24 20 L52 14 L52 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="48" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
      <circle cx="48" cy="42" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );
}

const ICON_MAP: Record<string, (props: { size?: number }) => JSX.Element> = {
  church: ChurchIcon,
  champagne: ChampagneIcon,
  heart: HeartIcon,
  star: StarIcon,
  music: MusicIcon,
};

// ── Venue block ───────────────────────────────────────────────────────────────

function VenueBlock({ icon, label, name, address, mapsUrl, index }: {
  icon: string;
  label: string;
  name: string;
  address: string;
  mapsUrl?: string;
  index: number;
}) {
  const config = useConfig() as WeddingConfig;
  const cardDecorEnabled = config.envelope_floral_decor_enabled !== false && config.envelope_floral_card_decor_enabled !== false;
  const IconComp = ICON_MAP[icon] ?? ChurchIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: index * 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center text-center gap-3"
    >
      {/* Icono */}
      <div
        className="relative"
      >
        <FloralCardAccent
          enabled={cardDecorEnabled}
          styleKey={config.envelope_floral_decor_style}
          opacity={config.envelope_floral_decor_opacity}
          corner={index === 0 ? 'top-right' : 'top-left'}
          className="w-24"
        />
        <div
        className="flex items-center justify-center w-20 h-20 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.20)',
        }}
      >
        <span style={{ color: 'rgba(255,255,255,0.90)' }}>
          <IconComp size={40} />
        </span>
        </div>
      </div>

      {/* Label evento */}
      <p
        className="font-sub italic"
        style={{ color: 'rgba(255,255,255,0.92)', fontSize: 20 }}
      >
        {label}
      </p>

      {/* Nombre recinto */}
      <p
        className="font-body font-light tracking-wide"
        style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, maxWidth: 200 }}
      >
        {name}
        {address && (
          <>
            <br />
            <span style={{ fontSize: 12, opacity: 0.6 }}>{address}</span>
          </>
        )}
      </p>

      {/* Botón ubicación */}
      {mapsUrl && (
        <motion.a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-body font-medium text-sm transition-all"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.30)',
            color: 'rgba(255,255,255,0.90)',
            backdropFilter: 'blur(8px)',
            textDecoration: 'none',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.22)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Ver Ubicación
        </motion.a>
      )}
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function VenuesEnvelope() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;

  const ceremonyLabel = (config.venues_ceremony_label as string | undefined) ?? 'Ceremonia';
  const receptionLabel = (config.venues_reception_label as string | undefined) ?? 'Recepción';
  const ceremonyIcon = (config.venues_ceremony_icon as string | undefined) ?? 'church';
  const receptionIcon = (config.venues_reception_icon as string | undefined) ?? 'champagne';
  const sameVenue = config.venues.sameVenue;

  const ceremony = config.venues.ceremony;
  const reception = config.venues.reception;

  return (
    <section
      id="recintos"
      className="relative overflow-hidden"
      style={{
        background: 'var(--color-primary)',
        paddingTop: 80,
        paddingBottom: 100,
      }}
    >
      {/* Radial glow sutil */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.07) 0%, transparent 60%)',
        }}
      />

      <FloralDecorLayer
        enabled={config.envelope_floral_decor_enabled as boolean | undefined}
        styleKey={config.envelope_floral_decor_style as string | undefined}
        density={config.envelope_floral_decor_density as string | undefined}
        opacity={config.envelope_floral_decor_opacity as number | undefined}
        zone="section"
      />

      <div className="max-w-sm mx-auto px-6 relative z-10">
        {/* Venue 1: Ceremonia */}
        <VenueBlock
          icon={ceremonyIcon}
          label={ceremonyLabel}
          name={ceremony.name}
          address={`${ceremony.city}, ${ceremony.country}`}
          mapsUrl={ceremony.mapsUrl}
          index={0}
        />

        {/* Separador vertical si hay dos venues */}
        {!sameVenue && (
          <div className="flex justify-center my-10">
            <div
              style={{
                width: 1,
                height: 60,
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.40), rgba(255,255,255,0.15))',
              }}
            />
          </div>
        )}

        {/* Venue 2: Recepción */}
        {!sameVenue && (
          <VenueBlock
            icon={receptionIcon}
            label={receptionLabel}
            name={reception.name}
            address={`${reception.city}, ${reception.country}`}
            mapsUrl={reception.mapsUrl}
            index={1}
          />
        )}
      </div>

      {/* Transición curva inferior */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,80 C480,0 960,0 1440,80 L1440,80 L0,80 Z" fill="var(--color-primary)" />
        </svg>
      </div>
    </section>
  );
}

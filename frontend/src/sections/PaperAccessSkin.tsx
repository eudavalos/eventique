import { useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Gift, MapPin, Music, Play, Users } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useGuest } from '../context/GuestContext';
import { useCountdown } from '../hooks/useCountdown';
import GiftRegistry from './GiftRegistry';
import RSVP from './RSVP';
import Footer from './Footer';
import type { Venue, WeddingConfig } from '../types';
import { requestMusicPlaybackWithOpen } from '../lib/musicPlayerEvents';
import { FloralCardAccent, FloralDecorLayer } from '../components/RealisticFloralDecor';

function cfgText(config: WeddingConfig, key: keyof WeddingConfig): string {
  const value = config[key];
  return typeof value === 'string' ? value : '';
}

function buildCalendarUrl(config: WeddingConfig): string {
  const start = config.dates.ceremony?.replace(/[-:]/g, '').slice(0, 15);
  const endSource = config.dates.reception ?? config.dates.ceremony;
  const end = endSource?.replace(/[-:]/g, '').slice(0, 15);
  if (!start || !end) return '';

  const title = encodeURIComponent(config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`);
  const location = encodeURIComponent(`${config.venues.ceremony.name}, ${config.venues.ceremony.address}, ${config.venues.ceremony.city}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
}

function PaperTexture() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.78), transparent 58%),
          linear-gradient(90deg, rgba(63,86,49,0.035) 1px, transparent 1px),
          linear-gradient(0deg, rgba(63,86,49,0.028) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, 34px 34px, 34px 34px',
      }}
    />
  );
}

export function CallaCluster({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 160 180" fill="none" aria-hidden="true">
      <path d="M78 170 C76 128 72 88 50 42" stroke="var(--color-primary-light)" strokeWidth="3" strokeLinecap="round" />
      <path d="M86 170 C91 126 97 84 122 38" stroke="var(--color-primary-light)" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 170 C86 130 87 92 82 50" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 25 C30 48 38 78 64 86 C76 62 70 36 42 25Z" fill="#FFFFFF" stroke="rgba(63,86,49,0.16)" strokeWidth="2" />
      <path d="M116 20 C96 38 94 70 116 86 C136 66 140 38 116 20Z" fill="#FFFFFF" stroke="rgba(63,86,49,0.16)" strokeWidth="2" />
      <path d="M78 35 C58 54 58 86 82 104 C104 82 103 54 78 35Z" fill="#FFFFFF" stroke="rgba(63,86,49,0.16)" strokeWidth="2" />
      <path d="M51 42 C57 52 58 63 55 75" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
      <path d="M117 38 C112 50 111 62 116 74" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
      <path d="M80 51 C84 65 84 80 81 92" stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="64" cy="116" rx="18" ry="7" fill="var(--color-primary-light)" opacity="0.55" transform="rotate(-28 64 116)" />
      <ellipse cx="100" cy="118" rx="20" ry="7" fill="var(--color-primary-light)" opacity="0.45" transform="rotate(24 100 118)" />
    </svg>
  );
}

function PaperEnvelope({ label, onOpen }: { label: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen} className="relative block w-full max-w-[360px] mx-auto group" aria-label={label}>
      <svg viewBox="0 0 360 236" className="w-full drop-shadow-xl" aria-hidden="true">
        <rect x="10" y="60" width="340" height="166" rx="10" fill="var(--color-primary)" />
        <path d="M10 64 L180 158 L350 64" fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="2" />
        <path d="M10 64 L116 150 L10 226Z" fill="rgba(0,0,0,0.08)" />
        <path d="M350 64 L244 150 L350 226Z" fill="rgba(0,0,0,0.08)" />
        <path d="M10 62 L180 160 L350 62Z" fill="var(--color-primary-dark)" opacity="0.58" />
      </svg>
      <span
        className="absolute left-1/2 top-[41%] -translate-x-1/2 -translate-y-1/2 font-sub italic text-base transition-transform group-hover:scale-105"
        style={{ color: 'rgba(255,255,255,0.92)' }}
      >
        {label}
      </span>
      <span
        className="absolute left-1/2 top-[57%] -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full grid place-items-center shadow-lg"
        style={{
          background: 'radial-gradient(circle at 32% 28%, #F5D66D 0%, var(--color-accent) 52%, #7E591C 100%)',
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        <span className="w-7 h-7 rounded-full border border-white/55" />
      </span>
    </button>
  );
}

function DetailCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const config = useConfig() as WeddingConfig;
  const cardDecorEnabled = config.paper_floral_decor_enabled !== false && config.paper_floral_card_decor_enabled !== false;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-lg ${className}`}
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 18px 54px rgba(36,53,31,0.10)',
      }}
    >
      <FloralCardAccent
        enabled={cardDecorEnabled}
        styleKey={config.paper_floral_decor_style}
        opacity={config.paper_floral_decor_opacity}
        corner="top-right"
      />
      {children}
    </motion.div>
  );
}

function GuestAccessCard({ config }: { config: WeddingConfig }) {
  const guest = useGuest();
  if (!guest) return null;

  const label = cfgText(config, 'paper_access_guest_label');
  const passTemplate = cfgText(config, 'paper_access_passes_label');
  const passes = String(guest.data.invitation.allowed_passes);
  const passText = passTemplate.replace('{passes}', passes);

  return (
    <DetailCard className="p-5 mt-8">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-secondary)' }}>
          <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
        </div>
        <div className="min-w-0">
          {label && <p className="font-body uppercase text-[10px] tracking-[0.22em]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>}
          <p className="font-sub text-lg leading-tight mt-1" style={{ color: 'var(--color-text)' }}>
            {guest.data.invitation.display_name}
          </p>
          {passText && <p className="font-body text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{passText}</p>}
        </div>
      </div>
    </DetailCard>
  );
}

function MusicPaperCard({ config }: { config: WeddingConfig }) {
  const track = config.music?.tracks?.[0];
  const prompt = cfgText(config, 'paper_music_prompt').trim();
  const showCard = config.paper_music_card_enabled !== false;
  if (!showCard || !config.music?.enabled || !track) return null;

  return (
    <DetailCard className="p-6">
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-full grid place-items-center mb-4" style={{ background: 'var(--color-primary)', color: 'white' }}>
          <Music className="w-5 h-5" />
        </div>
        {prompt && (
          <p className="font-sub text-xl italic" style={{ color: 'var(--color-text)' }}>
            {prompt}
          </p>
        )}
        <button
          type="button"
          onClick={requestMusicPlaybackWithOpen}
          className="mt-5 flex w-full items-center gap-3 text-left rounded-lg transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary/30"
          aria-label={`${cfgText(config, 'paper_music_button_label')}: ${track.title}`}
        >
          <span className="w-10 h-10 rounded-full grid place-items-center flex-shrink-0" style={{ border: '1px solid var(--color-primary)', color: 'var(--color-primary)' }}>
            <Play className="w-4 h-4 ml-0.5" />
          </span>
          <div className="min-w-0">
            <p className="font-body text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>
              {cfgText(config, 'paper_music_button_label')}
            </p>
            <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{track.title}</p>
            {track.artist && <p className="font-body text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{track.artist}</p>}
          </div>
        </button>
      </div>
    </DetailCard>
  );
}

function ParentsPaperCard({ config }: { config: WeddingConfig }) {
  const parents = [config.couple.person1.parents, config.couple.person2.parents].filter(Boolean);
  if (!parents.length && !cfgText(config, 'paper_parents_intro')) return null;

  return (
    <DetailCard className="p-7 text-center">
      <p className="font-body uppercase text-[10px] tracking-[0.28em] mb-4" style={{ color: 'var(--color-text-muted)' }}>
        {cfgText(config, 'paper_parents_intro')}
      </p>
      {parents.map((parentLine) => (
        <p key={parentLine} className="font-heading text-2xl leading-snug" style={{ color: 'var(--color-text)' }}>
          {parentLine}
        </p>
      ))}
      <div className="w-14 h-px mx-auto mt-6" style={{ background: 'var(--color-border)' }} />
    </DetailCard>
  );
}

function CalendarPaperCard({ config }: { config: WeddingConfig }) {
  const url = buildCalendarUrl(config);
  if (!url) return null;

  return (
    <DetailCard className="p-6 text-center">
      <Calendar className="w-7 h-7 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
      <p className="font-body uppercase text-[10px] tracking-[0.24em] mb-3" style={{ color: 'var(--color-text-muted)' }}>
        {cfgText(config, 'paper_calendar_title')}
      </p>
      <p className="font-heading text-3xl" style={{ color: 'var(--color-text)' }}>
        {config.dates.displayDate ?? config.dates.ceremony.slice(0, 10)}
      </p>
      {config.venues.ceremony.time && (
        <p className="font-body text-xs uppercase tracking-[0.22em] mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {config.venues.ceremony.time}
        </p>
      )}
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline mt-6 justify-center">
        <Calendar className="w-4 h-4" />
        {cfgText(config, 'paper_calendar_button_label')}
      </a>
    </DetailCard>
  );
}

function VenuePaperCard({ venue, label, buttonLabel }: { venue: Venue; label: string; buttonLabel: string }) {
  return (
    <DetailCard className="p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full grid place-items-center flex-shrink-0" style={{ background: 'var(--color-primary)', color: 'white' }}>
          <MapPin className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          {label && <p className="font-body text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--color-text-muted)' }}>{label}</p>}
          <p className="font-heading text-2xl leading-tight mt-1" style={{ color: 'var(--color-text)' }}>{venue.name}</p>
          <p className="font-body text-sm leading-relaxed mt-2" style={{ color: 'var(--color-text-muted)' }}>
            {[venue.address, venue.city, venue.country].filter(Boolean).join(', ')}
          </p>
          {venue.time && <p className="font-body text-xs uppercase tracking-[0.18em] mt-3" style={{ color: 'var(--color-primary)' }}>{venue.time}</p>}
          {venue.mapsUrl && (
            <a href={venue.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5">
              <MapPin className="w-4 h-4" />
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    </DetailCard>
  );
}

function DressPaperCard({ config }: { config: WeddingConfig }) {
  if (config.dress_code_enabled === false) return null;
  return (
    <DetailCard className="p-6 text-center">
      <p className="font-sub italic text-3xl mb-2" style={{ color: 'var(--color-primary)' }}>
        {cfgText(config, 'dress_code_title')}
      </p>
      <p className="font-body text-sm uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-muted)' }}>
        {cfgText(config, 'dress_code_value')}
      </p>
    </DetailCard>
  );
}

function CountdownPaperCard({ config }: { config: WeddingConfig }) {
  const countdown = useCountdown(config.dates.ceremony);
  const cells = [
    { value: countdown.days, label: cfgText(config, 'paper_countdown_days_label') },
    { value: countdown.hours, label: cfgText(config, 'paper_countdown_hours_label') },
    { value: countdown.minutes, label: cfgText(config, 'paper_countdown_minutes_label') },
  ];

  return (
    <DetailCard className="p-7 text-center">
      <p className="font-body uppercase text-[10px] tracking-[0.3em] mb-5" style={{ color: 'var(--color-text-muted)' }}>
        {cfgText(config, 'paper_countdown_title')}
      </p>
      <div className="grid grid-cols-3 gap-3">
        {cells.map((cell) => (
          <div key={cell.label}>
            <p className="font-heading text-4xl leading-none" style={{ color: 'var(--color-text)' }}>
              {String(cell.value).padStart(2, '0')}
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {cell.label}
            </p>
          </div>
        ))}
      </div>
      <p className="font-sub italic text-lg mt-6" style={{ color: 'var(--color-text-muted)' }}>
        {cfgText(config, 'paper_countdown_subtitle')}
      </p>
    </DetailCard>
  );
}

export default function PaperAccessSkin() {
  const config = useConfig() as WeddingConfig;
  const contentRef = useRef<HTMLDivElement>(null);
  const names = config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`;
  const locationButtonLabel = cfgText(config, 'paper_location_button_label');

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <section className="relative min-h-screen flex items-center overflow-hidden px-5 py-16">
        <PaperTexture />
        <FloralDecorLayer
          enabled={config.paper_floral_decor_enabled}
          styleKey={config.paper_floral_decor_style}
          density={config.paper_floral_decor_density}
          opacity={config.paper_floral_decor_opacity}
          zone="hero"
        />

        <div className="relative z-10 max-w-md mx-auto w-full text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body uppercase text-xs tracking-[0.34em] mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            {cfgText(config, 'paper_access_intro_label')}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading font-light leading-tight mb-8"
            style={{ color: 'var(--color-text)', fontSize: 'clamp(2.8rem, 13vw, 4.9rem)' }}
          >
            {names}
          </motion.h1>
          <PaperEnvelope label={cfgText(config, 'paper_access_tap_label')} onOpen={scrollToContent} />
          <p className="font-sub italic text-2xl mt-8" style={{ color: 'var(--color-text)' }}>
            {cfgText(config, 'paper_access_intro_text')}
          </p>
          <p className="font-body text-xs uppercase tracking-[0.22em] mt-4" style={{ color: 'var(--color-text-muted)' }}>
            {[config.dates.displayDate, config.venues.ceremony.city].filter(Boolean).join(' | ')}
          </p>
          <GuestAccessCard config={config} />
        </div>
      </section>

      <div ref={contentRef} className="relative px-5 pb-16">
        <PaperTexture />
        <FloralDecorLayer
          enabled={config.paper_floral_decor_enabled}
          styleKey={config.paper_floral_decor_style}
          density={config.paper_floral_decor_density}
          opacity={config.paper_floral_decor_opacity}
          zone="content"
        />
        <div className="relative z-10 max-w-md mx-auto space-y-6">
          <MusicPaperCard config={config} />
          <ParentsPaperCard config={config} />
          <CalendarPaperCard config={config} />

          <div id="recintos" className="pt-2">
            <p className="font-body uppercase text-[10px] tracking-[0.3em] text-center mb-5" style={{ color: 'var(--color-text-muted)' }}>
              {cfgText(config, 'paper_venues_title')}
            </p>
            <div className="space-y-5">
              <VenuePaperCard venue={config.venues.ceremony} label={cfgText(config, 'venues_ceremony_label')} buttonLabel={locationButtonLabel} />
              {!config.venues.sameVenue && (
                <VenuePaperCard venue={config.venues.reception} label={cfgText(config, 'venues_reception_label')} buttonLabel={locationButtonLabel} />
              )}
            </div>
          </div>

          <DressPaperCard config={config} />

          {cfgText(config, 'paper_gift_intro') && (
            <DetailCard className="p-6 text-center">
              <Gift className="w-7 h-7 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                {cfgText(config, 'paper_gift_intro')}
              </p>
            </DetailCard>
          )}

          <GiftRegistry />
          <CountdownPaperCard config={config} />

          {config.sections.rsvp.enabled !== false && (
            <section id="rsvp" className="pt-2">
              <p className="font-body uppercase text-[10px] tracking-[0.3em] text-center mb-5" style={{ color: 'var(--color-text-muted)' }}>
                {cfgText(config, 'paper_rsvp_title')}
              </p>
              <RSVP />
            </section>
          )}
        </div>
      </div>

      {config.sections.footer.enabled !== false && <Footer />}
    </div>
  );
}

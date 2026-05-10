import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Gift, MapPin, Music, Play } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useGuest } from '../context/GuestContext';
import { useCountdown } from '../hooks/useCountdown';
import { requestMusicPlaybackWithOpen } from '../lib/musicPlayerEvents';
import { getVenueMapsUrl } from '../lib/maps';
import { getFloralDecorConfig } from '../lib/floralConfig';
import { FloralCardAccent, FloralDecorLayer } from '../components/RealisticFloralDecor';
import GiftRegistry from './GiftRegistry';
import RSVP from './RSVP';
import Footer from './Footer';
import type { WeddingConfig, Venue } from '../types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function cfgStr(config: WeddingConfig, key: keyof WeddingConfig): string {
  const v = config[key];
  return typeof v === 'string' ? v : '';
}

function buildCalendarUrl(config: WeddingConfig): string {
  const start = config.dates.ceremony?.replace(/[-:]/g, '').slice(0, 15);
  const endSrc = config.dates.reception ?? config.dates.ceremony;
  const end = endSrc?.replace(/[-:]/g, '').slice(0, 15);
  if (!start || !end) return '';
  const title = encodeURIComponent(config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`);
  const loc = encodeURIComponent(`${config.venues.ceremony.name}, ${config.venues.ceremony.address}, ${config.venues.ceremony.city}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${loc}`;
}

// ── SVG Illustrations ─────────────────────────────────────────────────────────

function CallaLiliesTop({ opacity = 0.82 }: { opacity?: number }) {
  return (
    <svg viewBox="0 0 340 120" className="w-full" style={{ opacity }} aria-hidden="true">
      {/* Left spray */}
      <path d="M30 115 C28 82 22 56 8 28" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M36 115 C40 78 48 52 64 22" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M33 115 C35 80 36 58 30 34" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M5 16 C-4 34 4 56 24 62 C32 44 27 22 5 16Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M58 12 C44 28 42 52 58 64 C72 48 74 28 58 12Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M25 24 C20 36 20 52 28 62 C38 46 37 32 25 24Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M8 28 C12 36 13 44 11 54" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M64 22 C60 34 59 44 62 54" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 34 C33 44 33 54 31 62" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      {/* Right spray (mirrored) */}
      <path d="M310 115 C312 82 318 56 332 28" stroke="var(--color-primary)" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M304 115 C300 78 292 52 276 22" stroke="var(--color-primary-light)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M307 115 C305 80 304 58 310 34" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M335 16 C344 34 336 56 316 62 C308 44 313 22 335 16Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M282 12 C296 28 298 52 282 64 C268 48 266 28 282 12Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M315 24 C320 36 320 52 312 62 C302 46 303 32 315 24Z" fill="white" stroke="rgba(62,123,87,0.22)" strokeWidth="1.5" />
      <path d="M332 28 C328 36 327 44 329 54" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M276 22 C280 34 281 44 278 54" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      <path d="M310 34 C307 44 307 54 309 62" stroke="var(--color-accent)" strokeWidth="3" strokeLinecap="round" />
      {/* Center monogram divider */}
      <line x1="148" y1="108" x2="192" y2="108" stroke="var(--color-accent)" strokeWidth="1" opacity="0.6" />
      <circle cx="170" cy="108" r="3" fill="var(--color-accent)" opacity="0.6" />
    </svg>
  );
}

function ChurchSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" style={{ color: 'var(--color-primary)' }} aria-hidden="true">
      <rect x="40" y="55" width="40" height="45" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <polygon points="60,12 32,50 88,50" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="55" y="2" width="10" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <line x1="60" y1="2" x2="60" y2="18" stroke="currentColor" strokeWidth="1.5" />
      <line x1="54" y1="9" x2="66" y2="9" stroke="currentColor" strokeWidth="1.5" />
      <rect x="48" y="70" width="12" height="30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="67" y="70" width="12" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M67 70 Q73 62 79 70" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="73" cy="62" r="1.5" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

function ArchSVG() {
  return (
    <svg viewBox="0 0 120 100" className="w-24 h-20 mx-auto" aria-hidden="true" style={{ color: 'white', opacity: 0.9 }}>
      <path d="M30 100 L30 48 Q30 18 60 18 Q90 18 90 48 L90 100" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M40 100 L40 50 Q40 28 60 28 Q80 28 80 50 L80 100" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      <line x1="25" y1="100" x2="95" y2="100" stroke="currentColor" strokeWidth="1.5" />
      <path d="M44 42 Q52 24 60 20 Q68 24 76 42" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Foliage hints */}
      <circle cx="20" cy="72" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <circle cx="14" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="100" cy="72" r="8" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      <circle cx="106" cy="60" r="6" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
    </svg>
  );
}

function CoupleSVG() {
  return (
    <svg viewBox="0 0 120 110" className="w-28 h-24" aria-hidden="true" style={{ color: 'var(--color-primary)' }}>
      {/* Woman */}
      <circle cx="42" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M32 30 Q28 65 28 80 L56 80 Q56 65 52 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 80 Q35 110 42 110 Q49 110 56 80" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M28 45 L18 60 M52 45 L62 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Veil hint */}
      <path d="M34 8 Q42 2 50 8 Q56 22 52 32" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Man */}
      <circle cx="78" cy="18" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M68 30 L68 80 L88 80 L88 30" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M68 80 L64 110 M88 80 L92 110" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M68 40 L58 55 M88 40 L98 55" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {/* Suit lapels */}
      <path d="M75 30 L78 40 L81 30" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* Joined hands */}
      <path d="M56 60 Q67 58 68 60" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <circle cx="62" cy="59" r="2" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

// ── Envelope component with animation ────────────────────────────────────────

function AmoreaEnvelope({ tapLabel, onOpen }: { tapLabel: string; onOpen: () => void }) {
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    setOpened(true);
    setTimeout(onOpen, 650);
  };

  return (
    <button type="button" onClick={handleOpen} disabled={opened} className="relative block w-full max-w-[320px] mx-auto group focus:outline-none" aria-label={tapLabel}>
      <svg viewBox="0 0 320 210" className="w-full drop-shadow-2xl" aria-hidden="true">
        {/* Envelope body */}
        <rect x="8" y="68" width="304" height="134" rx="6" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        {/* Bottom flap */}
        <path d="M8 198 L160 140 L312 198" fill="var(--color-secondary)" stroke="var(--color-border)" strokeWidth="1" />
        {/* Side folds */}
        <path d="M8 68 L116 142 L8 202Z" fill="rgba(0,0,0,0.04)" />
        <path d="M312 68 L204 142 L312 202Z" fill="rgba(0,0,0,0.04)" />
      </svg>
      {/* Animated top flap */}
      <div className="absolute top-0 left-0 w-full overflow-hidden" style={{ height: '50%' }}>
        <motion.svg
          viewBox="0 0 320 105"
          className="w-full"
          aria-hidden="true"
          animate={opened ? { rotateX: -180, originY: '100%' } : { rotateX: 0 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: 'bottom center' }}
        >
          <path d="M8 68 L160 2 L312 68Z" fill="var(--color-surface)" stroke="var(--color-border)" strokeWidth="1.5" />
        </motion.svg>
      </div>
      {/* Wax seal */}
      <div
        className="absolute left-1/2 -translate-x-1/2 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
        style={{
          top: '38%',
          background: 'radial-gradient(circle at 36% 32%, #F5D98B 0%, var(--color-accent) 55%, #8B6318 100%)',
          zIndex: 10,
        }}
      >
        <span className="font-heading text-white text-lg" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>
          ♡
        </span>
      </div>
      {/* Tap label */}
      {!opened && (
        <p
          className="absolute left-1/2 -translate-x-1/2 font-body text-xs uppercase tracking-[0.22em] mt-2 whitespace-nowrap"
          style={{ bottom: '-28px', color: 'var(--color-text-muted)' }}
        >
          {tapLabel}
        </p>
      )}
    </button>
  );
}

// ── Scalloped calendar badge ──────────────────────────────────────────────────

function ScallopedCalendarBadge({ config }: { config: WeddingConfig }) {
  const calUrl = buildCalendarUrl(config);
  const dateStr = config.dates.ceremony.slice(0, 10);
  const [, monthStr, dayStr] = dateStr.split('-');
  const month = new Date(dateStr + 'T12:00:00').toLocaleString('es', { month: 'long' });
  const day = parseInt(dayStr, 10);
  const displayDate = config.dates.displayDate ?? dateStr;
  const calLabel = cfgStr(config, 'paper_calendar_button_label') || 'Agregar al calendario';
  const calTitle = cfgStr(config, 'paper_calendar_title') || 'Añádelo a tu calendario';
  void monthStr;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-10"
    >
      <p className="font-body uppercase text-[10px] tracking-[0.3em] mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {calTitle}
      </p>
      {/* Scalloped badge */}
      <div className="relative inline-block">
        <svg viewBox="0 0 180 200" className="w-44 h-48 mx-auto" aria-hidden="true">
          {/* Scalloped border - wave pattern around a circle */}
          <path
            d="M90 10
               Q103 2 116 10 Q128 18 128 32
               Q136 32 144 40 Q152 50 144 60
               Q152 68 152 80 Q152 92 144 98
               Q150 108 146 118 Q140 130 128 132
               Q128 144 120 152 Q110 162 98 160
               Q90 170 82 160 Q70 162 60 152
               Q52 144 52 132 Q40 130 34 118
               Q30 108 36 98 Q28 92 28 80
               Q28 68 36 60 Q28 50 36 40
               Q44 32 52 32 Q52 18 64 10
               Q77 2 90 10Z"
            fill="var(--color-secondary)"
            stroke="var(--color-accent)"
            strokeWidth="1.2"
          />
          {/* Month band at top */}
          <path
            d="M54 32 Q90 26 126 32 Q128 44 128 52 Q90 46 52 52 Q52 44 54 32Z"
            fill="var(--color-primary)"
            opacity="0.9"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="font-body text-[10px] uppercase tracking-[0.2em] mt-3" style={{ color: 'white' }}>
            {month}
          </p>
          <p className="font-heading leading-none" style={{ fontSize: '3.8rem', color: 'var(--color-text)', lineHeight: 1 }}>
            {day}
          </p>
          <p className="font-body text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: 'var(--color-text-muted)', fontSize: '9px' }}>
            {displayDate.split(',')[0]}
          </p>
        </div>
      </div>
      {calUrl && (
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 btn-outline"
        >
          <Calendar className="w-4 h-4" />
          {calLabel}
        </a>
      )}
    </motion.div>
  );
}

// ── Card wrapper ──────────────────────────────────────────────────────────────

function AmoreaCard({ children, className = '', greenBg = false }: { children: React.ReactNode; className?: string; greenBg?: boolean }) {
  const config = useConfig() as WeddingConfig;
  const floral = getFloralDecorConfig(config);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{
        background: greenBg ? 'var(--color-primary)' : 'var(--color-surface)',
        border: greenBg ? 'none' : '1px solid var(--color-border)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
      }}
    >
      <FloralCardAccent
        enabled={!greenBg && floral.enabled && floral.cardDecorEnabled}
        styleKey={floral.style}
        opacity={floral.opacity}
        corner="top-right"
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ── Guest access card ─────────────────────────────────────────────────────────

function GuestAccessBanner({ config }: { config: WeddingConfig }) {
  const guest = useGuest();
  if (!guest) return null;

  const greeting = cfgStr(config, 'amorea_guest_greeting') || 'Con todo el cariño, te invitamos';
  const passesLabel = cfgStr(config, 'paper_access_passes_label') || 'Hemos reservado {passes} cupo(s) para ti.';
  const passes = String(guest.data.invitation.allowed_passes);
  const passText = passesLabel.replace('{passes}', passes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="mt-8 rounded-2xl p-5 text-center"
      style={{
        background: 'var(--color-secondary)',
        border: '1px solid var(--color-border)',
      }}
    >
      <p className="font-body text-[10px] uppercase tracking-[0.28em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {greeting}
      </p>
      <p className="font-heading text-2xl" style={{ color: 'var(--color-text)' }}>
        {guest.data.invitation.display_name}
      </p>
      {passText && (
        <p className="font-body text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
          {passText}
        </p>
      )}
    </motion.div>
  );
}

// ── Venue cards ───────────────────────────────────────────────────────────────

function CeremonyCard({ venue, label, btnLabel }: { venue: Venue; label: string; btnLabel: string }) {
  const mapsHref = getVenueMapsUrl(venue);

  return (
    <AmoreaCard className="p-6">
      <ChurchSVG />
      <div className="text-center mt-4">
        {label && (
          <p className="font-body uppercase text-[10px] tracking-[0.3em] mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {label}
          </p>
        )}
        <p className="font-heading text-2xl leading-snug" style={{ color: 'var(--color-text)' }}>
          {venue.name}
        </p>
        {venue.time && (
          <p className="font-body text-xs uppercase tracking-[0.2em] mt-2" style={{ color: 'var(--color-primary)' }}>
            {venue.time}
          </p>
        )}
        <p className="font-body text-sm mt-2 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {[venue.address, venue.city].filter(Boolean).join(', ')}
        </p>
        {mapsHref && (
          <a href={mapsHref} target="_blank" rel="noopener noreferrer" className="btn-outline mt-5 justify-center">
            <MapPin className="w-4 h-4" />
            {btnLabel}
          </a>
        )}
      </div>
    </AmoreaCard>
  );
}

function ReceptionCard({ venue, label, btnLabel }: { venue: Venue; label: string; btnLabel: string }) {
  const mapsHref = getVenueMapsUrl(venue);

  return (
    <AmoreaCard className="p-6" greenBg>
      <ArchSVG />
      <div className="text-center mt-4">
        {label && (
          <p className="font-body uppercase text-[10px] tracking-[0.3em] mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {label}
          </p>
        )}
        <p className="font-heading text-2xl leading-snug" style={{ color: 'white' }}>
          {venue.name}
        </p>
        {venue.time && (
          <p className="font-body text-xs uppercase tracking-[0.2em] mt-2" style={{ color: 'rgba(255,255,255,0.75)' }}>
            {venue.time}
          </p>
        )}
        <p className="font-body text-sm mt-2 leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {[venue.address, venue.city].filter(Boolean).join(', ')}
        </p>
        {mapsHref && (
          <a
            href={mapsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.16em] font-body font-medium transition-all hover:bg-white/30"
            style={{ border: '1px solid rgba(255,255,255,0.5)', color: 'white' }}
          >
            <MapPin className="w-4 h-4" />
            {btnLabel}
          </a>
        )}
      </div>
    </AmoreaCard>
  );
}

// ── Music card ────────────────────────────────────────────────────────────────

function AmoreaMusicCard({ config }: { config: WeddingConfig }) {
  const showCard = config.paper_music_card_enabled !== false;
  const track = config.music?.tracks?.[0];
  if (!showCard || !config.music?.enabled || !track) return null;

  const prompt = cfgStr(config, 'paper_music_prompt').trim();
  const btnLabel = cfgStr(config, 'paper_music_button_label') || 'Reproducir música';

  return (
    <AmoreaCard className="p-6">
      <div className="flex items-center gap-5">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-primary)', color: 'white' }}
        >
          <Music className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          {prompt && (
            <p className="font-sub italic text-base leading-snug mb-3" style={{ color: 'var(--color-text)' }}>
              {prompt}
            </p>
          )}
          <button
            type="button"
            onClick={requestMusicPlaybackWithOpen}
            className="flex items-center gap-3 text-left w-full group"
            aria-label={`${btnLabel}: ${track.title}`}
          >
            <span
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
              style={{ border: '1.5px solid var(--color-primary)', color: 'var(--color-primary)' }}
            >
              <Play className="w-4 h-4 ml-0.5" />
            </span>
            <div className="min-w-0">
              <p className="font-body text-[10px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-primary)' }}>
                {btnLabel}
              </p>
              <p className="font-body text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                {track.title}
              </p>
              {track.artist && (
                <p className="font-body text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {track.artist}
                </p>
              )}
            </div>
          </button>
        </div>
      </div>
    </AmoreaCard>
  );
}

// ── Parents / Formal card ─────────────────────────────────────────────────────

function AmoreaParentsCard({ config }: { config: WeddingConfig }) {
  const formalText = cfgStr(config, 'amorea_formal_text');
  const parentsEnabled = config.amorea_parents_enabled !== false;
  const p1parents = config.couple.person1.parents;
  const p2parents = config.couple.person2.parents;
  const hasContent = formalText || (parentsEnabled && (p1parents || p2parents));
  if (!hasContent) return null;

  return (
    <AmoreaCard className="p-7 text-center">
      {formalText && (
        <p className="font-sub italic text-lg leading-relaxed mb-5" style={{ color: 'var(--color-text-muted)' }}>
          {formalText}
        </p>
      )}
      {parentsEnabled && (p1parents || p2parents) && (
        <>
          <div className="w-12 h-px mx-auto mb-5" style={{ background: 'var(--color-accent)' }} />
          {p1parents && (
            <p className="font-heading text-xl leading-snug" style={{ color: 'var(--color-text)' }}>
              {p1parents}
            </p>
          )}
          {p2parents && (
            <p className="font-heading text-xl leading-snug mt-2" style={{ color: 'var(--color-text)' }}>
              {p2parents}
            </p>
          )}
        </>
      )}
    </AmoreaCard>
  );
}

// ── Dress code card ───────────────────────────────────────────────────────────

function AmoreaDressCode({ config }: { config: WeddingConfig }) {
  if (config.dress_code_enabled === false) return null;
  const title = cfgStr(config, 'dress_code_title') || 'Dress Code';
  const value = cfgStr(config, 'dress_code_value');
  const quote = cfgStr(config, 'amorea_love_quote');

  return (
    <AmoreaCard>
      <div className="flex items-stretch">
        <div className="flex-1 p-7 flex flex-col justify-center">
          <p className="font-body uppercase text-[10px] tracking-[0.3em] mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {title}
          </p>
          <p className="font-heading text-3xl leading-tight" style={{ color: 'var(--color-text)' }}>
            {value}
          </p>
        </div>
        <div
          className="w-28 flex items-center justify-center flex-shrink-0 rounded-r-2xl"
          style={{ background: 'var(--color-secondary)' }}
        >
          <CoupleSVG />
        </div>
      </div>
      {quote && (
        <div className="px-7 pb-6 text-center border-t" style={{ borderColor: 'var(--color-border)' }}>
          <p className="font-sub italic text-lg pt-5 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            "{quote}"
          </p>
        </div>
      )}
    </AmoreaCard>
  );
}

// ── Countdown ─────────────────────────────────────────────────────────────────

function AmoreaCountdown({ config }: { config: WeddingConfig }) {
  const countdown = useCountdown(config.dates.ceremony);
  const title = cfgStr(config, 'paper_countdown_title') || 'Faltan';
  const subtitle = cfgStr(config, 'paper_countdown_subtitle');
  const labels = [
    cfgStr(config, 'paper_countdown_days_label') || 'Días',
    cfgStr(config, 'paper_countdown_hours_label') || 'Horas',
    cfgStr(config, 'paper_countdown_minutes_label') || 'Minutos',
  ];
  const values = [countdown.days, countdown.hours, countdown.minutes];

  return (
    <AmoreaCard className="p-8 text-center">
      <p className="font-body uppercase text-[11px] tracking-[0.38em] mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {title}
      </p>
      <div className="grid grid-cols-3 gap-4">
        {values.map((val, i) => (
          <div key={labels[i]}>
            <p className="font-heading leading-none" style={{ fontSize: '3.2rem', color: 'var(--color-text)' }}>
              {String(val).padStart(2, '0')}
            </p>
            <p className="font-body text-[10px] uppercase tracking-[0.18em] mt-2" style={{ color: 'var(--color-text-muted)' }}>
              {labels[i]}
            </p>
          </div>
        ))}
      </div>
      {subtitle && (
        <p className="font-sub italic text-lg mt-6" style={{ color: 'var(--color-primary)' }}>
          {subtitle}
        </p>
      )}
    </AmoreaCard>
  );
}

// ── RSVP envelope card ────────────────────────────────────────────────────────

function AmoreaRSVPSection({ config }: { config: WeddingConfig }) {
  if (config.sections.rsvp?.enabled === false) return null;
  const rsvpTitle = cfgStr(config, 'paper_rsvp_title') || 'Confirmar Asistencia';

  return (
    <section id="rsvp" className="relative pt-2">
      <div
        className="absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl -z-0 pointer-events-none"
        style={{ background: 'var(--color-secondary)' }}
      />
      <div className="relative z-10">
        <p className="font-body uppercase text-[10px] tracking-[0.32em] text-center mb-5" style={{ color: 'var(--color-text-muted)' }}>
          {rsvpTitle}
        </p>
        <RSVP />
      </div>
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function AmoreaSkin() {
  const config = useConfig() as WeddingConfig;
  const floral = getFloralDecorConfig(config);
  const contentRef = useRef<HTMLDivElement>(null);
  const { couple, venues } = config;

  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;
  const initial1 = couple.person1.firstName[0] ?? '';
  const initial2 = couple.person2.firstName[0] ?? '';
  const tapLabel = cfgStr(config, 'amorea_opening_label') || 'Toca para abrir';
  const introLabel = cfgStr(config, 'paper_access_intro_label') || 'Invitación digital';
  const locationBtn = cfgStr(config, 'paper_location_button_label') || 'Ver ubicación';
  const ceremonyLabel = cfgStr(config, 'venues_ceremony_label') || 'Ceremonia';
  const receptionLabel = cfgStr(config, 'venues_reception_label') || 'Recepción';

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      {/* ── Hero section ── */}
      <section
        className="relative min-h-screen flex items-center justify-center px-5 py-20 overflow-hidden"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Subtle paper grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(62,123,87,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(62,123,87,0.04) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />
        <FloralDecorLayer
          enabled={floral.enabled}
          styleKey={floral.style}
          density={floral.density}
          opacity={floral.opacity}
          zone="hero"
        />

        <div className="relative z-10 max-w-sm mx-auto w-full text-center">
          {/* Intro label */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-body uppercase text-[10px] tracking-[0.38em] mb-6"
            style={{ color: 'var(--color-primary)' }}
          >
            {introLabel}
          </motion.p>

          {/* Drop-cap initials monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <span
              className="font-heading leading-none select-none"
              style={{ fontSize: 'clamp(5rem, 22vw, 7.5rem)', color: 'var(--color-text)', lineHeight: 0.88 }}
            >
              {initial1}
            </span>
            <div className="flex flex-col items-center gap-1 mx-1">
              <div className="w-px h-8" style={{ background: 'var(--color-accent)' }} />
              <span className="font-body text-[10px]" style={{ color: 'var(--color-accent)' }}>✦</span>
              <div className="w-px h-8" style={{ background: 'var(--color-accent)' }} />
            </div>
            <span
              className="font-heading leading-none select-none"
              style={{ fontSize: 'clamp(5rem, 22vw, 7.5rem)', color: 'var(--color-text)', lineHeight: 0.88 }}
            >
              {initial2}
            </span>
          </motion.div>

          {/* Calla lilies decorative divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mb-8 -mx-4"
          >
            <CallaLiliesTop opacity={0.72} />
          </motion.div>

          {/* Date + city */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-body text-xs uppercase tracking-[0.24em] mb-10"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {[config.dates.displayDate, venues.ceremony.city].filter(Boolean).join('  ·  ')}
          </motion.p>

          {/* Envelope CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="pb-10"
          >
            <AmoreaEnvelope tapLabel={tapLabel} onOpen={scrollToContent} />
          </motion.div>

          {/* Guest access */}
          <GuestAccessBanner config={config} />
        </div>
      </section>

      {/* ── Content section ── */}
      <div ref={contentRef} className="relative px-5 pb-20" style={{ background: 'var(--color-bg)' }}>
        <FloralDecorLayer
          enabled={floral.enabled}
          styleKey={floral.style}
          density={floral.density}
          opacity={floral.opacity}
          zone="content"
        />
        {/* Calla lilies at top of content */}
        <div className="-mx-5 mb-2 opacity-60">
          <CallaLiliesTop opacity={0.55} />
        </div>

        {/* Couple names large display */}
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-10 px-2"
          >
            <h1
              className="font-heading font-light leading-none"
              style={{ fontSize: 'clamp(2.6rem, 11vw, 4.2rem)', color: 'var(--color-text)' }}
            >
              {names}
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
              <span className="font-body text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--color-accent)' }}>
                {config.dates.displayDate}
              </span>
              <div className="h-px flex-1" style={{ background: 'var(--color-border)' }} />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="max-w-md mx-auto space-y-6">
          {/* Music */}
          <AmoreaMusicCard config={config} />

          {/* Parents / Formal text */}
          <AmoreaParentsCard config={config} />

          {/* Calendar badge */}
          <ScallopedCalendarBadge config={config} />

          {/* Venues */}
          <div id="recintos" className="space-y-5">
            <CeremonyCard venue={venues.ceremony} label={ceremonyLabel} btnLabel={locationBtn} />
            {!venues.sameVenue && (
              <ReceptionCard venue={venues.reception} label={receptionLabel} btnLabel={locationBtn} />
            )}
          </div>

          {/* Dress code */}
          <AmoreaDressCode config={config} />

          {/* Gift */}
          {config.gift_registry_enabled !== false || config.gift_bank_enabled ? (
            <AmoreaCard className="p-6 text-center">
              <Gift className="w-7 h-7 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
              {cfgStr(config, 'paper_gift_intro') && (
                <p className="font-body text-sm leading-relaxed mb-4" style={{ color: 'var(--color-text-muted)' }}>
                  {cfgStr(config, 'paper_gift_intro')}
                </p>
              )}
              <GiftRegistry />
            </AmoreaCard>
          ) : null}

          {/* Countdown */}
          <AmoreaCountdown config={config} />

          {/* RSVP */}
          <AmoreaRSVPSection config={config} />
        </div>
      </div>

      {config.sections.footer?.enabled !== false && <Footer />}
    </div>
  );
}

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Users, Star, Briefcase, Heart, Calendar,
  PartyPopper, Car, UtensilsCrossed, Tag,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useGuest } from '../context/GuestContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';
import type { GuestType, WeddingConfig } from '../types';

// ── Constants (UI-only, not business data) ────────────────────────────────────

const GUEST_TYPE_ICONS: Record<GuestType, React.ComponentType<{ className?: string }>> = {
  general: Users,
  family:  Heart,
  vip:     Star,
  staff:   Briefcase,
};

const GUEST_TYPE_COLORS: Record<GuestType, string> = {
  general: 'var(--color-primary)',
  family:  '#e06c75',
  vip:     '#c9a93c',
  staff:   '#61afef',
};

// ── Flag icons — UI primitives, not business data ─────────────────────────────
const FLAG_ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  after_party:   PartyPopper,
  transporte:    Car,
  hospedaje_vip: Star,
  cena_ensayo:   UtensilsCrossed,
  mesa_principal: Users,
  discurso:      Sparkles,
};

// ── Sub-components ────────────────────────────────────────────────────────────

function DaysCounter({ days, label }: { days: number; label: string }) {
  const displayLabel = label.replace('{days}', String(days));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-2xl"
      style={{
        background: 'color-mix(in srgb, var(--color-primary) 8%, transparent)',
        border: '1px solid color-mix(in srgb, var(--color-primary) 20%, transparent)',
      }}
    >
      <span
        className="font-heading font-light leading-none"
        style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', color: 'var(--color-primary)', letterSpacing: '0.04em' }}
      >
        {days}
      </span>
      <span
        className="font-body text-xs tracking-[0.15em] uppercase text-center"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {displayLabel}
      </span>
    </motion.div>
  );
}

function GuestTypeBadge({ guestType }: { guestType: GuestType }) {
  const config = useConfig();
  const cfg = config as typeof config & Record<string, unknown>;
  const Icon = GUEST_TYPE_ICONS[guestType] ?? Users;
  const color = GUEST_TYPE_COLORS[guestType] ?? 'var(--color-primary)';

  // Labels: config-driven with fallback map
  const labelMap: Record<GuestType, string> = {
    general: 'Invitado',
    family:  'Familia',
    vip:     'VIP',
    staff:   'Staff',
  };
  // Allow admin to override via config (future extension point)
  const label = (cfg[`guest_type_label_${guestType}`] as string | undefined) ?? labelMap[guestType] ?? 'Invitado';

  return (
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body"
      style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </motion.span>
  );
}

function PassesBadge({ passes, label }: { passes: number; label: string }) {
  const display = label.replace('{passes}', String(passes));
  return (
    <motion.span
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body"
      style={{
        background: 'var(--color-secondary)',
        color: 'var(--color-text-muted)',
        border: '1px solid var(--color-border)',
      }}
    >
      <Users className="w-3 h-3" />
      {display}
    </motion.span>
  );
}

interface FlagCardProps {
  flag: string;
  meta: { title: string; body: string };
}

function FlagCard({ flag, meta }: FlagCardProps) {
  const IconComp = FLAG_ICON_MAP[flag] ?? Tag;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3 p-4 rounded-xl"
      style={{
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderLeft: '3px solid var(--color-primary)',
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
      >
        <IconComp className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold font-sub" style={{ color: 'var(--color-text)' }}>
          {meta.title}
        </p>
        <p className="text-xs leading-relaxed mt-0.5 font-body" style={{ color: 'var(--color-text-muted)' }}>
          {meta.body}
        </p>
      </div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PersonalizedGreeting() {
  const config = useConfig();
  const guest = useGuest();

  if (!guest) return null;

  const cfg = config as typeof config & Record<string, unknown>;

  if (cfg.personalized_greeting_enabled === false) return null;

  const { invitation } = guest.data;
  const guestType = (invitation.guest_type ?? 'general') as GuestType;

  // Resolve all text from config (full parametrization)
  const title    = (cfg.personalized_greeting_title as string | undefined) ?? 'Tu invitación personal';
  const body     = (cfg.personalized_greeting_body  as string | undefined) ?? '';
  const passesLabel = (cfg.personalized_passes_label as string | undefined) ??
    'Hemos reservado {passes} lugar(es) especialmente para ti.';
  const showTypeB    = cfg.personalized_show_type_badge !== false;
  const showPasses   = cfg.personalized_show_passes     !== false;
  const showCountdown = cfg.personalized_show_countdown !== false;
  const countdownLabel = (cfg.personalized_countdown_label as string | undefined) ??
    'Faltan {days} días para el gran día';

  // Days until ceremony
  const daysUntil = useMemo(() => {
    try {
      const ceremony = new Date(config.dates.ceremony);
      const now = new Date();
      const diff = Math.ceil((ceremony.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(0, diff);
    } catch {
      return null;
    }
  }, [config.dates.ceremony]);

  // Conditional flags — title+body from config, fallback to formatted key
  const flagMeta = (cfg.conditional_flag_meta as WeddingConfig['conditional_flag_meta']) ?? {};
  const flags = invitation.conditional_flags ?? [];
  const resolvedFlags = flags.map((f) => ({
    key: f,
    meta: flagMeta[f] ?? {
      title: f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      body: '',
    },
  }));

  return (
    <section id="invitacion-personal" aria-label="Invitación personalizada">
      <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
        <div className="max-w-2xl mx-auto">

          {/* ── Header ────────────────────────────────────────────────── */}
          <AnimatedSection className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.05 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ background: 'var(--color-primary)' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            {title && (
              <p
                className="text-xs tracking-[0.25em] uppercase font-body font-medium mb-3"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {title}
              </p>
            )}

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-heading font-light leading-none mb-5"
              style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                color: 'var(--color-text)',
                letterSpacing: '0.04em',
              }}
            >
              {invitation.display_name}
            </motion.h2>

            <OrnamentDivider />
          </AnimatedSection>

          {/* ── Main card ─────────────────────────────────────────────── */}
          <AnimatedSection delay={0.1}>
            <div
              className="card p-6 sm:p-8 space-y-6"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.07)' }}
            >
              {/* Badges row */}
              {(showTypeB || showPasses) && (
                <div className="flex flex-wrap items-center gap-2">
                  {showTypeB && <GuestTypeBadge guestType={guestType} />}
                  {showPasses && invitation.allowed_passes > 0 && (
                    <PassesBadge passes={invitation.allowed_passes} label={passesLabel} />
                  )}
                </div>
              )}

              {/* Body text */}
              {body && (
                <p className="text-sm font-body leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {body}
                </p>
              )}

              {/* Days until event counter */}
              {showCountdown && daysUntil !== null && daysUntil > 0 && (
                <div className="flex justify-center">
                  <DaysCounter days={daysUntil} label={countdownLabel} />
                </div>
              )}

              {/* Date reminder */}
              {config.dates.displayDate && (
                <div className="flex items-center gap-3 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                  >
                    <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-medium font-sub" style={{ color: 'var(--color-text)' }}>
                      {config.dates.displayDate}
                    </p>
                    {config.venues.ceremony.city && (
                      <p className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>
                        {config.venues.ceremony.city}
                        {config.venues.ceremony.country ? `, ${config.venues.ceremony.country}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Conditional flags */}
              {resolvedFlags.length > 0 && (
                <div className="space-y-2">
                  <p
                    className="text-xs font-medium uppercase tracking-widest mb-3 font-body"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    Incluido en tu invitación
                  </p>
                  <div className="space-y-2">
                    {resolvedFlags.map(({ key, meta }) => (
                      <FlagCard key={key} flag={key} meta={meta} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}

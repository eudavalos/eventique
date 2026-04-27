import { motion } from 'framer-motion';
import { Sparkles, Users, Star, Briefcase, Heart, Tag } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useGuest } from '../context/GuestContext';
import AnimatedSection from '../components/AnimatedSection';
import type { GuestType } from '../types';

// ── Guest type visual config — labels from config, icons are UI primitives ──

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

const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  general: 'Invitado',
  family:  'Familia',
  vip:     'VIP',
  staff:   'Staff',
};

// ── Flag card — key formatted as readable label, no hardcoded content ─────────

function FlagCard({ flag }: { flag: string }) {
  const label = flag
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
      style={{ background: 'var(--color-secondary)', border: '1px solid var(--color-border)' }}
    >
      <Tag className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
      <span className="text-xs font-medium font-body" style={{ color: 'var(--color-text)' }}>
        {label}
      </span>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PersonalizedGreeting() {
  const config = useConfig();
  const guest = useGuest();

  if (!guest) return null;

  const {
    personalized_greeting_enabled,
    personalized_greeting_title,
    personalized_greeting_body,
    personalized_show_passes,
    personalized_passes_label,
    personalized_show_type_badge,
  } = config as typeof config & Record<string, unknown>;

  if (personalized_greeting_enabled === false) return null;

  const { invitation } = guest.data;
  const guestType = (invitation.guest_type ?? 'general') as GuestType;
  const TypeIcon = GUEST_TYPE_ICONS[guestType] ?? Users;
  const typeColor = GUEST_TYPE_COLORS[guestType] ?? 'var(--color-primary)';
  const typeLabel = GUEST_TYPE_LABELS[guestType] ?? 'Invitado';

  const passesLabel = ((personalized_passes_label as string | undefined) ??
    'Hemos reservado {passes} lugar(es) para ti en este evento.')
    .replace('{passes}', String(invitation.allowed_passes));

  const flags = invitation.conditional_flags ?? [];

  return (
    <section id="invitacion-personal" aria-label="Invitación personalizada">
      <div
        className="section-padding"
        style={{ background: 'var(--color-secondary)' }}
      >
        <div className="max-w-2xl mx-auto">
          <AnimatedSection className="text-center mb-8">
            {/* Sparkle icon */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
              style={{ background: 'var(--color-primary)' }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>

            {/* Section title */}
            {personalized_greeting_title && (
              <p className="text-xs tracking-[0.25em] uppercase font-body font-medium mb-3"
                style={{ color: 'var(--color-text-muted)' }}>
                {personalized_greeting_title as string}
              </p>
            )}

            {/* Guest name — main heading */}
            <h2
              className="font-heading font-light leading-none mb-4"
              style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                color: 'var(--color-text)',
                letterSpacing: '0.04em',
              }}
            >
              {invitation.display_name}
            </h2>

            {/* Divider */}
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
              <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />
            </div>
          </AnimatedSection>

          {/* Card with guest details */}
          <AnimatedSection delay={0.15}>
            <div
              className="card p-6 sm:p-8 space-y-5"
              style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
            >
              {/* Type badge + passes */}
              <div className="flex flex-wrap items-center gap-3">
                {(personalized_show_type_badge !== false) && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-body"
                    style={{ background: `${typeColor}18`, color: typeColor, border: `1px solid ${typeColor}30` }}
                  >
                    <TypeIcon className="w-3 h-3" />
                    {typeLabel}
                  </motion.span>
                )}

                {(personalized_show_passes !== false) && (
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
                    {passesLabel}
                  </motion.span>
                )}
              </div>

              {/* Body text */}
              {personalized_greeting_body && (
                <p
                  className="text-sm font-body leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {personalized_greeting_body as string}
                </p>
              )}

              {/* Conditional flags */}
              {flags.length > 0 && (
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest mb-3 font-body"
                    style={{ color: 'var(--color-text-muted)' }}>
                    Incluido en tu invitación
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {flags.map((flag) => (
                      <FlagCard key={flag} flag={flag} />
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

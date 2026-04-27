import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  Heart,
  X,
  Check,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Music,
  Users,
  Car,
  Star,
  UtensilsCrossed,
  PartyPopper,
  WifiOff,
  Lock,
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { rsvpApi } from '../lib/api';
import { OrnamentDivider, OrnamentFloral, OrnamentRings } from '../components/Ornament';
import AnimatedSection from '../components/AnimatedSection';
import type { PersonalizedInvitationData, WeddingConfig, EventConfig } from '../types';

// ── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  attending: boolean | null;
  guest_count: number;
  members: Array<{ full_name: string; dietary_restrictions: string; menu_preference: string }>;
  dietary_restrictions: string;
  song_request: string;
  message: string;
}

type ErrorKind = 'not_found' | 'blocked' | 'expired' | 'network' | null;

// ── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  attending: z.boolean({ required_error: 'Por favor elige una opción' }).nullable(),
  guest_count: z.number().min(1).max(20),
  members: z.array(
    z.object({
      full_name: z.string(),
      dietary_restrictions: z.string(),
      menu_preference: z.string(),
    })
  ),
  dietary_restrictions: z.string(),
  song_request: z.string(),
  message: z.string(),
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function extractEventConfig(data: PersonalizedInvitationData): Partial<WeddingConfig & EventConfig> {
  // The event_config from API is a raw Record — safely cast to partial WeddingConfig
  return data.event_config as unknown as Partial<WeddingConfig & EventConfig>;
}

function buildGoogleCalendarUrl(config: Partial<WeddingConfig & EventConfig>): string {
  const dates = config.dates;
  if (!dates?.ceremony) return '#';
  const start = dates.ceremony.replace(/[-:]/g, '').replace('T', 'T').slice(0, 15) + '00Z';
  const end = (dates.reception ?? dates.ceremony).replace(/[-:]/g, '').replace('T', 'T').slice(0, 15) + '00Z';
  const title = encodeURIComponent(config.couple?.displayNames ?? 'Evento');
  const venue = config.venues?.ceremony;
  const location = venue ? encodeURIComponent(`${venue.name}, ${venue.city}`) : '';
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&location=${location}`;
}

function buildWhatsAppShareUrl(invitationUrl: string, displayNames: string): string {
  const text = encodeURIComponent(`¡Estoy confirmando mi asistencia a ${displayNames}! ${invitationUrl}`);
  return `https://wa.me/?text=${text}`;
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
        className="w-12 h-12 rounded-full border-2 border-transparent"
        style={{
          borderTopColor: 'var(--color-primary)',
          borderRightColor: 'var(--color-primary-light, var(--color-primary))',
        }}
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="font-body text-sm tracking-[0.15em] uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Cargando tu invitación…
      </motion.p>
    </div>
  );
}

// ── Error screens ─────────────────────────────────────────────────────────────

function ErrorScreen({ kind }: { kind: ErrorKind }) {
  const configs: Record<NonNullable<ErrorKind>, { icon: React.ReactNode; title: string; body: string }> = {
    not_found: {
      icon: <AlertTriangle className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />,
      title: 'Esta invitación no existe',
      body: 'El enlace que seguiste no corresponde a ninguna invitación activa. Verifica que el enlace sea correcto.',
    },
    blocked: {
      icon: <Lock className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />,
      title: 'Invitación no disponible',
      body: 'Esta invitación no está disponible en este momento. Contacta a los organizadores si crees que esto es un error.',
    },
    expired: {
      icon: <Clock className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />,
      title: 'Plazo vencido',
      body: 'El plazo de confirmación de asistencia ha vencido. Si tienes consultas, contacta directamente a los organizadores.',
    },
    network: {
      icon: <WifiOff className="w-10 h-10" style={{ color: 'var(--color-accent)' }} />,
      title: 'Sin conexión',
      body: 'No pudimos cargar tu invitación. Por favor revisa tu conexión a internet e intenta nuevamente.',
    },
  };

  const cfg = kind ? configs[kind] : configs.not_found;

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-sm w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <OrnamentRings color="var(--color-accent)" size={28} />
        </div>
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: 'var(--color-secondary)' }}
        >
          {cfg.icon}
        </div>
        <h1
          className="font-heading text-2xl font-light mb-3"
          style={{ color: 'var(--color-text)' }}
        >
          {cfg.title}
        </h1>
        <OrnamentDivider />
        <p
          className="font-body text-sm leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {cfg.body}
        </p>
      </motion.div>
    </div>
  );
}

// ── Status Banner ─────────────────────────────────────────────────────────────

function StatusBanner({ status, alreadyResponded }: { status: string | null; alreadyResponded: boolean }) {
  if (!alreadyResponded) return null;

  const isDeclined = status === 'declined';

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl px-5 py-4 flex items-start gap-3"
      style={{
        background: isDeclined ? 'var(--color-surface)' : 'color-mix(in srgb, var(--color-primary) 12%, transparent)',
        border: `1px solid ${isDeclined ? 'var(--color-border)' : 'var(--color-primary)'}`,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: isDeclined ? 'var(--color-border)' : 'var(--color-primary)' }}
      >
        {isDeclined ? (
          <X className="w-4 h-4 text-white" />
        ) : (
          <Check className="w-4 h-4 text-white" />
        )}
      </div>
      <div>
        <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          {isDeclined ? 'Ya indicaste que no podrás asistir.' : 'Ya recibimos tu confirmación.'}
        </p>
        <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
          {isDeclined
            ? 'Puedes actualizar tu respuesta con el formulario de abajo.'
            : 'Puedes actualizar tu respuesta a continuación si algo cambia.'}
        </p>
      </div>
    </motion.div>
  );
}

// ── Conditional Flag Card ─────────────────────────────────────────────────────

const FLAG_META: Record<string, { icon: React.ReactNode; title: string; body: string }> = {
  after_party: {
    icon: <PartyPopper className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />,
    title: 'After Party',
    body: 'Estás invitado/a a continuar la celebración en la after party. Confirma asistencia en el formulario.',
  },
  transporte: {
    icon: <Car className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />,
    title: 'Transporte incluido',
    body: 'Hemos coordinado transporte especial para ti. Los detalles llegarán próximamente.',
  },
  hospedaje_vip: {
    icon: <Star className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />,
    title: 'Hospedaje VIP',
    body: 'Tu alojamiento ha sido coordinado. Recibirás información detallada por separado.',
  },
  cena_ensayo: {
    icon: <UtensilsCrossed className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />,
    title: 'Cena de Ensayo',
    body: 'Estás invitado/a a la cena de ensayo la noche anterior al evento. Los detalles se confirmarán.',
  },
};

function ConditionalFlagCards({ flags }: { flags: string[] }) {
  const known = flags.filter((f) => f in FLAG_META);
  if (!known.length) return null;

  return (
    <AnimatedSection delay={0.3}>
      <div className="space-y-3 mt-4">
        {known.map((flag) => {
          const meta = FLAG_META[flag];
          return (
            <div
              key={flag}
              className="card p-4 flex items-start gap-3"
              style={{ borderLeft: '3px solid var(--color-primary)' }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
              >
                {meta.icon}
              </div>
              <div>
                <p className="font-sub text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  {meta.title}
                </p>
                <p className="font-body text-xs leading-relaxed mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {meta.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AnimatedSection>
  );
}

// ── Confirmation Banner (post-submit) ─────────────────────────────────────────

function ConfirmationBanner({
  attending,
  config,
  rsvpSection,
}: {
  attending: boolean;
  config: Partial<WeddingConfig & EventConfig>;
  rsvpSection?: WeddingConfig['sections']['rsvp'];
}) {
  const calUrl = buildGoogleCalendarUrl(config);
  const mapsUrl = config.venues?.ceremony?.mapsUrl;
  const displayNames = config.couple?.displayNames ?? config.couple?.person1?.firstName ?? 'el evento';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="text-center py-8 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: attending ? 'var(--color-primary)' : 'var(--color-border)' }}
      >
        {attending ? (
          <Heart className="w-8 h-8 text-white fill-white" />
        ) : (
          <X className="w-8 h-8 text-white" />
        )}
      </motion.div>

      <h2
        className="font-heading text-3xl font-light mb-3"
        style={{ color: 'var(--color-text)' }}
      >
        {rsvpSection?.confirmationMessage ?? '¡Gracias por confirmar!'}
      </h2>

      <p className="font-body text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {attending
          ? `¡Nos emociona mucho verte en ${displayNames}!`
          : 'Lamentamos que no puedas estar, pero te tendremos en mente.'}
      </p>

      <OrnamentDivider />

      {attending && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          {calUrl !== '#' && (
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs gap-2"
            >
              <Calendar className="w-4 h-4" />
              Agregar al calendario
            </a>
          )}
          {mapsUrl && (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs gap-2"
            >
              <MapPin className="w-4 h-4" />
              Ver en Maps
            </a>
          )}
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PersonalizedInvitationPage() {
  const { slug = '', token = '' } = useParams<{ slug: string; token: string }>();

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorKind, setErrorKind] = useState<ErrorKind>(null);
  const [invData, setInvData] = useState<PersonalizedInvitationData | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submittedAttending, setSubmittedAttending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      attending: null,
      guest_count: 1,
      members: [],
      dietary_restrictions: '',
      song_request: '',
      message: '',
    },
  });

  const { fields: memberFields, replace: replaceMembers } = useFieldArray({
    control,
    name: 'members',
  });

  const attending = watch('attending');
  const guestCount = watch('guest_count');

  // Sync member fields when guestCount changes (only if allow_guest_member_names)
  const syncMemberFields = useCallback(
    (count: number, allowNames: boolean) => {
      if (!allowNames) return;
      const current = memberFields;
      if (count > current.length) {
        const extra = Array.from({ length: count - current.length }, () => ({
          full_name: '',
          dietary_restrictions: '',
          menu_preference: '',
        }));
        replaceMembers([...current, ...extra]);
      } else {
        replaceMembers(current.slice(0, count));
      }
    },
    [memberFields, replaceMembers]
  );

  // Load invitation
  useEffect(() => {
    if (!slug || !token) {
      setErrorKind('not_found');
      setLoadState('error');
      return;
    }

    // Track open (fire-and-forget)
    rsvpApi.trackInvitationOpen(slug, token, 'direct').catch(() => {});

    rsvpApi
      .getPersonalizedInvitation(slug, token)
      .then(({ data }) => {
        setInvData(data);
        setLoadState('ready');
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) setErrorKind('not_found');
        else if (status === 403) setErrorKind('blocked');
        else if (status === 410) setErrorKind('expired');
        else setErrorKind('network');
        setLoadState('error');
      });
  }, [slug, token]);

  const config = invData ? extractEventConfig(invData) : ({} as Partial<WeddingConfig & EventConfig>);
  const invitation = invData?.invitation;
  const sections = config.sections;
  const rsvpSection = sections?.rsvp;
  const heroSection = sections?.hero;

  const allowGuestCountChange = config.allow_guest_count_change !== false;
  const allowMemberNames = config.allow_guest_member_names === true;
  const showReservedMessage = config.show_reserved_passes_message !== false;

  const allowedPasses = invitation?.allowed_passes ?? 1;
  const displayName = invitation?.display_name ?? '';
  const conditionalFlags = invitation?.conditional_flags ?? [];

  const dates = config.dates;
  const venue = config.venues?.ceremony;
  const displayNames = config.couple?.displayNames ?? config.couple?.person1?.firstName ?? '';
  const displayDate = dates?.displayDate ?? dates?.ceremony?.slice(0, 10) ?? '';
  const city = venue?.city ?? '';
  const country = venue?.country ?? '';

  // Submit RSVP
  const onSubmit = async (values: FormValues) => {
    if (values.attending === null) {
      toast.error('Por favor indica si asistirás.');
      return;
    }
    setIsSubmitting(true);
    try {
      await rsvpApi.submitPersonalizedRSVP(slug, token, {
        attending: values.attending,
        guest_count: values.attending ? (values.guest_count ?? 1) : 0,
        members: allowMemberNames && values.attending
          ? values.members.filter((m) => m.full_name.trim()).map((m) => ({
              full_name: m.full_name,
              dietary_restrictions: m.dietary_restrictions || undefined,
              menu_preference: m.menu_preference || undefined,
            }))
          : undefined,
        dietary_restrictions: values.dietary_restrictions || undefined,
        song_request: values.song_request || undefined,
        message: values.message || undefined,
        source: 'personalized',
      });
      setSubmittedAttending(values.attending);
      setSubmitted(true);
      toast.success(values.attending ? '¡Confirmado! Hasta pronto.' : 'Respuesta registrada.');
    } catch {
      toast.error('No se pudo enviar tu respuesta. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (loadState === 'loading') return <LoadingSpinner />;
  if (loadState === 'error') return <ErrorScreen kind={errorKind} />;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', fontFamily: 'var(--font-body)' }}
    >
      {/* ── Hero Section ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden flex items-end pb-12 pt-24"
        style={{ minHeight: '65vh' }}
      >
        {/* Background */}
        <motion.div
          className="absolute inset-0 bg-center bg-cover"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            backgroundImage: heroSection?.backgroundImage
              ? `url(${heroSection.backgroundImage})`
              : 'linear-gradient(145deg, var(--color-primary-dark, var(--color-primary)) 0%, var(--color-primary) 55%, var(--color-accent) 100%)',
          }}
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ background: `rgba(0,0,0,${heroSection?.overlayOpacity ?? 0.42})` }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.28) 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 w-full max-w-xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex justify-center mb-5"
          >
            <OrnamentRings color="rgba(255,255,255,0.5)" size={26} />
          </motion.div>

          {/* Personalized greeting */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            className="font-body text-sm tracking-[0.2em] uppercase text-white/65 mb-3"
          >
            Invitación personal para
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-heading font-light text-white mb-4 leading-none"
            style={{ fontSize: 'clamp(2.4rem, 8vw, 4.5rem)', letterSpacing: '0.04em' }}
          >
            {displayName || '…'}
          </motion.h1>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.75 }}
            className="flex items-center justify-center gap-4 mb-5"
          >
            <div className="h-px w-14 bg-white/35" />
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 0L6.25 3.75L10 5L6.25 6.25L5 10L3.75 6.25L0 5L3.75 3.75L5 0Z" fill="rgba(255,255,255,0.6)" />
            </svg>
            <div className="h-px w-14 bg-white/35" />
          </motion.div>

          {/* Event name */}
          {displayNames && (
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.85 }}
              className="font-sub text-white/80 text-lg sm:text-xl tracking-widest font-light mb-2"
            >
              {displayNames}
            </motion.p>
          )}

          {/* Date + city */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.95 }}
            className="flex items-center justify-center gap-3 text-white/55 font-body text-xs tracking-[0.18em] uppercase"
          >
            {displayDate && <span>{displayDate}</span>}
            {displayDate && city && <span className="opacity-50">·</span>}
            {city && <span>{city}{country ? `, ${country}` : ''}</span>}
          </motion.div>

          {/* Scroll hint */}
          {heroSection?.showScrollIndicator !== false && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="mt-10 flex flex-col items-center gap-1.5 text-white/40"
            >
              <span className="font-body text-xs tracking-[0.15em] uppercase">Ver detalles</span>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          )}
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-4 py-10 space-y-8">

        {/* Reserved passes message */}
        {showReservedMessage && allowedPasses > 0 && (
          <AnimatedSection delay={0.1}>
            <div
              className="card p-5 flex items-center gap-4"
              style={{ borderLeft: '3px solid var(--color-primary)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'color-mix(in srgb, var(--color-primary) 14%, transparent)' }}
              >
                <Users className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                Hemos reservado{' '}
                <strong className="font-semibold">
                  {allowedPasses} {allowedPasses === 1 ? 'lugar' : 'lugares'}
                </strong>{' '}
                especialmente para ti.
              </p>
            </div>
          </AnimatedSection>
        )}

        {/* Already responded banner */}
        <AnimatedSection delay={0.15}>
          <StatusBanner status={invData?.rsvp_status ?? null} alreadyResponded={invData?.already_responded ?? false} />
        </AnimatedSection>

        {/* Conditional flag cards */}
        <ConditionalFlagCards flags={conditionalFlags} />

        {/* ── RSVP Form / Confirmation ─────────────────────────────────────── */}
        <AnimatedSection delay={0.2}>
          <div className="card overflow-hidden" style={{ boxShadow: '0 12px 48px rgba(0,0,0,0.07)' }}>

            {/* Section header */}
            <div
              className="px-6 pt-8 pb-6 text-center"
              style={{ borderBottom: '1px solid var(--color-border)' }}
            >
              <OrnamentFloral size={40} className="mx-auto mb-3 opacity-60" />
              <h2 className="font-heading text-2xl font-light" style={{ color: 'var(--color-text)' }}>
                {rsvpSection?.title ?? 'Confirmar asistencia'}
              </h2>
              {rsvpSection?.subtitle && (
                <p className="font-body text-sm mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  {rsvpSection.subtitle}
                </p>
              )}
            </div>

            <div className="px-6 pb-8 pt-6">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="confirmed"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ConfirmationBanner
                      attending={submittedAttending}
                      config={config}
                      rsvpSection={rsvpSection}
                    />
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                      {/* ── Attending choice ─────────────────────────────── */}
                      <div>
                        <p
                          className="font-sub text-base font-medium text-center mb-4"
                          style={{ color: 'var(--color-text)' }}
                        >
                          ¿Asistirás?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: true, label: '¡Sí, estaré!', sub: 'Con mucho gusto', icon: Heart },
                            { value: false, label: 'No podré', sub: 'Lamentablemente', icon: X },
                          ].map(({ value, label, sub, icon: Icon }) => {
                            const isSelected = attending === value;
                            return (
                              <motion.button
                                key={String(value)}
                                type="button"
                                onClick={() => setValue('attending', value)}
                                whileTap={{ scale: 0.97 }}
                                className="flex flex-col items-center gap-2.5 p-5 rounded-2xl border-2 transition-all duration-200"
                                style={{
                                  borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                  background: isSelected
                                    ? 'color-mix(in srgb, var(--color-primary) 10%, var(--color-surface))'
                                    : 'var(--color-surface)',
                                }}
                              >
                                <div
                                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200"
                                  style={{
                                    background: isSelected ? 'var(--color-primary)' : 'var(--color-secondary)',
                                  }}
                                >
                                  <Icon
                                    className="w-5 h-5"
                                    style={{ color: isSelected ? 'white' : 'var(--color-primary)' }}
                                  />
                                </div>
                                <div className="text-center">
                                  <p
                                    className="font-sub text-sm font-medium"
                                    style={{ color: 'var(--color-text)' }}
                                  >
                                    {label}
                                  </p>
                                  <p
                                    className="font-body text-xs font-light mt-0.5"
                                    style={{ color: 'var(--color-text-muted)' }}
                                  >
                                    {sub}
                                  </p>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                        {errors.attending && (
                          <p className="text-red-500 text-xs mt-2 text-center">{errors.attending.message}</p>
                        )}
                      </div>

                      {/* ── Attending-yes extras ─────────────────────────── */}
                      <AnimatePresence>
                        {attending === true && (
                          <motion.div
                            key="yes-extras"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden space-y-5"
                          >
                            {/* Guest count selector */}
                            {allowGuestCountChange && allowedPasses > 1 && (
                              <div>
                                <label className="input-label">
                                  <Users className="w-3.5 h-3.5 inline mr-1" />
                                  ¿Cuántos asistirán? (máx. {allowedPasses})
                                </label>
                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                  {Array.from({ length: allowedPasses }, (_, i) => i + 1).map((n) => (
                                    <button
                                      key={n}
                                      type="button"
                                      onClick={() => {
                                        setValue('guest_count', n);
                                        syncMemberFields(n, allowMemberNames);
                                      }}
                                      className="w-10 h-10 rounded-full border-2 font-body font-medium text-sm transition-all duration-200"
                                      style={{
                                        borderColor: guestCount === n ? 'var(--color-primary)' : 'var(--color-border)',
                                        background: guestCount === n ? 'var(--color-primary)' : 'var(--color-surface)',
                                        color: guestCount === n ? 'white' : 'var(--color-text)',
                                      }}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Member names */}
                            {allowMemberNames && memberFields.length > 0 && (
                              <div className="space-y-3">
                                <label className="input-label">
                                  Nombre de los acompañantes
                                </label>
                                {memberFields.map((field, idx) => (
                                  <div key={field.id} className="space-y-2">
                                    <input
                                      {...register(`members.${idx}.full_name`)}
                                      type="text"
                                      placeholder={`Acompañante ${idx + 1}`}
                                      className="input-field"
                                    />
                                    <input
                                      {...register(`members.${idx}.dietary_restrictions`)}
                                      type="text"
                                      placeholder="Restricciones alimentarias (opcional)"
                                      className="input-field text-sm"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Dietary restrictions (general) */}
                            {!allowMemberNames && (
                              <div>
                                <label className="input-label">
                                  Restricciones alimentarias (opcional)
                                </label>
                                <input
                                  {...register('dietary_restrictions')}
                                  type="text"
                                  placeholder="Vegetariano, sin gluten, alergias…"
                                  className="input-field"
                                />
                              </div>
                            )}

                            {/* Song request */}
                            {rsvpSection?.allowSongRequest !== false && (
                              <div>
                                <label className="input-label">
                                  <Music className="w-3.5 h-3.5 inline mr-1" />
                                  Solicitud musical (opcional)
                                </label>
                                <input
                                  {...register('song_request')}
                                  type="text"
                                  placeholder="¿Qué canción no puede faltar?"
                                  className="input-field"
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Message (always visible when form visible) */}
                      {rsvpSection?.allowMessage !== false && (
                        <div>
                          <label className="input-label">
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                            Mensaje para los organizadores (opcional)
                          </label>
                          <textarea
                            {...register('message')}
                            rows={3}
                            placeholder="Un deseo, una anécdota, lo que quieras compartir…"
                            className="input-field resize-none"
                          />
                        </div>
                      )}

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={isSubmitting || attending === null}
                        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Enviando…
                          </span>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            {attending === false
                              ? 'Confirmar que no asistiré'
                              : 'Confirmar asistencia'}
                          </>
                        )}
                      </button>

                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </AnimatedSection>

        {/* ── Event Info ──────────────────────────────────────────────────── */}
        {(venue || displayDate) && (
          <AnimatedSection delay={0.3}>
            <div className="card p-6 space-y-5">
              <h3
                className="font-sub text-base font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                Detalles del evento
              </h3>
              <OrnamentDivider className="my-0" />

              <div className="space-y-4">
                {displayDate && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <Calendar className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Fecha
                      </p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {displayDate}
                      </p>
                    </div>
                  </div>
                )}

                {venue?.time && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <Clock className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        Hora
                      </p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {venue.time}
                      </p>
                    </div>
                  </div>
                )}

                {venue && (
                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'color-mix(in srgb, var(--color-primary) 12%, transparent)' }}
                    >
                      <MapPin className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div>
                      <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {venue.name}
                      </p>
                      <p className="font-body text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {venue.address}{city ? `, ${city}` : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {venue?.mapsUrl && (
                  <a
                    href={venue.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Google Maps
                  </a>
                )}
                {dates?.ceremony && (
                  <a
                    href={buildGoogleCalendarUrl(config)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Agregar al calendario
                  </a>
                )}
                {displayNames && typeof window !== 'undefined' && (
                  <a
                    href={buildWhatsAppShareUrl(window.location.href, displayNames)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline text-xs gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Compartir
                  </a>
                )}
              </div>
            </div>
          </AnimatedSection>
        )}

        {/* Footer */}
        <AnimatedSection delay={0.4}>
          <div className="text-center py-6">
            <OrnamentRings color="var(--color-accent)" size={22} className="mx-auto mb-3" />
            <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {sections?.footer?.message ?? (displayNames ? `Con amor, ${displayNames}` : '')}
            </p>
            {config.social?.hashtag && (
              <p
                className="font-sub text-xs mt-1 font-medium"
                style={{ color: 'var(--color-accent)' }}
              >
                {config.social.hashtag}
              </p>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
}

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Heart, Check, X, ChevronRight, ChevronLeft, Music, MessageSquare, Users, UserCheck, Clock, Calendar, MapPin, Share2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useGuest } from '../context/GuestContext';
import { useEventSlug } from '../context/EventSlugContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentFloral } from '../components/Ornament';
import { rsvpApi } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiError';
import type { RSVPFormData, PersonalizedRSVPPayload } from '../types';

const baseSchema = z.object({
  name: z.string().min(2, 'Por favor ingresa tu nombre completo'),
  email: z.string().email('Correo electrónico inválido'),
  attending: z.enum(['yes', 'no']),
  guestCount: z.number().min(1).optional(),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  songRequest: z.string().optional(),
  message: z.string().optional(),
});

type FormSchema = z.infer<typeof baseSchema>;

const TOTAL_STEPS = 4;

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i + 1 === current ? 24 : 8,
            background: i + 1 <= current ? 'var(--color-primary)' : 'var(--color-border)',
          }}
          transition={{ duration: 0.3 }}
          className="h-2 rounded-full"
        />
      ))}
    </div>
  );
}

// ── Personalized RSVP already-responded screen ──────────────────────────────

function buildGoogleCalendarUrl(config: ReturnType<typeof useConfig>): string {
  try {
    const start = config.dates.ceremony.replace(/[-:]/g, '').replace('T', 'T');
    const startClean = start.replace(/[^0-9T]/g, '');
    const title = encodeURIComponent(`Boda de ${config.couple.displayNames ?? `${config.couple.person1.firstName} & ${config.couple.person2.firstName}`}`);
    const location = encodeURIComponent(`${config.venues.ceremony.name}, ${config.venues.ceremony.address}, ${config.venues.ceremony.city}`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startClean}/${startClean}&location=${location}`;
  } catch {
    return '';
  }
}

function PersonalizedAlreadyResponded({ confirmed_passes, status }: { confirmed_passes: number; status: string }) {
  const config = useConfig();
  const cfg = config as typeof config & Record<string, unknown>;
  const isAttending = status === 'confirmed' || status === 'partial';

  const confirmedTitle   = (cfg.personalized_rsvp_confirmed_title as string | undefined) ?? '¡Gracias por confirmar!';
  const confirmedBodyYes = (cfg.personalized_rsvp_confirmed_body_attending as string | undefined) ?? '¡Nos emociona mucho verte en este día tan especial!';
  const confirmedBodyNo  = (cfg.personalized_rsvp_confirmed_body_declined as string | undefined)  ?? 'Lamentamos que no puedas estar, pero te tendremos muy presente.';

  const calendarUrl = buildGoogleCalendarUrl(config);
  const mapsUrl = config.venues.ceremony.mapsUrl;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: confirmedTitle, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => toast.success('Enlace copiado')).catch(() => {});
    }
  };

  return (
    <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
      <div className="max-w-lg mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: isAttending ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
        >
          {isAttending
            ? <UserCheck className="w-8 h-8 text-white" />
            : <Clock className="w-8 h-8 text-white" />
          }
        </motion.div>

        <AnimatedSection delay={0.2}>
          <h2 className="section-title text-3xl mb-3">{confirmedTitle}</h2>
          <p className="font-body text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            {isAttending ? confirmedBodyYes : confirmedBodyNo}
          </p>
          {isAttending && confirmed_passes > 0 && (
            <p className="font-body text-xs font-medium mb-4" style={{ color: 'var(--color-primary)' }}>
              {confirmed_passes} {confirmed_passes === 1 ? 'lugar confirmado' : 'lugares confirmados'}
            </p>
          )}
          <OrnamentDivider />
        </AnimatedSection>

        {isAttending && (
          <AnimatedSection delay={0.35}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
              {calendarUrl && (
                <a
                  href={calendarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-medium transition-all"
                  style={{
                    background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                    color: 'var(--color-primary)',
                    border: '1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)',
                  }}
                >
                  <Calendar className="w-4 h-4" />
                  Añadir al calendario
                </a>
              )}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-medium transition-all"
                  style={{
                    background: 'var(--color-bg)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  <MapPin className="w-4 h-4" />
                  Ver ubicación
                </a>
              )}
              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-body font-medium transition-all"
                style={{
                  background: 'var(--color-bg)',
                  color: 'var(--color-text-muted)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
            </div>
          </AnimatedSection>
        )}
      </div>
    </div>
  );
}

// ── Personalized RSVP form ───────────────────────────────────────────────────

function PersonalizedRSVPView() {
  const config = useConfig();
  const eventSlug = useEventSlug();
  const guest = useGuest()!;
  const { rsvp } = config.sections;
  const cfg = config as typeof config & Record<string, unknown>;
  const { data, tokenLookup, refresh } = guest;
  const { invitation } = data;

  const [step, setStep] = useState(1);
  const [attending, setAttending] = useState<boolean | null>(null);
  const [guestCount, setGuestCount] = useState(1);
  const [memberNames, setMemberNames] = useState<string[]>(['']);
  const [dietary, setDietary] = useState('');
  const [songRequest, setSongRequest] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxPasses = invitation.allowed_passes;
  const allowMemberNames = cfg.allow_guest_member_names === true;
  const allowCountChange = cfg.allow_guest_count_change !== false;
  const allowDiet = rsvp.allowDietaryRestrictions === true;
  const allowSong = rsvp.allowSongRequest === true;
  const allowMsg  = rsvp.allowMessage !== false;

  const title    = (cfg.personalized_rsvp_title as string | undefined)    ?? rsvp.title    ?? 'Confirmar asistencia';
  const subtitle = (cfg.personalized_rsvp_subtitle as string | undefined) ?? rsvp.subtitle;
  const step1Title          = (cfg.personalized_rsvp_step1_title as string | undefined)           ?? '¿Podrás acompañarnos?';
  const step2AttendingTitle = (cfg.personalized_rsvp_step2_attending_title as string | undefined) ?? 'Cuéntanos más';
  const step2DeclinedTitle  = (cfg.personalized_rsvp_step2_declined_title as string | undefined)  ?? 'Lo entendemos';
  const step2DeclinedBody   = (cfg.personalized_rsvp_step2_declined_body as string | undefined)   ?? 'Gracias por hacernos saber. Te tendremos en mente en nuestro día especial.';
  const step3Title          = (cfg.personalized_rsvp_step3_title as string | undefined)           ?? 'Un último detalle';

  const handleCountChange = (n: number) => {
    setGuestCount(n);
    setMemberNames((prev) => {
      const next = [...prev];
      while (next.length < n) next.push('');
      return next.slice(0, n);
    });
  };

  const handleSubmit = async () => {
    if (attending === null) return;
    setLoading(true);
    try {
      const payload: PersonalizedRSVPPayload = {
        attending,
        guest_count: attending ? guestCount : 0,
        source: 'personalized',
        dietary_restrictions: dietary.trim() || undefined,
        song_request: songRequest.trim() || undefined,
        message: message.trim() || undefined,
        members: (attending && allowMemberNames)
          ? memberNames.filter(Boolean).map((n) => ({ full_name: n }))
          : undefined,
      };
      await rsvpApi.submitPersonalizedRSVP(eventSlug, tokenLookup, payload);
      setSubmitted(true);
      refresh();
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Error al enviar. Intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted || data.already_responded) {
    return (
      <PersonalizedAlreadyResponded
        confirmed_passes={invitation.confirmed_passes}
        status={invitation.status}
      />
    );
  }

  // Step 3 only exists when there is at least one extra field to show
  const hasStep3 = allowSong || allowMsg;
  const TOTAL_STEPS = attending === true && hasStep3 ? 3 : 2;

  return (
    <div className="section-padding relative overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
      <OrnamentFloral className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20" size={260} />
      <OrnamentFloral className="absolute -left-12 top-1/4 opacity-15" size={200} />

      <div className="max-w-lg mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          {rsvp.deadline && (
            <p className="text-xs tracking-[0.15em] uppercase font-body font-medium mt-4"
              style={{ color: 'var(--color-accent)' }}>
              Antes del {new Date(rsvp.deadline + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <OrnamentDivider />
        </AnimatedSection>

        <div className="card p-8 sm:p-10" style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.08)' }}>
          <StepIndicator current={step} total={TOTAL_STEPS} />

          <AnimatePresence mode="wait">

            {/* STEP 1 — attendance */}
            {step === 1 && (
              <motion.div key="p-step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}>
                <h3 className="font-sub text-xl font-medium mb-8 text-center" style={{ color: 'var(--color-text)' }}>
                  {step1Title}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: true,  label: '¡Sí, estaré!', icon: Heart,  desc: 'Con mucho gusto' },
                    { value: false, label: 'No podré',     icon: X,      desc: 'Lamentablemente' },
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button key={String(value)} type="button"
                      onClick={() => { setAttending(value); setStep(2); }}
                      className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-secondary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.background = 'var(--color-bg)'; }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--color-secondary)' }}>
                        <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                      </div>
                      <div className="text-center">
                        <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                        <p className="font-body text-xs font-light mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2 — details (if attending) or short message (if not) */}
            {step === 2 && (
              <motion.div key="p-step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }} className="space-y-5">
                {attending ? (
                  <>
                    <h3 className="font-sub text-xl font-medium mb-2 text-center" style={{ color: 'var(--color-text)' }}>
                      {step2AttendingTitle}
                    </h3>

                    {allowCountChange && maxPasses > 1 && (
                      <div>
                        <label className="input-label">
                          <Users className="w-3.5 h-3.5 inline mr-1" />
                          ¿Cuántos asistirán? (máx. {maxPasses})
                        </label>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {Array.from({ length: maxPasses }, (_, i) => i + 1).map((n) => (
                            <button key={n} type="button" onClick={() => handleCountChange(n)}
                              className="w-10 h-10 rounded-full border-2 font-body font-medium text-sm transition-all duration-200"
                              style={{
                                borderColor: guestCount === n ? 'var(--color-primary)' : 'var(--color-border)',
                                background: guestCount === n ? 'var(--color-primary)' : 'var(--color-bg)',
                                color: guestCount === n ? 'white' : 'var(--color-text)',
                              }}>
                              {n}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {allowMemberNames && (
                      <div className="space-y-2">
                        <label className="input-label">Nombre de cada asistente</label>
                        {Array.from({ length: guestCount }).map((_, i) => (
                          <input key={i} value={memberNames[i] ?? ''} onChange={(e) => {
                              const next = [...memberNames]; next[i] = e.target.value; setMemberNames(next);
                            }}
                            className="input-field" placeholder={`Persona ${i + 1}`} />
                        ))}
                      </div>
                    )}

                    {allowDiet && (
                      <div>
                        <label className="input-label">Restricciones dietéticas (opcional)</label>
                        <input value={dietary} onChange={(e) => setDietary(e.target.value)}
                          className="input-field" placeholder="Vegetariano, sin gluten, alergias…" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <h3 className="font-sub text-xl font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                      {step2DeclinedTitle}
                    </h3>
                    <p className="font-body text-sm font-light" style={{ color: 'var(--color-text-muted)' }}>
                      {step2DeclinedBody}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(1)} className="btn-outline flex-1 justify-center">
                    <ChevronLeft className="w-4 h-4" /> Volver
                  </button>
                  {attending ? (
                    <button
                      type="button"
                      onClick={() => hasStep3 ? setStep(3) : handleSubmit()}
                      disabled={loading}
                      className="btn-primary flex-1 justify-center disabled:opacity-50"
                    >
                      {loading
                        ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        : hasStep3 ? <><span>Continuar</span> <ChevronRight className="w-4 h-4" /></> : <><Check className="w-4 h-4" /> Confirmar asistencia</>}
                    </button>
                  ) : (
                    <button type="button" onClick={handleSubmit} disabled={loading}
                      className="btn-primary flex-1 justify-center disabled:opacity-50">
                      {loading ? <span className="animate-spin">⏳</span> : <><Check className="w-4 h-4" /> Enviar</>}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3 — extras (song, message) — only if attending */}
            {step === 3 && attending && (
              <motion.div key="p-step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }} className="space-y-5">
                <h3 className="font-sub text-xl font-medium mb-6 text-center" style={{ color: 'var(--color-text)' }}>
                  {step3Title}
                </h3>

                {allowSong && (
                  <div>
                    <label className="input-label">
                      <Music className="w-3.5 h-3.5 inline mr-1" />
                      Solicitud musical (opcional)
                    </label>
                    <input value={songRequest} onChange={(e) => setSongRequest(e.target.value)}
                      className="input-field" placeholder="¿Qué canción no puede faltar?" />
                  </div>
                )}

                {allowMsg && (
                  <div>
                    <label className="input-label">
                      <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                      Mensaje (opcional)
                    </label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)}
                      rows={3} className="input-field resize-none"
                      placeholder="Un deseo, una anécdota, lo que quieras compartir…" />
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setStep(2)} className="btn-outline px-4">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={handleSubmit} disabled={loading}
                    className="btn-primary flex-1 justify-center disabled:opacity-50">
                    {loading
                      ? <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      : <><Check className="w-4 h-4" /> Confirmar asistencia</>
                    }
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Generic RSVP (public, no token) ──────────────────────────────────────────

export default function RSVP() {
  const guest = useGuest();

  // Personalized route: use token-based RSVP flow
  if (guest) return <PersonalizedRSVPView />;

  // Generic flow below (unchanged)
  return <GenericRSVP />;
}

function GenericRSVP() {
  const config = useConfig();
  const eventSlug = useEventSlug();
  const { rsvp } = config.sections;
  const [step, setStep] = useState(1);
  const [attending, setAttending] = useState<'yes' | 'no' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const maxGuests = rsvp.maxGuestsPerResponse ?? 8;
  const schema = useMemo(
    () => baseSchema.extend({ guestCount: z.number().min(1).max(maxGuests).optional() }),
    [maxGuests],
  );

  const { register, handleSubmit, watch, setValue, trigger, formState: { errors } } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { guestCount: 1 },
  });

  const guestCount = watch('guestCount') ?? 1;

  const onSubmit = async (data: FormSchema) => {
    setLoading(true);
    try {
      await rsvpApi.submit(eventSlug, data as RSVPFormData);
      setSubmitted(true);
    } catch (e: unknown) {
      toast.error(getApiErrorMessage(e, 'Hubo un error. Por favor intenta de nuevo.'));
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  if (submitted) {
    return (
      <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
        <div className="max-w-lg mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-primary)' }}
          >
            <Heart className="w-8 h-8 text-white fill-white" />
          </motion.div>
          <AnimatedSection delay={0.2}>
            <h2 className="section-title text-4xl mb-4">
              {rsvp.confirmationMessage ?? '¡Gracias por confirmar!'}
            </h2>
            <p className="section-subtitle">
              {attending === 'yes'
                ? 'Estamos muy emocionados de compartir este día especial contigo.'
                : 'Lamentamos que no puedas estar, pero te tendremos en mente.'}
            </p>
            <OrnamentDivider />
            <p className="text-sm font-body" style={{ color: 'var(--color-text-muted)' }}>
              {config.social?.hashtag}
            </p>
          </AnimatedSection>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding relative overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
      <OrnamentFloral
        className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20"
        size={260}
      />
      <OrnamentFloral
        className="absolute -left-12 top-1/4 opacity-15"
        size={200}
      />

      <div className="max-w-lg mx-auto relative z-10">
        <AnimatedSection className="text-center mb-12">
          <h2 className="section-title">{rsvp.title ?? 'RSVP'}</h2>
          {rsvp.subtitle && <p className="section-subtitle">{rsvp.subtitle}</p>}
          {rsvp.deadline && (
            <p className="text-xs tracking-[0.15em] uppercase font-body font-medium mt-4" style={{ color: 'var(--color-accent)' }}>
              Antes del {new Date(rsvp.deadline + 'T12:00:00').toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <OrnamentDivider />
        </AnimatedSection>

        <div
          className="card p-8 sm:p-10"
          style={{ boxShadow: '0 16px 64px rgba(0,0,0,0.08)' }}
        >
          <StepIndicator current={step} total={TOTAL_STEPS} />

          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">

              {/* STEP 1: Personal info */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="font-sub text-xl font-medium mb-6 text-center" style={{ color: 'var(--color-text)' }}>
                    ¿Quién confirma?
                  </h3>

                  <div>
                    <label className="input-label">Nombre completo *</label>
                    <input
                      {...register('name')}
                      type="text"
                      placeholder="Tu nombre completo"
                      className="input-field"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="input-label">Correo electrónico *</label>
                    <input
                      {...register('email')}
                      type="email"
                      placeholder="tu@email.com"
                      className="input-field"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      const isValid = await trigger(['name', 'email']);
                      if (isValid) nextStep();
                    }}
                    disabled={!!(errors.name || errors.email)}
                    className="btn-primary w-full justify-center mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continuar <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Attendance */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="font-sub text-xl font-medium mb-8 text-center" style={{ color: 'var(--color-text)' }}>
                    ¿Podrás acompañarnos?
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'yes', label: '¡Sí, estaré!', icon: Heart, description: 'Con mucho gusto' },
                      { value: 'no', label: 'No podré', icon: X, description: 'Lamentablemente' },
                    ].map(({ value, label, icon: Icon, description }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setValue('attending', value as 'yes' | 'no');
                          setAttending(value as 'yes' | 'no');
                          nextStep();
                        }}
                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-300 group"
                        style={{
                          borderColor: 'var(--color-border)',
                          background: 'var(--color-bg)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-primary)';
                          e.currentTarget.style.background = 'var(--color-secondary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--color-border)';
                          e.currentTarget.style.background = 'var(--color-bg)';
                        }}
                      >
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                          style={{ background: 'var(--color-secondary)' }}
                        >
                          <Icon className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="text-center">
                          <p className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                          <p className="font-body text-xs font-light mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <button type="button" onClick={prevStep} className="btn-outline w-full justify-center mt-4">
                    <ChevronLeft className="w-4 h-4" /> Volver
                  </button>
                </motion.div>
              )}

              {/* STEP 3: Guest details */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  {attending === 'yes' ? (
                    <>
                      <h3 className="font-sub text-xl font-medium mb-6 text-center" style={{ color: 'var(--color-text)' }}>
                        Cuéntanos más
                      </h3>

                      {rsvp.allowPlusOne && (
                        <div>
                          <label className="input-label">
                            <Users className="w-3.5 h-3.5 inline mr-1" />
                            ¿Cuántos asistirán en tu grupo?
                          </label>
                          <div className="flex items-center gap-4 mt-2">
                            {Array.from({ length: rsvp.maxGuestsPerResponse ?? 4 }, (_, i) => i + 1).map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setValue('guestCount', n)}
                                className="w-10 h-10 rounded-full border-2 font-body font-medium text-sm transition-all duration-200"
                                style={{
                                  borderColor: guestCount === n ? 'var(--color-primary)' : 'var(--color-border)',
                                  background: guestCount === n ? 'var(--color-primary)' : 'var(--color-bg)',
                                  color: guestCount === n ? 'white' : 'var(--color-text)',
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {rsvp.allowDietaryRestrictions && (
                        <div>
                          <label className="input-label">Restricciones dietéticas (opcional)</label>
                          <input
                            {...register('dietaryRestrictions')}
                            type="text"
                            placeholder="Vegetariano, sin gluten, alergias…"
                            className="input-field"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <h3 className="font-sub text-xl font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                        Lo entendemos
                      </h3>
                      <p className="font-body text-sm font-light" style={{ color: 'var(--color-text-muted)' }}>
                        Gracias por hacernos saber. Te tendremos en mente en nuestro día especial.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={prevStep} className="btn-outline flex-1 justify-center">
                      <ChevronLeft className="w-4 h-4" /> Volver
                    </button>
                    <button type="button" onClick={nextStep} className="btn-primary flex-1 justify-center">
                      Continuar <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Fun stuff + submit */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <h3 className="font-sub text-xl font-medium mb-6 text-center" style={{ color: 'var(--color-text)' }}>
                    Un último detalle
                  </h3>

                  {rsvp.allowSongRequest && attending === 'yes' && (
                    <div>
                      <label className="input-label">
                        <Music className="w-3.5 h-3.5 inline mr-1" />
                        Solicitud musical (opcional)
                      </label>
                      <input
                        {...register('songRequest')}
                        type="text"
                        placeholder="¿Qué canción no puede faltar?"
                        className="input-field"
                      />
                    </div>
                  )}

                  {rsvp.allowMessage && (
                    <div>
                      <label className="input-label">
                        <MessageSquare className="w-3.5 h-3.5 inline mr-1" />
                        Mensaje para los novios (opcional)
                      </label>
                      <textarea
                        {...register('message')}
                        rows={3}
                        placeholder="Un deseo, una anécdota, lo que quieras compartir…"
                        className="input-field resize-none"
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={prevStep} className="btn-outline px-4">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex-1 justify-center"
                    >
                      {loading ? (
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
                          Confirmar {attending === 'yes' ? 'asistencia' : 'respuesta'}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}

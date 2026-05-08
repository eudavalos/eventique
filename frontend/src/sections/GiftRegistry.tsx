import { motion } from 'framer-motion';
import { Gift, ExternalLink, Heart, Star, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentFloral } from '../components/Ornament';
import type { WeddingConfig } from '../types';

// ── Bank account row ──────────────────────────────────────────────────────────

function BankAccountRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      toast.success(`${label} copiado`);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('No se pudo copiar'));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
      style={{
        background: 'rgba(255,255,255,0.10)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="min-w-0">
        <p
          className="text-xs font-body font-medium uppercase tracking-[0.18em]"
          style={{ color: 'rgba(255,255,255,0.60)' }}
        >
          {label}
        </p>
        <p
          className="font-sub font-medium text-sm mt-0.5 truncate"
          style={{ color: 'rgba(255,255,255,0.95)', letterSpacing: '0.04em' }}
        >
          {value}
        </p>
      </div>
      <button
        onClick={handleCopy}
        title="Copiar"
        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
        style={{
          background: copied ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.20)',
          color: 'rgba(255,255,255,0.80)',
        }}
      >
        {copied
          ? <Check className="w-3.5 h-3.5" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </button>
    </motion.div>
  );
}

// ── Bank gift section (dark design) ──────────────────────────────────────────

function BankGiftSection() {
  const config = useConfig();
  const {
    gift_bank_enabled,
    gift_bank_title,
    gift_bank_body,
    gift_bank_accounts,
  } = config as WeddingConfig;

  if (!gift_bank_enabled) return null;

  const title    = gift_bank_title    || 'Obsequio';
  const body     = gift_bank_body     || 'Tu presencia es nuestro mejor regalo. Si aún así querés tener un detalle, te dejamos nuestros datos bancarios:';
  const accounts = gift_bank_accounts ?? [];

  return (
    <section id="obsequio" aria-label="Datos bancarios para obsequio">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
        style={{ background: 'var(--color-primary)' }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)',
          }}
        />

        <div className="section-padding relative z-10">
          <div className="max-w-md mx-auto">

            {/* ── Icon + header ──────────────────────────────────────────── */}
            <AnimatedSection className="text-center mb-8">
              {/* Decorative thread */}
              <div
                className="w-px mx-auto mb-4"
                style={{
                  height: 48,
                  background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.40))',
                }}
              />

              {/* Gift icon */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full mx-auto mb-5"
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.22)',
                }}
              >
                <Gift className="w-9 h-9" style={{ color: 'rgba(255,255,255,0.92)' }} />
              </motion.div>

              {/* Title */}
              <p
                className="text-xs tracking-[0.35em] uppercase font-body font-medium mb-3"
                style={{ color: 'rgba(255,255,255,0.55)' }}
              >
                {title}
              </p>

              {/* Decorative line */}
              <div
                className="w-10 h-px mx-auto mb-5"
                style={{ background: 'rgba(255,255,255,0.25)' }}
              />

              {/* Body */}
              {body && (
                <p
                  className="font-body text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.75 }}
                >
                  {body}
                </p>
              )}
            </AnimatedSection>

            {/* ── Bank accounts ──────────────────────────────────────────── */}
            {accounts.length > 0 && (
              <AnimatedSection delay={0.15}>
                <div className="space-y-3 mt-6">
                  {accounts.map((acc, i) => (
                    <BankAccountRow key={i} label={acc.label} value={acc.value} />
                  ))}
                </div>
              </AnimatedSection>
            )}

            {/* Bottom thread */}
            <div className="mt-10 flex justify-center">
              <div
                className="w-px"
                style={{
                  height: 32,
                  background: 'linear-gradient(to bottom, rgba(255,255,255,0.30), transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

// ── External registry section (existing design) ───────────────────────────────

function GiftRegistryLink() {
  const config = useConfig();
  const {
    gift_registry_enabled,
    gift_registry_url,
    gift_registry_label,
    gift_registry_title,
    gift_registry_description,
  } = config;

  if (gift_registry_enabled === false || !gift_registry_url) return null;

  const title       = gift_registry_title       || 'Mesa de Regalos';
  const label       = gift_registry_label       || 'Ver lista de regalos';
  const description = gift_registry_description ||
    'Hemos preparado una selección especial para ayudarte a elegirnos el obsequio perfecto. Tu generosidad hace que este día sea aún más memorable.';

  let registryHost = '';
  try { registryHost = new URL(gift_registry_url).hostname.replace('www.', ''); } catch { /* noop */ }

  return (
    <div className="section-padding relative overflow-hidden" style={{ background: 'var(--color-secondary)' }}>
      <OrnamentFloral className="absolute top-10 right-10 opacity-[0.08]" size={220} />
      <OrnamentFloral className="absolute bottom-10 left-10 opacity-[0.06]" size={170} />

      <div className="max-w-3xl mx-auto relative z-10">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
          <p className="section-subtitle">
            Tu presencia es el regalo más valioso que nos pueden dar.
          </p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="card overflow-hidden"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.10)' }}
        >
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">
            <div
              className="relative flex flex-col items-center justify-center gap-4 py-12 px-8 border-b sm:border-b-0 sm:border-r"
              style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border)' }}
            >
              <OrnamentFloral className="absolute opacity-[0.12]" size={130} />
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 92, height: 92, background: 'var(--color-primary)' }}
                  animate={{ opacity: [0.14, 0, 0.14], scale: [1, 1.75, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 92, height: 92, background: 'var(--color-primary)' }}
                  animate={{ opacity: [0.07, 0, 0.07], scale: [1, 2.3, 1] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                />
                <motion.div
                  className="relative w-[92px] h-[92px] rounded-full flex items-center justify-center"
                  style={{ background: 'var(--color-surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Gift className="w-10 h-10" style={{ color: 'var(--color-primary)' }} />
                </motion.div>
              </div>
              <div className="text-center">
                <p
                  className="font-body text-xs tracking-[0.22em] uppercase font-semibold mt-2"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Lista de Regalos
                </p>
                <p className="font-body text-xs mt-1.5 font-light" style={{ color: 'var(--color-text-muted)' }}>
                  Selección especial
                </p>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                {[Heart, Star, Heart].map((Icon, i) => (
                  <Icon
                    key={i}
                    className="w-3 h-3"
                    style={{ color: 'var(--color-primary)', opacity: i === 1 ? 0.8 : 0.3 }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 sm:pl-12">
              <div className="space-y-3">
                <h3
                  className="font-heading font-light leading-snug"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}
                >
                  Regalo con mucho amor
                </h3>
                <p className="font-body text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {description}
                </p>
              </div>
              <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />
              <div className="space-y-3">
                <a
                  href={gift_registry_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary w-full justify-center"
                >
                  <Gift className="w-4 h-4" />
                  {label}
                  <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                </a>
                {registryHost && (
                  <p
                    className="text-center font-body"
                    style={{ color: 'var(--color-text-muted)', fontSize: '11px', letterSpacing: '0.06em', opacity: 0.7 }}
                  >
                    Acceso seguro · {registryHost}
                  </p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Main export — renders both sections if configured ─────────────────────────

export default function GiftRegistry() {
  const config = useConfig();
  const showLink = config.gift_registry_enabled !== false && !!config.gift_registry_url;
  const showBank = !!(config as WeddingConfig).gift_bank_enabled;

  if (!showLink && !showBank) return null;

  return (
    <>
      {showLink && <GiftRegistryLink />}
      {showBank  && <BankGiftSection />}
    </>
  );
}

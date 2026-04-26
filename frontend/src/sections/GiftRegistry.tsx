import { motion } from 'framer-motion';
import { Gift, ExternalLink, Heart, Star } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentFloral } from '../components/Ornament';

export default function GiftRegistry() {
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

        {/* ── Section header ─────────────────────────────────────────── */}
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
          <p className="section-subtitle">
            Tu presencia es el regalo más valioso que nos pueden dar.
          </p>
        </AnimatedSection>

        {/* ── Main card ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="card overflow-hidden"
          style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.10)' }}
        >
          {/* Gradient accent bar */}
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-accent) 100%)' }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-[260px_1fr]">

            {/* Left decorative panel */}
            <div
              className="relative flex flex-col items-center justify-center gap-4 py-12 px-8 border-b sm:border-b-0 sm:border-r"
              style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border)' }}
            >
              <OrnamentFloral className="absolute opacity-[0.12]" size={130} />

              {/* Pulsing gift icon */}
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

              {/* Decorative dots row */}
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

            {/* Right content panel */}
            <div className="flex flex-col justify-center gap-6 p-8 sm:p-10 sm:pl-12">

              <div className="space-y-3">
                <h3
                  className="font-heading font-light leading-snug"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}
                >
                  Regalo con mucho amor
                </h3>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {description}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px w-12" style={{ background: 'var(--color-border)' }} />

              {/* CTA block */}
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

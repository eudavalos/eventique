import { motion } from 'framer-motion';
import { Gift, ExternalLink } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';

export default function GiftRegistry() {
  const config = useConfig();
  const { gift_registry_url, gift_registry_label } = config as typeof config & {
    gift_registry_url?: string;
    gift_registry_label?: string;
  };

  if (!gift_registry_url) return null;

  const label = gift_registry_label || 'Ver mesa de regalos';

  return (
    <div className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <AnimatedSection className="text-center mb-10">
          <h2 className="section-title">Mesa de Regalos</h2>
          <OrnamentDivider />
          <p className="font-body text-base mt-4" style={{ color: 'var(--color-text-muted)' }}>
            Tu presencia es el mejor regalo. Si deseas hacernos un obsequio, aquí encontrarás nuestras opciones.
          </p>
        </AnimatedSection>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="card p-10 text-center"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--color-secondary)' }}
          >
            <Gift className="w-8 h-8" style={{ color: 'var(--color-primary)' }} />
          </div>
          <h3 className="font-sub text-xl font-medium mb-3" style={{ color: 'var(--color-text)' }}>
            Lista de regalos
          </h3>
          <p className="font-body text-sm mb-8" style={{ color: 'var(--color-text-muted)' }}>
            Hemos preparado una selección especial para ayudarte a elegirnos el regalo perfecto.
          </p>
          <a
            href={gift_registry_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <Gift className="w-4 h-4" />
            {label}
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>
        </motion.div>
      </div>
    </div>
  );
}

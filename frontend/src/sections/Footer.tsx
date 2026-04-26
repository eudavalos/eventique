import { motion } from 'framer-motion';
import { Instagram, Hash } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { OrnamentRings, OrnamentFloral } from '../components/Ornament';

export default function Footer() {
  const config = useConfig();
  const { couple, dates, sections, social } = config;
  const { footer } = sections;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;

  return (
    <footer
      className="relative overflow-hidden py-20 px-6"
      style={{ background: 'var(--color-text)' }}
    >
      {/* Background ornament */}
      <OrnamentFloral
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        size={400}
        color="rgba(255,255,255,0.04)"
      />

      <div className="relative z-10 max-w-lg mx-auto text-center">
        {/* Rings */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex justify-center mb-8"
        >
          <OrnamentRings color="rgba(255,255,255,0.3)" size={32} />
        </motion.div>

        {/* Message */}
        {footer.message && (
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-body text-sm tracking-[0.2em] uppercase mb-3"
            style={{ color: 'rgba(255,255,255,0.5)' }}
          >
            {footer.message}
          </motion.p>
        )}

        {/* Names */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-light mb-3"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', color: 'white', letterSpacing: '0.06em' }}
        >
          {names}
        </motion.h2>

        {/* Date */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="font-sub text-lg mb-2"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          {dates.displayDate ?? dates.ceremony.slice(0, 10)}
        </motion.p>

        {/* Location */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-body text-xs tracking-[0.25em] uppercase mb-8"
          style={{ color: 'rgba(255,255,255,0.4)' }}
        >
          {config.venues.ceremony.city}, {config.venues.ceremony.country}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="h-px max-w-xs mx-auto mb-8"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)' }}
        />

        {/* Social */}
        {(social?.hashtag || social?.instagram) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center gap-6 mb-8"
          >
            {social.hashtag && (
              <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Hash className="w-3.5 h-3.5" />
                <span className="font-body text-sm">{social.hashtag.replace('#', '')}</span>
              </div>
            )}
            {social.instagram && (
              <div className="flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                <Instagram className="w-3.5 h-3.5" />
                <span className="font-body text-sm">{social.instagram}</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Credits */}
        {footer.credits && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="font-body text-xs"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            {footer.credits}
          </motion.p>
        )}
      </div>
    </footer>
  );
}

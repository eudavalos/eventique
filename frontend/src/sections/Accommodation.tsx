import { motion } from 'framer-motion';
import { Star, MapPin, Phone, ExternalLink, Info } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';

export default function Accommodation() {
  const config = useConfig();
  const { accommodation } = config.sections;
  const title = accommodation.title ?? 'Dónde Hospedarse';

  return (
    <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accommodation.hotels.map((hotel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="card p-6 flex flex-col group hover:shadow-md transition-shadow duration-300"
            >
              {/* Stars */}
              {hotel.stars && (
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: hotel.stars }).map((_, s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" style={{ color: 'var(--color-accent)' }} />
                  ))}
                </div>
              )}

              <h3 className="font-sub text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                {hotel.name}
              </h3>

              <div className="space-y-2 flex-1 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <p className="text-xs font-body font-light" style={{ color: 'var(--color-text-muted)' }}>{hotel.address}</p>
                </div>
                {hotel.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                    <p className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>{hotel.phone}</p>
                  </div>
                )}
                {hotel.priceRange && (
                  <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>
                    {hotel.priceRange}
                  </p>
                )}
                {hotel.notes && (
                  <div className="flex items-start gap-2 pt-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                    <p className="text-xs font-body italic font-light" style={{ color: 'var(--color-text-muted)' }}>{hotel.notes}</p>
                  </div>
                )}
              </div>

              {hotel.website && (
                <a
                  href={hotel.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs tracking-wide uppercase font-medium font-body transition-colors mt-auto"
                  style={{ color: 'var(--color-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-primary-dark)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-primary)')}
                >
                  Reservar <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

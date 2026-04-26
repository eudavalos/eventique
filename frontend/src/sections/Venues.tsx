import { motion } from 'framer-motion';
import { MapPin, Clock, Shirt, Info, ExternalLink } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentLeaf } from '../components/Ornament';
import type { Venue } from '../types';

function VenueCard({ venue, label, delay = 0 }: { venue: Venue; label: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="card group flex flex-col"
    >
      {/* Photo */}
      <div className="aspect-[4/3] overflow-hidden">
        {venue.photo ? (
          <img
            src={venue.photo}
            alt={venue.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: 'var(--color-secondary)' }}
          >
            <OrnamentLeaf size={64} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-6 sm:p-8 flex flex-col flex-1">
        <span className="tag mb-3 self-start">{label}</span>

        <h3
          className="font-heading text-2xl sm:text-3xl font-light mb-1"
          style={{ color: 'var(--color-text)' }}
        >
          {venue.name}
        </h3>
        <p className="font-body text-sm font-light mb-5" style={{ color: 'var(--color-text-muted)' }}>
          {venue.city}, {venue.country}
        </p>

        <div className="space-y-3 flex-1">
          {venue.time && (
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-body" style={{ color: 'var(--color-text)' }}>{venue.time}</p>
            </div>
          )}
          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
            <p className="text-sm font-body" style={{ color: 'var(--color-text)' }}>{venue.address}</p>
          </div>
          {venue.dresscode && (
            <div className="flex items-start gap-3">
              <Shirt className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-body" style={{ color: 'var(--color-text)' }}>{venue.dresscode}</p>
            </div>
          )}
          {venue.notes && (
            <div className="flex items-start gap-3">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
              <p className="text-sm font-body font-light italic" style={{ color: 'var(--color-text-muted)' }}>{venue.notes}</p>
            </div>
          )}
        </div>

        <a
          href={venue.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline mt-6 self-start text-xs"
        >
          <MapPin className="w-3.5 h-3.5" /> Cómo llegar
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </div>
    </motion.div>
  );
}

export default function Venues() {
  const config = useConfig();
  const { venues } = config;
  const sameVenue = venues.sameVenue;

  return (
    <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">Los Recintos</h2>
          <OrnamentDivider />
        </AnimatedSection>

        {sameVenue ? (
          <div className="max-w-xl mx-auto">
            <VenueCard
              venue={venues.ceremony}
              label="Ceremonia & Recepción"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <VenueCard venue={venues.ceremony} label="Ceremonia" delay={0} />
            <VenueCard venue={venues.reception} label="Recepción" delay={0.15} />
          </div>
        )}
      </div>
    </div>
  );
}

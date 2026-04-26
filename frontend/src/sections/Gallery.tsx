import { useState } from 'react';
import { motion } from 'framer-motion';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';
import { ZoomIn } from 'lucide-react';

export default function Gallery() {
  const config = useConfig();
  const { gallery } = config.sections;
  const [index, setIndex] = useState(-1);

  const title = gallery.title ?? 'Nuestra Galería';
  const subtitle = gallery.subtitle;

  const slides = gallery.photos.map((p) => ({ src: p.url, alt: p.alt }));

  const layouts = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-2',
    'col-span-2 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
  ];

  if (!gallery.photos || gallery.photos.length === 0) {
    return null;
  }

  return (
    <div className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
          <OrnamentDivider />
        </AnimatedSection>

        {/* Mosaic grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 auto-rows-[200px] sm:auto-rows-[180px] lg:auto-rows-[160px]">
          {gallery.photos.map((photo, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              onClick={() => setIndex(i)}
              className={`relative overflow-hidden rounded-xl group ${layouts[i % layouts.length]}`}
              aria-label={photo.alt ?? `Foto ${i + 1}`}
            >
              <img
                src={photo.url}
                alt={photo.alt ?? ''}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ background: 'rgba(0,0,0,0.35)' }}>
                <ZoomIn className="w-6 h-6 text-white" />
              </div>
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <p className="text-white text-xs font-body">{photo.caption}</p>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <Lightbox
          open={index >= 0}
          close={() => setIndex(-1)}
          index={index}
          slides={slides}
          styles={{ root: { '--yarl__color_backdrop': 'rgba(0,0,0,0.92)' } }}
        />
      </div>
    </div>
  );
}

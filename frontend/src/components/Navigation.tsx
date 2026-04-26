import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useScrollSpy } from '../hooks/useScrollSpy';

interface NavLink {
  label: string;
  href: string;
}

interface NavigationProps {
  links: NavLink[];
  coupleNames: string;
}

export default function Navigation({ links, coupleNames }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sectionIds = links.map((l) => l.href.replace('#', ''));
  const activeSection = useScrollSpy(sectionIds, 100);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'var(--color-surface)' : 'transparent',
          borderBottom: scrolled ? '1px solid var(--color-border)' : 'none',
          boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Monogram */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="font-heading text-xl tracking-widest transition-opacity hover:opacity-70"
            style={{ color: scrolled ? 'var(--color-primary)' : 'white' }}
          >
            {coupleNames
              .split(' & ')
              .map((n) => n[0])
              .join(' & ')}
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map(({ label, href }) => {
              const id = href.replace('#', '');
              const isActive = activeSection === id;
              return (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className="relative text-xs tracking-[0.18em] uppercase font-body font-medium transition-all duration-300"
                  style={{ color: scrolled ? (isActive ? 'var(--color-primary)' : 'var(--color-text)') : 'white' }}
                >
                  {label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-px"
                      style={{ background: scrolled ? 'var(--color-primary)' : 'white' }}
                    />
                  )}
                </button>
              );
            })}
            <button
              onClick={() => handleNavClick('#rsvp')}
              className="btn-primary text-xs py-2.5 px-6"
              style={!scrolled ? { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' } : {}}
            >
              RSVP
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-full transition-colors"
            style={{ color: scrolled ? 'var(--color-text)' : 'white' }}
            aria-label="Menú"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 flex flex-col"
            style={{ background: 'var(--color-surface)' }}
          >
            <div className="h-16 flex items-center justify-end px-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-10 h-10 flex items-center justify-center"
                style={{ color: 'var(--color-text)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
              <p className="font-heading text-3xl" style={{ color: 'var(--color-primary)' }}>
                {coupleNames}
              </p>
              {links.map(({ label, href }) => (
                <button
                  key={href}
                  onClick={() => handleNavClick(href)}
                  className="text-sm tracking-[0.2em] uppercase font-medium transition-colors hover:text-primary"
                  style={{ color: 'var(--color-text)' }}
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => handleNavClick('#rsvp')}
                className="btn-primary mt-4"
              >
                Confirmar asistencia
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

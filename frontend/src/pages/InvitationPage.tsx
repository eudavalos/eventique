import { useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { requestMusicPlaybackWithOpen } from '../lib/musicPlayerEvents';
import { useGuest } from '../context/GuestContext';
import Navigation from '../components/Navigation';
import MusicPlayer from '../components/MusicPlayer';
import Hero from '../sections/Hero';
import Countdown from '../sections/Countdown';
import OurStory from '../sections/OurStory';
import Venues from '../sections/Venues';
import Schedule from '../sections/Schedule';
import WeddingParty from '../sections/WeddingParty';
import Gallery from '../sections/Gallery';
import Accommodation from '../sections/Accommodation';
import FAQ from '../sections/FAQ';
import RSVP from '../sections/RSVP';
import Footer from '../sections/Footer';
import GiftRegistry from '../sections/GiftRegistry';
import PersonalizedGreeting from '../sections/PersonalizedGreeting';
// Envelope skin
import EnvelopeHero from '../sections/EnvelopeHero';
import CollageHero from '../sections/CollageHero';
import VenuesEnvelope from '../sections/VenuesEnvelope';
import DressCode from '../sections/DressCode';
import GalleryPolaroid from '../sections/GalleryPolaroid';
import PaperAccessSkin from '../sections/PaperAccessSkin';
import AmoreaSkin from '../sections/AmoreaSkin';
import type { WeddingConfig } from '../types';

// ── Nav links ─────────────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: 'Nuestra Historia', href: '#historia' },
  { label: 'Ceremonia', href: '#recintos' },
  { label: 'Itinerario', href: '#itinerario' },
];

const NAV_LINKS_ENVELOPE = [
  { label: 'Ceremonia', href: '#recintos' },
  { label: 'RSVP', href: '#rsvp' },
];

const NAV_LINKS_PAPER = [
  { label: 'Detalles', href: '#recintos' },
  { label: 'RSVP', href: '#rsvp' },
];

// ── Classic skin ──────────────────────────────────────────────────────────────

function ClassicSkin() {
  const config = useConfig();
  const guest = useGuest();
  const { sections, music, couple } = config;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;
  const monogram = `${couple.person1.firstName[0]} · ${couple.person2.firstName[0]}`;

  const cfg = config as typeof config & Record<string, unknown>;
  const greetingPos = (cfg.personalized_greeting_position as string | undefined) ?? 'after_hero';
  const greetingEnabled = guest && cfg.personalized_greeting_enabled !== false;

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navigation links={NAV_LINKS} coupleNames={names} monogram={monogram} />

      {greetingEnabled && greetingPos === 'top' && <PersonalizedGreeting />}

      {sections.hero.enabled && <Hero />}

      {greetingEnabled && greetingPos === 'after_hero' && <PersonalizedGreeting />}

      {sections.countdown.enabled && (
        <section id="countdown">
          <Countdown />
        </section>
      )}

      {greetingEnabled && greetingPos === 'after_countdown' && <PersonalizedGreeting />}

      {sections.ourStory.enabled && (
        <section id="historia">
          <OurStory />
        </section>
      )}

      {greetingEnabled && greetingPos === 'after_story' && <PersonalizedGreeting />}

      <section id="recintos">
        <Venues />
      </section>

      {sections.schedule.enabled && (
        <section id="itinerario">
          <Schedule />
        </section>
      )}

      {sections.weddingParty.enabled && (
        <section id="cortejo">
          <WeddingParty />
        </section>
      )}

      {sections.gallery.enabled && sections.gallery.photos.length > 0 && (
        <section id="galeria">
          <Gallery />
        </section>
      )}

      {sections.accommodation.enabled && (
        <section id="hospedaje">
          <Accommodation />
        </section>
      )}

      {sections.faq.enabled && (
        <section id="faq">
          <FAQ />
        </section>
      )}

      {sections.rsvp.enabled && (
        <section id="rsvp">
          <RSVP />
        </section>
      )}

      <GiftRegistry />

      {sections.footer.enabled && <Footer />}

      {music?.enabled && <MusicPlayer tracks={music.tracks} autoplay={music.autoplay} />}
    </div>
  );
}

// ── Envelope skin ─────────────────────────────────────────────────────────────

function EnvelopeSkin() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;
  const { sections, music, couple } = config;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;
  const monogram = `${couple.person1.firstName[0]} · ${couple.person2.firstName[0]}`;
  const collageRef = useRef<HTMLDivElement>(null);

  const handleOpen = () => {
    if (music?.enabled) {
      requestMusicPlaybackWithOpen();
    }
    setTimeout(() => {
      collageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navigation links={NAV_LINKS_ENVELOPE} coupleNames={names} monogram={monogram} />

      {/* Sobre animado — pantalla 1 */}
      <EnvelopeHero onOpen={handleOpen} />

      {/* Collage de cards + countdown — pantalla 2 */}
      <div ref={collageRef}>
        <CollageHero />
      </div>

      {/* Venues estilo olive con iconos SVG */}
      <VenuesEnvelope />

      {/* Código de vestimenta */}
      <DressCode />

      {/* Obsequio / Gift (existente, funciona sobre fondo olive) */}
      <GiftRegistry />

      {/* RSVP */}
      {sections.rsvp?.enabled !== false && (
        <section id="rsvp">
          <RSVP />
        </section>
      )}

      {/* Galería estilo polaroid */}
      <GalleryPolaroid />

      {/* Footer */}
      {sections.footer?.enabled !== false && <Footer />}

      {music?.enabled && <MusicPlayer tracks={music.tracks} autoplay={music.autoplay} />}
    </div>
  );
}

function PaperSkin() {
  const config = useConfig() as WeddingConfig;
  const { music, couple } = config;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;
  const monogram = `${couple.person1.firstName[0]} · ${couple.person2.firstName[0]}`;

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navigation links={NAV_LINKS_PAPER} coupleNames={names} monogram={monogram} />
      <PaperAccessSkin />
      {music?.enabled && <MusicPlayer tracks={music.tracks} autoplay={music.autoplay} />}
    </div>
  );
}

// ── Main export — skin router ─────────────────────────────────────────────────

export default function InvitationPage() {
  const config = useConfig() as WeddingConfig & Record<string, unknown>;
  const skin = (config.invitation_skin as string | undefined) ?? 'classic';

  if (skin === 'envelope') {
    return <EnvelopeSkin />;
  }

  if (skin === 'paper-access') {
    return <PaperSkin />;
  }

  if (skin === 'amorea') {
    return <AmoreaSkin />;
  }

  return <ClassicSkin />;
}

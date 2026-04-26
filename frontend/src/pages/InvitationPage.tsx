import { useConfig } from '../context/ConfigContext';
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

const NAV_LINKS = [
  { label: 'Nuestra Historia', href: '#historia' },
  { label: 'Ceremonia', href: '#recintos' },
  { label: 'Itinerario', href: '#itinerario' },
];

export default function InvitationPage() {
  const config = useConfig();
  const { sections, music, couple } = config;
  const names = couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`;

  return (
    <div className="relative overflow-x-hidden" style={{ background: 'var(--color-bg)' }}>
      <Navigation links={NAV_LINKS} coupleNames={names} />

      {sections.hero.enabled && <Hero />}

      {sections.countdown.enabled && (
        <section id="countdown">
          <Countdown />
        </section>
      )}

      {sections.ourStory.enabled && (
        <section id="historia">
          <OurStory />
        </section>
      )}

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

      {sections.footer.enabled && <Footer />}

      {music?.enabled && <MusicPlayer tracks={music.tracks} autoplay={music.autoplay} />}
    </div>
  );
}

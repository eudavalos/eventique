import { useEffect, useState, Component } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { config as staticConfig } from './config/wedding';
import { applyTheme, applyFonts } from './lib/theme';
import { setFavicon } from './lib/favicon';
import { ConfigContext } from './context/ConfigContext';
import { EventSlugContext } from './context/EventSlugContext';
import { rsvpApi } from './lib/api';
import type { WeddingConfig, EventConfig, EventType } from './types';

const EVENT_TYPE_SECTION_LABELS: Partial<Record<EventType, { storyTitle?: string; scheduleTitle?: string; faqTitle?: string }>> = {
  boda:        { storyTitle: 'Nuestra Historia',   scheduleTitle: 'Cronograma',        faqTitle: 'Preguntas Frecuentes' },
  cumpleanos:  { storyTitle: 'Nuestra Historia',   scheduleTitle: 'Programa del día',  faqTitle: 'Preguntas Frecuentes' },
  bautismo:    { storyTitle: 'Nuestra Historia',   scheduleTitle: 'Programa',          faqTitle: 'Preguntas Frecuentes' },
  quinceanera: { storyTitle: 'Mi Historia',        scheduleTitle: 'Programa de la noche', faqTitle: 'Preguntas Frecuentes' },
  graduacion:  { storyTitle: 'Mi Trayectoria',     scheduleTitle: 'Programa',          faqTitle: 'Preguntas Frecuentes' },
  corporativo: { storyTitle: 'Sobre el Evento',    scheduleTitle: 'Agenda',            faqTitle: 'Preguntas Frecuentes' },
};
import InvitationPage from './pages/InvitationPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#fff5f5', minHeight: '100vh' }}>
          <h1 style={{ color: '#c00', fontSize: '1.5rem' }}>Error al cargar la página</h1>
          <pre style={{ marginTop: '16px', color: '#333', fontSize: '0.85rem', whiteSpace: 'pre-wrap' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function mergeConfig(base: WeddingConfig, dynamic: Partial<EventConfig>): WeddingConfig {
  const typeLabels = dynamic.event_type ? (EVENT_TYPE_SECTION_LABELS[dynamic.event_type] ?? {}) : {};
  const baseSections = { ...base.sections };
  // Apply event-type defaults at lowest priority (only if DB config doesn't already set the title)
  if (typeLabels.storyTitle && !dynamic.sections?.ourStory?.title) {
    baseSections.ourStory = { ...baseSections.ourStory, title: typeLabels.storyTitle };
  }
  if (typeLabels.scheduleTitle && !dynamic.sections?.schedule?.title) {
    baseSections.schedule = { ...baseSections.schedule, title: typeLabels.scheduleTitle };
  }
  if (typeLabels.faqTitle && !dynamic.sections?.faq?.title) {
    baseSections.faq = { ...baseSections.faq, title: typeLabels.faqTitle };
  }
  return {
    ...base,
    couple: dynamic.couple ?? base.couple,
    dates: dynamic.dates ?? base.dates,
    venues: dynamic.venues ?? base.venues,
    theme: {
      ...base.theme,
      palette: dynamic.theme?.palette ?? base.theme.palette,
      customColors: dynamic.theme?.customColors ?? base.theme.customColors,
    },
    sections: { ...baseSections, ...dynamic.sections },
    social: dynamic.social ?? base.social,
    music: dynamic.music ?? base.music,
  };
}

function EventInvitationRoute({ defaultSlug = 'default' }: { defaultSlug?: string }) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const eventSlug = paramSlug ?? defaultSlug;
  const [eventConfig, setEventConfig] = useState<WeddingConfig>(staticConfig);

  useEffect(() => {
    applyTheme(staticConfig.theme.palette, staticConfig.theme.customColors);
    applyFonts(
      staticConfig.theme.fonts.heading,
      staticConfig.theme.fonts.subheading,
      staticConfig.theme.fonts.body,
    );
    const { couple } = staticConfig;
    document.title = `${couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`} — ${staticConfig.dates.displayDate ?? staticConfig.dates.ceremony.slice(0, 10)}`;

    rsvpApi.getEventConfig(eventSlug)
      .then(({ data }) => {
        const merged = mergeConfig(staticConfig, data as Partial<EventConfig>);
        setEventConfig(merged);
        applyTheme(merged.theme.palette, merged.theme.customColors);
        if (merged.theme.fonts) {
          applyFonts(merged.theme.fonts.heading, merged.theme.fonts.subheading, merged.theme.fonts.body);
        }
        if ((data as Partial<EventConfig>).event_type) {
          setFavicon((data as Partial<EventConfig>).event_type!);
        }
      })
      .catch(() => {});
  }, [eventSlug]);

  return (
    <EventSlugContext.Provider value={eventSlug}>
      <ConfigContext.Provider value={eventConfig}>
        <InvitationPage />
      </ConfigContext.Provider>
    </EventSlugContext.Provider>
  );
}

function EventAdminRoute({ defaultSlug = 'default' }: { defaultSlug?: string }) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const eventSlug = paramSlug ?? defaultSlug;

  return (
    <EventSlugContext.Provider value={eventSlug}>
      <AdminPage />
    </EventSlugContext.Provider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              fontFamily: 'var(--font-body)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '12px 20px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: 'var(--color-primary)', secondary: 'white' } },
          }}
        />
        <Routes>
          <Route path="/" element={<EventInvitationRoute defaultSlug="default" />} />
          <Route path="/admin" element={<EventAdminRoute defaultSlug="default" />} />
          <Route path="/e/:slug" element={<EventInvitationRoute />} />
          <Route path="/e/:slug/admin" element={<EventAdminRoute />} />
          <Route path="/landing" element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

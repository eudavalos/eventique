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
import type { WeddingConfig, EventConfig } from './types';
import InvitationPage from './pages/InvitationPage';
import AdminPage from './pages/AdminPage';

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
    sections: { ...base.sections, ...dynamic.sections },
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
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

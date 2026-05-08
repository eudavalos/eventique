import { useEffect, useState, useCallback, Component } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { config as staticConfig } from './config/wedding';
import { applyTheme, applyFonts } from './lib/theme';
import { setFavicon } from './lib/favicon';
import { ConfigContext } from './context/ConfigContext';
import { EventSlugContext } from './context/EventSlugContext';
import { GuestContext } from './context/GuestContext';
import { rsvpApi } from './lib/api';
import type { WeddingConfig, EventConfig, PersonalizedInvitationData } from './types';
import { mergeConfig } from './lib/mergeConfig';
import InvitationPage from './pages/InvitationPage';
import AdminPage from './pages/AdminPage';
import LandingPage from './pages/LandingPage';
import PersonalizedInvitationPage from './pages/PersonalizedInvitationPage';

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
    setFavicon('boda');
    rsvpApi.getEventConfig(eventSlug)
      .then(({ data }) => {
        const merged = mergeConfig(staticConfig, data as Partial<EventConfig>);
        setEventConfig(merged);
        applyTheme(merged.theme.palette, merged.theme.customColors);
        if (merged.theme.fonts) {
          applyFonts(merged.theme.fonts.heading, merged.theme.fonts.subheading, merged.theme.fonts.body);
        }
        // Set title from dynamic event data
        const { couple, dates } = merged;
        document.title = `${couple.displayNames ?? couple.person1.firstName} — ${dates.displayDate ?? dates.ceremony.slice(0, 10)}`;
        // Set favicon from event type
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

// ── Loading / error screens for personalized route ────────────────────────────

function GuestLoadingScreen() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <svg className="animate-spin" width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ margin: '0 auto 16px', display: 'block' }}>
          <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="3" />
          <path d="M4 12a8 8 0 018-8" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.85rem', letterSpacing: '0.15em' }}>
          Cargando tu invitación…
        </p>
      </div>
    </div>
  );
}

function GuestErrorScreen({ type }: { type: 'not_found' | 'blocked' | 'error' }) {
  const msgs = {
    not_found: { title: 'Invitación no encontrada', body: 'El enlace de esta invitación no existe o ha expirado.' },
    blocked:   { title: 'Acceso no disponible',    body: 'Esta invitación ha sido desactivada por el organizador.' },
    error:     { title: 'Error al cargar',          body: 'No se pudo cargar tu invitación. Intenta de nuevo más tarde.' },
  };
  const { title, body } = msgs[type];
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)', padding: '24px' }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <p style={{ fontSize: '3rem', marginBottom: '16px' }}>{type === 'blocked' ? '🔒' : '🔍'}</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 300, color: 'var(--color-text)', marginBottom: '12px' }}>{title}</h1>
        <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{body}</p>
      </div>
    </div>
  );
}

// ── PersonalizedInvitationRoute ────────────────────────────────────────────────

function PersonalizedInvitationRoute() {
  const { slug, token } = useParams<{ slug: string; token: string }>();
  const [eventConfig, setEventConfig] = useState<WeddingConfig>(staticConfig);
  const [guestData, setGuestData] = useState<PersonalizedInvitationData | null>(null);
  const [guestError, setGuestError] = useState<'not_found' | 'blocked' | 'error' | null>(null);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [guestLoaded, setGuestLoaded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const applyInvitationPayloadConfig = useCallback((data: Partial<EventConfig>) => {
    const merged = mergeConfig(staticConfig, data);
    setEventConfig(merged);
    applyTheme(merged.theme.palette, merged.theme.customColors);
    if (merged.theme.fonts) {
      applyFonts(merged.theme.fonts.heading, merged.theme.fonts.subheading, merged.theme.fonts.body);
    }
    if (data.event_type) setFavicon(data.event_type);
    const { couple, dates } = merged;
    document.title = [
      couple.displayNames ?? couple.person1.firstName,
      dates.displayDate ?? dates.ceremony.slice(0, 10),
    ].filter(Boolean).join(' - ');
  }, []);

  useEffect(() => {
    if (!slug) return;
    // Apply static defaults immediately so loading screen is themed
    applyTheme(staticConfig.theme.palette, staticConfig.theme.customColors);

    rsvpApi.getEventConfig(slug)
      .then(({ data }) => {
        const merged = mergeConfig(staticConfig, data as Partial<EventConfig>);
        setEventConfig(merged);
        applyTheme(merged.theme.palette, merged.theme.customColors);
        if (merged.theme.fonts) applyFonts(merged.theme.fonts.heading, merged.theme.fonts.subheading, merged.theme.fonts.body);
        if ((data as Partial<EventConfig>).event_type) setFavicon((data as Partial<EventConfig>).event_type!);
        const { couple, dates } = merged;
        document.title = `${couple.displayNames ?? couple.person1.firstName} — ${dates.displayDate ?? dates.ceremony.slice(0, 10)}`;
      })
      .catch(() => {})
      .finally(() => setConfigLoaded(true));
  }, [slug]);

  useEffect(() => {
    if (!slug || !token) return;
    setGuestLoaded(false);
    setGuestError(null);

    rsvpApi.getPersonalizedInvitation(slug, token)
      .then(({ data }) => {
        setGuestData(data);
        if (data.event_config && Object.keys(data.event_config).length > 0) {
          applyInvitationPayloadConfig(data.event_config as Partial<EventConfig>);
          setConfigLoaded(true);
        }
        rsvpApi.trackInvitationOpen(slug, token, 'direct').catch(() => {});
      })
      .catch((err) => {
        const status = (err as { response?: { status?: number; data?: { detail?: string } } })?.response?.status;
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? '';
        if (status === 404 || detail.toLowerCase().includes('not found')) setGuestError('not_found');
        else if (detail === 'blocked') setGuestError('blocked');
        else setGuestError('error');
      })
      .finally(() => setGuestLoaded(true));
  }, [slug, token, refreshKey, applyInvitationPayloadConfig]);

  if (!configLoaded || !guestLoaded) return <GuestLoadingScreen />;
  if (guestError === 'not_found') return <GuestErrorScreen type="not_found" />;
  if (guestError === 'blocked') return <GuestErrorScreen type="blocked" />;

  // On network error: fall back to standalone PersonalizedInvitationPage
  if (guestError === 'error' || !guestData) {
    return (
      <EventSlugContext.Provider value={slug ?? ''}>
        <PersonalizedInvitationPage />
      </EventSlugContext.Provider>
    );
  }

  const cfgDyn = eventConfig as WeddingConfig & Record<string, unknown>;
  const fullView = (cfgDyn.personalized_full_view as boolean | undefined) ?? true;

  if (!fullView) {
    // Legacy standalone view
    return (
      <EventSlugContext.Provider value={slug ?? ''}>
        <PersonalizedInvitationPage />
      </EventSlugContext.Provider>
    );
  }

  return (
    <EventSlugContext.Provider value={slug ?? ''}>
      <ConfigContext.Provider value={eventConfig}>
        <GuestContext.Provider value={{ data: guestData, tokenLookup: token!, refresh }}>
          <InvitationPage />
        </GuestContext.Provider>
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
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin" element={<EventAdminRoute defaultSlug="default" />} />
          <Route path="/e/:slug" element={<EventInvitationRoute />} />
          <Route path="/e/:slug/i/:token" element={<PersonalizedInvitationRoute />} />
          <Route path="/e/:slug/admin" element={<EventAdminRoute />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

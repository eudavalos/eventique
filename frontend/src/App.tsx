import { useEffect, useState, Component } from 'react';
import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { config } from './config/wedding';
import { applyTheme, applyFonts } from './lib/theme';
import { ConfigContext } from './context/ConfigContext';
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

export default function App() {
  const [eventConfig, setEventConfig] = useState<WeddingConfig>(config);

  useEffect(() => {
    applyTheme(config.theme.palette, config.theme.customColors);
    applyFonts(
      config.theme.fonts.heading,
      config.theme.fonts.subheading,
      config.theme.fonts.body,
    );

    // Update document title
    const { couple } = config;
    document.title = `${couple.displayNames ?? `${couple.person1.firstName} & ${couple.person2.firstName}`} — ${config.dates.displayDate ?? config.dates.ceremony.slice(0, 10)}`;

    // Fetch dynamic event config from API and merge with static defaults
    rsvpApi.getEventConfig()
      .then(({ data }) => {
        const merged = mergeConfig(config, data as Partial<EventConfig>);
        setEventConfig(merged);
        applyTheme(merged.theme.palette, merged.theme.customColors);
        if (merged.theme.fonts) {
          applyFonts(merged.theme.fonts.heading, merged.theme.fonts.subheading, merged.theme.fonts.body);
        }
      })
      .catch(() => {}); // silently use static defaults
  }, []);

  return (
    <ConfigContext.Provider value={eventConfig}>
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
            <Route path="/" element={<InvitationPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigContext.Provider>
  );
}

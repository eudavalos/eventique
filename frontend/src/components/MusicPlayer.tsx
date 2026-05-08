import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import type { MusicTrack } from '../types';

interface MusicPlayerProps {
  tracks: MusicTrack[];
  autoplay: boolean;
}

// ── YouTube helpers ───────────────────────────────────────────────────────────

const YT_ORIGIN = 'https://www.youtube.com';

function extractYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? (m[1] ?? m[2]) : null;
}

function isYouTube(url: string) {
  return !!extractYouTubeId(url);
}

function buildYouTubeSrc(url: string): string {
  const id = extractYouTubeId(url);
  if (!id) return '';
  const origin =
    typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return (
    `${YT_ORIGIN}/embed/${id}` +
    `?enablejsapi=1&autoplay=0&controls=0&rel=0&modestbranding=1` +
    `&playsinline=1&origin=${origin}`
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function MusicPlayer({ tracks, autoplay }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytRef = useRef<HTMLIFrameElement>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // YouTube state (all refs to avoid stale closures in stable message handler)
  const ytReadyRef = useRef(false);
  const ytConfirmedPlay = useRef(false);
  const pendingPlayRef = useRef(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef = useRef(autoplay);
  const mutedRef = useRef(false);
  // Keep refs in sync with state/props
  useEffect(() => { autoplayRef.current = autoplay; }, [autoplay]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  const current = tracks[currentIdx];

  // Stable YouTube command — sends to YT_ORIGIN, not '*'
  const ytCmd = useCallback((func: string, args: unknown[] = []) => {
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      YT_ORIGIN,
    );
  }, []);

  // Play YouTube — handles both ready and not-ready states
  const ytPlay = useCallback(() => {
    ytConfirmedPlay.current = false;
    if (ytReadyRef.current) {
      ytCmd('playVideo');
      if (mutedRef.current) ytCmd('mute');
      setPlaying(true);
      if (autoplayRef.current) {
        // Block-detection fallback: if no onStateChange(1) in 3s, report blocked
        if (fallbackRef.current) clearTimeout(fallbackRef.current);
        fallbackRef.current = setTimeout(() => {
          fallbackRef.current = null;
          if (!ytConfirmedPlay.current) {
            setPlaying(false);
            setAutoplayBlocked(true);
          }
        }, 3000);
      }
    } else {
      // Queue — will fire when onReady arrives
      pendingPlayRef.current = true;
      setPlaying(true);
    }
  }, [ytCmd]);

  // ── Stable YouTube message handler (registered once) ──────────────────────
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== YT_ORIGIN) return;
      try {
        const raw = typeof event.data === 'string' ? event.data : JSON.stringify(event.data);
        const data = JSON.parse(raw) as { event?: string; info?: number };

        if (data.event === 'onReady') {
          ytReadyRef.current = true;
          // Execute queued play command
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            ytCmd('playVideo');
            if (mutedRef.current) ytCmd('mute');
            setPlaying(true);
            if (autoplayRef.current) {
              if (fallbackRef.current) clearTimeout(fallbackRef.current);
              fallbackRef.current = setTimeout(() => {
                fallbackRef.current = null;
                if (!ytConfirmedPlay.current) {
                  setPlaying(false);
                  setAutoplayBlocked(true);
                }
              }, 3000);
            }
          }
        } else if (data.event === 'onStateChange') {
          if (data.info === 1) {
            // Playing confirmed by YouTube
            ytConfirmedPlay.current = true;
            setPlaying(true);
            setAutoplayBlocked(false);
            if (fallbackRef.current) {
              clearTimeout(fallbackRef.current);
              fallbackRef.current = null;
            }
          } else if (data.info === 2 || data.info === 0) {
            setPlaying(false);
          }
        }
      } catch {/* ignore non-JSON */}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [ytCmd]); // ytCmd is stable — listener added once

  // ── Autoplay-blocked retry on user interaction ───────────────────────────
  useEffect(() => {
    if (!autoplayBlocked) return;
    const retry = () => {
      setAutoplayBlocked(false);
      if (!current) return;
      if (isYouTube(current.url)) {
        ytPlay();
      } else if (audioRef.current) {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    };
    document.addEventListener('click', retry, { once: true });
    document.addEventListener('touchstart', retry, { once: true });
    document.addEventListener('keydown', retry, { once: true });
    return () => {
      document.removeEventListener('click', retry);
      document.removeEventListener('touchstart', retry);
      document.removeEventListener('keydown', retry);
    };
  }, [autoplayBlocked, current, ytPlay]);

  // ── Track change / mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!current) return;

    // Clear autoplay block detection
    if (fallbackRef.current) {
      clearTimeout(fallbackRef.current);
      fallbackRef.current = null;
    }

    if (isYouTube(current.url)) {
      // New iframe will load → reset ready state
      ytReadyRef.current = false;
      ytConfirmedPlay.current = false;
      pendingPlayRef.current = false;

      if (autoplay || playing) {
        // Queue play — onReady will execute it
        pendingPlayRef.current = true;
        setPlaying(true); // optimistic UI

        // Safety fallback: if onReady doesn't arrive within 6s, try anyway
        const safetyTimer = setTimeout(() => {
          if (pendingPlayRef.current) {
            pendingPlayRef.current = false;
            ytCmd('playVideo');
            if (mutedRef.current) ytCmd('mute');
            // Start block-detection only for true autoplay
            if (autoplay) {
              fallbackRef.current = setTimeout(() => {
                fallbackRef.current = null;
                if (!ytConfirmedPlay.current) {
                  setPlaying(false);
                  setAutoplayBlocked(true);
                }
              }, 3000);
            }
          }
        }, 6000);
        return () => {
          clearTimeout(safetyTimer);
          if (fallbackRef.current) {
            clearTimeout(fallbackRef.current);
            fallbackRef.current = null;
          }
        };
      }
    } else {
      // Audio track
      if (!audioRef.current) return;
      audioRef.current.src = current.url;
      audioRef.current.load();
      if (autoplay || playing) {
        audioRef.current
          .play()
          .then(() => { setPlaying(true); setAutoplayBlocked(false); })
          .catch((e: Error) => {
            setPlaying(false);
            if (e.name === 'NotAllowedError') setAutoplayBlocked(true);
          });
      }
    }
  }, [currentIdx]); // eslint-disable-line

  // ── Controls ──────────────────────────────────────────────────────────────

  const toggle = () => {
    if (!current) return;
    if (isYouTube(current.url)) {
      if (playing) {
        ytCmd('pauseVideo');
        setPlaying(false);
      } else {
        ytPlay();
      }
    } else {
      if (!audioRef.current) return;
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play().then(() => setPlaying(true)).catch(() => {});
      }
    }
  };

  const next = () => {
    if (!current) return;
    if (isYouTube(current.url)) ytCmd('stopVideo');
    else audioRef.current?.pause();
    setPlaying(false);
    setCurrentIdx((i) => (i + 1) % tracks.length);
  };

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    mutedRef.current = newMuted;
    if (current && isYouTube(current.url)) {
      ytCmd(newMuted ? 'mute' : 'unMute');
    } else if (audioRef.current) {
      audioRef.current.muted = newMuted;
    }
  };

  if (tracks.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Hidden HTML audio element (for non-YouTube tracks) */}
      <audio
        ref={audioRef}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* YouTube hidden player — 1×1 so browser initializes it */}
      {current && isYouTube(current.url) && (
        <iframe
          key={`yt-${currentIdx}`}
          ref={ytRef}
          src={buildYouTubeSrc(current.url)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            zIndex: -1,
          }}
          allow="autoplay; encrypted-media"
          title="yt-player"
        />
      )}

      {/* Autoplay-blocked hint */}
      <AnimatePresence>
        {autoplayBlocked && !expanded && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="mb-2 flex justify-end pointer-events-none"
          >
            <span
              className="text-xs font-body px-3 py-1.5 rounded-full shadow-md"
              style={{
                background: 'var(--color-primary)',
                color: 'white',
                opacity: 0.92,
                letterSpacing: '0.04em',
              }}
            >
              ▶ Toca para reproducir
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded tracklist panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="card mb-3 p-4 w-64"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-secondary)' }}
              >
                <Music className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                  {current?.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {current?.artist}
                </p>
                {autoplayBlocked && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)', opacity: 0.8 }}>
                    Toca ▶ para iniciar
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={toggleMute}
                className="p-2 rounded-lg transition-colors hover:bg-secondary"
                aria-label={muted ? 'Activar sonido' : 'Silenciar'}
              >
                {muted ? (
                  <VolumeX className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                ) : (
                  <Volume2 className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                )}
              </button>
              <button
                onClick={toggle}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                style={{ background: 'var(--color-primary)', color: 'white' }}
                aria-label={playing ? 'Pausar' : 'Reproducir'}
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              {tracks.length > 1 && (
                <button
                  onClick={next}
                  className="p-2 rounded-lg transition-colors hover:bg-secondary"
                  aria-label="Siguiente canción"
                >
                  <SkipForward className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                </button>
              )}
            </div>

            {/* Track list */}
            {tracks.length > 1 && (
              <div className="mt-4 space-y-1 border-t pt-3" style={{ borderColor: 'var(--color-border)' }}>
                {tracks.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPlaying(false);
                      if (current && isYouTube(current.url)) ytCmd('stopVideo');
                      else audioRef.current?.pause();
                      setCurrentIdx(i);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs transition-colors"
                    style={{
                      background: i === currentIdx ? 'var(--color-secondary)' : 'transparent',
                      color: i === currentIdx ? 'var(--color-primary)' : 'var(--color-text-muted)',
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    <span className="font-medium">{t.title}</span>
                    {t.artist && <span className="ml-1 opacity-70">— {t.artist}</span>}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB button */}
      <div className="flex justify-end">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all relative"
          style={{ background: 'var(--color-primary)', color: 'white' }}
          aria-label="Música"
        >
          {(playing || autoplayBlocked) && (
            <span
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: 'var(--color-primary)',
                opacity: autoplayBlocked ? 0.45 : 0.25,
              }}
            />
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : playing ? (
            <Pause className="w-5 h-5" />
          ) : autoplayBlocked ? (
            <Play className="w-5 h-5 ml-0.5" />
          ) : (
            <Music className="w-5 h-5" />
          )}
        </motion.button>
      </div>
    </div>
  );
}

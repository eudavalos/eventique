import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Play, Pause, SkipForward, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import type { MusicTrack } from '../types';

interface MusicPlayerProps {
  tracks: MusicTrack[];
  autoplay: boolean;
}

function extractYouTubeId(url: string): string | null {
  const m = url.match(/[?&]v=([a-zA-Z0-9_-]{11})|youtu\.be\/([a-zA-Z0-9_-]{11})/);
  return m ? (m[1] ?? m[2]) : null;
}

function isYouTube(url: string) {
  return !!extractYouTubeId(url);
}

export default function MusicPlayer({ tracks, autoplay }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ytRef = useRef<HTMLIFrameElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  // true when autoplay was requested but browser policy blocked it
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const fallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = tracks[currentIdx];

  const ytCmd = (cmd: string) =>
    ytRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*',
    );

  // Track real YouTube player state via postMessage events
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(typeof event.data === 'string' ? event.data : '{}');
        if (data.event === 'onStateChange') {
          if (data.info === 1) {
            // YT state: playing
            setPlaying(true);
            setAutoplayBlocked(false);
            if (fallbackRef.current) {
              clearTimeout(fallbackRef.current);
              fallbackRef.current = null;
            }
          } else if (data.info === 2 || data.info === 0) {
            // YT state: paused or ended
            setPlaying(false);
          }
        }
      } catch {/* ignore non-JSON messages */}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // Retry playback on first user interaction when autoplay was blocked
  useEffect(() => {
    if (!autoplayBlocked) return;
    const retry = () => {
      setAutoplayBlocked(false);
      if (!current) return;
      if (isYouTube(current.url)) {
        ytCmd('playVideo');
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
  }, [autoplayBlocked, currentIdx]); // eslint-disable-line

  useEffect(() => {
    if (!current) return;
    if (isYouTube(current.url)) {
      if (autoplay || playing) {
        const t = setTimeout(() => {
          ytCmd('playVideo');
          // YouTube does not return a Promise — use a fallback timer to detect block.
          // If onStateChange(1) fires within 3s, the fallback is cancelled above.
          if (autoplay) {
            fallbackRef.current = setTimeout(() => {
              setPlaying((prev) => {
                if (!prev) setAutoplayBlocked(true);
                return prev;
              });
              fallbackRef.current = null;
            }, 3000);
          }
        }, 1200);
        return () => {
          clearTimeout(t);
          if (fallbackRef.current) {
            clearTimeout(fallbackRef.current);
            fallbackRef.current = null;
          }
        };
      }
    } else {
      if (!audioRef.current) return;
      audioRef.current.src = current.url;
      audioRef.current.load();
      if (autoplay || playing) {
        audioRef.current
          .play()
          .then(() => {
            setPlaying(true);
            setAutoplayBlocked(false);
          })
          .catch((e: Error) => {
            setPlaying(false);
            // NotAllowedError = browser autoplay policy blocked playback
            if (e.name === 'NotAllowedError') setAutoplayBlocked(true);
          });
      }
    }
  }, [currentIdx]); // eslint-disable-line

  const toggle = () => {
    if (isYouTube(current.url)) {
      if (playing) {
        ytCmd('pauseVideo');
        setPlaying(false);
      } else {
        ytCmd('playVideo');
        setPlaying(true);
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
    if (isYouTube(current.url)) {
      ytCmd('stopVideo');
    } else {
      audioRef.current?.pause();
    }
    setPlaying(false);
    setCurrentIdx((i) => (i + 1) % tracks.length);
  };

  const toggleMute = () => {
    if (!isYouTube(current.url) && audioRef.current) {
      audioRef.current.muted = !muted;
    }
    setMuted(!muted);
  };

  if (tracks.length === 0) return null;

  const showPulse = playing || autoplayBlocked;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Hidden audio element for non-YouTube tracks */}
      <audio
        ref={audioRef}
        onEnded={next}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Hidden YouTube iframe (rendered only for YouTube tracks) */}
      {isYouTube(current.url) && (
        <iframe
          ref={ytRef}
          src={`https://www.youtube.com/embed/${extractYouTubeId(current.url)}?enablejsapi=1&autoplay=0&controls=0&rel=0&modestbranding=1&playsinline=1`}
          style={{ position: 'absolute', width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
          allow="autoplay"
          title="yt-player"
        />
      )}

      {/* Autoplay-blocked hint — floats above the button */}
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
                  {current.title}
                </p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {current.artist}
                </p>
                {autoplayBlocked && (
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-primary)', opacity: 0.8 }}>
                    Toca ▶ para iniciar
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button onClick={toggleMute} className="p-2 rounded-lg transition-colors hover:bg-secondary">
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
              >
                {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <button onClick={next} className="p-2 rounded-lg transition-colors hover:bg-secondary">
                <SkipForward className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-end">
        <motion.button
          onClick={() => setExpanded(!expanded)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all relative"
          style={{ background: 'var(--color-primary)', color: 'white' }}
          aria-label="Música"
        >
          {/* Pulse ring: shows when playing OR when autoplay is blocked (waiting for interaction) */}
          {showPulse && (
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

export const MUSIC_PLAYER_PLAY_EVENT   = 'eventique:music-player:play';
export const MUSIC_PLAYER_TOGGLE_EVENT = 'eventique:music-player:toggle';
export const MUSIC_PLAYER_OPEN_EVENT   = 'eventique:music-player:open';

export function requestMusicPlayback(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_PLAY_EVENT));
}

export function requestMusicToggle(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_TOGGLE_EVENT));
}

/**
 * Opens the MusicPlayer panel AND requests playback.
 * Use this from music cards so the player is visible on mobile
 * even when YouTube playback requires a direct user gesture on the FAB.
 */
export function requestMusicPlaybackWithOpen(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_OPEN_EVENT));
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_PLAY_EVENT));
}

export const MUSIC_PLAYER_PLAY_EVENT = 'eventique:music-player:play';
export const MUSIC_PLAYER_TOGGLE_EVENT = 'eventique:music-player:toggle';

export function requestMusicPlayback(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_PLAY_EVENT));
}

export function requestMusicToggle(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(MUSIC_PLAYER_TOGGLE_EVENT));
}

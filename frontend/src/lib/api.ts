import axios from 'axios';
import type { RSVPFormData, EventConfig, EventInfo, MediaFile } from '../types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ── RSVP Type Mapper ────────────────────────────────────────────────────────
// Converts frontend camelCase / string booleans to backend snake_case / bool

export interface RSVPPayload {
  name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  plus_one_name?: string;
  dietary_restrictions?: string;
  song_request?: string;
  message?: string;
}

export function toRSVPPayload(data: RSVPFormData): RSVPPayload {
  return {
    name: data.name,
    email: data.email,
    attending: data.attending === 'yes',
    guest_count: data.guestCount ?? 1,
    plus_one_name: data.plusOneName,
    dietary_restrictions: data.dietaryRestrictions,
    song_request: data.songRequest,
    message: data.message,
  };
}

export const rsvpApi = {
  // ── Invitation (public) ────────────────────────────────────────────────────

  getEventConfig: (eventSlug = 'default') =>
    client.get<EventConfig>(`/events/${eventSlug}/event-config`),

  submit: (eventSlug: string, data: RSVPFormData) =>
    client.post(`/events/${eventSlug}/rsvp`, toRSVPPayload(data)),

  checkEmail: (eventSlug: string, email: string) =>
    client.get<{ exists: boolean; attending: boolean }>(
      `/events/${eventSlug}/rsvp/check?email=${encodeURIComponent(email)}`
    ),

  // ── Admin ──────────────────────────────────────────────────────────────────

  listAll: (eventSlug: string, token: string) =>
    client.get(`/events/${eventSlug}/rsvp`, { headers: { Authorization: `Bearer ${token}` } }),

  deleteRsvp: (eventSlug: string, token: string, rsvpId: number) =>
    client.delete(`/events/${eventSlug}/rsvp/${rsvpId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getStats: (eventSlug: string, token: string) =>
    client.get<{
      total_responses: number;
      attending: number;
      not_attending: number;
      total_guests: number;
    }>(`/events/${eventSlug}/rsvp/stats`, { headers: { Authorization: `Bearer ${token}` } }),

  updateEventConfig: (eventSlug: string, token: string, data: Partial<EventConfig>) =>
    client.put(`/events/${eventSlug}/event-config`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ── Events CRUD (superadmin) ───────────────────────────────────────────────

  listEvents: (token: string) =>
    client.get<EventInfo[]>('/events', { headers: { Authorization: `Bearer ${token}` } }),

  createEvent: (token: string, data: { name: string; slug: string; admin_token?: string }) =>
    client.post<EventInfo>('/events', data, { headers: { Authorization: `Bearer ${token}` } }),

  deleteEvent: (token: string, slug: string) =>
    client.delete(`/events/${slug}`, { headers: { Authorization: `Bearer ${token}` } }),

  duplicateEvent: (token: string, sourceSlug: string, data: { name: string; slug: string; admin_token?: string }) =>
    client.post<EventInfo>(`/events/${sourceSlug}/duplicate`, data, { headers: { Authorization: `Bearer ${token}` } }),

  generateEventToken: (token: string, slug: string) =>
    client.patch<{ slug: string; admin_token: string }>(`/events/${slug}/admin-token`, {}, { headers: { Authorization: `Bearer ${token}` } }),

  // ── Media management ───────────────────────────────────────────────────────

  listMedia: (eventSlug: string, token: string) =>
    client.get<MediaFile[]>(`/events/${eventSlug}/media`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  uploadMedia: (
    eventSlug: string,
    token: string,
    file: File,
    onProgress?: (pct: number) => void
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<MediaFile>(`/events/${eventSlug}/media`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress
        ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total ?? 1)))
        : undefined,
    });
  },

  deleteMedia: (eventSlug: string, token: string, mediaId: number) =>
    client.delete(`/events/${eventSlug}/media/${mediaId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  editRsvp: (
    eventSlug: string,
    token: string,
    id: number,
    data: {
      name: string; email: string; attending: boolean;
      guest_count: number; dietary_restrictions?: string;
      song_request?: string; message?: string;
    }
  ) =>
    client.put(`/events/${eventSlug}/rsvp/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default client;

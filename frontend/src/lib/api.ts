import axios from 'axios';
import type {
  RSVPFormData,
  EventConfig,
  EventInfo,
  MediaFile,
  PersonalizedInvitationData,
  PersonalizedRSVPPayload,
  GuestInvitation,
  GuestInvitationCreate,
  GuestStats,
  CSVImportPreview,
  InvitationStatus,
  InvitationAuditEntry,
} from '../types';

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

  // ── Personalized Invitations (public) ─────────────────────────────────────
  getPersonalizedInvitation: (eventSlug: string, token: string) =>
    client.get<PersonalizedInvitationData>(`/events/${eventSlug}/invitations/${token}`),

  submitPersonalizedRSVP: (eventSlug: string, token: string, data: PersonalizedRSVPPayload) =>
    client.post(`/events/${eventSlug}/invitations/${token}/rsvp`, data),

  trackInvitationOpen: (eventSlug: string, token: string, source?: string) =>
    client.post(`/events/${eventSlug}/invitations/${token}/open`, { source: source ?? 'direct' }),

  // ── Guest Management (admin) ───────────────────────────────────────────────
  listGuests: (eventSlug: string, token: string, params?: { status?: string; search?: string; page?: number; limit?: number }) =>
    client.get<{ items: GuestInvitation[]; total: number; page: number; pages: number }>(
      `/events/${eventSlug}/guests`, { headers: { Authorization: `Bearer ${token}` }, params }
    ),

  createGuest: (eventSlug: string, token: string, data: GuestInvitationCreate) =>
    client.post<GuestInvitation>(`/events/${eventSlug}/guests`, data, { headers: { Authorization: `Bearer ${token}` } }),

  updateGuest: (eventSlug: string, token: string, id: number, data: Partial<GuestInvitationCreate>) =>
    client.put<GuestInvitation>(`/events/${eventSlug}/guests/${id}`, data, { headers: { Authorization: `Bearer ${token}` } }),

  patchGuestStatus: (eventSlug: string, token: string, id: number, status: InvitationStatus, reason?: string) =>
    client.patch(`/events/${eventSlug}/guests/${id}/status`, { status, blocked_reason: reason }, { headers: { Authorization: `Bearer ${token}` } }),

  deleteGuest: (eventSlug: string, token: string, id: number) =>
    client.delete(`/events/${eventSlug}/guests/${id}`, { headers: { Authorization: `Bearer ${token}` } }),

  regenerateGuestToken: (eventSlug: string, token: string, id: number) =>
    client.post<{ token_lookup: string; invitation_url: string }>(`/events/${eventSlug}/guests/${id}/regenerate-token`, {}, { headers: { Authorization: `Bearer ${token}` } }),

  getGuestQRData: (eventSlug: string, token: string, id: number) =>
    client.get<{ invitation_url: string }>(`/events/${eventSlug}/guests/${id}/qr-data`, { headers: { Authorization: `Bearer ${token}` } }),

  getGuestStats: (eventSlug: string, token: string) =>
    client.get<GuestStats>(`/events/${eventSlug}/guests/stats`, { headers: { Authorization: `Bearer ${token}` } }),

  exportGuestsCSV: (eventSlug: string, token: string) =>
    client.get(`/events/${eventSlug}/guests/export.csv`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    }),

  downloadGuestTemplate: (eventSlug: string, token: string) =>
    client.get(`/events/${eventSlug}/guests/template.csv`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob',
    }),

  importGuestsPreview: (eventSlug: string, token: string, file: File) => {
    const fd = new FormData(); fd.append('file', file);
    return client.post<CSVImportPreview>(`/events/${eventSlug}/guests/import/preview`, fd, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
    });
  },

  importGuestsCommit: (eventSlug: string, token: string, rows: Array<Record<string, string>>) =>
    client.post<{ imported: number; errors: number }>(`/events/${eventSlug}/guests/import/commit`, { rows }, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getGuestWhatsApp: (eventSlug: string, token: string, id: number, baseUrl?: string) =>
    client.get<{
      message: string;
      url: string;
      invitation_url: string;
      short_url: string;
      full_invitation_url: string;
    }>(`/events/${eventSlug}/guests/${id}/whatsapp`, {
      headers: { Authorization: `Bearer ${token}` },
      params: baseUrl ? { base_url: baseUrl } : undefined,
    }),

  getGuestAudit: (eventSlug: string, token: string, id: number) =>
    client.get<InvitationAuditEntry[]>(`/events/${eventSlug}/guests/${id}/audit`, { headers: { Authorization: `Bearer ${token}` } }),
};

export default client;

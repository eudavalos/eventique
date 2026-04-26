import axios from 'axios';
import type { RSVPFormData, EventConfig } from '../types';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const rsvpApi = {
  submit: (data: RSVPFormData) => client.post('/rsvp', data),

  checkEmail: (email: string) =>
    client.get<{ exists: boolean; attending: boolean }>(`/rsvp/check?email=${encodeURIComponent(email)}`),

  getStats: () =>
    client.get<{
      total_responses: number;
      attending: number;
      not_attending: number;
      total_guests: number;
    }>('/rsvp/stats'),

  listAll: (token: string) =>
    client.get('/rsvp', { headers: { Authorization: `Bearer ${token}` } }),

  getEventConfig: () =>
    client.get<EventConfig>('/event-config'),

  updateEventConfig: (token: string, data: Partial<EventConfig>) =>
    client.put('/event-config', data, { headers: { Authorization: `Bearer ${token}` } }),
};

export default client;

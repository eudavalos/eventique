import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Users, CheckCircle, XCircle, BarChart3, Download, Lock,
  Settings, Palette, Upload, Trash2, Plus, ExternalLink,
  Copy, Music2, Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rsvpApi } from '../lib/api';
import { useEventSlug } from '../context/EventSlugContext';
import { config as staticConfig } from '../config/wedding';
import { applyTheme } from '../lib/theme';
import type { PaletteKey, EventType, EventInfo, MediaFile } from '../types';

// ── Types ──────────────────────────────────────────────────────────────────

interface RSVPRecord {
  id: number;
  name: string;
  email: string;
  attending: boolean;
  guest_count: number;
  dietary_restrictions?: string;
  song_request?: string;
  message?: string;
  created_at: string;
}

interface Stats {
  total_responses: number;
  attending: number;
  not_attending: number;
  total_guests: number;
}

interface ConfigFormData {
  event_type: EventType;
  person1_first: string;
  person1_last: string;
  person1_nick: string;
  person2_first: string;
  person2_last: string;
  person2_nick: string;
  display_names: string;
  hashtag: string;
  ceremony_date: string;
  display_date: string;
  timezone: string;
  ceremony_venue_name: string;
  ceremony_venue_address: string;
  ceremony_venue_city: string;
  ceremony_venue_country: string;
  ceremony_maps_url: string;
  reception_venue_name: string;
  reception_venue_address: string;
  reception_venue_city: string;
  reception_venue_country: string;
  reception_maps_url: string;
  same_venue: boolean;
  rsvp_enabled: boolean;
  rsvp_deadline: string;
  max_guests: number;
  palette: PaletteKey;
}

// ── Palette data ───────────────────────────────────────────────────────────

const PALETTE_OPTIONS: { key: PaletteKey; label: string; colors: string[] }[] = [
  { key: 'nature',    label: 'Nature',    colors: ['#3E7B57', '#C9A93C', '#F8FCF6', '#1C2D22'] },
  { key: 'rose-gold', label: 'Rose Gold', colors: ['#B76E79', '#C9A84C', '#FAF7F2', '#2A1F1A'] },
  { key: 'garden',    label: 'Garden',    colors: ['#5E7D5B', '#C4A45A', '#F8F9F5', '#1E2D1B'] },
  { key: 'navy-gold', label: 'Navy Gold', colors: ['#1C2D5A', '#C9A84C', '#F8F5EE', '#0F1835'] },
  { key: 'sage',      label: 'Sage',      colors: ['#8FA68A', '#C4B5A5', '#FAFAF7', '#2D2D2D'] },
  { key: 'midnight',  label: 'Midnight',  colors: ['#9B5A6A', '#E8C977', '#13111E', '#F0E6DC'] },
];

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; emoji: string }[] = [
  { value: 'boda',        label: 'Boda',        emoji: '💍' },
  { value: 'cumpleanos',  label: 'Cumpleaños',  emoji: '🎂' },
  { value: 'bautismo',    label: 'Bautismo',    emoji: '👶' },
  { value: 'quinceanera', label: 'Quinceañera', emoji: '💃' },
  { value: 'graduacion',  label: 'Graduación',  emoji: '🎓' },
  { value: 'corporativo', label: 'Corporativo', emoji: '💼' },
];

const EVENT_LABELS: Record<EventType, {
  person1: string; person2: string; displayNames: string;
  dateLabel: string; venueLabel: string; singleVenue: boolean;
}> = {
  boda:        { person1: 'Novio/a 1',        person2: 'Novio/a 2',   displayNames: 'Ej: Concepción & Eumelio',    dateLabel: 'Fecha de la ceremonia',  venueLabel: 'Ceremonia',     singleVenue: false },
  cumpleanos:  { person1: 'El/La Festejado/a', person2: '',           displayNames: 'Ej: Fiesta de Ana',           dateLabel: 'Fecha del evento',        venueLabel: 'Lugar',         singleVenue: true  },
  bautismo:    { person1: 'Nombre del Bebé',   person2: 'Padres',     displayNames: 'Ej: Bautismo de Sofía',       dateLabel: 'Fecha del bautismo',      venueLabel: 'Iglesia/Lugar', singleVenue: false },
  quinceanera: { person1: 'La Quinceañera',    person2: '',           displayNames: 'Ej: Quinceañera de Valeria',  dateLabel: 'Fecha del evento',        venueLabel: 'Salón',         singleVenue: true  },
  graduacion:  { person1: 'El/La Graduado/a',  person2: '',           displayNames: 'Ej: Graduación de Carlos',    dateLabel: 'Fecha de la graduación',  venueLabel: 'Institución',   singleVenue: true  },
  corporativo: { person1: 'Empresa/Org.',      person2: 'Contacto',   displayNames: 'Ej: Congreso Tecnopowerpy',   dateLabel: 'Fecha del evento',        venueLabel: 'Sede',          singleVenue: true  },
};

type Tab = 'rsvps' | 'config' | 'tema' | 'media' | 'eventos';

// ── Helpers ────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const eventSlug = useEventSlug();

  const [token, setToken] = useState(sessionStorage.getItem('admin_token') ?? '');
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('rsvps');
  const [eventCfg, setEventCfg] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [selectedPalette, setSelectedPalette] = useState<PaletteKey>(staticConfig.theme.palette);

  // Media state
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Events state
  const [events, setEvents] = useState<EventInfo[]>([]);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventToken, setNewEventToken] = useState('');

  const { register, handleSubmit, reset, watch } = useForm<ConfigFormData>({
    defaultValues: buildDefaultValues({}),
  });

  const watchedEventType = watch('event_type');

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await rsvpApi.listAll(eventSlug, password);
      if (data.status === 200) {
        setToken(password);
        sessionStorage.setItem('admin_token', password);
        setAuthed(true);
        setRsvps(data.data);
      }
    } catch {
      setError('Contraseña incorrecta o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // ── Load data after auth ───────────────────────────────────────────────────

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      rsvpApi.listAll(eventSlug, token),
      rsvpApi.getStats(eventSlug, token),
      rsvpApi.getEventConfig(eventSlug),
    ])
      .then(([list, statsRes, cfgRes]) => {
        setRsvps(list.data);
        setStats(statsRes.data);
        setAuthed(true);
        const cfg = cfgRes.data as unknown as Record<string, unknown>;
        setEventCfg(cfg);
        const defaults = buildDefaultValues(cfg);
        reset(defaults);
        if (defaults.palette) setSelectedPalette(defaults.palette);

        // Secondary data (events + media) — don't fail auth on errors
        Promise.allSettled([
          rsvpApi.listMedia(eventSlug, token),
          rsvpApi.listEvents(token),
        ]).then(([mediaRes, eventsRes]) => {
          if (mediaRes.status === 'fulfilled') setMediaFiles(mediaRes.value.data);
          if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data);
        });
      })
      .catch(() => {
        setToken('');
        setAuthed(false);
        sessionStorage.removeItem('admin_token');
      })
      .finally(() => setLoading(false));
  }, [token, eventSlug]); // eslint-disable-line

  // ── CSV Export ────────────────────────────────────────────────────────────

  const downloadCSV = () => {
    const headers = ['Nombre', 'Email', 'Asiste', 'Invitados', 'Dieta', 'Canción', 'Mensaje', 'Fecha'];
    const rows = rsvps.map((r) => [
      r.name, r.email, r.attending ? 'Sí' : 'No',
      r.guest_count, r.dietary_restrictions ?? '', r.song_request ?? '',
      r.message ?? '', new Date(r.created_at).toLocaleString('es'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-${eventSlug}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── RSVP delete ───────────────────────────────────────────────────────────

  const handleDeleteRsvp = async (id: number) => {
    if (!confirm('¿Eliminar esta confirmación? Esta acción no se puede deshacer.')) return;
    try {
      await rsvpApi.deleteRsvp(eventSlug, token, id);
      setRsvps((prev) => prev.filter((r) => r.id !== id));
      toast.success('Confirmación eliminada');
      rsvpApi.getStats(eventSlug, token).then((res) => setStats(res.data)).catch(() => {});
    } catch {
      toast.error('Error al eliminar la confirmación');
    }
  };

  // ── Save config ───────────────────────────────────────────────────────────

  const saveConfig = async (formData: ConfigFormData) => {
    setSaving(true);
    try {
      await rsvpApi.updateEventConfig(eventSlug, token, {
        event_type: formData.event_type,
        couple: {
          person1: { firstName: formData.person1_first, lastName: formData.person1_last, nickname: formData.person1_nick },
          person2: { firstName: formData.person2_first, lastName: formData.person2_last, nickname: formData.person2_nick },
          displayNames: formData.display_names,
          hashtag: formData.hashtag,
        },
        dates: {
          ceremony: formData.ceremony_date,
          displayDate: formData.display_date,
          timezone: formData.timezone || 'America/Asuncion',
        },
        venues: {
          ceremony: {
            name: formData.ceremony_venue_name,
            address: formData.ceremony_venue_address,
            city: formData.ceremony_venue_city,
            country: formData.ceremony_venue_country || 'Paraguay',
            mapsUrl: formData.ceremony_maps_url || '',
          },
          reception: {
            name: formData.reception_venue_name,
            address: formData.reception_venue_address,
            city: formData.reception_venue_city,
            country: formData.reception_venue_country || 'Paraguay',
            mapsUrl: formData.reception_maps_url || '',
          },
          sameVenue: formData.same_venue,
        },
        theme: { palette: formData.palette },
        sections: {
          rsvp: {
            enabled: formData.rsvp_enabled,
            deadline: formData.rsvp_deadline,
            maxGuestsPerResponse: Number(formData.max_guests),
          },
        },
      } as never);
      toast.success('Configuración guardada correctamente');
      const cfgRes = await rsvpApi.getEventConfig(eventSlug);
      setEventCfg(cfgRes.data as unknown as Record<string, unknown>);
    } catch {
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  // ── Save palette ──────────────────────────────────────────────────────────

  const savePalette = async () => {
    setSaving(true);
    try {
      const current = eventCfg as Record<string, unknown>;
      await rsvpApi.updateEventConfig(eventSlug, token, {
        ...current,
        theme: { ...(current.theme as object ?? {}), palette: selectedPalette },
      } as never);
      applyTheme(selectedPalette);
      toast.success('Tema guardado correctamente');
    } catch {
      toast.error('Error al guardar el tema');
    } finally {
      setSaving(false);
    }
  };

  // ── Media upload ──────────────────────────────────────────────────────────

  const handleMediaUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setUploading(true);
    setUploadProgress(0);
    try {
      const res = await rsvpApi.uploadMedia(eventSlug, token, file, setUploadProgress);
      setMediaFiles((prev) => [res.data, ...prev]);
      toast.success(`"${file.name}" subido correctamente`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Error al subir el archivo');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteMedia = async (id: number) => {
    if (!confirm('¿Eliminar este archivo? La acción no se puede deshacer.')) return;
    try {
      await rsvpApi.deleteMedia(eventSlug, token, id);
      setMediaFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('Archivo eliminado');
    } catch {
      toast.error('Error al eliminar el archivo');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text).then(
      () => toast.success('URL copiada al portapapeles'),
      () => toast.error('No se pudo copiar la URL'),
    );
  };

  // ── Events management ─────────────────────────────────────────────────────

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName || !newEventSlug) return;
    setCreatingEvent(true);
    try {
      const res = await rsvpApi.createEvent(token, {
        name: newEventName,
        slug: newEventSlug,
        admin_token: newEventToken || undefined,
      });
      setEvents((prev) => [...prev, res.data]);
      setNewEventName('');
      setNewEventSlug('');
      setNewEventToken('');
      toast.success(`Evento "${newEventName}" creado`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Error al crear el evento');
    } finally {
      setCreatingEvent(false);
    }
  };

  const handleDeleteEvent = async (slug: string, name: string) => {
    if (!confirm(`¿Eliminar el evento "${name}"?\nSe eliminarán todos sus RSVPs, configuración y archivos. Esta acción no se puede deshacer.`)) return;
    try {
      await rsvpApi.deleteEvent(token, slug);
      setEvents((prev) => prev.filter((ev) => ev.slug !== slug));
      toast.success(`Evento "${name}" eliminado`);
    } catch {
      toast.error('Error al eliminar el evento');
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const cfgCouple = (eventCfg.couple as Record<string, unknown> | undefined) ?? {};
  const names = (cfgCouple.displayNames as string | undefined)
    ?? staticConfig.couple.displayNames
    ?? `${staticConfig.couple.person1.firstName} & ${staticConfig.couple.person2.firstName}`;

  const imageFiles = mediaFiles.filter((f) => f.file_type === 'image');
  const audioFiles = mediaFiles.filter((f) => f.file_type === 'audio');

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--color-bg)' }}>
        <div className="card w-full max-w-md p-10">
          <div className="text-center mb-8">
            <Lock className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--color-primary)' }} />
            <h1 className="section-title text-3xl">{names}</h1>
            <p className="text-muted mt-2 text-sm">Panel de administración</p>
            {eventSlug !== 'default' && (
              <p className="text-xs font-mono mt-1" style={{ color: 'var(--color-accent)' }}>/{eventSlug}</p>
            )}
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="input-label">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
              {loading ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Admin dashboard ───────────────────────────────────────────────────────

  return (
    <div className="min-h-screen p-6 sm:p-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title text-left text-4xl">{names}</h1>
            <p className="text-muted text-sm mt-1">
              Panel de administración
              {eventSlug !== 'default' && (
                <span className="ml-2 font-mono text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--color-secondary)', color: 'var(--color-accent)' }}>
                  {eventSlug}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--color-secondary)', maxWidth: '640px' }}>
          {([
            { key: 'rsvps',    label: 'RSVPs',          icon: BarChart3  },
            { key: 'config',   label: 'Configuración',  icon: Settings   },
            { key: 'tema',     label: 'Tema',           icon: Palette    },
            { key: 'media',    label: 'Media',          icon: Upload     },
            { key: 'eventos',  label: 'Eventos',        icon: Calendar   },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-medium font-body transition-all duration-200 whitespace-nowrap"
              style={{
                background: activeTab === key ? 'var(--color-surface)' : 'transparent',
                color: activeTab === key ? 'var(--color-primary)' : 'var(--color-text-muted)',
                boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ── TAB: RSVPs ── */}
        {activeTab === 'rsvps' && (
          <>
            <div className="flex justify-end mb-6">
              <button onClick={downloadCSV} className="btn-outline flex items-center gap-2">
                <Download className="w-4 h-4" /> Exportar CSV
              </button>
            </div>

            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {[
                  { icon: Users,       label: 'Respuestas',      value: stats.total_responses },
                  { icon: CheckCircle, label: 'Asistirán',       value: stats.attending       },
                  { icon: XCircle,     label: 'No asistirán',    value: stats.not_attending   },
                  { icon: BarChart3,   label: 'Total invitados', value: stats.total_guests    },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="card p-6 text-center">
                    <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                    <p className="text-3xl font-heading" style={{ color: 'var(--color-primary)' }}>{value}</p>
                    <p className="text-muted text-xs mt-1 tracking-wide uppercase">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {loading && <p className="text-center text-muted">Cargando…</p>}

            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-secondary)' }}>
                    {['Nombre', 'Email', 'Asiste', 'Invitados', 'Dieta', 'Canción', 'Fecha', ''].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rsvps.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-secondary transition-colors">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3 text-muted">{r.email}</td>
                      <td className="px-4 py-3">
                        <span className={`tag ${r.attending ? 'border-green-500 text-green-600' : 'border-red-400 text-red-500'}`}>
                          {r.attending ? 'Sí' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{r.guest_count}</td>
                      <td className="px-4 py-3 text-muted">{r.dietary_restrictions ?? '—'}</td>
                      <td className="px-4 py-3 text-muted">{r.song_request ?? '—'}</td>
                      <td className="px-4 py-3 text-muted text-xs">{new Date(r.created_at).toLocaleDateString('es')}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteRsvp(r.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rsvps.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted">
                        Aún no hay confirmaciones.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── TAB: Configuración ── */}
        {activeTab === 'config' && (
          <form onSubmit={handleSubmit(saveConfig)} className="space-y-8">

            {/* Event type */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Tipo de evento</h2>
              <div className="flex flex-wrap gap-3">
                {EVENT_TYPE_OPTIONS.map(({ value, label, emoji }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all duration-200 font-body text-sm font-medium"
                    style={{
                      borderColor: watchedEventType === value ? 'var(--color-primary)' : 'var(--color-border)',
                      background: watchedEventType === value ? 'var(--color-secondary)' : 'var(--color-surface)',
                      color: watchedEventType === value ? 'var(--color-primary)' : 'var(--color-text)',
                    }}
                  >
                    <input type="radio" value={value} {...register('event_type')} className="sr-only" />
                    <span>{emoji}</span>
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* People */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Personas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest uppercase font-body font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {EVENT_LABELS[watchedEventType]?.person1 ?? 'Persona 1'}
                  </h3>
                  <div><label className="input-label">Nombre</label><input {...register('person1_first')} className="input-field" placeholder="Nombre" /></div>
                  <div><label className="input-label">Apellido</label><input {...register('person1_last')} className="input-field" placeholder="Apellido" /></div>
                  <div><label className="input-label">Apodo</label><input {...register('person1_nick')} className="input-field" placeholder="Apodo" /></div>
                </div>

                {EVENT_LABELS[watchedEventType]?.person2 && (
                  <div className="space-y-4">
                    <h3 className="text-xs tracking-widest uppercase font-body font-medium" style={{ color: 'var(--color-text-muted)' }}>
                      {EVENT_LABELS[watchedEventType].person2}
                    </h3>
                    <div><label className="input-label">Nombre</label><input {...register('person2_first')} className="input-field" placeholder="Nombre" /></div>
                    <div><label className="input-label">Apellido</label><input {...register('person2_last')} className="input-field" placeholder="Apellido" /></div>
                    <div><label className="input-label">Apodo</label><input {...register('person2_nick')} className="input-field" placeholder="Apodo" /></div>
                  </div>
                )}
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Nombre para mostrar</label>
                  <input {...register('display_names')} className="input-field" placeholder={EVENT_LABELS[watchedEventType]?.displayNames ?? 'Nombre del evento'} />
                </div>
                <div>
                  <label className="input-label">Hashtag</label>
                  <input {...register('hashtag')} className="input-field" placeholder="#NombreEvento2026" />
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Fecha y hora</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">{EVENT_LABELS[watchedEventType]?.dateLabel ?? 'Fecha y hora'} (ISO)</label>
                  <input {...register('ceremony_date')} className="input-field" placeholder="2026-12-05T16:00:00" />
                </div>
                <div>
                  <label className="input-label">Fecha para mostrar</label>
                  <input {...register('display_date')} className="input-field" placeholder="Sábado, 5 de Diciembre de 2026" />
                </div>
                <div>
                  <label className="input-label">Zona horaria</label>
                  <input {...register('timezone')} className="input-field" placeholder="America/Asuncion" />
                </div>
              </div>
            </div>

            {/* Venues */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>
                Recinto{!EVENT_LABELS[watchedEventType]?.singleVenue ? 's' : ''}
              </h2>
              {EVENT_LABELS[watchedEventType]?.singleVenue ? (
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest uppercase font-body font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {EVENT_LABELS[watchedEventType].venueLabel}
                  </h3>
                  <input {...register('ceremony_venue_name')} className="input-field" placeholder="Nombre del lugar" />
                  <input {...register('ceremony_venue_address')} className="input-field" placeholder="Dirección" />
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register('ceremony_venue_city')} className="input-field" placeholder="Ciudad" />
                    <input {...register('ceremony_venue_country')} className="input-field" placeholder="País" />
                  </div>
                  <input {...register('ceremony_maps_url')} className="input-field" placeholder="URL Google Maps" />
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" {...register('same_venue')} className="w-4 h-4 accent-primary" />
                      <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Mismo recinto para ceremonia y recepción</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="text-xs tracking-widest uppercase font-body font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        {EVENT_LABELS[watchedEventType]?.venueLabel ?? 'Ceremonia'}
                      </h3>
                      <input {...register('ceremony_venue_name')} className="input-field" placeholder="Nombre del lugar" />
                      <input {...register('ceremony_venue_address')} className="input-field" placeholder="Dirección" />
                      <div className="grid grid-cols-2 gap-3">
                        <input {...register('ceremony_venue_city')} className="input-field" placeholder="Ciudad" />
                        <input {...register('ceremony_venue_country')} className="input-field" placeholder="País" />
                      </div>
                      <input {...register('ceremony_maps_url')} className="input-field" placeholder="URL Google Maps" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xs tracking-widest uppercase font-body font-medium" style={{ color: 'var(--color-text-muted)' }}>Recepción</h3>
                      <input {...register('reception_venue_name')} className="input-field" placeholder="Nombre del lugar" />
                      <input {...register('reception_venue_address')} className="input-field" placeholder="Dirección" />
                      <div className="grid grid-cols-2 gap-3">
                        <input {...register('reception_venue_city')} className="input-field" placeholder="Ciudad" />
                        <input {...register('reception_venue_country')} className="input-field" placeholder="País" />
                      </div>
                      <input {...register('reception_maps_url')} className="input-field" placeholder="URL Google Maps" />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* RSVP settings */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>RSVP</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('rsvp_enabled')} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Habilitar sección RSVP</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Fecha límite</label>
                    <input {...register('rsvp_deadline')} type="date" className="input-field" />
                  </div>
                  <div>
                    <label className="input-label">Máximo de invitados por respuesta</label>
                    <input {...register('max_guests', { valueAsNumber: true })} type="number" min={1} max={20} className="input-field" />
                  </div>
                </div>
              </div>
            </div>

            {/* Palette quick pick */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Paleta de colores</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PALETTE_OPTIONS.map(({ key, label, colors }) => {
                  const watchedPalette = watch('palette');
                  return (
                    <label
                      key={key}
                      className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
                      style={{
                        borderColor: watchedPalette === key ? 'var(--color-primary)' : 'var(--color-border)',
                        background: watchedPalette === key ? 'var(--color-secondary)' : 'var(--color-surface)',
                      }}
                    >
                      <input type="radio" value={key} {...register('palette')} className="sr-only" />
                      <div className="flex gap-1">{colors.map((c) => (<div key={c} className="w-5 h-5 rounded-full border border-black/10" style={{ background: c }} />))}</div>
                      <span className="text-xs font-body font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary px-8">
                {saving ? 'Guardando…' : 'Guardar configuración'}
              </button>
            </div>
          </form>
        )}

        {/* ── TAB: Tema ── */}
        {activeTab === 'tema' && (
          <div className="space-y-6">
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-6" style={{ color: 'var(--color-text)' }}>Selecciona una paleta de colores</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {PALETTE_OPTIONS.map(({ key, label, colors }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setSelectedPalette(key); applyTheme(key); }}
                    className="flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200"
                    style={{
                      borderColor: selectedPalette === key ? 'var(--color-primary)' : 'var(--color-border)',
                      background: selectedPalette === key ? 'var(--color-secondary)' : 'var(--color-surface)',
                      boxShadow: selectedPalette === key ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <div className="flex gap-2">{colors.map((c) => (<div key={c} className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />))}</div>
                    <div className="flex items-center justify-between">
                      <span className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                      {selectedPalette === key && (
                        <span className="text-xs font-body px-2 py-0.5 rounded-full" style={{ background: 'var(--color-primary)', color: 'white' }}>Activo</span>
                      )}
                    </div>
                    <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                      {colors.map((c, i) => (<div key={i} className="flex-1" style={{ background: c }} />))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button type="button" onClick={savePalette} disabled={saving} className="btn-primary px-8">
                {saving ? 'Guardando…' : 'Guardar tema'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Media ── */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            {/* Upload zone */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Subir archivo</h2>
              <div
                className="border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
                style={{
                  borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-border)',
                  background: isDragging ? 'var(--color-secondary)' : 'var(--color-bg)',
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleMediaUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: isDragging ? 'var(--color-primary)' : 'var(--color-text-muted)' }} />
                <p className="font-sub text-sm font-medium mb-1" style={{ color: 'var(--color-text)' }}>
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="font-body text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Imágenes: JPEG, PNG, WebP (máx. 10 MB) · Audio: MP3, M4A, WAV (máx. 50 MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"
                  className="sr-only"
                  onChange={(e) => handleMediaUpload(e.target.files)}
                />
              </div>

              {uploading && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted mb-1">
                    <span>Subiendo…</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="rounded-full h-2 overflow-hidden" style={{ background: 'var(--color-border)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%`, background: 'var(--color-primary)' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Image gallery */}
            {imageFiles.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h3 className="font-sub text-base font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                  Imágenes ({imageFiles.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {imageFiles.map((file) => (
                    <div key={file.id} className="relative group rounded-xl overflow-hidden">
                      <img
                        src={file.url}
                        alt={file.original_filename}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(file.url)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs bg-white/20 hover:bg-white/30 transition-colors"
                          title="Copiar URL"
                        >
                          <Copy className="w-3 h-3" /> Copiar URL
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(file.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs bg-red-500/70 hover:bg-red-500/90 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                      <p className="text-xs text-muted mt-1 px-1 truncate">{file.original_filename}</p>
                      <p className="text-xs text-muted px-1">{formatBytes(file.size)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audio list */}
            {audioFiles.length > 0 && (
              <div className="card p-6 sm:p-8">
                <h3 className="font-sub text-base font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                  Audio ({audioFiles.length})
                </h3>
                <div className="space-y-2">
                  {audioFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--color-secondary)' }}
                    >
                      <Music2 className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium truncate" style={{ color: 'var(--color-text)' }}>{file.original_filename}</p>
                        <p className="text-xs text-muted">{formatBytes(file.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(file.url)}
                        className="p-2 rounded-lg hover:bg-black/10 transition-colors"
                        title="Copiar URL"
                      >
                        <Copy className="w-4 h-4 text-muted" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteMedia(file.id)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaFiles.length === 0 && !uploading && (
              <div className="text-center py-16 text-muted">
                <Upload className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No hay archivos subidos aún.</p>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Eventos ── */}
        {activeTab === 'eventos' && (
          <div className="space-y-6">
            {/* Create new event */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>
                <Plus className="w-5 h-5 inline mr-2" style={{ color: 'var(--color-primary)' }} />
                Crear nuevo evento
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Nombre del evento</label>
                    <input
                      value={newEventName}
                      onChange={(e) => {
                        setNewEventName(e.target.value);
                        setNewEventSlug(slugify(e.target.value));
                      }}
                      className="input-field"
                      placeholder="Ej: Boda de Ana y Carlos"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Slug único (URL)</label>
                    <input
                      value={newEventSlug}
                      onChange={(e) => setNewEventSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))}
                      className="input-field font-mono"
                      placeholder="ana-carlos-2026"
                      pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
                      required
                    />
                    {newEventSlug && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        URL: <span className="font-mono">/e/{newEventSlug}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="input-label">Token de admin (opcional — deja vacío para usar el token global)</label>
                  <input
                    type="password"
                    value={newEventToken}
                    onChange={(e) => setNewEventToken(e.target.value)}
                    className="input-field"
                    placeholder="Token personalizado para este evento"
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={creatingEvent || !newEventName || !newEventSlug} className="btn-primary">
                    {creatingEvent ? 'Creando…' : 'Crear evento'}
                  </button>
                </div>
              </form>
            </div>

            {/* Events list */}
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-secondary)' }}>
                    {['Nombre', 'Slug', 'Creado', 'Acciones'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs tracking-widest uppercase text-muted font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.slug} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-secondary transition-colors">
                      <td className="px-4 py-3 font-medium">{ev.name}</td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-1 rounded" style={{ background: 'var(--color-secondary)', color: 'var(--color-text-muted)' }}>
                          {ev.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted text-xs">
                        {new Date(ev.created_at).toLocaleDateString('es')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <a
                            href={ev.slug === 'default' ? '/' : `/e/${ev.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver
                          </a>
                          <a
                            href={ev.slug === 'default' ? '/admin' : `/e/${ev.slug}/admin`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-outline text-xs py-1 px-2.5"
                          >
                            Admin
                          </a>
                          {ev.slug !== 'default' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEvent(ev.slug, ev.name)}
                              className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted">
                        No hay eventos creados aún.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Helper: build form defaults from fetched event config ──────────────────

function buildDefaultValues(cfg: Record<string, unknown>): ConfigFormData {
  const couple = (cfg.couple as Record<string, unknown> | undefined) ?? {};
  const p1 = (couple.person1 as Record<string, string> | undefined) ?? {};
  const p2 = (couple.person2 as Record<string, string> | undefined) ?? {};
  const dates = (cfg.dates as Record<string, string> | undefined) ?? {};
  const venues = (cfg.venues as Record<string, unknown> | undefined) ?? {};
  const cv = (venues.ceremony as Record<string, string> | undefined) ?? {};
  const rv = (venues.reception as Record<string, string> | undefined) ?? {};
  const theme = (cfg.theme as Record<string, string> | undefined) ?? {};
  const sections = (cfg.sections as Record<string, unknown> | undefined) ?? {};
  const rsvpSect = (sections.rsvp as Record<string, unknown> | undefined) ?? {};
  const sc = staticConfig;

  return {
    event_type:              (cfg.event_type as EventType)             ?? 'boda',
    person1_first:           p1.firstName                              ?? sc.couple.person1.firstName,
    person1_last:            p1.lastName                               ?? sc.couple.person1.lastName,
    person1_nick:            p1.nickname                               ?? sc.couple.person1.nickname ?? '',
    person2_first:           p2.firstName                              ?? sc.couple.person2.firstName,
    person2_last:            p2.lastName                               ?? sc.couple.person2.lastName,
    person2_nick:            p2.nickname                               ?? sc.couple.person2.nickname ?? '',
    display_names:           (couple.displayNames as string)           ?? sc.couple.displayNames ?? '',
    hashtag:                 (couple.hashtag as string)                ?? sc.couple.hashtag ?? '',
    ceremony_date:           dates.ceremony                            ?? sc.dates.ceremony,
    display_date:            dates.displayDate                         ?? sc.dates.displayDate ?? '',
    timezone:                dates.timezone                            ?? sc.dates.timezone,
    ceremony_venue_name:     cv.name                                   ?? sc.venues.ceremony.name,
    ceremony_venue_address:  cv.address                                ?? sc.venues.ceremony.address,
    ceremony_venue_city:     cv.city                                   ?? sc.venues.ceremony.city,
    ceremony_venue_country:  cv.country                                ?? sc.venues.ceremony.country,
    ceremony_maps_url:       cv.mapsUrl                                ?? sc.venues.ceremony.mapsUrl,
    reception_venue_name:    rv.name                                   ?? sc.venues.reception.name,
    reception_venue_address: rv.address                                ?? sc.venues.reception.address,
    reception_venue_city:    rv.city                                   ?? sc.venues.reception.city,
    reception_venue_country: rv.country                                ?? sc.venues.reception.country,
    reception_maps_url:      rv.mapsUrl                                ?? sc.venues.reception.mapsUrl,
    same_venue:              (venues.sameVenue as boolean)             ?? sc.venues.sameVenue ?? false,
    rsvp_enabled:            (rsvpSect.enabled as boolean)             ?? sc.sections.rsvp.enabled,
    rsvp_deadline:           (rsvpSect.deadline as string)             ?? sc.sections.rsvp.deadline ?? '',
    max_guests:              (rsvpSect.maxGuestsPerResponse as number) ?? sc.sections.rsvp.maxGuestsPerResponse ?? 4,
    palette:                 (theme.palette as PaletteKey)             ?? sc.theme.palette,
  };
}

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Users, CheckCircle, XCircle, BarChart3, Download, Lock,
  Settings, Palette, Upload, Trash2, Plus, ExternalLink,
  Copy, Music2, Calendar, Pencil, QrCode, X, FileText,
  Image as ImageIcon, LogOut, Key, RefreshCw,
  UserPlus, UserCheck, Send, Link2, Filter, ChevronLeft, ChevronRight,
  Eye, RotateCcw, MessageSquare, GripVertical, ChevronUp as ChevronUpIcon, ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import toast from 'react-hot-toast';
import { rsvpApi } from '../lib/api';
import { DatePicker, TimePicker } from '../components/DatePicker';
import { useEventSlug } from '../context/EventSlugContext';
import { config as staticConfig } from '../config/wedding';
import { applyTheme } from '../lib/theme';
import { setFavicon } from '../lib/favicon';
import { getRecommendedPalettes } from '../lib/palettesByEventType';
import type { PaletteKey, InvitationSkin, EventType, EventInfo, MediaFile, StoryEvent, ScheduleItem, FAQItem, GalleryPhoto, MusicTrack, WeddingPartyMember, Hotel, PartySide, GuestInvitation, GuestInvitationCreate, GuestStats, CSVImportPreview, InvitationAuditEntry, InvitationStatus, GuestType } from '../types';

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
  person1_parents: string;
  person2_first: string;
  person2_last: string;
  person2_nick: string;
  person2_parents: string;
  display_names: string;
  hashtag: string;
  hero_cta_label: string;
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
  ceremony_venue_time: string;
  ceremony_venue_dresscode: string;
  reception_venue_time: string;
  reception_venue_dresscode: string;
  gift_registry_enabled: boolean;
  gift_registry_url: string;
  gift_registry_label: string;
  gift_registry_title: string;
  gift_registry_description: string;
  gift_bank_enabled: boolean;
  gift_bank_title: string;
  gift_bank_body: string;
  same_venue: boolean;
  rsvp_enabled: boolean;
  rsvp_deadline: string;
  max_guests: number;
  notification_email: string;
  palette: PaletteKey;
  invitation_mode: string;
  allow_public_rsvp: boolean;
  track_invitation_opens: boolean;
  allow_guest_self_edit: boolean;
  allow_guest_member_names: boolean;
  allow_guest_count_change: boolean;
  rsvp_enforce_pass_limit: boolean;
  show_reserved_passes_message: boolean;
  whatsapp_template: string;
  // ── Personalized full-view ─────────────────────────────────────────────────
  personalized_full_view: boolean;
  personalized_hero_badge_enabled: boolean;
  personalized_hero_badge_label: string;
  personalized_greeting_enabled: boolean;
  personalized_greeting_position: string;
  personalized_greeting_title: string;
  personalized_greeting_body: string;
  personalized_show_passes: boolean;
  personalized_passes_label: string;
  personalized_show_type_badge: boolean;
}

// ── Palette data ───────────────────────────────────────────────────────────

const PALETTE_OPTIONS: { key: PaletteKey; label: string; colors: string[]; category: string }[] = [
  // Existentes
  { key: 'nature',       label: 'Nature',       colors: ['#3E7B57', '#C9A93C', '#F8FCF6', '#1C2D22'],       category: 'Clásico' },
  { key: 'rose-gold',    label: 'Rose Gold',    colors: ['#B76E79', '#C9A84C', '#FAF7F2', '#2A1F1A'],    category: 'Clásico' },
  { key: 'garden',       label: 'Garden',       colors: ['#5E7D5B', '#C4A45A', '#F8F9F5', '#1E2D1B'],       category: 'Clásico' },
  { key: 'navy-gold',    label: 'Navy Gold',    colors: ['#1C2D5A', '#C9A84C', '#F8F5EE', '#0F1835'],    category: 'Clásico' },
  { key: 'sage',         label: 'Sage',         colors: ['#8FA68A', '#C4B5A5', '#FAFAF7', '#2D2D2D'],         category: 'Clásico' },
  { key: 'midnight',     label: 'Midnight',     colors: ['#9B5A6A', '#E8C977', '#13111E', '#F0E6DC'],     category: 'Clásico' },
  // Enterprise
  { key: 'platinum',     label: 'Platinum',     colors: ['#2C3E50', '#E74C3C', '#F8F9FA', '#1A1A1A'],     category: 'Enterprise' },
  { key: 'sapphire',     label: 'Sapphire',     colors: ['#003A70', '#FFB81C', '#F0F4F8', '#001F3F'],     category: 'Enterprise' },
  { key: 'emerald',      label: 'Emerald',      colors: ['#027A48', '#F59E0B', '#E7F5F0', '#082C2C'],      category: 'Enterprise' },
  { key: 'coral',        label: 'Coral',        colors: ['#FF6B6B', '#00B4DB', '#FEF5F5', '#2A2A2A'],        category: 'Enterprise' },
  { key: 'lavender',     label: 'Lavender',     colors: ['#7C3AED', '#FCD34D', '#F3F0FF', '#2D1B4E'],     category: 'Enterprise' },
  { key: 'teal',         label: 'Teal',         colors: ['#0D9488', '#EA580C', '#F0FDFA', '#134E4A'],         category: 'Enterprise' },
  { key: 'burgundy',     label: 'Burgundy',     colors: ['#6B2542', '#D4AF37', '#FAF3F7', '#3D1F2A'],     category: 'Enterprise' },
  { key: 'gold-premium', label: 'Gold Premium', colors: ['#B8860B', '#2C3E50', '#FEF9E7', '#3D2817'], category: 'Enterprise' },
  { key: 'ocean',        label: 'Ocean',        colors: ['#0369A1', '#EF4444', '#F0F9FF', '#082F49'],        category: 'Enterprise' },
  // Natural / Festivo
  { key: 'mint',         label: 'Mint',         colors: ['#0D9488', '#FB923C', '#F6FFFE', '#134E4A'],         category: 'Natural' },
  { key: 'peach',        label: 'Peach',        colors: ['#F97316', '#8B5CF6', '#FFFAF7', '#431407'],        category: 'Natural' },
  { key: 'denim',        label: 'Denim',        colors: ['#1D4ED8', '#F59E0B', '#F8FAFF', '#1E3A5F'],        category: 'Natural' },
  { key: 'mustard',      label: 'Mustard',      colors: ['#D97706', '#7C3AED', '#FFFDF0', '#2D1A00'],      category: 'Natural' },
  { key: 'cream',        label: 'Cream',        colors: ['#92400E', '#065F46', '#FFFDF5', '#1C0A00'],        category: 'Natural' },
  { key: 'olive',        label: 'Olive',        colors: ['#4F6835', '#C9A84C', '#F8F3E8', '#2A2217'],        category: 'Envelope' },
  { key: 'paper-olive',  label: 'Paper Olive',  colors: ['#3F5631', '#B58A2E', '#FBFAF6', '#23251F'],        category: 'Paper' },
];

const EVENT_TYPE_OPTIONS: { value: EventType; label: string; emoji: string }[] = [
  { value: 'boda',        label: 'Boda',        emoji: '💍' },
  { value: 'cumpleanos',  label: 'Cumpleaños',  emoji: '🎂' },
  { value: 'bautismo',    label: 'Bautismo',    emoji: '👶' },
  { value: 'quinceanera', label: 'Quinceañera', emoji: '💃' },
  { value: 'graduacion',  label: 'Graduación',  emoji: '🎓' },
  { value: 'corporativo',      label: 'Corporativo',     emoji: '💼' },
  { value: 'primera-comunion', label: 'Primera Comunión', emoji: '✝️' },
  { value: 'aniversario',      label: 'Aniversario',      emoji: '💑' },
  { value: 'baby-shower',      label: 'Baby Shower',      emoji: '🍼' },
];

const EVENT_LABELS: Record<EventType, {
  person1: string; person2: string; displayNames: string;
  dateLabel: string; venueLabel: string; singleVenue: boolean;
  parents1Label: string; parents2Label: string;
  parents1Placeholder: string; parents2Placeholder: string;
}> = {
  boda:              { person1: 'Novio/a 1',          person2: 'Novio/a 2',    displayNames: 'Ej: Concepción & Eumelio',      dateLabel: 'Fecha de la ceremonia',   venueLabel: 'Ceremonia',     singleVenue: false, parents1Label: 'Padres de la novia',                parents2Label: 'Padres del novio',               parents1Placeholder: 'Ej: Roberto García & Ana Molina',      parents2Placeholder: 'Ej: Carlos Pérez & María López'    },
  cumpleanos:        { person1: 'El/La Festejado/a',  person2: '',             displayNames: 'Ej: Fiesta de Ana',             dateLabel: 'Fecha del evento',        venueLabel: 'Lugar',         singleVenue: true,  parents1Label: 'Padres del/la festejado/a',         parents2Label: '',                               parents1Placeholder: 'Ej: Juan García & Marta Soto',         parents2Placeholder: ''                          },
  bautismo:          { person1: 'Nombre del Bebé',    person2: 'Padres',       displayNames: 'Ej: Bautismo de Sofía',         dateLabel: 'Fecha del bautismo',      venueLabel: 'Iglesia/Lugar', singleVenue: false, parents1Label: 'Abuelos paternos del bebé',         parents2Label: 'Abuelos maternos del bebé',      parents1Placeholder: 'Ej: Carlos Gómez & Elena Ruiz',        parents2Placeholder: 'Ej: Pedro Torres & Laura Vega'     },
  quinceanera:       { person1: 'La Quinceañera',     person2: '',             displayNames: 'Ej: Quinceañera de Valeria',    dateLabel: 'Fecha del evento',        venueLabel: 'Salón',         singleVenue: true,  parents1Label: 'Padres de la quinceañera',          parents2Label: '',                               parents1Placeholder: 'Ej: Hugo Castro & Lorena Díaz',        parents2Placeholder: ''                          },
  graduacion:        { person1: 'El/La Graduado/a',   person2: '',             displayNames: 'Ej: Graduación de Carlos',       dateLabel: 'Fecha de la graduación',  venueLabel: 'Institución',   singleVenue: true,  parents1Label: 'Padres del/la graduado/a',          parents2Label: '',                               parents1Placeholder: 'Ej: Ernesto Ramírez & Gloria Nieto',   parents2Placeholder: ''                          },
  corporativo:       { person1: 'Empresa/Org.',       person2: 'Contacto',     displayNames: 'Ej: Congreso Tecnopowerpy',     dateLabel: 'Fecha del evento',        venueLabel: 'Sede',          singleVenue: true,  parents1Label: 'Patrocinadores principales (opcional)', parents2Label: '',                            parents1Placeholder: 'Ej: Ministerio de Tecnología',         parents2Placeholder: ''                          },
  'primera-comunion':{ person1: 'El/La Comulgante',  person2: 'Padres',       displayNames: 'Ej: Primera Comunión de Lucía', dateLabel: 'Fecha del sacramento',    venueLabel: 'Iglesia/Lugar', singleVenue: false, parents1Label: 'Padrinos de bautismo',              parents2Label: 'Padrinos de primera comunión',   parents1Placeholder: 'Ej: Carlos Mora & Elena Fuentes',      parents2Placeholder: 'Ej: Luis Vega & Ana Ríos'          },
  aniversario:       { person1: 'Persona 1',          person2: 'Persona 2',    displayNames: 'Ej: Aniversario de Bodas',      dateLabel: 'Fecha del aniversario',   venueLabel: 'Lugar',         singleVenue: true,  parents1Label: 'Familia de la persona 1 (opcional)', parents2Label: 'Familia de la persona 2 (opcional)', parents1Placeholder: 'Ej: Familia García',           parents2Placeholder: 'Ej: Familia López'              },
  'baby-shower':     { person1: 'Nombre del Bebé',    person2: 'Mamá',         displayNames: 'Ej: Baby Shower de Valentina',  dateLabel: 'Fecha del evento',        venueLabel: 'Lugar',         singleVenue: true,  parents1Label: 'Abuelos del bebé (opcional)',       parents2Label: '',                               parents1Placeholder: 'Ej: Familia González & Familia Morales', parents2Placeholder: ''                       },
};

type Tab = 'dashboard' | 'rsvps' | 'invitados' | 'config' | 'tema' | 'media' | 'eventos' | 'secciones' | 'ayuda';

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

// ── Guest Form Component ───────────────────────────────────────────────────

interface GuestFormProps {
  initial: GuestInvitation | null;
  onSave: (data: GuestInvitationCreate) => Promise<void>;
  onCancel: () => void;
}

function GuestForm({ initial, onSave, onCancel }: GuestFormProps) {
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(initial?.display_name ?? '');
  const [contactName, setContactName] = useState(initial?.contact_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [groupName, setGroupName] = useState(initial?.group_name ?? '');
  const [guestType, setGuestType] = useState<GuestType>(initial?.guest_type ?? 'general');
  const [allowedPasses, setAllowedPasses] = useState(initial?.allowed_passes ?? 1);
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState(initial?.tags?.join(', ') ?? '');
  const [conditionalFlags, setConditionalFlags] = useState(initial?.conditional_flags?.join(', ') ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    try {
      await onSave({
        display_name: displayName.trim(),
        contact_name: contactName.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        group_name: groupName.trim() || undefined,
        guest_type: guestType,
        allowed_passes: allowedPasses,
        notes: notes.trim() || undefined,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        conditional_flags: conditionalFlags.split(',').map(s => s.trim()).filter(Boolean),
      });
    } finally { setSaving(false); }
  };

  const guestTypeOptions: { value: GuestType; label: string; desc: string }[] = [
    { value: 'general', label: 'General', desc: 'Invitado estándar' },
    { value: 'family', label: 'Familia', desc: 'Familiar directo' },
    { value: 'vip', label: 'VIP', desc: 'Invitado especial' },
    { value: 'staff', label: 'Staff', desc: 'Personal del evento' },
  ];

  const SectionLabel = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 pt-2 pb-1">
      <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* ── Datos principales ─────────────────────────────────── */}
      <SectionLabel>Datos principales</SectionLabel>
      <div>
        <label className="input-label">Nombre visible en la invitación *</label>
        <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="input-field" placeholder="Ej: Familia García, Juan y María, Dr. López..." required />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Este nombre aparece en el saludo: <em>"¡Hola, Familia García!"</em> — sé descriptivo.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="input-label">Nombre de contacto</label>
          <input value={contactName} onChange={e => setContactName(e.target.value)} className="input-field" placeholder="Nombre de quien coordinas" />
        </div>
        <div>
          <label className="input-label">Mesa o grupo</label>
          <input value={groupName} onChange={e => setGroupName(e.target.value)} className="input-field" placeholder="Ej: Mesa 5, Familia García..." />
        </div>
      </div>

      {/* ── Cupos y tipo ──────────────────────────────────────── */}
      <SectionLabel>Cupos y acceso</SectionLabel>
      <div>
        <label className="input-label">Cantidad de pases reservados *</label>
        <div className="flex items-center gap-3 mt-1">
          <button type="button" onClick={() => setAllowedPasses(Math.max(1, allowedPasses - 1))} className="btn-outline w-9 h-9 p-0 flex items-center justify-center text-lg font-bold">−</button>
          <span className="text-3xl font-bold font-heading w-12 text-center" style={{ color: 'var(--color-primary)' }}>{allowedPasses}</span>
          <button type="button" onClick={() => setAllowedPasses(Math.min(50, allowedPasses + 1))} className="btn-outline w-9 h-9 p-0 flex items-center justify-center text-lg font-bold">+</button>
          <p className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>El RSVP no podrá<br/>confirmar más de este número.</p>
        </div>
      </div>
      <div>
        <label className="input-label">Tipo de invitado</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {guestTypeOptions.map(opt => (
            <button key={opt.value} type="button" onClick={() => setGuestType(opt.value)}
              className="p-2.5 rounded-xl border-2 text-left transition-all"
              style={{ borderColor: guestType === opt.value ? 'var(--color-primary)' : 'var(--color-border)', background: guestType === opt.value ? 'var(--color-secondary)' : 'var(--color-surface)' }}>
              <p className="text-xs font-medium font-body" style={{ color: 'var(--color-text)' }}>{opt.label}</p>
              <p className="text-xs font-body mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Contacto ──────────────────────────────────────────── */}
      <SectionLabel>Contacto</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="input-label">Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" className="input-field" placeholder="contacto@ejemplo.com" />
        </div>
        <div>
          <label className="input-label">Teléfono / WhatsApp</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="+595 981 234 567" />
        </div>
      </div>

      {/* ── Opciones avanzadas ────────────────────────────────── */}
      <SectionLabel>Opciones avanzadas</SectionLabel>
      <div>
        <label className="input-label">Etiquetas <span className="font-normal">(separadas por coma)</span></label>
        <input value={tags} onChange={e => setTags(e.target.value)} className="input-field" placeholder="Ej: mesa-1, vegetariano, viaja..." />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Para filtrar y agrupar en el listado. No son visibles para el invitado.</p>
      </div>
      <div>
        <label className="input-label">Acceso especial <span className="font-normal">(secciones exclusivas)</span></label>
        <input value={conditionalFlags} onChange={e => setConditionalFlags(e.target.value)} className="input-field" placeholder="Ej: after_party, transporte, cena_ensayo..." />
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Este invitado verá tarjetas extra en su invitación para cada flag que agregues aquí.</p>
      </div>
      <div>
        <label className="input-label">Notas internas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="input-field resize-none" placeholder="Solo visible para ti (ej: alergia a mariscos, confirmó por teléfono)..." />
      </div>

      {/* ── Acciones ──────────────────────────────────────────── */}
      <div className="flex gap-3 pt-3">
        <button type="button" onClick={onCancel} className="btn-outline py-2.5 text-sm px-5">Cancelar</button>
        <button type="submit" disabled={!displayName.trim() || saving} className="btn-primary flex-1 py-2.5 text-sm gap-2 disabled:opacity-50">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
          {initial ? 'Guardar cambios' : 'Guardar y copiar link'}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const eventSlug = useEventSlug();

  const [token, setToken] = useState(localStorage.getItem('eventique_admin_token') ?? '');
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [rsvps, setRsvps] = useState<RSVPRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
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
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventToken, setNewEventToken] = useState('');
  const [eventFormErrors, setEventFormErrors] = useState<{ name?: string; slug?: string }>({});

  // RSVP edit modal
  const [editingRsvp, setEditingRsvp] = useState<RSVPRecord | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    name: string; email: string; attending: boolean;
    guest_count: number; dietary_restrictions: string;
    song_request: string; message: string;
  }>({ name: '', email: '', attending: true, guest_count: 1, dietary_restrictions: '', song_request: '', message: '' });

  // QR code modal
  const [showQrFor, setShowQrFor] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showQrFor) setShowQrFor(null);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showQrFor]);

  // Token modal
  const [tokenModal, setTokenModal] = useState<{ slug: string; token: string } | null>(null);
  const [generatingToken, setGeneratingToken] = useState<string | null>(null);

  // Event selector dropdown
  const [showEventSelector, setShowEventSelector] = useState(false);
  const eventSelectorRef = useRef<HTMLDivElement>(null);

  // Close event selector on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (eventSelectorRef.current && !eventSelectorRef.current.contains(e.target as Node)) {
        setShowEventSelector(false);
      }
    };
    if (showEventSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEventSelector]);

  // Sections content state
  const [storyEnabled, setStoryEnabled] = useState(true);
  const [storyTitle, setStoryTitle] = useState('');
  const [storyEvents, setStoryEvents] = useState<StoryEvent[]>([]);
  const [scheduleEnabled, setScheduleEnabled] = useState(true);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);
  const [faqEnabled, setFaqEnabled] = useState(true);
  const [faqTitle, setFaqTitle] = useState('');
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [footerEnabled, setFooterEnabled] = useState(true);
  const [footerMsg, setFooterMsg] = useState('');
  const [footerCredits, setFooterCredits] = useState('');
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [musicTracks, setMusicTracks] = useState<MusicTrack[]>([]);
  const [giftBankAccounts, setGiftBankAccounts] = useState<Array<{ label: string; value: string }>>([]);
  const [newBankLabel, setNewBankLabel] = useState('');
  const [newBankValue, setNewBankValue] = useState('');
  const [savingSections, setSavingSections] = useState(false);
  // Section add-form state
  const [newStoryDate, setNewStoryDate] = useState('');
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryDesc, setNewStoryDesc] = useState('');
  const [newItemTime, setNewItemTime] = useState('');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');

  // Editing state
  const [editingStoryIdx, setEditingStoryIdx] = useState<number | null>(null);
  const [storySnapshot, setStorySnapshot] = useState<StoryEvent | null>(null);
  const [editingScheduleIdx, setEditingScheduleIdx] = useState<number | null>(null);
  const [scheduleSnapshot, setScheduleSnapshot] = useState<ScheduleItem | null>(null);
  const [editingPartyIdx, setEditingPartyIdx] = useState<number | null>(null);
  const [partySnapshot, setPartySnapshot] = useState<WeddingPartyMember | null>(null);
  const [editingAccomIdx, setEditingAccomIdx] = useState<number | null>(null);
  const [accomSnapshot, setAccomSnapshot] = useState<Hotel | null>(null);
  const [editingFaqIdx, setEditingFaqIdx] = useState<number | null>(null);
  const [faqSnapshot, setFaqSnapshot] = useState<FAQItem | null>(null);

  // Hero section
  const [heroEnabled, setHeroEnabled] = useState(true);
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroCta, setHeroCta] = useState('');
  const [heroBgImage, setHeroBgImage] = useState('');
  const [heroOverlay, setHeroOverlay] = useState(0.45);
  const [heroScrollIndicator, setHeroScrollIndicator] = useState(true);

  // Countdown section
  const [countdownEnabled, setCountdownEnabled] = useState(true);
  const [countdownLabel, setCountdownLabel] = useState('');

  // Gallery extras
  const [galleryEnabled, setGalleryEnabled] = useState(true);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [gallerySubtitle, setGallerySubtitle] = useState('');

  // WeddingParty section
  const [partyEnabled, setPartyEnabled] = useState(false);
  const [partyTitle, setPartyTitle] = useState('');
  const [partyMembers, setPartyMembers] = useState<WeddingPartyMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberSide, setNewMemberSide] = useState<PartySide>('both');
  const [newMemberDesc, setNewMemberDesc] = useState('');

  // Accommodation section
  const [accomEnabled, setAccomEnabled] = useState(false);
  const [accomTitle, setAccomTitle] = useState('');
  const [accomHotels, setAccomHotels] = useState<Hotel[]>([]);
  const [newHotelName, setNewHotelName] = useState('');
  const [newHotelAddress, setNewHotelAddress] = useState('');
  const [newHotelPhone, setNewHotelPhone] = useState('');
  const [newHotelWebsite, setNewHotelWebsite] = useState('');
  const [newHotelStars, setNewHotelStars] = useState(0);
  const [newHotelPrice, setNewHotelPrice] = useState('');
  const [newHotelNotes, setNewHotelNotes] = useState('');

  // RSVP section extras
  const [rsvpTitle, setRsvpTitle] = useState('');
  const [rsvpSubtitle, setRsvpSubtitle] = useState('');
  const [rsvpConfirmMsg, setRsvpConfirmMsg] = useState('');

  // Social
  const [socialHashtag, setSocialHashtag] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');

  // ── Invitation skin ───────────────────────────────────────────────────────
  const [invitationSkin, setInvitationSkin] = useState<InvitationSkin>('classic');
  const [envelopeOpeningText, setEnvelopeOpeningText] = useState('');
  const [envelopeTapLabel, setEnvelopeTapLabel] = useState('');
  const [collageCountdownLabel, setCollageCountdownLabel] = useState('');
  const [collageSubtitle, setCollageSubtitle] = useState('');
  const [venuesCeremonyLabel, setVenuesCeremonyLabel] = useState('');
  const [venuesReceptionLabel, setVenuesReceptionLabel] = useState('');
  const [venuesCeremonyIcon, setVenuesCeremonyIcon] = useState('');
  const [venuesReceptionIcon, setVenuesReceptionIcon] = useState('');
  const [dressCodeEnabled, setDressCodeEnabled] = useState(true);
  const [dressCodeTitle, setDressCodeTitle] = useState('');
  const [dressCodeValue, setDressCodeValue] = useState('');
  const [galleryPolaroidEnabled, setGalleryPolaroidEnabled] = useState(true);
  const [galleryPolaroidFooter, setGalleryPolaroidFooter] = useState('');
  const [galleryPolaroidBw, setGalleryPolaroidBw] = useState(true);
  const [paperAccessIntroLabel, setPaperAccessIntroLabel] = useState('');
  const [paperAccessIntroText, setPaperAccessIntroText] = useState('');
  const [paperAccessTapLabel, setPaperAccessTapLabel] = useState('');
  const [paperAccessGuestLabel, setPaperAccessGuestLabel] = useState('');
  const [paperAccessPassesLabel, setPaperAccessPassesLabel] = useState('');
  const [paperMusicPrompt, setPaperMusicPrompt] = useState('');
  const [paperMusicButtonLabel, setPaperMusicButtonLabel] = useState('');
  const [paperParentsIntro, setPaperParentsIntro] = useState('');
  const [paperCalendarTitle, setPaperCalendarTitle] = useState('');
  const [paperCalendarButtonLabel, setPaperCalendarButtonLabel] = useState('');
  const [paperVenuesTitle, setPaperVenuesTitle] = useState('');
  const [paperLocationButtonLabel, setPaperLocationButtonLabel] = useState('');
  const [paperGiftIntro, setPaperGiftIntro] = useState('');
  const [paperCountdownTitle, setPaperCountdownTitle] = useState('');
  const [paperCountdownSubtitle, setPaperCountdownSubtitle] = useState('');
  const [paperCountdownDaysLabel, setPaperCountdownDaysLabel] = useState('');
  const [paperCountdownHoursLabel, setPaperCountdownHoursLabel] = useState('');
  const [paperCountdownMinutesLabel, setPaperCountdownMinutesLabel] = useState('');
  const [paperRsvpTitle, setPaperRsvpTitle] = useState('');

  // Music extras
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicAutoplay, setMusicAutoplay] = useState(false);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newYoutubeTitle, setNewYoutubeTitle] = useState('');
  const [newYoutubeArtist, setNewYoutubeArtist] = useState('');
  const trackDragSrc = useRef<number | null>(null);
  const [trackDragOver, setTrackDragOver] = useState<number | null>(null);

  // Duplicate event modal
  const [duplicatingSlug, setDuplicatingSlug] = useState<string | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupSlug, setDupSlug] = useState('');
  const [dupToken, setDupToken] = useState('');
  const [savingDup, setSavingDup] = useState(false);

  // ── Invitados tab state ────────────────────────────────────────────────────
  const [guests, setGuests] = useState<GuestInvitation[]>([]);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestStatusFilter, setGuestStatusFilter] = useState('');
  const [guestPage, setGuestPage] = useState(1);
  const [guestTotal, setGuestTotal] = useState(0);
  const [guestPages, setGuestPages] = useState(1);
  const [showCreateGuest, setShowCreateGuest] = useState(false);
  const [editingGuest, setEditingGuest] = useState<GuestInvitation | null>(null);
  const [showGuestQR, setShowGuestQR] = useState<{ guest: GuestInvitation; url: string } | null>(null);
  const [showCSVImport, setShowCSVImport] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CSVImportPreview | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState<{
    guest: GuestInvitation;
    message: string;
    url: string;
    short_url?: string;
    full_invitation_url?: string;
  } | null>(null);
  const [guestAudit, setGuestAudit] = useState<InvitationAuditEntry[]>([]);
  const [showAuditModal, setShowAuditModal] = useState(false);

  const { register, handleSubmit, reset, watch, control, setValue } = useForm<ConfigFormData>({
    defaultValues: buildDefaultValues({}),
  });

  const watchedEventType = watch('event_type');
  const watchedPalette = watch('palette');

  // Update favicon and suggest palette when event type changes
  useEffect(() => {
    if (watchedEventType) {
      setFavicon(watchedEventType);
      // Suggest default palette for the event type if not yet set
      const recommendedPalettes = getRecommendedPalettes(watchedEventType);
      if (recommendedPalettes.length > 0 && !watchedPalette) {
        setValue('palette', recommendedPalettes[0]);
      }
    }
  }, [watchedEventType, setValue, watchedPalette]);

  // ── Guests tab loader ─────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'invitados' && authed) {
      loadGuests(1, '', '');
      loadGuestStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, authed]);

  // ── Auth ──────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await rsvpApi.listAll(eventSlug, password);
      if (data.status === 200) {
        setToken(password);
        localStorage.setItem('eventique_admin_token', password);
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
        if (defaults.event_type) setFavicon(defaults.event_type);

        // Load section content
        const sects = (cfg.sections as Record<string, unknown> | undefined) ?? {};
        const story = sects.ourStory as Record<string, unknown> | undefined;
        const sched = sects.schedule as Record<string, unknown> | undefined;
        const faq   = sects.faq    as Record<string, unknown> | undefined;
        const foot  = sects.footer as Record<string, unknown> | undefined;
        const gal   = sects.gallery as Record<string, unknown> | undefined;
        const mus   = cfg.music as Record<string, unknown> | undefined;
        setStoryEnabled((story?.enabled as boolean) ?? true);
        setStoryTitle((story?.title as string) ?? '');
        setStoryEvents((story?.events as StoryEvent[]) ?? []);
        setScheduleEnabled((sched?.enabled as boolean) ?? true);
        setScheduleTitle((sched?.title as string) ?? '');
        setScheduleItems((sched?.items as ScheduleItem[]) ?? []);
        setFaqEnabled((faq?.enabled as boolean) ?? true);
        setFaqTitle((faq?.title as string) ?? '');
        setFaqItems((faq?.items as FAQItem[]) ?? []);
        setFooterEnabled((foot?.enabled as boolean) ?? true);
        setFooterMsg((foot?.message as string) ?? '');
        setFooterCredits((foot?.credits as string) ?? '');
        setGalleryPhotos((gal?.photos as GalleryPhoto[]) ?? []);
        setMusicTracks((mus?.tracks as MusicTrack[]) ?? []);
        setGiftBankAccounts((cfg.gift_bank_accounts as Array<{ label: string; value: string }>) ?? []);

        // Extended sections
        const hero = sects.hero as Record<string, unknown> | undefined;
        const countdown = sects.countdown as Record<string, unknown> | undefined;
        const gallery = sects.gallery as Record<string, unknown> | undefined;
        const party = sects.weddingParty as Record<string, unknown> | undefined;
        const accom = sects.accommodation as Record<string, unknown> | undefined;
        const rsvpS = sects.rsvp as Record<string, unknown> | undefined;
        const soc = cfg.social as Record<string, unknown> | undefined;

        setHeroEnabled((hero?.enabled as boolean) ?? true);
        setHeroSubtitle((hero?.subtitle as string) ?? '');
        setHeroCta((hero?.ctaLabel as string) ?? '');
        setHeroBgImage((hero?.backgroundImage as string) ?? '');
        setHeroOverlay((hero?.overlayOpacity as number) ?? 0.45);
        setHeroScrollIndicator((hero?.showScrollIndicator as boolean) ?? true);

        setCountdownEnabled((countdown?.enabled as boolean) ?? true);
        setCountdownLabel((countdown?.label as string) ?? '');

        setGalleryEnabled((gallery?.enabled as boolean) ?? true);
        setGalleryTitle((gallery?.title as string) ?? '');
        setGallerySubtitle((gallery?.subtitle as string) ?? '');

        setPartyEnabled((party?.enabled as boolean) ?? false);
        setPartyTitle((party?.title as string) ?? '');
        setPartyMembers((party?.members as WeddingPartyMember[]) ?? []);

        setAccomEnabled((accom?.enabled as boolean) ?? false);
        setAccomTitle((accom?.title as string) ?? '');
        setAccomHotels((accom?.hotels as Hotel[]) ?? []);

        setRsvpTitle((rsvpS?.title as string) ?? '');
        setRsvpSubtitle((rsvpS?.subtitle as string) ?? '');
        setRsvpConfirmMsg((rsvpS?.confirmationMessage as string) ?? '');

        setSocialHashtag((soc?.hashtag as string) ?? '');
        setSocialInstagram((soc?.instagram as string) ?? '');

        setMusicEnabled((mus?.enabled as boolean) ?? true);
        setMusicAutoplay((mus?.autoplay as boolean) ?? false);

        // Invitation skin
        setInvitationSkin(((cfg.invitation_skin as string) ?? 'classic') as InvitationSkin);
        setEnvelopeOpeningText((cfg.envelope_opening_text as string) ?? 'Empieza una nueva etapa en nuestras vidas');
        setEnvelopeTapLabel((cfg.envelope_tap_label as string) ?? 'Tocá aquí');
        setCollageCountdownLabel((cfg.collage_countdown_label as string) ?? 'Sólo Faltan');
        setCollageSubtitle((cfg.collage_subtitle as string) ?? 'Nuestra Boda');
        setVenuesCeremonyLabel((cfg.venues_ceremony_label as string) ?? 'Misa');
        setVenuesReceptionLabel((cfg.venues_reception_label as string) ?? 'Brindis');
        setVenuesCeremonyIcon((cfg.venues_ceremony_icon as string) ?? 'church');
        setVenuesReceptionIcon((cfg.venues_reception_icon as string) ?? 'champagne');
        setDressCodeEnabled((cfg.dress_code_enabled as boolean) ?? true);
        setDressCodeTitle((cfg.dress_code_title as string) ?? 'Código de Vestimenta');
        setDressCodeValue((cfg.dress_code_value as string) ?? 'Formal');
        setGalleryPolaroidEnabled((cfg.gallery_polaroid_enabled as boolean) ?? true);
        setGalleryPolaroidFooter((cfg.gallery_polaroid_footer_text as string) ?? 'Te Esperamos');
        setGalleryPolaroidBw((cfg.gallery_polaroid_bw as boolean) ?? true);
        setPaperAccessIntroLabel((cfg.paper_access_intro_label as string) ?? 'Invitacion digital');
        setPaperAccessIntroText((cfg.paper_access_intro_text as string) ?? 'Abre nuestra invitacion');
        setPaperAccessTapLabel((cfg.paper_access_tap_label as string) ?? 'Toca aqui');
        setPaperAccessGuestLabel((cfg.paper_access_guest_label as string) ?? 'Invitacion especial para');
        setPaperAccessPassesLabel((cfg.paper_access_passes_label as string) ?? 'Hemos reservado {passes} cupo(s) para ti.');
        setPaperMusicPrompt((cfg.paper_music_prompt as string) ?? 'Dale play para escuchar nuestra cancion');
        setPaperMusicButtonLabel((cfg.paper_music_button_label as string) ?? 'Reproducir musica');
        setPaperParentsIntro((cfg.paper_parents_intro as string) ?? 'En compania de nuestras familias');
        setPaperCalendarTitle((cfg.paper_calendar_title as string) ?? 'Anadelo a tu calendario');
        setPaperCalendarButtonLabel((cfg.paper_calendar_button_label as string) ?? 'Agregar al calendario');
        setPaperVenuesTitle((cfg.paper_venues_title as string) ?? 'Detalles del evento');
        setPaperLocationButtonLabel((cfg.paper_location_button_label as string) ?? 'Ubicacion');
        setPaperGiftIntro((cfg.paper_gift_intro as string) ?? 'Su compania es lo mas importante.');
        setPaperCountdownTitle((cfg.paper_countdown_title as string) ?? 'Faltan');
        setPaperCountdownSubtitle((cfg.paper_countdown_subtitle as string) ?? 'Para nuestro gran dia');
        setPaperCountdownDaysLabel((cfg.paper_countdown_days_label as string) ?? 'Dias');
        setPaperCountdownHoursLabel((cfg.paper_countdown_hours_label as string) ?? 'Horas');
        setPaperCountdownMinutesLabel((cfg.paper_countdown_minutes_label as string) ?? 'Minutos');
        setPaperRsvpTitle((cfg.paper_rsvp_title as string) ?? 'Confirmar asistencia');

        // Secondary data (events + media) — don't fail auth on errors
        Promise.allSettled([
          rsvpApi.listMedia(eventSlug, token),
          rsvpApi.listEvents(token),
        ]).then(([mediaRes, eventsRes]) => {
          if (mediaRes.status === 'fulfilled') setMediaFiles(mediaRes.value.data);
          if (eventsRes.status === 'fulfilled') {
            setEvents(eventsRes.value.data);
            setIsSuperadmin(true);
          } else {
            setIsSuperadmin(false);
          }
        });
      })
      .catch(() => {
        setToken('');
        setAuthed(false);
        localStorage.removeItem('eventique_admin_token');
      })
      .finally(() => setLoading(false));
  }, [token, eventSlug]); // eslint-disable-line

  const handleLogout = () => {
    setToken('');
    setAuthed(false);
    localStorage.removeItem('eventique_admin_token');
  };

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
      // Spread the full current config first so music, social, customColors,
      // dates.reception, venue photos, and all other fields are never lost.
      const current = eventCfg as Record<string, unknown>;
      const currentVenues = (current.venues as Record<string, unknown> | undefined) ?? {};
      const currentSects  = (current.sections as Record<string, unknown> | undefined) ?? {};

      await rsvpApi.updateEventConfig(eventSlug, token, {
        ...current,
        event_type: formData.event_type,
        couple: {
          ...(current.couple as object ?? {}),
          person1: { firstName: formData.person1_first, lastName: formData.person1_last, nickname: formData.person1_nick, parents: formData.person1_parents || undefined },
          person2: { firstName: formData.person2_first, lastName: formData.person2_last, nickname: formData.person2_nick, parents: formData.person2_parents || undefined },
          displayNames: formData.display_names,
          hashtag: formData.hashtag,
        },
        dates: {
          ...(current.dates as object ?? {}),    // preserves dates.reception
          ceremony: formData.ceremony_date,
          displayDate: formData.display_date,
          timezone: formData.timezone || 'America/Asuncion',
        },
        venues: {
          ...currentVenues,
          ceremony: {
            ...(currentVenues.ceremony as object ?? {}),   // preserves venue photo
            name: formData.ceremony_venue_name,
            address: formData.ceremony_venue_address,
            city: formData.ceremony_venue_city,
            country: formData.ceremony_venue_country || 'Paraguay',
            mapsUrl: formData.ceremony_maps_url || '',
            time: formData.ceremony_venue_time || undefined,
            dresscode: formData.ceremony_venue_dresscode || undefined,
          },
          reception: {
            ...(currentVenues.reception as object ?? {}),  // preserves venue photo
            name: formData.reception_venue_name,
            address: formData.reception_venue_address,
            city: formData.reception_venue_city,
            country: formData.reception_venue_country || 'Paraguay',
            mapsUrl: formData.reception_maps_url || '',
            time: formData.reception_venue_time || undefined,
            dresscode: formData.reception_venue_dresscode || undefined,
          },
          sameVenue: formData.same_venue,
        },
        theme: { ...(current.theme as object ?? {}), palette: formData.palette },  // preserves customColors
        sections: {
          ...currentSects,
          hero: {
            ...(currentSects.hero as object ?? {}),
            ctaLabel: formData.hero_cta_label || undefined,
          },
          rsvp: {
            ...(currentSects.rsvp as object ?? {}),
            enabled: formData.rsvp_enabled,
            deadline: formData.rsvp_deadline,
            maxGuestsPerResponse: Number(formData.max_guests),
          },
        },
        notification_email: formData.notification_email || undefined,
        gift_registry_enabled: formData.gift_registry_enabled,
        gift_registry_url: formData.gift_registry_url || undefined,
        gift_registry_label: formData.gift_registry_label || undefined,
        gift_registry_title: formData.gift_registry_title || undefined,
        gift_registry_description: formData.gift_registry_description || undefined,
        gift_bank_enabled: formData.gift_bank_enabled,
        gift_bank_title: formData.gift_bank_title || undefined,
        gift_bank_body: formData.gift_bank_body || undefined,
        gift_bank_accounts: giftBankAccounts.length > 0 ? giftBankAccounts : undefined,
        invitation_mode: formData.invitation_mode || 'generic',
        allow_public_rsvp: formData.allow_public_rsvp,
        track_invitation_opens: formData.track_invitation_opens,
        allow_guest_self_edit: formData.allow_guest_self_edit,
        allow_guest_member_names: formData.allow_guest_member_names,
        allow_guest_count_change: formData.allow_guest_count_change,
        rsvp_enforce_pass_limit: formData.rsvp_enforce_pass_limit,
        show_reserved_passes_message: formData.show_reserved_passes_message,
        whatsapp_template: formData.whatsapp_template || undefined,
        personalized_full_view:          formData.personalized_full_view,
        personalized_hero_badge_enabled: formData.personalized_hero_badge_enabled,
        personalized_hero_badge_label:   formData.personalized_hero_badge_label || undefined,
        personalized_greeting_enabled:   formData.personalized_greeting_enabled,
        personalized_greeting_position:  formData.personalized_greeting_position || 'after_hero',
        personalized_greeting_title:     formData.personalized_greeting_title || undefined,
        personalized_greeting_body:      formData.personalized_greeting_body || undefined,
        personalized_show_passes:        formData.personalized_show_passes,
        personalized_passes_label:       formData.personalized_passes_label || undefined,
        personalized_show_type_badge:    formData.personalized_show_type_badge,
      } as never);

      toast.success('Configuración guardada correctamente');

      // Reload full config from DB and sync all derived UI states
      const cfgRes = await rsvpApi.getEventConfig(eventSlug);
      const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
      setEventCfg(updatedCfg);

      // Keep Theme tab palette picker in sync
      setSelectedPalette(formData.palette);

      // Keep Hero section state in sync with ctaLabel saved here
      setHeroCta(formData.hero_cta_label);

      if ((updatedCfg as Partial<ConfigFormData>).event_type) {
        setFavicon((updatedCfg as Partial<ConfigFormData>).event_type!);
      }
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
      // Reload config to ensure sync
      const cfgRes = await rsvpApi.getEventConfig(eventSlug);
      const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
      setEventCfg(updatedCfg);
      // Sync react-hook-form so that a subsequent saveConfig doesn't overwrite with stale palette
      setValue('palette', selectedPalette);
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
    const errors: { name?: string; slug?: string } = {};
    if (!newEventName.trim()) errors.name = 'El nombre del evento es obligatorio';
    if (!newEventSlug.trim()) errors.slug = 'El slug es obligatorio';
    else if (!/^[a-z0-9][a-z0-9-]*[a-z0-9]$/.test(newEventSlug)) errors.slug = 'Solo letras minúsculas, números y guiones';
    if (Object.keys(errors).length > 0) {
      setEventFormErrors(errors);
      toast.error('Por favor completa los campos requeridos');
      return;
    }
    setEventFormErrors({});
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

  const handleEditRsvp = (rsvp: RSVPRecord) => {
    setEditForm({
      name: rsvp.name,
      email: rsvp.email,
      attending: rsvp.attending,
      guest_count: rsvp.guest_count,
      dietary_restrictions: rsvp.dietary_restrictions ?? '',
      song_request: rsvp.song_request ?? '',
      message: rsvp.message ?? '',
    });
    setEditingRsvp(rsvp);
  };

  const handleSaveEdit = async () => {
    if (!editingRsvp) return;
    setSavingEdit(true);
    try {
      const res = await rsvpApi.editRsvp(eventSlug, token, editingRsvp.id, editForm);
      setRsvps((prev) => prev.map((r) => r.id === editingRsvp.id ? (res.data as RSVPRecord) : r));
      setEditingRsvp(null);
      toast.success('Confirmación actualizada');
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleGenerateToken = async (slug: string) => {
    setGeneratingToken(slug);
    try {
      const res = await rsvpApi.generateEventToken(token, slug);
      setTokenModal({ slug, token: res.data.admin_token });
      setEvents((prev) => prev.map((ev) => ev.slug === slug ? { ...ev, admin_token: res.data.admin_token } : ev));
      toast.success('Token generado');
    } catch {
      toast.error('Error al generar token');
    } finally {
      setGeneratingToken(null);
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

  // ── Gallery / Music config helpers ───────────────────────────────────────

  const saveGalleryConfig = async (photos: GalleryPhoto[]) => {
    const current = eventCfg as Record<string, unknown>;
    const sects = (current.sections as Record<string, unknown> | undefined) ?? {};
    const updated = { ...current, sections: { ...sects, gallery: { ...(sects.gallery as object ?? {}), photos } } };
    await rsvpApi.updateEventConfig(eventSlug, token, updated as never);
    // Reload config to ensure sync
    const cfgRes = await rsvpApi.getEventConfig(eventSlug);
    const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
    setEventCfg(updatedCfg);
    const sects2 = (updatedCfg.sections as Record<string, unknown> | undefined) ?? {};
    const gal = sects2.gallery as Record<string, unknown> | undefined;
    setGalleryPhotos((gal?.photos as GalleryPhoto[]) ?? photos);
  };

  const saveMusicConfig = async (tracks: MusicTrack[]) => {
    const current = eventCfg as Record<string, unknown>;
    const mus = (current.music as Record<string, unknown> | undefined) ?? {};
    const updated = { ...current, music: { enabled: musicEnabled, autoplay: musicAutoplay, ...mus, tracks } };
    await rsvpApi.updateEventConfig(eventSlug, token, updated as never);
    // Reload config to ensure sync
    const cfgRes = await rsvpApi.getEventConfig(eventSlug);
    const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
    setEventCfg(updatedCfg);
    const mus2 = (updatedCfg.music as Record<string, unknown> | undefined) ?? {};
    setMusicTracks((mus2.tracks as MusicTrack[]) ?? tracks);
  };

  const addPhotoToGallery = async (url: string, filename: string) => {
    try {
      await saveGalleryConfig([...galleryPhotos, { url, alt: filename }]);
      toast.success('Foto añadida a la galería');
    } catch { toast.error('Error al añadir foto a la galería'); }
  };

  const removePhotoFromGallery = async (url: string) => {
    try {
      await saveGalleryConfig(galleryPhotos.filter((p) => p.url !== url));
      toast.success('Foto eliminada de la galería');
    } catch { toast.error('Error al eliminar foto de la galería'); }
  };

  const addTrackToPlayer = async (url: string, filename: string) => {
    const title = filename.replace(/\.[^/.]+$/, '');
    try {
      await saveMusicConfig([...musicTracks, { title, artist: '', url }]);
      toast.success('Pista añadida al reproductor');
    } catch { toast.error('Error al añadir pista al reproductor'); }
  };

  const removeTrackFromPlayer = async (url: string) => {
    try {
      await saveMusicConfig(musicTracks.filter((t) => t.url !== url));
      toast.success('Pista eliminada del reproductor');
    } catch { toast.error('Error al eliminar pista del reproductor'); }
  };

  const moveTrack = async (from: number, to: number) => {
    if (to < 0 || to >= musicTracks.length) return;
    const next = [...musicTracks];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    try {
      await saveMusicConfig(next);
    } catch { toast.error('Error al reordenar pistas'); }
  };

  const saveSections = async () => {
    setSavingSections(true);
    try {
      const current = eventCfg as Record<string, unknown>;
      const sects = (current.sections as Record<string, unknown> | undefined) ?? {};
      const updated = {
        ...current,
        sections: {
          ...sects,
          hero:         { ...(sects.hero         as object ?? {}), enabled: heroEnabled,     subtitle: heroSubtitle || undefined,    ctaLabel: heroCta || undefined, backgroundImage: heroBgImage || undefined, overlayOpacity: heroOverlay, showScrollIndicator: heroScrollIndicator },
          countdown:    { ...(sects.countdown    as object ?? {}), enabled: countdownEnabled, label: countdownLabel || undefined },
          ourStory:     { ...(sects.ourStory     as object ?? {}), enabled: storyEnabled,    title: storyTitle    || undefined, events: storyEvents    },
          schedule:     { ...(sects.schedule     as object ?? {}), enabled: scheduleEnabled, title: scheduleTitle || undefined, items:  scheduleItems  },
          weddingParty: { ...(sects.weddingParty as object ?? {}), enabled: partyEnabled,   title: partyTitle    || undefined, members: partyMembers  },
          accommodation:{ ...(sects.accommodation as object ?? {}), enabled: accomEnabled,  title: accomTitle    || undefined, hotels:  accomHotels   },
          faq:          { ...(sects.faq          as object ?? {}), enabled: faqEnabled,     title: faqTitle      || undefined, items:   faqItems      },
          gallery:      { ...(sects.gallery      as object ?? {}), enabled: galleryEnabled, title: galleryTitle  || undefined, subtitle: gallerySubtitle || undefined, photos: galleryPhotos },
          rsvp:         { ...(sects.rsvp         as object ?? {}), title: rsvpTitle || undefined, subtitle: rsvpSubtitle || undefined, confirmationMessage: rsvpConfirmMsg || undefined },
          footer:       { ...(sects.footer       as object ?? {}), enabled: footerEnabled,  message: footerMsg   || undefined, credits: footerCredits || undefined },
        },
        music:  { ...(current.music  as object ?? {}), enabled: musicEnabled, autoplay: musicAutoplay, tracks: musicTracks },
        social: { hashtag: socialHashtag || undefined, instagram: socialInstagram || undefined },
        invitation_skin: invitationSkin,
        envelope_opening_text: envelopeOpeningText || undefined,
        envelope_tap_label: envelopeTapLabel || undefined,
        collage_countdown_label: collageCountdownLabel || undefined,
        collage_subtitle: collageSubtitle || undefined,
        venues_ceremony_label: venuesCeremonyLabel || undefined,
        venues_reception_label: venuesReceptionLabel || undefined,
        venues_ceremony_icon: venuesCeremonyIcon || undefined,
        venues_reception_icon: venuesReceptionIcon || undefined,
        dress_code_enabled: dressCodeEnabled,
        dress_code_title: dressCodeTitle || undefined,
        dress_code_value: dressCodeValue || undefined,
        gallery_polaroid_enabled: galleryPolaroidEnabled,
        gallery_polaroid_footer_text: galleryPolaroidFooter || undefined,
        gallery_polaroid_bw: galleryPolaroidBw,
        paper_access_intro_label: paperAccessIntroLabel || undefined,
        paper_access_intro_text: paperAccessIntroText || undefined,
        paper_access_tap_label: paperAccessTapLabel || undefined,
        paper_access_guest_label: paperAccessGuestLabel || undefined,
        paper_access_passes_label: paperAccessPassesLabel || undefined,
        paper_music_prompt: paperMusicPrompt || undefined,
        paper_music_button_label: paperMusicButtonLabel || undefined,
        paper_parents_intro: paperParentsIntro || undefined,
        paper_calendar_title: paperCalendarTitle || undefined,
        paper_calendar_button_label: paperCalendarButtonLabel || undefined,
        paper_venues_title: paperVenuesTitle || undefined,
        paper_location_button_label: paperLocationButtonLabel || undefined,
        paper_gift_intro: paperGiftIntro || undefined,
        paper_countdown_title: paperCountdownTitle || undefined,
        paper_countdown_subtitle: paperCountdownSubtitle || undefined,
        paper_countdown_days_label: paperCountdownDaysLabel || undefined,
        paper_countdown_hours_label: paperCountdownHoursLabel || undefined,
        paper_countdown_minutes_label: paperCountdownMinutesLabel || undefined,
        paper_rsvp_title: paperRsvpTitle || undefined,
      };
      await rsvpApi.updateEventConfig(eventSlug, token, updated as never);
      toast.success('Secciones guardadas correctamente');
      // Reload config to ensure sync
      const cfgRes = await rsvpApi.getEventConfig(eventSlug);
      const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
      setEventCfg(updatedCfg);
    } catch { toast.error('Error al guardar las secciones'); }
    finally { setSavingSections(false); }
  };

  // ── YouTube track + event duplication handlers ────────────────────────────

  const addYoutubeTrack = async () => {
    if (!newYoutubeUrl.trim()) return;
    const title = newYoutubeTitle.trim() || 'YouTube Track';
    try {
      await saveMusicConfig([...musicTracks, { title, artist: newYoutubeArtist.trim(), url: newYoutubeUrl.trim() }]);
      setNewYoutubeUrl(''); setNewYoutubeTitle(''); setNewYoutubeArtist('');
      toast.success('Pista YouTube añadida');
    } catch { toast.error('Error al añadir pista YouTube'); }
  };

  const handleDuplicateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dupName || !dupSlug || !duplicatingSlug) return;
    setSavingDup(true);
    try {
      const res = await rsvpApi.duplicateEvent(token, duplicatingSlug, { name: dupName, slug: dupSlug, admin_token: dupToken || undefined });
      setEvents((prev) => [...prev, res.data]);
      setDuplicatingSlug(null);
      setDupName(''); setDupSlug(''); setDupToken('');
      toast.success(`Evento "${dupName}" duplicado`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg ?? 'Error al duplicar el evento');
    } finally { setSavingDup(false); }
  };

  // ── Guest management helpers ────────────────────────────────────────────────
  const loadGuests = async (page = 1, search = guestSearch, statusFilter = guestStatusFilter) => {
    if (!token) return;
    setGuestLoading(true);
    try {
      const res = await rsvpApi.listGuests(eventSlug, token, {
        page, limit: 20,
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      });
      const data = res.data as { items: GuestInvitation[]; total: number; page: number; pages: number };
      setGuests(data.items ?? []);
      setGuestTotal(data.total ?? 0);
      setGuestPage(data.page ?? 1);
      setGuestPages(data.pages ?? 1);
    } catch { /* silent */ } finally { setGuestLoading(false); }
  };

  const loadGuestStats = async () => {
    if (!token) return;
    try {
      const res = await rsvpApi.getGuestStats(eventSlug, token);
      setGuestStats(res.data as GuestStats);
    } catch { /* silent */ }
  };

  const handleGuestDelete = async (id: number) => {
    if (!confirm('¿Archivar este invitado? No se eliminará permanentemente.')) return;
    try {
      await rsvpApi.deleteGuest(eventSlug, token, id);
      toast.success('Invitado archivado');
      loadGuests(guestPage);
      loadGuestStats();
    } catch { toast.error('Error al archivar invitado'); }
  };

  // Always build invitation URLs using the browser's own origin so they work
  // in every environment (local dev, staging, production) without extra config.
  const buildInvUrl = (tokenLookup: string) =>
    `${window.location.origin}/e/${eventSlug}/i/${tokenLookup}`;

  const buildShortInvUrl = (tokenLookup: string) =>
    `${window.location.origin}/s/${tokenLookup.slice(0, 16)}`;

  const handleRegenerateToken = async (guest: GuestInvitation) => {
    if (!confirm(`¿Regenerar el link de "${guest.display_name}"? El link anterior dejará de funcionar.`)) return;
    try {
      const res = await rsvpApi.regenerateGuestToken(eventSlug, token, guest.id);
      const data = res.data as { token_lookup: string };
      toast.success('Link regenerado');
      loadGuests(guestPage);
      if (data?.token_lookup) {
        const newUrl = buildShortInvUrl(data.token_lookup);
        navigator.clipboard.writeText(newUrl).catch(() => {});
        toast.success('Nuevo link corto copiado al portapapeles');
      }
    } catch { toast.error('Error al regenerar link'); }
  };

  const handleCopyLink = (guest: GuestInvitation) => {
    const url = buildShortInvUrl(guest.token_lookup);
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Link corto copiado al portapapeles');
  };

  const handleShowQR = (guest: GuestInvitation) => {
    setShowGuestQR({ guest, url: buildShortInvUrl(guest.token_lookup) });
  };

  const handleShowWhatsApp = async (guest: GuestInvitation) => {
    try {
      const res = await rsvpApi.getGuestWhatsApp(eventSlug, token, guest.id, window.location.origin);
      setWhatsappMsg({
        guest,
        ...(res.data as {
          message: string;
          url: string;
          short_url?: string;
          full_invitation_url?: string;
        }),
      });
    } catch { toast.error('Error al generar mensaje'); }
  };

  const handleShowAudit = async (guest: GuestInvitation) => {
    try {
      const res = await rsvpApi.getGuestAudit(eventSlug, token, guest.id);
      setGuestAudit(res.data as InvitationAuditEntry[]);
      setShowAuditModal(true);
    } catch { toast.error('Error al cargar historial'); }
  };

  const handleExportCSV = async () => {
    try {
      const res = await rsvpApi.exportGuestsCSV(eventSlug, token);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `invitados-${eventSlug}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Error al exportar'); }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await rsvpApi.downloadGuestTemplate(eventSlug, token);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `plantilla-invitados.csv`; a.click(); URL.revokeObjectURL(url);
    } catch { toast.error('Error al descargar plantilla'); }
  };

  const handleCSVPreview = async (file: File) => {
    setCsvImporting(true);
    try {
      const res = await rsvpApi.importGuestsPreview(eventSlug, token, file);
      setCsvPreview(res.data as CSVImportPreview);
    } catch { toast.error('Error al procesar el archivo CSV'); } finally { setCsvImporting(false); }
  };

  const handleCSVCommit = async () => {
    if (!csvPreview?.valid_rows?.length) return;
    setCsvImporting(true);
    try {
      const res = await rsvpApi.importGuestsCommit(eventSlug, token, csvPreview.valid_rows);
      const result = res.data as { imported: number; errors: number };
      toast.success(`${result.imported} invitados importados correctamente`);
      if (result.errors > 0) toast.error(`${result.errors} filas con errores no importadas`);
      setCsvPreview(null); setShowCSVImport(false);
      loadGuests(1); loadGuestStats();
    } catch { toast.error('Error al importar invitados'); } finally { setCsvImporting(false); }
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
        <div className="card w-full max-w-sm p-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}>
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="section-title text-3xl">Eventique</h1>
            <p className="text-muted mt-1 text-sm">Panel de administración</p>
            {eventSlug !== 'default' && (
              <span className="inline-block text-xs font-mono mt-2 px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-secondary)', color: 'var(--color-accent)' }}>
                /{eventSlug}
              </span>
            )}
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="input-label">Token de acceso</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••••••"
                autoFocus
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
    <>
    <div className="min-h-screen p-6 sm:p-10" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <h1 className="section-title text-left text-4xl">Eventique</h1>
            <p className="text-muted text-sm mt-1 flex items-center gap-2 flex-wrap">
              Panel de administración
              <div className="relative" ref={eventSelectorRef}>
                <button
                  onClick={() => setShowEventSelector(!showEventSelector)}
                  className="font-mono text-xs px-3 py-1 rounded-full transition-all cursor-pointer hover:opacity-80"
                  style={{ background: 'var(--color-secondary)', color: 'var(--color-accent)' }}
                  title="Cambiar evento"
                >
                  {eventSlug} {events.length > 1 ? '▼' : ''}
                </button>
                {showEventSelector && events.length > 1 && (
                  <div
                    className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border z-50 min-w-64"
                    style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
                  >
                    <div className="p-2 max-h-96 overflow-y-auto">
                      {events.map((ev) => (
                        <a
                          key={ev.slug}
                          href={ev.slug === 'default' ? '/admin' : `/e/${ev.slug}/admin`}
                          className={`block px-4 py-2.5 rounded-lg mb-1 transition-colors text-sm ${
                            ev.slug === eventSlug ? 'font-medium' : ''
                          }`}
                          style={{
                            background: ev.slug === eventSlug ? 'var(--color-primary)' : 'transparent',
                            color: ev.slug === eventSlug ? 'white' : 'var(--color-text)',
                          }}
                          onClick={() => setShowEventSelector(false)}
                        >
                          <div className="font-medium">{ev.name}</div>
                          <div className="text-xs opacity-70 font-mono">/{ev.slug}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{names}</span>
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-8 p-1 rounded-xl overflow-x-auto" style={{ background: 'var(--color-secondary)' }}>
          {([
            { key: 'dashboard', label: 'Inicio',         icon: BarChart3  },
            { key: 'rsvps',     label: 'RSVPs',          icon: Users      },
            { key: 'invitados', label: 'Invitados',      icon: UserCheck  },
            { key: 'config',    label: 'Configuración',  icon: Settings   },
            { key: 'tema',      label: 'Tema',           icon: Palette    },
            { key: 'media',     label: 'Media',          icon: Upload     },
            { key: 'eventos',   label: 'Eventos',        icon: Calendar   },
            { key: 'secciones', label: 'Secciones',      icon: FileText   },
            { key: 'ayuda',     label: 'Ayuda',           icon: HelpCircle },
          ] as { key: Tab; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setActiveTab(key); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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

        {/* ── TAB: Dashboard ── */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Event Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h2 className="font-heading text-lg mb-4" style={{ color: 'var(--color-text)' }}>Evento actual</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted font-medium mb-1">Nombre</p>
                    <p className="font-medium text-lg">{names}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted font-medium mb-1">Identificador</p>
                    <p className="font-mono text-sm" style={{ color: 'var(--color-primary)' }}>{eventSlug}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted font-medium mb-1">Tipo de evento</p>
                    <p className="text-sm">{EVENT_TYPE_OPTIONS.find(t => t.value === eventCfg.event_type)?.label ?? 'Boda'}</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="card p-6">
                <h2 className="font-heading text-lg mb-4" style={{ color: 'var(--color-text)' }}>Resumen</h2>
                {stats && (
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Users,       label: 'Confirmaciones',  value: stats.total_responses },
                      { icon: CheckCircle, label: 'Asistentes',      value: stats.attending       },
                      { icon: XCircle,     label: 'No asisten',      value: stats.not_attending   },
                      { icon: BarChart3,   label: 'Invitados total', value: stats.total_guests    },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex flex-col items-center p-3 rounded-lg" style={{ background: 'var(--color-secondary)' }}>
                        <Icon className="w-5 h-5 mb-1" style={{ color: 'var(--color-primary)' }} />
                        <p className="text-2xl font-heading">{value}</p>
                        <p className="text-xs text-muted text-center mt-1">{label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h2 className="font-heading text-lg mb-4" style={{ color: 'var(--color-text)' }}>Accesos rápidos</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('config')}
                  className="btn-outline p-4 text-left flex items-start gap-3 hover:bg-secondary transition-colors"
                >
                  <Settings className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-medium">Editar configuración</p>
                    <p className="text-xs text-muted">Nombres, fecha, lugares</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('secciones')}
                  className="btn-outline p-4 text-left flex items-start gap-3 hover:bg-secondary transition-colors"
                >
                  <FileText className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-medium">Editar secciones</p>
                    <p className="text-xs text-muted">Historia, agenda, galería</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('media')}
                  className="btn-outline p-4 text-left flex items-start gap-3 hover:bg-secondary transition-colors"
                >
                  <Upload className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-medium">Subir multimedia</p>
                    <p className="text-xs text-muted">Fotos, videos y música</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('rsvps')}
                  className="btn-outline p-4 text-left flex items-start gap-3 hover:bg-secondary transition-colors"
                >
                  <Users className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-medium">Ver confirmaciones</p>
                    <p className="text-xs text-muted">Exportar lista de RSVPs</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Publishing Info */}
            <div className="card p-6 bg-gradient-to-r" style={{ background: 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary) 100%)' }}>
              <div className="flex items-start gap-4">
                <ExternalLink className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-primary)' }} />
                <div className="flex-1">
                  <h3 className="font-heading mb-2">Link público de invitación</h3>
                  <p className="text-sm text-muted mb-3">Comparte este link con tus invitados</p>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}${eventSlug === 'default' ? '/' : `/e/${eventSlug}`}`;
                      navigator.clipboard.writeText(url);
                      toast.success('Link copiado al portapapeles');
                    }}
                    className="btn-outline text-sm flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar link
                  </button>
                </div>
                <button
                  onClick={() => setShowQrFor(eventSlug === 'default' ? 'default' : eventSlug)}
                  className="btn-outline text-sm flex items-center gap-2 flex-shrink-0"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Ver QR
                </button>
              </div>
            </div>
          </div>
        )}

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
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditRsvp(r)}
                            className="p-1 rounded transition-colors hover:bg-secondary"
                            style={{ color: 'var(--color-text-muted)' }}
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRsvp(r.id)}
                            className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                            title="Eliminar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
            {isSuperadmin ? (
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
            ) : (
              <div className="card p-6 sm:p-8">
                <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Tipo de evento</h2>
                <div className="flex items-center gap-3">
                  {(() => {
                    const typeInfo = EVENT_TYPE_OPTIONS.find(t => t.value === watchedEventType);
                    return (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
                        style={{ background: 'var(--color-secondary)', borderColor: 'var(--color-border)', border: '1px solid' }}>
                        <span className="text-xl">{typeInfo?.emoji}</span>
                        <span className="font-body font-medium" style={{ color: 'var(--color-text)' }}>{typeInfo?.label}</span>
                      </div>
                    );
                  })()}
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Solo super admin puede cambiar</p>
                </div>
              </div>
            )}

            {/* People */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-1" style={{ color: 'var(--color-text)' }}>Personas del evento</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Estos datos aparecen en la portada, navegación y a lo largo de la invitación.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Person 1 */}
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest uppercase font-body font-semibold pb-2 border-b" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
                    {EVENT_LABELS[watchedEventType]?.person1 ?? 'Persona 1'}
                  </h3>
                  <div>
                    <label className="input-label">Nombre *</label>
                    <input {...register('person1_first')} className="input-field" placeholder="Nombre de pila" />
                  </div>
                  <div>
                    <label className="input-label">Apellido *</label>
                    <input {...register('person1_last')} className="input-field" placeholder="Apellido completo" />
                  </div>
                  <div>
                    <label className="input-label">Apodo (para títulos cortos)</label>
                    <input {...register('person1_nick')} className="input-field" placeholder="Ej: Conchi, Ale, Pato…" />
                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Se usa en secciones como el cortejo.</p>
                  </div>
                  {EVENT_LABELS[watchedEventType]?.parents1Label && (
                    <div>
                      <label className="input-label">{EVENT_LABELS[watchedEventType].parents1Label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                      <input {...register('person1_parents')} className="input-field" placeholder={EVENT_LABELS[watchedEventType].parents1Placeholder} />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Aparece en la portada. Deja vacío para ocultarlo. Si algún padre ha fallecido, puedes omitir su nombre o agregar <strong>†</strong> al final (ej: "Juan García †").
                      </p>
                    </div>
                  )}
                </div>

                {/* Person 2 */}
                {EVENT_LABELS[watchedEventType]?.person2 && (
                  <div className="space-y-4">
                    <h3 className="text-xs tracking-widest uppercase font-body font-semibold pb-2 border-b" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}>
                      {EVENT_LABELS[watchedEventType].person2}
                    </h3>
                    <div>
                      <label className="input-label">Nombre *</label>
                      <input {...register('person2_first')} className="input-field" placeholder="Nombre de pila" />
                    </div>
                    <div>
                      <label className="input-label">Apellido *</label>
                      <input {...register('person2_last')} className="input-field" placeholder="Apellido completo" />
                    </div>
                    <div>
                      <label className="input-label">Apodo (para títulos cortos)</label>
                      <input {...register('person2_nick')} className="input-field" placeholder="Ej: Eume, Santi, Caro…" />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Se usa en secciones como el cortejo.</p>
                    </div>
                    {EVENT_LABELS[watchedEventType]?.parents2Label && (
                      <div>
                        <label className="input-label">{EVENT_LABELS[watchedEventType].parents2Label} <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(opcional)</span></label>
                        <input {...register('person2_parents')} className="input-field" placeholder={EVENT_LABELS[watchedEventType].parents2Placeholder} />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                          Aparece en la portada junto a los datos de la otra persona. Deja vacío para ocultarlo.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display name + hashtag + CTA */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Nombre para mostrar en la portada *</label>
                  <input {...register('display_names')} className="input-field" placeholder={EVENT_LABELS[watchedEventType]?.displayNames ?? 'Nombre del evento'} />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Texto grande en el hero. Ej: "Concepción & Eumelio" o "Fiesta de Ana".</p>
                </div>
                <div>
                  <label className="input-label">Hashtag de redes sociales (opcional)</label>
                  <input {...register('hashtag')} className="input-field" placeholder="#NombreEvento2026" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Aparece en el pie de página y en la pantalla de confirmación del RSVP.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Texto del botón de portada (opcional)</label>
                  <input {...register('hero_cta_label')} className="input-field" placeholder="Ej: Confirmar asistencia, Ver detalles, RSVP…" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Botón que aparece en la portada y lleva al formulario RSVP. Si lo dejas vacío, usa el título del RSVP o "Confirmar asistencia".</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Fecha y hora</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="input-label">{EVENT_LABELS[watchedEventType]?.dateLabel ?? 'Fecha y hora'}</label>
                  <Controller
                    name="ceremony_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker mode="datetime" value={field.value ?? ''} onChange={field.onChange} />
                    )}
                  />
                </div>
                <div>
                  <label className="input-label">Fecha para mostrar</label>
                  <Controller
                    name="display_date"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        mode="date"
                        outputFormat="EEEE, d 'de' MMMM 'de' yyyy"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        placeholder="Ej: Sábado, 5 de Diciembre de 2026"
                      />
                    )}
                  />
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
                  <div className="grid grid-cols-2 gap-3">
                    <input {...register('ceremony_venue_time')} className="input-field" placeholder="Hora (ej: 17:00)" />
                    <input {...register('ceremony_venue_dresscode')} className="input-field" placeholder="Código de vestimenta" />
                  </div>
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
                      <div className="grid grid-cols-2 gap-3">
                        <input {...register('ceremony_venue_time')} className="input-field" placeholder="Hora (ej: 16:00)" />
                        <input {...register('ceremony_venue_dresscode')} className="input-field" placeholder="Código de vestimenta" />
                      </div>
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
                      <div className="grid grid-cols-2 gap-3">
                        <input {...register('reception_venue_time')} className="input-field" placeholder="Hora (ej: 20:00)" />
                        <input {...register('reception_venue_dresscode')} className="input-field" placeholder="Código de vestimenta" />
                      </div>
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
                    <Controller
                      name="rsvp_deadline"
                      control={control}
                      render={({ field }) => (
                        <DatePicker mode="date" value={field.value ?? ''} onChange={field.onChange} />
                      )}
                    />
                  </div>
                  <div>
                    <label className="input-label">Máximo de invitados por respuesta</label>
                    <input {...register('max_guests', { valueAsNumber: true })} type="number" min={1} max={20} className="input-field" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="input-label">Email para notificaciones de RSVP (opcional)</label>
                  <input {...register('notification_email')} type="email" className="input-field" placeholder="tu@email.com" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Recibirás un aviso cada vez que alguien confirme. Requiere configurar SMTP en el servidor.
                  </p>
                </div>
              </div>
            </div>

            {/* Invitation Mode */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-1" style={{ color: 'var(--color-text)' }}>Modo de Invitación</h2>
              <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
                Controla cómo los invitados pueden acceder y confirmar asistencia a tu evento.
              </p>
              <div className="space-y-5">
                <div>
                  <label className="input-label">Tipo de acceso</label>
                  <Controller
                    name="invitation_mode"
                    control={control}
                    defaultValue="generic"
                    render={({ field }) => (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-1">
                        {([
                          { value: 'generic', label: 'Genérica', desc: 'Cualquier persona con el link puede ver y confirmar asistencia.' },
                          { value: 'personalized', label: 'Personalizada', desc: 'Solo invitados con link único pueden confirmar. Se requiere módulo Invitados.' },
                          { value: 'hybrid', label: 'Híbrida', desc: 'Permite tanto acceso público como links personalizados. Mayor control.' },
                        ] as { value: string; label: string; desc: string }[]).map(opt => (
                          <button
                            key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                            className="p-4 rounded-xl border-2 text-left transition-all"
                            style={{ borderColor: field.value === opt.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value === opt.value ? 'var(--color-secondary)' : 'var(--color-surface)' }}
                          >
                            <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{opt.label}</p>
                            <p className="text-xs mt-1 font-body leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { name: 'allow_public_rsvp', label: 'Permitir RSVP público', desc: 'Cualquier visitante puede confirmar sin link personalizado.' },
                    { name: 'track_invitation_opens', label: 'Registrar aperturas', desc: 'Guarda cuándo y cuántas veces se abrió cada invitación personalizada.' },
                    { name: 'allow_guest_self_edit', label: 'Invitado puede editar su RSVP', desc: 'El invitado puede cambiar su confirmación antes del cierre.' },
                    { name: 'allow_guest_member_names', label: 'Registrar nombres de acompañantes', desc: 'El invitado puede ingresar el nombre de cada persona en su grupo.' },
                    { name: 'allow_guest_count_change', label: 'Invitado puede cambiar cantidad', desc: 'Puede elegir cuántos de sus pases usará (hasta el máximo asignado).' },
                    { name: 'rsvp_enforce_pass_limit', label: 'Forzar límite de pases', desc: 'El sistema rechaza confirmaciones que superen los pases asignados.' },
                    { name: 'show_reserved_passes_message', label: 'Mostrar mensaje de pases reservados', desc: 'El invitado verá "Hemos reservado N lugar(es) para ti."' },
                  ] as { name: string; label: string; desc: string }[]).map(({ name, label, desc }) => (
                    <Controller
                      key={name}
                      name={name as keyof ConfigFormData}
                      control={control}
                      render={({ field }) => (
                        <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border transition-colors" style={{ borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value ? 'var(--color-secondary)' : 'transparent' }}>
                          <div className="flex-shrink-0 mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors" style={{ borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value ? 'var(--color-primary)' : 'transparent' }}
                            onClick={() => (field.onChange as (v: boolean) => void)(!field.value as boolean)}>
                            {field.value && <svg viewBox="0 0 10 10" className="w-3 h-3"><path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div>
                            <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{label}</p>
                            <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                          </div>
                        </label>
                      )}
                    />
                  ))}
                </div>
                <div>
                  <label className="input-label">Plantilla de mensaje WhatsApp</label>
                  <textarea
                    {...register('whatsapp_template')}
                    rows={4}
                    className="input-field resize-none font-mono text-xs"
                    placeholder={"¡Hola {display_name}! 🎉\n\nTe invitamos a {event_name}.\n📅 {event_date} · {allowed_passes} lugar(es) reservados.\n\n👉 Tu invitación: {invitation_url}\n\n¡Te esperamos!"}
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Variables disponibles: {'{display_name}'}, {'{event_name}'}, {'{event_date}'}, {'{allowed_passes}'}, {'{invitation_url}'}, {'{short_url}'}, {'{full_invitation_url}'}, {'{rsvp_deadline}'}
                  </p>
                </div>
              </div>
            </div>

            {/* Personalized Full View */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-1">
                <div>
                  <h2 className="font-sub text-lg font-medium leading-tight" style={{ color: 'var(--color-text)' }}>Invitación Personalizada — Vista Completa</h2>
                  <p className="text-xs mt-1 mb-5" style={{ color: 'var(--color-text-muted)' }}>
                    Cuando un invitado abre su link <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--color-secondary)' }}>/i/:token</code>, en lugar de mostrar solo sus datos, verá la invitación completa con su información integrada de forma elegante.
                  </p>
                </div>
              </div>

              {/* Main toggle */}
              <div className="flex items-start justify-between gap-4 p-4 rounded-xl mb-4" style={{ background: 'var(--color-secondary)' }}>
                <div>
                  <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>Activar vista completa para invitados personalizados</p>
                  <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--color-text-muted)' }}>El invitado verá la invitación principal completa (Hero, historia, programa, RSVP, etc.) con su nombre y datos integrados.</p>
                </div>
                <Controller name="personalized_full_view" control={control} render={({ field }) => (
                  <button type="button" onClick={() => field.onChange(!field.value)}
                    className="flex-shrink-0 w-11 h-6 rounded-full transition-colors relative"
                    style={{ background: field.value ? 'var(--color-primary)' : 'var(--color-border)' }}>
                    <span className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200"
                      style={{ left: field.value ? '22px' : '2px' }} />
                  </button>
                )} />
              </div>

              {/* Section: Hero badge */}
              <p className="text-xs font-medium uppercase tracking-widest mb-3 mt-5 font-body" style={{ color: 'var(--color-text-muted)' }}>
                Insignia en la portada (Hero)
              </p>
              <div className="space-y-3 mb-5">
                {([
                  { name: 'personalized_hero_badge_enabled', label: 'Mostrar insignia con el nombre del invitado en el Hero', desc: 'Aparece una pastilla elegante sobre la imagen de portada con el nombre del invitado.' },
                ] as { name: string; label: string; desc: string }[]).map(({ name, label, desc }) => (
                  <Controller key={name} name={name as keyof ConfigFormData} control={control} render={({ field }) => (
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input type="checkbox" className="sr-only" checked={!!field.value} onChange={() => field.onChange(!field.value)} />
                        <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                          style={{ borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value ? 'var(--color-primary)' : 'transparent' }}>
                          {field.value && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>}
                        </div>
                      </div>
                      <div><p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{label}</p>
                        <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--color-text-muted)' }}>{desc}</p></div>
                    </label>
                  )} />
                ))}
                <div>
                  <label className="input-label">Texto de la insignia en el Hero</label>
                  <input {...register('personalized_hero_badge_label')} className="input-field"
                    placeholder="Invitación especial para" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Se mostrará: "[Tu texto] · [Nombre del invitado]" — ej: <em>"Invitación especial para · Familia García"</em>
                  </p>
                </div>
              </div>

              {/* Section: Personalized greeting */}
              <p className="text-xs font-medium uppercase tracking-widest mb-3 mt-5 font-body" style={{ color: 'var(--color-text-muted)' }}>
                Sección de bienvenida personalizada
              </p>
              <div className="space-y-3 mb-4">
                {([
                  { name: 'personalized_greeting_enabled', label: 'Mostrar sección de bienvenida personalizada', desc: 'Inserta una sección exclusiva con el nombre, tipo de invitado, cupos y texto de bienvenida.' },
                  { name: 'personalized_show_passes', label: 'Mostrar cantidad de pases reservados', desc: 'El invitado verá cuántos lugares tiene reservados para este evento.' },
                  { name: 'personalized_show_type_badge', label: 'Mostrar tipo de invitado (VIP, Familia, etc.)', desc: 'Muestra una etiqueta de categoría junto al nombre del invitado.' },
                ] as { name: string; label: string; desc: string }[]).map(({ name, label, desc }) => (
                  <Controller key={name} name={name as keyof ConfigFormData} control={control} render={({ field }) => (
                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-[var(--color-secondary)] transition-colors">
                      <div className="relative mt-0.5 flex-shrink-0">
                        <input type="checkbox" className="sr-only" checked={!!field.value} onChange={() => field.onChange(!field.value)} />
                        <div className="w-5 h-5 rounded border-2 flex items-center justify-center transition-colors"
                          style={{ borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value ? 'var(--color-primary)' : 'transparent' }}>
                          {field.value && <svg viewBox="0 0 12 12" className="w-3 h-3"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>}
                        </div>
                      </div>
                      <div><p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{label}</p>
                        <p className="text-xs mt-0.5 font-body" style={{ color: 'var(--color-text-muted)' }}>{desc}</p></div>
                    </label>
                  )} />
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="input-label">Posición de la sección de bienvenida</label>
                  <Controller name="personalized_greeting_position" control={control} render={({ field }) => (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                      {([
                        { value: 'top',            label: 'Al inicio',          desc: 'Antes del Hero' },
                        { value: 'after_hero',     label: 'Tras el Hero',       desc: 'Después de portada' },
                        { value: 'after_countdown',label: 'Tras cuenta regresiva', desc: '' },
                        { value: 'after_story',    label: 'Tras historia',      desc: '' },
                      ] as { value: string; label: string; desc: string }[]).map((opt) => (
                        <button key={opt.value} type="button" onClick={() => field.onChange(opt.value)}
                          className="p-2.5 rounded-xl border-2 text-left transition-all"
                          style={{ borderColor: field.value === opt.value ? 'var(--color-primary)' : 'var(--color-border)', background: field.value === opt.value ? 'var(--color-secondary)' : 'var(--color-surface)' }}>
                          <p className="text-xs font-medium font-body" style={{ color: 'var(--color-text)' }}>{opt.label}</p>
                          {opt.desc && <p className="text-xs font-body mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>}
                        </button>
                      ))}
                    </div>
                  )} />
                </div>

                <div>
                  <label className="input-label">Título de la sección de bienvenida</label>
                  <input {...register('personalized_greeting_title')} className="input-field"
                    placeholder="Tu invitación personal" />
                </div>

                <div>
                  <label className="input-label">Texto de bienvenida</label>
                  <textarea {...register('personalized_greeting_body')} rows={3}
                    className="input-field resize-none"
                    placeholder="Con mucho cariño te invitamos a compartir este día especial con nosotros. Nos emociona tenerte presente." />
                </div>

                <div>
                  <label className="input-label">Mensaje de pases reservados</label>
                  <input {...register('personalized_passes_label')} className="input-field"
                    placeholder="Hemos reservado {passes} lugar(es) para ti en este evento." />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Usa <code className="font-mono px-1 py-0.5 rounded" style={{ background: 'var(--color-secondary)' }}>{'{passes}'}</code> para insertar el número de pases reservados.
                  </p>
                </div>
              </div>
            </div>

            {/* Gift Registry */}
            <div className="card p-6 sm:p-8">
              {/* Header row with enable/disable toggle */}
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-sub text-lg font-medium leading-tight" style={{ color: 'var(--color-text)' }}>Mesa de Regalos</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Sección que aparece en la invitación con el enlace a tu lista de regalos.
                  </p>
                </div>
                <Controller
                  name="gift_registry_enabled"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-200 border"
                      style={{
                        background: field.value ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: field.value ? 'white' : 'var(--color-text-muted)',
                        borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                      title={field.value ? 'Visible para los invitados — clic para ocultar' : 'Oculta para los invitados — clic para activar'}
                    >
                      <span
                        className="w-2 h-2 rounded-full transition-colors"
                        style={{ background: field.value ? 'white' : 'var(--color-text-muted)', opacity: field.value ? 1 : 0.5 }}
                      />
                      {field.value ? 'Visible' : 'Oculta'}
                    </button>
                  )}
                />
              </div>

              {/* Status banner */}
              <Controller
                name="gift_registry_enabled"
                control={control}
                render={({ field }) => (
                  <div
                    className="flex items-center gap-3 rounded-xl px-4 py-3 mb-5 text-xs font-body"
                    style={{
                      background: field.value ? 'rgba(var(--color-primary-rgb, 62,123,87), 0.07)' : 'var(--color-secondary)',
                      border: `1px solid ${field.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      opacity: 1,
                    }}
                  >
                    <span className="text-base">{field.value ? '🎁' : '🙈'}</span>
                    <div>
                      <p className="font-medium" style={{ color: field.value ? 'var(--color-primary)' : 'var(--color-text)' }}>
                        {field.value ? 'Sección activa — visible en la invitación' : 'Sección oculta — los invitados no la verán'}
                      </p>
                      <p style={{ color: 'var(--color-text-muted)', marginTop: 2 }}>
                        {field.value
                          ? 'Completa la URL para que el botón funcione. Puedes ocultar la sección sin perder los datos.'
                          : 'Puedes desactivar la sección sin borrar los datos. Reactívala en cualquier momento.'}
                      </p>
                    </div>
                  </div>
                )}
              />

              {/* Fields — dimmed when disabled */}
              <Controller
                name="gift_registry_enabled"
                control={control}
                render={({ field: enabledField }) => (
                  <div
                    className="space-y-4 transition-opacity duration-200"
                    style={{ opacity: enabledField.value ? 1 : 0.45, pointerEvents: enabledField.value ? 'auto' : 'none' }}
                  >
                    <div>
                      <label className="input-label">
                        URL de la mesa de regalos
                        {enabledField.value && <span className="text-red-400 ml-0.5">*</span>}
                      </label>
                      <input
                        {...register('gift_registry_url')}
                        type="url"
                        className="input-field"
                        placeholder="https://mesaderegalos.liverpool.com.mx/..."
                        disabled={!enabledField.value}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        Pega aquí el enlace de tu tienda, lista de deseos o página de regalo.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Título de la sección</label>
                        <input
                          {...register('gift_registry_title')}
                          className="input-field"
                          placeholder="Mesa de Regalos"
                          disabled={!enabledField.value}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Aparece como encabezado de la sección.</p>
                      </div>
                      <div>
                        <label className="input-label">Texto del botón</label>
                        <input
                          {...register('gift_registry_label')}
                          className="input-field"
                          placeholder="Ver lista de regalos"
                          disabled={!enabledField.value}
                        />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Texto que verán los invitados en el botón.</p>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Descripción</label>
                      <textarea
                        {...register('gift_registry_description')}
                        rows={2}
                        className="input-field resize-none"
                        placeholder="Hemos preparado una selección especial para ayudarte a elegirnos el obsequio perfecto..."
                        disabled={!enabledField.value}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Texto de apoyo que acompaña el botón (opcional).</p>
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Bank Gift Section */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="font-sub text-lg font-medium leading-tight" style={{ color: 'var(--color-text)' }}>Datos Bancarios (Obsequio)</h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Sección oscura con datos bancarios para transferencias directas. Se muestra debajo de la mesa de regalos.
                  </p>
                </div>
                <Controller
                  name="gift_bank_enabled"
                  control={control}
                  render={({ field }) => (
                    <button
                      type="button"
                      onClick={() => field.onChange(!field.value)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-body font-medium transition-all duration-200 border"
                      style={{
                        background: field.value ? 'var(--color-primary)' : 'var(--color-surface)',
                        color: field.value ? 'white' : 'var(--color-text-muted)',
                        borderColor: field.value ? 'var(--color-primary)' : 'var(--color-border)',
                      }}
                    >
                      <span className="w-2 h-2 rounded-full transition-colors" style={{ background: field.value ? 'white' : 'var(--color-text-muted)', opacity: field.value ? 1 : 0.5 }} />
                      {field.value ? 'Visible' : 'Oculta'}
                    </button>
                  )}
                />
              </div>

              <Controller
                name="gift_bank_enabled"
                control={control}
                render={({ field: enabledField }) => (
                  <div className="space-y-5 transition-opacity duration-200" style={{ opacity: enabledField.value ? 1 : 0.45, pointerEvents: enabledField.value ? 'auto' : 'none' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="input-label">Título de la sección</label>
                        <input {...register('gift_bank_title')} className="input-field" placeholder="Obsequio" disabled={!enabledField.value} />
                        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Aparece en letras pequeñas sobre el ícono.</p>
                      </div>
                    </div>
                    <div>
                      <label className="input-label">Mensaje de bienvenida</label>
                      <textarea {...register('gift_bank_body')} rows={2} className="input-field resize-none" placeholder="Tu presencia es nuestro mejor regalo…" disabled={!enabledField.value} />
                    </div>

                    {/* Bank accounts CRUD */}
                    <div>
                      <label className="input-label mb-3">Cuentas / datos bancarios</label>
                      <div className="space-y-2 mb-3">
                        {giftBankAccounts.map((acc, i) => (
                          <div key={i} className="flex items-center gap-2 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)', background: 'var(--color-secondary)' }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium font-body" style={{ color: 'var(--color-text-muted)' }}>{acc.label}</p>
                              <p className="text-sm font-medium font-sub truncate" style={{ color: 'var(--color-text)' }}>{acc.value}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setGiftBankAccounts((prev) => prev.filter((_, j) => j !== i))}
                              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                              style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        {giftBankAccounts.length === 0 && (
                          <p className="text-xs text-center py-3 font-body" style={{ color: 'var(--color-text-muted)' }}>
                            Sin cuentas aún — agrega una abajo
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={newBankLabel}
                          onChange={(e) => setNewBankLabel(e.target.value)}
                          className="input-field flex-[0_0_35%]"
                          placeholder="Ej: Alias, CBU, CI"
                          disabled={!enabledField.value}
                        />
                        <input
                          value={newBankValue}
                          onChange={(e) => setNewBankValue(e.target.value)}
                          className="input-field flex-1"
                          placeholder="Valor"
                          disabled={!enabledField.value}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newBankLabel.trim() && newBankValue.trim()) {
                              e.preventDefault();
                              setGiftBankAccounts((prev) => [...prev, { label: newBankLabel.trim(), value: newBankValue.trim() }]);
                              setNewBankLabel('');
                              setNewBankValue('');
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newBankLabel.trim() || !newBankValue.trim()) return;
                            setGiftBankAccounts((prev) => [...prev, { label: newBankLabel.trim(), value: newBankValue.trim() }]);
                            setNewBankLabel('');
                            setNewBankValue('');
                          }}
                          disabled={!newBankLabel.trim() || !newBankValue.trim() || !enabledField.value}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all disabled:opacity-40"
                          style={{ background: 'var(--color-primary)', color: 'white' }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Agregar
                        </button>
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                        Cada fila se muestra con un botón de copiar al portapapeles. Presiona Enter o clic en Agregar.
                      </p>
                    </div>
                  </div>
                )}
              />
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
                      <input type="radio" value={key} {...register('palette', { onChange: (e) => { setSelectedPalette(e.target.value as PaletteKey); applyTheme(e.target.value as PaletteKey); } })} className="sr-only" />
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
              {(() => {
                const categories = Array.from(new Set(PALETTE_OPTIONS.map(p => p.category)));
                const recommendedPalettes = getRecommendedPalettes(watchedEventType as EventType);
                return (
                  <div className="space-y-8">
                    {categories.map(category => (
                      <div key={category}>
                        <h3 className="font-sub text-xs uppercase tracking-wider font-semibold mb-4" style={{ color: 'var(--color-text-muted)' }}>
                          {category}
                          {category === 'Enterprise' && (
                            <span className="ml-2 text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: 'var(--color-accent)', color: 'var(--color-text)' }}>Profesional</span>
                          )}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {PALETTE_OPTIONS.filter(p => p.category === category).map(({ key, label, colors }) => {
                            const isRecommended = recommendedPalettes.includes(key);
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => { setSelectedPalette(key); applyTheme(key); setValue('palette', key); }}
                                className="flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200 relative"
                                style={{
                                  borderColor: selectedPalette === key ? 'var(--color-primary)' : 'var(--color-border)',
                                  background: selectedPalette === key ? 'var(--color-secondary)' : 'var(--color-surface)',
                                  boxShadow: selectedPalette === key ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                                }}
                              >
                                {isRecommended && (
                                  <div className="absolute top-3 right-3 flex items-center gap-1" style={{ color: 'var(--color-accent)' }}>
                                    <span className="text-lg">★</span>
                                  </div>
                                )}
                                <div className="flex gap-2">{colors.map((c) => (<div key={c} className="w-8 h-8 rounded-full border border-black/10 shadow-sm" style={{ background: c }} />))}</div>
                                <div className="flex items-center justify-between pr-6">
                                  <span className="font-sub text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                                  {selectedPalette === key && (
                                    <span className="text-xs font-body px-2 py-0.5 rounded-full" style={{ background: 'var(--color-primary)', color: 'white' }}>Activo</span>
                                  )}
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
                                  {colors.map((c, i) => (<div key={i} className="flex-1" style={{ background: c }} />))}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
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
                          onClick={() => galleryPhotos.some((p) => p.url === file.url) ? removePhotoFromGallery(file.url) : addPhotoToGallery(file.url, file.original_filename)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs transition-colors"
                          style={{ background: galleryPhotos.some((p) => p.url === file.url) ? 'rgba(62,123,87,0.9)' : 'rgba(255,255,255,0.2)' }}
                          title={galleryPhotos.some((p) => p.url === file.url) ? 'Quitar de galería' : 'Añadir a galería'}
                        >
                          <ImageIcon className="w-3 h-3" /> {galleryPhotos.some((p) => p.url === file.url) ? '✓ Galería' : 'Galería'}
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
                        onClick={() => musicTracks.some((t) => t.url === file.url) ? removeTrackFromPlayer(file.url) : addTrackToPlayer(file.url, file.original_filename)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: musicTracks.some((t) => t.url === file.url) ? 'var(--color-primary)' : 'var(--color-text-muted)', background: musicTracks.some((t) => t.url === file.url) ? 'var(--color-secondary)' : 'transparent' }}
                        title={musicTracks.some((t) => t.url === file.url) ? 'Quitar del reproductor' : 'Añadir al reproductor'}
                      >
                        <Music2 className="w-4 h-4" />
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
            {isSuperadmin ? (
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
                        setEventFormErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className="input-field"
                      style={{ borderColor: eventFormErrors.name ? 'var(--color-primary)' : undefined }}
                      placeholder="Ej: Boda de Ana y Carlos"
                      required
                    />
                    {eventFormErrors.name && (
                      <p className="text-xs mt-1 text-red-500">{eventFormErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="input-label">Slug único (URL)</label>
                    <input
                      value={newEventSlug}
                      onChange={(e) => {
                        setNewEventSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
                        setEventFormErrors((prev) => ({ ...prev, slug: undefined }));
                      }}
                      className="input-field font-mono"
                      style={{ borderColor: eventFormErrors.slug ? 'var(--color-primary)' : undefined }}
                      placeholder="ana-carlos-2026"
                      pattern="[a-z0-9][a-z0-9-]*[a-z0-9]"
                      required
                    />
                    {eventFormErrors.slug && (
                      <p className="text-xs mt-1 text-red-500">{eventFormErrors.slug}</p>
                    )}
                    {newEventSlug && !eventFormErrors.slug && (
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                        URL: <span className="font-mono">/e/{newEventSlug}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="input-label">Token de admin (opcional — deja vacío para usar el token global)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newEventToken}
                      onChange={(e) => setNewEventToken(e.target.value)}
                      className="input-field flex-1 font-mono text-sm"
                      placeholder="Token personalizado para este evento"
                    />
                    <button
                      type="button"
                      onClick={() => setNewEventToken(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))}
                      className="btn-outline flex items-center gap-1.5 whitespace-nowrap"
                      title="Generar token aleatorio"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Generar
                    </button>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={creatingEvent || !newEventName || !newEventSlug} className="btn-primary">
                    {creatingEvent ? 'Creando…' : 'Crear evento'}
                  </button>
                </div>
              </form>
            </div>
            ) : (
            <div className="card p-6 sm:p-8 bg-yellow-50 border border-yellow-200" style={{ background: 'color-mix(in srgb, var(--color-primary) 5%, transparent)', borderColor: 'var(--color-primary)' }}>
              <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                <Lock className="w-4 h-4 inline mr-2" style={{ color: 'var(--color-primary)' }} />
                Solo administradores globales pueden crear eventos. Contacta al administrador si necesitas crear un nuevo evento.
              </p>
            </div>
            )}

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
                          <button
                            type="button"
                            onClick={() => setShowQrFor(ev.slug)}
                            className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1"
                            title="Ver código QR"
                          >
                            <QrCode className="w-3 h-3" /> QR
                          </button>
                          <button
                            type="button"
                            onClick={() => handleGenerateToken(ev.slug)}
                            disabled={generatingToken === ev.slug}
                            className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1"
                            title="Generar token de acceso para admin del evento"
                          >
                            {generatingToken === ev.slug
                              ? <RefreshCw className="w-3 h-3 animate-spin" />
                              : <Key className="w-3 h-3" />}
                            Token
                          </button>
                          <button
                            type="button"
                            onClick={() => { setDuplicatingSlug(ev.slug); setDupName(`${ev.name} (copia)`); setDupSlug(''); setDupToken(''); }}
                            className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1"
                            title="Duplicar evento"
                          >
                            <Copy className="w-3 h-3" /> Clonar
                          </button>
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

        {/* ── TAB: Invitados ── */}
        {activeTab === 'invitados' && (
          <div className="space-y-6">
            {/* Stats dashboard */}
            {guestStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total invitaciones', value: guestStats.total_invitations, color: 'var(--color-primary)' },
                  { label: 'Cupos confirmados', value: `${guestStats.confirmed_passes}/${guestStats.total_passes}`, color: '#22c55e' },
                  { label: 'Aperturas', value: `${guestStats.opened}/${guestStats.total_invitations}`, color: '#3b82f6' },
                  { label: 'Tasa confirmación', value: `${Math.round(guestStats.confirmation_rate * 100)}%`, color: '#f59e0b' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card p-4 text-center">
                    <p className="text-2xl font-bold font-heading" style={{ color }}>{value}</p>
                    <p className="text-xs mt-1 font-body" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Status breakdown bar */}
            {guestStats && guestStats.total_invitations > 0 && (
              <div className="card p-5">
                <h3 className="font-sub text-sm font-medium mb-3" style={{ color: 'var(--color-text)' }}>Estado de invitaciones</h3>
                <div className="flex rounded-full overflow-hidden h-3 gap-px">
                  {Object.entries(guestStats.status_counts).filter(([, v]) => (v as number) > 0).map(([status, count]) => {
                    const colors: Record<string, string> = { confirmed: '#22c55e', declined: '#ef4444', pending: '#94a3b8', opened: '#3b82f6', sent: '#8b5cf6', partial: '#f59e0b', blocked: '#6b7280', draft: '#d1d5db', expired: '#9ca3af' };
                    const pct = ((count as number) / guestStats.total_invitations) * 100;
                    return <div key={status} style={{ width: `${pct}%`, background: colors[status] ?? '#94a3b8' }} title={`${status}: ${count}`} />;
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {Object.entries(guestStats.status_counts).filter(([, v]) => (v as number) > 0).map(([status, count]) => {
                    const colors: Record<string, string> = { confirmed: '#22c55e', declined: '#ef4444', pending: '#94a3b8', opened: '#3b82f6', sent: '#8b5cf6', partial: '#f59e0b', blocked: '#6b7280', draft: '#d1d5db', expired: '#9ca3af' };
                    const labels: Record<string, string> = { confirmed: 'Confirmados', declined: 'Rechazados', pending: 'Pendientes', opened: 'Abiertos', sent: 'Enviados', partial: 'Parciales', blocked: 'Bloqueados', draft: 'Borrador', expired: 'Vencidos' };
                    return (
                      <span key={status} className="flex items-center gap-1.5 text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: colors[status] ?? '#94a3b8' }} />
                        {labels[status] ?? status}: <strong style={{ color: 'var(--color-text)' }}>{String(count)}</strong>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex gap-2 flex-1 w-full sm:w-auto">
                <div className="relative flex-1">
                  <input
                    value={guestSearch}
                    onChange={(e) => { setGuestSearch(e.target.value); }}
                    onKeyDown={(e) => e.key === 'Enter' && loadGuests(1, guestSearch, guestStatusFilter)}
                    placeholder="Buscar por nombre, email, teléfono..."
                    className="input-field pl-8 w-full"
                  />
                  <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
                </div>
                <select
                  value={guestStatusFilter}
                  onChange={(e) => { setGuestStatusFilter(e.target.value); loadGuests(1, guestSearch, e.target.value); }}
                  className="input-field w-auto"
                >
                  <option value="">Todos los estados</option>
                  {(['draft','pending','sent','opened','confirmed','declined','partial','blocked','expired'] as InvitationStatus[]).map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>
                  ))}
                </select>
                <button onClick={() => loadGuests(1, guestSearch, guestStatusFilter)} className="btn-outline px-3 py-2 text-sm">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDownloadTemplate} className="btn-outline text-xs gap-1.5 px-3 py-2">
                  <Download className="w-3.5 h-3.5" /> Plantilla
                </button>
                <button onClick={() => setShowCSVImport(true)} className="btn-outline text-xs gap-1.5 px-3 py-2">
                  <Upload className="w-3.5 h-3.5" /> Importar CSV
                </button>
                <button onClick={handleExportCSV} className="btn-outline text-xs gap-1.5 px-3 py-2">
                  <Download className="w-3.5 h-3.5" /> Exportar
                </button>
                <button onClick={() => { setEditingGuest(null); setShowCreateGuest(true); }} className="btn-primary text-xs gap-1.5 px-4 py-2">
                  <UserPlus className="w-3.5 h-3.5" /> Agregar invitado
                </button>
              </div>
            </div>

            {/* Guest table */}
            <div className="card overflow-hidden">
              {guestLoading ? (
                <div className="flex items-center justify-center py-16 gap-3" style={{ color: 'var(--color-text-muted)' }}>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span className="font-body text-sm">Cargando invitados...</span>
                </div>
              ) : guests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
                  <Users className="w-12 h-12 opacity-20" style={{ color: 'var(--color-primary)' }} />
                  <div>
                    <p className="font-sub text-base font-medium" style={{ color: 'var(--color-text)' }}>
                      {guestSearch || guestStatusFilter ? 'Sin resultados para este filtro' : 'Sin invitados aún'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                      {guestSearch || guestStatusFilter ? 'Prueba con otros términos de búsqueda.' : 'Comienza agregando invitados manualmente o importando un CSV.'}
                    </p>
                  </div>
                  {!guestSearch && !guestStatusFilter && (
                    <button onClick={() => setShowCreateGuest(true)} className="btn-primary text-sm gap-2">
                      <UserPlus className="w-4 h-4" /> Agregar primer invitado
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm font-body">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-secondary)' }}>
                        {['Invitado', 'Contacto', 'Pases', 'Estado', 'Aperturas', 'Último RSVP', 'Acciones'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium tracking-wide uppercase" style={{ color: 'var(--color-text-muted)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {guests.map((g) => {
                        const statusColors: Record<string, string> = { confirmed: '#22c55e', declined: '#ef4444', pending: '#f59e0b', opened: '#3b82f6', sent: '#8b5cf6', partial: '#f97316', blocked: '#6b7280', draft: '#94a3b8', expired: '#9ca3af' };
                        const statusLabels: Record<string, string> = { confirmed: 'Confirmado', declined: 'Rechazado', pending: 'Pendiente', opened: 'Abierto', sent: 'Enviado', partial: 'Parcial', blocked: 'Bloqueado', draft: 'Borrador', expired: 'Vencido' };
                        return (
                          <tr key={g.id} style={{ borderBottom: '1px solid var(--color-border)' }} className="hover:bg-[var(--color-secondary)] transition-colors">
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium" style={{ color: 'var(--color-text)' }}>{g.display_name}</p>
                                {g.group_name && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{g.group_name}</p>}
                                {g.tags?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {g.tags.map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)', border: '1px solid var(--color-border)' }}>{tag}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p style={{ color: 'var(--color-text-muted)' }}>{g.contact_name ?? g.display_name}</p>
                              {g.email && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{g.email}</p>}
                              {g.phone && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{g.phone}</p>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="font-medium" style={{ color: 'var(--color-text)' }}>{g.confirmed_passes}/{g.allowed_passes}</span>
                              {g.declined_passes > 0 && <p className="text-xs" style={{ color: '#ef4444' }}>-{g.declined_passes} rechazado</p>}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: `${statusColors[g.status] ?? '#94a3b8'}18`, color: statusColors[g.status] ?? '#94a3b8' }}>
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: statusColors[g.status] ?? '#94a3b8' }} />
                                {statusLabels[g.status] ?? g.status}
                              </span>
                              {!g.is_active && <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>Archivado</p>}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span style={{ color: g.open_count > 0 ? '#3b82f6' : 'var(--color-text-muted)' }}>{g.open_count}x</span>
                              {g.last_opened_at && <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(g.last_opened_at).toLocaleDateString()}</p>}
                            </td>
                            <td className="px-4 py-3">
                              {g.last_rsvp_at ? (
                                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{new Date(g.last_rsvp_at).toLocaleDateString()}</span>
                              ) : <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>Sin RSVP</span>}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                <button title="Copiar link corto" onClick={() => handleCopyLink(g)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                                  <Link2 className="w-3.5 h-3.5" />
                                </button>
                                <button title="Ver QR" onClick={() => handleShowQR(g)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                                  <QrCode className="w-3.5 h-3.5" />
                                </button>
                                <button title="WhatsApp" onClick={() => handleShowWhatsApp(g)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: '#22c55e' }}>
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                                <button title="Editar" onClick={() => { setEditingGuest(g); setShowCreateGuest(true); }} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button title="Historial" onClick={() => handleShowAudit(g)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: 'var(--color-text-muted)' }}>
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button title="Regenerar link" onClick={() => handleRegenerateToken(g)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: '#f59e0b' }}>
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                                <a title="Abrir invitación" href={buildInvUrl(g.token_lookup)} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors inline-flex items-center" style={{ color: 'var(--color-primary)' }}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                                <button title="Archivar" onClick={() => handleGuestDelete(g.id)} className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition-colors" style={{ color: '#ef4444' }}>
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Pagination */}
              {guestPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <span className="text-xs font-body" style={{ color: 'var(--color-text-muted)' }}>
                    {guestTotal} invitados · Página {guestPage} de {guestPages}
                  </span>
                  <div className="flex gap-1">
                    <button disabled={guestPage <= 1} onClick={() => { const p = guestPage - 1; loadGuests(p); }} className="btn-outline px-2 py-1 text-xs disabled:opacity-40">
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button disabled={guestPage >= guestPages} onClick={() => { const p = guestPage + 1; loadGuests(p); }} className="btn-outline px-2 py-1 text-xs disabled:opacity-40">
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Create/Edit guest modal */}
            {showCreateGuest && (
              <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="flex min-h-full items-start justify-center px-4 pt-8 pb-10">
                  <div className="card w-full max-w-lg relative flex flex-col" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
                    {/* sticky header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                        {editingGuest ? 'Editar invitado' : 'Agregar invitado'}
                      </h2>
                      <button onClick={() => { setShowCreateGuest(false); setEditingGuest(null); }} style={{ color: 'var(--color-text-muted)' }}>
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* scrollable body */}
                    <div className="overflow-y-auto flex-1 px-6 py-4">
                      <GuestForm
                        key={editingGuest?.id ?? 'new'}
                        initial={editingGuest}
                        onSave={async (data) => {
                          try {
                            if (editingGuest) {
                              await rsvpApi.updateGuest(eventSlug, token, editingGuest.id, data);
                              toast.success('Invitado actualizado');
                            } else {
                              const res = await rsvpApi.createGuest(eventSlug, token, data);
                              const newGuest = res.data as GuestInvitation;
                              const invUrl = buildShortInvUrl(newGuest.token_lookup);
                              navigator.clipboard.writeText(invUrl).catch(() => {});
                              toast.success(`"${newGuest.display_name}" creado · link corto copiado al portapapeles`);
                            }
                            setShowCreateGuest(false); setEditingGuest(null);
                            loadGuests(guestPage); loadGuestStats();
                          } catch (e: unknown) {
                            const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Error al guardar';
                            toast.error(msg);
                          }
                        }}
                        onCancel={() => { setShowCreateGuest(false); setEditingGuest(null); }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* QR Modal */}
            {showGuestQR && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="card p-8 max-w-sm w-full text-center relative">
                  <button onClick={() => setShowGuestQR(null)} className="absolute top-4 right-4" style={{ color: 'var(--color-text-muted)' }}>
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-sub text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>{showGuestQR.guest.display_name}</h3>
                  <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>Invitación personalizada — QR único</p>
                  <div className="flex justify-center mb-5">
                    <QRCodeCanvas value={showGuestQR.url} size={200} level="H" includeMargin />
                  </div>
                  <p className="text-xs break-all mb-4 font-mono px-2 py-2 rounded-lg" style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>{showGuestQR.url}</p>
                  <div className="flex gap-2 justify-center">
                    <button onClick={() => { navigator.clipboard.writeText(showGuestQR.url); toast.success('Link copiado'); }} className="btn-outline text-xs gap-1.5 px-4 py-2">
                      <Copy className="w-3.5 h-3.5" /> Copiar link
                    </button>
                    <a href={showGuestQR.url} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs gap-1.5 px-4 py-2 inline-flex items-center">
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* WhatsApp modal */}
            {whatsappMsg && (
              <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="card p-6 max-w-md w-full relative">
                  <button onClick={() => setWhatsappMsg(null)} className="absolute top-4 right-4" style={{ color: 'var(--color-text-muted)' }}>
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-sub text-base font-medium mb-1" style={{ color: 'var(--color-text)' }}>Mensaje WhatsApp</h3>
                  <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>Para: {whatsappMsg.guest.display_name}</p>
                  {whatsappMsg.short_url && (
                    <div className="rounded-lg px-3 py-2 mb-3 text-xs font-mono flex items-center justify-between gap-2" style={{ background: 'var(--color-secondary)', color: 'var(--color-text-muted)' }}>
                      <span className="truncate">{whatsappMsg.short_url}</span>
                      <button
                        type="button"
                        onClick={() => { navigator.clipboard.writeText(whatsappMsg.short_url!); toast.success('Link corto copiado'); }}
                        className="p-1 rounded hover:bg-white/60"
                        title="Copiar link corto"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="rounded-xl p-4 mb-4 text-sm font-body whitespace-pre-wrap" style={{ background: 'var(--color-secondary)', color: 'var(--color-text)' }}>
                    {whatsappMsg.message}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { navigator.clipboard.writeText(whatsappMsg.message); toast.success('Mensaje copiado'); }} className="btn-outline text-xs gap-1.5 flex-1 py-2.5">
                      <Copy className="w-3.5 h-3.5" /> Copiar mensaje
                    </button>
                    <a href={whatsappMsg.url} target="_blank" rel="noopener noreferrer" className="btn-primary text-xs gap-1.5 flex-1 py-2.5 text-center justify-center" style={{ display: 'flex', alignItems: 'center' }}>
                      <Send className="w-3.5 h-3.5" /> Abrir WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Audit modal */}
            {showAuditModal && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="card w-full max-w-lg p-6 relative mb-8">
                  <button onClick={() => setShowAuditModal(false)} className="absolute top-4 right-4" style={{ color: 'var(--color-text-muted)' }}>
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-sub text-base font-medium mb-4" style={{ color: 'var(--color-text)' }}>Historial de cambios</h3>
                  {guestAudit.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sin registros de auditoría.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {guestAudit.map((entry) => (
                        <div key={entry.id} className="flex gap-3 text-xs font-body" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                          <div className="w-2 h-2 rounded-full mt-1 flex-shrink-0" style={{ background: 'var(--color-primary)' }} />
                          <div>
                            <p className="font-medium" style={{ color: 'var(--color-text)' }}>{entry.action}</p>
                            <p style={{ color: 'var(--color-text-muted)' }}>{new Date(entry.performed_at).toLocaleString()} · {entry.performed_by_type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CSV Import modal */}
            {showCSVImport && (
              <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 px-4 pb-8 overflow-y-auto" style={{ background: 'rgba(0,0,0,0.5)' }}>
                <div className="card w-full max-w-2xl p-6 sm:p-8 relative">
                  <button onClick={() => { setShowCSVImport(false); setCsvPreview(null); }} className="absolute top-4 right-4" style={{ color: 'var(--color-text-muted)' }}>
                    <X className="w-5 h-5" />
                  </button>
                  <h2 className="font-sub text-lg font-medium mb-2" style={{ color: 'var(--color-text)' }}>Importar invitados desde CSV</h2>
                  <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>Descarga la plantilla, complétala y súbela aquí. Verás una vista previa antes de confirmar.</p>
                  {!csvPreview ? (
                    <div className="space-y-4">
                      <button onClick={handleDownloadTemplate} className="btn-outline text-sm gap-2 w-full py-3">
                        <Download className="w-4 h-4" /> Descargar plantilla CSV
                      </button>
                      <div
                        className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                        style={{ borderColor: 'var(--color-border)' }}
                        onClick={() => { const i = document.createElement('input'); i.type='file'; i.accept='.csv'; i.onchange = (e) => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleCSVPreview(f); }; i.click(); }}
                      >
                        {csvImporting ? (
                          <p className="text-sm font-body" style={{ color: 'var(--color-text-muted)' }}>Procesando archivo...</p>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 mx-auto mb-3 opacity-40" style={{ color: 'var(--color-primary)' }} />
                            <p className="text-sm font-body font-medium" style={{ color: 'var(--color-text)' }}>Clic para seleccionar archivo CSV</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Máximo 500 filas por importación</p>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="card p-3 text-center"><p className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{csvPreview.total}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total filas</p></div>
                        <div className="card p-3 text-center"><p className="text-xl font-bold" style={{ color: '#22c55e' }}>{csvPreview.valid_count}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Válidas</p></div>
                        <div className="card p-3 text-center"><p className="text-xl font-bold" style={{ color: '#ef4444' }}>{csvPreview.error_count}</p><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Con errores</p></div>
                      </div>
                      {csvPreview.error_rows.length > 0 && (
                        <div className="rounded-xl p-4 text-xs space-y-2 max-h-48 overflow-y-auto" style={{ background: '#fef2f2' }}>
                          <p className="font-medium text-red-700">Filas con errores (no se importarán):</p>
                          {csvPreview.error_rows.map((r) => (
                            <div key={r.row} className="text-red-600">Fila {r.row}: {r.errors.join(', ')}</div>
                          ))}
                        </div>
                      )}
                      {csvPreview.valid_count > 0 && (
                        <div className="overflow-x-auto max-h-48 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                          <table className="w-full text-xs font-body">
                            <thead style={{ background: 'var(--color-secondary)' }}>
                              <tr>{Object.keys(csvPreview.valid_rows[0] ?? {}).map(k => <th key={k} className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-muted)' }}>{k}</th>)}</tr>
                            </thead>
                            <tbody>
                              {csvPreview.valid_rows.slice(0, 10).map((row, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                                  {Object.values(row).map((v, j) => <td key={j} className="px-3 py-1.5" style={{ color: 'var(--color-text)' }}>{String(v)}</td>)}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {csvPreview.valid_count > 10 && <p className="text-xs text-center py-2" style={{ color: 'var(--color-text-muted)' }}>... y {csvPreview.valid_count - 10} filas más</p>}
                        </div>
                      )}
                      <div className="flex gap-3">
                        <button onClick={() => { setCsvPreview(null); }} className="btn-outline flex-1 py-2.5 text-sm">Cancelar</button>
                        <button disabled={csvPreview.valid_count === 0 || csvImporting} onClick={handleCSVCommit} className="btn-primary flex-1 py-2.5 text-sm gap-2 disabled:opacity-50">
                          {csvImporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                          Importar {csvPreview.valid_count} invitados
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB: Secciones ── */}
        {activeTab === 'secciones' && (
          <div className="space-y-6">

            {/* Hero */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Hero / Portada</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={heroEnabled} onChange={(e) => setHeroEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Subtítulo de portada</label>
                  <input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="input-field" placeholder="Ej: Juntos para siempre" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Aparece encima de los nombres. Si hay datos de padres configurados en la sección Configuración, se mostrarán en su lugar.</p>
                </div>
                <div>
                  <label className="input-label">Opacidad del overlay ({heroOverlay.toFixed(2)})</label>
                  <input type="range" min={0} max={1} step={0.05} value={heroOverlay} onChange={(e) => setHeroOverlay(Number(e.target.value))} className="w-full mt-2 accent-primary" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>0 = sin oscurecimiento · 1 = completamente oscuro. Recomendado: 0.35–0.55.</p>
                </div>
                <div>
                  <label className="input-label">Texto del botón de acción (opcional)</label>
                  <input value={heroCta} onChange={(e) => setHeroCta(e.target.value)} className="input-field" placeholder="Confirmar asistencia" />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Botón en la portada que lleva al RSVP. Vacío = usa el título del RSVP.</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Imagen de fondo (pega URL o selecciona de Media)</label>
                  <input value={heroBgImage} onChange={(e) => setHeroBgImage(e.target.value)} className="input-field mb-2" placeholder="/api/uploads/slug/imagen.jpg o https://..." />
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-6 gap-1.5">
                      {imageFiles.slice(0, 12).map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setHeroBgImage(f.url)}
                          className="relative rounded-lg overflow-hidden aspect-square border-2 transition-all"
                          style={{ borderColor: heroBgImage === f.url ? 'var(--color-primary)' : 'var(--color-border)' }}
                          title={f.original_filename}
                        >
                          <img src={f.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={heroScrollIndicator} onChange={(e) => setHeroScrollIndicator(e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Mostrar indicador de scroll</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Cuenta regresiva</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={countdownEnabled} onChange={(e) => setCountdownEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div>
                <label className="input-label">Etiqueta</label>
                <input value={countdownLabel} onChange={(e) => setCountdownLabel(e.target.value)} className="input-field" placeholder="Faltan para el gran día" />
              </div>
            </div>

            {/* OurStory */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Nuestra Historia</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={storyEnabled} onChange={(e) => setStoryEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="input-label">Título de la sección (vacío = predeterminado)</label>
                <input value={storyTitle} onChange={(e) => setStoryTitle(e.target.value)} className="input-field" placeholder="Nuestra Historia" />
              </div>
              <div className="space-y-2 mb-4">
                {storyEvents.map((ev, i) => (
                  <div key={i} className="rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                    {editingStoryIdx === i ? (
                      <div className="p-3 space-y-2">
                        <DatePicker mode="date" outputFormat="d 'de' MMMM 'de' yyyy" value={ev.date} onChange={(v) => setStoryEvents((prev) => { const newArr = [...prev]; newArr[i].date = v; return newArr; })} />
                        <input value={ev.title} onChange={(e) => setStoryEvents((prev) => { const newArr = [...prev]; newArr[i].title = e.target.value; return newArr; })} className="input-field" placeholder="Título del momento" />
                        <input value={ev.description ?? ''} onChange={(e) => setStoryEvents((prev) => { const newArr = [...prev]; newArr[i].description = e.target.value; return newArr; })} className="input-field" placeholder="Descripción breve" />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => { if (storySnapshot) setStoryEvents((prev) => { const a = [...prev]; a[editingStoryIdx!] = storySnapshot; return a; }); setEditingStoryIdx(null); setStorySnapshot(null); }} className="btn-outline text-sm px-3 py-1.5">Cancelar</button>
                          <button type="button" onClick={() => { setEditingStoryIdx(null); setStorySnapshot(null); }} className="btn-primary text-sm px-3 py-1.5">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => { setStorySnapshot({ ...storyEvents[i] }); setEditingStoryIdx(i); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{ev.title}</p>
                          <p className="text-xs text-muted">{ev.date}{ev.description ? ` · ${ev.description}` : ''}</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setStoryEvents((prev) => prev.filter((_, j) => j !== i)); }} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {storyEvents.length === 0 && <p className="text-sm text-muted py-1">No hay momentos aún.</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <DatePicker
                  mode="date"
                  outputFormat="d 'de' MMMM 'de' yyyy"
                  value={newStoryDate}
                  onChange={setNewStoryDate}
                  placeholder="Fecha del momento"
                />
                <input value={newStoryTitle} onChange={(e) => setNewStoryTitle(e.target.value)} className="input-field" placeholder="Título del momento" />
                <input value={newStoryDesc} onChange={(e) => setNewStoryDesc(e.target.value)} className="input-field" placeholder="Descripción breve" />
              </div>
              <button
                type="button"
                className="btn-outline mt-3 flex items-center gap-2"
                onClick={() => {
                  if (!newStoryTitle.trim()) return;
                  setStoryEvents((prev) => [...prev, { date: newStoryDate, title: newStoryTitle, description: newStoryDesc }]);
                  setNewStoryDate(''); setNewStoryTitle(''); setNewStoryDesc('');
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar momento
              </button>
            </div>

            {/* Schedule */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Cronograma</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={scheduleEnabled} onChange={(e) => setScheduleEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="input-label">Título de la sección</label>
                <input value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} className="input-field" placeholder="Cronograma del día" />
              </div>
              <div className="space-y-2 mb-4">
                {scheduleItems.map((item, i) => (
                  <div key={i} className="rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                    {editingScheduleIdx === i ? (
                      <div className="p-3 space-y-2">
                        <TimePicker value={item.time} onChange={(v) => setScheduleItems((prev) => { const newArr = [...prev]; newArr[i].time = v; return newArr; })} />
                        <input value={item.title} onChange={(e) => setScheduleItems((prev) => { const newArr = [...prev]; newArr[i].title = e.target.value; return newArr; })} className="input-field" placeholder="Actividad" />
                        <input value={item.description ?? ''} onChange={(e) => setScheduleItems((prev) => { const newArr = [...prev]; newArr[i].description = e.target.value; return newArr; })} className="input-field" placeholder="Descripción (opcional)" />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => { if (scheduleSnapshot) setScheduleItems((prev) => { const a = [...prev]; a[editingScheduleIdx!] = scheduleSnapshot; return a; }); setEditingScheduleIdx(null); setScheduleSnapshot(null); }} className="btn-outline text-sm px-3 py-1.5">Cancelar</button>
                          <button type="button" onClick={() => { setEditingScheduleIdx(null); setScheduleSnapshot(null); }} className="btn-primary text-sm px-3 py-1.5">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => { setScheduleSnapshot({ ...scheduleItems[i] }); setEditingScheduleIdx(i); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{item.time} — {item.title}</p>
                          {item.description && <p className="text-xs text-muted">{item.description}</p>}
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setScheduleItems((prev) => prev.filter((_, j) => j !== i)); }} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {scheduleItems.length === 0 && <p className="text-sm text-muted py-1">No hay actividades aún.</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <TimePicker value={newItemTime} onChange={setNewItemTime} placeholder="Hora" />
                <input value={newItemTitle} onChange={(e) => setNewItemTitle(e.target.value)} className="input-field" placeholder="Actividad" />
                <input value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} className="input-field" placeholder="Descripción (opcional)" />
              </div>
              <button
                type="button"
                className="btn-outline mt-3 flex items-center gap-2"
                onClick={() => {
                  if (!newItemTitle.trim()) return;
                  setScheduleItems((prev) => [...prev, { time: newItemTime, title: newItemTitle, description: newItemDesc || undefined }]);
                  setNewItemTime(''); setNewItemTitle(''); setNewItemDesc('');
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar actividad
              </button>
            </div>

            {/* WeddingParty */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Cortejo / Comitiva</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={partyEnabled} onChange={(e) => setPartyEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="input-label">Título de la sección</label>
                <input value={partyTitle} onChange={(e) => setPartyTitle(e.target.value)} className="input-field" placeholder="Cortejo de bodas" />
              </div>
              <div className="space-y-2 mb-4">
                {partyMembers.map((m, i) => (
                  <div key={i} className="rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                    {editingPartyIdx === i ? (
                      <div className="p-3 space-y-2">
                        <input value={m.name} onChange={(e) => setPartyMembers((prev) => { const newArr = [...prev]; newArr[i].name = e.target.value; return newArr; })} className="input-field" placeholder="Nombre completo" />
                        <input value={m.role} onChange={(e) => setPartyMembers((prev) => { const newArr = [...prev]; newArr[i].role = e.target.value; return newArr; })} className="input-field" placeholder="Rol (ej: Dama de honor)" />
                        <select value={m.side} onChange={(e) => setPartyMembers((prev) => { const newArr = [...prev]; newArr[i].side = e.target.value as PartySide; return newArr; })} className="input-field">
                          <option value="bride">Novia / lado de la novia</option>
                          <option value="groom">Novio / lado del novio</option>
                          <option value="both">Ambos</option>
                        </select>
                        <input value={m.description ?? ''} onChange={(e) => setPartyMembers((prev) => { const newArr = [...prev]; newArr[i].description = e.target.value; return newArr; })} className="input-field" placeholder="Descripción (opcional)" />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => { if (partySnapshot) setPartyMembers((prev) => { const a = [...prev]; a[editingPartyIdx!] = partySnapshot; return a; }); setEditingPartyIdx(null); setPartySnapshot(null); }} className="btn-outline text-sm px-3 py-1.5">Cancelar</button>
                          <button type="button" onClick={() => { setEditingPartyIdx(null); setPartySnapshot(null); }} className="btn-primary text-sm px-3 py-1.5">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 p-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => { setPartySnapshot({ ...partyMembers[i] }); setEditingPartyIdx(i); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{m.name} — {m.role}</p>
                          <p className="text-xs text-muted capitalize">{m.side}{m.description ? ` · ${m.description}` : ''}</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setPartyMembers((prev) => prev.filter((_, j) => j !== i)); }} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {partyMembers.length === 0 && <p className="text-sm text-muted py-1">No hay miembros aún.</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} className="input-field" placeholder="Nombre completo" />
                <input value={newMemberRole} onChange={(e) => setNewMemberRole(e.target.value)} className="input-field" placeholder="Rol (ej: Dama de honor)" />
                <select value={newMemberSide} onChange={(e) => setNewMemberSide(e.target.value as PartySide)} className="input-field">
                  <option value="bride">Novia / lado de la novia</option>
                  <option value="groom">Novio / lado del novio</option>
                  <option value="both">Ambos</option>
                </select>
                <input value={newMemberDesc} onChange={(e) => setNewMemberDesc(e.target.value)} className="input-field" placeholder="Descripción (opcional)" />
              </div>
              <button
                type="button"
                className="btn-outline mt-3 flex items-center gap-2"
                onClick={() => {
                  if (!newMemberName.trim() || !newMemberRole.trim()) return;
                  setPartyMembers((prev) => [...prev, { name: newMemberName, role: newMemberRole, side: newMemberSide, description: newMemberDesc || undefined }]);
                  setNewMemberName(''); setNewMemberRole(''); setNewMemberDesc(''); setNewMemberSide('both');
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar miembro
              </button>
            </div>

            {/* Accommodation */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Hospedaje</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={accomEnabled} onChange={(e) => setAccomEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="input-label">Título de la sección</label>
                <input value={accomTitle} onChange={(e) => setAccomTitle(e.target.value)} className="input-field" placeholder="¿Dónde hospedarse?" />
              </div>
              <div className="space-y-2 mb-4">
                {accomHotels.map((h, i) => (
                  <div key={i} className="rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                    {editingAccomIdx === i ? (
                      <div className="p-3 space-y-2">
                        <input value={h.name} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].name = e.target.value; return newArr; })} className="input-field" placeholder="Nombre del hotel" />
                        <input value={h.address} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].address = e.target.value; return newArr; })} className="input-field" placeholder="Dirección" />
                        <input value={h.phone ?? ''} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].phone = e.target.value; return newArr; })} className="input-field" placeholder="Teléfono" />
                        <input value={h.website ?? ''} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].website = e.target.value; return newArr; })} className="input-field" placeholder="Sitio web (https://...)" />
                        <input value={h.priceRange ?? ''} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].priceRange = e.target.value; return newArr; })} className="input-field" placeholder="Rango de precios" />
                        <input value={h.notes ?? ''} onChange={(e) => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].notes = e.target.value; return newArr; })} className="input-field" placeholder="Notas" />
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Estrellas:</span>
                          {[0, 1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button" onClick={() => setAccomHotels((prev) => { const newArr = [...prev]; newArr[i].stars = n; return newArr; })}
                              className="text-xs px-2 py-1 rounded transition-colors"
                              style={{ background: (h.stars ?? 0) === n ? 'var(--color-primary)' : 'var(--color-border)', color: (h.stars ?? 0) === n ? 'white' : 'var(--color-text-muted)' }}>
                              {n === 0 ? '—' : n}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => { if (accomSnapshot) setAccomHotels((prev) => { const a = [...prev]; a[editingAccomIdx!] = accomSnapshot; return a; }); setEditingAccomIdx(null); setAccomSnapshot(null); }} className="btn-outline text-sm px-3 py-1.5">Cancelar</button>
                          <button type="button" onClick={() => { setEditingAccomIdx(null); setAccomSnapshot(null); }} className="btn-primary text-sm px-3 py-1.5">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => { setAccomSnapshot({ ...accomHotels[i] }); setEditingAccomIdx(i); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{h.name}{h.stars ? ` · ${'⭐'.repeat(Math.min(h.stars, 5))}` : ''}</p>
                          <p className="text-xs text-muted">{h.address}{h.phone ? ` · ${h.phone}` : ''}</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAccomHotels((prev) => prev.filter((_, j) => j !== i)); }} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {accomHotels.length === 0 && <p className="text-sm text-muted py-1">No hay hoteles aún.</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newHotelName} onChange={(e) => setNewHotelName(e.target.value)} className="input-field" placeholder="Nombre del hotel *" />
                <input value={newHotelAddress} onChange={(e) => setNewHotelAddress(e.target.value)} className="input-field" placeholder="Dirección *" />
                <input value={newHotelPhone} onChange={(e) => setNewHotelPhone(e.target.value)} className="input-field" placeholder="Teléfono" />
                <input value={newHotelWebsite} onChange={(e) => setNewHotelWebsite(e.target.value)} className="input-field" placeholder="Sitio web (https://...)" />
                <input value={newHotelPrice} onChange={(e) => setNewHotelPrice(e.target.value)} className="input-field" placeholder="Rango de precios" />
                <input value={newHotelNotes} onChange={(e) => setNewHotelNotes(e.target.value)} className="input-field" placeholder="Notas (código descuento, etc.)" />
                <div className="sm:col-span-2 flex items-center gap-2 flex-wrap">
                  <span className="font-body text-sm" style={{ color: 'var(--color-text-muted)' }}>Estrellas:</span>
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <button key={n} type="button" onClick={() => setNewHotelStars(n)}
                      className="text-sm px-2.5 py-1 rounded-lg transition-colors"
                      style={{ background: newHotelStars === n ? 'var(--color-primary)' : 'var(--color-secondary)', color: newHotelStars === n ? 'white' : 'var(--color-text)' }}>
                      {n === 0 ? '—' : n}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="btn-outline mt-3 flex items-center gap-2"
                onClick={() => {
                  if (!newHotelName.trim() || !newHotelAddress.trim()) return;
                  setAccomHotels((prev) => [...prev, { name: newHotelName, address: newHotelAddress, phone: newHotelPhone || undefined, website: newHotelWebsite || undefined, priceRange: newHotelPrice || undefined, notes: newHotelNotes || undefined, stars: newHotelStars || undefined }]);
                  setNewHotelName(''); setNewHotelAddress(''); setNewHotelPhone(''); setNewHotelWebsite(''); setNewHotelPrice(''); setNewHotelNotes(''); setNewHotelStars(0);
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar hotel
              </button>
            </div>

            {/* FAQ */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Preguntas frecuentes</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={faqEnabled} onChange={(e) => setFaqEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="mb-4">
                <label className="input-label">Título de la sección</label>
                <input value={faqTitle} onChange={(e) => setFaqTitle(e.target.value)} className="input-field" placeholder="Preguntas Frecuentes" />
              </div>
              <div className="space-y-2 mb-4">
                {faqItems.map((item, i) => (
                  <div key={i} className="rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                    {editingFaqIdx === i ? (
                      <div className="p-3 space-y-2">
                        <input value={item.question} onChange={(e) => setFaqItems((prev) => { const newArr = [...prev]; newArr[i].question = e.target.value; return newArr; })} className="input-field" placeholder="¿Pregunta?" />
                        <textarea value={item.answer} onChange={(e) => setFaqItems((prev) => { const newArr = [...prev]; newArr[i].answer = e.target.value; return newArr; })} className="input-field resize-none" rows={2} placeholder="Respuesta" />
                        <div className="flex gap-2 justify-end">
                          <button type="button" onClick={() => { if (faqSnapshot) setFaqItems((prev) => { const a = [...prev]; a[editingFaqIdx!] = faqSnapshot; return a; }); setEditingFaqIdx(null); setFaqSnapshot(null); }} className="btn-outline text-sm px-3 py-1.5">Cancelar</button>
                          <button type="button" onClick={() => { setEditingFaqIdx(null); setFaqSnapshot(null); }} className="btn-primary text-sm px-3 py-1.5">Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3 p-3 cursor-pointer hover:opacity-75 transition-opacity" onClick={() => { setFaqSnapshot({ ...faqItems[i] }); setEditingFaqIdx(i); }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium font-body" style={{ color: 'var(--color-text)' }}>{item.question}</p>
                          <p className="text-xs text-muted">{item.answer}</p>
                        </div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setFaqItems((prev) => prev.filter((_, j) => j !== i)); }} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {faqItems.length === 0 && <p className="text-sm text-muted py-1">No hay preguntas aún.</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} className="input-field" placeholder="¿Pregunta?" />
                <input value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} className="input-field" placeholder="Respuesta" />
              </div>
              <button
                type="button"
                className="btn-outline mt-3 flex items-center gap-2"
                onClick={() => {
                  if (!newFaqQ.trim() || !newFaqA.trim()) return;
                  setFaqItems((prev) => [...prev, { question: newFaqQ, answer: newFaqA }]);
                  setNewFaqQ(''); setNewFaqA('');
                }}
              >
                <Plus className="w-3.5 h-3.5" /> Agregar pregunta
              </button>
            </div>

            {/* RSVP — Textos */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>RSVP — Textos</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Título de la sección</label>
                  <input value={rsvpTitle} onChange={(e) => setRsvpTitle(e.target.value)} className="input-field" placeholder="Confirma tu asistencia" />
                </div>
                <div>
                  <label className="input-label">Subtítulo</label>
                  <input value={rsvpSubtitle} onChange={(e) => setRsvpSubtitle(e.target.value)} className="input-field" placeholder="Por favor confirma antes del..." />
                </div>
                <div>
                  <label className="input-label">Mensaje tras confirmar</label>
                  <textarea rows={2} value={rsvpConfirmMsg} onChange={(e) => setRsvpConfirmMsg(e.target.value)} className="input-field resize-none" placeholder="¡Gracias! Nos alegra contar con tu presencia." />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Pie de página</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={footerEnabled} onChange={(e) => setFooterEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="input-label">Mensaje</label>
                  <textarea rows={3} value={footerMsg} onChange={(e) => setFooterMsg(e.target.value)} className="input-field resize-none" placeholder="Con amor, los invitamos a celebrar este día especial con nosotros." />
                </div>
                <div>
                  <label className="input-label">Créditos</label>
                  <input value={footerCredits} onChange={(e) => setFooterCredits(e.target.value)} className="input-field" placeholder="Invitación digital creada con Eventique" />
                </div>
              </div>
            </div>

            {/* Social */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>Redes sociales</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Hashtag (con o sin #)</label>
                  <input value={socialHashtag} onChange={(e) => setSocialHashtag(e.target.value)} className="input-field" placeholder="#NombreEvento2026" />
                </div>
                <div>
                  <label className="input-label">Instagram (usuario)</label>
                  <input value={socialInstagram} onChange={(e) => setSocialInstagram(e.target.value)} className="input-field" placeholder="@usuario" />
                </div>
              </div>
            </div>

            {/* Gallery (linked to Media) */}
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>
                  Galería ({galleryPhotos.length} fotos)
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={galleryEnabled} onChange={(e) => setGalleryEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Visible</span>
                </label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="input-label">Título</label>
                  <input value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} className="input-field" placeholder="Nuestra Galería" />
                </div>
                <div>
                  <label className="input-label">Subtítulo</label>
                  <input value={gallerySubtitle} onChange={(e) => setGallerySubtitle(e.target.value)} className="input-field" placeholder="Nuestros momentos juntos" />
                </div>
              </div>
              <p className="text-xs text-muted mb-4">Agrega o quita fotos con el botón "Galería" en la pestaña Media.</p>
              {galleryPhotos.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {galleryPhotos.map((photo, i) => (
                    <div key={i} className="relative group rounded-lg overflow-hidden">
                      <img src={photo.url} alt={photo.alt ?? ''} className="w-full aspect-square object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhotoFromGallery(photo.url)}
                        className="absolute inset-0 bg-red-500/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        title="Quitar de galería"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No hay fotos en la galería.</p>
              )}
            </div>

            {/* Music (linked to Media + YouTube) */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-3" style={{ color: 'var(--color-text)' }}>
                Reproductor ({musicTracks.length} pistas)
              </h2>
              <div className="flex items-center gap-6 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={musicEnabled} onChange={(e) => setMusicEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Habilitar música</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={musicAutoplay} onChange={(e) => setMusicAutoplay(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Autoplay</span>
                </label>
              </div>
              {musicTracks.length > 0 ? (
                <div className="mb-4">
                  <p className="text-xs font-body mb-2 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
                    <GripVertical className="w-3 h-3" />
                    Arrastra para reordenar
                  </p>
                  <div className="space-y-1.5">
                    {musicTracks.map((track, i) => (
                      <div
                        key={track.url + i}
                        draggable
                        onDragStart={(e) => {
                          trackDragSrc.current = i;
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          setTrackDragOver(i);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (trackDragSrc.current !== null && trackDragSrc.current !== i) {
                            moveTrack(trackDragSrc.current, i);
                          }
                          trackDragSrc.current = null;
                          setTrackDragOver(null);
                        }}
                        onDragEnd={() => {
                          trackDragSrc.current = null;
                          setTrackDragOver(null);
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl transition-all select-none"
                        style={{
                          background: 'var(--color-secondary)',
                          opacity: trackDragSrc.current === i ? 0.4 : 1,
                          borderLeft: trackDragOver === i && trackDragSrc.current !== i
                            ? '3px solid var(--color-primary)'
                            : '3px solid transparent',
                          cursor: 'grab',
                        }}
                      >
                        {/* Drag handle */}
                        <GripVertical className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)', cursor: 'grab' }} />
                        {/* Track number */}
                        <span className="text-xs font-body font-medium w-4 text-center flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                          {i + 1}
                        </span>
                        <Music2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-body font-medium truncate" style={{ color: 'var(--color-text)' }}>{track.title}</p>
                          {track.artist && <p className="text-xs text-muted truncate">{track.artist}</p>}
                        </div>
                        {/* Up/Down for mobile */}
                        <div className="flex flex-col gap-0.5 flex-shrink-0">
                          <button
                            type="button"
                            disabled={i === 0}
                            onClick={() => moveTrack(i, i - 1)}
                            className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-20 transition-colors"
                            title="Subir"
                          >
                            <ChevronUpIcon className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                          </button>
                          <button
                            type="button"
                            disabled={i === musicTracks.length - 1}
                            onClick={() => moveTrack(i, i + 1)}
                            className="p-0.5 rounded hover:bg-primary/10 disabled:opacity-20 transition-colors"
                            title="Bajar"
                          >
                            <ChevronDown className="w-3 h-3" style={{ color: 'var(--color-text-muted)' }} />
                          </button>
                        </div>
                        <button type="button" onClick={() => removeTrackFromPlayer(track.url)} className="p-1 rounded hover:bg-red-50 transition-colors flex-shrink-0">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted mb-4">No hay pistas en el reproductor.</p>
              )}
              <div className="pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-xs font-body font-medium mb-3" style={{ color: 'var(--color-text-muted)' }}>Agregar pista de YouTube</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input value={newYoutubeUrl} onChange={(e) => setNewYoutubeUrl(e.target.value)} className="input-field" placeholder="https://youtube.com/watch?v=..." />
                  <input value={newYoutubeTitle} onChange={(e) => setNewYoutubeTitle(e.target.value)} className="input-field" placeholder="Título" />
                  <input value={newYoutubeArtist} onChange={(e) => setNewYoutubeArtist(e.target.value)} className="input-field" placeholder="Artista (opcional)" />
                </div>
                <button type="button" onClick={addYoutubeTrack} className="btn-outline mt-3 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> Agregar YouTube
                </button>
              </div>
              <p className="text-xs text-muted mt-3">Para MP3, sube el archivo en la pestaña Media y actívalo ahí.</p>
            </div>

            {/* ── Skin de Invitación ──────────────────────────────────────── */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-4" style={{ color: 'var(--color-text)' }}>
                Skin de Invitación
              </h2>
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                Elige entre la experiencia clásica con todas las secciones o el skin <strong>Envelope</strong> inspirado en invitaciones físicas (sobre animado, cards flotantes, paleta olive).
              </p>

              {/* Selector de skin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {([
                  { value: 'classic', label: 'Clásico', desc: 'Hero, Countdown, Historia, Itinerario, Galería y más.' },
                  { value: 'envelope', label: 'Envelope (GoParty)', desc: 'Sobre animado, collage de cards, venues olive, galería polaroid.' },
                  { value: 'paper-access', label: 'Paper Access', desc: 'Formato papel/editorial, acceso personalizado, cards apiladas y RSVP integrado.' },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setInvitationSkin(opt.value)}
                    className="text-left p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: invitationSkin === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                      background: invitationSkin === opt.value ? 'var(--color-secondary)' : 'var(--color-surface)',
                    }}
                  >
                    <p className="font-medium text-sm font-body" style={{ color: 'var(--color-text)' }}>{opt.label}</p>
                    <p className="text-xs mt-1 font-body" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Campos del skin Envelope */}
              {invitationSkin === 'envelope' && (
                <div className="space-y-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Configuración Envelope</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Texto de apertura del sobre</label>
                      <input value={envelopeOpeningText} onChange={e => setEnvelopeOpeningText(e.target.value)} className="input-field" placeholder="Empieza una nueva etapa en nuestras vidas" />
                    </div>
                    <div>
                      <label className="input-label">Label del sobre ("Tocá aquí")</label>
                      <input value={envelopeTapLabel} onChange={e => setEnvelopeTapLabel(e.target.value)} className="input-field" placeholder="Tocá aquí" />
                    </div>
                    <div>
                      <label className="input-label">Subtítulo en monograma</label>
                      <input value={collageSubtitle} onChange={e => setCollageSubtitle(e.target.value)} className="input-field" placeholder="Nuestra Boda" />
                    </div>
                    <div>
                      <label className="input-label">Label countdown</label>
                      <input value={collageCountdownLabel} onChange={e => setCollageCountdownLabel(e.target.value)} className="input-field" placeholder="Sólo Faltan" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Etiqueta Venue 1 (Ceremonia)</label>
                      <input value={venuesCeremonyLabel} onChange={e => setVenuesCeremonyLabel(e.target.value)} className="input-field" placeholder="Misa" />
                    </div>
                    <div>
                      <label className="input-label">Etiqueta Venue 2 (Recepción)</label>
                      <input value={venuesReceptionLabel} onChange={e => setVenuesReceptionLabel(e.target.value)} className="input-field" placeholder="Brindis" />
                    </div>
                    <div>
                      <label className="input-label">Icono Venue 1</label>
                      <select value={venuesCeremonyIcon} onChange={e => setVenuesCeremonyIcon(e.target.value)} className="input-field">
                        <option value="church">Iglesia</option>
                        <option value="champagne">Copas / Brindis</option>
                        <option value="heart">Corazón</option>
                        <option value="star">Estrella</option>
                        <option value="music">Música</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-label">Icono Venue 2</label>
                      <select value={venuesReceptionIcon} onChange={e => setVenuesReceptionIcon(e.target.value)} className="input-field">
                        <option value="champagne">Copas / Brindis</option>
                        <option value="church">Iglesia</option>
                        <option value="heart">Corazón</option>
                        <option value="star">Estrella</option>
                        <option value="music">Música</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={dressCodeEnabled} onChange={e => setDressCodeEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                        <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Mostrar Código de Vestimenta</span>
                      </label>
                      {dressCodeEnabled && (
                        <div className="space-y-2">
                          <input value={dressCodeTitle} onChange={e => setDressCodeTitle(e.target.value)} className="input-field" placeholder="Código de Vestimenta" />
                          <input value={dressCodeValue} onChange={e => setDressCodeValue(e.target.value)} className="input-field" placeholder="Elegante" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <input type="checkbox" checked={galleryPolaroidEnabled} onChange={e => setGalleryPolaroidEnabled(e.target.checked)} className="w-4 h-4 accent-primary" />
                        <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>Galería Polaroid</span>
                      </label>
                      {galleryPolaroidEnabled && (
                        <div className="space-y-2">
                          <input value={galleryPolaroidFooter} onChange={e => setGalleryPolaroidFooter(e.target.value)} className="input-field" placeholder="Te Esperamos" />
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={galleryPolaroidBw} onChange={e => setGalleryPolaroidBw(e.target.checked)} className="w-4 h-4 accent-primary" />
                            <span className="font-body text-xs" style={{ color: 'var(--color-text)' }}>Fotos en blanco y negro</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    Tip: Para el skin Envelope se recomienda la paleta <strong>Olive</strong> (disponible en la pestaña Tema).
                  </p>
                </div>
              )}

              {invitationSkin === 'paper-access' && (
                <div className="space-y-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Configuración Paper Access</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="input-label">Etiqueta superior</label>
                      <input value={paperAccessIntroLabel} onChange={e => setPaperAccessIntroLabel(e.target.value)} className="input-field" placeholder="Invitacion digital" />
                    </div>
                    <div>
                      <label className="input-label">Texto de apertura</label>
                      <input value={paperAccessIntroText} onChange={e => setPaperAccessIntroText(e.target.value)} className="input-field" placeholder="Abre nuestra invitacion" />
                    </div>
                    <div>
                      <label className="input-label">Label del sobre</label>
                      <input value={paperAccessTapLabel} onChange={e => setPaperAccessTapLabel(e.target.value)} className="input-field" placeholder="Toca aqui" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Etiqueta invitado personalizado</label>
                      <input value={paperAccessGuestLabel} onChange={e => setPaperAccessGuestLabel(e.target.value)} className="input-field" placeholder="Invitacion especial para" />
                    </div>
                    <div>
                      <label className="input-label">Texto de cupos ({'{passes}'})</label>
                      <input value={paperAccessPassesLabel} onChange={e => setPaperAccessPassesLabel(e.target.value)} className="input-field" placeholder="Hemos reservado {passes} cupo(s) para ti." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Prompt de música</label>
                      <input value={paperMusicPrompt} onChange={e => setPaperMusicPrompt(e.target.value)} className="input-field" placeholder="Dale play para escuchar nuestra cancion" />
                    </div>
                    <div>
                      <label className="input-label">Label música</label>
                      <input value={paperMusicButtonLabel} onChange={e => setPaperMusicButtonLabel(e.target.value)} className="input-field" placeholder="Reproducir musica" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Texto familia/padres</label>
                      <input value={paperParentsIntro} onChange={e => setPaperParentsIntro(e.target.value)} className="input-field" placeholder="En compania de nuestras familias" />
                    </div>
                    <div>
                      <label className="input-label">Introducción regalos</label>
                      <input value={paperGiftIntro} onChange={e => setPaperGiftIntro(e.target.value)} className="input-field" placeholder="Su compania es lo mas importante." />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="input-label">Título calendario</label>
                      <input value={paperCalendarTitle} onChange={e => setPaperCalendarTitle(e.target.value)} className="input-field" placeholder="Anadelo a tu calendario" />
                    </div>
                    <div>
                      <label className="input-label">Botón calendario</label>
                      <input value={paperCalendarButtonLabel} onChange={e => setPaperCalendarButtonLabel(e.target.value)} className="input-field" placeholder="Agregar al calendario" />
                    </div>
                    <div>
                      <label className="input-label">Botón ubicación</label>
                      <input value={paperLocationButtonLabel} onChange={e => setPaperLocationButtonLabel(e.target.value)} className="input-field" placeholder="Ubicacion" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Título venues</label>
                      <input value={paperVenuesTitle} onChange={e => setPaperVenuesTitle(e.target.value)} className="input-field" placeholder="Detalles del evento" />
                    </div>
                    <div>
                      <label className="input-label">Título RSVP</label>
                      <input value={paperRsvpTitle} onChange={e => setPaperRsvpTitle(e.target.value)} className="input-field" placeholder="Confirmar asistencia" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                    <div>
                      <label className="input-label">Countdown título</label>
                      <input value={paperCountdownTitle} onChange={e => setPaperCountdownTitle(e.target.value)} className="input-field" placeholder="Faltan" />
                    </div>
                    <div>
                      <label className="input-label">Días</label>
                      <input value={paperCountdownDaysLabel} onChange={e => setPaperCountdownDaysLabel(e.target.value)} className="input-field" placeholder="Dias" />
                    </div>
                    <div>
                      <label className="input-label">Horas</label>
                      <input value={paperCountdownHoursLabel} onChange={e => setPaperCountdownHoursLabel(e.target.value)} className="input-field" placeholder="Horas" />
                    </div>
                    <div>
                      <label className="input-label">Minutos</label>
                      <input value={paperCountdownMinutesLabel} onChange={e => setPaperCountdownMinutesLabel(e.target.value)} className="input-field" placeholder="Minutos" />
                    </div>
                    <div>
                      <label className="input-label">Subtítulo</label>
                      <input value={paperCountdownSubtitle} onChange={e => setPaperCountdownSubtitle(e.target.value)} className="input-field" placeholder="Para nuestro gran dia" />
                    </div>
                  </div>

                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    Tip: Para Paper Access se recomienda la paleta <strong>Paper Olive</strong>. Los datos de padres se leen desde Configuración → Personas.
                  </p>
                </div>
              )}
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button type="button" onClick={saveSections} disabled={savingSections} className="btn-primary px-8">
                {savingSections ? 'Guardando…' : 'Guardar secciones'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB: Ayuda / Guía de usuario ── */}
        {activeTab === 'ayuda' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {/* Header */}
            <div className="card p-6" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div className="flex items-start gap-4">
                <HelpCircle className="w-8 h-8 flex-shrink-0 mt-1" style={{ color: 'var(--color-primary)' }} />
                <div>
                  <h2 className="font-heading text-2xl mb-1" style={{ color: 'var(--color-text)' }}>Guía de usuario — Eventique</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Todo lo que necesitás saber para gestionar tu evento desde este panel.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <div className="card p-6">
              <h3 className="font-sub text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: 'var(--color-primary)' }}>1</span>
                Inicio rápido — Primeros pasos
              </h3>
              <ol className="space-y-3 text-sm" style={{ color: 'var(--color-text)' }}>
                {[
                  ['Tab Config', 'Completá los datos del evento: nombres, fecha, lugar, horario'],
                  ['Tab Tema', 'Elegí la paleta de colores que más te guste'],
                  ['Tab Media', 'Subí la foto de portada y fotos para la galería'],
                  ['Tab Secciones → Hero', 'Asigná la foto de portada y el subtítulo'],
                  ['Tab Invitados', 'Importá tu lista de invitados (CSV) o cargalos uno a uno'],
                  ['Invitados → WhatsApp', 'Enviá el enlace personalizado a cada invitado'],
                ].map(([step, desc], i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: 'var(--color-accent)' }}>{i + 1}</span>
                    <span><strong>{step}</strong> — {desc}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tabs overview */}
            <div className="card p-6">
              <h3 className="font-sub text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: 'var(--color-primary)' }}>2</span>
                ¿Para qué sirve cada tab?
              </h3>
              <div className="space-y-3">
                {[
                  { tab: 'Inicio',         desc: 'Resumen del evento, estadísticas de confirmaciones y accesos rápidos.' },
                  { tab: 'RSVPs',          desc: 'Lista completa de confirmaciones. Podés editar o eliminar cualquier RSVP.' },
                  { tab: 'Invitados',      desc: 'Gestión de invitados personalizados: crear, importar CSV, ver QR, enviar WhatsApp.' },
                  { tab: 'Configuración',  desc: 'Datos básicos del evento, recintos, modo de invitaciones, plantilla de WhatsApp.' },
                  { tab: 'Tema',           desc: 'Paleta de colores (22 opciones). El cambio se aplica en toda la invitación.' },
                  { tab: 'Media',          desc: 'Subir fotos (hasta 10 MB) y audio (hasta 50 MB). Asignar a galería o reproductor.' },
                  { tab: 'Eventos',        desc: 'Para el superadministrador: crear, clonar o eliminar eventos del sistema.' },
                  { tab: 'Secciones',      desc: 'Editor completo de cada bloque de la invitación (portada, historia, venues, música, etc.).' },
                  { tab: 'Ayuda',          desc: 'Esta guía de usuario.' },
                ].map(({ tab, desc }) => (
                  <div key={tab} className="flex gap-3 p-3 rounded-lg" style={{ background: 'var(--color-secondary)' }}>
                    <span className="font-medium text-sm w-32 flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{tab}</span>
                    <span className="text-sm" style={{ color: 'var(--color-text)' }}>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invitados guide */}
            <div className="card p-6">
              <h3 className="font-sub text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: 'var(--color-primary)' }}>3</span>
                Cómo gestionar invitados
              </h3>
              <div className="space-y-4 text-sm" style={{ color: 'var(--color-text)' }}>
                <div>
                  <p className="font-semibold mb-1">Importar desde Excel / CSV</p>
                  <ol className="space-y-1 ml-4 list-decimal" style={{ color: 'var(--color-text-muted)' }}>
                    <li>Descargá la plantilla (botón "Exportar Plantilla")</li>
                    <li>Completá los datos en Excel: nombre, cupos, email, teléfono</li>
                    <li>Guardá como CSV y subilo con "Importar CSV"</li>
                    <li>Revisá la previsualización → Confirmar importación</li>
                  </ol>
                </div>
                <div>
                  <p className="font-semibold mb-2">Estados de un invitado</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { estado: 'Pendiente', color: '#F59E0B', desc: 'No respondió aún' },
                      { estado: 'Confirmado', color: '#10B981', desc: 'Confirmó todos sus cupos' },
                      { estado: 'Parcial', color: '#F97316', desc: 'Confirmó algunos cupos' },
                      { estado: 'Rechazado', color: '#EF4444', desc: 'Respondió que no va' },
                      { estado: 'Bloqueado', color: '#6B7280', desc: 'No puede confirmar' },
                      { estado: 'Abierto', color: '#3B82F6', desc: 'Abrió el enlace, sin responder' },
                    ].map(({ estado, color, desc }) => (
                      <div key={estado} className="flex items-center gap-2 p-2 rounded" style={{ background: 'var(--color-secondary)' }}>
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <div>
                          <p className="font-medium text-xs">{estado}</p>
                          <p className="text-xs opacity-70">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-semibold mb-1">Enviar por WhatsApp</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Clic en el ícono de WhatsApp en la fila del invitado → revisá el mensaje → clic en "Abrir WhatsApp". El enlace que aparece en el mensaje es corto y enmascara el token largo del invitado.
                  </p>
                </div>
              </div>
            </div>

            {/* Skins */}
            <div className="card p-6">
              <h3 className="font-sub text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: 'var(--color-primary)' }}>4</span>
                Estilos de invitación (Skins)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--color-primary)', background: 'var(--color-secondary)' }}>
                  <p className="font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>Classic (Clásico)</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    El estilo estándar. Portada, historia, venues, itinerario, cortejo, galería, hospedaje, FAQ, RSVP, regalos y footer. Compatible con todas las paletas.
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2" style={{ borderColor: 'var(--color-accent)', background: 'var(--color-secondary)' }}>
                  <p className="font-semibold mb-2" style={{ color: 'var(--color-accent)' }}>Envelope (GoParty)</p>
                  <p style={{ color: 'var(--color-text-muted)' }}>
                    Sobre interactivo animado, collage de cards, venues sobre fondo olive, dress code, galería polaroid. Para activar: Tab Secciones → Skin → Envelope + paleta Olive.
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ */}
            <div className="card p-6">
              <h3 className="font-sub text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-primary)' }}>
                <span className="w-7 h-7 rounded-full text-white text-sm flex items-center justify-center font-bold" style={{ background: 'var(--color-primary)' }}>5</span>
                Preguntas frecuentes
              </h3>
              <div className="space-y-4 text-sm">
                {[
                  {
                    q: '¿Mis cambios se guardan automáticamente?',
                    a: 'No. Cada tab tiene su propio botón Guardar. Siempre confirmá antes de cambiar de tab o cerrar el navegador.',
                  },
                  {
                    q: '¿Por qué los invitados no ven los cambios?',
                    a: 'Pediles que actualicen la página (F5 o deslizar para refrescar en celular). Los cambios se aplican de inmediato pero el navegador puede mostrar la versión en caché.',
                  },
                  {
                    q: '¿La música no suena automáticamente?',
                    a: 'Es normal. Los navegadores modernos bloquean el audio sin interacción del usuario. El invitado verá el reproductor y puede tocarlo para iniciar.',
                  },
                  {
                    q: '¿El enlace de un invitado dejó de funcionar?',
                    a: 'Verificá en Tab Invitados que el invitado está activo y no bloqueado. Si regeneraste el token recientemente, el enlace viejo queda inválido — enviá el nuevo desde el botón de WhatsApp.',
                  },
                  {
                    q: '¿Puedo cambiar la paleta después de enviar las invitaciones?',
                    a: 'Sí. Los invitados no necesitan un nuevo enlace — al abrir su URL verán la nueva paleta.',
                  },
                  {
                    q: '¿Olvidé la contraseña del admin?',
                    a: 'Contactá al administrador del sistema: eudavalos91@gmail.com',
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="p-3 rounded-lg" style={{ background: 'var(--color-secondary)' }}>
                    <p className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{q}</p>
                    <p style={{ color: 'var(--color-text-muted)' }}>{a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="card p-6 text-center">
              <HelpCircle className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--color-primary)' }} />
              <h3 className="font-sub text-lg font-semibold mb-1" style={{ color: 'var(--color-text)' }}>¿Necesitás más ayuda?</h3>
              <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
                Contactá al administrador del sistema con cualquier consulta o problema técnico.
              </p>
              <a
                href="mailto:eudavalos91@gmail.com"
                className="btn-primary inline-flex"
              >
                eudavalos91@gmail.com
              </a>
            </div>
          </div>
        )}

      </div>
    </div>

    {/* ── RSVP Edit Modal ── */}
    {editingRsvp && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setEditingRsvp(null); }}
      >
        <div className="card w-full max-w-lg p-6 sm:p-8" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Editar confirmación</h2>
            <button onClick={() => setEditingRsvp(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Nombre</label>
                <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="input-label">Email</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div>
              <label className="input-label">Asistencia</label>
              <div className="flex gap-4 mt-1">
                {([{ val: true, label: 'Asistirá' }, { val: false, label: 'No asistirá' }] as const).map(({ val, label }) => (
                  <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" checked={editForm.attending === val} onChange={() => setEditForm((f) => ({ ...f, attending: val }))} className="w-4 h-4" />
                    <span className="font-body text-sm" style={{ color: 'var(--color-text)' }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
            {editForm.attending && (
              <div>
                <label className="input-label">Número de invitados</label>
                <input type="number" min={1} max={20} value={editForm.guest_count} onChange={(e) => setEditForm((f) => ({ ...f, guest_count: Number(e.target.value) }))} className="input-field" />
              </div>
            )}
            <div>
              <label className="input-label">Restricciones dietéticas</label>
              <input value={editForm.dietary_restrictions} onChange={(e) => setEditForm((f) => ({ ...f, dietary_restrictions: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="input-label">Solicitud musical</label>
              <input value={editForm.song_request} onChange={(e) => setEditForm((f) => ({ ...f, song_request: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="input-label">Mensaje</label>
              <textarea rows={3} value={editForm.message} onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))} className="input-field resize-none" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setEditingRsvp(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
            <button onClick={handleSaveEdit} disabled={savingEdit} className="btn-primary flex-1 justify-center">
              {savingEdit ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* ── Duplicate Event Modal ── */}
    {duplicatingSlug && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setDuplicatingSlug(null); }}
      >
        <div className="card w-full max-w-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Clonar evento</h2>
            <button onClick={() => setDuplicatingSlug(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <p className="text-xs text-muted mb-4">Se copiará la configuración de <span className="font-mono">{duplicatingSlug}</span> a un nuevo evento.</p>
          <form onSubmit={handleDuplicateEvent} className="space-y-4">
            <div>
              <label className="input-label">Nombre del nuevo evento</label>
              <input value={dupName} onChange={(e) => { setDupName(e.target.value); setDupSlug(slugify(e.target.value)); }} className="input-field" required />
            </div>
            <div>
              <label className="input-label">Slug (URL)</label>
              <input value={dupSlug} onChange={(e) => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))} className="input-field font-mono" placeholder="nuevo-slug-2026" required />
              {dupSlug && <p className="text-xs mt-1 text-muted font-mono">/e/{dupSlug}</p>}
            </div>
            <div>
              <label className="input-label">Token de admin (opcional)</label>
              <div className="flex gap-2">
                <input type="text" value={dupToken} onChange={(e) => setDupToken(e.target.value)} className="input-field flex-1 font-mono text-sm" placeholder="Deja vacío para usar token global" />
                <button
                  type="button"
                  onClick={() => setDupToken(Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2))}
                  className="btn-outline flex items-center gap-1.5 whitespace-nowrap"
                  title="Generar token aleatorio"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Generar
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setDuplicatingSlug(null)} className="btn-outline flex-1 justify-center">Cancelar</button>
              <button type="submit" disabled={savingDup || !dupName || !dupSlug} className="btn-primary flex-1 justify-center">
                {savingDup ? 'Clonando…' : 'Clonar evento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* ── Token Modal ── */}
    {tokenModal && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setTokenModal(null); }}
      >
        <div className="card w-full max-w-md p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Token de acceso generado</h2>
            <button onClick={() => setTokenModal(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <p className="text-sm text-muted mb-4">
            Comparte este token con el administrador del evento <span className="font-mono font-medium" style={{ color: 'var(--color-text)' }}>{tokenModal.slug}</span>. Solo se muestra una vez.
          </p>
          <div className="mb-4">
            <label className="input-label">Token</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={tokenModal.token}
                className="input-field flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn-outline flex items-center gap-1.5"
                onClick={() => { navigator.clipboard.writeText(tokenModal.token); toast.success('Token copiado'); }}
              >
                <Copy className="w-3.5 h-3.5" /> Copiar
              </button>
            </div>
          </div>
          <div className="mb-6">
            <label className="input-label">URL de acceso al admin</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/e/${tokenModal.slug}/admin`}
                className="input-field flex-1 font-mono text-sm"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                className="btn-outline flex items-center gap-1.5"
                onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/e/${tokenModal.slug}/admin`); toast.success('URL copiada'); }}
              >
                <Copy className="w-3.5 h-3.5" /> Copiar
              </button>
            </div>
          </div>
          <button type="button" className="btn-primary w-full justify-center" onClick={() => setTokenModal(null)}>
            Cerrar
          </button>
        </div>
      </div>
    )}

    {/* ── QR Code Modal ── */}
    {showQrFor && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={(e) => { if (e.target === e.currentTarget) setShowQrFor(null); }}
      >
        <div className="card p-6 sm:p-8 text-center" style={{ maxWidth: '340px', width: '100%' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sub text-lg font-medium" style={{ color: 'var(--color-text)' }}>Código QR</h2>
            <button onClick={() => setShowQrFor(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </div>
          <div className="flex justify-center mb-4 p-4 rounded-xl" style={{ background: 'white' }}>
            <QRCodeCanvas
              id="qr-canvas"
              value={`${window.location.origin}${showQrFor === 'default' ? '/' : `/e/${showQrFor}`}`}
              size={192}
              level="M"
              includeMargin
            />
          </div>
          <p className="text-xs font-mono mb-4" style={{ color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>
            {window.location.origin}{showQrFor === 'default' ? '/' : `/e/${showQrFor}`}
          </p>
          <button
            className="btn-primary w-full justify-center"
            onClick={() => {
              const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
              const url = canvas.toDataURL('image/png');
              const a = document.createElement('a');
              a.href = url;
              a.download = `qr-${showQrFor}.png`;
              a.click();
            }}
          >
            <Download className="w-4 h-4" /> Descargar PNG
          </button>
        </div>
      </div>
    )}
    </>
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
    person1_parents:         p1.parents                                ?? '',
    person2_first:           p2.firstName                              ?? sc.couple.person2.firstName,
    person2_last:            p2.lastName                               ?? sc.couple.person2.lastName,
    person2_nick:            p2.nickname                               ?? sc.couple.person2.nickname ?? '',
    person2_parents:         p2.parents                                ?? '',
    display_names:           (couple.displayNames as string)           ?? sc.couple.displayNames ?? '',
    hashtag:                 (couple.hashtag as string)                ?? sc.couple.hashtag ?? '',
    hero_cta_label:          ((sections.hero as Record<string, string> | undefined)?.ctaLabel) ?? '',
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
    ceremony_venue_time:      cv.time                                   ?? '',
    ceremony_venue_dresscode: cv.dresscode                              ?? '',
    reception_venue_time:     rv.time                                   ?? '',
    reception_venue_dresscode:rv.dresscode                              ?? '',
    gift_registry_enabled:    (cfg.gift_registry_enabled as boolean)   ?? true,
    gift_registry_url:        (cfg.gift_registry_url as string)        ?? '',
    gift_registry_label:      (cfg.gift_registry_label as string)      ?? '',
    gift_registry_title:      (cfg.gift_registry_title as string)      ?? '',
    gift_registry_description:(cfg.gift_registry_description as string)?? '',
    gift_bank_enabled:       (cfg.gift_bank_enabled as boolean)        ?? false,
    gift_bank_title:         (cfg.gift_bank_title as string)           ?? 'Obsequio',
    gift_bank_body:          (cfg.gift_bank_body as string)            ?? 'Tu presencia es nuestro mejor regalo. Si aún así querés tener un detalle, te dejamos nuestros datos bancarios:',
    same_venue:              (venues.sameVenue as boolean)             ?? sc.venues.sameVenue ?? false,
    rsvp_enabled:            (rsvpSect.enabled as boolean)             ?? sc.sections.rsvp.enabled,
    rsvp_deadline:           (rsvpSect.deadline as string)             ?? sc.sections.rsvp.deadline ?? '',
    max_guests:              (rsvpSect.maxGuestsPerResponse as number) ?? sc.sections.rsvp.maxGuestsPerResponse ?? 4,
    notification_email:      (cfg.notification_email as string)        ?? '',
    palette:                 (theme.palette as PaletteKey)             ?? sc.theme.palette,
    invitation_mode:               (cfg.invitation_mode as string)               ?? 'generic',
    allow_public_rsvp:             (cfg.allow_public_rsvp as boolean)             ?? true,
    track_invitation_opens:        (cfg.track_invitation_opens as boolean)        ?? true,
    allow_guest_self_edit:         (cfg.allow_guest_self_edit as boolean)         ?? true,
    allow_guest_member_names:      (cfg.allow_guest_member_names as boolean)      ?? false,
    allow_guest_count_change:      (cfg.allow_guest_count_change as boolean)      ?? true,
    rsvp_enforce_pass_limit:       (cfg.rsvp_enforce_pass_limit as boolean)       ?? true,
    show_reserved_passes_message:  (cfg.show_reserved_passes_message as boolean)  ?? true,
    whatsapp_template:             (cfg.whatsapp_template as string)              ?? '',
    // Personalized full-view defaults
    personalized_full_view:           (cfg.personalized_full_view as boolean)          ?? true,
    personalized_hero_badge_enabled:  (cfg.personalized_hero_badge_enabled as boolean) ?? true,
    personalized_hero_badge_label:    (cfg.personalized_hero_badge_label as string)    ?? 'Invitación especial para',
    personalized_greeting_enabled:    (cfg.personalized_greeting_enabled as boolean)   ?? true,
    personalized_greeting_position:   (cfg.personalized_greeting_position as string)   ?? 'after_hero',
    personalized_greeting_title:      (cfg.personalized_greeting_title as string)      ?? 'Tu invitación personal',
    personalized_greeting_body:       (cfg.personalized_greeting_body as string)       ?? 'Con mucho cariño te invitamos a compartir este día especial con nosotros. Nos emociona tenerte presente.',
    personalized_show_passes:         (cfg.personalized_show_passes as boolean)        ?? true,
    personalized_passes_label:        (cfg.personalized_passes_label as string)        ?? 'Hemos reservado {passes} lugar(es) para ti en este evento.',
    personalized_show_type_badge:     (cfg.personalized_show_type_badge as boolean)    ?? true,
  };
}

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Users, CheckCircle, XCircle, BarChart3, Download, Lock,
  Settings, Palette, Upload, Trash2, Plus, ExternalLink,
  Copy, Music2, Calendar, Pencil, QrCode, X, FileText,
  Image as ImageIcon, LogOut, Key, RefreshCw,
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
import type { PaletteKey, EventType, EventInfo, MediaFile, StoryEvent, ScheduleItem, FAQItem, GalleryPhoto, MusicTrack, WeddingPartyMember, Hotel, PartySide } from '../types';

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
  ceremony_venue_time: string;
  ceremony_venue_dresscode: string;
  reception_venue_time: string;
  reception_venue_dresscode: string;
  gift_registry_url: string;
  gift_registry_label: string;
  same_venue: boolean;
  rsvp_enabled: boolean;
  rsvp_deadline: string;
  max_guests: number;
  notification_email: string;
  palette: PaletteKey;
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
}> = {
  boda:        { person1: 'Novio/a 1',        person2: 'Novio/a 2',   displayNames: 'Ej: Concepción & Eumelio',    dateLabel: 'Fecha de la ceremonia',  venueLabel: 'Ceremonia',     singleVenue: false },
  cumpleanos:  { person1: 'El/La Festejado/a', person2: '',           displayNames: 'Ej: Fiesta de Ana',           dateLabel: 'Fecha del evento',        venueLabel: 'Lugar',         singleVenue: true  },
  bautismo:    { person1: 'Nombre del Bebé',   person2: 'Padres',     displayNames: 'Ej: Bautismo de Sofía',       dateLabel: 'Fecha del bautismo',      venueLabel: 'Iglesia/Lugar', singleVenue: false },
  quinceanera: { person1: 'La Quinceañera',    person2: '',           displayNames: 'Ej: Quinceañera de Valeria',  dateLabel: 'Fecha del evento',        venueLabel: 'Salón',         singleVenue: true  },
  graduacion:  { person1: 'El/La Graduado/a',  person2: '',           displayNames: 'Ej: Graduación de Carlos',    dateLabel: 'Fecha de la graduación',  venueLabel: 'Institución',   singleVenue: true  },
  corporativo:       { person1: 'Empresa/Org.',      person2: 'Contacto',   displayNames: 'Ej: Congreso Tecnopowerpy',     dateLabel: 'Fecha del evento',          venueLabel: 'Sede',          singleVenue: true  },
  'primera-comunion':{ person1: 'El/La Comulgante', person2: 'Padres',     displayNames: 'Ej: Primera Comunión de Lucía', dateLabel: 'Fecha del sacramento',      venueLabel: 'Iglesia/Lugar', singleVenue: false },
  aniversario:       { person1: 'Persona 1',         person2: 'Persona 2', displayNames: 'Ej: Aniversario de Bodas',      dateLabel: 'Fecha del aniversario',     venueLabel: 'Lugar',         singleVenue: true  },
  'baby-shower':     { person1: 'Nombre del Bebé',   person2: 'Mamá',      displayNames: 'Ej: Baby Shower de Valentina', dateLabel: 'Fecha del evento',          venueLabel: 'Lugar',         singleVenue: true  },
};

type Tab = 'dashboard' | 'rsvps' | 'config' | 'tema' | 'media' | 'eventos' | 'secciones';

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

  // Music extras
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [musicAutoplay, setMusicAutoplay] = useState(false);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newYoutubeTitle, setNewYoutubeTitle] = useState('');
  const [newYoutubeArtist, setNewYoutubeArtist] = useState('');

  // Duplicate event modal
  const [duplicatingSlug, setDuplicatingSlug] = useState<string | null>(null);
  const [dupName, setDupName] = useState('');
  const [dupSlug, setDupSlug] = useState('');
  const [dupToken, setDupToken] = useState('');
  const [savingDup, setSavingDup] = useState(false);

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
            time: formData.ceremony_venue_time || undefined,
            dresscode: formData.ceremony_venue_dresscode || undefined,
          },
          reception: {
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
        theme: { palette: formData.palette },
        sections: {
          ...(eventCfg.sections as object ?? {}),
          rsvp: {
            ...((eventCfg.sections as Record<string, unknown>)?.rsvp as object ?? {}),
            enabled: formData.rsvp_enabled,
            deadline: formData.rsvp_deadline,
            maxGuestsPerResponse: Number(formData.max_guests),
          },
        },
        notification_email: formData.notification_email || undefined,
        gift_registry_url: formData.gift_registry_url || undefined,
        gift_registry_label: formData.gift_registry_label || undefined,
      } as never);
      toast.success('Configuración guardada correctamente');
      const cfgRes = await rsvpApi.getEventConfig(eventSlug);
      const updatedCfg = cfgRes.data as unknown as Record<string, unknown>;
      setEventCfg(updatedCfg);
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

  const saveSections = async () => {
    setSavingSections(true);
    try {
      const current = eventCfg as Record<string, unknown>;
      const sects = (current.sections as Record<string, unknown> | undefined) ?? {};
      const updated = {
        ...current,
        sections: {
          ...sects,
          hero:         { ...(sects.hero         as object ?? {}), enabled: heroEnabled,     subtitle: heroSubtitle || undefined,    backgroundImage: heroBgImage || undefined, overlayOpacity: heroOverlay, showScrollIndicator: heroScrollIndicator },
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
            { key: 'dashboard', label: 'Inicio',          icon: BarChart3  },
            { key: 'rsvps',     label: 'RSVPs',          icon: Users      },
            { key: 'config',    label: 'Configuración',  icon: Settings   },
            { key: 'tema',      label: 'Tema',           icon: Palette    },
            { key: 'media',     label: 'Media',          icon: Upload     },
            { key: 'eventos',   label: 'Eventos',        icon: Calendar   },
            { key: 'secciones', label: 'Secciones',      icon: FileText   },
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

            {/* Gift Registry */}
            <div className="card p-6 sm:p-8">
              <h2 className="font-sub text-lg font-medium mb-5" style={{ color: 'var(--color-text)' }}>Mesa de Regalos (opcional)</h2>
              <div className="space-y-4">
                <div>
                  <label className="input-label">URL de la mesa de regalos</label>
                  <input {...register('gift_registry_url')} type="url" className="input-field" placeholder="https://mesaderegalos.liverpool.com.mx/..." />
                  <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    Si lo dejas vacío, la sección no se mostrará.
                  </p>
                </div>
                <div>
                  <label className="input-label">Texto del botón (opcional)</label>
                  <input {...register('gift_registry_label')} className="input-field" placeholder="Ver lista de regalos" />
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
                                onClick={() => { setSelectedPalette(key); applyTheme(key); }}
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
                  <label className="input-label">Subtítulo (sobre los nombres)</label>
                  <input value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} className="input-field" placeholder="Ej: Juntos para siempre" />
                </div>
                <div>
                  <label className="input-label">Opacidad del overlay ({heroOverlay.toFixed(2)})</label>
                  <input type="range" min={0} max={1} step={0.05} value={heroOverlay} onChange={(e) => setHeroOverlay(Number(e.target.value))} className="w-full mt-2 accent-primary" />
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
                <div className="space-y-2 mb-4">
                  {musicTracks.map((track, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-secondary)' }}>
                      <Music2 className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-body font-medium truncate" style={{ color: 'var(--color-text)' }}>{track.title}</p>
                        {track.artist && <p className="text-xs text-muted">{track.artist}</p>}
                      </div>
                      <button type="button" onClick={() => removeTrackFromPlayer(track.url)} className="p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  ))}
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

            {/* Save */}
            <div className="flex justify-end">
              <button type="button" onClick={saveSections} disabled={savingSections} className="btn-primary px-8">
                {savingSections ? 'Guardando…' : 'Guardar secciones'}
              </button>
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
    ceremony_venue_time:      cv.time                                   ?? '',
    ceremony_venue_dresscode: cv.dresscode                              ?? '',
    reception_venue_time:     rv.time                                   ?? '',
    reception_venue_dresscode:rv.dresscode                              ?? '',
    gift_registry_url:        (cfg.gift_registry_url as string)        ?? '',
    gift_registry_label:      (cfg.gift_registry_label as string)      ?? '',
    same_venue:              (venues.sameVenue as boolean)             ?? sc.venues.sameVenue ?? false,
    rsvp_enabled:            (rsvpSect.enabled as boolean)             ?? sc.sections.rsvp.enabled,
    rsvp_deadline:           (rsvpSect.deadline as string)             ?? sc.sections.rsvp.deadline ?? '',
    max_guests:              (rsvpSect.maxGuestsPerResponse as number) ?? sc.sections.rsvp.maxGuestsPerResponse ?? 4,
    notification_email:      (cfg.notification_email as string)        ?? '',
    palette:                 (theme.palette as PaletteKey)             ?? sc.theme.palette,
  };
}

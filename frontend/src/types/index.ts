// ============================================================
// WEDDING INVITATION — Type Definitions
// ============================================================

export type Language = 'es' | 'en';
export type PaletteKey = 'rose-gold' | 'garden' | 'nature' | 'navy-gold' | 'sage' | 'midnight' | 'platinum' | 'sapphire' | 'emerald' | 'coral' | 'lavender' | 'teal' | 'burgundy' | 'gold-premium' | 'ocean' | 'mint' | 'peach' | 'denim' | 'mustard' | 'cream' | 'olive' | 'custom';
export type InvitationSkin = 'classic' | 'envelope';
export type EventType = 'boda' | 'cumpleanos' | 'bautismo' | 'quinceanera' | 'graduacion' | 'corporativo' | 'primera-comunion' | 'aniversario' | 'baby-shower';
export type PartySide = 'bride' | 'groom' | 'both';
export type ScheduleLocation = 'ceremony' | 'reception' | 'other';

export interface Person {
  firstName: string;
  lastName: string;
  nickname?: string;
  photo?: string;
  parents?: string;
}

export interface Couple {
  person1: Person;
  person2: Person;
  displayNames?: string;
  hashtag?: string;
}

export interface WeddingDates {
  ceremony: string;
  reception?: string;
  timezone: string;
  displayDate?: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  country: string;
  mapsUrl: string;
  photo?: string;
  time?: string;
  dresscode?: string;
  notes?: string;
  phone?: string;
  website?: string;
}

export interface ThemeConfig {
  palette: PaletteKey;
  language: Language;
  fonts: {
    heading: string;
    subheading: string;
    body: string;
  };
  customColors?: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
}

export interface StoryEvent {
  date: string;
  title: string;
  description: string;
  photo?: string;
}

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  location?: ScheduleLocation;
}

export interface WeddingPartyMember {
  name: string;
  role: string;
  photo?: string;
  description?: string;
  side: PartySide;
}

export interface GalleryPhoto {
  url: string;
  alt?: string;
  caption?: string;
}

export interface Hotel {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  priceRange?: string;
  notes?: string;
  stars?: number;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MusicTrack {
  title: string;
  artist: string;
  url: string;
}

// ---- Section Configs ----

export interface HeroSection {
  enabled: boolean;
  backgroundImage?: string;
  backgroundVideo?: string;
  overlayOpacity?: number;
  showScrollIndicator?: boolean;
  subtitle?: string;
  ctaLabel?: string;
}

export interface CountdownSection {
  enabled: boolean;
  label?: string;
}

export interface OurStorySection {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  events: StoryEvent[];
}

export interface ScheduleSection {
  enabled: boolean;
  title?: string;
  items: ScheduleItem[];
}

export interface WeddingPartySection {
  enabled: boolean;
  title?: string;
  members: WeddingPartyMember[];
}

export interface GallerySection {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  photos: GalleryPhoto[];
}

export interface AccommodationSection {
  enabled: boolean;
  title?: string;
  hotels: Hotel[];
}

export interface FAQSection {
  enabled: boolean;
  title?: string;
  items: FAQItem[];
}

export interface RSVPSection {
  enabled: boolean;
  title?: string;
  subtitle?: string;
  deadline?: string;
  maxGuestsPerResponse?: number;
  allowPlusOne?: boolean;
  allowDietaryRestrictions?: boolean;
  allowSongRequest?: boolean;
  allowMessage?: boolean;
  confirmationMessage?: string;
}

export interface FooterSection {
  enabled: boolean;
  message?: string;
  credits?: string;
}

// ---- Root Config ----

export interface WeddingConfig {
  couple: Couple;
  dates: WeddingDates;
  venues: {
    ceremony: Venue;
    reception: Venue;
    sameVenue?: boolean;
  };
  theme: ThemeConfig;
  sections: {
    hero: HeroSection;
    countdown: CountdownSection;
    ourStory: OurStorySection;
    schedule: ScheduleSection;
    weddingParty: WeddingPartySection;
    gallery: GallerySection;
    accommodation: AccommodationSection;
    faq: FAQSection;
    rsvp: RSVPSection;
    footer: FooterSection;
  };
  music?: {
    enabled: boolean;
    autoplay: boolean;
    tracks: MusicTrack[];
  };
  social?: {
    hashtag?: string;
    instagram?: string;
  };
  venuesTitle?: string;
  gift_registry_enabled?: boolean;
  gift_registry_url?: string;
  gift_registry_label?: string;
  gift_registry_title?: string;
  gift_registry_description?: string;
  // ── Bank transfer gift section ────────────────────────────────────────────
  gift_bank_enabled?: boolean;
  gift_bank_title?: string;
  gift_bank_body?: string;
  gift_bank_accounts?: Array<{ label: string; value: string }>;
  // Invitation mode settings (stored in config_json)
  invitation_mode?: InvitationMode;
  allow_public_rsvp?: boolean;
  require_invitation_token_for_rsvp?: boolean;
  track_invitation_opens?: boolean;
  allow_guest_self_edit?: boolean;
  allow_guest_member_names?: boolean;
  allow_guest_count_change?: boolean;
  rsvp_enforce_pass_limit?: boolean;
  show_reserved_passes_message?: boolean;
  whatsapp_template?: string;
  // ── Personalized full-view integration ────────────────────────────────────
  personalized_full_view?: boolean;
  personalized_hero_badge_enabled?: boolean;
  personalized_hero_badge_label?: string;
  personalized_greeting_enabled?: boolean;
  personalized_greeting_position?: 'top' | 'after_hero' | 'after_countdown' | 'after_story';
  personalized_greeting_title?: string;
  personalized_greeting_body?: string;
  personalized_show_passes?: boolean;
  personalized_passes_label?: string;
  personalized_show_type_badge?: boolean;
  personalized_show_countdown?: boolean;
  personalized_countdown_label?: string;
  // ── Conditional flag metadata (fully parametrized) ────────────────────────
  conditional_flag_meta?: Record<string, { title: string; body: string; icon?: string }>;
  // ── RSVP personalized step labels ────────────────────────────────────────
  personalized_rsvp_step1_title?: string;
  personalized_rsvp_step2_attending_title?: string;
  personalized_rsvp_step2_declined_title?: string;
  personalized_rsvp_step2_declined_body?: string;
  personalized_rsvp_step3_title?: string;
  personalized_rsvp_confirmed_title?: string;
  personalized_rsvp_confirmed_body_attending?: string;
  personalized_rsvp_confirmed_body_declined?: string;
  // ── Invitation skin ────────────────────────────────────────────────────────
  invitation_skin?: InvitationSkin;
  // ── Envelope skin: EnvelopeHero section ───────────────────────────────────
  envelope_opening_text?: string;
  envelope_tap_label?: string;
  // ── Envelope skin: CollageHero section ────────────────────────────────────
  collage_countdown_label?: string;
  collage_subtitle?: string;
  collage_monogram_separator?: string;
  // ── Envelope skin: Venues section labels ──────────────────────────────────
  venues_ceremony_label?: string;
  venues_reception_label?: string;
  venues_ceremony_icon?: string;
  venues_reception_icon?: string;
  // ── Envelope skin: DressCode section ──────────────────────────────────────
  dress_code_enabled?: boolean;
  dress_code_title?: string;
  dress_code_value?: string;
  // ── Envelope skin: GalleryPolaroid section ─────────────────────────────────
  gallery_polaroid_enabled?: boolean;
  gallery_polaroid_footer_text?: string;
  gallery_polaroid_bw?: boolean;
}

// ---- Event Config (dynamic, stored in DB) ----

export interface EventConfig {
  event_type: EventType;
  couple: Couple;
  dates: WeddingDates;
  venues: {
    ceremony: Venue;
    reception: Venue;
    sameVenue?: boolean;
  };
  theme: {
    palette: PaletteKey;
    customColors?: WeddingConfig['theme']['customColors'];
  };
  sections: Partial<WeddingConfig['sections']>;
  social?: WeddingConfig['social'];
  music?: WeddingConfig['music'];
  notification_email?: string;
  gift_registry_enabled?: boolean;
  gift_registry_url?: string;
  gift_registry_label?: string;
  gift_registry_title?: string;
  gift_registry_description?: string;
}

// ---- Multi-tenancy ----

export interface EventInfo {
  id: number;
  slug: string;
  name: string;
  admin_token?: string | null;
  created_at: string;
}

export interface MediaFile {
  id: number;
  event_slug: string;
  filename: string;
  original_filename: string;
  file_type: 'image' | 'audio';
  mime_type: string;
  size: number;
  url: string;
  uploaded_at: string;
}

// ---- Guest / Personalized Invitations ----

export type GuestType = 'general' | 'family' | 'vip' | 'staff';
export type InvitationStatus = 'draft' | 'pending' | 'sent' | 'opened' | 'confirmed' | 'declined' | 'partial' | 'blocked' | 'expired';
export type InvitationMode = 'generic' | 'personalized' | 'hybrid';

export interface GuestMember {
  id?: number;
  invitation_id?: number;
  full_name: string;
  member_type: 'adult' | 'child' | 'infant';
  age_group?: string;
  menu_preference?: string;
  dietary_restrictions?: string;
  attending?: boolean | null;
  notes?: string;
}

export interface GuestInvitation {
  id: number;
  event_slug: string;
  display_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  group_name?: string;
  guest_type: GuestType;
  status: InvitationStatus;
  allowed_passes: number;
  confirmed_passes: number;
  declined_passes: number;
  token_lookup: string;
  invitation_url?: string;
  notes?: string;
  tags: string[];
  conditional_flags: string[];
  first_opened_at?: string;
  last_opened_at?: string;
  open_count: number;
  last_rsvp_at?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  blocked_reason?: string;
}

export interface GuestInvitationCreate {
  display_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  group_name?: string;
  guest_type?: GuestType;
  allowed_passes: number;
  notes?: string;
  tags?: string[];
  conditional_flags?: string[];
}

export interface GuestStats {
  total_invitations: number;
  total_passes: number;
  confirmed_passes: number;
  declined_passes: number;
  pending_passes: number;
  opened: number;
  not_opened: number;
  status_counts: Record<InvitationStatus, number>;
  open_rate: number;
  confirmation_rate: number;
}

export interface PersonalizedInvitationData {
  event_config: Record<string, unknown>;
  invitation: {
    display_name: string;
    allowed_passes: number;
    confirmed_passes: number;
    status: InvitationStatus;
    guest_type: GuestType;
    conditional_flags: string[];
    event_slug: string;
  };
  members: GuestMember[];
  rsvp_status: string | null;
  already_responded: boolean;
}

export interface PersonalizedRSVPPayload {
  attending: boolean;
  guest_count: number;
  members?: Array<{ full_name: string; dietary_restrictions?: string; menu_preference?: string }>;
  dietary_restrictions?: string;
  song_request?: string;
  message?: string;
  source: 'personalized';
}

export interface CSVImportPreview {
  valid_rows: Array<Record<string, string>>;
  error_rows: Array<{ row: number; data: Record<string, string>; errors: string[] }>;
  total: number;
  valid_count: number;
  error_count: number;
}

export interface InvitationAuditEntry {
  id: number;
  action: string;
  entity_type: string;
  before_json?: string;
  after_json?: string;
  performed_at: string;
  performed_by_type: string;
  performed_by_ref?: string;
}

// ---- RSVP Form ----

export interface RSVPFormData {
  name: string;
  email: string;
  attending: 'yes' | 'no';
  guestCount?: number;
  plusOneName?: string;
  dietaryRestrictions?: string;
  songRequest?: string;
  message?: string;
}

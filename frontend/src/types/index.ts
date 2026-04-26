// ============================================================
// WEDDING INVITATION — Type Definitions
// ============================================================

export type Language = 'es' | 'en';
export type PaletteKey = 'rose-gold' | 'garden' | 'nature' | 'navy-gold' | 'sage' | 'midnight' | 'platinum' | 'sapphire' | 'emerald' | 'coral' | 'lavender' | 'teal' | 'burgundy' | 'gold-premium' | 'ocean' | 'mint' | 'peach' | 'denim' | 'mustard' | 'cream' | 'custom';
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
  gift_registry_url?: string;
  gift_registry_label?: string;
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
  gift_registry_url?: string;
  gift_registry_label?: string;
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

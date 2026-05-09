// ============================================================
//  CONFIGURACIÓN CENTRAL DE LA BODA
//  Edita este archivo para personalizar TODA la invitación.
//  Cada sección puede habilitarse/deshabilitarse con `enabled`.
// ============================================================

import type { WeddingConfig } from '../types';

export const config: WeddingConfig = {

  // ──────────────────────────────────────────────────────────
  //  1. LA PAREJA
  // ──────────────────────────────────────────────────────────
  couple: {
    person1: {
      firstName: 'Concepción',
      lastName: 'Davila',
      nickname: 'Conchi',
    },
    person2: {
      firstName: 'Eumelio',
      lastName: 'Dávalos',
      nickname: 'Eumelio',
    },
    displayNames: 'Concepción & Eumelio',
    hashtag: '#ConcepciónYEumelio2026',
  },

  // ──────────────────────────────────────────────────────────
  //  2. FECHAS
  //  ceremony: ISO datetime (YYYY-MM-DDTHH:mm:ss)
  //  timezone: IANA timezone (America/Bogota, America/New_York, etc.)
  // ──────────────────────────────────────────────────────────
  dates: {
    ceremony: '2026-06-07T16:00:00',
    reception: '2026-06-07T19:00:00',
    timezone: 'America/Asuncion',
    displayDate: 'Domingo, 7 de Junio de 2026',
  },

  // ──────────────────────────────────────────────────────────
  //  3. RECINTOS
  // ──────────────────────────────────────────────────────────
  venues: {
    ceremony: {
      name: 'Iglesia San Pedro Claver',
      address: 'Plaza de San Pedro Claver, Carrera 4 #30-01',
      city: 'Carapeguá',
      country: 'Paraguay',
      mapsUrl: 'https://maps.google.com/?q=Carapegua+Paraguay',
      photo: '/uploads/default/ceremony-venue.jpg',
      time: '4:00 PM',
      dresscode: 'Formal',
      notes: 'Por favor llegar 30 minutos antes de la ceremonia.',
    },
    reception: {
      name: 'Club de Pesca',
      address: 'Manga, Carrera 1a #24-29',
      city: 'Carapeguá',
      country: 'Paraguay',
      mapsUrl: 'https://maps.google.com/?q=Carapegua+Paraguay',
      photo: '/uploads/default/reception-venue.jpg',
      time: '7:00 PM',
      dresscode: 'Formal',
      notes: 'Transporte disponible desde la iglesia.',
    },
    sameVenue: false,
  },

  // ──────────────────────────────────────────────────────────
  //  4. TEMA VISUAL
  //  palette: 'rose-gold' | 'garden' | 'navy-gold' | 'sage' | 'midnight' | 'custom'
  //  language: 'es' | 'en'
  // ──────────────────────────────────────────────────────────
  theme: {
    palette: 'nature',
    language: 'es',
    fonts: {
      heading: 'Cormorant Garamond',
      subheading: 'Playfair Display',
      body: 'Jost',
    },
  },

  // ──────────────────────────────────────────────────────────
  //  5. SECCIONES
  // ──────────────────────────────────────────────────────────
  sections: {

    // ---- HERO ----
    hero: {
      enabled: true,
      backgroundImage: '/uploads/default/hero.jpg',
      overlayOpacity: 0.45,
      showScrollIndicator: true,
      subtitle: 'Tienen el honor de invitarlos a su matrimonio',
    },

    // ---- CUENTA REGRESIVA ----
    countdown: {
      enabled: true,
      label: 'Faltan para el gran día',
    },

    // ---- NUESTRA HISTORIA ----
    ourStory: {
      enabled: true,
      title: 'Nuestra Historia',
      subtitle: 'El camino que nos llevó hasta aquí',
      events: [
        {
          date: '14 de Febrero, 2021',
          title: 'El Primer Encuentro',
          description:
            'Nos conocimos en una galería de arte en el centro histórico de Bogotá. Una mirada cruzada entre cuadros fue suficiente para comenzar una conversación que nunca ha terminado.',
          photo: '/uploads/default/story-1.jpg',
        },
        {
          date: 'Junio, 2021',
          title: 'Nuestra Primera Aventura',
          description:
            'Un viaje improvisado a la Sierra Nevada nos enseñó todo lo que necesitábamos saber el uno del otro. Compartir un amanecer en las montañas fue el inicio de todo.',
          photo: '/uploads/default/story-2.jpg',
        },
        {
          date: 'Diciembre, 2023',
          title: 'La Propuesta',
          description:
            'Bajo las estrellas en la bahía de Cartagena, con la ciudad amurallada como testigo, Eumelio le preguntó a Concepción lo que cambiaría sus vidas para siempre.',
          photo: '/uploads/default/story-3.jpg',
        },
        {
          date: 'Diciembre, 2026',
          title: 'El Gran Día',
          description:
            '¡Finalmente! Con el corazón lleno de amor y gratitud, nos convertiremos en familia. Queremos que sean parte de este momento tan especial.',
          photo: '/uploads/default/story-4.jpg',
        },
      ],
    },

    // ---- ITINERARIO ----
    schedule: {
      enabled: true,
      title: 'Itinerario del Día',
      items: [
        { time: '3:30 PM', title: 'Recepción de invitados', description: 'Bienvenida en los jardines de la iglesia', location: 'ceremony' },
        { time: '4:00 PM', title: 'Ceremonia religiosa', description: 'Iglesia San Pedro Claver', location: 'ceremony' },
        { time: '5:30 PM', title: 'Traslado', description: 'Transporte provisto para todos los invitados', location: 'other' },
        { time: '6:00 PM', title: 'Cóctel de bienvenida', description: 'Terraza con vista a la bahía', location: 'reception' },
        { time: '7:30 PM', title: 'Cena de gala', description: 'Menú de gala y brindis', location: 'reception' },
        { time: '9:00 PM', title: 'Baile y celebración', description: '¡A bailar toda la noche!', location: 'reception' },
        { time: '11:30 PM', title: 'Corte de torta', description: 'El momento más dulce de la noche', location: 'reception' },
      ],
    },

    // ---- CORTEJO ----
    weddingParty: {
      enabled: true,
      title: 'Quienes Nos Acompañan',
      members: [
        { name: 'Valentina Ramos', role: 'Madrina de Honor', side: 'bride', photo: '/uploads/default/party-1.jpg' },
        { name: 'Sofía Castro', role: 'Dama de Honor', side: 'bride', photo: '/uploads/default/party-2.jpg' },
        { name: 'Isabela Torres', role: 'Dama de Honor', side: 'bride', photo: '/uploads/default/party-3.jpg' },
        { name: 'Santiago Pérez', role: 'Padrino de Honor', side: 'groom', photo: '/uploads/default/party-4.jpg' },
        { name: 'Andrés Mora', role: 'Caballero de Honor', side: 'groom', photo: '/uploads/default/party-5.jpg' },
        { name: 'Felipe Vargas', role: 'Caballero de Honor', side: 'groom', photo: '/uploads/default/party-6.jpg' },
      ],
    },

    // ---- GALERÍA ----
    gallery: {
      enabled: true,
      title: 'Nuestra Galería',
      subtitle: 'Momentos que atesoramos juntos',
      photos: [
        { url: '/uploads/default/gallery-1.jpg', alt: 'Concepción y Eumelio' },
        { url: '/uploads/default/gallery-2.jpg', alt: 'Paseo por la ciudad amurallada' },
        { url: '/uploads/default/gallery-3.jpg', alt: 'Atardecer en la bahía' },
        { url: '/uploads/default/gallery-4.jpg', alt: 'Juntos en la Sierra Nevada' },
        { url: '/uploads/default/gallery-5.jpg', alt: 'La propuesta' },
        { url: '/uploads/default/gallery-6.jpg', alt: 'Celebración del compromiso' },
        { url: '/uploads/default/gallery-7.jpg', alt: 'Nuestra primera aventura' },
        { url: '/uploads/default/gallery-8.jpg', alt: 'Amor en cada mirada' },
      ],
    },

    // ---- ALOJAMIENTO ----
    accommodation: {
      enabled: true,
      title: 'Dónde Hospedarse',
      hotels: [
        {
          name: 'Hotel Sofitel Legend Santa Clara',
          address: 'Calle del Torno #39-29, Centro Histórico',
          phone: '+57 5 650-4700',
          website: 'https://sofitel.accor.com',
          priceRange: '$250 – $450 USD / noche',
          notes: 'Usa el código BODAAC2026 para 15% de descuento.',
          stars: 5,
        },
        {
          name: 'Hotel Dann Cartagena',
          address: 'Av. San Martín #4-195, Bocagrande',
          phone: '+57 5 650-0500',
          website: 'https://hoteldann.com',
          priceRange: '$120 – $200 USD / noche',
          stars: 4,
        },
        {
          name: 'Casa Bocagrande Boutique',
          address: 'Carrera 3 #5-12, Bocagrande',
          phone: '+57 300 123-4567',
          priceRange: '$80 – $140 USD / noche',
          stars: 3,
        },
      ],
    },

    // ---- PREGUNTAS FRECUENTES ----
    faq: {
      enabled: true,
      title: 'Preguntas Frecuentes',
      items: [
        {
          question: '¿Cuál es el dress code?',
          answer:
            'La celebración es de etiqueta formal. Caballeros: traje oscuro o smoking. Damas: vestido largo o de cóctel elegante. Por favor eviten el blanco y el beige claro.',
        },
        {
          question: '¿Hay parqueadero disponible?',
          answer:
            'La iglesia tiene parqueadero cercano. En el Club de Pesca hay parqueadero privado para invitados. Se habilitará servicio de valet parking.',
        },
        {
          question: '¿Puedo llevar niños?',
          answer:
            'Esta celebración está diseñada para adultos. Agradecemos su comprensión y esperamos que disfruten de una noche especial.',
        },
        {
          question: '¿Habrá transporte entre los recintos?',
          answer:
            'Sí. Contaremos con servicio de transporte desde la iglesia al Club de Pesca inmediatamente después de la ceremonia.',
        },
        {
          question: '¿Cuándo debo confirmar mi asistencia?',
          answer:
            'Te pedimos confirmar antes del 1 de noviembre de 2026 a través del formulario RSVP en esta página.',
        },
        {
          question: '¿Puedo hacer solicitudes musicales?',
          answer:
            '¡Por supuesto! En el formulario RSVP encontrarás un campo para sugerir canciones. Haremos todo lo posible por incluirlas.',
        },
        {
          question: '¿Hay opciones vegetarianas / veganas en el menú?',
          answer:
            'Sí. Al confirmar tu asistencia puedes indicar tu restricción dietética y nos aseguraremos de que estés bien atendido.',
        },
      ],
    },

    // ---- RSVP ----
    rsvp: {
      enabled: true,
      title: 'Confirma tu Asistencia',
      subtitle: 'Tu presencia es el mejor regalo que nos pueden dar',
      deadline: '2026-11-01',
      maxGuestsPerResponse: 4,
      allowPlusOne: true,
      allowDietaryRestrictions: true,
      allowSongRequest: true,
      allowMessage: true,
      confirmationMessage:
        '¡Gracias! Tu asistencia ha sido confirmada. ¡Nos vemos el 5 de diciembre!',
    },

    // ---- FOOTER ----
    footer: {
      enabled: true,
      message: 'Con todo nuestro amor,',
      credits: 'Concepción & Eumelio · Diciembre 2026',
    },
  },

  gift_registry_enabled: true,

  // ── Bank / datos bancarios (alternativa sin mesa de regalos externa) ──────
  gift_bank_enabled: false,
  gift_bank_title: 'Obsequio',
  gift_bank_body: 'Tu presencia es nuestro mejor regalo. Si aún así querés tener un detalle, te dejamos nuestros datos bancarios:',
  gift_bank_accounts: [] as Array<{ label: string; value: string }>,

  // ──────────────────────────────────────────────────────────
  //  6. MÚSICA  (agrega archivos en /public/music/)
  // ──────────────────────────────────────────────────────────
  music: {
    enabled: true,
    autoplay: false,
    tracks: [
      { title: 'Nuestra Canción', artist: 'YouTube', url: 'https://www.youtube.com/watch?v=zqlkbbJ003w' },
      { title: "Can't Help Falling in Love", artist: 'Elvis Presley', url: '/music/cant-help.mp3' },
      { title: 'A Thousand Years', artist: 'Christina Perri', url: '/music/thousand-years.mp3' },
    ],
  },

  // ──────────────────────────────────────────────────────────
  //  7. REDES SOCIALES
  // ──────────────────────────────────────────────────────────
  social: {
    hashtag: '#ConcepciónYEumelio2026',
  },

  // ──────────────────────────────────────────────────────────
  //  8. INVITACIÓN PERSONALIZADA — VISTA COMPLETA
  //  Controla cómo se integran los datos del invitado con la
  //  invitación principal cuando se accede via /i/:token
  // ──────────────────────────────────────────────────────────
  personalized_full_view: true,
  personalized_hero_badge_enabled: true,
  personalized_hero_badge_label: 'Invitación especial para',
  personalized_greeting_enabled: true,
  personalized_greeting_position: 'after_hero' as const,
  personalized_greeting_title: 'Tu invitación personal',
  personalized_greeting_body: 'Con mucho cariño te invitamos a compartir este día especial con nosotros. Nos emociona tenerte presente.',
  personalized_show_passes: true,
  personalized_passes_label: 'Hemos reservado {passes} lugar(es) especialmente para ti.',
  personalized_show_type_badge: true,
  personalized_show_countdown: true,
  personalized_countdown_label: 'Faltan {days} días para el gran día',

  // ── Metadatos de flags condicionales (100% parametrizable desde admin) ─────
  conditional_flag_meta: {
    after_party: {
      title: 'After Party',
      body: 'Estás invitado/a a continuar la celebración. Confirma tu asistencia en el formulario de RSVP.',
    },
    transporte: {
      title: 'Transporte incluido',
      body: 'Hemos coordinado transporte especial para ti. Los detalles llegarán próximamente.',
    },
    hospedaje_vip: {
      title: 'Hospedaje VIP',
      body: 'Tu alojamiento ha sido coordinado para el evento. Recibirás información detallada por separado.',
    },
    cena_ensayo: {
      title: 'Cena de Ensayo',
      body: 'Estás invitado/a a la cena de ensayo la noche anterior al evento. Los detalles se confirmarán pronto.',
    },
    mesa_principal: {
      title: 'Mesa Principal',
      body: 'Tienes un lugar reservado en la mesa principal junto a los organizadores del evento.',
    },
    discurso: {
      title: 'Discurso',
      body: 'Hemos pensado en ti para compartir unas palabras en el evento. Por favor confírmanos.',
    },
  },

  // ── Etiquetas del RSVP personalizado (100% configurables desde admin) ──────
  personalized_rsvp_step1_title: '¿Podrás acompañarnos?',
  personalized_rsvp_step2_attending_title: 'Cuéntanos más',
  personalized_rsvp_step2_declined_title: 'Lo entendemos',
  personalized_rsvp_step2_declined_body:
    'Gracias por avisarnos. Aunque no puedas estar físicamente, te tendremos presente en nuestro día.',
  personalized_rsvp_step3_title: 'Un último detalle',
  personalized_rsvp_confirmed_title: '¡Gracias por confirmar!',
  personalized_rsvp_confirmed_body_attending: '¡Nos emociona mucho verte en este día tan especial!',
  personalized_rsvp_confirmed_body_declined:
    'Lamentamos que no puedas estar, pero te tendremos muy presente.',

  // ──────────────────────────────────────────────────────────
  //  9. SKIN DE INVITACIÓN
  //  'classic' = secciones clásicas (Hero, Countdown, OurStory, etc.)
  //  'envelope' = skin GoParty (sobre animado, cards flotantes, fondo olive)
  //  'paper-access' = skin papel/editorial mobile-first con acceso personalizado
  // ──────────────────────────────────────────────────────────
  invitation_skin: 'classic' as const,

  // ── Envelope skin: sobre animado ──────────────────────────
  envelope_opening_text: 'Empieza una nueva etapa en nuestras vidas',
  envelope_tap_label: 'Tocá aquí',

  // ── Envelope skin: collage de cards ───────────────────────
  collage_countdown_label: 'Sólo Faltan',
  collage_subtitle: 'Nuestra Boda',
  collage_monogram_separator: '|',

  // ── Envelope skin: etiquetas de venues ────────────────────
  venues_ceremony_label: 'Misa',
  venues_reception_label: 'Brindis',
  venues_ceremony_icon: 'church',
  venues_reception_icon: 'champagne',

  // ── Envelope skin: código de vestimenta ───────────────────
  dress_code_enabled: true,
  dress_code_title: 'Código de Vestimenta',
  dress_code_value: 'Formal',

  // ── Envelope skin: galería polaroid ───────────────────────
  gallery_polaroid_enabled: true,
  gallery_polaroid_footer_text: 'Te Esperamos',
  gallery_polaroid_bw: true,

  // ── Paper Access skin: textos y controles 100% configurables ─────────────
  paper_access_intro_label: 'Invitacion digital',
  paper_access_intro_text: 'Abre nuestra invitacion',
  paper_access_tap_label: 'Toca aqui',
  paper_access_guest_label: 'Invitacion especial para',
  paper_access_passes_label: 'Hemos reservado {passes} cupo(s) para ti.',
  paper_floral_decor_enabled: true,
  paper_floral_decor_style: 'green-pinocchio-white-roses',
  paper_floral_decor_density: 'balanced',
  paper_floral_decor_opacity: 0.62,
  paper_music_card_enabled: true,
  paper_music_prompt: 'Dale play para escuchar nuestra cancion',
  paper_music_button_label: 'Reproducir musica',
  paper_parents_intro: 'En compania de nuestras familias',
  paper_calendar_title: 'Anadelo a tu calendario',
  paper_calendar_button_label: 'Agregar al calendario',
  paper_venues_title: 'Detalles del evento',
  paper_location_button_label: 'Ubicacion',
  paper_gift_intro: 'Su compania es lo mas importante.',
  paper_countdown_title: 'Faltan',
  paper_countdown_subtitle: 'Para nuestro gran dia',
  paper_countdown_days_label: 'Dias',
  paper_countdown_hours_label: 'Horas',
  paper_countdown_minutes_label: 'Minutos',
  paper_rsvp_title: 'Confirmar asistencia',
};

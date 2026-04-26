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
      parents: 'Padre de Concepción & Madre de Concepción',
    },
    person2: {
      firstName: 'Eumelio',
      lastName: 'Dávalos',
      nickname: 'Eumelio',
      parents: 'Padre de Eumelio & Madre de Eumelio',
    },
    displayNames: 'Concepción & Eumelio',
    hashtag: '#ConcepcionYEumelio2026',
  },

  // ──────────────────────────────────────────────────────────
  //  2. FECHAS
  //  ceremony: ISO datetime (YYYY-MM-DDTHH:mm:ss)
  //  timezone: IANA timezone (America/Bogota, America/New_York, etc.)
  // ──────────────────────────────────────────────────────────
  dates: {
    ceremony: '2026-12-05T16:00:00',
    reception: '2026-12-05T19:00:00',
    timezone: 'America/Bogota',
    displayDate: 'Sábado, 5 de Diciembre de 2026',
  },

  // ──────────────────────────────────────────────────────────
  //  3. RECINTOS
  // ──────────────────────────────────────────────────────────
  venues: {
    ceremony: {
      name: 'Iglesia San Pedro Claver',
      address: 'Plaza de San Pedro Claver, Carrera 4 #30-01',
      city: 'Cartagena de Indias',
      country: 'Colombia',
      mapsUrl: 'https://maps.google.com/?q=Iglesia+San+Pedro+Claver+Cartagena',
      photo: '/uploads/default/ceremony-venue.jpg',
      time: '4:00 PM',
      dresscode: 'Formal',
      notes: 'Por favor llegar 30 minutos antes de la ceremonia.',
    },
    reception: {
      name: 'Club de Pesca',
      address: 'Manga, Carrera 1a #24-29',
      city: 'Cartagena de Indias',
      country: 'Colombia',
      mapsUrl: 'https://maps.google.com/?q=Club+de+Pesca+Cartagena',
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
    hashtag: '#ConcepcionYEumelio2026',
  },
};

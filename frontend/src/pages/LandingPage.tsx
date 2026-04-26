import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Heart, Calendar, Music2, Image, Users, Settings,
  CheckCircle, Mail, Smartphone,
} from 'lucide-react';
import { applyTheme } from '../lib/theme';

const EVENT_TYPES = [
  { emoji: '💍', name: 'Bodas', desc: 'La invitación perfecta para el gran día' },
  { emoji: '🎂', name: 'Cumpleaños', desc: 'Celebra cada año con estilo' },
  { emoji: '👶', name: 'Bautismos', desc: 'Da la bienvenida al mundo' },
  { emoji: '💃', name: 'Quinceañeras', desc: 'El inicio de una nueva etapa' },
  { emoji: '🎓', name: 'Graduaciones', desc: 'Un logro que merece celebrarse' },
  { emoji: '💼', name: 'Corporativos', desc: 'Eventos profesionales con clase' },
];

const FEATURES = [
  { icon: Settings,     title: 'Admin en tiempo real',   desc: 'Cambia textos, colores y datos sin tocar código ni hacer rebuild.' },
  { icon: Users,        title: 'RSVP digital',           desc: 'Los invitados confirman online. Estadísticas al instante.' },
  { icon: Image,        title: 'Galería de fotos',       desc: 'Sube imágenes desde el panel y aparecen en la invitación.' },
  { icon: Music2,       title: 'Música ambiente',        desc: 'Configura una lista de canciones para ambientar la invitación.' },
  { icon: Calendar,     title: 'Cuenta regresiva',       desc: 'Contador en vivo que genera expectativa entre los invitados.' },
  { icon: CheckCircle,  title: 'Multi-evento',           desc: 'Gestiona múltiples clientes desde una sola plataforma.' },
];

const ACCENT = '#3E7B57';
const ACCENT_LIGHT = '#F8FCF6';
const GOLD = '#C9A93C';
const TEXT = '#1C2D22';
const TEXT_MUTED = '#666';

export default function LandingPage() {
  useEffect(() => {
    applyTheme('nature');
    document.title = 'Eventique — Invitaciones Digitales';
  }, []);

  return (
    <div style={{ background: '#fff', color: TEXT, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}>

      {/* ── Hero ── */}
      <section style={{ background: `linear-gradient(160deg, ${ACCENT_LIGHT} 0%, #E8F5EC 100%)`, padding: '80px 24px 72px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '6px 16px', borderRadius: '50px', background: 'white', border: `1px solid ${ACCENT}20` }}>
            <Heart size={14} color={ACCENT} fill={ACCENT} />
            <span style={{ fontSize: '0.78rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: ACCENT, fontFamily: 'sans-serif', fontWeight: 600 }}>Eventique</span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 3.2rem)', fontWeight: 'normal', color: TEXT, margin: '0 0 18px', maxWidth: '680px', marginLeft: 'auto', marginRight: 'auto' }}>
            Invitaciones digitales para<br />cada momento que importa
          </h1>
          <p style={{ fontSize: '1.05rem', color: TEXT_MUTED, maxWidth: '500px', margin: '0 auto 36px', fontFamily: 'sans-serif' }}>
            Panel de administración completo. Tu cliente configura todo desde el navegador — sin código, sin rebuild, sin técnicos.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/e/boda-concepcion-eumelio"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: ACCENT, color: '#fff', padding: '13px 28px', borderRadius: '50px', textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '0.92rem', fontWeight: 600 }}
            >
              Ver demo en vivo →
            </a>
            <a
              href="mailto:eudavalos91@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: ACCENT, padding: '13px 28px', borderRadius: '50px', textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '0.92rem', fontWeight: 600, border: `2px solid ${ACCENT}` }}
            >
              <Mail size={15} /> Contactar
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Event types ── */}
      <section style={{ padding: '72px 24px', maxWidth: '960px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.55rem', fontWeight: 'normal', color: ACCENT, marginBottom: '8px' }}>
            Para todo tipo de eventos
          </h2>
          <p style={{ textAlign: 'center', color: TEXT_MUTED, fontFamily: 'sans-serif', marginBottom: '40px', marginTop: 0 }}>
            Una sola plataforma, seis tipos de eventos completamente configurables.
          </p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {EVENT_TYPES.map(({ emoji, name, desc }, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{ padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', background: '#fff', display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <span style={{ fontSize: '2rem' }}>{emoji}</span>
              <h3 style={{ margin: 0, fontSize: '1.02rem', color: TEXT, fontFamily: 'sans-serif', fontWeight: 600 }}>{name}</h3>
              <p style={{ margin: 0, fontSize: '0.87rem', color: TEXT_MUTED, fontFamily: 'sans-serif' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: '72px 24px', background: ACCENT_LIGHT }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 style={{ textAlign: 'center', fontSize: '1.55rem', fontWeight: 'normal', color: ACCENT, marginBottom: '8px' }}>
              Todo lo que necesitas
            </h2>
            <p style={{ textAlign: 'center', color: TEXT_MUTED, fontFamily: 'sans-serif', marginBottom: '40px', marginTop: 0 }}>
              Funcionalidades listas para producción.
            </p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                style={{ padding: '24px', borderRadius: '16px', background: '#fff', border: '1px solid #e9f0e6' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${ACCENT}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color={ACCENT} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '0.97rem', fontFamily: 'sans-serif', color: TEXT, fontWeight: 600 }}>{title}</h3>
                </div>
                <p style={{ margin: 0, fontSize: '0.87rem', color: TEXT_MUTED, fontFamily: 'sans-serif' }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ padding: '72px 24px', maxWidth: '720px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.55rem', fontWeight: 'normal', color: ACCENT, marginBottom: '8px' }}>
          ¿Cómo funciona?
        </h2>
        <p style={{ color: TEXT_MUTED, fontFamily: 'sans-serif', marginBottom: '40px', marginTop: 0 }}>
          Tres pasos, sin complicaciones.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          {[
            { step: '01', title: 'Creamos tu evento', desc: 'Te configuramos un slug único y un panel de administración personalizado.' },
            { step: '02', title: 'Personalizas el contenido', desc: 'Desde tu panel: nombres, fechas, lugar, colores, fotos, música. Sin tocar código.' },
            { step: '03', title: 'Compartes el enlace', desc: 'Envías la URL o el código QR a tus invitados. Ellos confirman desde el celular.' },
          ].map(({ step, title, desc }) => (
            <div key={step} style={{ display: 'flex', gap: '20px', padding: '20px 24px', borderRadius: '16px', border: '1px solid #e5e7eb', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: GOLD, fontFamily: 'sans-serif', minWidth: '32px', paddingTop: '2px' }}>{step}</span>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1rem', fontFamily: 'sans-serif', color: TEXT }}>{title}</h3>
                <p style={{ margin: 0, fontSize: '0.88rem', color: TEXT_MUTED, fontFamily: 'sans-serif' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '72px 24px', background: ACCENT, textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'normal', color: '#fff', marginBottom: '12px' }}>
            ¿Listo para tu próximo evento?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontFamily: 'sans-serif', marginBottom: '32px', maxWidth: '440px', margin: '0 auto 32px' }}>
            Contáctanos para configurar tu invitación digital. Precio accesible, entrega en 24 horas.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="mailto:eudavalos91@gmail.com"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#fff', color: ACCENT, padding: '13px 28px', borderRadius: '50px', textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '0.92rem', fontWeight: 600 }}
            >
              <Mail size={15} /> Email
            </a>
            <a
              href="https://wa.me/595971000000"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#25D366', color: '#fff', padding: '13px 28px', borderRadius: '50px', textDecoration: 'none', fontFamily: 'sans-serif', fontSize: '0.92rem', fontWeight: 600 }}
            >
              <Smartphone size={15} /> WhatsApp
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ padding: '24px', borderTop: '1px solid #e5e7eb', textAlign: 'center', fontFamily: 'sans-serif', fontSize: '0.82rem', color: '#9ca3af' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Heart size={12} color={ACCENT} fill={ACCENT} />
          <span>Eventique by Tecnopowerpy · {new Date().getFullYear()} · <a href="/" style={{ color: ACCENT, textDecoration: 'none' }}>Ver demo</a></span>
        </div>
      </footer>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider, OrnamentLeaf } from '../components/Ornament';

export default function WeddingParty() {
  const config = useConfig();
  const { weddingParty } = config.sections;
  const title = weddingParty.title ?? 'Quienes Nos Acompañan';

  if (!weddingParty.members || weddingParty.members.length === 0) {
    return null;
  }

  const brideMembers = weddingParty.members.filter((m) => m.side === 'bride' || m.side === 'both');
  const groomMembers = weddingParty.members.filter((m) => m.side === 'groom' || m.side === 'both');
  const { person1, person2 } = config.couple;

  function MemberCard({ member, delay = 0 }: { member: typeof weddingParty.members[0]; delay?: number }) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center group"
      >
        {/* Photo */}
        <div
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 border-2 transition-all duration-300 group-hover:shadow-lg"
          style={{
            borderColor: 'var(--color-primary)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          {member.photo ? (
            <img
              src={member.photo}
              alt={member.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: 'var(--color-secondary)' }}
            >
              <OrnamentLeaf size={32} />
            </div>
          )}
        </div>

        <h4 className="font-sub text-base font-medium mb-0.5" style={{ color: 'var(--color-text)' }}>
          {member.name}
        </h4>
        <p className="font-body text-xs tracking-[0.12em] uppercase font-light" style={{ color: 'var(--color-text-muted)' }}>
          {member.role}
        </p>
        {member.description && (
          <p className="font-body text-xs mt-2 max-w-[140px] font-light" style={{ color: 'var(--color-text-muted)' }}>
            {member.description}
          </p>
        )}
      </motion.div>
    );
  }

  function PartyGroup({ members, label }: { members: typeof weddingParty.members; label: string }) {
    if (members.length === 0) return null;
    return (
      <div>
        <h3
          className="font-heading text-xl sm:text-2xl font-light text-center mb-8"
          style={{ color: 'var(--color-primary)' }}
        >
          {label}
        </h3>
        <div className="flex flex-wrap justify-center gap-8 sm:gap-10">
          {members.map((m, i) => (
            <MemberCard key={m.name} member={m} delay={i * 0.08} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding" style={{ background: 'var(--color-secondary)' }}>
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
        </AnimatedSection>

        <div className="space-y-16">
          <PartyGroup
            members={brideMembers}
            label={`Damas de ${person1.nickname ?? person1.firstName}`}
          />
          {brideMembers.length > 0 && groomMembers.length > 0 && (
            <div className="ornament-line" />
          )}
          <PartyGroup
            members={groomMembers}
            label={`Caballeros de ${person2.nickname ?? person2.firstName}`}
          />
        </div>
      </div>
    </div>
  );
}

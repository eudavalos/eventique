import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import AnimatedSection from '../components/AnimatedSection';
import { OrnamentDivider } from '../components/Ornament';

function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className="border-b cursor-pointer"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="font-sub text-base font-medium transition-colors"
          style={{ color: isOpen ? 'var(--color-primary)' : 'var(--color-text)' }}
        >
          {question}
        </span>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: isOpen ? 'var(--color-primary)' : 'var(--color-secondary)',
            color: isOpen ? 'white' : 'var(--color-text-muted)',
          }}
        >
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              className="pb-5 font-body text-sm font-light leading-relaxed"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const config = useConfig();
  const { faq } = config.sections;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const title = faq.title ?? 'Preguntas Frecuentes';

  const toggle = (i: number) => setOpenIndex(openIndex === i ? null : i);

  if (!faq.items || faq.items.length === 0) {
    return null;
  }

  return (
    <div className="section-padding" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-2xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <h2 className="section-title">{title}</h2>
          <OrnamentDivider />
        </AnimatedSection>

        <div>
          {faq.items.map((item, i) => (
            <FAQItem
              key={i}
              question={item.question}
              answer={item.answer}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

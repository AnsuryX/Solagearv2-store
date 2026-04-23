import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function FaqSection() {
  const [faqs, setFaqs] = useState([]);
  const [open, setOpen] = useState(null);

  useEffect(() => {
    db.entities.FAQ.filter({ published: true }, 'order', 50)
      .then(setFaqs)
      .catch(err => console.error('Failed to load FAQs:', err));
  }, []);

  if (!faqs.length) return null;

  return (
    <section className="py-32 px-6 bg-muted/40">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4">Got Questions?</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
            Everything you <span className="text-primary italic">need to know</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto font-medium">
            Kenya's power landscape is changing. We're here to help you navigate it with confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={`border-2 transition-all duration-300 rounded-3xl overflow-hidden ${
                open === faq.id ? 'border-primary bg-background shadow-2xl' : 'border-border/50 bg-background/50 hover:border-primary/40'
              }`}
            >
              <button
                className="w-full flex items-center justify-between px-8 py-6 text-left gap-4 transition-colors"
                onClick={() => setOpen(open === faq.id ? null : faq.id)}
              >
                <span className={`font-heading font-bold text-base transition-colors ${open === faq.id ? 'text-primary' : 'text-foreground hover:text-primary'}`}>
                  {faq.question}
                </span>
                <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${open === faq.id ? 'bg-primary text-white rotate-45' : 'bg-muted text-primary'}`}>
                  <Plus className="w-4 h-4" />
                </span>
              </button>
              <AnimatePresence initial={false}>
                {open === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="px-8 pb-8 text-sm text-foreground/70 leading-relaxed font-light">
                      <div className="w-12 h-px bg-primary/20 mb-6" />
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

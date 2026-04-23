import { db } from '@/api/base44Client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sun, Home, Building2, ChevronRight, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    id: 'type',
    question: 'What are you powering?',
    options: [
      { label: 'Home / Residence', icon: Home, value: 'home' },
      { label: 'Business / Office', icon: Building2, value: 'business' },
      { label: 'Farm / Agricultural', icon: Sun, value: 'farm' },
    ],
  },
  {
    id: 'bill',
    question: 'What is your average monthly KPLC bill?',
    options: [
      { label: 'Under KSh 3,000', value: 'low' },
      { label: 'KSh 3,000 – 10,000', value: 'mid' },
      { label: 'Over KSh 10,000', value: 'high' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your main goal?',
    options: [
      { label: 'Reduce electricity bills', value: 'savings' },
      { label: 'Backup power / avoid blackouts', value: 'backup' },
      { label: 'Full off-grid independence', value: 'offgrid' },
    ],
  },
];

const RESULTS = {
  low_savings:    { title: 'Starter Kit (1–2kW)', desc: 'A compact solar kit that pays for itself within 2 years — perfect for light home use.', size: '~1.5kW', price: 'From KSh 85,000', tag: 'Most Popular' },
  low_backup:     { title: 'Power Backup Kit', desc: 'Keep lights and essentials running during KPLC outages with a reliable battery + inverter combo.', size: '1kW + 100Ah', price: 'From KSh 65,000', tag: 'Best for Backup' },
  mid_savings:    { title: 'Mid-Home System (3–5kW)', desc: 'Covers 60–80% of a typical Nairobi home\'s energy needs. Great ROI in under 4 years.', size: '~3.5kW', price: 'From KSh 220,000', tag: 'Best Value' },
  mid_backup:     { title: 'Hybrid Solar System', desc: 'Solar + battery hybrid that keeps you powered day and night, storm or shine.', size: '3kW Hybrid', price: 'From KSh 195,000', tag: 'Recommended' },
  high_savings:   { title: 'Premium Home System (5–8kW)', desc: 'Eliminate your KPLC bill almost entirely. Ideal for large homes in Karen, Runda, Lavington.', size: '~6kW', price: 'From KSh 450,000', tag: 'Top Tier' },
  high_backup:    { title: 'Commercial Backup Solution', desc: 'Industrial-grade UPS + solar to protect your business from power cuts 24/7.', size: '5–10kW', price: 'From KSh 380,000', tag: 'Business Grade' },
  low_offgrid:    { title: 'Off-Grid Starter', desc: 'Live free from the grid with a self-sufficient mini solar system.', size: '2kW Off-Grid', price: 'From KSh 130,000', tag: 'Off-Grid' },
  mid_offgrid:    { title: 'Off-Grid Home System', desc: 'Full energy independence for a mid-size home in Nairobi or upcountry.', size: '4kW Off-Grid', price: 'From KSh 280,000', tag: 'Off-Grid' },
  high_offgrid:   { title: 'Commercial Off-Grid', desc: 'Power your business or farm completely off-grid with a scalable solar farm setup.', size: '8–15kW', price: 'From KSh 650,000', tag: 'Enterprise' },
};

function getResultKey(answers) {
  const bill = answers.bill || 'mid';
  const goal = answers.goal || 'savings';
  const key = `${bill}_${goal}`;
  return RESULTS[key] || RESULTS['mid_savings'];
}

export default function LeadMagnetQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step];

  const choose = (val) => {
    const next = { ...answers, [current.id]: val };
    setAnswers(next);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setResult(getResultKey(next));
    }
  };

  const handleSubmit = async () => {
    if (!name || !phone) return;
    setSubmitting(true);

    // 1. Send to Zoho CRM as Lead
    try {
      await fetch('/api/zoho/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          interest: `Quiz Result: ${result.title}`,
          message: `Recommended System: ${result.title}\nQuiz Answers: ${JSON.stringify(answers)}`,
          source: 'Solar Quiz'
        })
      });
    } catch (err) {
      console.error('Zoho Quiz Lead Sync Error:', err);
    }

    const waText = encodeURIComponent(
      `Hi SolarGear! My name is ${name}. I just completed your solar quiz and I'm interested in the "${result.title}" (${result.price}). Please contact me on this number.`
    );
    await db.integrations.Core.SendEmail({
      to: 'hello@solargear.co.ke',
      subject: `New Solar Lead: ${name}`,
      body: `Name: ${name}\nPhone: ${phone}\nQuiz answers: ${JSON.stringify(answers)}\nRecommended: ${result.title}`,
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
    setTimeout(() => {
      window.open(`https://wa.me/254700000000?text=${waText}`, '_blank');
    }, 800);
  };

  const reset = () => { setStep(0); setAnswers({}); setResult(null); setSubmitted(false); setName(''); setPhone(''); };

  return (
    <section className="bg-foreground text-background py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-3">Free Solar Assessment</p>
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-3">
          What Solar System Do You Need?
        </h2>
        <p className="text-background/60 text-sm mb-10">Answer 3 quick questions and we'll recommend the perfect system — and give you a free quote.</p>

        <div className="bg-background/5 border border-background/10 rounded-sm p-6 md:p-8">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                {/* Progress */}
                <div className="flex gap-2 mb-6 justify-center">
                  {STEPS.map((_, i) => (
                    <div key={i} className={`h-1 w-12 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-background/20'}`} />
                  ))}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-5">{current.question}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {current.options.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => choose(opt.value)}
                      className="flex items-center gap-4 p-4 border border-background/20 rounded-sm hover:border-primary hover:bg-primary/10 transition-all text-left group"
                    >
                      {opt.icon && <opt.icon className="w-5 h-5 text-primary shrink-0" />}
                      <span className="font-medium text-sm">{opt.label}</span>
                      <ChevronRight className="w-4 h-4 ml-auto text-background/30 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : !submitted ? (
              <motion.div key="result" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className="inline-block bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full mb-3 tracking-wider">
                  {result.tag}
                </div>
                <h3 className="font-heading text-2xl font-bold mb-2">{result.title}</h3>
                <div className="flex items-center justify-center gap-4 text-sm text-background/60 mb-3">
                  <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" /> {result.size}</span>
                  <span className="font-heading font-bold text-primary">{result.price}</span>
                </div>
                <p className="text-sm text-background/70 mb-6">{result.desc}</p>

                <div className="border-t border-background/10 pt-5 space-y-3 text-left">
                  <p className="text-xs text-background/50 text-center mb-3">Get your personalised quote — no obligation</p>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full bg-background/10 border border-background/20 rounded-sm px-4 py-2.5 text-sm text-background placeholder:text-background/40 outline-none focus:border-primary"
                  />
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="Your phone number (07xx...)"
                    className="w-full bg-background/10 border border-background/20 rounded-sm px-4 py-2.5 text-sm text-background placeholder:text-background/40 outline-none focus:border-primary"
                  />
                  <Button
                    onClick={handleSubmit}
                    disabled={!name || !phone || submitting}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-heading font-semibold rounded-sm gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Get My Free Quote on WhatsApp'}
                  </Button>
                  <button onClick={reset} className="w-full text-xs text-background/40 hover:text-background/70 transition-colors mt-1">
                    ↩ Retake quiz
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-8">
                <div className="text-5xl mb-4">🌟</div>
                <h3 className="font-heading text-2xl font-bold mb-2">Thanks, {name}!</h3>
                <p className="text-background/60 text-sm mb-4">We're opening WhatsApp with your quote request. Our team will respond within 1 hour during business hours.</p>
                <button onClick={reset} className="text-xs text-primary underline">Start over</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
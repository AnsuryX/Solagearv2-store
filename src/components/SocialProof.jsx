import { motion } from 'framer-motion';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';

const REVIEWS = [
  {
    name: 'James Mwangi',
    location: 'Karen, Nairobi',
    rating: 5,
    text: 'Installed a 5kW system in October. My KPLC bill dropped from KSh 18,000 to just KSh 1,200 a month. Best investment I\'ve ever made.',
    system: '5kW Hybrid System',
    initials: 'JM',
    color: 'bg-orange-100 text-orange-700',
  },
  {
    name: 'Wanjiru Njoroge',
    location: 'Westlands, Nairobi',
    rating: 5,
    text: 'No more worrying about blackouts. The backup battery keeps our entire office running for 8+ hours. Installation was clean and fast.',
    system: '3kW Office Backup',
    initials: 'WN',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Peter Otieno',
    location: 'Kisumu',
    rating: 5,
    text: 'Farming with reliable power has changed everything. My irrigation pump runs on solar now. Payback in 18 months at current fuel prices.',
    system: '8kW Agricultural',
    initials: 'PO',
    color: 'bg-green-100 text-green-700',
  },
  {
    name: 'Amina Hassan',
    location: 'Kileleshwa, Nairobi',
    rating: 5,
    text: 'Excellent service from the SolarGear team. They handled permits, installation, and even helped us with the Kenya Power net metering application.',
    system: '4kW Grid-Tied',
    initials: 'AH',
    color: 'bg-purple-100 text-purple-700',
  },
];

const STATS = [
  { value: '850+', label: 'Installations Completed' },
  { value: '99%', label: 'Customer Satisfaction' },
  { value: 'KSh 140M+', label: 'Carbon & Bill Savings' },
  { value: '4.9★', label: 'Average Google Rating' },
];

export default function SocialProof() {
  return (
    <section className="py-32 px-6 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(251,146,60,0.05)_0%,transparent_50%)]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4">Trusted Across Kenya</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground tracking-tight">
            Real Savings. <span className="solar-glow-text text-primary italic">Real Results.</span>
          </h2>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-8 bg-background/50 backdrop-blur-sm border border-white/40 shadow-xl rounded-3xl"
            >
              <p className="font-heading text-4xl font-black text-primary mb-2">{s.value}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Review cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="bg-background border border-border/50 shadow-lg hover:shadow-2xl hover:solar-glow rounded-3xl p-8 flex flex-col transition-all group"
            >
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-3.5 h-3.5 ${j < r.rating ? 'fill-primary text-primary' : 'text-border'}`} />
                ))}
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed flex-1 mb-8 italic font-light">"{r.text}"</p>
              <div className="flex items-center gap-4 pt-6 border-t border-border/30">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shadow-inner rotate-3 group-hover:rotate-0 transition-transform ${r.color}`}>
                  {r.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-heading font-bold text-sm text-foreground">{r.name}</p>
                    <CheckCircle2 className="w-3 h-3 text-blue-500 fill-blue-50" />
                  </div>
                  <p className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 uppercase tracking-wide">
                    <MapPin className="w-2.5 h-2.5 text-primary" /> {r.location}
                  </p>
                </div>
              </div>
              <span className="mt-4 text-[9px] font-bold bg-primary/10 text-primary px-3 py-1 rounded-full self-start uppercase tracking-tighter">{r.system}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

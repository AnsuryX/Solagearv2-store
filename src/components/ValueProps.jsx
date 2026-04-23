import { motion } from 'framer-motion';
import { Cpu, Leaf, TrendingUp } from 'lucide-react';

const props = [
  {
    icon: Cpu,
    title: 'Engineered Precision',
    desc: 'Every component is designed with aerospace-grade manufacturing standards for maximum energy harvest.',
  },
  {
    icon: TrendingUp,
    title: 'Maximum ROI',
    desc: 'Our systems pay for themselves within 5-7 years, delivering decades of free, clean energy thereafter.',
  },
  {
    icon: Leaf,
    title: 'Zero Compromise',
    desc: 'Premium performance meets sustainability. Reduce your carbon footprint without sacrificing power output.',
  },
];

export default function ValueProps() {
  return (
    <section className="bg-zinc-950 py-32 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4 shadow-sm">The SolarGear Advantage</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-white tracking-tight">
            Engineered for <span className="solar-glow-text text-primary">Performance</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className={`p-12 group transition-all duration-500 hover:bg-white/10 border-white/5 ${
                i !== props.length - 1 ? 'md:border-r border-b md:border-b-0' : ''
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 shadow-inner group-hover:solar-glow transition-all duration-500 border border-primary/20">
                <prop.icon className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              </div>
              <h3 className="font-heading font-bold text-xl text-white mb-4 group-hover:text-primary transition-colors">{prop.title}</h3>
              <p className="text-sm text-zinc-300 leading-relaxed font-normal">{prop.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import HomePackages from '../components/HomePackages';
import { motion } from 'framer-motion';

export default function Kits() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-24"
    >
      {/* Hero Header */}
      <div className="bg-foreground text-background py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-primary font-heading font-black tracking-widest text-[10px] uppercase mb-4"
          >
            Engineered Systems
          </motion.p>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-heading text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter mb-6"
          >
            Complete <span className="text-primary italic">Solar Packages</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-base leading-relaxed"
          >
            Precision-matched components designed for maximum harmony and longevity. Choose a pre-engineered kit or consult for a tailored configuration.
          </motion.p>
        </div>
      </div>

      <HomePackages />
      
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-bold mb-4">Custom Engineered Solutions</h2>
          <p className="text-muted-foreground mb-8">
            Each home is unique. While our packages provide a robust baseline, we specialize in tailoring systems to your specific energy profile, roof orientation, and future growth plans.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
            <div className="p-6 bg-background rounded-2xl border hairline border-border">
              <h3 className="font-heading font-bold mb-2">Expansion Ready</h3>
              <p className="text-xs text-muted-foreground">All our kits are designed with modularity in mind. Start with essential backup and scale to full off-grid independence when you're ready.</p>
            </div>
            <div className="p-6 bg-background rounded-2xl border hairline border-border">
              <h3 className="font-heading font-bold mb-2">Smart Monitoring</h3>
              <p className="text-xs text-muted-foreground">Every installation includes real-time mobile monitoring, allowing you to track production and consumption from anywhere in the world.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

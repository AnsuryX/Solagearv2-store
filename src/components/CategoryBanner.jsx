import { Link } from 'react-router-dom';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CategoryBanner() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link to="/products?category=Solar+Panels" className="group">
          <motion.div
            whileHover={{ y: -8 }}
            className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-foreground shadow-xl group-hover:solar-glow transition-all duration-500"
          >
            <img
              src="https://asset.solargear.co.ke/solar%20panel%20solar%20gear.jpg"
              alt="Solar Panels"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
            <div className="absolute bottom-10 left-10">
              <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-3">Collection</p>
              <h3 className="font-heading text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Solar <span className="text-primary italic">Panels</span></h3>
              <div className="flex items-center gap-3 text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                <span className="h-0.5 w-6 bg-primary" />
                EXPLORE NOW
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </motion.div>
        </Link>

        <Link to="/products?category=Batteries" className="group">
          <motion.div
            whileHover={{ y: -8 }}
            className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-foreground shadow-xl group-hover:solar-glow transition-all duration-500"
          >
            <img
              src="https://asset.solargear.co.ke/Solargear%20battery.png"
              alt="Battery Storage"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/20 to-transparent" />
            <div className="absolute bottom-10 left-10">
              <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-3">Collection</p>
              <h3 className="font-heading text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">Energy <span className="text-primary italic">Storage</span></h3>
              <div className="flex items-center gap-3 text-sm font-bold text-white/70 group-hover:text-white transition-colors">
                <span className="h-0.5 w-6 bg-primary" />
                EXPLORE NOW
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </div>
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';

import { ArrowRight, MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const WA_LINK = `https://wa.me/254700000000?text=Hello%20SolarGear%2C%20I%27m%20ready%20to%20go%20solar%21%20Please%20send%20me%20more%20info.`;

export default function CtaBanner() {
  return (
    <section className="relative overflow-hidden py-32 group">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1509391366360-fe5bb58583bb?auto=format&fit=crop&q=80&w=2000"
          alt="Commercial solar array"
          className="w-full h-full object-cover transition-transform duration-[10s] group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-foreground/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-primary font-black mb-6">
          Phase Out The Grid
        </p>
        <h2 className="font-heading text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
          Power Your <span className="solar-glow-text text-primary">Freedom</span>
        </h2>
        <p className="text-lg text-white/60 mb-12 max-w-xl mx-auto font-light leading-relaxed">
          Join thousands of Kenyan homeowners who prioritize independence. 
          Get a certified engineering assessment for your property.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products">
            <Button size="lg" className="bg-primary hover:bg-white hover:text-foreground text-primary-foreground font-heading font-black px-12 rounded-full h-16 group transition-all">
              SHOP COLLECTION
              <ArrowRight className="w-5 h-5 ml-2 transition-all group-hover:translate-x-2" />
            </Button>
          </Link>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 font-heading font-black px-12 rounded-full h-16 gap-3 backdrop-blur-md">
              <MessageCircle className="w-5 h-5" />
              WHATSAPP US
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
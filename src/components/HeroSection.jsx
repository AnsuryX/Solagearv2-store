import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Zap, MessageCircle, ChevronLeft, ChevronRight, Sun, TrendingDown } from 'lucide-react';
import { Button } from "@/components/ui/button";

const WA_LINK = `https://wa.me/254700000000?text=Hello%20SolarGear%2C%20I%27d%20like%20a%20free%20solar%20quote%20for%20my%20home!`;

// A/B tested slides — different value propositions and emotional angles
const SLIDES = [
  {
    id: 'savings',
    badge: "Save Up To KSh 120,000/Year",
    badgeIcon: TrendingDown,
    headline: ["CUT YOUR", "KPLC BILL", "BY 90%"],
    accentIndex: 2,
    sub: "Stop overpaying for electricity. Our solar systems pay for themselves in under 4 years — then give you free power for 25 more.",
    cta1: { label: "Calculate My Savings", to: "/#contact" },
    cta2: { label: "Shop Systems", to: "/products" },
    image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1600&q=80",
    overlay: "from-foreground/80 via-foreground/60 to-primary/20",
    stat1: { value: 'KSh 120K', label: 'Max Annual Savings' },
    stat2: { value: '4yr', label: 'Avg Payback Period' },
    stat3: { value: '25yr', label: 'Panel Warranty' },
  },
  {
    id: 'blackouts',
    badge: "Never Face a Blackout Again",
    badgeIcon: Zap,
    headline: ["POWER ON", "EVEN WHEN", "KPLC FAILS"],
    accentIndex: 2,
    sub: "Hybrid battery systems keep your home running 24/7 — through load shedding, storms, and grid failures. Kenya's most trusted solar brand.",
    cta1: { label: "Get a Free Quote", href: WA_LINK, wa: true },
    cta2: { label: "Explore Kits", to: "/products?category=Kits" },
    image: "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1600&q=80",
    overlay: "from-foreground/80 via-foreground/60 to-primary/20",
    stat1: { value: '24/7', label: 'Uptime' },
    stat2: { value: '850+', label: 'Happy Clients' },
    stat3: { value: '99%', label: 'Install Success' },
  },
  {
    id: 'premium',
    badge: "Nairobi's #1 Solar Store",
    badgeIcon: Sun,
    headline: ["PREMIUM", "SOLAR FOR", "AFRICA"],
    accentIndex: 1,
    sub: "Grade-A panels, top-tier inverters, and lithium batteries — purpose-built for Kenya's climate. Installed by certified engineers. Guaranteed.",
    cta1: { label: "Shop the Gear", to: "/products" },
    cta2: { label: "View Installations", to: "/#map" },
    image: "https://images.unsplash.com/photo-1592833159117-ac790b3afa7b?w=1600&q=80",
    overlay: "from-foreground/80 via-foreground/40 to-primary/30",
    stat1: { value: '850+', label: 'Projects' },
    stat2: { value: '47+', label: 'Counties' },
    stat3: { value: '4.9★', label: 'Rating' },
  },
];

const INTERVAL = 6000;

export default function HeroSection() {
  const [current, setCurrent] = useState(() => Math.floor(Math.random() * SLIDES.length)); // random start = basic A/B
  const [direction, setDirection] = useState(1);
  const timerRef = useRef(null);

  const go = (idx, dir) => {
    setDirection(dir);
    setCurrent(idx);
  };

  const next = () => go((current + 1) % SLIDES.length, 1);
  const prev = () => go((current - 1 + SLIDES.length) % SLIDES.length, -1);

  useEffect(() => {
    timerRef.current = setInterval(next, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [current]);

  const slide = SLIDES[current];
  const BadgeIcon = slide.badgeIcon;

  const variants = {
    enter: (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  };

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Background slider */}
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.id + '-bg'}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9 }}
        >
          <img
            src={slide.image}
            alt={slide.id}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/30" />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.32, 0, 0.67, 0] }}
            >
              {/* Badge */}
              <div className="badge-luxe inline-flex items-center gap-2 mb-6">
                <BadgeIcon className="w-3.5 h-3.5 text-white" />
                <span>{slide.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading text-6xl md:text-8xl font-black text-white leading-[0.88] mb-6 tracking-tighter text-balance">
                {slide.headline.map((line, i) => (
                  <span key={i} className={`block ${i === slide.accentIndex ? 'text-primary solar-glow-text' : ''}`}>
                    {line}
                  </span>
                ))}
              </h1>

              <p className="text-base text-white/90 max-w-md mb-8 leading-relaxed drop-shadow-sm">
                {slide.sub}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                {slide.cta1.wa ? (
                  <a href={slide.cta1.href} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold px-8 rounded-sm group w-full sm:w-auto">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {slide.cta1.label}
                    </Button>
                  </a>
                ) : (
                  <Link to={slide.cta1.to}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold px-8 rounded-sm group w-full sm:w-auto">
                      {slide.cta1.label}
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                )}
                <Link to={slide.cta2.to}>
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-heading rounded-sm w-full sm:w-auto">
                    {slide.cta2.label}
                  </Button>
                </Link>
                <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white font-heading rounded-sm gap-2 w-full sm:w-auto">
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp Quote
                  </Button>
                </a>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats row */}
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id + '-stats'}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="flex gap-10 mt-14 pt-7 border-t border-white/10"
            >
              {[slide.stat1, slide.stat2, slide.stat3].map(stat => (
                <div key={stat.label}>
                  <p className="font-heading text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slider controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i, i > current ? 1 : -1)}
              className={`rounded-full transition-all duration-300 ${i === current ? 'bg-primary w-6 h-2' : 'bg-white/40 hover:bg-white/70 w-2 h-2'}`}
            />
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all"
      >
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center transition-all"
      >
        <ChevronRight className="w-5 h-5 text-white" />
      </button>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 font-heading text-xs text-white/40 tabular-nums">
        {String(current + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
      </div>
    </section>
  );
}
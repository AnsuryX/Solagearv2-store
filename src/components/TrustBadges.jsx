import { Shield, Truck, RotateCcw, Headphones } from 'lucide-react';

const badges = [
  { icon: Shield, title: '25-Year Warranty', desc: 'Industry-leading coverage' },
  { icon: Truck, title: 'Nairobi Delivery', desc: 'Fast delivery countrywide' },
  { icon: RotateCcw, title: '30-Day Returns', desc: 'No questions asked' },
  { icon: Headphones, title: 'Swahili & English Support', desc: 'Mon–Sat 8am–6pm EAT' },
];

export default function TrustBadges() {
  return (
    <section className="bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {badges.map((badge, i) => (
            <div
              key={badge.title}
              className={`flex items-center gap-4 py-12 px-6 group transition-all duration-500 hover:bg-primary/[0.02] ${
                i < badges.length - 1 ? 'md:border-r border-border' : ''
              } ${i % 2 === 0 ? 'border-r md:border-r-0' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center shrink-0 group-hover:solar-glow group-hover:bg-primary/10 transition-all duration-500">
                <badge.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">{badge.title}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

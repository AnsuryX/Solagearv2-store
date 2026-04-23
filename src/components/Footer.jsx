import { Link } from 'react-router-dom';
import { Sun, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

const WA_NUMBER = '254141153031';
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=Hello%20SolarGear%2C%20I%27m%20interested%20in%20your%20solar%20products!`;

export default function Footer() {
  return (
    <footer className="bg-foreground py-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-8 group">
              <div className="w-10 h-10 solar-gradient rounded-xl flex items-center justify-center solar-glow group-hover:scale-110 transition-transform duration-500">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <span className="font-heading font-black text-xl text-white tracking-tighter">SOLAR<span className="text-primary text-2xl">.</span></span>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed font-light">
              Premium solar technology engineered for Nairobi's specific climate conditions for both home and heavy industry.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4 uppercase tracking-widest">Products</h4>
            <div className="space-y-2">
              {['Solar Panels', 'Inverters', 'Batteries', 'Mounting', 'Kits'].map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4 uppercase tracking-widest">Support</h4>
            <div className="space-y-2">
              {['Installation Guide', 'Warranty Info', 'Technical Specs', 'FAQ'].map(item => (
                <span key={item} className="block text-sm text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold text-sm text-white mb-4 uppercase tracking-widest">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>hello@solargear.co.ke</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>+254 722 963 896</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Westlands, Nairobi, Kenya</span>
              </div>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-green-600 hover:text-green-500 transition-colors font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t hairline border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <p className="text-[10px] text-white/30 uppercase tracking-widest">
              © 2026 SolarGear Kenya Ltd.
            </p>
            <div className="h-4 w-px bg-white/10" />
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">
              EPRA Certified Specialist #V2-088
            </p>
          </div>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Shipping'].map(item => (
              <span key={item} className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default icon issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const sunIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#FF6B00;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

const INSTALLATIONS = [
  { id: 1, lat: -1.2921, lng: 36.8219, location: 'Westlands, Nairobi', system: '5kW Hybrid', savings: 'KSh 48,000/yr', customer: 'D. Kariuki', slug: 'westlands-5kw-hybrid-case-study' },
  { id: 2, lat: -1.3741, lng: 36.7568, location: 'Karen, Nairobi', system: '8kW Off-Grid', savings: 'KSh 82,000/yr', customer: 'S. Njoroge', slug: 'karen-8kw-offgrid-case-study' },
  { id: 3, lat: -1.1683, lng: 36.7336, location: 'Ruiru, Kiambu', system: '3kW Grid-Tie', savings: 'KSh 31,000/yr', customer: 'P. Wambua', slug: 'ruiru-3kw-gridtie-case-study' },
  { id: 4, lat: -4.0435, lng: 39.6682, location: 'Mombasa', system: '6kW Hybrid', savings: 'KSh 61,000/yr', customer: 'A. Hassan', slug: 'mombasa-6kw-hybrid-case-study' },
  { id: 5, lat: -0.1022, lng: 34.7617, location: 'Kisumu', system: '4kW Hybrid', savings: 'KSh 42,000/yr', customer: 'O. Otieno', slug: 'kisumu-4kw-hybrid-case-study' },
  { id: 6, lat: 0.5143, lng: 35.2698, location: 'Eldoret', system: '10kW Commercial', savings: 'KSh 140,000/yr', customer: 'Rift Valley Millers', slug: 'eldoret-10kw-commercial-case-study' },
  { id: 7, lat: -0.6698, lng: 37.3267, location: 'Embu', system: '2kW Starter Kit', savings: 'KSh 22,000/yr', customer: 'M. Gitau', slug: 'embu-2kw-starter-case-study' },
  { id: 8, lat: -1.5177, lng: 37.2634, location: 'Machakos', system: '5kW Hybrid', savings: 'KSh 49,500/yr', customer: 'K. Mutua', slug: 'machakos-5kw-hybrid-case-study' },
  { id: 9, lat: -0.3031, lng: 36.0800, location: 'Nakuru', system: '7kW Hybrid', savings: 'KSh 73,000/yr', customer: 'J. Kamau', slug: 'nakuru-7kw-hybrid-case-study' },
  { id: 10, lat: -1.0332, lng: 37.0694, location: 'Thika', system: '3.5kW Grid-Tie', savings: 'KSh 35,000/yr', customer: 'R. Njeru', slug: 'thika-3kw-gridtie-case-study' },
];

export default function InstallationsMap() {
  return (
    <section className="py-32 px-6 bg-muted/30 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-primary font-bold mb-4">Engineering Coverage</p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground tracking-tight mb-6">
            Trusted from <span className="solar-glow-text text-primary">Kisumu</span> to <span className="solar-glow-text text-primary">Mombasa</span>
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto font-medium">
            Every pin represents a successful transition to energy independence. Select a site to view its technical specifications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="rounded-3xl overflow-hidden border-4 border-white shadow-2xl relative"
          style={{ height: '600px' }}
        >
          <MapContainer
            center={[-0.8, 37.5]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {INSTALLATIONS.map((pin) => (
              <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={sunIcon}>
                <Popup className="solar-popup" maxWidth={280}>
                  <div className="p-2 min-w-[220px]">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-heading font-black text-foreground text-base tracking-tight">{pin.location}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-bold mb-4 uppercase tracking-widest">{pin.customer}</p>

                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="flex flex-col gap-1 bg-primary/10 rounded-xl p-2">
                        <span className="text-[9px] font-bold text-primary/60 uppercase">System</span>
                        <span className="text-xs font-black text-primary truncate leading-tight">{pin.system}</span>
                      </div>
                      <div className="flex flex-col gap-1 bg-green-50 rounded-xl p-2">
                        <span className="text-[9px] font-bold text-green-600/60 uppercase">Savings</span>
                        <span className="text-xs font-black text-green-700 leading-tight">{pin.savings}</span>
                      </div>
                    </div>

                    <Link
                      to={`/blog/${pin.slug}`}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-foreground text-white rounded-xl text-xs font-black hover:bg-primary transition-colors group"
                    >
                      VIEW CASE STUDY <ExternalLink className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </motion.div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {[
            { label: 'Total Installations', value: '850+' },
            { label: 'Counties Covered', value: '47' },
            { label: 'Avg. Annual Savings', value: 'KSh 72,000' },
          ].map(({ label, value }) => (
            <motion.div 
              key={label} 
              whileHover={{ y: -5 }}
              className="text-center py-8 border border-border/50 rounded-3xl bg-background shadow-lg hover:solar-glow transition-all duration-300"
            >
              <p className="font-heading font-black text-3xl text-primary mb-1 tracking-tighter">{value}</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Check, MessageCircle, Smartphone } from 'lucide-react';

const WA_NUMBER = '254722371250';
const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const PACKAGES = [
  {
    name: 'SolarStart™ Backup',
    tag: null,
    desc: 'The essential solution to stay powered during Nairobi blackouts. Perfect for apartments and small townhouses.',
    price: 'KES 285,000',
    specs: [
      '2.5kW Hybrid Inverter',
      '5.1kWh Lithium Battery',
      'Power for: Lights, Wi-Fi, Fridge, TV',
      'Full Professional Installation',
    ],
    bonuses: [
      'Free Remote 3D Audit',
      'Mobile Monitoring App',
      'Founding Member Status',
    ],
    mpesa: true,
    waMsg: 'Hi SolarGear! I\'d like a quote for the SolarStart™ Backup package.',
  },
  {
    name: 'SolarFamily™ Hybrid',
    tag: 'Nairobi Bestseller',
    desc: 'Our most popular choice for standard family homes. Significant bill reduction and total reliability.',
    price: 'KES 595,000',
    specs: [
      '5kW Smart Hybrid Inverter',
      '10.2kWh LiFePO4 Storage',
      'Power for: All Lights, Fridge, Water Pump',
      'Tier-1 High Efficiency Panels',
    ],
    bonuses: [
      'Free Remote 3D Audit',
      '1-Year Maintenance Plan',
      'Smart Energy Optimizer',
    ],
    mpesa: true,
    waMsg: 'Hi SolarGear! I\'d like a quote for the SolarFamily™ Hybrid package.',
    highlighted: true,
  },
  {
    name: 'SolarElite™ Independence',
    tag: null,
    desc: 'Ultimate energy freedom for large villas. Run your entire home including heavy appliances with zero stress.',
    price: 'KES 1,450,000',
    specs: [
      '10kW Parallel Inverter Setup',
      '20kWh High-Density Storage',
      'Full Loads: Including ACs & Cookers',
      'Premium Glass-on-Glass Panels',
    ],
    bonuses: [
      'Free Remote 3D Audit',
      '3-Year Onsite Maintenance',
      'VIP Engineering Support',
      'Backup Expansion Slot',
    ],
    mpesa: false,
    waMsg: 'Hi SolarGear! I\'d like a quote for the SolarElite™ Independence package.',
  },
];

export default function HomePackages() {
  return (
    <section className="py-20 px-6 bg-background" id="packages">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Scalable Residential Engineering</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Transparent Home Packages
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            No fixed one-size-fits-all prices. We provide estimated ranges based on high-quality Tier-1 tech, finalized after your Free Remote 3D Audit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.name}
              className={`relative flex flex-col rounded-sm border overflow-hidden transition-all ${
                pkg.highlighted
                  ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
                  : 'border-border hairline'
              }`}
            >
              {pkg.tag && (
                <div className="bg-primary text-primary-foreground text-[10px] font-heading font-bold uppercase tracking-widest text-center py-1.5 px-4">
                  {pkg.tag}
                </div>
              )}

              <div className={`flex-1 p-6 flex flex-col ${pkg.highlighted ? 'bg-foreground text-background' : 'bg-background'}`}>
                <h3 className={`font-heading text-lg font-bold mb-1 ${pkg.highlighted ? 'text-background' : 'text-foreground'}`}>{pkg.name}</h3>
                <p className={`text-xs leading-relaxed mb-5 ${pkg.highlighted ? 'text-background/70' : 'text-muted-foreground'}`}>{pkg.desc}</p>

                <div className="mb-1">
                  <p className={`text-[10px] uppercase tracking-wider mb-0.5 ${pkg.highlighted ? 'text-background/50' : 'text-muted-foreground'}`}>Starting from</p>
                  <p className={`font-heading text-3xl font-bold ${pkg.highlighted ? 'text-primary' : 'text-foreground'}`}>{pkg.price}</p>
                  <p className={`text-[10px] mt-0.5 ${pkg.highlighted ? 'text-background/50' : 'text-muted-foreground'}`}>Finalized via Satellite Audit</p>
                </div>

                <div className={`mt-5 border-t pt-4 ${pkg.highlighted ? 'border-background/10' : 'border-border hairline'}`}>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 ${pkg.highlighted ? 'text-background/50' : 'text-muted-foreground'}`}>Hardware Specs</p>
                  <ul className="space-y-1.5">
                    {pkg.specs.map(s => (
                      <li key={s} className={`flex items-start gap-2 text-xs ${pkg.highlighted ? 'text-background/80' : 'text-foreground'}`}>
                        <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${pkg.highlighted ? 'text-primary' : 'text-primary'}`} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className={`mt-4 border-t pt-4 ${pkg.highlighted ? 'border-background/10' : 'border-border hairline'}`}>
                  <p className={`text-[10px] uppercase tracking-widest font-bold mb-3 ${pkg.highlighted ? 'text-background/50' : 'text-muted-foreground'}`}>Founding Bonuses</p>
                  <ul className="space-y-1.5">
                    {pkg.bonuses.map(b => (
                      <li key={b} className={`flex items-start gap-2 text-xs ${pkg.highlighted ? 'text-background/80' : 'text-foreground'}`}>
                        <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-green-500" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 space-y-2">
                  <a
                    href={waLink(pkg.waMsg)}
                    target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-heading font-semibold py-2.5 rounded-sm text-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Get Quote on WhatsApp
                  </a>
                  {pkg.mpesa && (
                    <a
                      href={waLink(`Hi SolarGear! I'd like to order the ${pkg.name} via M-Pesa.`)}
                      target="_blank" rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-2 w-full border font-heading font-semibold py-2.5 rounded-sm text-sm transition-colors ${
                        pkg.highlighted
                          ? 'border-background/20 text-background hover:bg-background/10'
                          : 'border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" /> Order via M-Pesa
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
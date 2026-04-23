
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const sampleProducts = [
  {
    name: 'Jinko 550W Tiger Pro',
    price: 32000,
    category: 'Solar Panels',
    image_url: 'https://picsum.photos/seed/panel1/800/800',
    description: 'High-efficiency monocrystalline PERC solar panel. Tier-1 bankable brand with 25-year warranty.',
    in_stock: true,
  },
  {
    name: 'Sunsynk 5kW Hybrid Inverter',
    price: 185000,
    category: 'Inverters',
    image_url: 'https://picsum.photos/seed/inverter1/800/800',
    description: 'Multi-functional hybrid inverter with smart load management. Industry leader in reliability.',
    in_stock: true,
  },
  {
    name: 'Pylontech 4.8kWh Lithium Battery',
    price: 245000,
    category: 'Batteries',
    image_url: 'https://picsum.photos/seed/battery1/800/800',
    description: 'Long-life LiFePO4 battery storage system. Modular design for easy expansion.',
    in_stock: true,
  },
  {
    name: 'SolarStart™ Backup Kit',
    price: 285000,
    category: 'Kits',
    image_url: 'https://picsum.photos/seed/kit1/800/800',
    description: 'Essential blackout protection. Includes 2.5kW inverter and 5kWh battery storage.',
    in_stock: true,
  },
  {
    name: 'SolarFamily™ Hybrid System',
    price: 595000,
    category: 'Kits',
    image_url: 'https://picsum.photos/seed/kit2/800/800',
    description: 'Complete home energy solution. Drastically reduce bills with solar and smart storage.',
    in_stock: true,
  }
];

async function seed() {
  console.log('Seeding products...');
  for (const product of sampleProducts) {
    const { error } = await supabase.from('products').insert(product);
    if (error) {
      console.error(`Error seeding ${product.name}:`, error.message);
    } else {
      console.log(`Successfully seeded ${product.name}`);
    }
  }
  console.log('Seeding complete.');
}

seed();

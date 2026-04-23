import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import ProductCard from './ProductCard';

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Product.filter({ featured: true }, '-created_date', 8);
        setProducts(data);
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border-r border-b hairline border-border p-6 animate-pulse">
              <div className="aspect-square bg-muted rounded-sm mb-4" />
              <div className="h-3 bg-muted rounded w-16 mb-2" />
              <div className="h-4 bg-muted rounded w-32 mb-2" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="relative max-w-7xl mx-auto px-6 py-32 overflow-hidden">
      {/* Visual Accents */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row items-baseline justify-between mb-16 gap-6">
        <div className="relative">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-bold mb-3 flex items-center gap-2">
            <span className="w-8 h-px bg-primary/40" />
            Solar Excellence
          </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black text-foreground tracking-tight">
            High-Yield <span className="solar-glow-text text-primary">Gear</span>
          </h2>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-3 text-sm font-bold text-foreground border-b-2 border-primary/20 hover:border-primary transition-all pb-1 group"
        >
          View Full Catalog
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-l hairline border-border bg-background relative z-10 shadow-2xl shadow-primary/5">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

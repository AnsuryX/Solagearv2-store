import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';

import ProductCard from '../components/ProductCard';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

const categories = ['All', 'Solar Panels', 'Inverters', 'Batteries', 'Mounting', 'Accessories', 'Kits'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('category');
    if (cat && categories.includes(cat)) {
      setActiveCategory(cat);
    }
  }, []);

  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data;
        if (activeCategory === 'All') {
          data = await db.entities.Product.list('-created_date', 50);
        } else {
          data = await db.entities.Product.filter({ category: activeCategory }, '-created_date', 50);
        }

        if (sortBy === 'price-low') data.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') data.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setProducts(data);
      } catch (err) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to load products. Please ensure your Supabase tables are created.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeCategory, sortBy]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-sm inline-block max-w-2xl">
          <h2 className="font-heading text-xl font-bold mb-2">Database Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs opacity-80">
            Make sure you have created the <strong>products</strong> table in your Supabase project.
            Check the <code>supabase_schema.sql</code> file in the project root for the required SQL.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Catalog</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground">
          {activeCategory === 'All' ? 'All Products' : activeCategory}
        </h1>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b hairline border-border">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 text-xs font-medium transition-all rounded-sm ${
                activeCategory === cat
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs text-muted-foreground bg-transparent border-none focus:outline-none cursor-pointer"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-l hairline border-border">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="border-r border-b hairline border-border p-6 animate-pulse">
              <div className="aspect-square bg-muted rounded-sm mb-4" />
              <div className="h-3 bg-muted rounded w-16 mb-2" />
              <div className="h-4 bg-muted rounded w-32 mb-2" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">No products found in this category.</p>
          <Button variant="outline" onClick={() => setActiveCategory('All')} className="rounded-sm">
            <X className="w-4 h-4 mr-2" /> Clear Filter
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 border-t border-l hairline border-border"
        >
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-8">
        Showing {products.length} product{products.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
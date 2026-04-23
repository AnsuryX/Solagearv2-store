import { db } from '@/api/base44Client';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { Search, X, SlidersHorizontal, Zap, Tag, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRICE_RANGES = [
  { label: 'Under KSh 10,000', max: 10000 },
  { label: 'KSh 10k–50k', min: 10000, max: 50000 },
  { label: 'KSh 50k–100k', min: 50000, max: 100000 },
  { label: 'Over KSh 100,000', min: 100000 },
];
const WATTAGE_RANGES = [
  { label: 'Under 200W', max: 200 },
  { label: '200W–500W', min: 200, max: 500 },
  { label: '500W–1000W', min: 500, max: 1000 },
  { label: 'Over 1kW', min: 1000 },
];

function matchesWattage(product, range) {
  if (!range) return true;
  const w = parseInt(product.peak_power);
  if (isNaN(w)) return false;
  if (range.min && w < range.min) return false;
  if (range.max && w >= range.max) return false;
  return true;
}

function matchesPrice(product, range) {
  if (!range) return true;
  const p = product.price || 0;
  if (range.min && p < range.min) return false;
  if (range.max && p >= range.max) return false;
  return true;
}

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceFilter, setPriceFilter] = useState(null);
  const [wattageFilter, setWattageFilter] = useState(null);
  const [availOnly, setAvailOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    inputRef.current?.focus();
    async function load() {
      setLoading(true);
      const data = await db.entities.Product.list('-created_date', 200);
      setAllProducts(data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    let filtered = allProducts;

    if (q) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.peak_power?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (availOnly) filtered = filtered.filter(p => p.in_stock !== false);
    if (priceFilter) filtered = filtered.filter(p => matchesPrice(p, priceFilter));
    if (wattageFilter) filtered = filtered.filter(p => matchesWattage(p, wattageFilter));

    setResults(filtered.slice(0, 8));
  }, [query, allProducts, priceFilter, wattageFilter, availOnly]);

  const go = (product) => {
    navigate(`/product/${product.id}`);
    onClose();
  };

  const goSearch = () => {
    if (query.trim()) {
      navigate(`/products?q=${encodeURIComponent(query)}`);
      onClose();
    }
  };

  const activeFilters = [priceFilter, wattageFilter, availOnly].filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-foreground/50 backdrop-blur-sm flex items-start justify-center pt-20 px-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        className="w-full max-w-2xl bg-background border hairline border-border rounded-sm shadow-2xl overflow-hidden"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b hairline border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && goSearch()}
            placeholder="Search by name, category, or wattage (e.g. '400W panel')..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm transition-colors ${showFilters || activeFilters > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            Filters
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-foreground text-background text-[9px] font-bold rounded-full flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b hairline border-border overflow-hidden"
            >
              <div className="px-4 py-3 space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 flex items-center gap-1"><Tag className="w-3 h-3" /> Price Range</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRICE_RANGES.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setPriceFilter(priceFilter === r ? null : r)}
                        className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${priceFilter === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 flex items-center gap-1"><Zap className="w-3 h-3" /> Wattage</p>
                  <div className="flex flex-wrap gap-1.5">
                    {WATTAGE_RANGES.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setWattageFilter(wattageFilter === r ? null : r)}
                        className={`px-2.5 py-1 text-xs rounded-sm transition-colors ${wattageFilter === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAvailOnly(!availOnly)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm transition-colors ${availOnly ? 'bg-green-600 text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    <CheckCircle className="w-3 h-3" /> In Stock Only
                  </button>
                  {activeFilters > 0 && (
                    <button onClick={() => { setPriceFilter(null); setWattageFilter(null); setAvailOnly(false); }} className="text-xs text-muted-foreground hover:text-foreground underline">
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading products...</div>
          ) : results.length === 0 && (query || activeFilters > 0) ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">No products match your search.</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-6 text-center text-xs text-muted-foreground">Type to search all {allProducts.length} products…</div>
          ) : (
            <>
              {results.map(product => (
                <button
                  key={product.id}
                  onClick={() => go(product)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left border-b hairline border-border last:border-b-0"
                >
                  <div className="w-10 h-10 bg-muted rounded-sm overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-full h-full object-contain p-1" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">☀️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-semibold text-sm text-foreground line-clamp-1">{product.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                      <span>{product.category}</span>
                      {product.peak_power && <span>· {product.peak_power}W</span>}
                      {product.in_stock === false && <span className="text-red-500">· Out of stock</span>}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-heading font-bold text-sm text-foreground">KSh {product.price?.toLocaleString()}</p>
                    {product.original_price && (
                      <p className="text-[11px] text-muted-foreground line-through">KSh {product.original_price?.toLocaleString()}</p>
                    )}
                  </div>
                </button>
              ))}
              {query && (
                <button
                  onClick={goSearch}
                  className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                >
                  <Search className="w-3.5 h-3.5" />
                  See all results for "{query}"
                </button>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
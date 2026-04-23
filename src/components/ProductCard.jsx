import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Star, Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <Link to={`/product/${product.slug || product.id}`} className="block h-full">
        <motion.div
          className="group h-full relative border-r border-b hairline border-border p-6 transition-all hover:bg-muted/50 hover:solar-glow z-0 hover:z-10"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          {discount && (
            <span className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm z-10">
              -{discount}%
            </span>
          )}

          <div className="aspect-square mb-4 flex items-center justify-center overflow-hidden relative bg-muted/20 rounded-lg p-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
            />

            {/* Spec overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              className="absolute inset-0 bg-foreground/85 flex flex-col items-center justify-center gap-3 rounded-sm p-4 text-center"
            >
              <button
                onClick={handleQuickView}
                className="mb-2 bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] font-bold px-4 py-2 rounded-sm flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
              >
                <Eye className="w-3.5 h-3.5" /> Quick View
              </button>

              <div className="space-y-1">
                {product.peak_power && (
                  <div className="flex items-center justify-center gap-2 text-primary-foreground/90">
                    <Zap className="w-3 h-3 text-primary" />
                    <span className="font-heading text-[10px] font-semibold tracking-wide">{product.peak_power}W Peak</span>
                  </div>
                )}
                {product.efficiency && (
                  <div className="flex items-center justify-center gap-2 text-primary-foreground/90">
                    <Star className="w-3 h-3 text-primary" />
                    <span className="font-heading text-[10px] font-semibold tracking-wide">{product.efficiency}% Efficiency</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] mb-1 font-medium">
              {product.category}
            </p>
            <h3 className="font-heading font-semibold text-sm text-foreground leading-tight mb-2 line-clamp-2 h-10">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-bold text-foreground text-lg group-hover:text-primary transition-colors">
                KSh {product.price?.toLocaleString()}
              </span>
              {product.original_price && (
                <span className="text-xs text-muted-foreground line-through">
                  KSh {product.original_price?.toLocaleString()}
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      className={`w-3 h-3 ${s <= Math.round(product.rating) ? 'text-primary fill-primary' : 'text-border'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-muted-foreground">({product.review_count})</span>
              </div>
            )}
          </div>
        </motion.div>
      </Link>

      <QuickViewModal
        product={product}
        open={quickViewOpen}
        onOpenChange={setQuickViewOpen}
      />
    </>
  );
}

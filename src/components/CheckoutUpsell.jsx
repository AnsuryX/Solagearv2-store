import { useState, useEffect } from 'react';
import { db } from '@/api/base44Client';
import { addToCart } from '@/lib/cartStore';
import { Plus, Check, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CheckoutUpsell({ cartItems }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedIds, setAddedIds] = useState(new Set());

  useEffect(() => {
    async function getRecommendations() {
      setLoading(true);
      try {
        // Collect existing categories
        const itemNames = cartItems.map(i => i.product_name.toLowerCase());
        
        let targetCategories = [];
        let hasPanels = itemNames.some(n => n.includes('panel'));
        let hasInverter = itemNames.some(n => n.includes('inverter'));
        let hasBattery = itemNames.some(n => n.includes('battery'));
        let hasMounting = itemNames.some(n => n.includes('mounting') || n.includes('bracket'));

        if (hasPanels && !hasMounting) targetCategories.push('Mounting');
        if (hasPanels || hasInverter || hasBattery) targetCategories.push('Accessories');
        if (hasInverter && !hasBattery) targetCategories.push('Batteries');

        // Fallback or general upsell
        if (targetCategories.length === 0) targetCategories = ['Accessories', 'Kits'];

        const allProducts = await db.entities.Product.list('-rating', 40);
        
        const filtered = allProducts
          .filter(p => 
            targetCategories.includes(p.category) && 
            !cartItems.some(item => item.product_id === p.id)
          )
          .slice(0, 3);

        setRecommendations(filtered);
      } catch (err) {
        console.error('Upsell error:', err);
      } finally {
        setLoading(false);
      }
    }

    if (cartItems.length > 0) {
      getRecommendations();
    }
  }, [cartItems]);

  const handleAdd = (product) => {
    addToCart(product, 1);
    setAddedIds(prev => new Set([...prev, product.id]));
  };

  if (loading || recommendations.length === 0) return null;

  return (
    <div className="mt-8 pt-8 border-t hairline border-border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary animate-pulse" />
          Complete Your Setup
        </h3>
        <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Recommended</span>
      </div>

      <div className="grid gap-3">
        {recommendations.map((product, idx) => (
          <motion.div 
            key={product.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex items-center gap-3 p-3 bg-muted/20 hover:bg-muted/40 rounded-xl border hairline border-border transition-all group"
          >
            <div className="w-12 h-12 rounded-lg bg-background border hairline border-border overflow-hidden p-1 shrink-0">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-foreground leading-tight truncate">{product.name}</p>
              <p className="text-[10px] font-bold text-primary mt-0.5">KSh {product.price?.toLocaleString()}</p>
            </div>
            <Button
              onClick={() => handleAdd(product)}
              disabled={addedIds.has(product.id)}
              size="sm"
              variant={addedIds.has(product.id) ? "ghost" : "outline"}
              className={`rounded-lg h-8 px-3 text-[10px] font-black uppercase tracking-tight transition-all ${
                addedIds.has(product.id) ? 'text-green-600' : 'hover:bg-primary hover:text-white border-primary/20'
              }`}
            >
              {addedIds.has(product.id) ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <>
                  <Plus className="w-3 h-3 mr-1" /> Add
                </>
              )}
            </Button>
          </motion.div>
        ))}
      </div>
      
      <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 px-1 py-1 italic">
        <ShieldCheck className="w-3 h-3" />
        Certified compatible components
      </p>
    </div>
  );
}

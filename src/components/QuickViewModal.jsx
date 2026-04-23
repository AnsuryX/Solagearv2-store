import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Zap, Shield, Star, Check } from 'lucide-react'
import { addToCart } from '../lib/cartStore'
import { useToast } from "@/components/ui/use-toast"

export default function QuickViewModal({ product, open, onOpenChange }) {
  const { toast } = useToast();

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your basket.`,
    });
    onOpenChange(false);
  };

  const features = Array.isArray(product.features) 
    ? product.features 
    : (product.features?.split('\n') || []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:rounded-2xl p-0 overflow-hidden glass-morphism border-primary/20">
        <div className="flex flex-col md:flex-row h-full">
          {/* Product Image */}
          <div className="w-full md:w-1/2 bg-muted flex items-center justify-center p-8 bg-gradient-to-br from-muted to-background/50">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-auto max-h-[400px] object-contain drop-shadow-2xl transition-transform hover:scale-105 duration-500"
            />
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-8 flex flex-col">
            <div className="mb-4">
              <Badge variant="outline" className="mb-2 uppercase tracking-widest text-[10px] border-primary/30 text-primary">
                {product.category}
              </Badge>
              <DialogTitle className="font-heading text-2xl font-bold leading-tight mb-2">
                {product.name}
              </DialogTitle>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star 
                      key={s} 
                      className={`w-3.5 h-3.5 ${s <= Math.round(product.rating || 5) ? 'text-primary fill-primary' : 'text-border'}`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.review_count || 12} reviews)</span>
              </div>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="font-heading text-3xl font-bold text-foreground">
                  KSh {product.price?.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through italic">
                    KSh {product.original_price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <DialogDescription className="text-sm leading-relaxed mb-6 text-foreground/80">
              {product.short_description || product.description?.substring(0, 150) + '...'}
            </DialogDescription>

            <div className="space-y-4 mb-8 bg-muted/30 p-4 rounded-xl border hairline border-border">
              <div className="grid grid-cols-2 gap-4">
                {product.peak_power && (
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">{product.peak_power}W Peak</span>
                  </div>
                )}
                {product.warranty_years && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">{product.warranty_years}yr Warranty</span>
                  </div>
                )}
              </div>
              {features.length > 0 && (
                <ul className="space-y-1 mt-2">
                  {features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Check className="w-3 h-3 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-auto flex gap-3">
              <Button onClick={handleAddToCart} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm h-12">
                <ShoppingBag className="w-4 h-4 mr-2" /> Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { getCartItems, updateCartQuantity, removeFromCart, getCartTotal, subscribeToCart } from '../lib/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const [items, setItems] = useState(getCartItems());
  const navigate = useNavigate();

  useEffect(() => {
    setItems(getCartItems());
    return subscribeToCart(() => setItems(getCartItems()));
  }, []);

  const total = getCartTotal();
  const shipping = total > 500 ? 0 : 49;
  const tax = total * 0.08;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Start browsing our solar gear to add items to your cart.
        </p>
        <Link to="/products">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm">
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-10">
        Your Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0">
          <div className="border-t hairline border-border">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.product_id}
                  layout
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-4 py-6 border-b hairline border-border"
                >
                  <Link to={`/product/${item.product_id}`} className="shrink-0">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-muted/30 border hairline border-border rounded-sm overflow-hidden">
                      <img src={item.image_url} alt={item.product_name} className="w-full h-full object-contain p-2" />
                    </div>
                  </Link>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link to={`/product/${item.product_id}`}>
                        <h3 className="font-heading font-semibold text-sm text-foreground hover:text-primary transition-colors">
                          {item.product_name}
                        </h3>
                      </Link>
                      <p className="font-heading font-bold text-foreground mt-1">
                        KSh {item.price?.toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border hairline border-border rounded-sm">
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity - 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-heading font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 hover:bg-muted transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="border hairline border-border rounded-sm p-6 sticky top-24">
            <h3 className="font-heading font-semibold text-foreground mb-6">Order Summary</h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-heading font-semibold">KSh {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-heading font-semibold">{shipping === 0 ? 'Free' : `KSh ${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Tax (16% VAT)</span>
                <span className="font-heading font-semibold">KSh {tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t hairline border-border pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-heading font-bold text-foreground">Total</span>
                <span className="font-heading font-bold text-xl text-foreground">
                  KSh {(total + shipping + tax).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-sm group"
              size="lg"
            >
              Checkout
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            {shipping === 0 && (
              <p className="text-xs text-center text-green-600 mt-3">
                ✓ You qualify for free shipping
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
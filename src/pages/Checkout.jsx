import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCartItems, getCartTotal, clearCart, subscribeToCart } from '../lib/cartStore';
import { Loader2, Lock, ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import CheckoutUpsell from '../components/CheckoutUpsell';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState(getCartItems());
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    shipping_name: '', shipping_email: '', shipping_phone: '',
    shipping_address: '', shipping_city: '', shipping_state: '', shipping_zip: '',
  });

  useEffect(() => {
    setItems(getCartItems());
    return subscribeToCart(() => setItems(getCartItems()));
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setForm(prev => ({
        ...prev,
        shipping_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        shipping_email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  const total = getCartTotal();
  const shipping = total > 500000 ? 0 : 2500; // Free shipping for large solar projects
  const tax = total * 0.16; // Kenya VAT 16%
  const grandTotal = total + shipping + tax;

  // Progress logic
  const filledFields = Object.values(form).filter(v => v.trim()).length;
  const progress = Math.round((filledFields / 7) * 100);

  // Compatibility Check
  const compatWarnings = [];
  const itemNames = items.map(i => (i.product_name || '').toLowerCase());
  if (itemNames.some(n => n.includes('panel')) && !itemNames.some(n => n.includes('mounting') || n.includes('bracket'))) {
    compatWarnings.push('Missing Mounting Kit - Ensure you have or select brackets for your panels.');
  }
  if (itemNames.some(n => n.includes('inverter')) && !itemNames.some(n => n.includes('battery'))) {
    compatWarnings.push('No Backup Storage - Consider adding batteries for night-time power.');
  }

  useEffect(() => {
    if (items.length === 0) navigate('/cart');
  }, [items, navigate]);

  const update = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        user_id: user?.id || null,
        items: items.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          price: i.price,
          quantity: i.quantity,
          image_url: i.image_url,
        })),
        subtotal: total,
        shipping,
        tax: Math.round(tax * 100) / 100,
        total: Math.round(grandTotal * 100) / 100,
        status: 'pending',
        ...form,
      };

      const { data: newOrder, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }

      clearCart();
      const queryParams = new URLSearchParams({ id: newOrder.id, email: form.shipping_email });
      navigate(`/order-confirmed?${queryParams.toString()}`);
    } catch (err) {
      console.error('Checkout error:', err);
      alert('There was an error placing your order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      {/* Progress Ray */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-muted z-50">
        <motion.div
          className="h-full bg-primary shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Main Form Left */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-black text-foreground mb-4 tracking-tighter">
                Complete Order<span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Your transaction is protected with 256-bit bank-level encryption.
              </p>
            </div>

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-10">
              {/* Contact */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-background border hairline border-border p-8 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black">
                    01
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-foreground">Contact details</h2>
                    <p className="text-xs text-muted-foreground">Where should we send your updates?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Full Name</Label>
                    <Input
                      required
                      value={form.shipping_name}
                      onChange={e => update('shipping_name', e.target.value)}
                      className="rounded-lg h-12 border-border focus:ring-primary focus:border-primary px-4"
                      placeholder="e.g. John Kamau"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Email Address</Label>
                    <Input
                      type="email"
                      required
                      value={form.shipping_email}
                      onChange={e => update('shipping_email', e.target.value)}
                      className="rounded-lg h-12 border-border"
                      placeholder="name@company.com"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Mobile Phone</Label>
                    <Input
                      type="tel"
                      required
                      value={form.shipping_phone}
                      onChange={e => update('shipping_phone', e.target.value)}
                      className="rounded-lg h-12 border-border"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                </div>
              </motion.section>

              {/* Shipping */}
              <motion.section 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-background border hairline border-border p-8 rounded-2xl shadow-sm"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center font-black">
                    02
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-lg text-foreground">Delivery address</h2>
                    <p className="text-xs text-muted-foreground">Fast transit via G4S or SolarGear Express.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Estate / Street Address</Label>
                    <Input
                      required
                      value={form.shipping_address}
                      onChange={e => update('shipping_address', e.target.value)}
                      className="rounded-lg h-12 border-border"
                      placeholder="Apartment, Street, House No."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">City</Label>
                    <Input
                      required
                      value={form.shipping_city}
                      onChange={e => update('shipping_city', e.target.value)}
                      className="rounded-lg h-12 border-border"
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">County</Label>
                      <Input
                        required
                        value={form.shipping_state}
                        onChange={e => update('shipping_state', e.target.value)}
                        className="rounded-lg h-12 border-border"
                        placeholder="Nairobi County"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Postal Code</Label>
                      <Input
                        required
                        value={form.shipping_zip}
                        onChange={e => update('shipping_zip', e.target.value)}
                        className="rounded-lg h-12 border-border"
                        placeholder="00100"
                      />
                    </div>
                  </div>
                </div>
              </motion.section>
            </form>
          </div>

          {/* Sidebar Area Right */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* COMPATIBILITY CHECKERS */}
              <AnimatePresence>
                {compatWarnings.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3"
                  >
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      Expert Recommendation
                    </div>
                    <div className="space-y-2">
                      {compatWarnings.map((w, idx) => (
                        <p key={idx} className="text-xs text-amber-700 font-medium leading-relaxed">
                          {w}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SAVINGS INFO */}
              <div className="bg-primary/5 border hairline border-primary/20 p-4 rounded-xl flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-primary tracking-widest mb-1 italic">Investment Benefit</h4>
                  <p className="text-[11px] text-muted-foreground font-medium leading-tight">
                    This system will eliminate up to 85% of your KPLC bills. Estimated payback: <span className="text-foreground font-bold">4.2 years.</span>
                  </p>
                </div>
              </div>

              {/* SUMMARY BOX */}
              <div className="bg-background border hairline border-border rounded-2xl shadow-xl overflow-hidden">
                <div className="p-6 bg-foreground text-background">
                  <h3 className="font-heading font-black text-sm uppercase tracking-widest flex items-center justify-between">
                    Order Summary
                    <span className="text-[10px] opacity-60 font-medium lowercase">({items.length} items)</span>
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="max-h-48 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                    {items.map(item => (
                      <div key={item.product_id} className="flex justify-between items-start gap-4">
                        <div className="flex flex-1 min-w-0 flex-col">
                          <span className="text-[11px] font-bold text-foreground truncate">{item.product_name}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-xs font-black text-foreground">KSh {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t hairline border-border space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">KSh {total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Delivery & Handling</span>
                      <span className="text-foreground">{shipping === 0 ? <span className="text-green-600 font-bold uppercase tracking-tighter">Free</span> : `KSh ${shipping.toLocaleString()}`}</span>
                    </div>
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">VAT (16%)</span>
                      <span className="text-foreground">KSh {tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t-2 border-dashed border-border mt-2">
                      <span className="font-heading font-black text-xs uppercase tracking-widest text-muted-foreground mb-1">Final Total</span>
                      <span className="font-heading font-black text-2xl text-foreground tracking-tighter">
                        KSh {grandTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <Button
                    form="checkout-form"
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-black rounded-xl h-14 relative overflow-hidden group shadow-lg shadow-primary/20"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Finalizing...</>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" /> 
                        Buy Now
                        <div className="absolute right-[-20%] top-[-50%] w-24 h-48 bg-white/20 skew-x-[35deg] group-hover:left-[110%] transition-all duration-700" />
                      </>
                    )}
                  </Button>
                  
                  <p className="text-[9px] text-center text-muted-foreground font-bold uppercase tracking-widest">
                    Guarantee: 25-Year Warranty on System Components
                  </p>
                </div>
              </div>

              {/* UPSELL SECTION */}
              <CheckoutUpsell cartItems={items} />

              <div className="flex items-center justify-center gap-4 py-4 opacity-40">
                <div className="h-px flex-1 bg-border" />
                <Lock className="w-3 h-3" />
                <div className="h-px flex-1 bg-border" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

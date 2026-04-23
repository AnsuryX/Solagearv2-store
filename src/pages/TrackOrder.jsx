import { useState, useEffect } from 'react';
import { db } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search, Truck, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const STATUS_STEPS = [
  { key: 'pending', label: 'Order Placed', icon: Clock, description: 'We have received your order.' },
  { key: 'processing', label: 'Processing', icon: Package, description: 'Your items are being prepared.' },
  { key: 'shipped', label: 'Shipped', icon: Truck, description: 'Your order is on the way.' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle2, description: 'Package has reached its destination.' }
];

export default function TrackOrder() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (searchParams.get('auto') === 'true' && orderId && email) {
      handleTrack(null);
    }
  }, []);

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Fetch all orders for this email
      const { data: results, error: trackError } = await db.supabase
        .from('orders')
        .select('*')
        .eq('shipping_email', email);
      
      if (trackError) throw trackError;

      if (results && results.length > 0) {
        // Match by full ID or short ID (8 chars)
        const foundOrder = results.find(o => 
          o.id === orderId || o.id.substring(0, 8).toUpperCase() === orderId.toUpperCase()
        );

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setError('Order ID not found for this email.');
        }
      } else {
        setError('No orders found for this email address.');
      }
    } catch (err) {
      console.error('Tracking error:', err);
      setError('An error occurred while fetching your order details.');
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = order ? (order.status === 'cancelled' ? -1 : STATUS_STEPS.findIndex(s => s.key === order.status)) : -1;

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-black text-foreground tracking-tight mb-4">Track Your <span className="text-primary italic">SolarGear</span></h1>
        <p className="text-muted-foreground">Keep an eye on your clean energy transformation.</p>
      </div>

      <div className="bg-background border-2 border-border/50 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

        <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end relative z-10">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Order ID</Label>
            <Input 
              value={orderId} 
              onChange={e => setOrderId(e.target.value)}
              placeholder="e.g. ord_123..." 
              className="rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary/30 font-medium" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Shipping Email</Label>
            <Input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)}
              placeholder="customer@example.com" 
              className="rounded-2xl h-14 bg-muted/20 border-transparent focus:border-primary/30 font-medium" 
              required
            />
          </div>
          <Button 
            disabled={loading}
            className="rounded-2xl h-14 solar-gradient shadow-xl shadow-primary/20 font-black hover:opacity-90 transition-all"
          >
            {loading ? 'Locating...' : (
              <span className="flex items-center gap-2 uppercase tracking-wider text-xs">
                Track Status <Search className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-4 bg-destructive/10 text-destructive text-center rounded-2xl font-bold text-sm border border-destructive/20"
            >
              {error}
            </motion.div>
          )}

          {order && (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b-2 border-dashed border-border/50">
                <div>
                  <h3 className="font-heading font-black text-xl mb-1 flex items-center gap-2">
                    Order #{order.id.slice(-8).toUpperCase()}
                    <span className={`text-[10px] px-3 py-1 rounded-full uppercase tracking-widest ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'}`}>
                      {order.status}
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">Order Date: {new Date(order.created_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-1">Total Bill</p>
                  <p className="text-2xl font-black text-foreground">KSh {order.total?.toLocaleString()}</p>
                </div>
              </div>

              {/* Status Stepper */}
              <div className="relative">
                {order.status === 'cancelled' ? (
                  <div className="text-center p-8 bg-destructive/5 rounded-3xl border-2 border-destructive/10">
                    <p className="text-destructive font-bold">This order has been cancelled.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {STATUS_STEPS.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStatusIndex;
                      const isCurrent = idx === currentStatusIndex;
                      
                      return (
                        <div key={step.key} className="relative flex flex-col items-center">
                          {/* Progress Line */}
                          {idx < STATUS_STEPS.length - 1 && (
                            <div className={`hidden md:block absolute top-[22px] left-[50%] w-full h-1 z-0 transition-colors duration-500 ${idx < currentStatusIndex ? 'bg-primary' : 'bg-muted/30'}`} />
                          )}
                          
                          <div className={`w-12 h-12 rounded-full z-10 flex items-center justify-center transition-all duration-500 shadow-lg ${isCurrent ? 'bg-primary text-white scale-125 ring-8 ring-primary/20' : isCompleted ? 'bg-primary/80 text-white' : 'bg-muted/30 text-muted-foreground'}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-center mt-6">
                            <h4 className={`text-sm font-black uppercase tracking-widest mb-1 ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</h4>
                            <p className="text-[10px] text-muted-foreground max-w-[120px]">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-muted/20 p-6 rounded-3xl border border-border/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Truck className="w-5 h-5 text-primary" />
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider">Shipping Details</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase mb-1">Deliver To</p>
                      <p className="text-sm font-bold">{order.shipping_name}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_address}</p>
                      <p className="text-xs text-muted-foreground">{order.shipping_city}, Kenya</p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/20 p-6 rounded-3xl border border-border/10">
                  <div className="flex items-center gap-3 mb-4">
                    <Package className="w-5 h-5 text-primary" />
                    <h4 className="font-heading font-black text-sm uppercase tracking-wider">Order Items</h4>
                  </div>
                  <div className="space-y-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-border/10 text-xs font-black">
                          {item.quantity}x
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-none">{item.product_name}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">KSh {item.price?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">Having trouble tracking? <Link to="/faq" className="text-primary font-bold hover:underline">Check FAQs</Link> or <Link to="/contact" className="text-primary font-bold hover:underline">Contact Support</Link></p>
      </div>
    </div>
  );
}

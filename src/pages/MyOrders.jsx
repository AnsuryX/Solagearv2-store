import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';

import { Link } from 'react-router-dom';
import { Package, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];
const STATUS_STYLE = {
  pending: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function OrderTracker({ status }) {
  const cancelledIdx = status === 'cancelled' ? -1 : STATUS_STEPS.indexOf(status);
  if (status === 'cancelled') {
    return <span className="text-xs text-red-600 font-medium">This order was cancelled.</span>;
  }
  return (
    <div className="flex items-center gap-0 w-full max-w-sm mt-3">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center flex-1 last:flex-none">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 transition-colors ${i <= cancelledIdx ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {i + 1}
          </div>
          <div className={`h-[2px] flex-1 transition-colors ${i < cancelledIdx ? 'bg-primary' : 'bg-muted'} ${i === STATUS_STEPS.length - 1 ? 'hidden' : ''}`} />
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border hairline border-border rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-start gap-4 text-left">
          <Package className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="font-heading font-semibold text-sm text-foreground">
              Order #{order.id?.substring(0, 8).toUpperCase()} — {order.items?.length} item(s)
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              KSh {order.total?.toLocaleString()} · {new Date(order.created_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <OrderTracker status={order.status} />
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[order.status] || 'bg-muted text-muted-foreground'}`}>
            {order.status}
          </span>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t hairline border-border overflow-hidden"
          >
            <div className="p-5 space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-3 items-center">
                  {item.image_url && (
                    <div className="w-10 h-10 bg-muted rounded-sm overflow-hidden shrink-0">
                      <img src={item.image_url} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-heading font-semibold">{item.product_name}</p>
                    <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} × KSh {item.price?.toLocaleString()}</p>
                  </div>
                  <p className="text-xs font-bold font-heading">KSh {(item.price * item.quantity)?.toLocaleString()}</p>
                </div>
              ))}
              <div className="border-t hairline border-border pt-3 text-xs text-muted-foreground space-y-1">
                <p><strong>Ship to:</strong> {[order.shipping_name, order.shipping_address, order.shipping_city].filter(Boolean).join(', ')}</p>
                <p><strong>Contact:</strong> {order.shipping_email} · {order.shipping_phone}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function MyOrders() {
  const { user, isAuthenticated, isLoadingAuth, navigateToLogin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    async function load() {
      // Query primarily by shipping_email which matches user account email
      // We avoid columns that might have schema cache issues like user_id/created_by
      const { data, error } = await db.supabase
        .from('orders')
        .select('*')
        .eq('shipping_email', user.email)
        .order('created_date', { ascending: false })
        .limit(50);

      if (!error) {
        setOrders(data || []);
      }
      setLoading(false);
    }
    load();
  }, [isAuthenticated, user]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-border border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <LogIn className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Sign In to View Orders</h1>
        <p className="text-sm text-muted-foreground mb-6">Track your SolarGear orders by signing into your account.</p>
        <Button onClick={navigateToLogin} className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-1">Account</p>
        <h1 className="font-heading text-3xl font-bold text-foreground">My Orders</h1>
        <p className="text-sm text-muted-foreground mt-1">Logged in as {user?.email}</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
          <Link to="/products">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
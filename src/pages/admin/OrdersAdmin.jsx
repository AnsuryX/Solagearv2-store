import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { X, ChevronDown, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const STATUS_STYLE = {
  pending: 'bg-orange-100 text-orange-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await db.entities.Order.list('-created_date', 200);
      setOrders(data || []);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      // Use the robust server-side status update API that handles Supabase and Email
      const response = await fetch('/api/zoho/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server failed to update status');
      }

      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }));
      
      toast({
        title: "Status updated & customer notified",
        description: `Order moved to ${newStatus}. Status email sent to customer.`,
      });
    } catch (err) {
      console.error('Status update error:', err);
      toast({
        title: "Update failed",
        description: err.message || "Failed to update order status.",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter(o => {
    const s = search.toLowerCase();
    const matchSearch = !s || 
      o.id?.toLowerCase().includes(s) || 
      o.shipping_name?.toLowerCase().includes(s) || 
      o.shipping_email?.toLowerCase().includes(s);
    const matchStatus = filter === 'all' || o.status === filter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Order Management</h1>
          <p className="text-sm text-muted-foreground">{orders.length} total orders recorded</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="rounded-sm">
          Refresh
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Input 
            placeholder="Search by Order ID, Name or Email..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="rounded-sm pl-9"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <X className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground transition-opacity ${search ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSearch('')} />
        </div>
        
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-sm transition-colors capitalize ${
                filter === s ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {s} {s === 'all' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="border hairline border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b hairline border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Order No.</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden md:table-cell">Items</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Total</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Date</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b hairline border-border">
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No orders {filter !== 'all' ? `with status "${filter}"` : ''} yet.
                </td>
              </tr>
            ) : filtered.map(order => (
              <tr key={order.id} className="border-b hairline border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">
                    #{order.id.substring(0, 8).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-heading font-semibold text-xs text-foreground text-nowrap">{order.shipping_name || 'Guest'}</p>
                  <p className="text-[11px] text-muted-foreground">{order.shipping_email}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                  {order.items?.length || 0} item(s)
                </td>
                <td className="px-4 py-3 text-xs font-heading font-bold text-foreground">
                  KSh {order.total?.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className={`text-[10px] px-2 py-1 pr-6 rounded-full font-medium border-0 appearance-none cursor-pointer ${STATUS_STYLE[order.status] || 'bg-muted text-muted-foreground'}`}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 pointer-events-none opacity-60" />
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                  {new Date(order.created_date).toLocaleDateString('en-KE')}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelected(order)}
                    className="text-xs text-primary hover:underline"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-background border-l hairline border-border h-full overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-heading font-bold text-lg leading-tight">Order Details</h2>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">ID: #{selected.id.substring(0, 8).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Customer info */}
            <div className="space-y-1 mb-6 p-4 bg-muted/30 rounded-sm">
              <p className="font-heading font-semibold text-sm">{selected.shipping_name}</p>
              <p className="text-xs text-muted-foreground">{selected.shipping_email}</p>
              <p className="text-xs text-muted-foreground">{selected.shipping_phone}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {[selected.shipping_address, selected.shipping_city, selected.shipping_state, selected.shipping_zip].filter(Boolean).join(', ')}
              </p>
            </div>

            {/* Items */}
            <div className="mb-6">
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Items</h4>
              <div className="space-y-3">
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    {item.image_url && (
                      <div className="w-10 h-10 bg-muted rounded-sm overflow-hidden shrink-0">
                        <img src={item.image_url} alt="" className="w-full h-full object-contain p-1" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-heading font-semibold text-foreground">{item.product_name}</p>
                      <p className="text-[11px] text-muted-foreground">Qty: {item.quantity} × KSh {item.price?.toLocaleString()}</p>
                    </div>
                    <p className="text-xs font-heading font-bold">KSh {(item.price * item.quantity)?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t hairline border-border pt-4 space-y-1.5 mb-6">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span><span>KSh {selected.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Shipping</span><span>{selected.shipping === 0 ? 'Free' : `KSh ${selected.shipping}`}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>VAT</span><span>KSh {selected.tax?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-heading font-bold text-sm pt-2 border-t hairline border-border">
                <span>Total</span><span>KSh {selected.total?.toLocaleString()}</span>
              </div>
            </div>

            {/* Status update */}
            <div>
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-2">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selected.id, s)}
                    className={`text-xs px-3 py-1.5 rounded-sm font-medium capitalize transition-colors ${
                      selected.status === s
                        ? 'bg-foreground text-background'
                        : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
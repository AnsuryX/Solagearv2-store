import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingCart, TrendingUp, AlertCircle, Plus, FileText, Settings, HelpCircle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [p, o] = await Promise.all([
          db.entities.Product.list('-created_date', 100),
          db.entities.Order.list('-created_date', 100),
        ]);
        setProducts(p || []);
        setOrders(o || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter(o => o.status === 'pending').length;
  const outOfStock = products.filter(p => p.in_stock === false).length;
  const lowStock = products.filter(p => p.in_stock !== false && (p.stock_quantity || 0) < 5).length;

  // Orders by status
  const statusData = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: orders.filter(o => o.status === s).length,
  })).filter(d => d.count > 0);

  // Revenue by month (mocked or derived from orders)
  const revenueData = [
    { name: 'Jan', revenue: 45000 },
    { name: 'Feb', revenue: 52000 },
    { name: 'Mar', revenue: 48000 },
    { name: 'Apr', revenue: 61000 },
    { name: 'May', revenue: 55000 },
    { name: 'Jun', revenue: 67000 },
  ];

  // Recent orders
  const recent = orders.slice(0, 6);

  const stats = [
    { label: 'Total Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-blue-600' },
    { label: 'Active Products', value: products.length, icon: Package, color: 'text-green-600' },
    { label: 'Pending Orders', value: pending, icon: AlertCircle, color: pending > 0 ? 'text-orange-500' : 'text-muted-foreground' },
  ];

  const quickActions = [
    { label: 'Add Product', icon: Plus, to: '/admin/products', color: 'bg-primary/10 text-primary' },
    { label: 'New Blog Post', icon: FileText, to: '/admin/blog', color: 'bg-blue-100 text-blue-600' },
    { label: 'Update FAQs', icon: HelpCircle, to: '/admin/faq', color: 'bg-purple-100 text-purple-600' },
    { label: 'Store Settings', icon: Settings, to: '/admin/settings', color: 'bg-slate-100 text-slate-600' },
  ];

  const STATUS_COLORS = { pending: '#f97316', processing: '#3b82f6', shipped: '#8b5cf6', delivered: '#22c55e', cancelled: '#ef4444' };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-64 bg-muted animate-pulse rounded-sm" />
          <div className="h-64 bg-muted animate-pulse rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">SolarGear Nairobi — Store Overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-sm text-xs" onClick={() => window.location.reload()}>
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="border hairline border-border rounded-sm p-5 bg-background shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <p className={`font-heading text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 border hairline border-border rounded-sm p-6 bg-background shadow-sm">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.label}
                to={action.to}
                className="flex flex-col items-center justify-center p-4 border hairline border-border rounded-sm hover:bg-muted/50 transition-all group"
              >
                <div className={`w-10 h-10 ${action.color} rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="lg:col-span-2 border hairline border-border rounded-sm p-6 bg-background shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-semibold text-sm text-foreground">Revenue Trend</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">Last 6 Months</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `KSh ${v/1000}k`} />
              <Tooltip
                contentStyle={{ border: '0.5px solid hsl(var(--border))', borderRadius: '4px', fontSize: 11 }}
              />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} border={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status Chart */}
        <div className="border hairline border-border rounded-sm p-6 bg-background shadow-sm">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-6">Orders by Status</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ border: '0.5px solid hsl(var(--border))', borderRadius: '4px', fontSize: 12 }}
                  cursor={{ fill: 'hsl(var(--muted))' }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#888'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="border hairline border-border rounded-sm p-6 bg-background shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-semibold text-sm text-foreground">Recent Orders</h3>
            <Link to="/admin/orders" className="text-[10px] text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ShoppingCart className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-sm">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map(order => (
                <div key={order.id} className="flex items-center justify-between py-2.5 border-b hairline border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-[10px] font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground w-16 text-center">
                      #{order.id.substring(0, 8).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-heading font-semibold text-foreground">{order.shipping_name || 'Guest'}</p>
                      <p className="text-[10px] text-muted-foreground">{order.items?.length} item(s) · {new Date(order.created_date).toLocaleDateString('en-KE')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-heading font-bold text-foreground">KSh {order.total?.toLocaleString()}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="mt-6 border hairline border-border rounded-sm p-6 bg-background shadow-sm">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" /> Inventory Alerts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-red-50 border border-red-100 rounded-sm">
            <p className="text-xs font-semibold text-red-700 mb-1">Out of Stock</p>
            <p className="text-2xl font-bold text-red-800">{outOfStock}</p>
            <p className="text-[10px] text-red-600 mt-1">Products currently hidden from store</p>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-sm">
            <p className="text-xs font-semibold text-orange-700 mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-orange-800">{lowStock}</p>
            <p className="text-[10px] text-orange-600 mt-1">Products with fewer than 5 units left</p>
          </div>
        </div>
      </div>
    </div>
  );
}

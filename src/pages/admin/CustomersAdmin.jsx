import { db } from '@/api/base44Client';
import React, { useState, useEffect } from 'react';

import { Users, Mail, Package, ChevronDown, ChevronUp, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CustomersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await db.entities.Order.list('-created_date', 500);
        setOrders(data || []);
      } catch (err) {
        console.error('Error loading customers:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = () => {
    const list = Object.values(customers)
      .sort((a, b) => b.total_spent - a.total_spent)
      .filter(c => {
        const q = search.toLowerCase();
        return !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
      });

    const headers = ['Name', 'Email', 'Phone', 'City', 'Total Orders', 'Total Spent'];
    const rows = list.map(c => [
      c.name,
      c.email,
      c.phone || '',
      c.city || '',
      c.orders.length,
      c.total_spent
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group orders by email
  const customers = {};
  orders.forEach(o => {
    const email = o.shipping_email || o.created_by || 'Unknown';
    if (!customers[email]) {
      customers[email] = {
        email,
        name: o.shipping_name || 'Unknown',
        phone: o.shipping_phone,
        city: o.shipping_city,
        orders: [],
        total_spent: 0,
      };
    }
    customers[email].orders.push(o);
    customers[email].total_spent += o.total || 0;
  });

  const list = Object.values(customers)
    .sort((a, b) => b.total_spent - a.total_spent)
    .filter(c => {
      const q = search.toLowerCase();
      return !q || c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q);
    });

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Customers</h1>
        <p className="text-sm text-muted-foreground">{list.length} unique customers from orders</p>
      </div>

      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9 rounded-sm" />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="rounded-sm gap-2 text-xs">
          <Download className="w-3.5 h-3.5" /> Export CSV
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Customers', value: Object.keys(customers).length, icon: Users },
          { label: 'Total Orders', value: orders.length, icon: Package },
          { label: 'Avg. Order Value', value: orders.length ? `KSh ${Math.round(orders.reduce((s, o) => s + (o.total || 0), 0) / orders.length).toLocaleString()}` : '—', icon: Mail },
        ].map(s => (
          <div key={s.label} className="border hairline border-border rounded-sm p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-sm flex items-center justify-center">
              <s.icon className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-heading font-bold text-foreground">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border hairline border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b hairline border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Customer</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden md:table-cell">Location</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Orders</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Total Spent</th>
              <th className="px-4 py-3 w-8" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b hairline border-border">
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-40" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-20" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-12" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  <td />
                </tr>
              ))
            ) : list.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No customers found</td></tr>
            ) : list.map(c => (
              <React.Fragment key={c.email}>
                <tr
                  className="border-b hairline border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setExpanded(expanded === c.email ? null : c.email)}
                >
                  <td className="px-4 py-3">
                    <p className="font-heading font-semibold text-xs text-foreground">{c.name}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {c.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{c.city || '—'}</td>
                  <td className="px-4 py-3 text-xs font-medium">{c.orders.length}</td>
                  <td className="px-4 py-3 text-xs font-heading font-bold text-foreground">KSh {c.total_spent.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {expanded === c.email ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </td>
                </tr>
                {expanded === c.email && (
                  <tr className="border-b hairline border-border bg-muted/10">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="space-y-1.5">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Order History</p>
                        {c.orders.map(o => (
                          <div key={o.id} className="flex items-center justify-between text-xs bg-background border hairline border-border rounded-sm px-3 py-2">
                            <span className="text-muted-foreground">{new Date(o.created_date).toLocaleDateString('en-KE')}</span>
                            <span>{o.items?.length || 0} item(s)</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              o.status === 'delivered' ? 'bg-green-100 text-green-700' :
                              o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>{o.status}</span>
                            <span className="font-heading font-bold">KSh {o.total?.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

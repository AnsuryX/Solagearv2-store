import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Sun, ArrowLeft, BookOpen, Users, Settings, HelpCircle } from 'lucide-react';
import AdminGuard from '../AdminGuard';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/blog', icon: BookOpen, label: 'Blog' },
  { to: '/admin/faq', icon: HelpCircle, label: 'FAQs' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();

  return (
    <AdminGuard>
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r hairline border-border flex flex-col">
        <div className="h-14 flex items-center gap-2 px-5 border-b hairline border-border">
          <Sun className="w-5 h-5 text-primary" />
          <span className="font-heading font-bold text-sm text-foreground">Admin Panel</span>
        </div>
        
        {/* Bypass Indicator */}
        <div className="px-5 py-2 bg-amber-500/10 border-b hairline border-amber-500/20">
          <p className="text-[10px] font-black uppercase tracking-tighter text-amber-600">
            Auth Bypass Active
          </p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-3 py-4 border-t hairline border-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
          </Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
    </AdminGuard>
  );
}
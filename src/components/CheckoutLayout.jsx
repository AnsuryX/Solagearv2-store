import { Outlet, Link } from 'react-router-dom';
import { Sun } from 'lucide-react';

export default function CheckoutLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b hairline border-border">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-center">
          <Link to="/" className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary" />
            <span className="font-heading font-bold text-foreground">SOLARGEAR</span>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Sun, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCartCount, subscribeToCart } from '../lib/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/AuthContext';
import SearchBar from './SearchBar';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartCount());
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setCartCount(getCartCount());
    return subscribeToCart(() => setCartCount(getCartCount()));
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const links = [
    { to: '/products', label: 'Products' },
    { to: '/kits', label: 'Packages' },
    { to: '/blog', label: 'Blog' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-morphism shadow-lg py-1' : 'bg-transparent py-4'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 solar-gradient rounded-xl flex items-center justify-center solar-glow group-hover:scale-110 transition-transform duration-500">
            <Sun className="w-6 h-6 text-primary-foreground transition-transform group-hover:rotate-90 duration-700" />
          </div>
          <span className="font-heading font-extrabold text-xl tracking-tighter text-foreground">
            SOLAR<span className="text-primary">GEAR</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors" title="Search products">
            <Search className="w-5 h-5" />
          </button>
          
          {isAuthenticated ? (
            <Link to="/account" className="flex items-center gap-2 group" title="Account">
               <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-transparent group-hover:border-primary transition-all">
                <User className="w-4 h-4 text-primary" />
              </div>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hidden sm:flex text-xs font-bold uppercase tracking-widest gap-2">
                Sign In
              </Button>
            </Link>
          )}

          <Link to="/cart" className="relative group">
            <ShoppingBag className="w-5 h-5 text-foreground group-hover:text-primary transition-colors" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-foreground"
          >

            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden silica-blur border-b hairline border-border"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
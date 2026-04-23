import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sun, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          }
        });
        if (signUpError) throw signUpError;
        setMode('login');
        setError('Verification email sent! Please check your inbox.');
        setLoading(false);
        return;
      }
      
      // Successfully authenticated
      // Check if it's the admin email
      if (email === 'solargearlrd@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/my-orders');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground relative overflow-hidden px-6 py-12">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-background border-2 border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 solar-gradient rounded-xl mb-6 solar-glow group transition-transform hover:scale-110">
              <Sun className="w-6 h-6 text-white" />
            </Link>
            <h1 className="font-heading text-2xl font-black text-foreground tracking-tighter">
              {mode === 'login' ? 'Account Login' : 'Create Account'}
            </h1>
            <p className="text-xs text-muted-foreground mt-2 font-medium">
              Join the SolarGear clean energy revolution
            </p>
          </div>

          {/* Toggle Mode */}
          <div className="flex bg-muted/30 rounded-full p-1 mb-8">
            <button 
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${mode === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              SIGN IN
            </button>
            <button 
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${mode === 'signup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-4 text-xs rounded-2xl border font-medium ${error.includes('Verification') ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}
              >
                {error}
              </motion.div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black ml-1 text-muted-foreground">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="rounded-2xl h-12 bg-muted/30 border-2 border-transparent focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <Label htmlFor="password" title="password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                title="password"
                className="rounded-2xl h-12 bg-muted/30 border-2 border-transparent focus:border-primary/50 transition-all font-medium"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full solar-gradient hover:opacity-90 text-white font-heading font-black rounded-2xl h-14 text-sm solar-glow group shadow-xl mt-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {mode === 'login' ? 'AUTHENTICATE' : 'CREATE ACCOUNT'} <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          <Link 
            to="/" 
            className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
          >
            <ArrowLeft className="w-3 h-3" /> Back to Store
          </Link>
        </div>
        
        <p className="mt-8 text-center text-white/30 text-[10px] font-bold uppercase tracking-[0.3em]">
          SolarGear Power Systems © 2026
        </p>
      </motion.div>
    </div>
  );
}

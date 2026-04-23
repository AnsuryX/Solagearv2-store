import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { db } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package, Settings, LogOut, ChevronRight, MapPin, Phone, Truck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Account() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    async function loadProfile() {
      try {
        const data = await db.entities.Customer.filter({ email: user.email });
        if (data && data.length > 0) {
          setProfile(data[0]);
        } else {
          // If no profile exists, initialize with email
          setProfile(p => ({ ...p, email: user.email }));
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile.id) {
        await db.entities.Customer.update(profile.id, profile);
      } else {
        const newProfile = await db.entities.Customer.create({ ...profile, email: user.email });
        setProfile(newProfile);
      }
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-8"
      >
        {/* Sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-background border-2 border-border/50 rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4 border-4 border-background shadow-lg">
                <User className="w-10 h-10 text-primary" />
              </div>
              <h2 className="font-heading font-black text-lg">{profile.full_name || 'Valued Customer'}</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            
            <nav className="mt-8 space-y-2">
              <Link to="/my-orders" className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                <span className="flex items-center gap-3 text-sm font-bold">
                  <Package className="w-4 h-4 text-primary" /> Order History
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/track-order" className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors group">
                <span className="flex items-center gap-3 text-sm font-bold">
                  <Truck className="w-4 h-4 text-primary" /> Track Order
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
              <button onClick={logout} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-destructive/10 text-destructive text-sm font-bold transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          <div className="bg-background border-2 border-border/50 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <Settings className="w-6 h-6 text-primary" />
              <h2 className="font-heading font-black text-2xl">Profile Settings</h2>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profile.full_name} 
                    onChange={e => setProfile({...profile, full_name: e.target.value})}
                    placeholder="John Doe" 
                    className="pl-12 rounded-2xl h-12 bg-muted/20 border-transparent focus:border-primary/30" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profile.phone} 
                    onChange={e => setProfile({...profile, phone: e.target.value})}
                    placeholder="+254 700 000000" 
                    className="pl-12 rounded-2xl h-12 bg-muted/20 border-transparent focus:border-primary/30" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">City</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profile.city} 
                    onChange={e => setProfile({...profile, city: e.target.value})}
                    placeholder="Nairobi" 
                    className="pl-12 rounded-2xl h-12 bg-muted/20 border-transparent focus:border-primary/30" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Shipping Address</Label>
                <div className="relative">
                   <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    value={profile.address} 
                    onChange={e => setProfile({...profile, address: e.target.value})}
                    placeholder="Street, Building, Apartment" 
                    className="pl-12 rounded-2xl h-12 bg-muted/20 border-transparent focus:border-primary/30" 
                  />
                </div>
              </div>

              <div className="sm:col-span-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="w-full sm:w-auto px-10 h-12 rounded-2xl solar-gradient shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all font-bold text-lg"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                    </span>
                  ) : 'Update Profile'}
                </Button>
              </div>
            </form>
          </div>

          <div className="bg-blue-50 border-2 border-blue-100 rounded-3xl p-6">
            <h3 className="font-heading font-black text-blue-900 mb-2">Need Help?</h3>
            <p className="text-sm text-blue-700/80 mb-4">Our support team is available 24/7 to assist with your solar installations and maintenance.</p>
            <Button variant="outline" className="rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-100 font-bold">
              Contact Support
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

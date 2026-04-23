import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Store, Phone, MapPin, Mail, Globe, Cpu, AlertCircle, RefreshCw } from 'lucide-react';

const SECTIONS = [
  { key: 'store', label: 'Store Info', icon: Store },
  { key: 'contact', label: 'Contact', icon: Phone },
  { key: 'integrations', label: 'Integrations', icon: Cpu },
  { key: 'status', label: 'Store Status', icon: Globe },
];

const DEFAULTS = {
  store_name: 'SolarGear Kenya',
  store_tagline: 'Premium Solar Equipment for Kenya',
  whatsapp_number: '254141153031',
  phone: '+254 722 963 896',
  email: 'hello@solargear.co.ke',
  address: 'Westlands Commercial Centre, Waiyaki Way',
  city: 'Nairobi',
  country: 'Kenya',
  website: 'https://solargear.co.ke',
  vat_rate: '16',
  free_shipping_threshold: '50000',
  shipping_fee: '500',
  currency: 'KSh',
  maintenance_mode: false,
  holiday_mode: false,
  promo_banner_enabled: true,
  promo_banner_text: 'Free installation on all hybrid kits this month! ☀️',
};

export default function Settings() {
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState('store');
  const [testingZoho, setTestingZoho] = useState(false);
  const [zohoStatus, setZohoStatus] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    // In a real app, you'd persist this to a Settings entity or similar
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const testZoho = async () => {
    setTestingZoho(true);
    setZohoStatus(null);
    try {
      const res = await fetch('/api/zoho/test');
      const data = await res.json();
      setZohoStatus(data);
    } catch (err) {
      setZohoStatus({ success: false, message: 'Could not connect to backend' });
    } finally {
      setTestingZoho(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl text-foreground">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold text-foreground">Store Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your SolarGear store details</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar nav */}
        <div className="w-40 shrink-0 space-y-1">
          {SECTIONS.map(s => (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-sm text-sm transition-colors ${section === s.key ? 'bg-primary text-primary-foreground font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <s.icon className="w-4 h-4" /> {s.label}
            </button>
          ))}
        </div>

        {/* Form area */}
        <div className="flex-1 border hairline border-border rounded-sm p-6 space-y-5 bg-background shadow-sm">
          {section === 'store' && (
            <>
              <h2 className="font-heading font-semibold text-foreground">Store Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Store Name</Label>
                  <Input value={form.store_name} onChange={e => update('store_name', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div className="col-span-2">
                  <Label className="text-xs text-muted-foreground">Tagline</Label>
                  <Input value={form.store_tagline} onChange={e => update('store_tagline', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Currency Symbol</Label>
                  <Input value={form.currency} onChange={e => update('currency', e.target.value)} className="rounded-sm mt-1 w-20" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">VAT Rate (%)</Label>
                  <Input type="number" value={form.vat_rate} onChange={e => update('vat_rate', e.target.value)} className="rounded-sm mt-1 w-24" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Shipping Fee (KSh)</Label>
                  <Input type="number" value={form.shipping_fee} onChange={e => update('shipping_fee', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Free Shipping Threshold</Label>
                  <Input type="number" value={form.free_shipping_threshold} onChange={e => update('free_shipping_threshold', e.target.value)} className="rounded-sm mt-1" />
                </div>
              </div>
            </>
          )}

          {section === 'integrations' && (
            <div className="space-y-6">
              <div>
                <h2 className="font-heading font-semibold text-foreground mb-1">Zoho CRM Connection</h2>
                <p className="text-xs text-muted-foreground mb-4">Verify your Zoho CRM and ZeptoMail environment variables</p>
                
                <div className="p-4 bg-muted/30 rounded-sm border hairline border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">System Status</span>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-sm text-xs h-8 gap-2"
                      onClick={testZoho}
                      disabled={testingZoho}
                    >
                      <RefreshCw className={`w-3 h-3 ${testingZoho ? 'animate-spin' : ''}`} />
                      Test Connection
                    </Button>
                  </div>

                  {zohoStatus && (
                    <div className={`p-4 rounded-sm text-xs flex gap-3 ${zohoStatus.success ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {zohoStatus.success ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                      <div>
                        <p className="font-bold text-[13px]">{zohoStatus.message}</p>
                        {zohoStatus.details && <div className="mt-2 p-2 bg-red-100/50 rounded font-mono text-[10px] break-all">{typeof zohoStatus.details === 'object' ? JSON.stringify(zohoStatus.details) : zohoStatus.details}</div>}
                        {zohoStatus.apiDomain && <p className="mt-2 opacity-80 italic">Connected to: {zohoStatus.apiDomain}</p>}
                        {zohoStatus.success && <p className="mt-2 text-green-600">Successfully fetched {zohoStatus.contactsCount} contacts from your CRM.</p>}
                      </div>
                    </div>
                  )}

                  {!zohoStatus && (
                    <div className="text-[11px] text-muted-foreground bg-muted/50 p-4 rounded-sm border border-dashed border-border text-center">
                      Click "Test Connection" to verify your Zoho configuration.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Setup Troubleshooting</h3>
                <div className="text-[11px] space-y-3 leading-relaxed">
                  <p>If the connection fails, please ensure you have set these <strong>Secrets</strong> in the AI Studio Settings:</p>
                  <ul className="space-y-1 bg-muted/20 p-3 rounded border hairline border-border">
                    <li><code className="text-primary font-bold">ZOHO_CLIENT_ID</code></li>
                    <li><code className="text-primary font-bold">ZOHO_CLIENT_SECRET</code></li>
                    <li><code className="text-primary font-bold">ZOHO_REFRESH_TOKEN</code></li>
                  </ul>
                  <p className="italic text-orange-600 bg-orange-50 p-2 border border-orange-100 rounded">Note: Zoho tokens expire if the scopes aren't set to "offline". Ensure your refresh token was generated with <code>access_type=offline</code>.</p>
                </div>
              </div>
            </div>
          )}

          {section === 'contact' && (
            <>
              <h2 className="font-heading font-semibold text-foreground">Contact Details</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> WhatsApp Number (no + or spaces)</Label>
                  <Input value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)} className="rounded-sm mt-1" placeholder="254700000000" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</Label>
                  <Input value={form.phone} onChange={e => update('phone', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> Email</Label>
                  <Input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</Label>
                  <Input value={form.address} onChange={e => update('address', e.target.value)} className="rounded-sm mt-1" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">City</Label>
                    <Input value={form.city} onChange={e => update('city', e.target.value)} className="rounded-sm mt-1" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Country</Label>
                    <Input value={form.country} onChange={e => update('country', e.target.value)} className="rounded-sm mt-1" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Website</Label>
                  <Input value={form.website} onChange={e => update('website', e.target.value)} className="rounded-sm mt-1" />
                </div>
              </div>
            </>
          )}

          {section === 'status' && (
            <>
              <h2 className="font-heading font-semibold text-foreground">Store Status & Visibility</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">Operational Modes</Label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 border hairline border-border rounded-sm hover:bg-muted/30 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
                        <p className="text-[10px] text-muted-foreground">Disable checkout and show a maintenance message</p>
                      </div>
                      <input type="checkbox" checked={form.maintenance_mode} onChange={e => update('maintenance_mode', e.target.checked)} className="w-4 h-4" />
                    </label>
                    <label className="flex items-center justify-between p-3 border hairline border-border rounded-sm hover:bg-muted/30 transition-colors cursor-pointer">
                      <div>
                        <p className="text-sm font-medium text-foreground">Holiday Mode</p>
                        <p className="text-[10px] text-muted-foreground">Show a notice that shipping may be delayed</p>
                      </div>
                      <input type="checkbox" checked={form.holiday_mode} onChange={e => update('holiday_mode', e.target.checked)} className="w-4 h-4" />
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground text-foreground">Promotion Banner</Label>
                  <div className="p-4 border hairline border-border rounded-sm bg-primary/5 space-y-3">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input type="checkbox" checked={form.promo_banner_enabled} onChange={e => update('promo_banner_enabled', e.target.checked)} />
                      Enable Promotion Banner
                    </label>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground">Banner Text</Label>
                      <Input value={form.promo_banner_text} onChange={e => update('promo_banner_text', e.target.value)} className="rounded-sm text-xs bg-background text-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t hairline border-border">
            <Button
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2"
            >
              {saved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { db } from '@/api/base44Client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Phone, Mail, MapPin, MessageCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const INTERESTS = [
  'Home Solar System', 'Business / Office Solar', 'Agricultural Solar',
  'Battery Backup', 'Off-Grid System', 'Net Metering', 'Other',
];

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // 1. Send to Zoho CRM as Lead
    try {
      await fetch('/api/zoho/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: 'Contact Form'
        })
      });
    } catch (err) {
      console.error('Zoho Lead Sync Error:', err);
    }

    // 2. Send Notification Email
    await db.integrations.Core.SendEmail({
      to: 'hello@solargear.co.ke',
      subject: `New Enquiry from ${form.name} — ${form.interest || 'General'}`,
      body: `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nInterest: ${form.interest}\n\nMessage:\n${form.message}`,
    }).catch(() => {});
    setSubmitting(false);
    setDone(true);
  };

  return (
    <section className="py-20 px-6 bg-background" id="contact">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Get In Touch</p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Talk to a Solar Expert — Free
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            Our Nairobi-based team will respond within 2 hours during business hours. No pushy sales, just honest advice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-background border-2 border-border/50 rounded-3xl p-8 space-y-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
              {[
                { icon: Phone, label: 'Call Us', value: '+254 722 963 896', href: 'tel:+254722963896' },
                { icon: MessageCircle, label: 'WhatsApp', value: '+254 141 153 031', href: 'https://wa.me/254141153031' },
                { icon: Mail, label: 'Email Us', value: 'hello@solargear.co.ke', href: 'mailto:hello@solargear.co.ke' },
                { icon: MapPin, label: 'Serving All Kenya', value: 'Nairobi HQ · All 47 Counties', href: null },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-5 group">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:solar-glow transition-all duration-500">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{label}</p>
                    {href ? (
                      <a href={href} className="font-heading font-black text-base text-foreground hover:text-primary transition-colors">{value}</a>
                    ) : (
                      <p className="font-heading font-black text-base text-foreground">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Hours */}
            <div className="bg-muted/40 border hairline border-border rounded-sm p-6">
              <h4 className="font-heading font-semibold text-sm mb-3">Business Hours</h4>
              {[
                ['Mon – Fri', '8:00 AM – 6:00 PM'],
                ['Saturday', '9:00 AM – 4:00 PM'],
                ['Sunday', 'WhatsApp only'],
              ].map(([day, time]) => (
                <div key={day} className="flex justify-between text-xs py-1.5 border-b hairline border-border last:border-0">
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium text-foreground">{time}</span>
                </div>
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/254141153031?text=${encodeURIComponent('Hi SolarGear! I\'d like to get a free solar consultation.')}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-500 text-white font-heading font-semibold py-3 rounded-sm text-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Chat on WhatsApp Instead
            </a>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-16 border hairline border-border rounded-sm"
              >
                <CheckCircle2 className="w-14 h-14 text-green-500 mb-4" />
                <h3 className="font-heading text-2xl font-bold mb-2">Message Received!</h3>
                <p className="text-muted-foreground text-sm max-w-xs">Our team will reach out within 2 hours. Keep an eye on your phone and email.</p>
                <button onClick={() => { setDone(false); setForm({ name: '', email: '', phone: '', interest: '', message: '' }); }} className="mt-6 text-xs text-primary underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="border hairline border-border rounded-sm p-6 md:p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                    <input
                      required value={form.name} onChange={e => set('name', e.target.value)}
                      placeholder="e.g. James Mwangi"
                      className="w-full border hairline border-border rounded-sm px-4 py-2.5 text-sm bg-background outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Phone Number *</label>
                    <input
                      required value={form.phone} onChange={e => set('phone', e.target.value)}
                      placeholder="07xx xxx xxx"
                      className="w-full border hairline border-border rounded-sm px-4 py-2.5 text-sm bg-background outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email Address</label>
                  <input
                    type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full border hairline border-border rounded-sm px-4 py-2.5 text-sm bg-background outline-none focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">I'm interested in</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS.map(opt => (
                      <button
                        type="button" key={opt}
                        onClick={() => set('interest', opt)}
                        className={`text-xs px-3 py-1.5 rounded-sm border hairline transition-colors ${form.interest === opt ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-foreground'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Your Message *</label>
                  <textarea
                    required value={form.message} onChange={e => set('message', e.target.value)}
                    rows={4}
                    placeholder="Tell us about your property, current electricity bill, and what you're hoping to achieve..."
                    className="w-full border hairline border-border rounded-sm px-4 py-2.5 text-sm bg-background outline-none focus:border-primary transition-colors resize-none"
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full font-heading font-semibold gap-2">
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Enquiry</>}
                </Button>

                <p className="text-[11px] text-muted-foreground text-center">
                  🔒 Your details are secure and never shared. We'll only contact you about your solar enquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
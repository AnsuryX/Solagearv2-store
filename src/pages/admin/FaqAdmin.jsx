import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff } from 'lucide-react';

const CATEGORIES = ['General', 'Products', 'Installation', 'Pricing', 'Warranty & Support'];
const EMPTY = { question: '', answer: '', category: 'General', order: 0, published: true };

export default function FaqAdmin() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  async function load() {
    const data = await db.entities.FAQ.list('order', 100);
    setFaqs(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (f) => {
    setForm({ question: f.question, answer: f.answer, category: f.category || 'General', order: f.order || 0, published: f.published ?? true });
    setEditing(f.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, order: Number(form.order) };
    if (editing) await db.entities.FAQ.update(editing, payload);
    else await db.entities.FAQ.create(payload);
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this FAQ?')) return;
    await db.entities.FAQ.delete(id);
    load();
  };

  const togglePublish = async (faq) => {
    await db.entities.FAQ.update(faq.id, { published: !faq.published });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">FAQs</h1>
          <p className="text-sm text-muted-foreground">{faqs.length} questions · {faqs.filter(f => f.published).length} published</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2">
          <Plus className="w-4 h-4" /> Add FAQ
        </Button>
      </div>

      <div className="border hairline border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b hairline border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Question</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i} className="border-b hairline border-border">
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-64" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-16" /></td>
                  <td className="px-4 py-3" />
                </tr>
              ))
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No FAQs yet. Add your first question!</td>
              </tr>
            ) : faqs.map(faq => (
              <tr key={faq.id} className="border-b hairline border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-xs font-medium text-foreground line-clamp-1">{faq.question}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{faq.category}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(faq)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition-colors ${faq.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {faq.published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    {faq.published ? 'Published' : 'Hidden'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(faq)} className="text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(faq.id)} className="text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-lg bg-background border-l hairline border-border h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b hairline border-border">
              <h2 className="font-heading font-bold text-lg">{editing ? 'Edit FAQ' : 'New FAQ'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Question *</Label>
                <Input value={form.question} onChange={e => update('question', e.target.value)} className="rounded-sm mt-1" placeholder="How long does installation take?" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Answer *</Label>
                <textarea value={form.answer} onChange={e => update('answer', e.target.value)} rows={5} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background resize-none" placeholder="Provide a clear, helpful answer..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Display Order (lower = first)</Label>
                <Input type="number" value={form.order} onChange={e => update('order', e.target.value)} className="rounded-sm mt-1 w-24" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} />
                Published (visible on homepage)
              </label>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t hairline border-border">
              <Button onClick={handleSave} disabled={saving || !form.question || !form.answer} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2">
                {saving ? 'Saving...' : <><Check className="w-4 h-4" /> {editing ? 'Update' : 'Save'} FAQ</>}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
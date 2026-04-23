import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff, Upload, Loader2 } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const CATEGORIES = ['Solar Tips', 'News', 'Installation', 'Case Studies', 'Savings & Finance', 'Kenya Energy'];
const EMPTY = {
  title: '', slug: '', excerpt: '', content: '', cover_image_url: '',
  category: 'Solar Tips', author_name: '', read_time_minutes: 5,
  published: false, featured: false, seo_title: '', seo_description: '', tags: '',
  system_size: '', savings_achieved: '', installation_location: '', installation_date: '', payback_period: '',
};

export default function BlogAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('content');
  const [uploadingImg, setUploadingImg] = useState(false);

  async function load() {
    const data = await db.entities.BlogPost.list('-created_date', 100);
    setPosts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => { setForm(EMPTY); setEditing(null); setTab('content'); setShowForm(true); };
  const handleImgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImg(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update('cover_image_url', file_url);
    setUploadingImg(false);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '', slug: p.slug || '', excerpt: p.excerpt || '',
      content: p.content || '', cover_image_url: p.cover_image_url || '',
      category: p.category || 'Solar Tips', author_name: p.author_name || '',
      read_time_minutes: p.read_time_minutes || 5,
      published: p.published || false, featured: p.featured || false,
      seo_title: p.seo_title || '', seo_description: p.seo_description || '',
      tags: (p.tags || []).join(', '),
      system_size: p.system_size || '', savings_achieved: p.savings_achieved || '',
      installation_location: p.installation_location || '', installation_date: p.installation_date || '',
      payback_period: p.payback_period || '',
    });
    setEditing(p.id); setTab('content'); setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      read_time_minutes: Number(form.read_time_minutes),
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };
    if (editing) {
      await db.entities.BlogPost.update(editing, payload);
    } else {
      await db.entities.BlogPost.create(payload);
    }
    setShowForm(false);
    setSaving(false);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await db.entities.BlogPost.delete(id);
    load();
  };

  const togglePublish = async (post) => {
    await db.entities.BlogPost.update(post.id, { published: !post.published });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Blog Posts</h1>
          <p className="text-sm text-muted-foreground">{posts.length} posts · {posts.filter(p => p.published).length} published</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      <div className="border hairline border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b hairline border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b hairline border-border">
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-48" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-16" /></td>
                  <td className="px-4 py-3" />
                </tr>
              ))
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No blog posts yet. Create your first post!
                </td>
              </tr>
            ) : posts.map(post => (
              <tr key={post.id} className="border-b hairline border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-heading font-semibold text-xs text-foreground line-clamp-1">{post.title}</p>
                  {post.featured && <span className="text-[10px] text-primary">★ Featured</span>}
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{post.category}</td>
                <td className="px-4 py-3">
                  <button onClick={() => togglePublish(post)} className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 transition-colors ${post.published ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                    {post.published ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    {post.published ? 'Published' : 'Draft'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(post)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Editor drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-2xl bg-background border-l hairline border-border h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b hairline border-border">
              <h2 className="font-heading font-bold text-lg">{editing ? 'Edit Post' : 'New Post'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b hairline border-border px-6 overflow-x-auto">
              {['content', 'case-study', 'seo', 'settings'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-xs font-medium capitalize transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {tab === 'content' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Title *</Label>
                    <Input value={form.title} onChange={e => update('title', e.target.value)} className="rounded-sm mt-1" placeholder="How Solar Panels Work in Nairobi's Climate" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Excerpt (shown in listings)</Label>
                    <textarea value={form.excerpt} onChange={e => update('excerpt', e.target.value)} rows={2} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background resize-none" placeholder="A short summary of this article..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cover Image</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={form.cover_image_url} onChange={e => update('cover_image_url', e.target.value)} className="rounded-sm flex-1" placeholder="https://... or upload below" />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImgUpload} />
                        <div className="flex items-center gap-1.5 px-3 h-9 border hairline border-border rounded-sm text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          {uploadingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          Upload
                        </div>
                      </label>
                    </div>
                    {form.cover_image_url && (
                      <img src={form.cover_image_url} className="mt-2 h-24 rounded-sm object-cover border hairline border-border" alt="cover preview" />
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Content *</Label>
                    <div className="border hairline border-border rounded-sm overflow-hidden" style={{minHeight: 320}}>
                      <ReactQuill
                        theme="snow"
                        value={form.content}
                        onChange={v => update('content', v)}
                        style={{ minHeight: 280 }}
                        modules={{
                          toolbar: [
                            [{ header: [2, 3, false] }],
                            ['bold', 'italic', 'underline'],
                            [{ list: 'ordered' }, { list: 'bullet' }],
                            ['blockquote', 'code-block'],
                            ['link', 'image'],
                            ['clean'],
                          ]
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {tab === 'case-study' && (
                <>
                  <p className="text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-sm px-3 py-2">
                    These fields are shown as a stats banner on Case Study posts, and power the Installations Map pins.
                  </p>
                  <div>
                    <Label className="text-xs text-muted-foreground">System Size</Label>
                    <Input value={form.system_size} onChange={e => update('system_size', e.target.value)} className="rounded-sm mt-1" placeholder="e.g. 5kW Hybrid" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Annual Savings Achieved</Label>
                    <Input value={form.savings_achieved} onChange={e => update('savings_achieved', e.target.value)} className="rounded-sm mt-1" placeholder="e.g. KSh 48,000/yr" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Installation Location</Label>
                    <Input value={form.installation_location} onChange={e => update('installation_location', e.target.value)} className="rounded-sm mt-1" placeholder="e.g. Westlands, Nairobi" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Installation Date</Label>
                    <Input value={form.installation_date} onChange={e => update('installation_date', e.target.value)} className="rounded-sm mt-1" placeholder="e.g. March 2024" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Payback Period</Label>
                    <Input value={form.payback_period} onChange={e => update('payback_period', e.target.value)} className="rounded-sm mt-1" placeholder="e.g. 3.5 years" />
                  </div>
                </>
              )}

              {tab === 'seo' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">URL Slug</Label>
                    <Input value={form.slug} onChange={e => update('slug', e.target.value)} className="rounded-sm mt-1" placeholder="auto-generated-from-title" />
                    <p className="text-[10px] text-muted-foreground mt-1">Leave blank to auto-generate from title</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">SEO Title</Label>
                    <Input value={form.seo_title} onChange={e => update('seo_title', e.target.value)} className="rounded-sm mt-1" placeholder="Solar Panels in Nairobi | SolarGear Kenya" />
                    <p className={`text-[10px] mt-1 ${form.seo_title.length > 60 ? 'text-orange-500' : 'text-muted-foreground'}`}>{form.seo_title.length}/60 chars</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Meta Description</Label>
                    <textarea value={form.seo_description} onChange={e => update('seo_description', e.target.value)} rows={3} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background resize-none" placeholder="Best solar panels in Nairobi, Kenya..." />
                    <p className={`text-[10px] mt-1 ${form.seo_description.length > 160 ? 'text-orange-500' : 'text-muted-foreground'}`}>{form.seo_description.length}/160 chars</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tags (comma-separated)</Label>
                    <Input value={form.tags} onChange={e => update('tags', e.target.value)} className="rounded-sm mt-1" placeholder="solar panels, kenya, nairobi, renewable energy" />
                  </div>
                </>
              )}

              {tab === 'settings' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Author Name</Label>
                    <Input value={form.author_name} onChange={e => update('author_name', e.target.value)} className="rounded-sm mt-1" placeholder="James Kamau" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Read Time (minutes)</Label>
                    <Input type="number" value={form.read_time_minutes} onChange={e => update('read_time_minutes', e.target.value)} className="rounded-sm mt-1 w-24" />
                  </div>
                  <div className="flex gap-6 pt-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.published} onChange={e => update('published', e.target.checked)} />
                      Published (visible to public)
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={form.featured} onChange={e => update('featured', e.target.checked)} />
                      Featured (hero post)
                    </label>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t hairline border-border">
              <Button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2"
              >
                {saving ? 'Saving...' : <><Check className="w-4 h-4" /> {editing ? 'Update' : 'Publish'} Post</>}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
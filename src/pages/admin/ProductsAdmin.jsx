import { db } from '@/api/base44Client';
import { useState, useEffect, useRef } from 'react';


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X, Check, Star, PackageX, Upload, ImageIcon, Loader2, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const EMPTY = {
  name: '', slug: '', description: '', short_description: '', price: '', original_price: '',
  category: 'Solar Panels', image_url: '', peak_power: '', efficiency: '',
  warranty_years: '', weight: '', dimensions: '', in_stock: true, featured: false,
  rating: '', review_count: '', features: '',
};
const CATEGORIES = ['Solar Panels', 'Inverters', 'Batteries', 'Mounting', 'Accessories', 'Kits'];
const TABS = ['Basic', 'Specs', 'Media', 'Features'];

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('Basic');
  const [uploading, setUploading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [slugManual, setSlugManual] = useState(false);
  const fileRef = useRef(null);
  const { toast } = useToast();

  async function load() {
    const data = await db.entities.Product.list('-created_date', 200);
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Sync slug with name if not manually edited
  useEffect(() => {
    if (!slugManual && form.name) {
      setForm(p => ({ ...p, slug: generateSlug(form.name) }));
    }
  }, [form.name, slugManual]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openNew = () => { 
    setForm(EMPTY); 
    setEditing(null); 
    setTab('Basic'); 
    setShowForm(true); 
    setSlugManual(false);
  };
  const openEdit = (p) => {
    setForm({
      name: p.name || '', slug: p.slug || '', description: p.description || '',
      short_description: p.short_description || '', price: p.price || '',
      original_price: p.original_price || '', category: p.category || 'Solar Panels',
      image_url: p.image_url || '', peak_power: p.peak_power || '', efficiency: p.efficiency || '',
      warranty_years: p.warranty_years || '', weight: p.weight || '', dimensions: p.dimensions || '',
      in_stock: p.in_stock !== false, featured: p.featured || false,
      rating: p.rating || '', review_count: p.review_count || '',
      features: (p.features || []).join('\n'),
    });
    setEditing(p.id); setTab('Basic'); setShowForm(true);
    // Auto-sync slug ONLY if it currently matches the auto-generated slug of the current name
    setSlugManual(p.slug !== generateSlug(p.name || ''));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    update('image_url', file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    
    setSaving(true);
    try {
      const slug = (form.slug || generateSlug(form.name)).toLowerCase();
      
      const payload = {
        ...form,
        slug,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : undefined,
        warranty_years: form.warranty_years ? Number(form.warranty_years) : undefined,
        rating: form.rating ? Number(form.rating) : undefined,
        review_count: form.review_count ? Number(form.review_count) : undefined,
        features: form.features ? form.features.split('\n').map(f => f.trim()).filter(Boolean) : [],
      };

      // Check for slug duplicates
      const existing = await db.entities.Product.filter({ slug }, null, 10);
      const conflict = existing.find(p => p.id !== editing);
      
      if (conflict) {
        throw new Error(`The slug "${slug}" is already used by another product ("${conflict.name}"). Please choose a unique name or slug.`);
      }

      if (editing) {
        await db.entities.Product.update(editing, payload);
        toast({ title: "Product updated", description: "Successfully saved changes." });
      } else {
        await db.entities.Product.create(payload);
        toast({ title: "Product created", description: "New product added to inventory." });
      }
      
      setShowForm(false);
      load();
    } catch (err) {
      console.error('Save error:', err);
      toast({ 
        title: "Error saving product", 
        description: err.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = (p) => {
    const copy = {
      ...p,
      name: `${p.name} (Copy)`,
      slug: `${p.slug}-copy-${Math.floor(Math.random() * 1000)}`,
      features: (p.features || []).join('\n'),
    };
    delete copy.id;
    delete copy.created_date;
    delete copy.updated_date;
    
    setForm(copy);
    setEditing(null);
    setTab('Basic');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    await db.entities.Product.delete(id);
    load();
  };

  const toggleStock = async (p) => {
    await db.entities.Product.update(p.id, { in_stock: !p.in_stock });
    load();
  };

  const toggleFeatured = async (p) => {
    await db.entities.Product.update(p.id, { featured: !p.featured });
    load();
  };

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q) || p.peak_power?.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products · {products.filter(p => p.in_stock !== false).length} in stock</p>
        </div>
        <Button onClick={openNew} className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          placeholder="Search name, category, wattage..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="rounded-sm max-w-xs"
        />
        <div className="flex gap-1.5 flex-wrap">
          {['All', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-sm transition-colors ${categoryFilter === cat ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="border hairline border-border rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b hairline border-border">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Product</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider">Price (KSh)</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Stock</th>
              <th className="text-left px-4 py-3 text-xs font-heading text-muted-foreground uppercase tracking-wider hidden xl:table-cell">Featured</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="border-b hairline border-border">
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-40" /></td>
                  <td className="px-4 py-3 hidden md:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-24" /></td>
                  <td className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded w-20" /></td>
                  <td className="px-4 py-3 hidden lg:table-cell"><div className="h-4 bg-muted animate-pulse rounded w-16" /></td>
                  <td className="px-4 py-3 hidden xl:table-cell" /><td className="px-4 py-3" />
                </tr>
              ))
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b hairline border-border hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.image_url ? (
                      <div className="w-9 h-9 rounded-sm overflow-hidden bg-muted shrink-0">
                        <img src={p.image_url} alt="" className="w-full h-full object-contain p-0.5" />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-sm bg-muted shrink-0 flex items-center justify-center">
                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-heading font-semibold text-foreground text-xs line-clamp-1">{p.name}</p>
                      {p.peak_power && <p className="text-[10px] text-muted-foreground">{p.peak_power}W</p>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3 text-xs font-heading font-bold text-foreground">
                  {p.price?.toLocaleString()}
                  {p.original_price && <div className="text-[10px] text-muted-foreground line-through font-normal">{p.original_price?.toLocaleString()}</div>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <button
                    onClick={() => toggleStock(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer ${p.in_stock !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                  >
                    {p.in_stock !== false ? '✓ In Stock' : '✗ Out of Stock'}
                  </button>
                </td>
                <td className="px-4 py-3 hidden xl:table-cell">
                  <button
                    onClick={() => toggleFeatured(p)}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors cursor-pointer flex items-center gap-1 ${p.featured ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-muted text-muted-foreground hover:text-foreground'}`}
                  >
                    <Star className={`w-2.5 h-2.5 ${p.featured ? 'fill-yellow-500' : ''}`} />
                    {p.featured ? 'Featured' : 'Normal'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => handleDuplicate(p)} title="Duplicate" className="text-muted-foreground hover:text-primary transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => openEdit(p)} title="Edit" className="text-muted-foreground hover:text-foreground transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} title="Delete" className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center">
                  <PackageX className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No products found</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Side drawer form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-xl bg-background border-l hairline border-border h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b hairline border-border shrink-0">
              <h2 className="font-heading font-bold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b hairline border-border px-6 shrink-0">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-3 text-xs font-medium transition-colors border-b-2 -mb-px ${tab === t ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {tab === 'Basic' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Product Name *</Label>
                    <Input value={form.name} onChange={e => update('name', e.target.value)} className="rounded-sm mt-1" placeholder="400W Monocrystalline Solar Panel" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Price (KSh) *</Label>
                      <Input type="number" value={form.price} onChange={e => update('price', e.target.value)} className="rounded-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Original Price (KSh)</Label>
                      <Input type="number" value={form.original_price} onChange={e => update('original_price', e.target.value)} className="rounded-sm mt-1" placeholder="For discount display" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Category</Label>
                    <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Short Description</Label>
                    <Input value={form.short_description} onChange={e => update('short_description', e.target.value)} className="rounded-sm mt-1" placeholder="One-line product summary" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Full Description</Label>
                    <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={4} className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background resize-none" />
                  </div>
                  <div className="flex gap-10 pt-2 pb-4">
                    <div className="flex items-center gap-2">
                      <Switch id="in_stock" checked={form.in_stock} onCheckedChange={v => update('in_stock', v)} />
                      <Label htmlFor="in_stock" className="text-sm font-medium cursor-pointer">In Stock</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch id="featured" checked={form.featured} onCheckedChange={v => update('featured', v)} />
                      <Label htmlFor="featured" className="text-sm font-medium cursor-pointer">Featured Product</Label>
                    </div>
                  </div>
                </>
              )}

              {tab === 'Specs' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Peak Power (W)</Label>
                      <Input value={form.peak_power} onChange={e => update('peak_power', e.target.value)} className="rounded-sm mt-1" placeholder="400" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Efficiency (%)</Label>
                      <Input value={form.efficiency} onChange={e => update('efficiency', e.target.value)} className="rounded-sm mt-1" placeholder="21.5" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Warranty (Years)</Label>
                      <Input type="number" value={form.warranty_years} onChange={e => update('warranty_years', e.target.value)} className="rounded-sm mt-1" placeholder="25" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Weight</Label>
                      <Input value={form.weight} onChange={e => update('weight', e.target.value)} className="rounded-sm mt-1" placeholder="21 kg" />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Dimensions</Label>
                      <Input value={form.dimensions} onChange={e => update('dimensions', e.target.value)} className="rounded-sm mt-1" placeholder="1755 × 1038 × 35mm" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Rating (1–5)</Label>
                      <Input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => update('rating', e.target.value)} className="rounded-sm mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Review Count</Label>
                      <Input type="number" value={form.review_count} onChange={e => update('review_count', e.target.value)} className="rounded-sm mt-1" />
                    </div>
                  </div>
                </>
              )}

              {tab === 'Media' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">Main Product Image</Label>
                    {form.image_url && (
                      <div className="mb-3 relative w-full aspect-video bg-muted rounded-sm overflow-hidden">
                        <img src={form.image_url} alt="" className="w-full h-full object-contain p-4" />
                        <button onClick={() => update('image_url', '')} className="absolute top-2 right-2 bg-background border hairline border-border rounded-sm p-1 text-muted-foreground hover:text-destructive">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileRef.current?.click()}
                        disabled={uploading}
                        className="rounded-sm gap-2 flex-1"
                      >
                        {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : <><Upload className="w-4 h-4" /> Upload Image</>}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">Or paste a URL directly:</p>
                    <Input value={form.image_url} onChange={e => update('image_url', e.target.value)} className="rounded-sm mt-1 text-xs" placeholder="https://..." />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">URL Slug</Label>
                    <Input 
                      value={form.slug} 
                      onChange={e => {
                        update('slug', e.target.value);
                        setSlugManual(true);
                      }} 
                      className="rounded-sm mt-1" 
                      placeholder="auto-generated-if-empty" 
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Leave empty to auto-generate from name</p>
                  </div>
                </>
              )}

              {tab === 'Features' && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Product Features (one per line)</Label>
                    <textarea
                      value={form.features}
                      onChange={e => update('features', e.target.value)}
                      rows={10}
                      className="w-full mt-1 border hairline border-border rounded-sm px-3 py-2 text-sm bg-background resize-none font-mono"
                      placeholder="High conversion efficiency&#10;Weather resistant IP67&#10;Anti-reflective tempered glass&#10;Compatible with all major inverters"
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">Each line becomes a bullet point on the product page</p>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t hairline border-border shrink-0">
              <Button
                onClick={handleSave}
                disabled={saving || !form.name || !form.price}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading rounded-sm gap-2"
              >
                {saving ? 'Saving...' : <><Check className="w-4 h-4" /> {editing ? 'Update' : 'Create'} Product</>}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-sm">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
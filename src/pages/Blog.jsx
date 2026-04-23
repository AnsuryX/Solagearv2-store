import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { Clock, ArrowRight, Zap, TrendingUp, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = ['All', 'Solar Tips', 'News', 'Installation', 'Case Studies', 'Savings & Finance', 'Kenya Energy'];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');

  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await db.entities.BlogPost.filter({ published: true }, '-created_date', 50);
        setPosts(data);
      } catch (err) {
        console.error('Failed to load blog posts:', err);
        setError(err.message || 'Failed to load blog posts. Please ensure your Supabase tables are created.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="bg-destructive/10 text-destructive p-6 rounded-sm inline-block max-w-2xl">
          <h2 className="font-heading text-xl font-bold mb-2">Database Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <p className="text-xs opacity-80">
            Make sure you have created the <strong>blog_posts</strong> table in your Supabase project.
            Check the <code>supabase_schema.sql</code> file in the project root for the required SQL.
          </p>
        </div>
      </div>
    );
  }

  const filtered = category === 'All' ? posts : posts.filter(p => p.category === category);
  const featured = filtered.find(p => p.featured);
  const rest = filtered.filter(p => !p.featured || filtered.indexOf(p) !== filtered.indexOf(featured));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* SEO header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-primary font-medium mb-2">Solar Knowledge Hub</p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-3">
          The SolarGear Blog
        </h1>
        <p className="text-muted-foreground max-w-xl">
          Expert guides, Kenya solar news, installation tips, and savings insights — everything you need to make the most of solar energy in Nairobi and beyond.
        </p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b hairline border-border">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-1.5 text-xs font-medium rounded-sm transition-all ${
              category === cat ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse space-y-3">
              <div className="aspect-video bg-muted rounded-sm" />
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">No posts in this category yet.</div>
      ) : (
        <>
          {/* Featured post */}
          {featured && (
            <Link to={`/blog/${featured.slug || featured.id}`} className="group block mb-12">
              <motion.div whileHover={{ y: -2 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 border hairline border-border rounded-sm overflow-hidden">
                <div className="aspect-video md:aspect-auto bg-muted overflow-hidden">
                  {featured.cover_image_url ? (
                    <img src={featured.cover_image_url} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center">
                      <span className="text-4xl">☀️</span>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium">{featured.category}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {featured.read_time_minutes || 5} min read</span>
                  </div>
                  <h2 className="font-heading text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{featured.excerpt}</p>
                  <span className="flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                    Read article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            </Link>
          )}

          {/* Case Studies highlight row */}
          {(category === 'All' || category === 'Case Studies') && (() => {
            const caseStudies = posts.filter(p => p.category === 'Case Studies').slice(0, 3);
            if (!caseStudies.length) return null;
            return (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-heading font-bold text-lg text-foreground">📍 Installation Case Studies</h2>
                  <button onClick={() => setCategory('Case Studies')} className="text-xs text-primary hover:underline">View all →</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {caseStudies.map(cs => (
                    <Link key={cs.id} to={`/blog/${cs.slug || cs.id}`} className="group block border hairline border-border rounded-sm overflow-hidden hover:border-primary transition-colors">
                      <div className="aspect-video bg-muted overflow-hidden">
                        {cs.cover_image_url
                          ? <img src={cs.cover_image_url} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          : <div className="w-full h-full bg-gradient-to-br from-primary/20 to-muted flex items-center justify-center text-3xl">☀️</div>}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-semibold text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">{cs.title}</h3>
                        <div className="flex flex-wrap gap-2">
                          {cs.system_size && <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full"><Zap className="w-2.5 h-2.5" />{cs.system_size}</span>}
                          {cs.savings_achieved && <span className="flex items-center gap-1 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><TrendingUp className="w-2.5 h-2.5" />{cs.savings_achieved}</span>}
                          {cs.installation_location && <span className="flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full"><MapPin className="w-2.5 h-2.5" />{cs.installation_location}</span>}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rest.filter(p => category !== 'All' || p.category !== 'Case Studies' || rest.indexOf(p) >= 0).map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/blog/${post.slug || post.id}`} className="group block">
                  <div className="aspect-video bg-muted rounded-sm overflow-hidden mb-4">
                    {post.cover_image_url ? (
                      <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/10 to-muted flex items-center justify-center text-2xl">☀️</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">{post.category}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {post.read_time_minutes || 5} min</span>
                  </div>
                  <h3 className="font-heading font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  {post.author_name && (
                    <p className="text-[10px] text-muted-foreground mt-2">By {post.author_name} · {new Date(post.created_date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
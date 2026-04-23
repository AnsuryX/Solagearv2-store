import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Clock, ChevronLeft, MessageCircle, Tag, Zap, TrendingUp, MapPin, RotateCcw } from 'lucide-react';

const WA_LINK = `https://wa.me/254700000000?text=Hello%20SolarGear%2C%20I%20read%20your%20blog%20and%20I%27m%20interested%20in%20solar%20for%20my%20home!`;

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // try slug first, then id
      let results = await db.entities.BlogPost.filter({ slug, published: true }, null, 1);
      if (!results.length) results = await db.entities.BlogPost.filter({ id: slug, published: true }, null, 1);
      if (results.length) setPost(results[0]);
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (post?.seo_title) document.title = `${post.seo_title} | SolarGear Kenya`;
    return () => { document.title = 'SolarGear Kenya'; };
  }, [post]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-24" />
        <div className="h-10 bg-muted rounded w-3/4" />
        <div className="aspect-video bg-muted rounded-sm" />
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-3 bg-muted rounded" />)}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">Article not found.</p>
        <Link to="/blog" className="text-primary underline">Back to Blog</Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-6 py-10">
      {/* Structured Data for AI & SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "image": [post.cover_image_url].filter(Boolean),
          "datePublished": post.created_date,
          "author": [{
            "@type": "Person",
            "name": post.author_name || "SolarGear Expert"
          }],
          "description": post.excerpt,
          "publisher": {
            "@type": "Organization",
            "name": "SolarGear Kenya",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ais-pre-cprpdbksppx7g3nbh7qtpx-266073398271.europe-west2.run.app/logo.png"
            }
          }
        })}
      </script>

      {/* Breadcrumb */}
      <Link to="/blog" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-8">
        <ChevronLeft className="w-3 h-3" /> Blog
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {post.category && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-medium">{post.category}</span>
        )}
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" /> {post.read_time_minutes || 5} min read
        </span>
        {post.author_name && (
          <span className="text-xs text-muted-foreground">By {post.author_name}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {new Date(post.created_date).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
        {post.title}
      </h1>

      {post.excerpt && (
        <p className="text-base text-muted-foreground leading-relaxed mb-8 border-l-2 border-primary pl-4">
          {post.excerpt}
        </p>
      )}

      {post.cover_image_url && (
        <div className="aspect-video rounded-sm overflow-hidden mb-10">
          <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Case Study Stats Banner */}
      {post.category === 'Case Studies' && (post.system_size || post.savings_achieved || post.installation_location) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10 p-5 bg-foreground rounded-sm">
          {post.system_size && (
            <div className="text-center">
              <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-heading font-bold text-white text-lg">{post.system_size}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">System Size</p>
            </div>
          )}
          {post.savings_achieved && (
            <div className="text-center">
              <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
              <p className="font-heading font-bold text-white text-lg">{post.savings_achieved}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Annual Savings</p>
            </div>
          )}
          {post.payback_period && (
            <div className="text-center">
              <RotateCcw className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-heading font-bold text-white text-lg">{post.payback_period}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Payback Period</p>
            </div>
          )}
          {post.installation_location && (
            <div className="text-center">
              <MapPin className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="font-heading font-bold text-white text-sm">{post.installation_location}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-wider">Location</p>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-sm prose-slate max-w-none [&_h2]:font-heading [&_h3]:font-heading [&_a]:text-primary"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t hairline border-border">
          <Tag className="w-3.5 h-3.5 text-muted-foreground" />
          {post.tags.map(tag => (
            <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-sm">{tag}</span>
          ))}
        </div>
      )}

      {/* WhatsApp CTA */}
      <div className="mt-12 p-6 bg-green-50 border hairline border-green-200 rounded-sm text-center">
        <p className="font-heading font-semibold text-foreground mb-2">Ready to go solar in Kenya?</p>
        <p className="text-sm text-muted-foreground mb-4">Get a free quote and site assessment from our Nairobi team.</p>
        <a
          href={WA_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-sm font-heading font-semibold text-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Chat on WhatsApp
        </a>
      </div>
    </article>
  );
}
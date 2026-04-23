import { db } from '@/api/base44Client';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { ShoppingBag, Minus, Plus, Shield, Truck, Check, Star, ChevronLeft, MessageCircle } from 'lucide-react';
import { addToCart } from '../lib/cartStore';
import SavingsCalculator from '../components/SavingsCalculator';
import { toast } from "@/components/ui/use-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function load() {
      // First try by slug
      let data = await db.entities.Product.filter({ slug: id }, null, 1);
      
      // If none found by slug, try by ID
      if (data.length === 0) {
        data = await db.entities.Product.filter({ id }, null, 1);
      }
      
      if (data.length > 0) setProduct(data[0]);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({ title: "Added to cart", description: `${quantity}x ${product.name}` });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-3 aspect-square bg-muted animate-pulse rounded-sm" />
          <div className="lg:col-span-2 space-y-4">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-64" />
            <div className="h-6 bg-muted rounded w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <Link to="/products" className="text-primary underline mt-4 inline-block">Back to Products</Link>
      </div>
    );
  }

  const allImages = [product.image_url, ...(product.gallery_urls || [])].filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Structured Data for AI & SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": allImages,
          "description": product.description || product.short_description,
          "sku": product.id,
          "brand": {
            "@type": "Brand",
            "name": "SolarGear"
          },
          "offers": {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "KES",
            "price": product.price,
            "availability": product.in_stock !== false ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "SolarGear Kenya"
            }
          },
          "aggregateRating": product.rating ? {
            "@type": "AggregateRating",
            "ratingValue": product.rating,
            "reviewCount": product.review_count || 1
          } : undefined
        })}
      </script>

      {/* Breadcrumb */}
      <Link to="/products" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ChevronLeft className="w-3 h-3" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
        {/* Gallery */}
        <div className="lg:col-span-3">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="aspect-square bg-muted/30 border hairline border-border rounded-sm flex items-center justify-center overflow-hidden mb-4"
          >
            <img
              src={allImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-contain p-8"
            />
          </motion.div>
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 border hairline rounded-sm overflow-hidden transition-all ${
                    selectedImage === i ? 'border-primary' : 'border-border hover:border-foreground/30'
                  }`}
                >
                  <img src={url} alt="" className="w-full h-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action Column */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-primary font-medium mb-1">
                {product.category}
              </p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-3">
                {product.name}
              </h1>
              {product.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? 'text-primary fill-primary' : 'text-border'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">{product.rating} ({product.review_count} reviews)</span>
                </div>
              )}
              <div className="flex items-baseline gap-3">
                <span className="font-heading text-3xl font-bold text-foreground">
                  KSh {product.price?.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-base text-muted-foreground line-through">
                    KSh {product.original_price?.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {product.short_description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {product.short_description}
              </p>
            )}

            {/* Specs */}
            <div className="space-y-2 py-4 border-y hairline border-border">
              {product.peak_power && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peak Power</span>
                  <span className="font-heading font-semibold">{product.peak_power}W</span>
                </div>
              )}
              {product.efficiency && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Efficiency</span>
                  <span className="font-heading font-semibold">{product.efficiency}%</span>
                </div>
              )}
              {product.warranty_years && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Warranty</span>
                  <span className="font-heading font-semibold">{product.warranty_years} Years</span>
                </div>
              )}
              {product.weight && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-heading font-semibold">{product.weight}</span>
                </div>
              )}
              {product.dimensions && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dimensions</span>
                  <span className="font-heading font-semibold">{product.dimensions}</span>
                </div>
              )}
            </div>

            {/* Quantity + Add to Cart */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border hairline border-border rounded-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-heading font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-heading font-semibold rounded-sm"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {product.in_stock !== false ? (
                <p className="flex items-center gap-1 text-xs text-green-600">
                  <Check className="w-3 h-3" /> In Stock — Ships within 2-3 business days
                </p>
              ) : (
                <p className="text-xs text-destructive">Currently out of stock</p>
              )}
            </div>

            {/* Trust */}
            <div className="flex gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Warranty</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Nairobi Delivery</span>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/254700000000?text=Hello%20SolarGear%2C%20I%27m%20interested%20in%20the%20${encodeURIComponent(product.name)}%20(KSh%20${product.price?.toLocaleString()}).%20Can%20you%20help%20me%3F`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-heading font-semibold text-sm rounded-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Enquire on WhatsApp
            </a>

            {/* Savings Calculator */}
            <SavingsCalculator productPrice={product.price} />
          </div>
        </div>
      </div>

      {/* Description & Features */}
      {(product.description || product.features?.length > 0) && (
        <div className="mt-16 pt-12 border-t hairline border-border max-w-3xl">
          {product.description && (
            <div className="mb-8">
              <h3 className="font-heading font-semibold text-lg mb-4">About This Product</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}
          {product.features?.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-lg mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
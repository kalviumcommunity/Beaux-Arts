import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma'; // Direct DB access (Server Component)

// We can fetch data directly in the component since it's a Server Component
async function getFeaturedProducts() {
  try {
    const products = await prisma.artwork.findMany({
      where: { 
        available: true,
        
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: { storeName: true }
        }
      }
    });
    return products;
  } catch (error) {
    console.error("Failed to fetch featured products", error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();
  
  // Fallback for Hero Image if no products exist
  const heroImage = featuredProducts[0]?.image[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200';

  return (
    <div className="pt-10  md:px-8 lg:px-12 bg-background ">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left - Image */}
          <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[85vh] bg-secondary overflow-hidden">
            <Image
              src={heroImage}
              alt="Featured artwork"
              fill
              className="object-cover"
              priority // Important for LCP (Largest Contentful Paint)
            />
          </div>

          {/* Right - Content */}
          <div className="flex flex-col justify-between p-6 md:p-10 lg:p-16">
            <div />
            
            <div className="space-y-6">
              <p className="text-[13px] text-muted-foreground uppercase tracking-widest">
                Art Gallery
              </p>
              <h1 className="text-[clamp(2rem,6vw,4rem)] leading-[1.1] tracking-tight">
                Curated pieces for modern spaces
              </h1>
              <p className="text-muted-foreground max-w-md">
                Discover exceptional artworks from emerging artists. Each piece selected for its craft and emotional depth.
              </p>
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 text-sm font-medium group"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="flex items-center justify-between pt-8 mt-8 border-t border-border text-[13px] text-muted-foreground">
              <span>200+ Artworks</span>
              <span>traditional and cultural Artists</span>
              <span>Worldwide Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="px-4 md:px-6">
          <div className="flex items-end justify-between mb-8 md:mb-12">
            <div>
              <p className="text-[13px] text-muted-foreground uppercase tracking-widest mb-2">
                Featured
              </p>
              <h2 className="text-2xl md:text-3xl tracking-tight">New Arrivals</h2>
            </div>
            <Link 
              href="/shop" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View all
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
             <div className="text-center py-20 text-muted-foreground">
                No artworks available yet.
             </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group"
                >
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
                    <Image
                      src={product.image[0] || '/placeholder.jpg'}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium truncate">{product.title}</h3>
                    <p className="text-[13px] text-muted-foreground">
                       ${Number(product.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      

      {/* Artist CTA */}
      <section className="border-t border-border py-16 md:py-24">
        <div className="px-4 md:px-6 text-center max-w-2xl mx-auto">
          <p className="text-[13px] text-muted-foreground uppercase tracking-widest mb-4">
            For Artists
          </p>
          <h2 className="text-2xl md:text-4xl tracking-tight mb-4">
            Share your work with the world
          </h2>
          <p className="text-muted-foreground mb-6">
            Join our community of artists and reach collectors worldwide.
          </p>
          {/* Point this to the Artist Application route we built earlier */}
          <Link 
            href="/apply" 
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            Apply Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};
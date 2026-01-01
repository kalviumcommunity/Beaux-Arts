import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import prisma from '@/lib/prisma'; // Direct DB access

// 1. Helper to fetch data
async function getArtistsData() {
  // Run queries in parallel for speed
  const [artists, stats] = await Promise.all([
    // A. Fetch Artists with their "Featured Work" (latest available)
    prisma.artist.findMany({
      include: {
        _count: { select: { artworks: true } }, // Get count of works
        artworks: {
          where: { available: true },
          take: 1, 
          orderBy: { createdAt: 'desc' },
          select: { image: true }
        }
      },
      orderBy: { storeName: 'asc' }
    }),
    
    // B. Fetch Global Stats for Sidebar
    prisma.artwork.aggregate({
      _count: { id: true },
      where: { available: true } // Count available works
    })
  ]);

  return { artists, totalAvailable: stats._count.id };
}

export default async function ArtistsPage() {
  const { artists, totalAvailable } = await getArtistsData();
  const totalArtists = artists.length;

  return (
    <main className="pt-14 min-h-screen">
      {/* Header */}
      <div className="border-b border-border">
        <div className="px-6 md:px-12 py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl tracking-tight font-light">Artists</h1>
          <p className="text-muted-foreground mt-2">
            {totalArtists} artists in our collection
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row">
        {/* Left Sidebar - Info */}
        <aside className="w-full md:w-1/3 max-w-xs border-r border-border p-6 md:p-8 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block">
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-medium tracking-wide uppercase mb-4">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Meet the talented creators behind our collection. Each artist brings 
                a unique perspective and passion to their work.
              </p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">Quick Stats</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>{totalArtists} Featured Artists</p>
                {/* Note: This is now dynamic from DB */}
                <p>{totalAvailable} Available Pieces</p> 
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-3">Join Us</h3>
              <p className="text-sm text-muted-foreground mb-4">
                We&apos;re always looking for talented artists.
              </p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/apply">
                  Apply as an Artist
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Link>
              </Button>
            </div>
          </div>
        </aside>

        {/* Right Content - Artists Grid */}
        <section className="flex-1 p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {artists.map((artist) => {
              // Extract the first image if it exists
              const featuredImage = artist.artworks[0]?.image[0] || null;

              return (
                <Link
                  key={artist.id}
                  // We link to the Shop filtered by this Artist
                  href={`/shop?artistId=${artist.id}`} 
                  className="group"
                >
                  <div className="relative aspect-[4/3] bg-secondary overflow-hidden mb-4">
                    {featuredImage ? (
                      <Image
                        src={featuredImage}
                        alt={artist.storeName}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No works yet
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-medium group-hover:underline">
                        {artist.storeName}
                      </h2>
                      {artist.bio && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {artist.bio}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {artist._count.artworks} {artist._count.artworks === 1 ? 'artwork' : 'artworks'}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform group-hover:translate-x-1 mt-1" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Mobile CTA (Only visible on small screens) */}
          <div className="md:hidden mt-12 pt-8 border-t border-border text-center">
            <h2 className="text-xl font-medium mb-2">Want to join?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We&apos;re always looking for talented artists.
            </p>
            <Button asChild>
              <Link href="/apply">
                Apply as an Artist
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
};
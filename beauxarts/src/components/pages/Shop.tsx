"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Don't forget this import!
import { X, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { useSearch } from "@/context/SearchContext";
import { useDebounce } from "@/hooks/use-debounce";

// --- Types ---
interface Artwork {
  id: number;
  title: string;
  price: string | number;
  image: string[];
  artist: { storeName: string };
  available: boolean;
  featured: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface Artist {
  id: number;
  storeName: string;
}

const Shop = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  
  // Data States
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); 
  const [artists, setArtists] = useState<Artist[]>([]);       
  const [isLoading, setIsLoading] = useState(true);

  // Filter States
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const debouncedPrice = useDebounce(priceRange, 500);

  // --- 1. Fetch Filters (Run once on mount) ---
  useEffect(() => {
    async function fetchFilters() {
      try {
        // Fetch both in parallel
        const [catRes, artRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/artists?mode=list")
        ]);

        const catData = await catRes.json();
        const artData = await artRes.json();

        if (catData.success) setCategories(catData.data);
        if (artData.success) setArtists(artData.data);
      } catch (error) {
        console.error("Failed to fetch filters", error);
      }
    }
    fetchFilters();
  }, []);

  // --- 2. Fetch Artworks (Run when filters change) ---
  useEffect(() => {
    async function fetchArtworks() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();

        if (debouncedSearch) params.append("search", debouncedSearch);
        if (selectedCategories.length > 0) params.append("categoryId", selectedCategories.join(","));
        if (selectedArtists.length > 0) params.append("artistId", selectedArtists.join(","));
        
        params.append("minPrice", debouncedPrice[0].toString());
        params.append("maxPrice", debouncedPrice[1].toString());

        if (showAvailableOnly) params.append("available", "true");

        const res = await fetch(`/api/artworks?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setArtworks(data.data.artworks);
        }
      } catch (error) {
        console.error("Failed to fetch shop items", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchArtworks();
  }, [debouncedSearch, selectedCategories, selectedArtists, debouncedPrice, showAvailableOnly]);

  // --- Helpers ---
  const toggleCategory = (id: number) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleArtist = (id: number) => {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedArtists([]);
    setPriceRange([0, 5000]);
    setShowAvailableOnly(false);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategories.length > 0 ||
    selectedArtists.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 5000 ||
    showAvailableOnly;

  return (
    <div className="pt-10 min-h-screen ">
      {/* Header */}
      <div className="border-b border-border">
        <div className="px-6 md:px-12 py-10 md:py-16">
          <h1 className="text-4xl md:text-5xl tracking-tight font-light">Shop</h1>
          <p className="text-muted-foreground mt-2">
            {isLoading ? "Loading..." : `${artworks.length} artwork${artworks.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-1/3 max-w-xs border-r border-border p-6 md:p-8 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto hidden md:block">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium tracking-wide uppercase">Filters</h2>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground underline">
                  Clear all
                </button>
              )}
            </div>

            <Separator />

            {/* Categories (Dynamic Map) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Category</h3>
              <div className="space-y-3">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />

            {/* Artists (Dynamic Map) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Artist</h3>
              <div className="space-y-3">
                {artists.map((artist) => (
                  <label key={artist.id} className="flex items-center gap-3 cursor-pointer group">
                    <Checkbox
                      checked={selectedArtists.includes(artist.id)}
                      onCheckedChange={() => toggleArtist(artist.id)}
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground">
                      {artist.storeName}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <Separator />
            
            {/* Price & Availability (Same as before) */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Price Range</h3>
              <div className="px-1">
                <Slider
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  min={0}
                  max={5000}
                  step={100}
                  className="mt-2"
                />
                <div className="flex justify-between mt-3 text-sm text-muted-foreground">
                  <span>${priceRange[0].toLocaleString()}</span>
                  <span>${priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Availability</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                <Checkbox
                  checked={showAvailableOnly}
                  onCheckedChange={(checked) => setShowAvailableOnly(!!checked)}
                />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Available only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Grid */}
        <section className="flex-1 p-6 md:p-8">
          {isLoading ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : artworks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-muted-foreground mb-4">No artworks match your filters</p>
              <button onClick={clearFilters} className="text-sm underline">
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {artworks.map((artwork) => (
                <Link key={artwork.id} href={`/artworks/${artwork.id}`} className="group">
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-4">
                    <Image
                      src={artwork.image[0] || "/placeholder.jpg"}
                      alt={artwork.title}
                      fill
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {!artwork.available && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <span className="text-sm tracking-wide">Sold</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium tracking-wide group-hover:underline">
                      {artwork.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {artwork.artist.storeName}
                    </p>
                    <p className="text-sm">${Number(artwork.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
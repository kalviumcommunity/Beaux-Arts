"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Minus, Plus, Loader2, Edit2, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import {
  canEditArtwork,
  getStoredUser,
  getAuthHeaders,
} from "@/lib/permissions";

// Define Types matching your API response
interface Category {
  id: number;
  name: string;
}

interface Artist {
  id: number;
  userId: number;
  storeName: string;
}

interface Product {
  id: number;
  title: string;
  price: string | number;
  description: string;
  image: string[];
  dimensions: string;
  medium: string;
  year: number;
  available: boolean;
  artist: Artist;
  categories: Category[];
}

const ProductDetail = () => {
  const params = useParams();
  const id = params?.id as string;

  const { addToCart } = useCart();
  const currentUser = getStoredUser();

  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. FETCH MAIN PRODUCT
  useEffect(() => {
    if (!id) return;

    async function fetchProduct() {
      setIsLoading(true);
      try {
        // Fetch single product

        const res = await fetch(`/api/artworks/${id}`);
        const data = await res.json();

        if (data.success) {
          setProduct(data.data);

          // 2. FETCH RELATED PRODUCTS BASED ON FIRST CATEGORY
          if (data.data.categories.length > 0) {
            fetchRelated(data.data.categories[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // Helper to fetch related items using your LIST API
  async function fetchRelated(categoryId: number) {
    try {
      // Reuse the Search API you built!
      const res = await fetch(`/api/artworks?categoryId=${categoryId}&limit=4`);
      const data = await res.json();
      if (data.success) {
        // Filter out the current product from related list
        const filtered = data.data.artworks.filter(
          (p: Product) => p.id !== Number(id)
        );
        setRelatedProducts(filtered.slice(0, 4));
      }
    } catch (error) {
      console.error("Failed to fetch related", error);
    }
  }

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < quantity; i++) {
      // @ts-expect-error -- TypeScript fix for partial Product type
      addToCart({
        ...product,
        price: Number(product.price),

        image: product.image[0] || "/placeholder.jpg",

        category: product.categories[0]?.name || "Art",

        artist: product.artist.storeName,
      });
    }
    setQuantity(1);
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this artwork? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/artworks/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        alert("Artwork deleted successfully");
        window.location.href = "/dashboard/artist";
      } else {
        alert(data.message || "Failed to delete artwork");
      }
    } catch (error) {
      console.error("Error deleting artwork:", error);
      alert("Error deleting artwork");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-14 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Product not found</h1>
          <Link
            href="/shop"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-14">
      {/* Back Link */}
      <div className="px-4 md:px-6 py-4 border-b border-border">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      {/* Product */}
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square lg:aspect-auto lg:min-h-[80vh] bg-secondary">
          <Image
            src={product.image[0] || "/placeholder.jpg"} // Handle array & fallback
            alt={product.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Details */}
        <div className="p-6 md:p-10 lg:p-16 flex flex-col justify-center">
          <div className="max-w-md">
            {/* Edit/Delete Actions */}
            {product &&
              currentUser &&
              canEditArtwork(currentUser, product.artist.userId) && (
                <div className="flex gap-2 mb-6">
                  <Link
                    href={`/artworks/${product.id}/edit`}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 rounded text-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              )}

            <p className="text-[13px] text-muted-foreground uppercase tracking-widest mb-2">
              {product.categories[0]?.name || "Art"}
            </p>
            <h1 className="text-2xl md:text-3xl tracking-tight mb-2">
              {product.title}
            </h1>
            <p className="text-muted-foreground mb-6">
              by {product.artist.storeName}
            </p>

            <p className="text-2xl mb-8">
              ${Number(product.price).toLocaleString()}
            </p>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              {product.description}
            </p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-muted-foreground">Qty</span>
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!product.available}
              className="w-full py-4 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {product.available ? "Add to Cart" : "Sold Out"}
            </button>

            {/* Meta Details */}
            <div className="mt-8 pt-8 border-t border-border space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{product.dimensions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Medium</span>
                <span>{product.medium}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year</span>
                <span>{product.year}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-border py-16">
          <div className="px-4 md:px-6">
            <h2 className="text-xl mb-8">You may also like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {relatedProducts.map((p) => (
                <Link key={p.id} href={`/product/${p.id}`} className="group">
                  <div className="relative aspect-[3/4] bg-secondary overflow-hidden mb-3">
                    <Image
                      src={p.image[0] || "/placeholder.jpg"}
                      alt={p.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium truncate">{p.title}</h3>
                    <p className="text-[13px] text-muted-foreground">
                      ${Number(p.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

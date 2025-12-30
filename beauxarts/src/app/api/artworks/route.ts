import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { Prisma } from "@/generated/prisma/client"; // Import Prisma types for type safety

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // --- 1. EXTRACT & PARSE PARAMETERS ---
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId");
    const artistId = searchParams.get("artistId");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const available = searchParams.get("available");
    const featured = searchParams.get("featured");
    const sortBy = searchParams.get("sortBy") || "newest";

    // --- 2. CALCULATE PAGINATION ---
    const skip = (page - 1) * limit;

    // --- 3. BUILD THE 'WHERE' CLAUSE (Dynamic Filtering) ---
    // We explicitly type this so TypeScript knows valid Prisma filters
    const where: Prisma.ArtworkWhereInput = {
       // Only show active/available items by default if you want
       // available: true, 
    };

    // A. Search Filter (Title OR Description OR Medium)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { medium: { contains: search, mode: "insensitive" } },
      ];
    }

    // B. Category Filter (Relation Filter)
    // "Find artworks where at least one (some) category matches this ID"
    if (categoryId) {
      where.categories = {
        some: {
          categoryId: parseInt(categoryId),
        },
      };
    }

    // C. Artist Filter
    if (artistId) {
      where.artistId = parseInt(artistId);
    }

    // D. Price Range Filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice); // Greater than or equal
      if (maxPrice) where.price.lte = parseFloat(maxPrice); // Less than or equal
    }

    // E. Boolean Filters
    if (available === "true") where.available = true;
    if (featured === "true") where.featured = true;


    // --- 4. BUILD THE 'ORDER BY' CLAUSE ---
    let orderBy: Prisma.ArtworkOrderByWithRelationInput = { createdAt: "desc" };

    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // --- 5. EXECUTE QUERIES (Parallel for Performance) ---
    // We need two things: the actual data, and the total count (for pagination)
    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        // Include relations to match your JSON response structure
        include: {
          artist: {
            select: {
              id: true,
              storeName: true,
              // user: { select: { fullname: true } } // If you need the real name too
            },
          },
          categories: {
            include: {
              category: true,
            },
          },
        },
      }),
      prisma.artwork.count({ where }),
    ]);

    // --- 6. FORMAT RESPONSE ---
    // Flatten categories if needed (Prisma returns { category: { name: "Abstract" } })
    const formattedArtworks = artworks.map((art) => ({
      ...art,
      // Transform categories to simple array: [{ id: 1, name: "Abstract" }]
      categories: art.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
      })),
    }));

    return sendSuccess({
      data: {
        artworks: formattedArtworks,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
      message: "Artworks fetched successfully",
    });

  } catch (error) {
    return sendError({ message: "Error fetching artworks", details: error });
  }
}
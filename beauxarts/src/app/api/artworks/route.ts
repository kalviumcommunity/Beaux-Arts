import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { Prisma } from "@/generated/prisma/client";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";
import { ERROR_CODES } from "@/lib/errorCodes";
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

    const where: Prisma.ArtworkWhereInput = {};

    // A. Search Filter (Title OR Description OR Medium)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { medium: { contains: search, mode: "insensitive" } },
      ];
    }

    // B. Category Filter (Relation Filter)
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

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where,
        orderBy,
        skip,
        take: limit,

        include: {
          artist: {
            select: {
              id: true,
              storeName: true,
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

    const formattedArtworks = artworks.map((art) => ({
      ...art,

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

// Helper: Verify Artist Token
const verifySeller = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    // Must be SELLER or ADMIN
    if (decoded.role !== "SELLER" && decoded.role !== "ADMIN") return null;
    return decoded.userId;
  } catch {
    return null;
  }
};

export async function POST(request: NextRequest) {
  try {
    const userId = verifySeller(request);
    if (!userId) {
      return sendError({
        message: "Unauthorized: Seller access required",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 403,
      });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      stock,
      isUnique,
      categoryIds = [],
      image = [],
      dimensions,
      medium,
      year,
      available = true,
    } = body;

    // --- VALIDATION ---
    if (!title || !price) {
      return sendError({
        message: "Title and price are required",
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    if (price <= 0) {
      return sendError({
        message: "Price must be greater than 0",
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    // Verify artist exists for this user
    const artist = await prisma.artist.findUnique({
      where: { userId },
    });

    if (!artist) {
      return sendError({
        message:
          "Artist profile not found. Please create an artist profile first.",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    // --- CREATE ARTWORK ---
    const artwork = await prisma.artwork.create({
      data: {
        title,
        description: description || null,
        price: parseFloat(price),
        stock: stock ? parseInt(stock) : 1,
        isUnique: isUnique !== false,
        available,
        image: Array.isArray(image) ? image : [],
        dimensions: dimensions || null,
        medium: medium || null,
        year: year ? parseInt(year) : null,
        artistId: artist.id,
        categories:
          categoryIds.length > 0
            ? {
                create: categoryIds.map((catId: number) => ({
                  categoryId: catId,
                })),
              }
            : undefined,
      },
      include: {
        artist: {
          select: {
            id: true,
            storeName: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
      },
    });

    return sendSuccess({
      data: artwork,
      message: "Artwork created successfully",
      status: 201,
    });
  } catch {
    return sendError({
      message: "Error creating artwork",
      code: ERROR_CODES.INTERNAL_ERROR,
      details: undefined,
    });
  }
}

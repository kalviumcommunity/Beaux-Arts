import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { Prisma } from "@/generated/prisma/client";
import redis from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("mode");

    const cacheKey = `artists:${req.nextUrl.search}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return sendSuccess({ data: JSON.parse(cached) });
    }




    // CASE 1: Simple List for Filters (Shop Sidebar)

    if (mode === "list") {
      const artists = await prisma.artist.findMany({
        take: 10,
        select: {
          id: true,
          storeName: true,
        },
        orderBy: { storeName: "asc" },
      });

      await redis.set(cacheKey, JSON.stringify(artists), "EX", 60 * 5); // Cache for 5 minutes

      return sendSuccess({ data: artists });
    }

    // CASE 2: Full Paginated List (Artist Directory Page)
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const skip = (page - 1) * limit;

    const searchFilter: Prisma.StringFilter | undefined = search
      ? { contains: search, mode: "insensitive" }
      : undefined;

    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where: {
          storeName: searchFilter,
        },
        skip,
        take: limit,
        include: {
          user: { select: { fullname: true, email: true } },
          _count: { select: { artworks: true } },
        },
        orderBy: { storeName: "asc" },
      }),
      prisma.artist.count({ where: { storeName: searchFilter } }),
    ]);

    const responseData = {
      artists,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60 * 5); // Cache for 5 minutes

    return sendSuccess({
      data: responseData,
    });
  } catch (error) {
    return sendError({ message: "Error fetching artists", details: error });
  }
}

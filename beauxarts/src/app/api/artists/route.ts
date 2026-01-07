import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { Prisma } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get("mode");

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

    return sendSuccess({
      data: {
        artists,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return sendError({ message: "Error fetching artists", details: error });
  }
}

import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";
import { ERROR_CODES } from "@/lib/errorCodes";

// Helper: Extract user ID from token
const getUserId = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    return decoded.userId;
  } catch {
    return null;
  }
};

// GET /api/artists/profile - Get current user's artist profile
export async function GET(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendError({
        message: "Unauthorized",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    const artist = await prisma.artist.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            phone: true,
          },
        },
        _count: {
          select: { artworks: true },
        },
      },
    });

    if (!artist) {
      return sendError({
        message: "Artist profile not found",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    return sendSuccess({
      data: artist,
      message: "Artist profile retrieved successfully",
    });
  } catch {
    return sendError({
      message: "Error fetching artist profile",
      code: ERROR_CODES.INTERNAL_ERROR,
      details: undefined,
    });
  }
}

// PUT /api/artists/profile - Update artist profile
export async function PUT(req: NextRequest) {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return sendError({
        message: "Unauthorized",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    const body = (await req.json()) as {
      bio?: string;
      birthDate?: string;
      storeName?: string;
      commissions?: number;
    };
    const { bio, birthDate, storeName, commissions } = body;

    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { userId },
    });

    if (!artist) {
      return sendError({
        message: "Artist profile not found",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    // Validate storeName uniqueness (if being updated)
    if (storeName && storeName !== artist.storeName) {
      const existingStore = await prisma.artist.findUnique({
        where: { storeName },
      });
      if (existingStore) {
        return sendError({
          message: "Store name already taken",
          code: ERROR_CODES.VALIDATION_ERROR,
          status: 400,
        });
      }
    }

    // Validate commissions
    if (commissions !== undefined && (commissions < 0 || commissions > 100)) {
      return sendError({
        message: "Commission percentage must be between 0 and 100",
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    // Update artist profile
    const updatedArtist = await prisma.artist.update({
      where: { userId },
      data: {
        bio: bio !== undefined ? bio : undefined,
        birthDate: birthDate !== undefined ? new Date(birthDate) : undefined,
        storeName: storeName !== undefined ? storeName : undefined,
        commissions: commissions !== undefined ? commissions : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullname: true,
            phone: true,
          },
        },
        _count: {
          select: { artworks: true },
        },
      },
    });

    return sendSuccess({
      data: updatedArtist,
      message: "Artist profile updated successfully",
    });
  } catch (error) {
    return sendError({
      message: "Error updating artist profile",
      code: ERROR_CODES.INTERNAL_ERROR,
      details: error as unknown,
    });
  }
}

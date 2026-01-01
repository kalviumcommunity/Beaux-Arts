import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";

// Helper to get User ID from Token
const getUserId = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)as tokenPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return sendError({ message: "Unauthorized", status: 401 });

  try {
    const body = await req.json();
    const { storeName, bio } = body;

    // 1. Validation
    if (!storeName || !bio) {
        return sendError({ message: "Store Name and Bio are required", status: 400 });
    }

    // 2. Check if Store Name is taken
    const existingStore = await prisma.artist.findUnique({ where: { storeName } });
    if (existingStore) {
        return sendError({ message: "Store name already taken", status: 409 });
    }

    // 3. Check if User is already an artist
    const existingArtist = await prisma.artist.findUnique({ where: { userId } });
    if (existingArtist) {
        return sendError({ message: "You are already an artist", status: 400 });
    }

    // 4. Transaction: Create Profile + Update User Role
    const newArtist = await prisma.$transaction(async (tx) => {
      // Create the Artist Profile
      const artist = await tx.artist.create({
        data: {
          userId,
          storeName,
          bio,
          // commissions defaults to 3% in schema
        }
      });

      // Promote User to SELLER
      await tx.user.update({
        where: { id: userId },
        data: { role: "SELLER" }
      });

      return artist;
    });

    return sendSuccess({ 
        data: newArtist, 
        message: "Artist application successful",
        status: 201 
    });

  } catch (error) {
    console.error("Artist Apply Error:", error);
    return sendError({ message: "Error applying for artist account", details: error });
  }
}
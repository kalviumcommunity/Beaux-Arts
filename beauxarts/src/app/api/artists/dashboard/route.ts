import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";

const getUserId = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded  = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    return decoded.userId;
  } catch (error) { return null; }
};

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return sendError({ message: "Unauthorized", status: 401 });

  try {
    // 1. Find the Artist Profile
    const artist = await prisma.artist.findUnique({
      where: { userId },
      include: {
        artworks: { orderBy: { createdAt: 'desc' } }
      }
    });

    if (!artist) {
      return sendError({ message: "Artist profile not found", status: 404 });
    }

    // 2. Find Sales (OrderItems linked to this Artist's Artworks)
    const sales = await prisma.orderItem.findMany({
      where: {
        artwork: { artistId: artist.id }
      },
      include: {
        artwork: { select: { title: true } },
        order: { select: { id: true, createdAt: true, status: true, user: { select: { email: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Calculate Stats
    const totalArtworks = artist.artworks.length;
    const totalSalesCount = sales.length; // items sold
    const totalRevenue = sales.reduce((acc, item) => acc + Number(item.price), 0);

    return sendSuccess({
      data: {
        artworks: artist.artworks,
        sales: sales.map(s => ({
            id: s.order.id, // Order ID
            itemId: s.id,
            artwork: s.artwork.title,
            buyer: s.order.user.email,
            date: s.order.createdAt,
            status: s.order.status,
            amount: s.price
        })),
        stats: {
            totalArtworks,
            totalSalesCount,
            totalRevenue
        }
      }
    });

  } catch (error) {
    return sendError({ message: "Error loading dashboard", details: error });
  }
}
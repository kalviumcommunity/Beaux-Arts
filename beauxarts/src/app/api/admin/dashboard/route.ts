import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";

// Helper: Verify Admin Token
const verifyAdmin = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    // STRICT CHECK: Must be ADMIN
    if (decoded.role !== 'ADMIN') return null;
    return decoded.userId;
  } catch (error) { return null; }
};

export async function GET(req: NextRequest) {
  const adminId = verifyAdmin(req);
  if (!adminId) return sendError({ message: "Unauthorized: Admin access required", status: 403 });

  try {
    // Run queries in parallel for performance
    const [users, artists, artworks, orders] = await Promise.all([
      // 1. Users (Newest first)
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, fullname: true, email: true, role: true, createdAt: true } // Don't send passwords
      }),
      // 2. Artists
      prisma.artist.findMany({
        include: { 
            user: { select: { email: true } },
            _count: { select: { artworks: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      // 3. Artworks
      prisma.artwork.findMany({
        orderBy: { createdAt: 'desc' },
        include: { artist: { select: { storeName: true } } }
      }),
      // 4. Orders
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { 
            user: { select: { email: true } },
            // In a real app, you'd calculate artist totals, here we just get the full order
        }
      })
    ]);

    // Calculate Stats
    const totalRevenue = orders.reduce((acc, order) => acc + Number(order.totalAmount), 0);
    const activeArtists = artists.length; // You can add a 'status' field to Artist model later if needed

    return sendSuccess({
      data: {
        stats: {
            totalUsers: users.length,
            activeArtists,
            totalOrders: orders.length,
            totalRevenue
        },
        users,
        artists: artists.map(a => ({
            id: a.id,
            storeName: a.storeName,
            email: a.user.email,
            artworksCount: a._count.artworks,
            commission: a.commissions,
            joinedAt: a.createdAt
        })),
        artworks,
        orders: orders.map(o => ({
            id: o.id,
            buyer: o.user.email,
            total: o.totalAmount,
            status: o.status,
            date: o.createdAt
        }))
      }
    });

  } catch (error) {
    console.error("Admin Dashboard Error:", error);
    return sendError({ message: "Failed to load admin data", details: error });
  }
}
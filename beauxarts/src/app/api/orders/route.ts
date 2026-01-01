import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";

// Helper to get User ID
const getUserId = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return sendError({ message: "Unauthorized", status: 401 });

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            artwork: {
              select: { title: true, image: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data to match Frontend Interface
    const formattedOrders = orders.map(order => ({
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        artwork: {
          title: item.artwork.title,
          image: item.artwork.image
        }
      }))
    }));

    return sendSuccess({ data: formattedOrders });
  } catch (error) {
    console.error("GET Orders Error:", error);
    return sendError({ message: "Error fetching orders", details: error });
  }
}

export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return sendError({ message: "Unauthorized", status: 401 });

  try {
    const body = await req.json();
    const { items, shippingAddress, totalAmount, paymentMethod } = body;

    if (!items || items.length === 0) {
      return sendError({ message: "Cart is empty", status: 400 });
    }

    // --- TRANSACTION START ---
    const newOrder = await prisma.$transaction(async (tx) => {
      
      // 1. Create the Shipping Address
      const address = await tx.shippingAddress.create({
        data: {
            userId,
            addressLine1: shippingAddress.addressLine1,
            addressLine2: shippingAddress.addressLine2,
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country
        }
      });

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          userId,
          shippingAddressId: address.id,
          totalAmount: parseFloat(totalAmount),
          status: "PENDING", // If using Stripe, this might stay pending until webhook fires
          paymentMethodId: null, // Simplified for now, or create PaymentMethod record
        }
      });

      // 3. Process Items & Update Stock
      for (const item of items) {
        // Check if artwork exists and has stock
        const artwork = await tx.artwork.findUnique({ where: { id: item.id } });
        
        if (!artwork) throw new Error(`Artwork ID ${item.id} not found`);
        if (!artwork.available || artwork.stock < item.quantity) {
           throw new Error(`Artwork "${artwork.title}" is out of stock`);
        }

        // Create Order Item
        await tx.orderItem.create({
            data: {
                orderId: order.id,
                artworkId: item.id,
                quantity: item.quantity,
                price: item.price // Save price AT TIME OF PURCHASE
            }
        });

        // Decrement Stock
        await tx.artwork.update({
            where: { id: item.id },
            data: {
                stock: { decrement: item.quantity },
                // If stock hits 0, mark unavailable
                available: artwork.stock - item.quantity > 0
            }
        });
      }

      return order;
    });
    // --- TRANSACTION END ---

    return sendSuccess({ 
        data: newOrder, 
        message: "Order placed successfully" 
    });

  } catch (error) {
    console.error("Checkout Error:", error);
    return sendError({ message : "Checkout failed", status: 500 });
  }
}
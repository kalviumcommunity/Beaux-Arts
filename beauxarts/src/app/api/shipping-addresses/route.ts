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
    // Fetch addresses associated with the logged-in user
    // We use 'distinct' to avoid showing duplicate addresses if the logic allows it,
    // otherwise simple findMany works.
    const addresses = await prisma.shippingAddress.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return sendSuccess({ data: addresses });
  } catch (error) {
    return sendError({ message: "Error fetching addresses", details: error });
  }
}

// Optional: POST route if you want to allow users to add addresses manually from the profile
export async function POST(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return sendError({ message: "Unauthorized", status: 401 });

  try {
    const body = await req.json();
    const { addressLine1, addressLine2, city, state, postalCode, country } = body;

    const newAddress = await prisma.shippingAddress.create({
      data: {
        userId,
        addressLine1,
        addressLine2,
        city,
        state,
        postalCode,
        country
      }
    });

    return sendSuccess({ data: newAddress, status: 201 });
  } catch (error) {
    return sendError({ message: "Error creating address", details: error });
  }
}
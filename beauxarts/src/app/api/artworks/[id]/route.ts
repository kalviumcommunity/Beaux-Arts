import { sendError, sendSuccess } from "@/lib/responseHandler";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.artwork.findUnique({
      where: { id: parseInt(id) },
      include: {
        artist: {
          include: { user: true }, // Gets fullname/storeName
        },
        categories: {
          include: { category: true }, // Gets tags like "Abstract"
        },
      },
    });
    if (!product) {
      return sendError({
        message: "Product not found.",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }
    return sendSuccess({
      data: product,
      message: "Product fetched successfully.",
      status: 200,
    });
  } catch (error) {
    return sendError({
      message: `Error Fetching product.`,
      code: ERROR_CODES.INTERNAL_ERROR,
      details: error,
    });
  }
}

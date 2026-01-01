import { sendError, sendSuccess } from "@/lib/responseHandler";
import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";
import { ERROR_CODES } from "@/lib/errorCodes";
import jwt from "jsonwebtoken";
import { tokenPayload } from "@/lib/types";

// Helper: Verify Seller Token
const verifySeller = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as tokenPayload;
    if (decoded.role !== "SELLER" && decoded.role !== "ADMIN") return null;
    return decoded.userId;
  } catch {
    return null;
  }
};

export async function GET(
  _request: NextRequest,
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = verifySeller(request);
    if (!userId) {
      return sendError({
        message: "Unauthorized: Seller access required",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 403,
      });
    }

    const { id } = await params;
    const artworkId = parseInt(id);

    // Check ownership or admin privilege
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    });

    if (!artwork) {
      return sendError({
        message: "Artwork not found",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    // Verify ownership
    if (artwork.artist.userId !== userId) {
      // Allow admins to edit any artwork
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== "ADMIN") {
        return sendError({
          message: "You can only edit your own artworks",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }
    }

    // Parse request body
    const body = await request.json();
    const {
      title,
      description,
      price,
      stock,
      isUnique,
      categoryIds,
      image,
      dimensions,
      medium,
      year,
      available,
      featured,
    } = body;

    // --- VALIDATION ---
    if (price !== undefined && price <= 0) {
      return sendError({
        message: "Price must be greater than 0",
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    // --- UPDATE ARTWORK ---
    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (isUnique !== undefined) updateData.isUnique = isUnique;
    if (available !== undefined) updateData.available = available;
    if (featured !== undefined) updateData.featured = featured;
    if (image !== undefined)
      updateData.image = Array.isArray(image) ? image : [];
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (medium !== undefined) updateData.medium = medium;
    if (year !== undefined) updateData.year = year ? parseInt(year) : null;

    // Handle category updates
    if (categoryIds !== undefined) {
      // Delete existing categories
      await prisma.artworkCategory.deleteMany({
        where: { artworkId },
      });

      // Create new categories if provided
      if (Array.isArray(categoryIds) && categoryIds.length > 0) {
        updateData.categories = {
          create: categoryIds.map((catId: number) => ({
            categoryId: catId,
          })),
        };
      }
    }

    const updatedArtwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: updateData,
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
      data: updatedArtwork,
      message: "Artwork updated successfully",
    });
  } catch (error) {
    return sendError({
      message: "Error updating artwork",
      code: ERROR_CODES.INTERNAL_ERROR,
      details: error as unknown,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = verifySeller(request);
    if (!userId) {
      return sendError({
        message: "Unauthorized: Seller access required",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 403,
      });
    }

    const { id } = await params;
    const artworkId = parseInt(id);

    // Check ownership or admin privilege
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    });

    if (!artwork) {
      return sendError({
        message: "Artwork not found",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    // Verify ownership
    if (artwork.artist.userId !== userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== "ADMIN") {
        return sendError({
          message: "You can only delete your own artworks",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }
    }

    // Delete associated records first
    await prisma.artworkCategory.deleteMany({
      where: { artworkId },
    });

    await prisma.cartItem.deleteMany({
      where: { artworkId },
    });

    await prisma.orderItem.deleteMany({
      where: { artworkId },
    });

    // Delete artwork
    const deletedArtwork = await prisma.artwork.delete({
      where: { id: artworkId },
    });

    return sendSuccess({
      message: "Artwork deleted successfully",
      data: { id: deletedArtwork.id },
    });
  } catch (error) {
    return sendError({
      message: "Error deleting artwork",
      code: ERROR_CODES.INTERNAL_ERROR,
      details: error as unknown,
    });
  }
}

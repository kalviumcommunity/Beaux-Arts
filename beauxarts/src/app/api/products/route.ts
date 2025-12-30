import prisma from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function GET() {
    try {
        const products = await prisma.artwork.findMany();
        return sendSuccess({
            data: products,
            message: "Products fetched successfully.",
        });
    }catch(error){
        return sendError({ message: `Error Fetching products.`, code:ERROR_CODES.INTERNAL_ERROR, details: error })
    }
}
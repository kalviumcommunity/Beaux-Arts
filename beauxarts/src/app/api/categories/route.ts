
import prisma from "@/lib/prisma";
import { sendSuccess } from "@/lib/responseHandler";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return sendSuccess({ data: categories });
}
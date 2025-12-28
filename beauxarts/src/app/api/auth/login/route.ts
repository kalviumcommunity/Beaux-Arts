import {  NextRequest } from "next/server";
import bycrypt from "bcryptjs";
import  prisma  from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError({
        message: "Invalid email or password.",
        code: ERROR_CODES.NOT_FOUND,
        status: 404,
      });
    }

    const isPasswordValid = await bycrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return sendError({
        message: "Invalid email or password.",
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return sendSuccess({
      data: { token },
      message: "Login successful.",
    });
  } catch (error) {
    return sendError({ message: `Error during login.`, details: error });
  }
}

import { NextRequest } from "next/server";
import bycrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
        status: 401, 
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role , fullname: user.fullname},
      process.env.JWT_SECRET!,
      { expiresIn: "7d" } 
    );

   
    return sendSuccess({
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role,
          phone: user.phone,
        },
      },
      message: "Login successful.",
    });

  } catch (error) {
    return sendError({ message: `Error during login.`, details: error });
  }
}
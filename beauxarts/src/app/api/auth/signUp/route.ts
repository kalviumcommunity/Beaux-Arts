import { NextRequest } from "next/server";
import bycrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const { email, password, fullname } = body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError({
        message: "User with this email already exists.",
        code: ERROR_CODES.USER_EXISTS,
        status: 400,
      });
    }
    const hashedPassword = await bycrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        fullname: fullname,
        email: email,
        password: hashedPassword,
      },
    });

    return sendSuccess({
      data: {
        id: newUser.id,
        name: newUser.fullname,
        email: newUser.email,
      },
      message: "User created successfully.",
    });
  } catch (error) {
    return sendError({ message: `Error creating user.`, details: error });
  }
}

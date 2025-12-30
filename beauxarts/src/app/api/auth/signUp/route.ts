import { NextRequest } from "next/server";
import bycrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { sendError, sendSuccess } from "@/lib/responseHandler";
import { ERROR_CODES } from "@/lib/errorCodes";
import jwt from "jsonwebtoken";
import { userSchema } from "@/lib/schemas/userSchema";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const validation = userSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => e.message).join(", ");
      
      return sendError({
        message: `Validation Error: ${errorMsg}`,
        code: ERROR_CODES.VALIDATION_ERROR,
        status: 400,
        details: validation.error.format() 
      });
    }
    const { email, password, fullname } = validation.data;

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

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    return sendSuccess({
      data: {
        user: {
            id: newUser.id,
            fullname: newUser.fullname,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone
        },
        token: token
      },
      message: "User created successfully.",
      status: 201
    });
  } catch (error) {
    return sendError({ message: `Error creating user.`, details: error });
  }
}

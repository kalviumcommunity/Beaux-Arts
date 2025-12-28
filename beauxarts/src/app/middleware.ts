import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError } from "@/lib/responseHandler";
import { JWTPayload } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only protect specific routes
  if (pathname.startsWith("/api/admin") || pathname.startsWith("/api/users")) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return sendError({
        message: "Token missing",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 401,
      });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

      // Role-based access control
      if (pathname.startsWith("/api/admin") && decoded.role !== "ADMIN") {
        return sendError({
          message: "Access denied. Admins only.",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }

      // Attach user info for downstream handlers
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-user-email", decoded.email);
      requestHeaders.set("x-user-role", decoded.role);

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      return sendError({
        message: "Invalid or expired token",
        code: ERROR_CODES.UNAUTHORIZED,
        status: 403,
      });
    }
  }

  return NextResponse.next();
}
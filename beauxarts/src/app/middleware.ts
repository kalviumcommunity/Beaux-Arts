import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { ERROR_CODES } from "@/lib/errorCodes";
import { sendError } from "@/lib/responseHandler";
import { tokenPayload } from "@/lib/types";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes by role
  const adminRoutes = ["/api/admin", "/dashboard/admin"];
  const sellerRoutes = [
    "/api/artworks",
    "/api/artists/profile",
    "/api/artists/dashboard",
    "/dashboard/artist",
  ];
  const protectedRoutes = ["/api/users", ...adminRoutes, ...sellerRoutes];

  // Check if route needs protection
  const needsProtection = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!needsProtection) {
    return NextResponse.next();
  }

  // Extract and verify token
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
    const decoded = jwt.verify(token, JWT_SECRET) as tokenPayload;

    // --- ROLE-BASED ACCESS CONTROL ---

    // Admin routes: ADMIN only
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (decoded.role !== "ADMIN") {
        return sendError({
          message: "Access denied. Admins only.",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }
    }

    // Seller routes: SELLER or ADMIN
    if (sellerRoutes.some((route) => pathname.startsWith(route))) {
      if (decoded.role !== "SELLER" && decoded.role !== "ADMIN") {
        return sendError({
          message: "Access denied. Sellers only.",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }
    }

    // User routes: Any authenticated user
    if (pathname.startsWith("/api/users")) {
      if (!decoded.userId) {
        return sendError({
          message: "Invalid token",
          code: ERROR_CODES.UNAUTHORIZED,
          status: 403,
        });
      }
    }

    // Attach user info for downstream handlers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", decoded.userId.toString());
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

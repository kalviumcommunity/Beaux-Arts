import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = "your-secret-key-change-in-production";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login"];

// Define protected routes
const PROTECTED_ROUTES = ["/dashboard", "/users"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is public
  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if the route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get("token")?.value;

  if (!token) {
    // No token found, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify the JWT token
    jwt.verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Matcher config for routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

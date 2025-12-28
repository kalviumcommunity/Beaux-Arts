import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")[1];

    if (!token)
      return NextResponse.json({ success: false, message: "Token missing" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ success: true, message: "Protected data", user: decoded });
  } catch {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 403 });
  }
}
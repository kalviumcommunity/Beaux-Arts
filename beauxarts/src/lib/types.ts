import { Role } from "@/generated/prisma/client";

export interface JWTPayload {
  userId: number;
  email: string;
  role: Role; 
}
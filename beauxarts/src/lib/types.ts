import { Role } from "@/generated/prisma/client";

export interface tokenPayload {
  userId: number;
  email: string;
  role: Role; 
  fullname?: string;
}
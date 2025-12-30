import { z } from 'zod';

export const userSchema = z.object({
  fullname: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Phone number is too short").max(15, "Phone number is too long").optional(),
});
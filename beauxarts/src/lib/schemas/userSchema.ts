import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
    password: z.string().min(8),
    phone: z.number().min(10).max(15).optional(),
});

  
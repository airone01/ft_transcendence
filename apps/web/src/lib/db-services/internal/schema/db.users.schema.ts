import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string(),
  password: z.string().min(8),
  avatar: z.string().optional(),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().optional(),
  password: z.string().min(8).optional(),
  avatar: z.string().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

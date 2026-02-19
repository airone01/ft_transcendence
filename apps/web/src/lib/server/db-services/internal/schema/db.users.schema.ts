import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string(),
  password: z.string().min(8).nullable(),
  avatar: z.string().optional(),
});

const updateUserSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  email: z.string().optional(),
  password: z.string().min(8).optional(),
  avatar: z.string().optional(),
});

const friendInfo = z.object({
  userId: z.number().int(),
  username: z.string().min(3).max(20),
  avatar: z.string().nullable(),
  status: z.enum(["online", "offline", "ingame"]),
  currentElo: z.number().int().min(0),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type FriendInfo = z.infer<typeof friendInfo>;

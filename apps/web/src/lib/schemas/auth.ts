// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(20, "Username must be at most 20 characters.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Only letters, numbers, and underscores allowed.",
    ),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;

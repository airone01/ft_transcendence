// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address." /* i18n */),
  password: z.string().min(1, "Password is required." /* i18n */),
});

export const zUsername = z
  .string()
  .min(3, "Username must be at least 3 characters." /* i18n */)
  .max(20, "Username must be at most 20 characters." /* i18n */)
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Only letters, numbers, and underscores allowed." /* i18n */,
  );
export const zEmail = z
  .string()
  .email("Please enter a valid email address." /* i18n */);
export const zPassword = z
  .string()
  .min(8, "Password must be at least 8 characters." /* i18n */)
  .max(64, "Password must be less than 64 characters." /* i18n */)
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter." /* i18n */,
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter." /* i18n */,
  )
  .regex(/[0-9]/, "Password must contain at least one number." /* i18n */)
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character." /* i18n */,
  );

export const registerSchema = z
  .object({
    username: zUsername,
    email: zEmail,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match" /* i18n */,
    path: ["confirmPassword"],
  });

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;

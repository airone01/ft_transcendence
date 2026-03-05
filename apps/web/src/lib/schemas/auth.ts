// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";
import * as m from "$lib/paraglide/messages";

export const loginSchema = z.object({
  email: z.string().email(m.zod_schema_email_invalid()),
  password: z.string().min(1, m.zod_schema_password_required()),
});

export const zUsername = z
  .string()
  .min(3, m.zod_schema_username_min_length())
  .max(20, m.zod_schema_username_max_length())
  .regex(/^[a-zA-Z0-9_]+$/, m.zod_schema_username_char_allowed());
export const zEmail = z.string().email(m.zod_schema_email_invalid());
export const zPassword = z
  .string()
  .min(8, m.zod_schema_password_min_length())
  .max(64, m.zod_schema_password_max_length())
  .regex(/[A-Z]/, m.zod_schema_password_uppercase())
  .regex(/[a-z]/, m.zod_schema_password_lowercase())
  .regex(/[0-9]/, m.zod_schema_password_digit())
  .regex(/[^A-Za-z0-9]/, m.zod_schema_password_special());

export const registerSchema = z
  .object({
    username: zUsername,
    email: zEmail,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m.zod_schema_password_match(),
    path: ["confirmPassword"],
  });

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;

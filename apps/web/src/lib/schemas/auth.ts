// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";
import { m } from "$lib/paraglide/messages";

export const loginSchema = z.object({
  email: z.string().email(m.sform_email_needed()),
  password: z.string().min(1, m.sform_pass_needed()),
});

export const zUsername = z
  .string()
  .min(3, m.sform_user_len())
  .max(20, m.sform_user_len2())
  .regex(/^[a-zA-Z0-9_]+$/, m.sform_user_chars());
export const zEmail = z.string().email(m.sform_email_needed());
export const zPassword = z
  .string()
  .min(8, m.sform_pass_len())
  .max(64, m.sform_user_len2())
  .regex(/[A-Z]/, m.sorm_pass_upper())
  .regex(/[a-z]/, m.sform_pass_lower())
  .regex(/[0-9]/, m.sform_pass_number())
  .regex(/[^A-Za-z0-9]/, m.sform_pass_special());

export const registerSchema = z
  .object({
    username: zUsername,
    email: zEmail,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: m.sform_pass_match(),
    path: ["confirmPassword"],
  });

export type LoginSchema = typeof loginSchema;
export type RegisterSchema = typeof registerSchema;

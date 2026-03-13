// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";
import * as m from "$lib/paraglide/messages";
import { zPassword, zUsername } from "./auth";

export const profileFormSchema = z.object({
  username: zUsername.optional(),
  bio: z.string().max(255, m.zod_schema_bio_max_length()).optional(),
  avatar: z
    .instanceof(File, { message: m.zod_schema_avatar_type() })
    .refine((f) => f.size < 1_000_000, m.zod_schema_avatar_size())
    .optional(),
});

export const accountSettingsSchema = z
  .object({
    oldPassword: z.string().optional(),
    newPassword: zPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: m.zod_schema_password_match(),
    path: ["confirmPassword"],
  });

export type ProfileFormSchema = typeof profileFormSchema;

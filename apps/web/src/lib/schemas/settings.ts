// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";

export const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters" /* i18n */)
    .max(20, "Username must be at most 20 characters" /* i18n */)
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores" /* i18n */,
    )
    .optional(),
  avatar: z
    .instanceof(File, { message: "Avatar must be a file" /* i18n */ })
    .refine((f) => f.size < 100_000, "Max 100 kB upload size." /* i18n */)
    .optional(),
});

export type ProfileFormSchema = typeof profileFormSchema;

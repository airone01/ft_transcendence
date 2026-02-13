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

export const gameplayFormSchema = z.object({
  /**
   * @brief make legal moves during the opponent turn to be played automatically.
   */
  enablePremoves: z.boolean(),
  /**
   * @brief always promote pawns to queen when they reach the other sie of the
   *        board
   */
  alwaysPromoteToQueen: z.boolean(),
  /*
   * @brief user will be asked to confirm when resigning/drawing
   */
  confirmResignOrDraw: z.boolean(),
  /**
   * @brief display legal moves on-screen
   */
  showLegalMoves: z.boolean(),
  /**
   * @brief warn user when time left to play is low
   */
  lowTimeWarning: z.boolean(),
  /**
   * @brief enable always-on focus mode
   */
  focusModeAlwaysOn: z.boolean(),
  /**
   * @brief whether the white pices are always rendered at the bottom of the board
   */
  whiteAlwaysBottom: z.boolean(),
});

export type ProfileFormSchema = typeof profileFormSchema;

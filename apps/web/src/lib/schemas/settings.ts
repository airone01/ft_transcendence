// yes, the fact that zod is on v3 is important.
import { z } from "zod/v3";
import { zPassword, zUsername } from "./auth";

export const profileFormSchema = z.object({
  username: zUsername.optional(),
  avatar: z
    .instanceof(File, { message: "Avatar must be a file" /* i18n */ })
    .refine(
      (f) => f.size < 1_000_000,
      "Avatar files uploaded can be at most 1 MB in size" /* i18n */,
    )
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

export const soundsFormSchema = z.object({
  /**
   * @brief whether to play sounds or not
   */
  playSounds: z.boolean(),
});

export const displayFormSchema = z.object({
  /**
   * @brief whether to enable dark mode
   */
  darkMode: z.boolean(),
  /**
   * @brief whether to display player rating in-game
   */
  showPlayerRatingInGame: z.boolean(),
});

export const privacyFormSchema = z.object({
  /**
   * @brief whether to allow friend requests from other users
   */
  allowFriendRequests: z.boolean(),
  /**
   * @brief whether to enable private/incognito mode
   */
  privateMode: z.boolean(),
  /**
   * @brief whether to enable game history saving
   */
  gameHistory: z.boolean(),
});

export const accountSettingsSchema = z
  .object({
    oldPassword: z.string().optional(),
    newPassword: zPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match" /* i18n */,
    path: ["confirmPassword"],
  });

export type ProfileFormSchema = typeof profileFormSchema;

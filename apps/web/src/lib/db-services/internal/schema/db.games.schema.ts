import { z } from "zod";

const createGameSchema = z.object({
  whiteUserId: z.number().int(),
  blackUserId: z.number().int(),
  timeControlSeconds: z.number().int(),
  incrementSeconds: z.number().int(),
});

const endGameSchema = z.object({
  gameId: z.number().int(),
  result: z.enum(["white_win", "black_win", "draw", "abort"]),
});

export type CreateGameInput = z.infer<typeof createGameSchema>;
export type EndGameInput = z.infer<typeof endGameSchema>;

import { z } from "zod";

const leaderboardSchema = z.array(
  z.object({
    userId: z.number().int(),
    username: z.string().min(3).max(20),
    elo: z.number().int().min(0),
  }),
);

const gameHistorySchema = z.array(
  z.object({
    // Game info
    gameId: z.number().int(),
    timeControlSeconds: z.number().int(),
    incrementSeconds: z.number().int(),
    result: z.enum(["white_win", "black_win", "draw", "abort"]),
    startedAt: z.date(),
    endedAt: z.date(),
    // User info
    userEloBefore: z.number().int().min(0),
    userEloAfter: z.number().int().min(0),
    // Opponent info
    opponentUserId: z.number().int(),
    opponentUsername: z.string().min(3).max(20),
    opponentPastElo: z.number().int().min(0),
    opponentAvatar: z.string().nullable(),
  }),
);

export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type GameHistory = z.infer<typeof gameHistorySchema>;

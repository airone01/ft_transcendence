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
    gameId: z.number().int(),
    timeControlSeconds: z.number().int(),
    incrementSeconds: z.number().int(),
    result: z.enum(["white_win", "black_win", "draw", "abort"]),
    startedAt: z.date(),
    endedAt: z.date(),
    oppenentUserId: z.number().int(),
    oppenentUsername: z.string().min(3).max(20),
    oppenentPastElo: z.number().int().min(0),
    oppenentAvatar: z.string().nullable(),
  }),
);

export type Leaderboard = z.infer<typeof leaderboardSchema>;
export type GameHistory = z.infer<typeof gameHistorySchema>;

import { z } from "zod";

const leaderboardSchema = z.array(
  z.object({
    userId: z.number().int(),
    username: z.string().min(3).max(20),
    elo: z.number().int().min(0),
  }),
);

export type Leaderboard = z.infer<typeof leaderboardSchema>;

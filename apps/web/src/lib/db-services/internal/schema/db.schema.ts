import { z } from "zod";

const userSchema = z.object({
  id: z.number().int(),
  username: z.string().min(3).max(20),
  email: z.string(),
  password: z.string().min(8).nullable(),
  avatar: z.string().nullable(),
  status: z.enum(["online", "offline", "ingame"]),
  createdAt: z.date(),
});

const userStatsSchema = z.object({
  userId: z.number().int(),
  gamesPlayed: z.number().int().min(0),
  wins: z.number().int().min(0),
  losses: z.number().int().min(0),
  draws: z.number().int().min(0),
  currentElo: z.number().int().min(0),
  updatedAt: z.date(),
});

const friendshipSchema = z.object({
  firstFriendId: z.number().int(),
  secondFriendId: z.number().int(),
  createdAt: z.date(),
});

const authSessionsSchema = z.object({
  id: z.string(),
  userId: z.number().int(),
  createdAt: z.date(),
  expiresAt: z.date(),
});

const oauthAccountSchema = z.object({
  provider: z.enum(["discord", "google", "github"]),
  providerUserId: z.string(),
  userId: z.number().int(),
});

const gamesSchema = z.object({
  id: z.number().int(),
  status: z.enum(["waiting", "ongoing", "finished"]),
  timeControlSeconds: z.number().int(),
  incrementSeconds: z.number().int(),
  fen: z.string(),
  result: z.enum(["white_win", "black_win", "draw", "abort"]).nullable(),
  createdAt: z.date(),
  startedAt: z.date().nullable(),
  endedAt: z.date().nullable(),
});

const gamesPlayersSchema = z.object({
  gameId: z.number().int(),
  userId: z.number().int(),
  color: z.enum(["white", "black"]),
  eloBefore: z.number().int(),
  eloAfter: z.number().int().nullable(),
});

const gamesSpectatorsSchema = z.object({
  gameId: z.number().int(),
  userId: z.number().int(),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type Friendship = z.infer<typeof friendshipSchema>;
export type AuthSession = z.infer<typeof authSessionsSchema>;
export type OauthAccount = z.infer<typeof oauthAccountSchema>;
export type Game = z.infer<typeof gamesSchema>;
export type GamePlayer = z.infer<typeof gamesPlayersSchema>;
export type GameSpectator = z.infer<typeof gamesSpectatorsSchema>;

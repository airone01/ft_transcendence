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

const eloHistorySchema = z.object({
  userId: z.number().int(),
  elo: z.number().int().min(0),
  createdAt: z.date(),
});

const achievementsSchema = z.object({
  userId: z.number().int(),
  first_game: z.boolean(),
  first_win: z.boolean(),
  five_wins: z.boolean(),
  reach_high_elo: z.boolean(),
  update_profile: z.boolean(),
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

const chatChannelsSchema = z.object({
  id: z.number().int(),
  type: z.enum(["global", "game", "private"]),
  gameId: z.number().int().nullable(),
  createdAt: z.date(),
});

const chatChannelMembersSchema = z.object({
  channelId: z.number().int(),
  userId: z.number().int(),
  joinedAt: z.date(),
});

const chatMessagesSchema = z.object({
  id: z.number().int(),
  channelId: z.number().int(),
  userId: z.number().int(),
  content: z.string(),
  createdAt: z.date(),
});

export type User = z.infer<typeof userSchema>;
export type UserStats = z.infer<typeof userStatsSchema>;
export type EloHistory = z.infer<typeof eloHistorySchema>;
export type Achievements = z.infer<typeof achievementsSchema>;
export type Friendship = z.infer<typeof friendshipSchema>;
export type AuthSession = z.infer<typeof authSessionsSchema>;
export type OauthAccount = z.infer<typeof oauthAccountSchema>;
export type Game = z.infer<typeof gamesSchema>;
export type GamePlayer = z.infer<typeof gamesPlayersSchema>;
export type GameSpectator = z.infer<typeof gamesSpectatorsSchema>;
export type ChatChannel = z.infer<typeof chatChannelsSchema>;
export type ChatChannelMember = z.infer<typeof chatChannelMembersSchema>;
export type ChatMessage = z.infer<typeof chatMessagesSchema>;

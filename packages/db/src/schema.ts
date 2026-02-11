import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

// ################################ USERS ################################

export const userStatus = pgEnum("user_status", [
  "online",
  "offline",
  "ingame",
]);

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 20 }).unique().notNull(),
    email: varchar("email").unique().notNull(),
    password: varchar("password"),
    avatar: text("avatar"), // unlimited size is fine, we encode in backend
    status: userStatus().default("offline").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    check(
      "users_email_lowercase_check",
      sql`${table.email} = lower(${table.email})`,
    ),
  ],
);

// ############################ OAUTH ACCOUNT ############################

export const oauthProviders = pgEnum("oauth_providers", [
  "discord",
  "google",
  "github",
]);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    provider: oauthProviders().notNull(),
    // unique internal user ID (given by the provider, not by us)
    providerUserId: text("provider_user_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerUserId] }),
    index("oauth_account_user_id_idx").on(table.userId),
  ],
);

// ############################ AUTH_SESSIONS ############################

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

// ############################# USERS_STATS #############################

export const usersStats = pgTable(
  "users_stats",
  {
    userId: integer("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),
    gamesPlayed: integer("games_played").default(0).notNull(),
    wins: integer("wins").default(0).notNull(),
    losses: integer("losses").default(0).notNull(),
    draws: integer("draws").default(0).notNull(),
    currentElo: integer("current_elo").default(1000).notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("users_stats_current_elo").on(table.currentElo),
    check("users_stats_current_elo_check", sql`${table.currentElo} > 0`),
  ],
);

// ############################# FRIENDSHIPS #############################

export const friendships = pgTable(
  "friendships",
  {
    firstFriendId: integer("first_friend_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    secondFriendId: integer("second_friend_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.firstFriendId, table.secondFriendId] }),
    index("friendships_first_friend_id_idx").on(table.firstFriendId),
    index("friendships_second_friend_id_idx").on(table.secondFriendId),
    check(
      "friendships_duplicates_check",
      sql`${table.firstFriendId} < ${table.secondFriendId}`,
    ),
  ],
);

// ############################ GAMES_PLAYERS ############################

export const colors = pgEnum("colors", ["white", "black"]);

export const gamesPlayers = pgTable(
  "games_players",
  {
    gameId: integer("game_id")
      .references(() => games.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
    color: colors().notNull(),
    eloBefore: integer("elo_before").notNull(),
    eloAfter: integer("elo_after"),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.userId] }),
    index("games_players_game_id_idx").on(table.gameId),
    index("games_players_user_id_idx").on(table.userId),
    unique("games_game_id_color_unique").on(table.gameId, table.color),
    check("games_players_elo_before_check", sql`${table.eloBefore} > 0`),
    check("games_players_elo_after_check", sql`${table.eloAfter} > 0`),
  ],
);

// ########################## GAMES_SPECTATORS ###########################

export const gamesSpectators = pgTable(
  "games_spectators",
  {
    gameId: integer("game_id")
      .references(() => games.id, {
        onDelete: "cascade",
      })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.gameId, table.userId] }),
    index("games_spectators_game_id_idx").on(table.gameId),
    index("games_spectators_user_id_idx").on(table.userId),
  ],
);

// ################################ GAMES ################################

export const gameStatus = pgEnum("game_status", [
  "waiting",
  "ongoing",
  "finished",
]);
export const result = pgEnum("result", [
  "white_win",
  "black_win",
  "draw",
  "abort",
]);

export const games = pgTable(
  "games",
  {
    id: serial("id").primaryKey(),
    status: gameStatus().default("waiting").notNull(),
    timeControlSeconds: integer("time_control_seconds").notNull(),
    incrementSeconds: integer("increment_seconds").notNull(),
    fen: varchar("fen")
      .notNull()
      .default("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"),
    result: result(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    startedAt: timestamp("started_at"),
    endedAt: timestamp("ended_at"),
  },
  (table) => [
    index("games_status_idx").on(table.status),
    index("games_ended_at_idx").on(table.endedAt),
    check(
      "games_time_control_seconds_check",
      sql`${table.timeControlSeconds} > 0`,
    ),
    check("games_increment_seconds_check", sql`${table.incrementSeconds} >= 0`),
  ],
);

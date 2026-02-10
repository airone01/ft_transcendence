CREATE TYPE "public"."colors" AS ENUM('white', 'black');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('waiting', 'ongoing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."oauth_providers" AS ENUM('discord', 'google', 'github');--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('white_win', 'black_win', 'draw', 'abort');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('online', 'offline', 'ingame');--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"first_friend_id" integer NOT NULL,
	"second_friend_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_first_friend_id_second_friend_id_pk" PRIMARY KEY("first_friend_id","second_friend_id"),
	CONSTRAINT "friendships_duplicates_check" CHECK ("friendships"."first_friend_id" < "friendships"."second_friend_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "game_status" DEFAULT 'waiting' NOT NULL,
	"time_control_seconds" integer NOT NULL,
	"increment_seconds" integer NOT NULL,
	"fen" varchar DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0' NOT NULL,
	"result" "result",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"started_at" timestamp,
	"ended_at" timestamp,
	CONSTRAINT "games_time_control_seconds_check" CHECK ("games"."time_control_seconds" > 0),
	CONSTRAINT "games_increment_seconds_check" CHECK ("games"."increment_seconds" >= 0)
);
--> statement-breakpoint
CREATE TABLE "games_players" (
	"game_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"color" "colors" NOT NULL,
	"elo_before" integer NOT NULL,
	"elo_after" integer,
	CONSTRAINT "games_players_game_id_user_id_pk" PRIMARY KEY("game_id","user_id"),
	CONSTRAINT "games_game_id_color_unique" UNIQUE("game_id","color"),
	CONSTRAINT "games_players_elo_before_check" CHECK ("games_players"."elo_before" > 0),
	CONSTRAINT "games_players_elo_after_check" CHECK ("games_players"."elo_after" > 0)
);
--> statement-breakpoint
CREATE TABLE "games_spectators" (
	"game_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "games_spectators_game_id_user_id_pk" PRIMARY KEY("game_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "oauth_accounts" (
	"provider" "oauth_providers" NOT NULL,
	"provider_user_id" text NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "oauth_accounts_provider_provider_user_id_pk" PRIMARY KEY("provider","provider_user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(20) NOT NULL,
	"email" varchar NOT NULL,
	"password" varchar,
	"avatar" varchar(4096),
	"status" "user_status" DEFAULT 'offline' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_email_lowercase_check" CHECK ("users"."email" = lower("users"."email"))
);
--> statement-breakpoint
CREATE TABLE "users_stats" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"games_played" integer DEFAULT 0 NOT NULL,
	"wins" integer DEFAULT 0 NOT NULL,
	"losses" integer DEFAULT 0 NOT NULL,
	"draws" integer DEFAULT 0 NOT NULL,
	"current_elo" integer DEFAULT 1000 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_stats_current_elo_check" CHECK ("users_stats"."current_elo" > 0)
);
--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_first_friend_id_users_id_fk" FOREIGN KEY ("first_friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_second_friend_id_users_id_fk" FOREIGN KEY ("second_friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_players" ADD CONSTRAINT "games_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_players" ADD CONSTRAINT "games_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_spectators" ADD CONSTRAINT "games_spectators_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_spectators" ADD CONSTRAINT "games_spectators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_stats" ADD CONSTRAINT "users_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "friendships_first_friend_id_idx" ON "friendships" USING btree ("first_friend_id");--> statement-breakpoint
CREATE INDEX "friendships_second_friend_id_idx" ON "friendships" USING btree ("second_friend_id");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_ended_at_idx" ON "games" USING btree ("ended_at");--> statement-breakpoint
CREATE INDEX "games_players_game_id_idx" ON "games_players" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "games_players_user_id_idx" ON "games_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "games_spectators_game_id_idx" ON "games_spectators" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "games_spectators_user_id_idx" ON "games_spectators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_account_user_id_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_stats_current_elo" ON "users_stats" USING btree ("current_elo");
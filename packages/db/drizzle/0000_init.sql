CREATE TYPE "public"."chat_channel_type" AS ENUM('global', 'game', 'private');--> statement-breakpoint
CREATE TYPE "public"."colors" AS ENUM('white', 'black');--> statement-breakpoint
CREATE TYPE "public"."game_status" AS ENUM('waiting', 'ongoing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."oauth_providers" AS ENUM('discord', 'google', 'github');--> statement-breakpoint
CREATE TYPE "public"."result" AS ENUM('white_win', 'black_win', 'draw', 'abort');--> statement-breakpoint
CREATE TABLE "achievements" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"first_game" boolean DEFAULT false NOT NULL,
	"first_win" boolean DEFAULT false NOT NULL,
	"five_wins" boolean DEFAULT false NOT NULL,
	"reach_high_elo" boolean DEFAULT false NOT NULL,
	"update_profile" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_channel_members" (
	"channel_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "chat_channel_members_channel_id_user_id_pk" PRIMARY KEY("channel_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "chat_channels" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "chat_channel_type" NOT NULL,
	"game_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"channel_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "elo_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"elo" integer DEFAULT 1000 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
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
CREATE TABLE "friendships_invitations" (
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "friendships_invitations_user_id_friend_id_pk" PRIMARY KEY("user_id","friend_id")
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" serial PRIMARY KEY NOT NULL,
	"status" "game_status" DEFAULT 'waiting' NOT NULL,
	"time_control_seconds" integer NOT NULL,
	"increment_seconds" integer NOT NULL,
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
	"avatar" text,
	"bio" varchar DEFAULT '' NOT NULL,
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
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channel_members" ADD CONSTRAINT "chat_channel_members_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channel_members" ADD CONSTRAINT "chat_channel_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_channels" ADD CONSTRAINT "chat_channels_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_channel_id_chat_channels_id_fk" FOREIGN KEY ("channel_id") REFERENCES "public"."chat_channels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "elo_history" ADD CONSTRAINT "elo_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_first_friend_id_users_id_fk" FOREIGN KEY ("first_friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_second_friend_id_users_id_fk" FOREIGN KEY ("second_friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships_invitations" ADD CONSTRAINT "friendships_invitations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships_invitations" ADD CONSTRAINT "friendships_invitations_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_players" ADD CONSTRAINT "games_players_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_players" ADD CONSTRAINT "games_players_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_spectators" ADD CONSTRAINT "games_spectators_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "games_spectators" ADD CONSTRAINT "games_spectators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "oauth_accounts" ADD CONSTRAINT "oauth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_stats" ADD CONSTRAINT "users_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "chat_channel_members_channel_id_idx" ON "chat_channel_members" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "chat_channel_members_user_id_idx" ON "chat_channel_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_channels_type_idx" ON "chat_channels" USING btree ("type");--> statement-breakpoint
CREATE INDEX "chat_channels_game_id_idx" ON "chat_channels" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "chat_messages_channel_id_idx" ON "chat_messages" USING btree ("channel_id");--> statement-breakpoint
CREATE INDEX "chat_messages_user_id_idx" ON "chat_messages" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "chat_messages_created_at_idx" ON "chat_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "elo_history_created_at_idx" ON "elo_history" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "friendships_first_friend_id_idx" ON "friendships" USING btree ("first_friend_id");--> statement-breakpoint
CREATE INDEX "friendships_second_friend_id_idx" ON "friendships" USING btree ("second_friend_id");--> statement-breakpoint
CREATE INDEX "friendships_invitations_user_id_idx" ON "friendships_invitations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "friendships_invitations_friend_id_idx" ON "friendships_invitations" USING btree ("friend_id");--> statement-breakpoint
CREATE INDEX "friendships_invitations_created_at_idx" ON "friendships_invitations" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "games_status_idx" ON "games" USING btree ("status");--> statement-breakpoint
CREATE INDEX "games_ended_at_idx" ON "games" USING btree ("ended_at");--> statement-breakpoint
CREATE INDEX "games_players_game_id_idx" ON "games_players" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "games_players_user_id_idx" ON "games_players" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "games_spectators_game_id_idx" ON "games_spectators" USING btree ("game_id");--> statement-breakpoint
CREATE INDEX "games_spectators_user_id_idx" ON "games_spectators" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "oauth_account_user_id_idx" ON "oauth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "users_stats_current_elo" ON "users_stats" USING btree ("current_elo");
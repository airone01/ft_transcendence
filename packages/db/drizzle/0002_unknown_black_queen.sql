ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."oauth_providers";--> statement-breakpoint
CREATE TYPE "public"."oauth_providers" AS ENUM('discord');--> statement-breakpoint
ALTER TABLE "oauth_accounts" ALTER COLUMN "provider" SET DATA TYPE "public"."oauth_providers" USING "provider"::"public"."oauth_providers";
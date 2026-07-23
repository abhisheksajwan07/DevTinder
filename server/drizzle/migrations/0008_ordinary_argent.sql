ALTER TABLE "profile_actions" ALTER COLUMN "action" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."swipe_action";--> statement-breakpoint
CREATE TYPE "public"."swipe_action" AS ENUM('skipped', 'interested');--> statement-breakpoint
ALTER TABLE "profile_actions" ALTER COLUMN "action" SET DATA TYPE "public"."swipe_action" USING "action"::"public"."swipe_action";
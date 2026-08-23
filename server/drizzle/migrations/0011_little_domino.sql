ALTER TABLE "conversation" ADD COLUMN "last_message_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "matches" DROP COLUMN "updated_at";
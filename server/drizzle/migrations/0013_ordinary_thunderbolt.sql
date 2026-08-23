ALTER TABLE "conversation" ALTER COLUMN "last_message_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "conversation" ALTER COLUMN "last_message_at" DROP NOT NULL;
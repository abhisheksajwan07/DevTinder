ALTER TABLE "auth_accounts" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD COLUMN "token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD COLUMN "provider_email" varchar(255);--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD COLUMN "last_used_at" timestamp with time zone DEFAULT now();
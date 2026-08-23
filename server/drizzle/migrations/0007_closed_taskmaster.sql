CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."swipe_action" AS ENUM('passed', 'connected');--> statement-breakpoint
CREATE TABLE "profile_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_profile_id" uuid NOT NULL,
	"target_profile_id" uuid NOT NULL,
	"action" "swipe_action" NOT NULL,
	"status" "connection_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile_actions" ADD CONSTRAINT "profile_actions_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_actions" ADD CONSTRAINT "profile_actions_target_profile_id_profiles_id_fk" FOREIGN KEY ("target_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_actor_target" ON "profile_actions" USING btree ("actor_profile_id","target_profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_actions_actor" ON "profile_actions" USING btree ("actor_profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_actions_target" ON "profile_actions" USING btree ("target_profile_id");
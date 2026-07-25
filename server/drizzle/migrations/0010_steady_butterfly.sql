CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_one_id" uuid NOT NULL,
	"profile_two_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_different_profiles" CHECK ("matches"."profile_one_id" <> "matches"."profile_two_id")
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_one_id_profiles_id_fk" FOREIGN KEY ("profile_one_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_two_id_profiles_id_fk" FOREIGN KEY ("profile_two_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "matches_unique_pair" ON "matches" USING btree ("profile_one_id","profile_two_id");--> statement-breakpoint
CREATE INDEX "matches_profile_one_idx" ON "matches" USING btree ("profile_one_id");--> statement-breakpoint
CREATE INDEX "matches_profile_two_idx" ON "matches" USING btree ("profile_two_id");--> statement-breakpoint
ALTER TABLE "profile_actions" ADD CONSTRAINT "profile_actions_different_profiles" CHECK ("profile_actions"."actor_profile_id" <> "profile_actions"."target_profile_id");
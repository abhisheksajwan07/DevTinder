CREATE TABLE "github_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"github_id" text NOT NULL,
	"username" varchar(39) NOT NULL,
	"avatar_url" text,
	"bio" text,
	"followers" integer DEFAULT 0 NOT NULL,
	"public_repos" integer DEFAULT 0 NOT NULL,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "github_profiles_profile_id_unique" UNIQUE("profile_id")
);
--> statement-breakpoint
CREATE TABLE "github_repositories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"github_repo_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"language" varchar(50),
	"stars" integer DEFAULT 0 NOT NULL,
	"html_url" text NOT NULL,
	"repo_updated_at" timestamp with time zone,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "github_profiles" ADD CONSTRAINT "github_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_github_profiles_profile_id" ON "github_profiles" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_repo_profile_unique" ON "github_repositories" USING btree ("profile_id","github_repo_id");--> statement-breakpoint
CREATE INDEX "idx_github_repositories_profile_id" ON "github_repositories" USING btree ("profile_id");
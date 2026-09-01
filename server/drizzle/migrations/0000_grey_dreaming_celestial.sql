CREATE TYPE "public"."auth_provider" AS ENUM('google', 'github');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'file');--> statement-breakpoint
CREATE TYPE "public"."embedding_status" AS ENUM('stale', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Junior', 'Mid', 'Senior', 'Lead');--> statement-breakpoint
CREATE TYPE "public"."primary_role" AS ENUM('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'ml', 'data', 'designer', 'product');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('frontend', 'backend', 'database', 'devops', 'cloud', 'ai', 'mobile', 'testing', 'other');--> statement-breakpoint
CREATE TYPE "public"."weekly_availability" AS ENUM('1_5_hours', '5_15_hours', '15_30_hours', 'full_time');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."swipe_action" AS ENUM('skipped', 'interested');--> statement-breakpoint
CREATE TABLE "auth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"token_expires_at" timestamp with time zone,
	"provider_email" varchar(255),
	"provider" "auth_provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"password_hash" varchar(255),
	"is_verified" boolean DEFAULT false NOT NULL,
	"login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "email_credentials_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
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
CREATE TABLE "conversation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"match_id" uuid NOT NULL,
	"last_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversation_match_id_unique" UNIQUE("match_id")
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_one_id" uuid NOT NULL,
	"profile_two_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "matches_different_profiles" CHECK ("matches"."profile_one_id" <> "matches"."profile_two_id")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_profile_id" uuid NOT NULL,
	"type" "message_type" DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "avatars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"gender" varchar(20),
	"style" varchar(50),
	"image_url" varchar(500),
	"storage_key" varchar(400),
	CONSTRAINT "avatars_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "interests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "interests_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "looking_for" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	CONSTRAINT "looking_for_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profile_interests" (
	"profile_id" uuid NOT NULL,
	"interest_id" uuid NOT NULL,
	CONSTRAINT "profile_interests_profile_id_interest_id_pk" PRIMARY KEY("profile_id","interest_id")
);
--> statement-breakpoint
CREATE TABLE "profile_looking_for" (
	"profile_id" uuid NOT NULL,
	"looking_for_id" uuid NOT NULL,
	CONSTRAINT "profile_looking_for_profile_id_looking_for_id_pk" PRIMARY KEY("profile_id","looking_for_id")
);
--> statement-breakpoint
CREATE TABLE "profile_skills" (
	"profile_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "profile_skills_profile_id_skill_id_pk" PRIMARY KEY("profile_id","skill_id")
);
--> statement-breakpoint

CREATE EXTENSION IF NOT EXISTS vector;--> statement-breakpoint

CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"user_name" varchar(30) NOT NULL,
	"bio" text,
	"avatar_id" uuid NOT NULL,
	"primary_role" "primary_role" NOT NULL,
	"experience_level" "experience_level" NOT NULL,
	"availability" "weekly_availability" NOT NULL,
	"project_description" text,
	"embedding_status" "embedding_status" DEFAULT 'stale' NOT NULL,
	"embedding_updated_at" timestamp with time zone,
	"embedding" vector(1024),
	"embedding_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_user_name_unique" UNIQUE("user_name")
);--> statement-breakpoint

CREATE INDEX IF NOT EXISTS profiles_embedding_hnsw_idx
ON profiles
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);--> statement-breakpoint

--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "skill_category" DEFAULT 'other' NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "profile_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_profile_id" uuid NOT NULL,
	"target_profile_id" uuid NOT NULL,
	"action" "swipe_action" NOT NULL,
	"status" "connection_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_actions_different_profiles" CHECK ("profile_actions"."actor_profile_id" <> "profile_actions"."target_profile_id")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"refresh_token_hash" varchar(255) NOT NULL,
	"user_agent" text,
	"ip_address" varchar(45),
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now(),
	"is_revoked" boolean DEFAULT false NOT NULL,
	"revoked_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"on_boarding_complete" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "auth_accounts" ADD CONSTRAINT "auth_accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_credentials" ADD CONSTRAINT "email_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_profiles" ADD CONSTRAINT "github_profiles_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "github_repositories" ADD CONSTRAINT "github_repositories_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_one_id_profiles_id_fk" FOREIGN KEY ("profile_one_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_profile_two_id_profiles_id_fk" FOREIGN KEY ("profile_two_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_profile_id_profiles_id_fk" FOREIGN KEY ("sender_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_looking_for" ADD CONSTRAINT "profile_looking_for_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_looking_for" ADD CONSTRAINT "profile_looking_for_looking_for_id_looking_for_id_fk" FOREIGN KEY ("looking_for_id") REFERENCES "public"."looking_for"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_actions" ADD CONSTRAINT "profile_actions_actor_profile_id_profiles_id_fk" FOREIGN KEY ("actor_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_actions" ADD CONSTRAINT "profile_actions_target_profile_id_profiles_id_fk" FOREIGN KEY ("target_profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "provider_account_unique" ON "auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "idx_auth_accounts_user_id" ON "auth_accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_email_credentials_user_id" ON "email_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_github_profiles_profile_id" ON "github_profiles" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "github_repo_profile_unique" ON "github_repositories" USING btree ("profile_id","github_repo_id");--> statement-breakpoint
CREATE INDEX "idx_github_repositories_profile_id" ON "github_repositories" USING btree ("profile_id");--> statement-breakpoint
CREATE UNIQUE INDEX "matches_unique_pair" ON "matches" USING btree ("profile_one_id","profile_two_id");--> statement-breakpoint
CREATE INDEX "matches_profile_one_idx" ON "matches" USING btree ("profile_one_id");--> statement-breakpoint
CREATE INDEX "matches_profile_two_idx" ON "matches" USING btree ("profile_two_id");--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_profile_id");--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_actor_target" ON "profile_actions" USING btree ("actor_profile_id","target_profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_actions_actor" ON "profile_actions" USING btree ("actor_profile_id");--> statement-breakpoint
CREATE INDEX "idx_profile_actions_target" ON "profile_actions" USING btree ("target_profile_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");

CREATE TYPE "public"."embedding_status" AS ENUM('stale', 'processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."experience_level" AS ENUM('Junior', 'Mid', 'Senior', 'Lead');--> statement-breakpoint
CREATE TYPE "public"."primary_role" AS ENUM('frontend', 'backend', 'fullstack', 'mobile', 'devops', 'ml', 'data', 'designer', 'product');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('frontend', 'backend', 'database', 'devops', 'cloud', 'ai', 'mobile', 'testing', 'other');--> statement-breakpoint
CREATE TYPE "public"."weekly_availability" AS ENUM('1_5_hours', '5_15_hours', '15_30_hours', 'full_time');--> statement-breakpoint
CREATE TABLE "avatars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" varchar(50) NOT NULL,
	"display_name" varchar(100) NOT NULL,
	"gender" varchar(20),
	"style" varchar(50),
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
	"github_username" varchar(35),
	"project_description" text,
	"embedding_status" "embedding_status" DEFAULT 'stale' NOT NULL,
	"embedding_updated_at" timestamp with time zone,
	"embedding_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profiles_user_name_unique" UNIQUE("user_name")
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"category" "skill_category" DEFAULT 'other' NOT NULL,
	"is_custom" boolean DEFAULT false NOT NULL,
	CONSTRAINT "skills_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_interests" ADD CONSTRAINT "profile_interests_interest_id_interests_id_fk" FOREIGN KEY ("interest_id") REFERENCES "public"."interests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_looking_for" ADD CONSTRAINT "profile_looking_for_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_looking_for" ADD CONSTRAINT "profile_looking_for_looking_for_id_looking_for_id_fk" FOREIGN KEY ("looking_for_id") REFERENCES "public"."looking_for"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_avatar_id_avatars_id_fk" FOREIGN KEY ("avatar_id") REFERENCES "public"."avatars"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profiles_username_unique" ON "profiles" USING btree ("user_name");--> statement-breakpoint
CREATE INDEX "profiles_user_id_idx" ON "profiles" USING btree ("user_id");
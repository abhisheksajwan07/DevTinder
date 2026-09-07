ALTER TABLE "skills" DROP CONSTRAINT "skills_name_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "skills_name_lower_unique" ON "skills" USING btree (lower("name"));
import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { profiles } from "./onboarding.schema.js";

export const githubProfiles = pgTable(
  "github_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    profileId: uuid("profile_id")
      .notNull()
      .unique()
      .references(() => profiles.id, { onDelete: "cascade" }),

    githubId: text("github_id").notNull(),

    username: varchar("username", { length: 39 }).notNull(),

    avatarUrl: text("avatar_url"),

    bio: text("bio"),

    followers: integer("followers").notNull().default(0),

    publicRepos: integer("public_repos").notNull().default(0),

    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_github_profiles_profile_id").on(table.profileId),
  ],
);

export const githubRepositories = pgTable(
  "github_repositories",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    githubRepoId: integer("github_repo_id").notNull(),

    name: varchar("name", { length: 100 }).notNull(),

    description: text("description"),

    language: varchar("language", { length: 50 }),

    stars: integer("stars").notNull().default(0),

    htmlUrl: text("html_url").notNull(),

    repoUpdatedAt: timestamp("repo_updated_at", { withTimezone: true }),

    isFeatured: boolean("is_featured").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("github_repo_profile_unique").on(
      table.profileId,
      table.githubRepoId,
    ),
    index("idx_github_repositories_profile_id").on(table.profileId),
  ],
);

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
  integer,
  vector,
} from "drizzle-orm/pg-core";
import { users } from "../schema/users.schema.js";
import { primaryKey } from "drizzle-orm/pg-core";
import { boolean } from "drizzle-orm/pg-core";

export const primaryRoleEnum = pgEnum("primary_role", [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "ml",
  "data",
  "designer",
  "product",
]);

export const skillCategoryEnum = pgEnum("skill_category", [
  "frontend",
  "backend",
  "database",
  "devops",
  "cloud",
  "ai",
  "mobile",
  "testing",
  "other",
]);

export const experienceLevelEnum = pgEnum("experience_level", [
  "Junior",
  "Mid",
  "Senior",
  "Lead",
]);
export const weeklyAvailabilityEnum = pgEnum("weekly_availability", [
  "1_5_hours",
  "5_15_hours",
  "15_30_hours",
  "full_time",
]);
export const embeddingStatusEnum = pgEnum("embedding_status", [
  "stale",
  "processing",
  "ready",
  "failed",
]);

export const avatars = pgTable("avatars", {
  id: uuid().defaultRandom().primaryKey(),
  key: varchar("key", { length: 50 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  gender: varchar("gender", { length: 20 }),
  style: varchar("style", { length: 50 }),
  imageUrl: varchar("image_url", { length: 500 }),
  storageUrl: varchar("storage_key", { length: 400 }),
});

export const profiles = pgTable(
  "profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    firstName: varchar("first_name", {
      length: 100,
    }).notNull(),

    lastName: varchar("last_name", {
      length: 100,
    }).notNull(),

    userName: varchar("user_name", {
      length: 30,
    })
      .notNull()
      .unique(),

    bio: text("bio"),

    avatarId: uuid("avatar_id")
      .notNull()
      .references(() => avatars.id),

    primaryRole: primaryRoleEnum("primary_role").notNull(),

    experienceLevel: experienceLevelEnum("experience_level").notNull(),

    availability: weeklyAvailabilityEnum("availability").notNull(),

    githubUsername: varchar("github_username", {
      length: 35,
    }),
    projectDescription: text("project_description"),

    embeddingStatus: embeddingStatusEnum("embedding_status")
      .notNull()
      .default("stale"),

    embeddingUpdatedAt: timestamp("embedding_updated_at", {
      withTimezone: true,
    }),
    embeddingVector: vector("embedding", { dimensions: 1024 }),
    embeddingVersion: integer("embedding_version").default(1).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    
    index("profiles_user_id_idx").on(table.userId),
  ],
);

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", {
    length: 100,
  })
    .notNull()
    .unique(),
  category: skillCategoryEnum("category").notNull().default("other"),
  isCustom: boolean("is_custom").notNull().default(false),
});

export const interests = pgTable("interests", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 100,
  })
    .notNull()
    .unique(),
});

export const lookingFor = pgTable("looking_for", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: varchar("name", {
    length: 100,
  })
    .notNull()
    .unique(),
});

export const profileSkills = pgTable(
  "profile_skills",

  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id, {
        onDelete: "cascade",
      }),
  },

  (table) => [
    primaryKey({
      columns: [table.profileId, table.skillId],
    }),
  ],
);

export const profileInterests = pgTable(
  "profile_interests",
  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),
    interestId: uuid("interest_id")
      .notNull()
      .references(() => interests.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.profileId, table.interestId],
    }),
  ],
);

export const profileLookingFor = pgTable(
  "profile_looking_for",

  {
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    lookingForId: uuid("looking_for_id")
      .notNull()
      .references(() => lookingFor.id, {
        onDelete: "cascade",
      }),
  },

  (table) => [
    primaryKey({
      columns: [table.profileId, table.lookingForId],
    }),
  ],
);

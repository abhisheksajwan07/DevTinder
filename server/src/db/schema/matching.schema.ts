import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  check,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { profiles } from "../schema/onboarding.schema.js";

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    profileOneId: uuid("profile_one_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),
    profileTwoId: uuid("profile_two_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("matches_unique_pair").on(
      table.profileOneId,
      table.profileTwoId,
    ),
    index("matches_profile_one_idx").on(table.profileOneId),
    index("matches_profile_two_idx").on(table.profileTwoId),

    check(
      "matches_different_profiles",
      sql`${table.profileOneId} <> ${table.profileTwoId}`,
    ),
  ],
);

export const conversations = pgTable("conversation", {
  id: uuid("id").defaultRandom().primaryKey(),

  matchId: uuid("match_id")
    .unique()
    .notNull()
    .references(() => matches.id, {
      onDelete: "cascade",
    }),
  
  lastMessageAt: timestamp("last_message_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

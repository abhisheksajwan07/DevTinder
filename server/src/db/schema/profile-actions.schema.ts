import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";

import { profiles } from "./onboarding.schema.js";
import { sql } from "drizzle-orm";
export const swipeActionEnum = pgEnum("swipe_action", [
  "skipped",
  "interested",
]);

export const connectionStatusEnum = pgEnum("connection_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const profileActions = pgTable(
  "profile_actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    actorProfileId: uuid("actor_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    targetProfileId: uuid("target_profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),

    action: swipeActionEnum("action").notNull(),
    status: connectionStatusEnum("status"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    
    uniqueIndex("unique_actor_target").on(
      table.actorProfileId,
      table.targetProfileId,
    ),
    index("idx_profile_actions_actor").on(table.actorProfileId),
    index("idx_profile_actions_target").on(table.targetProfileId),

    check(
      "profile_actions_different_profiles",
      sql`${table.actorProfileId} <> ${table.targetProfileId}`,
    ),
  ],
);

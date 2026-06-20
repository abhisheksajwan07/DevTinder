import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  serial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    refreshTokenHash: varchar("refresh_token_hash", {
      length: 255,
    }).notNull(),

    userAgent: text("user_agent"),

    ipAddress: varchar("ip_address", {
      length: 45,
    }),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    lastUsedAt: timestamp("last_used_at", {
      withTimezone: true,
    }).defaultNow(),

    isRevoked: boolean("is_revoked").notNull().default(false),

    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.userId),
    index("idx_sessions_expires_at").on(table.expiresAt),
  ],
);

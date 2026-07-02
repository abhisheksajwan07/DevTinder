import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

import { users } from "./users.schema.js";

export const authProviderEnum = pgEnum("auth_provider", ["google", "github"]);

export const emailCredentials = pgTable(
  "email_credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .unique(),

    passwordHash: varchar("password_hash", {
      length: 255,
    }),

    isVerified: boolean("is_verified").notNull().default(false),

    loginAttempts: integer("login_attempts").notNull().default(0),

    lockedUntil: timestamp("locked_until", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_email_credentials_user_id").on(table.userId)],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    provider: authProviderEnum("provider").notNull(),

    providerAccountId: text("provider_account_id").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("provider_account_unique").on(
      table.provider,
      table.providerAccountId,
    ),

    index("idx_auth_accounts_user_id").on(table.userId),
  ],
);

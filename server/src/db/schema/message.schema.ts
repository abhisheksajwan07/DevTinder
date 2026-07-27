import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";

import { conversations } from "./matching.schema.js";
import { profiles } from "../schema/onboarding.schema.js";

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "file",
]);

export const messages = pgTable(
  "messages",
  {
    id: uuid().defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, {
        onDelete: "cascade",
      }),
    senderProfileId: uuid("sender_profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),
    type: messageTypeEnum("type").default("text").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("messages_conversation_created_idx").on(
      table.conversationId,
      table.createdAt,
    ),

    index("messages_sender_idx").on(table.senderProfileId),
  ],
);

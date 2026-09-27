import { and, desc, eq, isNull, lt, ne, or, sql } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { conversations, db, matches, profiles, users } from "../../db/drizzle.js";
import { messages } from "../../db/schema/message.schema.js";
import {
  ConversationListItem,
  ConversationRow,
  CreateMessageInput,
  IChatRepository,
  Message,
  PaginatedConversations,
  PaginatedMessages,
} from "./chat.types.js";
import { handleDbError } from "../../errors/database-error.js";
import { Redis } from "ioredis";
import {
  DEFAULT_MESSAGE_PAGE_SIZE,
  DEFAULT_PAGE_SIZE,
  PARTICIPANTS_TTL_SECONDS,
  decodeCursor,
  decodeMessageCursor,
  encodeCursor,
  encodeMessageCursor,
} from "./chat.utils.js";

export class ChatRepository implements IChatRepository {
  constructor(private readonly redis: Redis) {}

  private participantsCacheKey(conversationId: string): string {
    return `conv:participants:${conversationId}`;
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(messages)
        .values({
          id: uuidv7(),
          conversationId: input.conversationId,
          senderProfileId: input.senderProfileId,
          type: input.type,
          content: input.content,
        })
        .returning();

      const message = inserted[0];
      if (!message) throw new Error("Failed to create message");

      await tx
        .update(conversations)
        .set({
          lastMessageAt: message.createdAt,
        })
        .where(eq(conversations.id, input.conversationId));
      return message;
    });
  }

  async isConversationMember(
    conversationId: string,
    profileId: string,
  ): Promise<boolean> {
    const result = await db
      .select({ one: sql`1` })
      .from(conversations)
      .innerJoin(matches, eq(conversations.matchId, matches.id))
      .where(
        and(
          eq(conversations.id, conversationId),
          or(
            eq(matches.profileOneId, profileId),
            eq(matches.profileTwoId, profileId),
          ),
        ),
      )
      .limit(1);
    return result.length > 0;
  }

  async getConversationMessages(
    conversationId: string,
    cursor?: string,
    limit: number = DEFAULT_MESSAGE_PAGE_SIZE,
  ): Promise<PaginatedMessages> {
    const decoded = cursor ? decodeMessageCursor(cursor) : null;
    const pageSize = limit + 1; // fetch one extra to detect older messages

    
    const cursorWhere = decoded
      ? and(
          eq(messages.conversationId, conversationId),
          or(
            lt(messages.createdAt, new Date(decoded.createdAt)),
            and(
              eq(messages.createdAt, new Date(decoded.createdAt)),
              lt(messages.id, decoded.messageId),
            ),
          ),
        )
      : eq(messages.conversationId, conversationId);

    const rows = await db
      .select()
      .from(messages)
      .where(cursorWhere)
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(pageSize);

    const hasOlderMessages = rows.length === pageSize;
    if (hasOlderMessages) rows.pop(); // remove the probe row

    // Encode cursor from the OLDEST message in this batch (last in DESC order)
    const oldestRow = rows[rows.length - 1];
    const nextCursor =
      hasOlderMessages && oldestRow
        ? encodeMessageCursor({
            createdAt:
              oldestRow.createdAt instanceof Date
                ? oldestRow.createdAt.toISOString()
                : new Date(oldestRow.createdAt).toISOString(),
            messageId: oldestRow.id,
          })
        : null;

    return { messages: rows, nextCursor };
  }

  async getUserConversations(
    profileId: string,
    cursor?: string,
    limit: number = DEFAULT_PAGE_SIZE,
  ): Promise<PaginatedConversations | undefined> {
    try {
      const decoded = cursor ? decodeCursor(cursor) : null;
      const pageSize = limit + 1; // fetch one extra to detect next page

     
      const cursorCondition = decoded
        ? decoded.lastMessageAt
          ? sql`(
              c.last_message_at < ${decoded.lastMessageAt}::timestamptz
              OR (
                c.last_message_at = ${decoded.lastMessageAt}::timestamptz
                AND c.created_at < ${decoded.createdAt}::timestamptz
              )
            )`
          : sql`c.last_message_at IS NULL AND c.created_at < ${decoded.createdAt}::timestamptz`
        : sql`TRUE`;

      const result = await db.execute(sql`
      SELECT
          c.id AS conversation_id,
          c.last_message_at,
          c.created_at AS conversation_created_at,

          p.id AS other_profile_id,
          p.first_name,
          p.last_name,
          p.user_name AS username,

          a.image_url AS avatar_url,
          lm.id AS message_id,
          lm.sender_profile_id,
          lm.type,
          lm.content,
          lm.created_at,
          COALESCE(uc.count, 0) AS unread_count

      FROM conversation c

      JOIN matches m
      ON m.id = c.match_id

      JOIN profiles p on p.id =
      CASE
        WHEN m.profile_one_id = ${profileId}
        THEN m.profile_two_id
        ELSE m.profile_one_id
      END

      JOIN avatars a on a.id = p.avatar_id

      LEFT JOIN LATERAL (
        SELECT
          id,
          sender_profile_id,
          type,
          content,
          created_at
        FROM messages msg
        WHERE msg.conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) lm ON TRUE

      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM messages msg
        WHERE msg.conversation_id = c.id
          AND msg.sender_profile_id != ${profileId}
          AND msg.read_at IS NULL
      ) uc ON TRUE

      WHERE
          (m.profile_one_id = ${profileId} OR m.profile_two_id = ${profileId})
          AND ${cursorCondition}
      ORDER BY c.last_message_at DESC NULLS LAST, c.created_at DESC
      LIMIT ${pageSize}
      `);

      const rows = result.rows as ConversationRow[];
      const hasNextPage = rows.length === pageSize;
      if (hasNextPage) rows.pop(); // remove the extra sentinel row

      const items: ConversationListItem[] = rows.map((row) => {
        const lastMessage =
          row.message_id === null
            ? null
            : {
                messageId: row.message_id,
                senderProfileId: row.sender_profile_id!,
                type: row.type!,
                content: row.content!,
                createdAt: row.created_at!,
              };
        return {
          conversationId: row.conversation_id,
          lastMessageAt: row.last_message_at,
          otherProfileId: row.other_profile_id,
          firstName: row.first_name,
          lastName: row.last_name,
          username: row.username,
          avatarUrl: row.avatar_url,
          lastMessage,
          isOnline: false,
          unreadCount: row.unread_count,
        };
      });

      const lastItem = items[items.length - 1];
      const lastRow = rows[rows.length - 1] as (ConversationRow & { conversation_created_at: Date | string }) | undefined;
      const nextCursor =
        hasNextPage && lastItem && lastRow
          ? encodeCursor({
              lastMessageAt:
                lastItem.lastMessageAt instanceof Date
                  ? lastItem.lastMessageAt.toISOString()
                  : lastItem.lastMessageAt
                    ? new Date(lastItem.lastMessageAt).toISOString()
                    : null,
              createdAt:
                lastRow.conversation_created_at instanceof Date
                  ? lastRow.conversation_created_at.toISOString()
                  : new Date(lastRow.conversation_created_at).toISOString(),
            })
          : null;

      return { items, nextCursor };
    } catch (err) {
      handleDbError(err);
    }
  }


  async getConversationParticipantProfileIds(
    conversationId: string,
  ): Promise<string[]> {
    const cacheKey = this.participantsCacheKey(conversationId);

    // --- Cache read ---
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as string[];
    }

    // --- Cache miss: query Postgres ---
    const [row] = await db
      .select({
        profileOneId: matches.profileOneId,
        profileTwoId: matches.profileTwoId,
      })
      .from(conversations)
      .innerJoin(matches, eq(conversations.matchId, matches.id))
      .where(eq(conversations.id, conversationId))
      .limit(1);

    const ids = row ? [row.profileOneId, row.profileTwoId] : [];

    // --- Cache write (fire-and-forget, non-blocking) ---
    if (ids.length > 0) {
      void this.redis.set(
        cacheKey,
        JSON.stringify(ids),
        "EX",
        PARTICIPANTS_TTL_SECONDS,
      );
    }

    return ids;
  }

  async markMessagesAsRead(
    conversationId: string,
    profileId: string,
  ): Promise<number> {
    const updated = await db
      .update(messages)
      .set({
        readAt: new Date(),
      })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderProfileId, profileId),
          isNull(messages.readAt),
        ),
      );
    return updated.rowCount ?? 0;
  }

  async getConversationMembersProfileIds(profileId: string): Promise<string[]> {
    const result = await db
      .select({
        profileOneId: matches.profileOneId,
        profileTwoId: matches.profileTwoId,
      })
      .from(conversations)
      .innerJoin(matches, eq(conversations.matchId, matches.id))
      .where(
        or(
          eq(matches.profileOneId, profileId),
          eq(matches.profileTwoId, profileId),
        ),
      );

    const counterparties = result.map((r) =>
      r.profileOneId === profileId ? r.profileTwoId : r.profileOneId,
    );
    return [...new Set(counterparties)];
  }

  async getRecipientEmail(
    profileId: string,
  ): Promise<{ email: string; firstName: string } | null> {
    const [row] = await db
      .select({
        email: users.email,
        firstName: profiles.firstName,
      })
      .from(profiles)
      .innerJoin(users, eq(users.id, profiles.userId))
      .where(eq(profiles.id, profileId))
      .limit(1);

    return row ?? null;
  }
}

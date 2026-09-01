import { and, desc, eq, isNull, lt, ne, or, sql } from "drizzle-orm";
import { conversations, db, matches } from "../../db/drizzle.js";
import { messages } from "../../db/schema/message.schema.js";
import {
  ConversationListItem,
  ConversationRow,
  CreateMessageInput,
  IChatRepository,
  Message,
} from "./chat.types.js";
import { handleDbError } from "../../errors/database-error.js";

export class ChatRepository implements IChatRepository {
  async createMessage(input: CreateMessageInput): Promise<Message> {
    return db.transaction(async (tx) => {
      const inserted = await tx
        .insert(messages)
        .values({
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

    limit?: number,
  ): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(and(eq(messages.conversationId, conversationId)))
      .orderBy(desc(messages.createdAt))
      .limit(limit ?? 50);
  }

  async getUserConversations(
    profileId: string,
  ): Promise<ConversationListItem[] | undefined> {
    try {
      const result = await db.execute(sql`
      SELECT 
          c.id AS conversation_id,
          c.last_message_at,

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

      -- Conversation

      FROM conversation c

      -- Match

      JOIN matches m
      ON m.id = c.match_id

      -- Other user profile

      JOIN profiles p on p.id = 
      CASE 
        WHEN m.profile_one_id = ${profileId}
        THEN m.profile_two_id
        ELSE m.profile_one_id
      END

      JOIN avatars a on a.id = p.avatar_id

      -- latest message

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

      -- unread count
      
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS count
        FROM messages msg
        WHERE msg.conversation_id = c.id
          AND msg.sender_profile_id != ${profileId}
          AND msg.read_at IS NULL
      ) uc ON TRUE

      WHERE 
          m.profile_one_id=${profileId}
          OR 
          m.profile_two_id = ${profileId}
      ORDER BY c.last_message_at DESC NULLS LAST
      `);
      const rows = result.rows as ConversationRow[];
      return rows.map((row) => {
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
    } catch (err) {
      handleDbError(err);
    }
  }

  async getConversationParticipantProfileIds(
    conversationId: string,
  ): Promise<string[]> {
    const [row] = await db
      .select({
        profileOneId: matches.profileOneId,
        profileTwoId: matches.profileTwoId,
      })
      .from(conversations)
      .innerJoin(matches, eq(conversations.matchId, matches.id))
      .where(eq(conversations.id, conversationId))
      .limit(1);

    return row ? [row.profileOneId, row.profileTwoId] : [];
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
}

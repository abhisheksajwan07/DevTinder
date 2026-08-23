import { db, profileActions } from "../../db/drizzle.js";
import { handleDbError } from "../../errors/database-error.js";
import {
  ISwipeRepository,
  ProfileActionRecord,
  SwipeActionInput,
  UpdateConnectionInput,
} from "./swipe.types.js";
import { and, eq, sql } from "drizzle-orm";

export class SwipeRepository implements ISwipeRepository {
  async getIncomingRequests(profileId: string) {
    const result = await db.execute<{
      action_id: string;
      created_at: Date;
      profile_id: string;
      username: string;
      first_name: string;
      last_name: string;
      bio: string | null;
      primary_role: string;
      experience_level: string;
      availability: string;
      avatar_url: string | null;
    }>(sql`
      SELECT pa.id AS action_id, pa.created_at,
        p.id AS profile_id, p.user_name AS username,
        p.first_name, p.last_name, p.bio, p.primary_role,
        p.experience_level, p.availability,
        a.image_url AS avatar_url
      FROM profile_actions pa
      JOIN profiles p ON p.id = pa.actor_profile_id
      JOIN avatars a ON a.id = p.avatar_id
      WHERE pa.target_profile_id = ${profileId}
        AND pa.action = 'interested'
        AND pa.status = 'pending'
      ORDER BY pa.created_at DESC
    `);

    return result.rows.map((row) => ({
      actionId: row.action_id,
      createdAt: row.created_at,
      profile: {
        id: row.profile_id,
        username: row.username,
        firstName: row.first_name,
        lastName: row.last_name,
        bio: row.bio,
        primaryRole: row.primary_role,
        experienceLevel: row.experience_level,
        availability: row.availability,
        avatarUrl: row.avatar_url,
      },
    }));
  }

  async insertAction(input: SwipeActionInput): Promise<ProfileActionRecord> {
    try {
      const [record] = await db
        .insert(profileActions)
        .values(input)
        .returning();

      if (!record) {
        throw new Error("Insert succeeded but no row was returned.");
      }

      return record;
    } catch (error: unknown) {
      return handleDbError(error);
    }
  }

  async findExistingAction(
    actorProfileId: string,
    targetProfileId: string,
  ): Promise<ProfileActionRecord | null> {
    const [action] = await db
      .select()
      .from(profileActions)
      .where(
        and(
          eq(profileActions.actorProfileId, actorProfileId),
          eq(profileActions.targetProfileId, targetProfileId),
        ),
      );

    return action ?? null;
  }

  async findPendingConnection(
    actorProfileId: string,
    targetProfileId: string,
  ): Promise<ProfileActionRecord | null> {
    const [action] = await db
      .select()
      .from(profileActions)
      .where(
        and(
          eq(profileActions.actorProfileId, actorProfileId),
          eq(profileActions.targetProfileId, targetProfileId),
          eq(profileActions.status, "pending"),
        ),
      );

    return action ?? null;
  }

  async updateStatus(
    input: UpdateConnectionInput,
  ): Promise<ProfileActionRecord | null> {
    const [updated] = await db
      .update(profileActions)
      .set({
        status: input.status,
      })
      .where(
        and(
          eq(profileActions.actorProfileId, input.actorProfileId),
          eq(profileActions.targetProfileId, input.targetProfileId),
          eq(profileActions.status, "pending"),
        ),
      )
      .returning();

    return updated ?? null;
  }
}

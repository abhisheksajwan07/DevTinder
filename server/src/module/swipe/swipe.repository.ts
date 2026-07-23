import { db, profileActions } from "../../db/drizzle.js";
import { handleDbError } from "../../errors/database-error.js";
import {
  ISwipeRepository,
  ProfileActionRecord,
  SwipeActionInput,
  UpdateConnectionInput,
} from "./swipe.types.js";
import { and, eq } from "drizzle-orm";

export class SwipeRepository implements ISwipeRepository {
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

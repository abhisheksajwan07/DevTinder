import { and, eq } from "drizzle-orm";
import {
  conversations,
  db,
  matches,
  profileActions,
} from "../../db/drizzle.js";
import { IMatchingRepository } from "./match.types.js";
import { AppError } from "../../utils/AppError.js";

export class MatchRepository implements IMatchingRepository {
  async createMatchAndConversation(connectionId: string): Promise<void> {
    
    await db.transaction(async (tx) => {

      const [connection] = await tx
        .select({
          actorProfileId: profileActions.actorProfileId,
          targetProfileId: profileActions.targetProfileId,
          status: profileActions.status,
        })
        .from(profileActions)
        .where(
          and(
            eq(profileActions.id, connectionId),
            eq(profileActions.status, "accepted"),
          ),
        );

      if (!connection) {
        throw new AppError(
          "Accepted connection not found.",
          404,
          "ACCEPTED_CONNECTION_NOT_FOUND",
        );
      }

      const ids = [
        connection.actorProfileId,
        connection.targetProfileId,
      ].sort();

      const profileOneId = ids[0]!;
      const profileTwoId= ids[1]!;

      const [match] = await tx
        .insert(matches)
        .values({
          profileOneId,
          profileTwoId,
        })
        .onConflictDoNothing()
        .returning({ id: matches.id });

      if (!match) return;

      await tx.insert(conversations).values({
        matchId:match.id,
      });
    });
  }
}

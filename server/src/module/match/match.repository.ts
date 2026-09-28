import { and, eq, sql } from "drizzle-orm";
import {
  conversations,
  db,
  matches,
  profileActions,
} from "../../db/drizzle.js";
import { IMatchingRepository, CreatedMatchResult } from "./match.types.js";
import { AppError } from "../../utils/AppError.js";

export class MatchRepository implements IMatchingRepository {
  async getMatches(profileId: string) {
    const result = await db.execute<{
      id: string;
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
      SELECT m.id, m.created_at,
        p.id AS profile_id, p.user_name AS username,
        p.first_name, p.last_name, p.bio, p.primary_role,
        p.experience_level, p.availability,
        a.image_url AS avatar_url
      FROM matches m
      JOIN profiles p ON p.id = CASE
        WHEN m.profile_one_id = ${profileId} THEN m.profile_two_id
        ELSE m.profile_one_id
      END
      JOIN avatars a ON a.id = p.avatar_id
      WHERE m.profile_one_id = ${profileId}
         OR m.profile_two_id = ${profileId}
      ORDER BY m.created_at DESC
    `);

    return result.rows.map((row) => ({
      id: row.id,
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

  async createMatchAndConversation(connectionId: string): Promise<CreatedMatchResult | null> {
    
    return await db.transaction(async (tx) => {

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

      if (!match) return null;

      const [convo] = await tx.insert(conversations).values({
        matchId:match.id,
      }).returning({ id: conversations.id });
      return {
        profileOneId,
        profileTwoId,
        conversationId: convo!.id,
      };
    });
  }
}

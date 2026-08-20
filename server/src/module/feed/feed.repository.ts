import { eq, inArray, sql } from "drizzle-orm";
import { feedProfileCard, IFeedRepository, NamedEntity } from "./feed.types.js";
import {
  avatars,
  db,
  interests,
  lookingFor,
  profileInterests,
  profileLookingFor,
  profileSkills,
  skills,
} from "../../db/drizzle.js";

type RawProfileRow = {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  bio: string;
  primaryRole: string;
  experienceLevel: string;
  availability: string;
  avatarId: string | null;
  similarityScore: number;
};

type RelationRow = { profileId: string; id: string; name: string };

export class FeedRepository implements IFeedRepository {
  private toMatchScore(score: number): number {
    return Math.max(0, Math.min(100, Math.round(score * 100)));
  }

  private groupRows(rows: RelationRow[]): Map<string, NamedEntity[]> {
    const map = new Map<string, NamedEntity[]>();

    for (const row of rows) {
      let arr = map.get(row.profileId);
      if (!arr) {
        arr = [];
        map.set(row.profileId, arr);
      }
      arr.push({ id: row.id, name: row.name });
    }

    return map;
  }

  private async fetchRelations(profileIds: string[], avatarIds: string[]) {
    const [skillsRows, interestsRows, lookingForRows, avatarsRows] =
      await Promise.all([
        db
          .select({
            profileId: profileSkills.profileId,
            name: skills.name,
            id: skills.id,
          })
          .from(profileSkills)
          .innerJoin(skills, eq(profileSkills.skillId, skills.id))
          .where(inArray(profileSkills.profileId, profileIds)),

        db
          .select({
            profileId: profileInterests.profileId,
            id: interests.id,
            name: interests.name,
          })
          .from(profileInterests)
          .innerJoin(interests, eq(profileInterests.interestId, interests.id))
          .where(inArray(profileInterests.profileId, profileIds)),

        db
          .select({
            profileId: profileLookingFor.profileId,
            id: lookingFor.id,
            name: lookingFor.name,
          })
          .from(profileLookingFor)
          .innerJoin(
            lookingFor,
            eq(profileLookingFor.lookingForId, lookingFor.id),
          )
          .where(inArray(profileLookingFor.profileId, profileIds)),

        avatarIds.length > 0
          ? db
              .select({
                id: avatars.id,
                displayName: avatars.displayName,
                imageUrl: avatars.imageUrl,
              })
              .from(avatars)
              .where(inArray(avatars.id, avatarIds))
          : Promise.resolve([]),
      ]);
    return { skillsRows, interestsRows, lookingForRows, avatarsRows };
  }

  private async searchByEmbedding(
    viewerProfileId: string,
    viewerEmbedding: number[],
    limit: number,
  ): Promise<RawProfileRow[]> {
    const embeddingLiteral = sql`${JSON.stringify(viewerEmbedding)}::vector`;

    const result = await db.execute<RawProfileRow>(sql`
            SELECT
                p.id AS "id",
                p.user_name AS "userName",
                p.first_name AS "firstName",
                p.last_name AS "lastName",
                p.bio AS "bio",
                p.primary_role AS "primaryRole",
                p.experience_level AS "experienceLevel",
                p.availability AS "availability",
                p.avatar_id AS "avatarId",
                1-(p.embedding <=> ${embeddingLiteral}) AS "similarityScore"
            FROM profiles p
            JOIN users u ON p.user_id = u.id
            WHERE
                p.id != ${viewerProfileId}
                AND p.embedding_status = 'ready'
                AND p.embedding IS NOT null
                AND u.on_boarding_complete = true
                AND NOT EXISTS (
                    SELECT 1 FROM profile_actions pa
                    WHERE (pa.actor_profile_id = ${viewerProfileId} AND pa.target_profile_id = p.id) 
                       OR (pa.actor_profile_id = p.id AND pa.target_profile_id = ${viewerProfileId})
                )
            ORDER BY p.embedding <=> ${embeddingLiteral} ASC
            LIMIT ${limit}
        `);

    return result.rows;
  }

  private buildFeed(
    rows: RawProfileRow[],
    skillsMap: Map<string, NamedEntity[]>,
    interestsMap: Map<string, NamedEntity[]>,
    lookingForMap: Map<string, NamedEntity[]>,
    avatarsMap: Map<
      string,
      { id: string; displayName: string; imageUrl: string | null }
    >,
  ): feedProfileCard[] {
    return rows.map((row) => ({
      id: row.id,
      username: row.userName,
      firstName: row.firstName,
      bio: row.bio,
      primaryRole: row.primaryRole,
      experienceLevel: row.experienceLevel,
      availability: row.availability,
      avatar: row.avatarId ? (avatarsMap.get(row.avatarId) ?? null) : null,
      skills: skillsMap.get(row.id) ?? [],
      interests: interestsMap.get(row.id) ?? [],
      lookingFor: lookingForMap.get(row.id) ?? [],
      matchScore: this.toMatchScore(row.similarityScore),
    }));
  }

  async getFeed(
    viewerProfileId: string,
    viewerEmbedding: number[],
    limit: number,
  ): Promise<feedProfileCard[]> {
    const rows = await this.searchByEmbedding(
      viewerProfileId,
      viewerEmbedding,
      limit,
    );
    if (rows.length === 0) return [];

    const profileIds = rows.map((p) => p.id);

    const avatarIds = rows
      .map((a) => a.avatarId)
      .filter((id): id is string => id != null);

    const { skillsRows, interestsRows, lookingForRows, avatarsRows } =
      await this.fetchRelations(profileIds, avatarIds);

    const skillsMap = this.groupRows(skillsRows);
    const interestsMap = this.groupRows(interestsRows);
    const lookingForMap = this.groupRows(lookingForRows);

    const avatarsMap = new Map(
      avatarsRows.map((a) => [
        a.id,
        { id: a.id, displayName: a.displayName, imageUrl: a.imageUrl ?? null },
      ]),
    );
    return this.buildFeed(
      rows,
      skillsMap,
      interestsMap,
      lookingForMap,
      avatarsMap,
    );
  }
}

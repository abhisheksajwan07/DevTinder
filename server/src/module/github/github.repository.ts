import { eq, inArray, and, sql } from "drizzle-orm";
import {
  db,
  authAccounts,
  profiles,
  githubProfiles,
  githubRepositories,
} from "../../db/drizzle.js";

import type {
  GitHubAuthAccount,
  GitHubConnectionStatus,
  GitHubProfile,
  GitHubRepository as GitHubRepositoryRow,
  IGitHubRepository,
  SyncRepoItem,
  UpsertGitHubProfileData,
} from "./github.types.js";

export class GitHubRepository implements IGitHubRepository {
  /**
   * Fetches the GitHub auth account linked to this profile,
   * including the access and refresh tokens.
   */
  async findGitHubAccount(
    profileId: string,
  ): Promise<GitHubAuthAccount | null> {
    const rows = await db
      .select({
        id: authAccounts.id,
        userId: authAccounts.userId,
        providerAccessToken: authAccounts.providerAccessToken,
        providerRefreshToken: authAccounts.providerRefreshToken,
        providerTokenExpiresAt: authAccounts.providerTokenExpiresAt,
      })
      .from(authAccounts)
      .innerJoin(profiles, eq(profiles.userId, authAccounts.userId))
      .where(
        and(
          eq(profiles.id, profileId),
          eq(authAccounts.provider, "github"),
        ),
      )
      .limit(1);

    return rows[0] ?? null;
  }

  async getConnectionStatus(userId: string): Promise<GitHubConnectionStatus> {
    const account = await db
      .select({ id: authAccounts.id })
      .from(authAccounts)
      .where(
        and(
          eq(authAccounts.userId, userId),
          eq(authAccounts.provider, "github"),
        ),
      )
      .limit(1);

    return {
      connected: account.length > 0,
    };
  }

  /**
 * Updates the cached GitHub profile and repositories.
 * API calls are made before the transaction to keep it short.
 * Keeps the isFeatured flag for repositories that still exist.
 */
  async syncGitHubData(
    profileId: string,
    data: UpsertGitHubProfileData,
    repos: SyncRepoItem[],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .insert(githubProfiles)
        .values({
          profileId,
          githubId: data.githubId,
          username: data.username,
          avatarUrl: data.avatarUrl,
          bio: data.bio,
          followers: data.followers,
          publicRepos: data.publicRepos,
          lastSyncedAt: data.lastSyncedAt,
        })
        .onConflictDoUpdate({
          target: githubProfiles.profileId,
          set: {
            githubId: data.githubId,
            username: data.username,
            avatarUrl: data.avatarUrl,
            bio: data.bio,
            followers: data.followers,
            publicRepos: data.publicRepos,
            lastSyncedAt: data.lastSyncedAt,
            updatedAt: new Date(),
          },
        });

   
      await tx
        .update(profiles)
        .set({
          embeddingStatus: "stale",
          embeddingVersion: sql`${profiles.embeddingVersion} + 1`,
        })
        .where(eq(profiles.id, profileId));

  
      const currentFeatured = await tx
        .select({ githubRepoId: githubRepositories.githubRepoId })
        .from(githubRepositories)
        .where(
          and(
            eq(githubRepositories.profileId, profileId),
            eq(githubRepositories.isFeatured, true),
          ),
        );

      const featuredIds = new Set(currentFeatured.map((r) => r.githubRepoId));


      await tx
        .delete(githubRepositories)
        .where(eq(githubRepositories.profileId, profileId));

      if (repos.length === 0) return;

      
      await tx.insert(githubRepositories).values(
        repos.map((r) => ({
          profileId,
          githubRepoId: r.githubRepoId,
          name: r.name,
          description: r.description,
          language: r.language,
          stars: r.stars,
          htmlUrl: r.htmlUrl,
          repoUpdatedAt: r.repoUpdatedAt,
          // Re-apply featured flag only if this repo was featured before
          isFeatured: featuredIds.has(r.githubRepoId),
        })),
      );
    });
  }

  /**
   * Returns the github_profiles row for this profile, or null if not synced yet.
   */
  async getProfile(profileId: string): Promise<GitHubProfile | null> {
    const [row] = await db
      .select()
      .from(githubProfiles)
      .where(eq(githubProfiles.profileId, profileId))
      .limit(1);

    return row ?? null;
  }

  /**
   * Returns all cached repositories for this profile.
   */
  async getRepositories(profileId: string): Promise<GitHubRepositoryRow[]> {
    return db
      .select()
      .from(githubRepositories)
      .where(eq(githubRepositories.profileId, profileId));
  }

  /**
   * 3 repositories as featured for this profile.
   * All other repos are unfeatured.
   */
  async setFeaturedRepositories(
    profileId: string,
    repoIds: string[],
  ): Promise<void> {
    if (repoIds.length === 0) {
  
      await db
        .update(githubRepositories)
        .set({ isFeatured: false })
        .where(eq(githubRepositories.profileId, profileId));
      return;
    }

    await db.transaction(async (tx) => {
  
      await tx
        .update(githubRepositories)
        .set({ isFeatured: false })
        .where(eq(githubRepositories.profileId, profileId));

   
      await tx
        .update(githubRepositories)
        .set({ isFeatured: true })
        .where(
          and(
            eq(githubRepositories.profileId, profileId),
            inArray(githubRepositories.id, repoIds),
          ),
        );
    });
  }
}

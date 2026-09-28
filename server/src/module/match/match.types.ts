export interface MatchingJobPayload {
  connectionId: string;
}



export interface CreatedMatchResult {
  profileOneId: string;
  profileTwoId: string;
  conversationId: string;
}

export interface IMatchingRepository {
  createMatchAndConversation(
    connectionId: string,
  ): Promise<CreatedMatchResult | null>;
  getMatches(profileId: string): Promise<MatchListItem[]>;
}

export type MatchListItem = {
  id: string;
  createdAt: Date;
  profile: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    bio: string | null;
    primaryRole: string;
    experienceLevel: string;
    availability: string;
    avatarUrl: string | null;
  };
};

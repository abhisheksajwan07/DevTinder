export interface MatchingJobPayload {
  connectionId: string;
}



export  interface IMatchingRepository {
  createMatchAndConversation(connectionId: string): Promise<void>;
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

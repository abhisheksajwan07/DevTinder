export type feedProfileCard = {
  id: string;
  username: string;
  firstName: string;
  
  bio: string;
  primaryRole: string;
  experienceLevel: string;
  availability: string;
  avatar: {
    id: string;
    displayName: string;
    imageUrl: string | null;
  } | null;
  skills: { id: string; name: string }[];
  interests: {
    id: string;
    name: string;
  }[];
  lookingFor: {
    id: string;
    name: string;
  }[];
  matchScore: number;
};

export type FeedQuery = {
  limit: number;
};

export type FeedResult = {
  profiles: feedProfileCard[];
};

export interface IFeedRepository {
  getFeed(
    viewerProfileId: string,
    viewerEmbedding: number[],
    limit: number,
  ): Promise<feedProfileCard[]>;
}

export interface IFeedService {
  getFeed(userId: string, query: FeedQuery): Promise<FeedResult>;
}

export type NamedEntity = {
  id: string;
  name: string;
};

export type FeedProfile = {
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

  skills: {
    id: string;
    name: string;
  }[];

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

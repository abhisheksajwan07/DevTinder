export type Match = {
  id: string;
  createdAt: string;
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

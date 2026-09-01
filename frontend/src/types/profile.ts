export type PublicProfile = {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  bio: string | null;
  primaryRole: string;
  experienceLevel: string;
  availability: string;
  projectDescription: string | null;
  skills: { id: string; name: string }[];
  interests: { id: string; name: string }[];
  lookingFor: { id: string; name: string }[];
  avatar: { id: string; displayName: string; imageUrl: string | null } | null;
  github: { username: string; featuredRepositories: { name: string; description: string | null; language: string | null }[] } | null;
};

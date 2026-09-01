import { ProfileWithRelations } from "../module/onboarding/onboarding.types.js";

export function buildProfileCorpus(profile: ProfileWithRelations): string {
  const parts: string[] = [
    `Primary Role : ${profile.primaryRole}`,
    `Experience level : ${profile.experienceLevel}`,
    `Weekly Availability : ${profile.availability}`,
  ];

  if (profile.bio) parts.push(`Bio: ${profile.bio}`);

  if (profile.skills.length > 0) {
    parts.push(`Skills:\n${profile.skills.map((s) => s.name).join("\n")}`);
  }

  if (profile.interests.length > 0) {
    parts.push(
      `Interests:\n${profile.interests.map((interest) => interest.name).join("\n")}`,
    );
  }

  if (profile.lookingFor.length > 0) {
    parts.push(
      `Looking for:\n${profile.lookingFor.map((l) => l.name).join("\n")}`,
    );
  }

  if (profile.projectDescription)
    parts.push(`Project Description: ${profile.projectDescription}`);

  if (profile.github) {
    parts.push(`GitHub username: ${profile.github.username}`);

    if (profile.github.featuredRepositories.length > 0) {
      parts.push(
        `Featured GitHub repositories:\n${profile.github.featuredRepositories
          .map(
            (repository) =>
              `Name: ${repository.name}\nDescription: ${repository.description ?? ""}\nPrimary language: ${repository.language ?? ""}`,
          )
          .join("\n\n")}`,
      );
    }
  }

  return parts.join("\n");
}

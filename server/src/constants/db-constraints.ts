export const DB_CONSTRAINTS = {
  PROFILE_SKILL: "profile_skills_skill_id_skills_id_fk",
  PROFILE_AVATAR: "profiles_avatar_id_avatars_id_fk",
  PROFILE_INTEREST: "profile_interests_interest_id_interests_id_fk",
  PROFILE_LOOKING_FOR: "profile_looking_for_looking_for_id_looking_for_id_fk",
  PROFILE_USERNAME: "profiles_user_name_unique",
  PROFILE_USERNAME_IDX: "profiles_username_unique",
} as const;

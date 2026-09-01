import { useEffect, useState } from "react";
import {
  useGitHubConnectionStatus,
} from "../hooks/onboarding.hooks";
import { useGitHubProfile, useSyncGitHub } from "../hooks/github.hooks";
import { useMyProfile, useUpdateMyProfile } from "../hooks/profile.hooks";
import type { UpdateProfileInput } from "../services/profile.api";
import {
  ProfileHeader,
  ProfileSection,
  CurrentProjectCard,
  GitHubCard,
  EditProfileForm,
  PageMessage,
} from "../components/profile";

export default function ProfilePage() {
  const { data: profile, isLoading, isError } = useMyProfile();
  const { data: githubStatus } = useGitHubConnectionStatus();
  const githubQuery = useGitHubProfile(Boolean(githubStatus?.connected));
  const updateMutation = useUpdateMyProfile();
  const syncMutation = useSyncGitHub();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<UpdateProfileInput>({});

  useEffect(() => {
    if (!profile) return;
    setForm({
      bio: profile.bio ?? "",
      primaryRole: profile.primaryRole,
      experienceLevel: profile.experienceLevel,
      availability: profile.availability,
      projectDescription: profile.projectDescription ?? "",
      skillIds: profile.skills.map((item) => item.id),
      customSkills: [],
      interestIds: profile.interests.map((item) => item.id),
      lookingForIds: profile.lookingFor.map((item) => item.id),
    });
  }, [profile]);

  if (isLoading) return <PageMessage>Loading your profile…</PageMessage>;
  if (isError || !profile)
    return <PageMessage error>Could not load your profile.</PageMessage>;

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateMutation.mutate(form, { onSuccess: () => setEditing(false) });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6 sm:py-8">
      <ProfileHeader
        profile={profile}
        isEditing={editing}
        onToggleEdit={() => setEditing((value) => !value)}
      />

      {editing ? (
        <EditProfileForm
          form={form}
          setForm={setForm}
          isSaving={updateMutation.isPending}
          error={updateMutation.isError}
          onSubmit={saveProfile}
          onCancel={() => setEditing(false)}
        />
      ) : (
        <>
          <ProfileSection
            title="Skills"
            items={profile.skills.map((item) => item.name)}
          />
          <ProfileSection
            title="Interests"
            items={profile.interests.map((item) => item.name)}
            accent
          />
          <ProfileSection
            title="Looking for"
            items={profile.lookingFor.map((item) => item.name)}
          />
          {profile.projectDescription && (
            <CurrentProjectCard
              projectDescription={profile.projectDescription}
            />
          )}
        </>
      )}

      <GitHubCard
        isConnected={Boolean(githubStatus?.connected)}
        githubProfile={githubQuery.data}
        isSyncing={syncMutation.isPending}
        isSyncSuccess={syncMutation.isSuccess}
        isSyncError={syncMutation.isError}
        onSync={() => syncMutation.mutate()}
      />
    </div>
  );
}

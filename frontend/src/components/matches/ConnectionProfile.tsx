type ProfileData = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string | null;
  primaryRole: string;
  experienceLevel: string;
  avatarUrl: string | null;
};

export default function ConnectionProfile({ profile }: { profile: ProfileData }) {
  return (
    <div className="flex items-start gap-4">
      <div className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-orange-500 text-sm font-bold text-white shadow-xs">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.firstName}
            className="size-full object-cover"
          />
        ) : (
          profile.firstName[0]?.toUpperCase()
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold text-[#242322]">
          {profile.firstName} {profile.lastName}
        </h3>
        <p className="text-xs text-[#77736e]">
          @{profile.username} · {profile.primaryRole} · {profile.experienceLevel}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-[#55504b]">
          {profile.bio || "Ready to build something together."}
        </p>
      </div>
    </div>
  );
}

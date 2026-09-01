import { Clock, Edit3 } from "lucide-react";
import type { PublicProfile } from "../../types/profile";
import { Avatar, Tag, readable } from "./ProfileUI";

interface ProfileHeaderProps {
  profile: PublicProfile;
  isEditing: boolean;
  onToggleEdit: () => void;
}

export default function ProfileHeader({
  profile,
  isEditing,
  onToggleEdit,
}: ProfileHeaderProps) {
  return (
    <section className="rounded-[28px] border border-[#e9e5df] bg-white p-6 shadow-xs">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <Avatar name={profile.firstName} url={profile.avatar?.imageUrl} />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-[#242322]">
              {profile.firstName} {profile.lastName}
            </h1>
            <p className="font-mono text-xs text-[#77736e]">
              @{profile.userName}
            </p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-[#77736e]">
              <Tag>{profile.primaryRole}</Tag>
              <Tag>{profile.experienceLevel}</Tag>
              <Tag>
                <Clock className="size-3" />
                {readable(profile.availability)}
              </Tag>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onToggleEdit}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-2 text-xs font-semibold text-[#55504b] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
        >
          <Edit3 className="size-3.5" />
          {isEditing ? "Cancel" : "Edit"}
        </button>
      </div>
      {!isEditing && profile.bio && (
        <p className="mt-5 text-sm leading-relaxed text-[#55504b]">
          {profile.bio}
        </p>
      )}
    </section>
  );
}

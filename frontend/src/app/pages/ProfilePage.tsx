import { useState } from "react";
import { currentUser, type Repository } from "../mock-data";
import {
  Edit3,
  Github,
  Star,
  RefreshCw,
  Plus,
  Clock,
  ExternalLink,
  Check,
} from "lucide-react";

import RepoManagerModal from "../../components/profile/RepoManagerModal";
import SkillsEditModal from "../../components/profile/SkillsEditModal";

export default function ProfilePage() {
  const [repos, setRepos] = useState<Repository[]>(currentUser.repositories);
  const [showRepoManager, setShowRepoManager] = useState(false);
  const [showSkillsEdit, setShowSkillsEdit] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(currentUser.bio);

  const featuredRepos = repos.filter((r) => r.isFeatured);

  const handleSaveRepos = (selectedIds: string[]) => {
    setRepos((prev) =>
      prev.map((r) => ({ ...r, isFeatured: selectedIds.includes(r.id) }))
    );
    setShowRepoManager(false);
  };

  const handleSync = () => {
    setSyncSuccess(true);
    setTimeout(() => setSyncSuccess(false), 2500);
  };

  return (
    <>
      {showRepoManager && (
        <RepoManagerModal
          repos={repos}
          onClose={() => setShowRepoManager(false)}
          onSave={handleSaveRepos}
        />
      )}
      {showSkillsEdit && (
        <SkillsEditModal onClose={() => setShowSkillsEdit(false)} />
      )}

      {syncSuccess && (
        <div className="fixed bottom-24 lg:bottom-6 right-4 z-50 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-900 px-4 py-3 text-xs font-semibold text-emerald-100 shadow-xl">
          <Check className="size-4 text-emerald-400" />
          GitHub synced successfully!
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-5">
        {/* Profile Header */}
        <div className="rounded-[28px] border border-[#e9e5df] bg-white p-6 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="size-16 rounded-2xl grid place-items-center text-white font-bold text-xl shrink-0 shadow-sm"
                style={{ backgroundColor: currentUser.avatarColor }}
              >
                {currentUser.avatar}
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#242322]">
                  {currentUser.name}
                </h1>
                <p className="font-mono text-xs text-[#77736e]">
                  @{currentUser.username}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-0.5 text-xs font-semibold text-[#55504b]">
                    {currentUser.role}
                  </span>
                  <span className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-0.5 text-xs font-semibold text-[#55504b]">
                    {currentUser.experience}
                  </span>
                  <span className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-2.5 py-0.5 text-xs font-semibold text-[#55504b]">
                    <Clock className="size-3 inline mr-1" />
                    {currentUser.availability}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(!isEditing)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-2xl border border-[#e4ded5] bg-white px-3 py-2 text-xs font-semibold text-[#55504b] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
            >
              <Edit3 className="size-3.5" />
              {isEditing ? "Done" : "Edit"}
            </button>
          </div>

          {/* Profile Completion */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
                Profile Completion
              </p>
              <p className="font-mono text-xs font-bold text-orange-600">
                {currentUser.profileCompletion}%
              </p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#e9e5df] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#ee7100] to-amber-500 transition-all duration-500"
                style={{ width: `${currentUser.profileCompletion}%` }}
              />
            </div>
            {currentUser.profileCompletion < 100 && (
              <p className="mt-1.5 font-mono text-[10px] text-[#88827c]">
                Add featured repos to reach 100%
              </p>
            )}
          </div>
        </div>

        {/* About */}
        <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              About
            </p>
          </div>
          {isEditing ? (
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-[#e2ded6] bg-[#f7f5f2] px-4 py-3 text-sm text-[#242322] outline-none transition resize-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/20"
            />
          ) : (
            <p className="text-sm text-[#55504b] leading-relaxed">{bio}</p>
          )}

          {currentUser.projectDescription && (
            <div className="mt-4 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] px-4 py-3">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-1">
                Current Project
              </p>
              <p className="text-xs text-[#55504b] leading-relaxed">
                {currentUser.projectDescription}
              </p>
            </div>
          )}
        </div>

        {/* Skills */}
        <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              Skills
            </p>
            <button
              type="button"
              onClick={() => setShowSkillsEdit(true)}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Edit skills
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#55504b]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              Interests
            </p>
            <button
              type="button"
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Edit interests
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentUser.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-semibold text-orange-700"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        {/* Collaboration Goals */}
        <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c] mb-3">
            Looking For
          </p>
          <div className="flex flex-wrap gap-2">
            {currentUser.goals.map((goal) => (
              <span
                key={goal}
                className="inline-flex items-center gap-1 rounded-full border border-[#e9e5df] bg-[#f7f5f2] px-3 py-1.5 text-[11px] font-semibold text-[#55504b]"
              >
                <span className="size-1.5 rounded-full bg-orange-500" />
                {goal}
              </span>
            ))}
          </div>
        </div>

        {/* GitHub */}
        <div className="rounded-[24px] border border-[#e9e5df] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
              GitHub
            </p>
            {currentUser.githubConnected && (
              <button
                type="button"
                onClick={handleSync}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline"
              >
                <RefreshCw className="size-3.5" />
                Sync GitHub
              </button>
            )}
          </div>

          {currentUser.githubConnected ? (
            <>
              <div className="flex items-center gap-3 mb-5">
                <Github className="size-5 text-[#242322]" />
                <div>
                  <p className="text-sm font-bold text-[#242322]">
                    github.com/{currentUser.githubUsername}
                  </p>
                  <p className="font-mono text-[10px] text-[#88827c]">
                    Last synced {currentUser.githubLastSynced}
                  </p>
                </div>
                <span className="ml-auto rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                  Connected
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
                  Featured Repos ({featuredRepos.length}/3)
                </p>
                <button
                  type="button"
                  onClick={() => setShowRepoManager(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline"
                >
                  <Plus className="size-3.5" />
                  Manage
                </button>
              </div>

              <div className="space-y-2.5">
                {featuredRepos.length === 0 ? (
                  <div className="text-center py-6 rounded-2xl border border-dashed border-[#d4cec6]">
                    <p className="text-xs text-[#77736e]">
                      No featured repos. Click Manage to select up to 3.
                    </p>
                  </div>
                ) : (
                  featuredRepos.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-start gap-3 rounded-2xl border border-[#e9e5df] bg-[#f7f5f2] p-4 transition hover:border-orange-200"
                    >
                      <Github className="size-4 text-[#77736e] shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#242322] truncate">
                            {repo.name}
                          </p>
                          <span className="rounded-full bg-orange-500 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                            Featured
                          </span>
                        </div>
                        <p className="text-xs text-[#77736e] mt-0.5 leading-relaxed">
                          {repo.description}
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="rounded-full border border-[#e9e5df] bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-[#55504b]">
                            {repo.language}
                          </span>
                          <span className="flex items-center gap-1 font-mono text-[10px] text-[#77736e]">
                            <Star className="size-3 fill-amber-400 text-amber-500" />
                            {repo.stars}
                          </span>
                        </div>
                      </div>
                      <a
                        href={repo.url}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-xl border border-[#e9e5df] p-1.5 text-[#77736e] hover:border-orange-300 hover:text-orange-600 transition"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 rounded-2xl border border-dashed border-[#d4cec6]">
              <Github className="size-8 text-[#d4cec6] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#242322]">Connect GitHub</p>
              <p className="mt-1 text-xs text-[#77736e]">
                Show the projects you've built and improve your developer matches.
              </p>
              <button
                type="button"
                className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#1a1918] px-5 py-3 text-xs font-bold text-white shadow-md transition hover:bg-orange-600"
              >
                <Github className="size-4" />
                Connect GitHub
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

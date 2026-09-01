import { ExternalLink, Github, RefreshCw } from "lucide-react";
import type { GitHubProfile } from "../../services/github.api";
import { Label } from "./ProfileUI";

interface GitHubCardProps {
  isConnected: boolean;
  githubProfile?: GitHubProfile | null;
  isSyncing: boolean;
  isSyncSuccess: boolean;
  isSyncError: boolean;
  onSync: () => void;
}

export default function GitHubCard({
  isConnected,
  githubProfile,
  isSyncing,
  isSyncSuccess,
  isSyncError,
  onSync,
}: GitHubCardProps) {
  return (
    <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
      <div className="mb-3 flex items-center justify-between gap-4">
        <Label>GitHub</Label>
        {isConnected && (
          <button
            type="button"
            disabled={isSyncing}
            onClick={onSync}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60"
          >
            <RefreshCw
              className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Starting sync…" : "Sync GitHub"}
          </button>
        )}
      </div>

      {!isConnected ? (
        <p className="text-sm text-[#77736e]">
          Connect GitHub from Settings to enrich your embedding automatically.
        </p>
      ) : githubProfile ? (
        <>
          <p className="mb-3 rounded-2xl bg-orange-50 p-3 text-xs leading-relaxed text-[#8a5a16]">
            Repository selection is currently automatic: DevTinder selects up to
            3 repositories using stars and recent activity. Custom repository
            selection is planned for V2.
          </p>
          <GitHubSummary profile={githubProfile} />
        </>
      ) : (
        <>
          <p className="text-sm text-[#77736e]">
            {isSyncSuccess
              ? "Sync started. Your repositories will appear here shortly."
              : "No GitHub data has been synced yet. Click Sync GitHub."}
          </p>
          <p className="mt-3 rounded-2xl bg-orange-50 p-3 text-xs leading-relaxed text-[#8a5a16]">
            For now, up to 3 repositories are selected automatically using stars
            and recent activity. Custom repository selection is planned for V2.
          </p>
        </>
      )}

      {isSyncError && (
        <p className="mt-3 text-xs text-red-600">
          Could not start GitHub sync. Please try again.
        </p>
      )}
    </section>
  );
}

function GitHubSummary({ profile }: { profile: GitHubProfile }) {
  const repos = profile.repositories.filter((repo) => repo.isFeatured);
  return (
    <>
      <a
        href={`https://github.com/${profile.username}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#242322] hover:text-orange-600"
      >
        <Github className="size-4" />
        github.com/{profile.username}
        <ExternalLink className="size-3.5" />
      </a>
      <p className="mt-1 text-[11px] text-[#88827c]">
        {profile.lastSyncedAt
          ? `Last synced ${new Date(profile.lastSyncedAt).toLocaleString()}`
          : "Sync complete"}
      </p>
      {repos.length > 0 && (
        <div className="mt-4 space-y-2">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-[#e9e5df] bg-[#f7f5f2] px-3 py-2.5 hover:border-orange-300"
            >
              <p className="text-xs font-bold text-[#242322]">{repo.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-[#77736e]">
                {repo.description || repo.language || "GitHub repository"}
              </p>
            </a>
          ))}
        </div>
      )}
    </>
  );
}

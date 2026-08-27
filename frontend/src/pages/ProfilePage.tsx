import { useEffect, useState } from "react";
import {
  Clock,
  Edit3,
  ExternalLink,
  Github,
  RefreshCw,
  Save,
  X,
} from "lucide-react";
import {
  useGitHubConnectionStatus,
  useOnboardingOptions,
} from "../hooks/onboarding.hooks";
import { useGitHubProfile, useSyncGitHub } from "../hooks/github.hooks";
import { useMyProfile, useUpdateMyProfile } from "../hooks/profile.hooks";
import type { UpdateProfileInput } from "../services/profile.api";

const readable = (value: string) => value.replaceAll("_", " ");
const roles = [
  "frontend",
  "backend",
  "fullstack",
  "mobile",
  "devops",
  "ml",
  "data",
  "designer",
  "product",
];
const experienceLevels = ["Junior", "Mid", "Senior", "Lead"];
const availabilityOptions = [
  "1_5_hours",
  "5_15_hours",
  "15_30_hours",
  "full_time",
];

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
            onClick={() => setEditing((value) => !value)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-2 text-xs font-semibold text-[#55504b] hover:border-orange-300 hover:bg-orange-50 hover:text-orange-600"
          >
            <Edit3 className="size-3.5" />
            {editing ? "Cancel" : "Edit"}
          </button>
        </div>
        {!editing && profile.bio && (
          <p className="mt-5 text-sm leading-relaxed text-[#55504b]">
            {profile.bio}
          </p>
        )}
      </section>

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
            <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
              <Label>Current project</Label>
              <p className="text-sm leading-relaxed text-[#55504b]">
                {profile.projectDescription}
              </p>
            </section>
          )}
        </>
      )}

      <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
        <div className="mb-3 flex items-center justify-between gap-4">
          <Label>GitHub</Label>
          {githubStatus?.connected && (
            <button
              type="button"
              disabled={syncMutation.isPending}
              onClick={() => syncMutation.mutate()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:underline disabled:opacity-60"
            >
              <RefreshCw
                className={`size-3.5 ${syncMutation.isPending ? "animate-spin" : ""}`}
              />
              {syncMutation.isPending ? "Starting sync…" : "Sync GitHub"}
            </button>
          )}
        </div>
        {!githubStatus?.connected ? (
          <p className="text-sm text-[#77736e]">
            Connect GitHub from Settings to enrich your embedding automatically.
          </p>
        ) : githubQuery.data ? (
          <>
            <p className="mb-3 rounded-2xl bg-orange-50 p-3 text-xs leading-relaxed text-[#8a5a16]">
              Repository selection is currently automatic: DevTinder selects up
              to 3 repositories using stars and recent activity. Custom
              repository selection is planned for V2.
            </p>
            <GitHubSummary profile={githubQuery.data} />
          </>
        ) : (
          <>
            <p className="text-sm text-[#77736e]">
              {syncMutation.isSuccess
                ? "Sync started. Your repositories will appear here shortly."
                : "No GitHub data has been synced yet. Click Sync GitHub."}
            </p>
            <p className="mt-3 rounded-2xl bg-orange-50 p-3 text-xs leading-relaxed text-[#8a5a16]">
              For now, up to 3 repositories are selected automatically using
              stars and recent activity. Custom repository selection is planned
              for V2.
            </p>
          </>
        )}
        {syncMutation.isError && (
          <p className="mt-3 text-xs text-red-600">
            Could not start GitHub sync. Please try again.
          </p>
        )}
      </section>
    </div>
  );
}

function EditProfileForm({
  form,
  setForm,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: {
  form: UpdateProfileInput;
  setForm: React.Dispatch<React.SetStateAction<UpdateProfileInput>>;
  isSaving: boolean;
  error: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}) {
  const update = <K extends keyof UpdateProfileInput>(
    key: K,
    value: UpdateProfileInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const { data: options } = useOnboardingOptions();
  const toggle = (
    key: "skillIds" | "interestIds" | "lookingForIds",
    id: string,
    limit: number,
  ) => {
    const selected = form[key] ?? [];
    update(
      key,
      selected.includes(id)
        ? selected.filter((item) => item !== id)
        : selected.length < limit
          ? [...selected, id]
          : selected,
    );
  };
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs"
    >
      <Label>Edit profile</Label>
      <Field label="About">
        <textarea
          value={form.bio ?? ""}
          maxLength={500}
          onChange={(event) => update("bio", event.target.value)}
          rows={4}
          className="form-control resize-none"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField
          label="Role"
          value={form.primaryRole ?? ""}
          values={roles}
          onChange={(value) => update("primaryRole", value)}
        />
        <SelectField
          label="Experience"
          value={form.experienceLevel ?? ""}
          values={experienceLevels}
          onChange={(value) => update("experienceLevel", value)}
        />
        <SelectField
          label="Availability"
          value={form.availability ?? ""}
          values={availabilityOptions}
          onChange={(value) => update("availability", value)}
          readable
        />
      </div>
      <ChoiceGroup
        label="Skills"
        items={options?.skills ?? []}
        selected={form.skillIds ?? []}
        onToggle={(id) => toggle("skillIds", id, 10)}
      />
      <ChoiceGroup
        label="Interests"
        items={options?.interests ?? []}
        selected={form.interestIds ?? []}
        onToggle={(id) => toggle("interestIds", id, 10)}
        accent
      />
      <ChoiceGroup
        label="Looking for"
        items={options?.lookingFor ?? []}
        selected={form.lookingForIds ?? []}
        onToggle={(id) => toggle("lookingForIds", id, 5)}
      />
      <Field label="Add custom skill">
        <input
          value={form.customSkills?.[0] ?? ""}
          maxLength={50}
          onChange={(event) =>
            update(
              "customSkills",
              event.target.value ? [event.target.value] : [],
            )
          }
          placeholder="Optional custom skill"
          className="form-control"
        />
      </Field>
      <Field label="Current project">
        <textarea
          value={form.projectDescription ?? ""}
          maxLength={1000}
          onChange={(event) => update("projectDescription", event.target.value)}
          rows={3}
          className="form-control resize-none"
        />
      </Field>
      {error && (
        <p className="text-xs text-red-600">
          Could not save your profile. Check the details and try again.
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#e4ded5] px-3 py-2 text-xs font-semibold text-[#55504b]"
        >
          <X className="size-3.5" />
          Cancel
        </button>
        <button
          disabled={isSaving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a1918] px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-60"
        >
          <Save className="size-3.5" />
          {isSaving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}

function GitHubSummary({
  profile,
}: {
  profile: import("../services/github.api").GitHubProfile;
}) {
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
function PageMessage({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`mx-auto max-w-2xl px-4 py-16 text-center text-sm ${error ? "text-red-600" : "text-[#77736e]"}`}
    >
      {children}
    </div>
  );
}
function Avatar({
  name,
  url,
}: {
  name: string;
  url: string | null | undefined;
}) {
  return (
    <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-orange-500 text-xl font-bold text-white">
      {url ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        name[0]?.toUpperCase()
      )}
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#88827c]">
      {children}
    </p>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[#f7f5f2] px-2.5 py-1">
      {children}
    </span>
  );
}
function ProfileSection({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <section className="rounded-3xl border border-[#e9e5df] bg-white p-5 shadow-xs">
      <Label>{title}</Label>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className={`rounded-full border border-[#e9e5df] px-3 py-1.5 text-[11px] font-semibold ${accent ? "bg-orange-50 text-orange-700" : "bg-[#f7f5f2] text-[#55504b]"}`}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#55504b]">
        {label}
      </span>
      {children}
    </label>
  );
}
function SelectField({
  label,
  value,
  values,
  readable: format,
  onChange,
}: {
  label: string;
  value: string;
  values: string[];
  readable?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-[#55504b]">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-control"
      >
        {values.map((item) => (
          <option key={item} value={item}>
            {format ? readable(item) : item}
          </option>
        ))}
      </select>
    </label>
  );
}
function ChoiceGroup({
  label,
  items,
  selected,
  onToggle,
  accent,
}: {
  label: string;
  items: { id: string; name: string }[];
  selected: string[];
  onToggle: (id: string) => void;
  accent?: boolean;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-[#55504b]">{label}</p>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${selected.includes(item.id) ? (accent ? "border-orange-500 bg-orange-50 text-orange-700" : "border-[#1a1918] bg-[#1a1918] text-white") : "border-[#e9e5df] bg-white text-[#55504b] hover:border-orange-300"}`}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

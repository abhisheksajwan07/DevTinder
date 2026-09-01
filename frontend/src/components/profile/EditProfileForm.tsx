import { Save, X } from "lucide-react";
import { useOnboardingOptions } from "../../hooks/onboarding.hooks";
import type { UpdateProfileInput } from "../../services/profile.api";
import { ChoiceGroup, Field, Label, SelectField } from "./ProfileUI";

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

interface EditProfileFormProps {
  form: UpdateProfileInput;
  setForm: React.Dispatch<React.SetStateAction<UpdateProfileInput>>;
  isSaving: boolean;
  error: boolean;
  onSubmit: (event: React.FormEvent) => void;
  onCancel: () => void;
}

export default function EditProfileForm({
  form,
  setForm,
  isSaving,
  error,
  onSubmit,
  onCancel,
}: EditProfileFormProps) {
  const { data: options } = useOnboardingOptions();

  const update = <K extends keyof UpdateProfileInput>(
    key: K,
    value: UpdateProfileInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

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

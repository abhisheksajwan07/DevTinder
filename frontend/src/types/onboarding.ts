export type PrimaryRole =
  | "frontend"
  | "backend"
  | "fullstack"
  | "mobile"
  | "devops"
  | "ml"
  | "data"
  | "designer"
  | "product";

export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead";
export type Availability =
  | "1_5_hours"
  | "5_15_hours"
  | "15_30_hours"
  | "full_time";

export interface OnboardingFormValues {
  firstName: string;
  lastName: string;
  userName: string;
  bio: string;
  primaryRole: PrimaryRole | "";
  experienceLevel: ExperienceLevel | "";
  availability: Availability | "";
  avatarId: string;
  projectDescription: string;
  skillIds: string[];
  customSkills: string[];
  interestIds: string[];
  lookingForIds: string[];
}

export const roleOptions: { label: string; value: PrimaryRole }[] = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Fullstack", value: "fullstack" },
  { label: "Mobile", value: "mobile" },
  { label: "DevOps", value: "devops" },
  { label: "Machine Learning", value: "ml" },
  { label: "Data", value: "data" },
  { label: "Designer", value: "designer" },
  { label: "Product", value: "product" },
];

export const experienceOptions: ExperienceLevel[] = [
  "Junior",
  "Mid",
  "Senior",
  "Lead",
];

export const availabilityOptions: { label: string; value: Availability }[] = [
  { label: "1–5 hrs/week", value: "1_5_hours" },
  { label: "5–15 hrs/week", value: "5_15_hours" },
  { label: "15–30 hrs/week", value: "15_30_hours" },
  { label: "Full-time", value: "full_time" },
];

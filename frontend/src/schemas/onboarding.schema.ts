import { z } from "zod";

export const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;



export const roleOptions = [
  { label: "Frontend", value: "frontend" },
  { label: "Backend", value: "backend" },
  { label: "Fullstack", value: "fullstack" },
  { label: "Mobile", value: "mobile" },
  { label: "DevOps", value: "devops" },
  { label: "Machine Learning", value: "ml" },
  { label: "Data", value: "data" },
  { label: "Designer", value: "designer" },
  { label: "Product", value: "product" },
] as const;

export const experienceOptions = [
  "Junior",
  "Mid",
  "Senior",
  "Lead",
] as const;

export const availabilityOptions = [
  { label: "1–5 hrs/week", value: "1_5_hours" },
  { label: "5–15 hrs/week", value: "5_15_hours" },
  { label: "15–30 hrs/week", value: "15_30_hours" },
  { label: "Full-time", value: "full_time" },
] as const;



export type PrimaryRole = (typeof roleOptions)[number]["value"];
export type ExperienceLevel = (typeof experienceOptions)[number];
export type Availability = (typeof availabilityOptions)[number]["value"];



export const primaryRoles = roleOptions.map((item) => item.value) as unknown as readonly [
  PrimaryRole,
  ...PrimaryRole[],
];

export const availabilities = availabilityOptions.map((item) => item.value) as unknown as readonly [
  Availability,
  ...Availability[],
];



export const onboardingSchema = z.object({
  // Step 1 — Basic Profile
  firstName: z.string().min(1, "First name is required.").max(100),
  lastName: z.string().min(1, "Last name is required.").max(100),
  userName: z
    .string()
    .min(3, "Username must have at least 3 characters.")
    .max(30)
    .regex(USERNAME_REGEX, "Use letters, numbers, and underscores only."),
  bio: z.string().max(500, "Bio can be at most 500 characters."),
  avatarId: z.string().min(1, "Choose an avatar."),

  // Step 2 — Developer Identity
  primaryRole: z.enum(primaryRoles, {
    message: "Choose your role.",
  }),
  experienceLevel: z.enum(experienceOptions, {
    message: "Choose your experience level.",
  }),
  availability: z.enum(availabilities, {
    message: "Choose your availability.",
  }),

  // Step 3 — Skills
  skillIds: z.string().array().min(1, "Choose at least one skill.").max(10),
  customSkills: z.string().array().max(5),

  // Step 4 — Interests
  interestIds: z.string().array().min(1, "Choose at least one interest."),

  // Step 5 — Goals
  lookingForIds: z
    .string()
    .array()
    .min(1, "Choose at least one collaboration goal."),
  projectDescription: z
    .string()
    .max(1000, "Project description can be at most 1000 characters."),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;

import { eq } from "drizzle-orm";
import {
  avatars,
  db,
  interests,
  lookingFor,
  profileInterests,
  profileLookingFor,
  profiles,
  profileSkills,
  skills,
  users,
} from "../drizzle.js";
import { embeddingQueue } from "../../queues/embedding.queue.js";

const demoProfiles = [
  {
    email: "riya.sharma@devtinder.local",
    firstName: "Riya",
    lastName: "Sharma",
    userName: "riya_codes",
    bio: "Backend developer building reliable APIs and developer tools.",
    primaryRole: "backend" as const,
    experienceLevel: "Mid" as const,
    availability: "5_15_hours" as const,
    skills: ["Node.js", "Express", "PostgreSQL"],
    interests: ["Developer Tools", "Open Source"],
    lookingFor: ["Collaborator", "Open Source Contributor"],
  },
  {
    email: "arjun.verma@devtinder.local",
    firstName: "Arjun",
    lastName: "Verma",
    userName: "arjun_builds",
    bio: "Full-stack engineer who enjoys shipping polished SaaS products.",
    primaryRole: "fullstack" as const,
    experienceLevel: "Junior" as const,
    availability: "15_30_hours" as const,
    skills: ["React", "TypeScript", "Node.js"],
    interests: ["Startups", "SaaS"],
    lookingFor: ["Co-founder", "Collaborator"],
  },
  {
    email: "meera.iyer@devtinder.local",
    firstName: "Meera",
    lastName: "Iyer",
    userName: "meera_designs",
    bio: "Product designer focused on intuitive developer experiences.",
    primaryRole: "designer" as const,
    experienceLevel: "Senior" as const,
    availability: "5_15_hours" as const,
    skills: ["React", "Tailwind CSS"],
    interests: ["UI/UX Design", "Developer Tools"],
    lookingFor: ["Collaborator", "Freelance Partner"],
  },
  {
    email: "kabir.khan@devtinder.local",
    firstName: "Kabir",
    lastName: "Khan",
    userName: "kabir_cloud",
    bio: "DevOps engineer automating infrastructure and CI/CD pipelines.",
    primaryRole: "devops" as const,
    experienceLevel: "Mid" as const,
    availability: "full_time" as const,
    skills: ["Docker", "Kubernetes", "AWS"],
    interests: ["DevOps", "Cloud Computing"],
    lookingFor: ["Collaborator", "Mentor"],
  },
  {
    email: "ananya.rao@devtinder.local",
    firstName: "Ananya",
    lastName: "Rao",
    userName: "ananya_ml",
    bio: "ML engineer turning practical AI ideas into useful applications.",
    primaryRole: "ml" as const,
    experienceLevel: "Mid" as const,
    availability: "5_15_hours" as const,
    skills: ["Python", "PyTorch", "LangChain"],
    interests: ["AI & Machine Learning", "Startups"],
    lookingFor: ["Collaborator", "Mentee"],
  },
  {
    email: "vikram.singh@devtinder.local",
    firstName: "Vikram",
    lastName: "Singh",
    userName: "vikram_mobile",
    bio: "Mobile developer building fast and accessible cross-platform apps.",
    primaryRole: "mobile" as const,
    experienceLevel: "Junior" as const,
    availability: "15_30_hours" as const,
    skills: ["React Native", "TypeScript", "Kotlin"],
    interests: ["Mobile Apps", "EdTech"],
    lookingFor: ["Collaborator", "Mentor"],
  },
  {
    email: "isha.gupta@devtinder.local",
    firstName: "Isha",
    lastName: "Gupta",
    userName: "isha_data",
    bio: "Data engineer interested in analytics platforms and scalable pipelines.",
    primaryRole: "data" as const,
    experienceLevel: "Senior" as const,
    availability: "5_15_hours" as const,
    skills: ["Python", "PostgreSQL", "Docker"],
    interests: ["Data Engineering", "Fintech"],
    lookingFor: ["Collaborator", "Mentee"],
  },
  {
    email: "rohan.das@devtinder.local",
    firstName: "Rohan",
    lastName: "Das",
    userName: "rohan_frontend",
    bio: "Frontend developer with a love for thoughtful interfaces and performance.",
    primaryRole: "frontend" as const,
    experienceLevel: "Mid" as const,
    availability: "1_5_hours" as const,
    skills: ["React", "Next.js", "Tailwind CSS"],
    interests: ["UI/UX Design", "Open Source"],
    lookingFor: ["Freelance Partner", "Collaborator"],
  },
  {
    email: "neha.patel@devtinder.local",
    firstName: "Neha",
    lastName: "Patel",
    userName: "neha_product",
    bio: "Product manager connecting strong teams with meaningful problems.",
    primaryRole: "product" as const,
    experienceLevel: "Lead" as const,
    availability: "5_15_hours" as const,
    skills: ["TypeScript", "PostgreSQL"],
    interests: ["Startups", "SaaS"],
    lookingFor: ["Co-founder", "Mentor"],
  },
  {
    email: "aditya.jain@devtinder.local",
    firstName: "Aditya",
    lastName: "Jain",
    userName: "aditya_stack",
    bio: "Backend-focused full-stack developer and open-source contributor.",
    primaryRole: "fullstack" as const,
    experienceLevel: "Senior" as const,
    availability: "full_time" as const,
    skills: ["Go", "React", "PostgreSQL"],
    interests: ["Open Source", "Cybersecurity"],
    lookingFor: ["Open Source Contributor", "Collaborator"],
  },
];

async function findIdByName(
  table: typeof skills | typeof interests | typeof lookingFor,
  name: string,
): Promise<string> {
  const [record] = await db
    .select({ id: table.id })
    .from(table)
    .where(eq(table.name, name));
    
  if (!record) throw new Error(`Missing required seed option: ${name}`);
  return record.id;
}

export const seedFeedProfiles = async () => {
  const avatarRows = await db.select({ id: avatars.id }).from(avatars);
  if (avatarRows.length === 0)
    throw new Error("Seed avatars before feed profiles.");

  for (const [index, demo] of demoProfiles.entries()) {
    await db
      .insert(users)
      .values({ email: demo.email, onBoardingComplete: true })
      .onConflictDoNothing();

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, demo.email));
    if (!user) throw new Error(`Failed to create demo user: ${demo.email}`);

    const avatar = avatarRows[index % avatarRows.length];
    if (!avatar) throw new Error("No avatar available for demo profile.");

    const [newProfile] = await db
      .insert(profiles)
      .values({
        userId: user.id,
        firstName: demo.firstName,
        lastName: demo.lastName,
        userName: demo.userName,
        bio: demo.bio,
        avatarId: avatar.id,
        primaryRole: demo.primaryRole,
        experienceLevel: demo.experienceLevel,
        availability: demo.availability,
        projectDescription:
          "Demo profile created to test the recommendation feed.",
        embeddingStatus: "stale",
      })
      .onConflictDoNothing()
      .returning({ id: profiles.id });

    const profileId =
      newProfile?.id ??
      (
        await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.userId, user.id))
          .limit(1)
      )[0]?.id;

    if (!profileId)
      throw new Error(`Failed to create demo profile: ${demo.userName}`);

    const [skillIds, interestIds, lookingForIds] = await Promise.all([
      Promise.all(demo.skills.map((name) => findIdByName(skills, name))),
      Promise.all(demo.interests.map((name) => findIdByName(interests, name))),
      Promise.all(
        demo.lookingFor.map((name) => findIdByName(lookingFor, name)),
      ),
    ]);

    await db
      .insert(profileSkills)
      .values(skillIds.map((skillId) => ({ profileId, skillId })))
      .onConflictDoNothing();
    await db
      .insert(profileInterests)
      .values(
        interestIds.map((interestId) => ({
          profileId,
          interestId,
        })),
      )
      .onConflictDoNothing();
    await db
      .insert(profileLookingFor)
      .values(
        lookingForIds.map((lookingForId) => ({
          profileId,
          lookingForId,
        })),
      )
      .onConflictDoNothing();

    if (newProfile) {
      await embeddingQueue.add(
        "generate_embedding",
        { profileId },
        { jobId: `seed-${profileId}` },
      );
    }
  }
};

import { db } from "../drizzle.js";
import { skills } from "../drizzle.js";

export const seedSkills = async () => {
  await db
    .insert(skills)
    .values([
      { name: "React", category: "frontend" },
      { name: "Next.js", category: "frontend" },
      { name: "Vue", category: "frontend" },
      { name: "Angular", category: "frontend" },
      { name: "Svelte", category: "frontend" },
      { name: "Tailwind CSS", category: "frontend" },
      { name: "TypeScript", category: "frontend" },

      { name: "Node.js", category: "backend" },
      { name: "Express", category: "backend" },
      { name: "NestJS", category: "backend" },
      { name: "Go", category: "backend" },
      { name: "FastAPI", category: "backend" },
      { name: "Django", category: "backend" },
      { name: "Spring Boot", category: "backend" },

      { name: "PostgreSQL", category: "database" },
      { name: "MongoDB", category: "database" },
      { name: "Redis", category: "database" },
      { name: "MySQL", category: "database" },
      { name: "Prisma", category: "database" },
      { name: "Drizzle ORM", category: "database" },

      { name: "Docker", category: "devops" },
      { name: "Kubernetes", category: "devops" },
      { name: "GitHub Actions", category: "devops" },
      { name: "Terraform", category: "devops" },

      { name: "AWS", category: "cloud" },
      { name: "GCP", category: "cloud" },
      { name: "Azure", category: "cloud" },

      { name: "Python", category: "ai" },
      { name: "LangChain", category: "ai" },
      { name: "PyTorch", category: "ai" },
      { name: "TensorFlow", category: "ai" },
      { name: "OpenAI", category: "ai" },

      { name: "React Native", category: "mobile" },
      { name: "Flutter", category: "mobile" },
      { name: "Swift", category: "mobile" },
      { name: "Kotlin", category: "mobile" },

      { name: "Jest", category: "testing" },
      { name: "Vitest", category: "testing" },
      { name: "Cypress", category: "testing" },
      { name: "Playwright", category: "testing" },
    ])
    .onConflictDoNothing();
};

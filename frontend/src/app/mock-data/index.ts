// ============================================================
// DevTinder — Mock Data
// All UI screens use this file. Replace with API calls later.
// ============================================================

// ── Types ────────────────────────────────────────────────────

export type Role =
  | "Frontend"
  | "Backend"
  | "Fullstack"
  | "Mobile"
  | "DevOps"
  | "Machine Learning"
  | "Data"
  | "Designer"
  | "Product";

export type Experience = "Junior" | "Mid" | "Senior" | "Lead";

export type Availability =
  | "1–5 hrs/week"
  | "5–15 hrs/week"
  | "15–30 hrs/week"
  | "Full-time";

export type CollabGoal =
  | "Build a side project"
  | "Find a technical cofounder"
  | "Join an open-source project"
  | "Learn together"
  | "Find a mentor"
  | "Find a mentee"
  | "Participate in hackathons"
  | "Find freelance collaborators";

export interface DevProfile {
  id: string;
  name: string;
  username: string;
  avatar: string;
  avatarColor: string;
  role: Role;
  experience: Experience;
  availability: Availability;
  bio: string;
  skills: string[];
  interests: string[];
  goals: CollabGoal[];
  matchScore: number;
  isOnline: boolean;
  githubUsername: string;
  projectDescription?: string;
}

export interface Match {
  id: string;
  profile: DevProfile;
  matchedAt: string;
  lastActivity: string;
  isNew: boolean;
  isActive: boolean;
  sharedSkills: string[];
  sharedInterests: string[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: DevProfile;
  messages: Message[];
  unreadCount: number;
  lastMessage: string;
  lastTimestamp: string;
}

export interface SessionDevice {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  createdAt: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  isFeatured: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  avatarColor: string;
  role: Role;
  experience: Experience;
  availability: Availability;
  bio: string;
  skills: string[];
  interests: string[];
  goals: CollabGoal[];
  projectDescription: string;
  githubConnected: boolean;
  githubUsername: string;
  githubLastSynced: string;
  profileCompletion: number;
  repositories: Repository[];
  notificationCount: number;
}

// ── Current User ─────────────────────────────────────────────

export const currentUser: CurrentUser = {
  id: "me",
  name: "Abhishek Sajwan",
  username: "abhishekbuilds",
  email: "abhishek@dev.com",
  avatar: "A",
  avatarColor: "#ee7100",
  role: "Backend",
  experience: "Senior",
  availability: "5–15 hrs/week",
  bio: "Building high-throughput distributed systems & AI-powered matching engines. Love open source and pair coding sessions.",
  skills: ["TypeScript", "Node.js", "PostgreSQL", "Redis", "BullMQ", "Docker"],
  interests: ["Open source", "SaaS", "AI tools", "Developer tools"],
  goals: ["Build a side project", "Find a technical cofounder"],
  projectDescription:
    "DevTinder — a developer matching platform powered by Voyage AI embeddings and pgvector cosine similarity.",
  githubConnected: true,
  githubUsername: "abhisheksajwan07",
  githubLastSynced: "2 hours ago",
  profileCompletion: 82,
  notificationCount: 3,
  repositories: [
    {
      id: "r1",
      name: "DevTinder",
      description: "Developer matching platform powered by AI vector embeddings",
      language: "TypeScript",
      stars: 24,
      url: "#",
      isFeatured: true,
    },
    {
      id: "r2",
      name: "pgvector-search",
      description: "Semantic search utilities using pgvector and Voyage AI",
      language: "TypeScript",
      stars: 15,
      url: "#",
      isFeatured: true,
    },
    {
      id: "r3",
      name: "bullmq-scheduler",
      description: "Zero-downtime job scheduling built on BullMQ",
      language: "Node.js",
      stars: 41,
      url: "#",
      isFeatured: false,
    },
    {
      id: "r4",
      name: "redis-cache-kit",
      description: "Type-safe Redis caching layer for Express APIs",
      language: "TypeScript",
      stars: 9,
      url: "#",
      isFeatured: false,
    },
  ],
};

// ── Developer Profiles ────────────────────────────────────────

export const developerProfiles: DevProfile[] = [
  {
    id: "p1",
    name: "Arjun Mehta",
    username: "arjunbuilds",
    avatar: "AR",
    avatarColor: "#6366f1",
    role: "Fullstack",
    experience: "Senior",
    availability: "5–15 hrs/week",
    bio: "Building tools that make developers collaborate better. Ex-Stripe. Passionate about DX and clean APIs.",
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "GraphQL"],
    interests: ["SaaS", "Open source", "AI tools"],
    goals: ["Build a side project", "Find a technical cofounder"],
    matchScore: 92,
    isOnline: true,
    githubUsername: "arjunbuilds",
    projectDescription:
      "Developer analytics platform — real-time insights into your team's codebase velocity.",
  },
  {
    id: "p2",
    name: "Priya Nair",
    username: "priyaengineers",
    avatar: "PN",
    avatarColor: "#10b981",
    role: "Machine Learning",
    experience: "Mid",
    availability: "15–30 hrs/week",
    bio: "ML engineer passionate about making AI accessible to every developer. Building with Hugging Face & PyTorch.",
    skills: ["Python", "PyTorch", "FastAPI", "PostgreSQL", "Docker"],
    interests: ["AI tools", "Open source", "EdTech"],
    goals: ["Join an open-source project", "Learn together"],
    matchScore: 87,
    isOnline: false,
    githubUsername: "priyaml",
  },
  {
    id: "p3",
    name: "Marcus Vance",
    username: "marcusvance",
    avatar: "MV",
    avatarColor: "#8b5cf6",
    role: "Backend",
    experience: "Lead",
    availability: "1–5 hrs/week",
    bio: "Obsessed with ultra-low latency systems and concurrent algorithms. Rust evangelist.",
    skills: ["Rust", "Go", "WebAssembly", "gRPC", "Docker", "Kubernetes"],
    interests: ["Open source", "Cloud infrastructure", "Developer tools"],
    goals: ["Join an open-source project", "Find freelance collaborators"],
    matchScore: 79,
    isOnline: true,
    githubUsername: "marcusvance",
  },
  {
    id: "p4",
    name: "Sana Rehman",
    username: "sanadesigns",
    avatar: "SR",
    avatarColor: "#f43f5e",
    role: "Frontend",
    experience: "Mid",
    availability: "5–15 hrs/week",
    bio: "Frontend developer who believes UX and performance are equally important. Design systems fanatic.",
    skills: ["React", "TypeScript", "CSS", "Figma", "Storybook"],
    interests: ["SaaS", "Developer tools", "Web development"],
    goals: ["Build a side project", "Find a mentor"],
    matchScore: 84,
    isOnline: false,
    githubUsername: "sanadev",
  },
  {
    id: "p5",
    name: "Carlos Reyes",
    username: "carlosbuilds",
    avatar: "CR",
    avatarColor: "#0ea5e9",
    role: "DevOps",
    experience: "Senior",
    availability: "5–15 hrs/week",
    bio: "DevOps engineer focused on zero-downtime deployments and developer experience in CI/CD pipelines.",
    skills: ["Kubernetes", "Terraform", "AWS", "Docker", "GitHub Actions"],
    interests: ["Cloud infrastructure", "Open source", "Startups"],
    goals: ["Build a side project", "Participate in hackathons"],
    matchScore: 75,
    isOnline: true,
    githubUsername: "carlosdevops",
  },
];

// ── Matches ───────────────────────────────────────────────────

export const matches: Match[] = [
  {
    id: "m1",
    profile: developerProfiles[0],
    matchedAt: "2026-08-07T06:00:00Z",
    lastActivity: "Active now",
    isNew: true,
    isActive: true,
    sharedSkills: ["TypeScript", "Node.js", "PostgreSQL"],
    sharedInterests: ["SaaS", "Open source"],
  },
  {
    id: "m2",
    profile: developerProfiles[3],
    matchedAt: "2026-08-06T14:00:00Z",
    lastActivity: "3 hours ago",
    isNew: false,
    isActive: true,
    sharedSkills: ["TypeScript", "React"],
    sharedInterests: ["Developer tools"],
  },
  {
    id: "m3",
    profile: developerProfiles[1],
    matchedAt: "2026-08-05T10:00:00Z",
    lastActivity: "Yesterday",
    isNew: false,
    isActive: false,
    sharedSkills: ["PostgreSQL", "Docker"],
    sharedInterests: ["AI tools", "Open source"],
  },
];

// ── Conversations ─────────────────────────────────────────────

export const conversations: Conversation[] = [
  {
    id: "c1",
    participant: developerProfiles[0], // Arjun
    unreadCount: 2,
    lastMessage: "That sounds interesting. I've been working on a matching platform.",
    lastTimestamp: "10:42 AM",
    messages: [
      {
        id: "msg1",
        senderId: "p1",
        text: "Hey! I saw that you're also working with TypeScript and SaaS tools.",
        timestamp: "10:30 AM",
        read: true,
      },
      {
        id: "msg2",
        senderId: "me",
        text: "Yes! I'm building a developer matching platform for the past 3 months.",
        timestamp: "10:34 AM",
        read: true,
      },
      {
        id: "msg3",
        senderId: "p1",
        text: "That sounds interesting! I've been working on a developer analytics tool. Maybe we can pair on something together?",
        timestamp: "10:38 AM",
        read: true,
      },
      {
        id: "msg4",
        senderId: "me",
        text: "That sounds interesting. I've been working on a matching platform for developers.",
        timestamp: "10:42 AM",
        read: false,
      },
      {
        id: "msg5",
        senderId: "p1",
        text: "Would love to see a demo. Are you free this weekend?",
        timestamp: "10:43 AM",
        read: false,
      },
    ],
  },
  {
    id: "c2",
    participant: developerProfiles[3], // Sana
    unreadCount: 0,
    lastMessage: "Let me check the Figma file and get back to you.",
    lastTimestamp: "Yesterday",
    messages: [
      {
        id: "msg6",
        senderId: "me",
        text: "Hey Sana! Loved your work on the design system. Are you open to collaborating on a project?",
        timestamp: "Yesterday 3:00 PM",
        read: true,
      },
      {
        id: "msg7",
        senderId: "p4",
        text: "Sure! What's the project about?",
        timestamp: "Yesterday 4:15 PM",
        read: true,
      },
      {
        id: "msg8",
        senderId: "me",
        text: "It's a developer collaboration platform. I need someone strong in frontend and design systems.",
        timestamp: "Yesterday 4:18 PM",
        read: true,
      },
      {
        id: "msg9",
        senderId: "p4",
        text: "Let me check the Figma file and get back to you.",
        timestamp: "Yesterday 4:50 PM",
        read: true,
      },
    ],
  },
  {
    id: "c3",
    participant: developerProfiles[1], // Priya
    unreadCount: 0,
    lastMessage: "Happy to help with the ML integration side.",
    lastTimestamp: "Aug 5",
    messages: [
      {
        id: "msg10",
        senderId: "p2",
        text: "Hi! I'm Priya, ML engineer. Saw your project uses Voyage AI embeddings — very cool approach.",
        timestamp: "Aug 5 9:00 AM",
        read: true,
      },
      {
        id: "msg11",
        senderId: "me",
        text: "Thanks Priya! Yes, Voyage AI gives way better embedding quality for technical content.",
        timestamp: "Aug 5 9:15 AM",
        read: true,
      },
      {
        id: "msg12",
        senderId: "p2",
        text: "Happy to help with the ML integration side.",
        timestamp: "Aug 5 9:20 AM",
        read: true,
      },
    ],
  },
];

// ── Sessions ──────────────────────────────────────────────────

export const sessions: SessionDevice[] = [
  {
    id: "s1",
    device: "MacBook Pro",
    browser: "Chrome",
    os: "macOS",
    location: "Bengaluru, India",
    createdAt: "2026-08-01",
    lastActive: "Active now",
    isCurrent: true,
  },
  {
    id: "s2",
    device: "iPhone 15",
    browser: "Safari",
    os: "iOS 17",
    location: "Bengaluru, India",
    createdAt: "2026-08-03",
    lastActive: "2 hours ago",
    isCurrent: false,
  },
  {
    id: "s3",
    device: "Windows Desktop",
    browser: "Chrome",
    os: "Windows 11",
    location: "Mumbai, India",
    createdAt: "2026-07-28",
    lastActive: "3 days ago",
    isCurrent: false,
  },
  {
    id: "s4",
    device: "Android Phone",
    browser: "Chrome",
    os: "Android 14",
    location: "Delhi, India",
    createdAt: "2026-07-20",
    lastActive: "1 week ago",
    isCurrent: false,
  },
];

// ── Onboarding Options ────────────────────────────────────────

export const roles: Role[] = [
  "Frontend",
  "Backend",
  "Fullstack",
  "Mobile",
  "DevOps",
  "Machine Learning",
  "Data",
  "Designer",
  "Product",
];

export const experienceLevels: Experience[] = [
  "Junior",
  "Mid",
  "Senior",
  "Lead",
];

export const availabilityOptions: Availability[] = [
  "1–5 hrs/week",
  "5–15 hrs/week",
  "15–30 hrs/week",
  "Full-time",
];

export const skillsByCategory: Record<string, string[]> = {
  Frontend: ["React", "Vue", "Angular", "Next.js", "TypeScript", "JavaScript", "CSS", "Tailwind"],
  Backend: ["Node.js", "Express", "Go", "Rust", "Python", "Java", "FastAPI", "Django"],
  Database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "PlanetScale"],
  DevOps: ["Docker", "Kubernetes", "GitHub Actions", "Terraform", "Nginx", "Linux"],
  Cloud: ["AWS", "GCP", "Azure", "Vercel", "Railway", "Fly.io"],
  AI: ["Voyage AI", "OpenAI", "Hugging Face", "PyTorch", "LangChain", "pgvector"],
  Mobile: ["React Native", "Flutter", "Swift", "Kotlin"],
  Testing: ["Vitest", "Jest", "Playwright", "Cypress"],
  Other: ["GraphQL", "gRPC", "WebSockets", "BullMQ", "Prisma"],
};

export const interestOptions: string[] = [
  "Open source",
  "Startups",
  "AI tools",
  "SaaS",
  "Web development",
  "Mobile apps",
  "Developer tools",
  "Fintech",
  "EdTech",
  "Games",
  "Cloud infrastructure",
  "Cybersecurity",
];

export const collabGoals: CollabGoal[] = [
  "Build a side project",
  "Find a technical cofounder",
  "Join an open-source project",
  "Learn together",
  "Find a mentor",
  "Find a mentee",
  "Participate in hackathons",
  "Find freelance collaborators",
];

export const avatarOptions = ["AB", "AM", "SK", "PR", "CR", "MV", "RN", "SN"];

// IDs mirror the UUID-shaped values returned by the backend options endpoint.
// Replace these mock IDs with API-provided IDs during integration.
const mockUuid = (index: number) =>
  `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`;

export const avatarIdsByLabel = Object.fromEntries(
  avatarOptions.map((label, index) => [label, mockUuid(index)]),
);

export const skillIdsByName = Object.fromEntries(
  Object.values(skillsByCategory)
    .flat()
    .map((name, index) => [name, mockUuid(100 + index)]),
);

export const interestIdsByName = Object.fromEntries(
  interestOptions.map((name, index) => [name, mockUuid(200 + index)]),
);

export const lookingForIdsByName = Object.fromEntries(
  collabGoals.map((name, index) => [name, mockUuid(300 + index)]),
);

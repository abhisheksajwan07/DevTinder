export const githubOAuthUrl = `${import.meta.env.VITE_API_URL || "/v1"}/oauth/github`;

export type FeatureCard = {

  title: string;
  description: string;
};

export const featureCards: FeatureCard[] = [
  {
    title: "1. Connect GitHub & Stack",
    description: "Auto-sync your profile, public repos, and primary languages.",
  },

  {
    title: "2. AI Vector Matching",
    description:
      "Our pgvector & Voyage AI engine matches you with complementary skills.",
  },
  {

    title: "3. Real-time Chat & Collaborate",
    description:
      "Instant messaging powered by Socket.IO with typing indicators and online presence.",
  },
];

export type ProfileTag = string;

export type ProfileCompany = {
  name: string;
  stack: string;
  stars: string;
};

export const heroBadges: ProfileTag[] = [
  "TypeScript",
  "Node.js",
  "Redis",
  "BullMQ",
  "PostgreSQL",
];

export type DemoProfile = {
  id: string;
  name: string;
  avatar: string;
  role: string;
  matchScore: number;
  badges: string[];
  repos: { name: string; stack: string; stars: string }[];
  bio: string;
};

export const demoProfiles: DemoProfile[] = [
  {
    id: "1",
    name: "Abhishek",
    avatar: "A",
    role: "Senior Backend Engineer",
    matchScore: 94,
    badges: ["TypeScript", "Node.js", "Redis", "BullMQ", "PostgreSQL"],
    repos: [
      { name: "DevTinder Engine", stack: "TypeScript", stars: "24" },
      { name: "pgvector-search", stack: "Node.js", stars: "15" },
    ],
    bio: "Building high-throughput distributed systems & AI vector matchers.",
  },
  {
    id: "2",
    name: "Sarah Chen",
    avatar: "S",
    role: "Fullstack & AI Developer",
    matchScore: 89,
    badges: ["Python", "FastAPI", "React", "Voyage AI", "Tailwind"],
    repos: [
      { name: "voyage-rag-kit", stack: "Python", stars: "142" },
      { name: "llm-stream-ui", stack: "TypeScript", stars: "88" },
    ],
    bio: "Passionate about vector embeddings, semantic search & pair coding.",
  },
  {
    id: "3",
    name: "Marcus Vance",
    avatar: "M",
    role: "Systems & Rust Architect",
    matchScore: 92,
    badges: ["Rust", "WebAssembly", "Go", "Docker", "gRPC"],
    repos: [
      { name: "fast-vector-db", stack: "Rust", stars: "310" },
      { name: "zero-copy-rpc", stack: "Go", stars: "76" },
    ],
    bio: "Obsessed with ultra-low latency, concurrent algorithms & open source.",
  },
];

export const profileCompanies: ProfileCompany[] = [
  { name: "DevTinder", stack: "TypeScript", stars: "24" },
  { name: "Brainly", stack: "Node.js", stars: "15" },
];

export type FooterLink = {
  label: string;
  href: string;
};

export type FooterSection = {
  title: string;
  items: FooterLink[];
};

export const footerSections: FooterSection[] = [
  {
    title: "Product",
    items: [
      { label: "Overview", href: "#top" },
      { label: "Features", href: "#features" },
      { label: "AI Match Engine", href: "#matching" },
      { label: "Live Demo", href: "#demo" },
    ],
  },
  {
    title: "Tech Stack",
    items: [
      { label: "Voyage AI Embeddings", href: "#matching" },
      { label: "pgvector Cosine Sim", href: "#matching" },
      { label: "Socket.IO Engine", href: "#features" },
      { label: "BullMQ & Redis", href: "#matching" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "GitHub Auth", href: githubOAuthUrl },
      { label: "API Reference", href: "#top" },
      { label: "Privacy Policy", href: "#top" },
      { label: "Terms of Service", href: "#top" },
    ],
  },
];

export type MatchCard = {
  icon: string;
  title: string;
  description: string;
  details?: string;
  badgeLabel?: string;
  tags?: string[];
  codeSnippet?: string;
  columnSpan?: number;
};

export const matchCards: MatchCard[] = [
  {
    icon: "♧",
    title: "AI Vector Match Precision",
    description:
      "pgvector cosine similarity ranks candidates by stack compatibility.",
    details: "cosine_sim = 0.94",
    codeSnippet: `SELECT dev_id, 1 - (embedding <=> $query) AS score\nFROM developers ORDER BY score DESC;`,
    columnSpan: 3,
  },
  {
    icon: "☆",
    title: "Featured GitHub Repos",
    description: "Live repo sync with stars, language %, and forks.",
    tags: ["TypeScript 62%", "Node.js 28%", "SQL 10%"],
    columnSpan: 2,
  },
  {
    icon: "▣",
    title: "Real-Time Developer Chat",
    description: "Wanna pair on the queue?",
    badgeLabel: "Yes! npm i bullmq",
    columnSpan: 2,
  },
  {
    icon: "♢",
    title: "Zero Spam",
    description:
      "Verified GitHub & Google OAuth authentication keeps bots and recruiters gone-wild out — real developers only.",
    tags: ["GitHub OAuth", "Google OAuth"],
    columnSpan: 3,
  },
];

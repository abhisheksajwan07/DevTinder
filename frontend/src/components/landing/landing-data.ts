export type FeatureCard = {
  title: string;
  description: string;
};

export const featureCards: FeatureCard[] = [
  {
    title: "1. Sync GitHub & Featured Repos",
    description:
      "Optionally connect GitHub after creating your profile. Our sync worker imports public repositories, languages, and star counts.",
  },
  {
    title: "2. Voyage AI & pgvector Matching",
    description:
      "Our AI vector pipeline calculates cosine similarities across tech stacks and project history to match you with ideal coding partners.",
  },
  {
    title: "3. Real-Time Pair Chat & Connect",
    description:
      "Match, connect, and collaborate with instant Socket.IO messaging, live typing indicators, and presence status.",
  },
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
    name: "Alex",
    avatar: "A",
    role: "Senior Backend Engineer",
    matchScore: 94,
    badges: ["TypeScript", "Node.js", "Redis", "BullMQ", "PostgreSQL"],
    repos: [
      { name: "devtinder-engine", stack: "TypeScript", stars: "24" },
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
      { label: "Get Started", href: "#demo" },
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
    title: "Get Started",
    items: [
      { label: "Sign In", href: "/signin" },
      { label: "Create Account", href: "/signup" },
      { label: "GitHub Integration", href: "/signup" },
    ],
  },
];

export type MatchCard = {
  title: string;
  description: string;
  details?: string;
  badgeLabel?: string;
  tags?: string[];
  repositories?: { name: string; language: string | null; stars: number }[];
  codeSnippet?: string;
  columnSpan?: number;
};

export const matchCards: MatchCard[] = [
  {
    title: "AI Vector Match Precision",
    description:
      "pgvector cosine similarity ranks candidates by tech stack compatibility and project history.",
    details: "cosine_sim = 0.94",
    codeSnippet: `SELECT profile_id, 1 - (embedding <=> $query) AS score\nFROM profile_embeddings ORDER BY score DESC LIMIT 10;`,
    columnSpan: 3,
  },
  {
    title: "Featured GitHub Repos",
    description:
      "Your top synced repositories include the same details DevTinder stores: language and star count.",
    repositories: [
      { name: "devtinder-api", language: "TypeScript", stars: 24 },
      { name: "matching-worker", language: "Node.js", stars: 15 },
      { name: "profile-search", language: "Python", stars: 8 },
    ],
    columnSpan: 2,
  },
  {
    title: "Real-Time Pair Chat",
    description:
      "Connect and chat immediately with typing indicators, online presence, and message history.",
    badgeLabel: "Online Now",
    columnSpan: 2,
  },
  {
    title: "Verified Developer Profiles",
    description:
      "Secure GitHub & Google OAuth ensures authentic developer identities — no recruiters, no spam bots.",
    tags: ["GitHub OAuth", "Google OAuth", "Voyage AI"],
    columnSpan: 3,
  },
];

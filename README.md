# DevTinder

[![CI](https://github.com/abhisheksajwan07/DevTinder/actions/workflows/ci.yml/badge.svg)](https://github.com/abhisheksajwan07/DevTinder/actions/workflows/ci.yml)

<p align="center">
  <img src="docs/assets/images/DevTinder.png" alt="DevTinder Preview" width="100%" />
</p>

DevTinder is a full-stack networking application for developers. It combines a swipe-style discovery experience with developer profiles, optional GitHub data, semantic recommendations, connection requests, and private real-time conversations.

## Highlights

- Guided onboarding captures role, experience, availability, skills, interests, collaboration goals, avatar, and an optional GitHub connection.
- A personalized feed uses stored profile embeddings to rank completed profiles by similarity and excludes profiles either participant has already acted on.
- Connection requests can be accepted or rejected. Acceptance is processed asynchronously into a match and private conversation.
- Real-time messaging includes presence, typing indicators, read receipts, keyset cursor pagination for message history, offline email notifications, and membership checks.
- Authentication supports email/password plus Google and GitHub OAuth, with email verification, password reset, session management, and selective or global session revocation.
- GitHub profile and repository data can be synchronized in the background; users can feature up to three repositories.

## Architecture

### Layered Backend Architecture

The Express API is organized by feature. Routes compose the middleware relevant to an endpoint; controllers translate HTTP concerns; services implement use cases; repositories own database and Redis access. Validators sit at the route boundary, and dependency modules assemble concrete service/repository instances.

```mermaid
flowchart LR
    R[HTTP request] --> RT[Feature route]
    RT --> M[Middleware<br/>auth · CSRF · onboarding<br/>rate limiting · no-cache]
    M --> V[Zod validation]
    V --> C[Controller]
    C --> S[Service]
    D[Dependencies<br/>service + repository wiring] -.-> S
    D -.-> RP[Repository]
    S --> RP
    RP --> PG[(PostgreSQL + pgvector)]
    RP --> RD[(Redis)]
    S --> Q[BullMQ queue]

    style RT fill:#f5f3ff,stroke:#7c3aed
    style S fill:#fff7ed,stroke:#ea580c
    style RP fill:#eff6ff,stroke:#2563eb
```

Feature modules cover auth, sessions, OAuth, onboarding, feed, swipes, matches, chat, GitHub, profiles, and Socket.IO. Cross-cutting middleware adds Helmet, CORS, structured HTTP logging, metrics, error handling, and Redis-backed limits.

### System Architecture

```mermaid
flowchart TB
    B[Browser] -->|HTTPS / REST| NX[Nginx<br/>static React build + TLS termination]
    B <-->|Socket.IO| NX
    NX -->|/v1 and /admin| API[Express API]
    NX <-->|/socket.io WebSocket upgrade| API

    API --> PG[(PostgreSQL 17<br/>Drizzle ORM + pgvector)]
    API --> RD[(Redis 8<br/>sessions · limits · presence · queues)]
    API --> Q[BullMQ queues]
    Q --> W[Worker process]
    W --> PG
    W --> RD
    W --> VOY[Voyage AI<br/>embeddings]
    W --> GH[GitHub API]
    W --> RE[Resend]

    PR[Prometheus] -->|scrapes /metrics| API
    GR[Grafana] --> PR
```

The React 19/Vite client uses React Query for server state, Zustand for auth state, route guards for public, verified, onboarding, and authenticated areas, and Socket.IO hooks for chat. Nginx serves the production build and proxies REST, Bull Board in non-production, and Socket.IO traffic to the API.

### Background Jobs

BullMQ keeps external I/O and post-request work out of latency-sensitive handlers. The API and worker run as separate Compose services and share Redis queues.

```mermaid
flowchart LR
    API[Express API] --> Q{BullMQ / Redis}
    Q --> EW[Email worker]
    Q --> GW[GitHub sync worker]
    Q --> VW[Embedding worker]
    Q --> MW[Matching worker]

    EW --> RS[Resend<br/>verification OTP · password reset<br/>offline message alert]
    GW --> GA[GitHub API]
    GW --> PG[(PostgreSQL)]
    GW --> VW
    VW --> VA[Voyage AI]
    VW --> PG
    MW --> PG
    MW --> MC[Create match + conversation]
```

- **Embeddings:** onboarding/profile changes enqueue a job. The worker builds a profile corpus, requests a 1,024-dimensional Voyage embedding, and stores it in pgvector. An embedding version check prevents an older job from replacing newer profile data.
- **GitHub sync:** the worker fetches the GitHub profile and repositories, stores the result, then queues a fresh embedding. Manual sync has a Redis per-profile cooldown to prevent duplicate external calls.
- **Email:** verification OTP, password-reset delivery, and offline chat message alerts run through Resend. Offline alerts check recipient presence in Redis and use a deduplicated job ID to prevent notification spam. Reset jobs carry an idempotency key so retries represent the same send attempt.
- **Matching:** accepting a pending connection queues match and conversation creation, with exponential retry configuration on the queue.

### Production and CI/CD Architecture

```mermaid
flowchart LR
    PUSH[Push to main] --> CI[GitHub Actions]
    CI --> CHECK[Install · migrate · seed<br/>typecheck · tests · build]
    CHECK --> IMG[Build server + frontend images]
    IMG --> GHCR[GHCR<br/>commit-SHA tags]
    GHCR --> VPS[Azure VPS]
    VPS --> DC[Docker Compose]

    DC --> NG[Nginx / React]
    DC --> API[API]
    DC --> WK[Worker]
    DC --> PG[(PostgreSQL + pgvector)]
    DC --> RD[(Redis)]
    DC --> PM[Prometheus]
    DC --> GF[Grafana]
```

On a successful push to `main`, GitHub Actions runs the server checks against PostgreSQL and Redis, builds the server and frontend images, and publishes both to GHCR using the commit SHA as the image tag. The deploy job connects to the VPS, pulls deployment configuration and images, runs Compose (including migrations), then checks `/health`. A manual rollback workflow redeploys a specified known-good SHA-tagged image.

### Important Request and Data Flows

#### Authentication and sessions

```mermaid
sequenceDiagram
    participant U as Browser
    participant A as API
    participant P as PostgreSQL
    participant R as Redis
    U->>A: Sign in / OAuth callback
    A->>P: Create or validate user + session
    A-->>U: Access + refresh cookies, CSRF token
    U->>A: Authenticated request
    A->>R: Check access-session blocklist
    A-->>U: Protected response
    U->>A: Refresh or revoke session
    A->>P: Rotate refresh hash / mark session revoked
    A->>R: Blocklist current access session until expiry
```

Passwords are bcrypt hashes. Refresh tokens are stored as hashes and rotated; state-changing cookie flows require a matching CSRF cookie/header. Route-specific limits, account lockout after repeated failed sign-ins, and AES-256-GCM encryption for stored OAuth tokens provide additional layers of protection.

#### Feed and embedding lifecycle

```mermaid
sequenceDiagram
    participant U as Developer
    participant A as API
    participant Q as BullMQ
    participant W as Embedding worker
    participant V as Voyage AI
    participant P as PostgreSQL + pgvector
    U->>A: Complete or update profile
    A->>Q: Enqueue embedding job
    Q->>W: Process profile
    W->>V: Generate embedding from profile corpus
    W->>P: Store ready vector if version still matches
    U->>A: GET /v1/feed
    A->>P: HNSW cosine-distance query + interaction exclusion
    A-->>U: Up to 10 ranked profiles, or preparing state
```

The feed only considers ready embeddings and completed profiles. It uses pgvector cosine-distance ordering with an HNSW index and indexed `NOT EXISTS` checks in both directions to exclude previous profile actions.

#### Real-time chat

```mermaid
sequenceDiagram
    participant C as Client
    participant N as Nginx
    participant S as Socket.IO / API
    participant R as Redis
    participant P as PostgreSQL
    participant Q as BullMQ
    C->>N: Socket.IO connection with access cookie
    N->>S: WebSocket upgrade
    S->>P: Validate session and resolve profile
    S->>R: Track socket presence
    C->>S: Join conversation
    S->>P: Verify conversation membership
    C->>S: Send message / read / typing
    S->>P: Persist message or read state
    S-->>C: Emit to conversation room & recipient profile
    S->>R: Check recipient online status
    opt Recipient is offline
        S->>Q: Enqueue deduplicated email alert
    end
```

Each socket authenticates from the access-token cookie. A client must pass membership validation before it can join a conversation; send, read, and typing events require that joined room. Redis tracks multiple socket IDs per profile so presence remains accurate across tabs. When a new message arrives for an offline participant, the socket handler triggers a background BullMQ job to notify the recipient via email without blocking the socket acknowledgment.

## Core Engineering Decisions

### Semantic recommendations without a blocking request path

Embedding generation happens in a dedicated worker rather than during onboarding or profile updates. This keeps writes responsive and makes the UI’s explicit feed-preparing state meaningful. The versioned update guards against stale job output, while the query remains bounded to ten candidates.

### Explicit async boundaries

Jobs handle email, GitHub synchronization, embeddings, and match/conversation creation. The design keeps HTTP handlers focused on request validation and durable state changes, while retries, concurrency, and provider-specific pacing live with the worker.

### Security designed into normal flows

The project layers cookie-based access control, hashed and rotating refresh tokens, revocation blocklists, CSRF checks, CORS origin allowlisting, Helmet, rate limits, account lockout, and encrypted OAuth token storage. The same session validity is checked when a Socket.IO connection is established.

### Chat authorization and resilient delivery

Conversation access is verified in the API and again when joining a socket room. Messages are persisted before broadcast; participants not currently in the active conversation room still receive a targeted profile-room event so their global conversation list can update unread counters, while avoiding redundant emissions to the sender. When a message is sent to an offline recipient, an out-of-band notification job is enqueued in BullMQ with a stable job ID (`notify-{profileId}`) to prevent email flooding while keeping socket acknowledgments sub-millisecond.

### Keyset cursor pagination and scroll stabilization

Both conversation lists and message histories use keyset cursor pagination (`cursor`, `limit`) backed by composite indexes rather than offset-based queries, preventing performance degradation on high-volume conversations. The React client pairs `useInfiniteQuery` with a top-sentinel `IntersectionObserver` and scroll-height delta compensation, prepending older message chunks without layout shifts or viewport jumpiness.

## Tech Stack

| Area                   | Implementation                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------- |
| Client                 | React 19, TypeScript, Vite, React Router, Tailwind CSS, React Query, Zustand, React Hook Form, Zod |
| API                    | Node.js, TypeScript, Express 5, Zod, Pino                                                          |
| Data                   | PostgreSQL 17, pgvector, Drizzle ORM and migrations                                                |
| Realtime and jobs      | Socket.IO, Redis 8, BullMQ                                                                         |
| Integrations           | Google OAuth, GitHub OAuth/API, Resend, Voyage AI embeddings                                       |
| Quality and operations | Vitest, Supertest, k6, Docker Compose, Nginx, Prometheus, Grafana, GitHub Actions, GHCR            |

## Screenshots

The repository currently contains operational and performance captures rather than curated happy-path product screenshots. The images below document the running system without implying unavailable UI states.

### Monitoring

![Grafana API dashboard showing request rate and p95 latency](docs/assets/images/grafana-request-rate.png)
![Grafana API monitoring overview dashboard](docs/assets/images/grafana-api-dashboard.png)

### Performance

![k6 feed-load result](docs/performance/images/feed-k6-final.png)

## Testing and Performance

- **Automated tests:** Vitest unit tests cover password and auth utilities plus auth, CSRF, and onboarding middleware. Supertest integration tests exercise auth, onboarding, and feed flows against PostgreSQL and Redis.
- **CI:** the server workflow installs dependencies, applies migrations, seeds reference data, type-checks, tests, and builds before images are published.
- **Load testing:** k6 scenarios cover smoke, authentication, authentication stress, and feed load. The feed baseline used 50 test users, 5,000 candidates, and 10,000 profile actions. At 200 virtual users it recorded about 34.3 requests/sec, 16.26 ms p95, and 0% failed requests.

Those figures are reproducible local baselines, not a production capacity promise. The [feed report](docs/performance/feed.md) documents the dataset, HNSW query plan, and results; the [login report](docs/performance/login.md) documents the bcrypt/CPU-bound login stress tests.

## Production and Monitoring

Production runs the frontend, API, worker, migration job, PostgreSQL, Redis, Prometheus, and Grafana with Docker Compose. Nginx serves the client, terminates TLS, proxies `/v1/` and `/socket.io/`, and handles the ACME challenge path. The API exposes `/health` for process liveness and `/ready` for PostgreSQL/Redis readiness; Prometheus scrapes `/metrics`, and Grafana visualizes request rate and latency.

For VPS provisioning, environment setup, certificates, deployment, rollback, and troubleshooting, see [the deployment runbook](docs/deployment-runbook.md). Keep environment files and credentials out of version control.

## Run Locally

### Prerequisites

- Node.js 24+ and npm
- Docker Desktop, recommended for PostgreSQL and Redis
- Provider credentials only for features you intend to use: email, OAuth, GitHub sync, and embeddings

### Docker Compose

```bash
cd server
cp .env.example .env
# Edit .env with local, non-production values; keep it uncommitted.
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

The API is available on `http://localhost:3000`, PostgreSQL is mapped to `localhost:5434`, Redis to `localhost:6379`, and the Nginx-served client to `http://localhost`.

In another terminal, apply the schema and seed the required reference data:

```bash
cd server
npm install
npm run db:migrate
npm run db:seed:reference
```

### Run client and server directly

Use this when PostgreSQL and Redis are already running locally.

```bash
# Terminal 1
cd server
cp .env.example .env
npm install
npm run dev

# Terminal 2
cd frontend
cp .env.example .env
npm install
npm run dev
```

The Vite client defaults to `http://localhost:5173`; configure server origins and connection URLs through the supplied example environment files. Start `npm run worker` in `server` to process queues.

### Checks

```bash
cd server
npm run typecheck
npm test

cd ../frontend
npm run lint
npm run build
```

## Project Structure

```text
frontend/                         React client: routes, pages, components, hooks, API services
server/
  src/module/                     Feature modules: routes, controllers, services, repositories, validators
  src/middleware/                 Auth, CSRF, onboarding, validation, rate limits, metrics, errors
  src/queues/                     BullMQ queue definitions
  src/workers/                    Email, embedding, GitHub sync, and matching processors
  src/module/socket/              Socket.IO setup, authentication, and chat events
  src/db/                         Drizzle schema, migrations, seeds, and scripts
  src/__tests__/                  Vitest unit, middleware, and integration tests
  k6/                             Smoke and load-test scenarios
  docker-compose*.yml             Local, development, k6, and production services
docs/
  performance/                    Reproducible feed and login test reports
  deployment-runbook.md           Deployment and rollback runbook
```

## Lessons Learned

- Search performance needs production-shaped data: vector search was tested with candidate profiles and prior interaction records, not an empty feed.
- CPU-bound bcrypt work makes authentication capacity dependent on CPU and Node.js worker-pool configuration; repeatable k6 tests made that constraint visible.
- Background jobs improve request latency but demand explicit state transitions, idempotent job IDs, retry behaviour, and observability.
- Health and readiness are distinct: the API separately reports process health and database/Redis availability.

## Future Improvements

- Add end-to-end browser tests and client-side test coverage.
- Add a Socket.IO adapter before scaling real-time delivery across multiple API instances.
- Extend monitoring with alerting, queue-depth and worker-failure dashboards, and centralized logs.
- Evolve recommendation quality with explicit feedback signals and offline relevance evaluation.
- Add curated, happy-path product screenshots and a public demo when those assets are available.

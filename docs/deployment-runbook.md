# DevTinder — Deployment Runbook


> **Note:** This documentation was written from personal notes during a first-time production deployment. Some steps, commands, or edge cases may be incomplete or slightly off. Treat it as a practical reference, not a guaranteed source of truth — always verify against official docs when something doesn't work.
---

## Architecture

```text
git push main
      ↓
GitHub Actions
      ↓
CI
  npm ci
  migrations
  seed
  typecheck
  tests
  build
      ↓
Build Docker images
      ↓
Push images → GHCR
      ↓
SSH → VPS
      ↓
git pull (deployment config)
      ↓
docker login GHCR
      ↓
docker compose pull
      ↓
docker compose up -d
      ↓
migration
      ↓
health check
```

Rollback:

```text
GitHub Actions
      ↓
Manual Rollback workflow
      ↓
Enter known-good commit SHA
      ↓
VPS pulls that GHCR image
      ↓
Compose redeploy
      ↓
Health check
```

### Mental Model

```text
Git        → source code + deployment config
GHCR       → built application images (immutable, tagged by commit SHA)
Compose    → defines how services run
VPS        → runs the selected image version
```

---

## 0. Compose Services Overview

Before starting, understand what each Compose file contains and which steps are one-time vs repeated.

### What runs in each file

`server/docker-compose.yml` — base services (used in all environments):

| Service    | Role                                  |
| ---------- | ------------------------------------- |
| postgres   | PostgreSQL database                   |
| redis      | Redis for sessions, queues, rate limits |
| api        | Express backend                       |
| worker     | BullMQ background job processor       |
| frontend   | React app served by Nginx             |

`server/docker-compose.prod.yml` — production overrides:

| Service    | What it overrides / adds                          |
| ---------- | ------------------------------------------------- |
| migration  | Runs `dist/db/migrate.js` before API starts       |
| api        | Uses GHCR image instead of local build            |
| worker     | Uses GHCR image instead of local build            |
| frontend   | Uses GHCR image, exposes 80+443, mounts certs     |
| prometheus | Scrapes `/metrics` from the API                   |
| grafana    | Dashboards for request rate and latency           |

Both files are always passed together in production:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml <command>
```

### One-time vs repeated steps

| Step | When |
| ---- | ---- |
| VM provisioning, swap, Docker install | Once |
| Clone repo, configure SSH deploy key | Once |
| SSL certificate bootstrap | Once per domain |
| `.env` setup | Once (update only when values change) |
| `docker compose up -d` | Every deployment |
| Migrations | Every deployment (skips already-applied ones) |
| Seed reference data | Initial deployment only |
| DB backup | Before every migration or risky change |

---

## 1. VPS Provisioning (Azure)

### 1.1 Create the VM

- Use a D-series VM with a production environment.
- Resource group: `rg-devtinder-prod-in`.

### 1.2 Set a budget alert

Azure Portal → Cost Management + Billing → Cost Management → Budgets → + Add.

| Field           | Value                            |
| --------------- | -------------------------------- |
| Reset period    | Monthly                          |
| Creation date   | September 2026 (current month)   |
| Expiration date | October 11, 2026 (Azure default) |
| Amount          | ~$225 (≈ ₹19k credit threshold)  |

Alert thresholds: 50%, 75%, 90%, 100% — all via email.

> **Note:** The $225 budget is a monitoring threshold only — it does not mean ₹19k spend is permitted.

### 1.3 First SSH connection

From the folder containing the `.pem` file provided during VM setup:

```bash
ssh -i .\vm-devtinder_key.pem azureuser@<VM_PUBLIC_IP>
```

**Windows — fix PEM permissions (if SSH refuses the key):**

```powershell
$key = "vm-devtinder_key.pem"
icacls.exe $key /reset
icacls.exe $key /GRANT:r "$($env:USERNAME):(R)"
icacls.exe $key /inheritance:r
```

**Linux/macOS:**

```bash
chmod 400 vm-devtinder_key.pem
```

### 1.4 Initial VPS setup

```bash
sudo apt update && sudo apt upgrade -y
```

Verify resources:

```bash
nproc        # vCPUs (expect 2)
free -h      # RAM
```

### 1.5 Create swap

Swap gives Linux an emergency buffer so it doesn't immediately hit an out-of-memory situation.

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

The `fstab` entry makes swap persist across reboots.

Verify: `free -h`

### 1.6 Install Docker

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker
```

- `usermod` — adds current user to the docker group (no `sudo` needed for Docker after this).
- `newgrp` — applies the group change immediately without re-login.

![Deployment setup](assets/images/Pasted%20image%2020260917135537.png)

Clean up any test containers before deploying:

```bash
docker ps -a && docker images
docker system prune -f
```

### 1.7 Clone the project

```bash
mkdir ~/app
cd ~/app
git clone <REPO_URL> DevTinder
```

GitHub will ask for username and a Personal Access Token (later replaced by a deploy key — see §5.2).

### 1.8 Configure the environment

```bash
cd ~/app/DevTinder/server
nano .env
```

Paste the production `.env` contents from your local repo. Required keys:

```env
# App
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://<user>:<password>@postgres:5432/<dbname>
POSTGRES_USER=<user>
POSTGRES_PASSWORD=<password>
POSTGRES_DB=<dbname>

# Redis
REDIS_URL=redis://:<password>@redis:6379

# Auth
JWT_ACCESS_SECRET=<secret>
JWT_REFRESH_SECRET=<secret>
CSRF_SECRET=<secret>
SESSION_SECRET=<secret>

# OAuth
GOOGLE_CLIENT_ID=<id>
GOOGLE_CLIENT_SECRET=<secret>
GITHUB_CLIENT_ID=<id>
GITHUB_CLIENT_SECRET=<secret>

# Email
RESEND_API_KEY=<key>
RESEND_FROM_EMAIL=<email>

# App URL (update after domain is set)
APP_URL=https://<your-domain>
FRONTEND_URL=https://<your-domain>

# Logging
LOG_LEVEL=info
LOG_PRETTY=false

# k6
ENABLE_LOAD_TEST=false
```

> **Important:** Do **not** change `POSTGRES_PASSWORD` after the database volume has been initialized. The password set on first `docker compose up` is what PostgreSQL uses — changing it in `.env` later will cause authentication failures. See §12 for details.

### 1.9 Remove exposed API ports from docker-compose

Before running Compose, remove any ports the API service is directly exposing from `docker-compose.yml`. Nginx (inside Compose) talks to the API directly via Docker service names — the API does not need to be publicly exposed.

```bash
nano docker-compose.yml
```

### 1.10 Network security (Azure NSG)

Open inbound ports:

| Port | Purpose |
| ---- | ------- |
| 80   | HTTP    |
| 443  | HTTPS   |

> **Do not expose** Grafana (3001), Prometheus (9090), or any internal service ports publicly.

---

## 2. Domain & DNS

Add a DNS `A` record pointing to the VM public IP.

For a subdomain:

| Type | Name          | Value            |
| ---- | ------------- | ---------------- |
| A    | `<subdomain>` | `<VM_PUBLIC_IP>` |

After adding the DNS record:

- Update `nginx.prod.conf` `server_name` with the domain.
- Update `APP_URL` and `FRONTEND_URL` in `.env` with the domain.
- Update OAuth provider callback URLs (Google, GitHub) to match the new domain.
- Update Resend.dev with the verified sending domain.

---

## 3. SSL / HTTPS (Let's Encrypt via Certbot)

### 3.1 Create Certbot directories

From the `server` directory:

```bash
mkdir -p certbot/conf certbot/www/.well-known/acme-challenge
```

Add `certbot/` to `server/.dockerignore`. Do this locally and commit it — if you do it directly on the VPS, it will cause a `git pull` conflict later.

### 3.2 Nginx configuration files

```text
frontend/
├── nginx.conf          ← local development
└── nginx.prod.conf     ← production (HTTPS, reverse proxy)
```

The frontend Dockerfile selects the config at build time:

```dockerfile
ARG NGINX_CONFIG=nginx.conf
COPY ${NGINX_CONFIG} /etc/nginx/conf.d/default.conf
EXPOSE 80
EXPOSE 443
```

### 3.3 Production frontend in Docker Compose

`docker-compose.prod.yml`:

```yaml
frontend:
  # image: set by GHCR (see §6)
  restart: unless-stopped
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./certbot/www:/var/www/certbot
    - ./certbot/conf:/etc/letsencrypt:ro
  depends_on:
    api:
      condition: service_healthy
```

Certificate directory is mounted **read-only** — Nginx only needs to read the certificate and private key.

### 3.4 First-time SSL bootstrap

**Step 1 — Temporary HTTP-only Nginx config:**

Save the final HTTPS config somewhere safe, then use this temporary config:

```nginx
server {
    listen 80;
    server_name devtinder.abhishekbytes.space;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

The SSL certificate doesn't exist yet, so the initial config must be HTTP-only. Once the certificate exists, replace with the final HTTPS config.

Build and start frontend:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend
```

**Step 2 — Verify webroot:**

```bash
echo "hello-certbot" > certbot/www/.well-known/acme-challenge/test.txt
curl http://localhost/.well-known/acme-challenge/test.txt
# Expected: hello-certbot
rm certbot/www/.well-known/acme-challenge/test.txt
```

This confirms the full path is working:

```text
Internet → Azure VM :80 → Docker :80 → Nginx → /var/www/certbot → certbot/www/
```

**Step 3 — Obtain certificate:**

```bash
docker run --rm \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  certbot/certbot certonly \
  --webroot \
  --webroot-path /var/www/certbot \
  -d devtinder.abhishekbytes.space \
  --email YOUR_EMAIL \
  --agree-tos \
  --no-eff-email
```

Certificate files:

```text
certbot/conf/live/devtinder.abhishekbytes.space/
├── fullchain.pem
└── privkey.pem
```

**Step 4 — Restore the final HTTPS config:**

```nginx
server {
    listen 80;
    server_name devtinder.abhishekbytes.space;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl;
    server_name devtinder.abhishekbytes.space;

    ssl_certificate /etc/letsencrypt/live/devtinder.abhishekbytes.space/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devtinder.abhishekbytes.space/privkey.pem;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    location /v1/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /admin/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://api:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
}
```

**Step 5 — Rebuild frontend:**

Because the Nginx config is copied into the Docker image at build time, the frontend must be rebuilt after changing the config:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build frontend
```

### 3.5 Traffic flow

```text
HTTP :80
   ↓
ACME challenge → Certbot
   OR
301 redirect → HTTPS

HTTPS :443
   ↓
Nginx TLS termination
   ↓
React frontend
   ├── /v1/       → API
   ├── /admin/    → API
   └── /socket.io → API (WebSocket upgrade)
```

SSL certificates are **bind-mounted**, not copied into the Docker image. This keeps private keys outside the image and allows independent renewal.

> The HTTP-only config is a one-time SSL bootstrap step. Future deployments use the normal production HTTPS config directly.

### 3.6 Certificate renewal

Let's Encrypt certificates expire after **90 days**. Renew before expiry:

```bash
# Test renewal (dry run — no changes made)
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot renew --dry-run

# Actual renewal
docker run --rm \
  -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
  -v "$(pwd)/certbot/www:/var/www/certbot" \
  certbot/certbot renew
```

After renewal, reload Nginx to pick up the new certificate:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec frontend nginx -s reload
```

> Renewal requires port 80 to be reachable by Let's Encrypt and the ACME challenge location to still be present in your Nginx config — which it is in the final production config.

---

## 4. CI Pipeline (GitHub Actions)

### 4.1 Workflow file

```text
.github/workflows/ci.yml
```

Trigger: push to `main`.

### 4.2 Runner setup

```yaml
- uses: actions/checkout@v4
- uses: actions/setup-node@v4
  with:
    node-version: 26
    cache: npm
    cache-dependency-path: server/package-lock.json
```

Working directory default: `server`.

### 4.3 CI services

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg17
    env:
      POSTGRES_DB: devtinder_test
      POSTGRES_USER: ci_user
      POSTGRES_PASSWORD: ci_password
    ports:
      - 5432:5432
    options: >-
      --health-cmd "pg_isready -U ci_user -d devtinder_test"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 10

  redis:
    image: redis:8-alpine
    ports:
      - 6379:6379
    options: >-
      --health-cmd "redis-cli ping"
      --health-interval 10s
      --health-timeout 5s
      --health-retries 10
```

These containers exist only for the duration of the GitHub Actions job.

### 4.4 CI environment variables

Use test-only values — never production `.env`:

```yaml
env:
  NODE_ENV: test
  DATABASE_URL: postgresql://ci_user:ci_password@localhost:5432/devtinder_test
  REDIS_URL: redis://localhost:6379/1
```

### 4.5 CI steps

```yaml
- name: Install dependencies
  run: npm ci

- name: Apply migrations
  run: npm run db:migrate

- name: Seed reference data
  run: npx --no-install tsx src/db/seeds/seed.prod.ts

- name: Typecheck
  run: npm run typecheck

- name: Tests
  run: npm test

- name: Build
  run: npm run build
```

Flow:

```text
checkout → Node 26 → npm ci → PostgreSQL + Redis
   → migration → seed → typecheck → tests → build
```

![Deployment verification](assets/images/Pasted%20image%2020260920192926.png)
### 4.6 GitHub Actions permissions

```yaml
permissions:
  contents: read
  packages: write
```

`${{ secrets.GITHUB_TOKEN }}` is automatically provided by GitHub Actions — do not create it manually.

---

## 5. SSH Authentication

### 5.1 GitHub Actions → VPS (deployment)

Create a dedicated key pair — do **not** reuse the Azure `.pem`:

```bash
ssh-keygen -t ed25519 -C "github-actions-devtinder"
# e.g. save to: C:\Users\<you>\.ssh\github-actions-devtinder
```

- Private key → GitHub repository secret: `VPS_SSH_PRIVATE_KEY`
- Public key → append to VPS `~/.ssh/authorized_keys`

Pre-checks before adding the key:

| Check                    | Command                                            | Why                          |
| ------------------------ | -------------------------------------------------- | ---------------------------- |
| Existing authorized_keys | `cat ~/.ssh/authorized_keys`                       | Don't overwrite, only append |
| PubkeyAuthentication     | `grep PubkeyAuthentication /etc/ssh/sshd_config`   | Must be `yes`                |
| Existing local keys      | `ls ~/.ssh/`                                       | Don't overwrite existing keys |

Fix permissions on VPS after appending:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

Test the key from your machine before adding it to GitHub:

```powershell
ssh -i "$env:USERPROFILE\.ssh\github-actions-devtinder" azureuser@<VPS_IP>
```



### 5.2 VPS → GitHub (git pull via deploy key)

The initial clone used HTTPS + a GitHub PAT. This was replaced with an SSH deploy key — PATs expire and HTTPS credentials can be accidentally stored in Git config.

Generate a key on the VPS:

```bash
ssh-keygen -t ed25519 -C "devtinder-vps"
# Save to: /home/azureuser/.ssh/github_deploy
```

Add the public key to GitHub repo → Settings → Deploy keys (read-only, no write access needed).

```bash
cat ~/.ssh/github_deploy.pub
```

Configure SSH on the VPS:

```bash
# ~/.ssh/config
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    IdentitiesOnly yes
```

Test authentication:

```bash
ssh -T git@github.com
# Expected: Hi <username>! You've successfully authenticated...
```

Change the remote from HTTPS to SSH:

```bash
git remote set-url origin git@github.com:<username>/DevTinder.git
git remote -v   # verify
```

Test Git itself can use the new auth — `fetch` downloads remote info without changing working files:

```bash
git fetch origin
```

![Deployment rollback](assets/images/Pasted%20image%2020260920223511.png)

Once `fetch` passes, test the actual production update operation:

```bash
git pull --ff-only origin main
```

```text
git fetch → "Can VPS talk to GitHub and see updates?"
git pull  → "Can VPS actually update its code?"
```



### 5.3 GitHub repository secrets

| Secret                | Purpose                                                   |
| --------------------- | --------------------------------------------------------- |
| `VPS_HOST`            | VPS IP address                                            |
| `VPS_USER`            | SSH username (`azureuser`)                                |
| `VPS_SSH_PRIVATE_KEY` | Dedicated CI/CD private key (include `BEGIN`/`END` lines) |
| `GHCR_USERNAME`       | GitHub username (for VPS → GHCR pull)                     |
| `GHCR_TOKEN`          | GitHub PAT with `read:packages` scope                     |

> **Why a separate GHCR token for the VPS?** `GITHUB_TOKEN` belongs to the GitHub Actions runner — it doesn't exist on the VPS. The VPS needs its own credentials to pull private GHCR images.

---

## 6. GHCR (GitHub Container Registry)

### 6.1 Why GHCR

```text
Old:  VPS → git pull → Docker build → run
New:  GitHub Actions → Docker build → GHCR → VPS pulls ready-made image → run
```

- VPS no longer builds application images.
- Images are immutable and tied to Git commits.
- Rollback = deploying an older image (no rebuild).

### 6.2 Images in GHCR

```text
devtinder-server     ← used by api, worker, migration
devtinder-frontend
```

Postgres, Redis, Prometheus, Grafana use their own public images — they are **not** pushed to GHCR.

The backend image is reused by three services with different commands:

```text
api       → node dist/server.js
worker    → node dist/worker.js
migration → node dist/db/migrate.js
```

### 6.3 Image tagging

```yaml
env:
  IMAGE_TAG: ${{ github.sha }}
  REGISTRY: ghcr.io/${{ github.repository_owner }}
```

Example:

```text
ghcr.io/abhisheksajwan07/devtinder-server:8c9f5c250ba2048cc2c1f351911e8487d6845aea
ghcr.io/abhisheksajwan07/devtinder-frontend:8c9f5c250ba2048cc2c1f351911e8487d6845aea
```



Do not rely only on `latest` for production rollback. A Git SHA is an identifier, not a secret — it is safe to document.

### 6.4 Build & push jobs

**Backend:**

```yaml
build-and-push:
  needs: test
  steps:
    - uses: actions/checkout@v4
    - uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - uses: docker/build-push-action@v6
      with:
        context: ./server
        push: true
        tags: ${{ env.REGISTRY }}/devtinder-server:${{ env.IMAGE_TAG }}
```

**Frontend:**

```yaml
build-and-push-frontend:
  needs: test
  steps:
    - uses: actions/checkout@v4
    - uses: docker/login-action@v3
      with:
        registry: ghcr.io
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    - uses: docker/build-push-action@v6
      with:
        context: ./frontend
        push: true
        build-args: |
          NGINX_CONFIG=nginx.prod.conf
        tags: ${{ env.REGISTRY }}/devtinder-frontend:${{ env.IMAGE_TAG }}
```

The `NGINX_CONFIG` build argument is passed during the GitHub Actions build since the VPS no longer builds the frontend image.

### 6.5 CI dependency order

Deployment waits for CI and both image builds:

```yaml
needs:
  - test
  - build-and-push
  - build-and-push-frontend
```

```text
          ┌─ build server ──┐
test ─────┤                 ├──→ deploy
          └─ build frontend ┘
```

---

## 7. Docker Compose — Development vs Production

### Development

`server/docker-compose.yml` remains build-based:

```yaml
api:
  build: .

worker:
  build: .

frontend:
  build:
    context: ../frontend
```

Do **not** replace these with GHCR images.

### Production

`server/docker-compose.prod.yml` uses GHCR images:

```yaml
migration:
  image: ${REGISTRY}/devtinder-server:${IMAGE_TAG}

api:
  image: ${REGISTRY}/devtinder-server:${IMAGE_TAG}

worker:
  image: ${REGISTRY}/devtinder-server:${IMAGE_TAG}

frontend:
  image: ${REGISTRY}/devtinder-frontend:${IMAGE_TAG}
  container_name: devtinder-frontend
```

Production no longer uses `build:` or `--build`.

---

## 8. Production Deployment Script

The full deployment SSH script used by GitHub Actions:

```bash
set -e

# Login to GHCR
echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io \
  -u "${{ secrets.GHCR_USERNAME }}" \
  --password-stdin

# GitHub Actions env vars do not exist on the VPS — must be exported explicitly
export IMAGE_TAG="${{ github.sha }}"
export REGISTRY="ghcr.io/${{ github.repository_owner }}"

# Get latest Compose/configuration files
cd /home/azureuser/app/DevTinder
git pull --ff-only origin main

# Deploy the exact GHCR images
cd server

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  pull

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  up -d

# Verify API
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  exec -T api \
  wget -qO- http://localhost:3000/health

echo "Deployed: ${IMAGE_TAG}"
```



### Deployment safety

| Mechanism                            | Purpose                                                                |
| ------------------------------------ | ---------------------------------------------------------------------- |
| `set -e`                             | Stop on first failure — if `git pull` fails, Docker deployment does NOT happen |
| `timeout-minutes: 10`                | Prevent hung deployments                                               |
| `concurrency: production-deployment` | Prevent simultaneous deploys                                           |
| `cancel-in-progress: false`          | Don't cancel a running deployment                                      |



### Why `git pull` still exists

`git pull` fetches **deployment configuration** (Compose files, Nginx config), not application binaries. The VPS must have the updated Compose config before it can pull the correct images.

```text
git pull             → Compose/config files
docker compose pull  → Application images from GHCR
```

### Triggering CI without a code change

GitHub Actions won't trigger on a push with no diff. Use an empty commit:

```bash
git commit --allow-empty -m "ci: retrigger"
git push
```

---

## 9. Rollback

### 9.1 Rollback workflow

File: `.github/workflows/rollback.yml`

Triggered manually: GitHub → Actions → Rollback → Run workflow → Enter SHA.

![Rollback preparation](assets/images/Pasted%20image%2020260922000931.png)

```yaml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      image_tag:
        description: "SHA tag to rollback to"
        required: true
        type: string

env:
  REGISTRY: ghcr.io/${{ github.repository_owner }}

jobs:
  rollback:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Deploy previous image
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_PRIVATE_KEY }}
          script: |
            set -e

            echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io \
              -u "${{ secrets.GHCR_USERNAME }}" \
              --password-stdin

            export IMAGE_TAG="${{ inputs.image_tag }}"
            export REGISTRY="ghcr.io/${{ github.repository_owner }}"

            cd /home/azureuser/app/DevTinder/server

            docker compose \
              -f docker-compose.yml \
              -f docker-compose.prod.yml \
              pull

            docker compose \
              -f docker-compose.yml \
              -f docker-compose.prod.yml \
              up -d

            docker compose \
              -f docker-compose.yml \
              -f docker-compose.prod.yml \
              exec -T api \
              wget -qO- http://localhost:3000/health

            echo "Rolled back to: ${IMAGE_TAG}"
```

![GitHub Actions rollback job execution](assets/images/Pasted%20image%2020260922001007.png)

### 9.2 Why rollback is manual

You explicitly choose a known-good SHA. The workflow pulls and deploys those exact images. No rebuild is required.


![Rollback workflow](assets/images/Pasted%20image%2020260922001007.png)

### 9.3 Rollback does not change container names

```text
Before:  devtinder-frontend → frontend:8c9f5c
After:   devtinder-frontend → frontend:0be96b
```

The container name comes from Compose. The image tag determines the version.

![Rollback verification](assets/images/Pasted%20image%2020260922001147.png)


### 9.4 Database migrations during rollback

Rollback redeploys application images only. Database migrations are **not** automatically reversed. If a migration is destructive, restore from a database backup.

---

## 10. Drizzle Migrations

### 10.1 Generate vs migrate

| Command                    | What it does                               | Modifies DB? |
| -------------------------- | ------------------------------------------ | ------------ |
| `npx drizzle-kit generate` | Creates migration SQL from schema diff     | No           |
| `node dist/db/migrate.js`  | Applies pending migrations to the database | Yes          |

### 10.2 Production migration service

`docker-compose.prod.yml`:

```yaml
migration:
  image: ${REGISTRY}/devtinder-server:${IMAGE_TAG}
  command: node dist/db/migrate.js
```

The API depends on migration success:

```yaml
api:
  depends_on:
    migration:
      condition: service_completed_successfully
```

```text
Migration starts → Migration succeeds → API starts
Migration fails  → API does NOT start
```

![Production deployment](assets/images/Pasted%20image%2020260921001317.png)

### 10.3 Run migrations manually
This does **NOT** mean:

> "After every CI/CD deployment, SSH into VPS and run this."

It means:

> "If I deliberately need to execute the migration service independently, here's the command."

For example, it can be useful when **debugging a migration failure**.

Your normal deployment already runs the migration automatically through Compose.
```bash
docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  run --rm migration
```


### 10.4 Check applied migrations

```bash
docker compose exec postgres \
  psql -U devuser -d devtinder \
  -c 'SELECT * FROM drizzle.__drizzle_migrations;'
```

### 10.5 Architecture note

`drizzle-kit` is a `devDependency`. The production image uses `npm ci --omit=dev`, so `drizzle-kit` is **not** installed in production. Production runs `dist/db/migrate.js` using Drizzle ORM's runtime migration API — not `npx drizzle-kit migrate`.

### 10.6 Migration workflow

```text
Change schema
      ↓
drizzle-kit generate
      ↓
Migration SQL created
      ↓
Test locally / CI
      ↓
Backup production DB
      ↓
Deploy
      ↓
Production migration runs automatically
      ↓
Verify database
      ↓
Monitor logs
```

And add:

> **Note:** The production database backup is currently a manual safety step; it is not automatically performed by the CI/CD workflow.

That keeps the documentation accurately aligned with what you've actually implemented.
---

## 11. PostgreSQL Backup & Restore

### 11.1 Backup directory

```bash
mkdir -p ~/postgres-backups
```

### 11.2 Create a backup

`pg_dump` creates a logical backup. The `>` shell redirection writes the output to a file on the VM:
runs this command inside the devtinder-postgres conatiner , pg_dump create a logical backup  
to the file we mentioned

```bash
docker exec devtinder-postgres pg_dump -U devuser -d devtinder \
  > ~/postgres-backups/devtinder-$(date +%Y-%m-%d_%H-%M-%S).sql
```

### 11.3 Verify the backup

```bash
ls -lh ~/postgres-backups/
head -n 20 ~/postgres-backups/<backup-file>.sql
grep -E '^CREATE TABLE|^COPY ' ~/postgres-backups/<backup-file>.sql | head -20
```

### 11.4 Restore test

```bash
# Create a test database
docker exec devtinder-postgres \
  psql -U devuser -d postgres \
  -c "CREATE DATABASE devtinder_restore_test;"

# Restore into test database
# cat reads the backup file; pipe passes it to docker exec stdin (-i keeps stdin open)
cat ~/postgres-backups/<backup-file>.sql | \
  docker exec -i devtinder-postgres \
  psql -U devuser -d devtinder_restore_test

# Verify schema and migration records
docker exec devtinder-postgres \
  psql -U devuser -d devtinder_restore_test \
  -c "SELECT * FROM drizzle.__drizzle_migrations;"
```

---

## 12. Production DB Safety

- **Never change `POSTGRES_PASSWORD`** after the volume is initialized. The password is set only on first `docker compose up`. Changing it in `.env` later causes authentication failures because the volume still has the old password.
- Seed scripts should **not** run blindly on every production deployment — repeated seeds can cause duplicates.
- Take a DB backup before risky schema/data changes, especially migrations.
- If a migration fails, the migration container exits non-zero and the API will not start.
- Application rollback = deploy previous image version.
- Database rollback = restore from backup (harder — schema may have changed).
- Production flow: **Backup → Deploy → Migrate → Verify → Monitor**.

---

## 13. Monitoring — Prometheus & Grafana

### 13.1 Application metrics

`prom-client` exposes metrics at `GET /metrics`:

- `http_requests_total` — request count (labels: method, route, status_code)
- `http_request_duration_seconds` — request latency
- Node.js default process metrics

### 13.2 Prometheus

`prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "devtinder-api"
    static_configs:
      - targets: ["api:3000"]
```

Prometheus uses `api:3000` because containers communicate via Docker service names — not `localhost`.

### 13.3 Grafana

Access locally:

```text
http://localhost:3001
```

Data source: `http://prometheus:9090` (Docker internal — Grafana queries Prometheus through the Docker network, even when you access Grafana via SSH tunnel).

Dashboard: **DevTinder API Monitoring** — panels for Request Rate and Request Latency (p95).

![Deployment screenshot](assets/images/Screenshot%202026-09-19%20152811.png)

### 13.4 Production monitoring access

Grafana is **not** publicly exposed. Access via SSH tunnel:

```bash
ssh -i <pem-file> -L 3001:localhost:3001 <username>@<VPS_IP>
```

Then open `localhost:3001` in your browser.
![Deployment screenshot](assets/images/Screenshot%202026-09-19%20214908.png)


Production Compose override — bind to localhost only, not publicly:

```yaml
grafana:
  ports: !override
    - "127.0.0.1:3001:3000"
```



### 13.5 Redis memory

Check Redis memory usage:

```bash
docker exec devtinder-redis redis-cli -a "$REDIS_PASSWORD" INFO memory
```

Key metrics:

| Metric                | Meaning                              |
| --------------------- | ------------------------------------ |
| `used_memory`         | Redis allocated memory               |
| `used_memory_dataset` | Actual stored data                   |
| `used_memory_peak`    | Highest allocation so far            |
| `used_memory_rss`     | Memory Redis has from the OS         |
| `maxmemory`           | `0` = no limit set inside Redis      |
| `maxmemory_policy`    | `noeviction` = won't auto-evict keys |

> Redis was observed using ~91% of its 128 MB container memory limit. Investigate actual usage before increasing the limit.

### 13.6 VPS resource checks

```bash
free -h           # RAM
df -h             # Disk
uptime            # Load
docker stats      # Container resources
docker system df  # Docker disk usage
```

---

## 14. k6 Testing Policy

| Environment | `NODE_ENV`  | `ENABLE_LOAD_TEST` | Tests allowed          |
| ----------- | ----------- | ------------------- | ---------------------- |
| Local/test  | development | true                | Full load/stress tests |
| Production  | production  | false               | Lightweight smoke only |

Stress tests (`auth-stress.js`, `feed-load.js`) are **never** run against production because they generate high traffic and may trigger email, OAuth, or embedding work.

---

## 15. Logging

### Recommended production settings

```env
NODE_ENV=production
LOG_LEVEL=info
LOG_PRETTY=false
```

- `LOG_PRETTY=false` → structured JSON for automated log collection.
- `LOG_PRETTY=true` → formatted for human terminal reading (use temporarily when directly reading production logs).

HTTP logging serializes only: Request ID, method, URL, remote address, user-agent, status code, response time.

Pino redacts: authorization headers, cookies, `Set-Cookie`, access tokens, refresh tokens, CSRF tokens.

Restart or redeploy the server after changing environment variables. Existing logs are not reformatted retroactively — if an access token appeared in old logs, revoke or rotate the affected session.

---

## 16. Verification Commands

### Running containers

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

Expected:

```text
devtinder-frontend → ghcr.io/.../devtinder-frontend:<SHA>
devtinder-api      → ghcr.io/.../devtinder-server:<SHA>
devtinder-worker   → ghcr.io/.../devtinder-server:<SHA>
```


![Deployment screenshot](assets/images/Screenshot%202026-09-22%20001332.png)
### Container triage — if something is unhealthy or exited

```bash
# See exit code and last state
docker inspect <container-name> --format '{{.State.Status}} — exit {{.State.ExitCode}}'

# Check logs for the failing container
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=100 <service>

# Common first checks:
# api exited     → check migration ran, check .env DATABASE_URL, check postgres is healthy
# migration exit → check DB credentials, check drizzle migration files exist in image
# frontend exit  → check nginx.prod.conf syntax, check certbot certs are mounted
# worker exit    → check REDIS_URL, check BullMQ queue names match
```

### Exact image inspection

```bash
docker inspect devtinder-api --format '{{.Config.Image}}'
docker inspect devtinder-frontend --format '{{.Config.Image}}'
```

### GHCR images on VPS

```bash
docker images --format "{{.Repository}}:{{.Tag}}" | grep ghcr.io
```

### Compose resolved images

```bash
export IMAGE_TAG=<SHA>
export REGISTRY=ghcr.io/<username>

docker compose \
  -f docker-compose.yml \
  -f docker-compose.prod.yml \
  config --images
```

> If `IMAGE_TAG` or `REGISTRY` are not exported, Compose shows a "variable is not set" warning — this is not a deployment failure, only a configuration warning in interactive shells.

### Health checks

```bash
# API
docker compose -f docker-compose.yml -f docker-compose.prod.yml \
  exec -T api wget -qO- http://localhost:3000/health

# Prometheus
docker exec server-prometheus-1 wget -qO- http://localhost:9090/-/healthy

# Grafana
docker exec server-grafana-1 wget -qO- http://localhost:3000/api/health
```

### Logs

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs --tail=50 api
docker compose -f docker-compose.yml -f docker-compose.prod.yml logs frontend
```

### Deployed commit

```bash
cd ~/app/DevTinder
git rev-parse HEAD
git rev-parse origin/main
# Both should match
```

### VPS ahead/behind check

```bash
git log HEAD..origin/main --oneline
```

If this shows commits, the VPS is behind `origin/main` and needs a `git pull`.

### HTTPS verification (from your PC)

```bash
curl -I https://YOUR_DOMAIN
```

### Docker disk cleanup

```bash
docker system df
docker builder prune    # build cache only
docker image prune      # dangling images only
```

---

## 17. GHCR Storage & Cleanup

### Check GHCR packages

GitHub → Repository → Packages → `devtinder-server` / `devtinder-frontend`.

> GHCR storage (GitHub registry) and VPS Docker storage (`docker system df`) are separate — one does not reflect the other.

### Cleanup policy

GHCR cleanup is **intentionally not automated** yet. Old images may be needed for rollback. Add a retention policy (e.g., keep latest 5) only after defining rollback retention requirements.

---

## 18. Security Checklist

- [ ] No secrets hardcoded in workflow files
- [ ] GitHub secrets contain only what is necessary
- [ ] VPS SSH private key exists only in GitHub Secrets
- [ ] VPS → GitHub deploy key is read-only
- [ ] `.env` stays on VPS — never committed
- [ ] Production ports not unnecessarily exposed
- [ ] API ports not exposed directly in docker-compose (Nginx handles routing)
- [ ] Grafana/Prometheus not publicly accessible (SSH tunnel only)
- [ ] Private password set for Grafana in production

### Safe to document

```text
ghcr.io/<username>/devtinder-server:<SHA>
ghcr.io/<username>/devtinder-frontend:<SHA>
```

A Git SHA is an identifier, not a secret.

### Never commit or document

```text
GHCR_TOKEN, VPS_SSH_PRIVATE_KEY, DATABASE_PASSWORD,
REDIS_PASSWORD, JWT secrets, API keys, .env contents
```

---

## 19. Production Verification Flows

After deployment, verify these end-to-end:

- [ ] Frontend loads over HTTPS
- [ ] Normal authentication (email/password)
- [ ] Google OAuth
- [ ] GitHub OAuth
- [ ] Onboarding
- [ ] Feed (may take a few seconds — see deployment notes §8)
- [ ] Matching/swipes
- [ ] Chat and Socket.IO
- [ ] Worker/BullMQ jobs
- [ ] PostgreSQL connectivity
- [ ] Redis connectivity
- [ ] Prometheus metrics updating
- [ ] Grafana dashboard live

---

## 20. Final CI/CD Checklist

### CI

- [x] Push to `main` triggers CI/CD
- [x] `npm ci`
- [x] Migrations
- [x] Seed
- [x] Typecheck
- [x] Tests
- [x] Build
- [x] Concurrency protection

### Images

- [x] Backend Docker image
- [x] Frontend Docker image
- [x] Production Nginx build argument
- [x] SHA tags
- [x] GHCR authentication
- [x] GHCR push

### VPS Deployment

- [x] GHCR authentication
- [x] `IMAGE_TAG` exported
- [x] `REGISTRY` exported
- [x] `git pull` for deployment config
- [x] `docker compose pull`
- [x] No `--build`
- [x] Compose deploy
- [x] Migration
- [x] Health check
- [x] `set -e`
- [x] 10-minute timeout


![Deployment screenshot](assets/images/Screenshot%202026-09-22%20000353.png)
### Rollback

- [x] Manual `workflow_dispatch`
- [x] SHA input
- [x] Pull exact GHCR image
- [x] Redeploy
- [x] Health check
- [x] Rollback tested successfully

### Pending

- [ ] GHCR retention/cleanup policy
- [ ] Automated SSL certificate renewal

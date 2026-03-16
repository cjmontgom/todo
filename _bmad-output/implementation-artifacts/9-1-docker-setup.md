# Story 9.1: Docker Setup

Status: done

## Story

As a developer deploying the application,
I want Docker containers for frontend and backend,
so that the application can be started with a single `docker-compose up` command.

## Acceptance Criteria

1. **Given** the repository is cloned
   **When** `docker-compose up` is run
   **Then** the frontend, backend, and database start and the application is usable in the browser at `http://localhost:5173`

2. **Given** the Dockerfiles
   **When** inspected
   **Then** they use multi-stage builds, run as non-root users, and include health checks

3. **Given** the containers are running
   **When** `docker-compose logs` is run
   **Then** application logs are accessible (Fastify logs to stdout); health status is visible via `docker ps`

4. **Given** the docker-compose configuration
   **When** environment variables are reviewed
   **Then** dev/test environments are supported through environment variables (root-level `.env` for docker-compose overrides)

## Tasks / Subtasks

- [x] Task 1: Add `GET /api/health` endpoint to backend (AC: #2, #3)
  - [x] Add route in `backend/src/routes.ts` returning `{ status: 'ok' }` with HTTP 200
  - [x] Verify route is reachable at `http://localhost:3001/api/health` locally

- [x] Task 2: Create `backend/Dockerfile` (AC: #2)
  - [x] Stage 1 (build): `node:20-alpine`, install all deps, run `npm run build` (outputs to `dist/`)
  - [x] Stage 2 (production): `node:20-alpine`, install prod deps only (`--omit=dev`), copy `dist/`, run as non-root user
  - [x] `EXPOSE 3001`, `CMD ["node", "dist/server.js"]` (no `--env-file` flag — env vars come from compose)

- [x] Task 3: Create `backend/.dockerignore` (AC: #2)
  - [x] Exclude `node_modules/`, `dist/`, `.env`, `*.md`

- [x] Task 4: Create `frontend/nginx.conf` (AC: #2)
  - [x] Configure nginx to serve `/usr/share/nginx/html` on port 80
  - [x] Include `try_files $uri $uri/ /index.html` (SPA fallback)
  - [x] Enable gzip compression for JS/CSS/JSON

- [x] Task 5: Create `frontend/Dockerfile` (AC: #2)
  - [x] Stage 1 (build): `node:20-alpine`, accept `ARG VITE_API_URL=http://localhost:3001`, run `npm ci && npm run build`
  - [x] Stage 2 (production): `nginx:alpine`, copy `dist/` to `/usr/share/nginx/html`, copy `nginx.conf`
  - [x] `EXPOSE 80`

- [x] Task 6: Create `frontend/.dockerignore` (AC: #2)
  - [x] Exclude `node_modules/`, `dist/`, `.env`

- [x] Task 7: Create root-level `docker-compose.yml` (AC: #1, #3, #4)
  - [x] `postgres` service: `postgres:17-alpine`, volume for data persistence, mount `backend/schema.sql` to `/docker-entrypoint-initdb.d/`, healthcheck via `pg_isready`
  - [x] `backend` service: build `./backend`, set `PORT=3001` and `DATABASE_URL` env vars, `depends_on: postgres (service_healthy)`, healthcheck via wget to `/api/health`
  - [x] `frontend` service: build `./frontend` with `VITE_API_URL=http://localhost:3001` build arg, port `5173:80`, `depends_on: backend (service_healthy)`
  - [x] Named volume `postgres_data`

- [x] Task 8: Create root-level `.env.example` for docker-compose overrides (AC: #4)
  - [x] Document overridable variables: `POSTGRES_PASSWORD`, `VITE_API_URL`

- [x] Task 9: Update `README.md` with Docker section (AC: #1)
  - [x] Add "Running with Docker" section with `docker-compose up` instructions
  - [x] Note prerequisites (Docker Desktop or Docker Engine + Compose plugin)

## Dev Notes

### Critical: Health Endpoint Must Be Added First

`GET /api/health` is defined in the architecture (`architecture.md#API Endpoints`) but is **not yet implemented** in `backend/src/routes.ts`. Docker Compose uses this endpoint for the backend health check (`depends_on: condition: service_healthy`). Without it, the frontend container will never start.

Add to `backend/src/routes.ts` inside `taskRoutes`:

```ts
server.get('/api/health', async (_request, reply) => {
  return reply.send({ status: 'ok' })
})
```

### How `docker-compose up` Works End-to-End

1. **postgres** starts first; healthcheck (`pg_isready`) confirms it's accepting connections
2. **backend** starts after postgres is healthy; on first run, postgres auto-executes `backend/schema.sql` (via `/docker-entrypoint-initdb.d/`), creating the `tasks` table; backend healthcheck polls `/api/health`
3. **frontend** starts after backend is healthy; nginx serves the pre-built `dist/` on port 80 (mapped to host `5173`)
4. **User opens** `http://localhost:5173` — browser fetches tasks from `http://localhost:3001` (host-mapped backend port)

### Backend Dockerfile — Key Details

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

**Why `node dist/server.js` not `node --env-file=.env dist/server.js`:** The `--env-file` flag is the local dev pattern. In Docker, `PORT` and `DATABASE_URL` are injected by docker-compose `environment:` section into `process.env` directly — no `.env` file needed.

**Why two `COPY package*.json` patterns:** `npm ci` in build stage installs all deps (including devDeps like `tsx`, `typescript`); `npm ci --omit=dev` in production stage installs only `fastify`, `pg`, `@fastify/cors`.

**TypeScript module resolution:** `tsconfig.json` uses `"module": "NodeNext"` — compiled output in `dist/` uses `.js` extensions. `CMD ["node", "dist/server.js"]` is correct.

### Frontend Dockerfile — Key Details

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_API_URL=http://localhost:3001
ENV VITE_API_URL=$VITE_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Why `ARG` then `ENV`:** Vite reads `VITE_*` vars from `process.env` at build time. `ARG` passes the value in; `ENV` exposes it to the Vite build process. Without `ENV VITE_API_URL=$VITE_API_URL`, Vite won't see it.

**Why `VITE_API_URL=http://localhost:3001`:** The browser (running on the host) makes requests to `http://localhost:3001` — the backend container's host-mapped port. The container-internal address (`http://backend:3001`) is NOT accessible from the browser.

**Why nginx not Node for frontend:** Vite's `npm run build` (`tsc -b && vite build`) produces static files in `dist/`. Serving static files via nginx is the standard production pattern — no Node runtime needed.

**nginx runs as non-root by default** in `nginx:alpine` — worker processes run as `nginx` user.

### Frontend nginx.conf

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    gzip on;
    gzip_types text/plain text/css application/javascript application/json image/svg+xml;
}
```

Place this file at `frontend/nginx.conf`. The Dockerfile copies it to `/etc/nginx/conf.d/default.conf`, replacing the default nginx site config.

### docker-compose.yml — Complete Reference

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: todo
      POSTGRES_USER: todo
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-todo_password}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/schema.sql:/docker-entrypoint-initdb.d/schema.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U todo -d todo"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
    environment:
      PORT: 3001
      DATABASE_URL: postgresql://todo:${POSTGRES_PASSWORD:-todo_password}@postgres:5432/todo
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3001/api/health || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:3001}
    ports:
      - "5173:80"
    depends_on:
      backend:
        condition: service_healthy

volumes:
  postgres_data:
```

**`${POSTGRES_PASSWORD:-todo_password}` syntax:** Uses value from root-level `.env` file if present, falls back to `todo_password`. Users can create `.env` to override without modifying `docker-compose.yml`.

**`wget` availability:** `node:20-alpine` includes busybox, which includes `wget` — no additional installation required for the backend healthcheck.

**`backend/schema.sql` auto-init:** Postgres official image executes any `.sql` files in `/docker-entrypoint-initdb.d/` on **first start** (when the data volume is empty). Subsequent starts skip this. This creates the `tasks` table automatically.

### .dockerignore Files

`backend/.dockerignore`:
```
node_modules
dist
.env
*.md
```

`frontend/.dockerignore`:
```
node_modules
dist
.env
```

### Root-level `.env.example`

```
# Docker Compose override variables
# Copy to .env to customise:
#   cp .env.example .env

POSTGRES_PASSWORD=todo_password
VITE_API_URL=http://localhost:3001
```

### Existing Code — Do Not Modify

- `backend/src/server.ts` — already binds to `0.0.0.0` (`host: '0.0.0.0'`), required for Docker container networking. No changes needed.
- `backend/src/db.ts` — already reads `DATABASE_URL` from `process.env`. No changes needed.
- All other backend source files — unchanged.
- All frontend source files — unchanged. Build output (`dist/`) is what gets served.

### What `docker-compose logs` Shows

- **postgres:** Startup messages, connection ready notices
- **backend:** Fastify JSON logs (`{ "level": "info", "msg": "Server listening at ..." }`) — Fastify uses `logger: true` which logs structured JSON to stdout
- Health check attempts are NOT logged to docker-compose logs; health status is visible via `docker ps` (STATUS column shows `(healthy)` or `(unhealthy)`)

### Files NOT to Create

- No `docker-compose.override.yml` — `.env` file at root is sufficient for env var overrides
- No Kubernetes manifests, CI/CD config, or deployment scripts — out of scope per architecture
- No changes to `playwright.config.ts` or E2E tests — Docker is not used in the test setup

### Project Structure Notes

New files created by this story:
```
todo/
├── docker-compose.yml          ← new (root level)
├── .env.example                ← new (root level, docker-compose variables)
├── frontend/
│   ├── Dockerfile              ← new
│   ├── nginx.conf              ← new
│   └── .dockerignore           ← new
└── backend/
    ├── Dockerfile              ← new
    └── .dockerignore           ← new
```

Modified files:
- `backend/src/routes.ts` — add `GET /api/health` endpoint
- `README.md` — add Docker section

### References

- [Source: epics.md#Epic 9] — Dockerise the application so it runs via `docker-compose up`
- [Source: epics.md#Story 9.1] — acceptance criteria and story definition
- [Source: architecture.md#Infrastructure & Deployment] — "Containerisation: Docker + Docker Compose. Multi-stage Dockerfiles for frontend and backend. PostgreSQL via official image. Application starts with `docker-compose up`."
- [Source: architecture.md#API Endpoints] — `GET /api/health` returns 200 `{ status: "ok" }`
- [Source: architecture.md#Environment Configuration] — `PORT=3001`, `DATABASE_URL=postgresql://localhost:5432/todo`, `VITE_API_URL=http://localhost:3001`
- [Source: architecture.md#Project Structure] — `frontend/` and `backend/` directory layout
- [Source: backend/src/server.ts] — `host: '0.0.0.0'` already set; `CORS origin: true`
- [Source: backend/src/db.ts] — `DATABASE_URL` from `process.env`
- [Source: README.md] — "Node.js 20+" — use `node:20-alpine`
- [Source: _bmad-output/planning-artifacts/architecture.md#Starter Options] — "PostgreSQL 17" used in README setup instructions

## Dev Agent Record

### Agent Model Used

claude-4.6-sonnet-medium-thinking (Cursor Agent)

### Debug Log References

None.

### Completion Notes List

- Added `GET /api/health` route to `backend/src/routes.ts` returning `{ status: 'ok' }` with HTTP 200. Added corresponding unit test in `backend/src/routes.test.ts` — all 16 backend tests pass.
- Created multi-stage `backend/Dockerfile`: build stage uses `node:20-alpine` with full deps + TypeScript compile; production stage installs prod deps only (`--omit=dev`), runs as non-root `appuser`.
- Created `backend/.dockerignore` excluding `node_modules`, `dist`, `.env`, `*.md`.
- Created `frontend/nginx.conf` with SPA fallback (`try_files`) and gzip compression for JS/CSS/JSON/SVG.
- Created multi-stage `frontend/Dockerfile`: build stage uses `node:20-alpine` with `ARG`/`ENV VITE_API_URL` for Vite build-time injection; production stage uses `nginx:alpine` (nginx runs as non-root by default).
- Created `frontend/.dockerignore` excluding `node_modules`, `dist`, `.env`.
- Created root-level `docker-compose.yml` with three services (postgres → backend → frontend) using `depends_on: condition: service_healthy`. `postgres` healthchecks via `pg_isready`; `backend` healthchecks via `wget /api/health`; `frontend` depends on backend health. Schema auto-initialised via `/docker-entrypoint-initdb.d/`. Named volume `postgres_data` for persistence.
- Created `.env.example` documenting `POSTGRES_PASSWORD` and `VITE_API_URL` overrides.
- Updated `README.md` with "Running with Docker" section covering prerequisites, startup, env override, and common commands.
- All 16 backend tests pass; all 45 frontend tests pass — no regressions.

### File List

- `backend/src/routes.ts` (modified — added `GET /api/health` with DB check)
- `backend/src/routes.test.ts` (modified — added health endpoint tests incl. 503, added 400 non-numeric ID tests for PATCH and DELETE)
- `backend/src/db.ts` (modified — added `checkDb` export)
- `backend/Dockerfile` (modified — added `HEALTHCHECK`)
- `backend/.dockerignore` (new)
- `frontend/Dockerfile` (modified — switched to `nginx-unprivileged:alpine`, port 8080, added `HEALTHCHECK`)
- `frontend/nginx.conf` (modified — port 8080, added `gzip_vary on`)
- `frontend/.dockerignore` (new)
- `docker-compose.yml` (modified — removed deprecated `version`, added `start_period`, grep-based healthcheck, port 5173:8080)
- `.env.example` (new)
- `README.md` (modified — added Docker section, fixed PostgreSQL version)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (modified — status updated)

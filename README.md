# Todo App

A minimal, full-stack todo application built with React + Vite (frontend) and Fastify + PostgreSQL (backend).

> **Reflection:** This project was built using the [BMAD Method](https://github.com/bmadcode/BMAD-METHOD) with AI-assisted development throughout. See the [AI Integration Log](docs/ai-integration-log.md) for my notes on the process, what worked, and what didn't.

## Project Structure

```
todo/
├── frontend/   → React + TypeScript + Tailwind CSS v4 (Vite)
└── backend/    → Fastify + TypeScript + pg (raw SQL)
```

## Running Locally

There are two ways to run the app — pick whichever suits you:

| | Docker | Manual |
|---|---|---|
| **Prerequisites** | Docker Desktop / Docker Engine | Node.js 20+, PostgreSQL 17 |
| **Setup** | One command | Install deps, create DB, start both servers |
| **Best for** | Quick start, production-like environment | Active development with hot reload |

---

### Option A — Docker (recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) (macOS/Windows) or Docker Engine + Compose plugin (Linux).

```bash
docker-compose up
```

That's it. Docker builds the images, starts postgres → backend → frontend in order, and waits for each to be healthy before starting the next. On subsequent runs, images are cached so startup is fast.

Open http://localhost:5173 in your browser.

**Run in the background:**

```bash
docker-compose up -d
docker-compose logs -f   # tail logs
docker ps                # check health status
```

**Stop:**

```bash
docker-compose down        # stop containers
docker-compose down -v     # stop and wipe the database volume
```

**Override environment variables** (e.g. change the Postgres password):

```bash
cp .env.example .env
# edit .env, then:
docker-compose up
```

---

### Option B — Manual setup

**Prerequisites:** Node.js 20+, PostgreSQL 17.

#### 1. Install and start PostgreSQL (macOS)

```bash
brew install postgresql@17
brew services start postgresql@17
psql -l   # verify it's running
```

#### 2. Create the database

```bash
createdb todo
psql -d todo -f backend/schema.sql
psql -d todo -c '\dt'   # should show the tasks table
```

#### 3. Start the backend

```bash
cd backend
cp .env.example .env   # adjust DATABASE_URL if needed
npm install
npm run dev             # http://localhost:3001
```

The default `DATABASE_URL` is `postgresql://localhost:5432/todo`, which works for a standard Homebrew PostgreSQL setup with no password.

#### 4. Start the frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## Running Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npx vitest run

# E2E tests (Playwright) — from the project root
npm run test:e2e

# E2E with headed browser
npm run test:e2e:headed

# E2E with Playwright UI
npm run test:e2e:ui
```

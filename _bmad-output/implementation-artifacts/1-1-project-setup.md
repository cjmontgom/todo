# Story 1.1: Project Setup

Status: ready-for-dev

## Story

As a developer,
I want the monorepo structure with all dependencies configured,
So that I can begin building features on a working full-stack skeleton.

## Acceptance Criteria

1. **Given** a fresh clone of the repository
   **When** I run install commands in both `frontend/` and `backend/`
   **Then** frontend (Vite + React + TypeScript + Tailwind CSS) and backend (Fastify + TypeScript + pg) start without errors

2. **Given** the backend is running
   **When** I execute `schema.sql` against a PostgreSQL instance
   **Then** the `tasks` table is created with columns: `id` (SERIAL PK), `text` (TEXT NOT NULL), `completed` (BOOLEAN NOT NULL DEFAULT false), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW())

3. **Given** both services are running
   **When** the frontend makes a request to the backend
   **Then** CORS is configured via `@fastify/cors` and the request is allowed

## Tasks / Subtasks

- [ ] Task 1: Initialize monorepo root (AC: #1)
  - [ ] Create root `README.md` and `.gitignore`
  - [ ] `.gitignore` must cover: `node_modules/`, `.env`, `dist/`, `.DS_Store`
- [ ] Task 2: Scaffold frontend with Vite (AC: #1)
  - [ ] Run `npm create vite@latest frontend -- --template react-ts`
  - [ ] Install Tailwind CSS v4: `npm install tailwindcss @tailwindcss/vite`
  - [ ] Configure `@tailwindcss/vite` plugin in `vite.config.ts`
  - [ ] Replace `index.css` content with `@import "tailwindcss";` plus `@theme` block for design tokens
  - [ ] Configure custom theme via `@theme` directive (colours, fonts, spacing — see Dev Notes)
  - [ ] Verify `npm run dev` starts without errors
  - [ ] Create `.env` and `.env.example` with `VITE_API_URL=http://localhost:3001`
- [ ] Task 3: Scaffold backend (AC: #1, #3)
  - [ ] `mkdir -p backend/src`
  - [ ] `cd backend && npm init -y`
  - [ ] Install runtime deps: `npm install fastify pg @fastify/cors`
  - [ ] Install dev deps: `npm install -D typescript @types/node @types/pg tsx`
  - [ ] Create `tsconfig.json` with target `es2022` or later, `module: "NodeNext"`, `moduleResolution: "NodeNext"`, `outDir: "./dist"`, `rootDir: "./src"`, strict mode enabled
  - [ ] Add scripts to `package.json`: `"dev": "tsx watch src/server.ts"`, `"build": "tsc"`, `"start": "node dist/server.js"`
  - [ ] Create `.env` and `.env.example` with `PORT=3001` and `DATABASE_URL=postgresql://localhost:5432/todo`
- [ ] Task 4: Create backend source files (AC: #1, #3)
  - [ ] Create `backend/src/server.ts` — Fastify instance, register `@fastify/cors`, mount routes, listen on `PORT`
  - [ ] Create `backend/src/routes.ts` — placeholder `GET /api/tasks` returning `[]` (full implementation in Story 1.2)
  - [ ] Create `backend/src/db.ts` — `pg.Pool` from `DATABASE_URL`, export query helper
  - [ ] Create `backend/src/types.ts` — `Task` type with DB column names (`id`, `text`, `completed`, `created_at`)
  - [ ] Verify `npm run dev` starts without errors and `GET /api/tasks` returns `[]`
- [ ] Task 5: Create database schema (AC: #2)
  - [ ] Create `backend/schema.sql` with the `tasks` table definition
  - [ ] Verify schema runs against a local PostgreSQL instance without errors
- [ ] Task 6: Create frontend type and API files (AC: #1)
  - [ ] Create `frontend/src/types.ts` — `Task` interface with camelCase fields (`id`, `text`, `completed`, `createdAt`)
  - [ ] Create `frontend/src/api.ts` — `fetchTasks()` function using `fetch` against `VITE_API_URL`
  - [ ] Wire up minimal `App.tsx` that calls the API on mount (full UI in Story 1.2)
- [ ] Task 7: Verify end-to-end connectivity (AC: #1, #3)
  - [ ] Start both frontend and backend
  - [ ] Confirm frontend can call `GET /api/tasks` on the backend through CORS
  - [ ] Confirm no console errors in browser or terminal

## Dev Notes

### Critical: Tailwind CSS v4 Configuration Change

The architecture doc references `tailwind.config` for design tokens. **Tailwind CSS v4 no longer uses `tailwind.config.js`.** Configuration is now CSS-first using the `@theme` directive in your CSS file.

**Setup in `vite.config.ts`:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Design tokens in `frontend/src/index.css`:**
```css
@import "tailwindcss";

@theme {
  --color-background: #FAFAF8;
  --color-surface: #FFFFFF;
  --color-text-primary: #2D2D2D;
  --color-text-secondary: #8B8B8B;
  --color-border: #E8E6E3;
  --color-completed: #B0AEA9;
  --color-coral: #E8927C;
  --color-coral-dark: #C4705A;
  --color-hover: #F3EEEB;
  --color-success: #D4E4DA;
  --color-error-bg: #F0D4CE;
  --color-error-text: #C4705A;
  --font-sans: 'Inter', sans-serif;
}
```

These tokens generate utility classes like `bg-background`, `text-coral`, `border-border`, etc.

### Technology Versions (as of March 2026)

| Package | Version | Notes |
|---------|---------|-------|
| Vite | latest (via `create vite@latest`) | Use `react-ts` template |
| React | 19.x | Included with Vite template |
| TypeScript | 5.x | Included with Vite template |
| Tailwind CSS | v4.x | `@tailwindcss/vite` plugin, CSS-first config |
| Fastify | v5.8.x | Requires Node.js 20+. Full JSON schemas required for validation. |
| pg | v8.20.x | node-postgres, raw SQL |
| @fastify/cors | latest | One-liner CORS setup |
| tsx | v4.21.x | Dev-only, runs TypeScript without compilation |

### Fastify v5 Key Changes

- Requires **Node.js 20+**
- JSON schema validation now requires the `type` property on all schemas (querystring, params, body, response)
- Import: `import fastify from 'fastify'` (default export)
- CORS plugin: `import cors from '@fastify/cors'` then `server.register(cors)`

### Backend Server Pattern

```typescript
// backend/src/server.ts
import fastify from 'fastify'
import cors from '@fastify/cors'
import { taskRoutes } from './routes.js'

const server = fastify({ logger: true })

server.register(cors)
server.register(taskRoutes)

const start = async () => {
  const port = Number(process.env.PORT) || 3001
  await server.listen({ port, host: '0.0.0.0' })
}

start()
```

### Database Connection Pattern

```typescript
// backend/src/db.ts
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool
```

**Important:** Import `pg` as default import (`import pg from 'pg'`), then use `pg.Pool`. The named import `import { Pool } from 'pg'` may cause ESM issues.

### Database Schema

```sql
-- backend/schema.sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| DB columns | `snake_case` | `created_at` |
| API JSON | `camelCase` | `createdAt` |
| React components | `PascalCase` files | `TaskItem.tsx` |
| Non-component files | lowercase | `api.ts`, `types.ts` |
| Backend files | lowercase | `routes.ts`, `db.ts` |
| Functions/variables | `camelCase` | `handleDelete` |
| Types/interfaces | `PascalCase`, no prefix | `Task` (not `ITask`) |

### File Structure (this story creates)

```
todo/
├── README.md
├── .gitignore
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── .env
│   ├── .env.example
│   ├── public/
│   └── src/
│       ├── main.tsx
│       ├── index.css          ← Tailwind @import + @theme tokens
│       ├── App.tsx            ← Minimal: calls API, logs result
│       ├── api.ts             ← fetchTasks() using fetch
│       └── types.ts           ← Task interface (camelCase)
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.example
    ├── schema.sql
    └── src/
        ├── server.ts          ← Fastify + CORS + route mount
        ├── routes.ts          ← Placeholder GET /api/tasks → []
        ├── db.ts              ← pg.Pool connection
        └── types.ts           ← Task type (snake_case DB fields)
```

**Note:** Component files (`components/` directory) are NOT created in this story. They are part of Story 1.2 and later.

### Inter Font

Include Inter via Google Fonts CDN in `frontend/index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### What This Story Does NOT Include

- No UI components beyond a minimal `App.tsx` that proves the API connection works
- No `components/` directory (created in Story 1.2)
- No test files (first tests come in Story 1.2 with testable UI)
- No pre-seeded data — app starts empty per architecture decision
- No route handlers beyond a placeholder `GET /api/tasks` returning `[]`

### Anti-Patterns to Avoid

- **Do NOT install an ORM** (Drizzle, Prisma, Kysely) — raw SQL with `pg` is the architecture decision
- **Do NOT install a migration tool** — single `schema.sql` is sufficient
- **Do NOT install a component library** (MUI, Chakra, Radix) — all components are custom
- **Do NOT create `tailwind.config.js`** — Tailwind v4 uses CSS-first `@theme` in the CSS file
- **Do NOT install PostCSS or Autoprefixer** — Tailwind v4 Vite plugin handles everything
- **Do NOT use `ts-node`** — use `tsx` for running TypeScript backend in development
- **Do NOT add workspace tooling** (npm workspaces, turborepo) — two independent directories is the design
- **Do NOT install ESLint or Prettier** unless specifically instructed — keep dependencies minimal
- **Do NOT set up CI/CD** — deferred to post-V1

### Project Structure Notes

- The monorepo is two independent directories (`frontend/`, `backend/`), each with their own `package.json` — NOT npm workspaces
- Frontend and backend are separate services with separate `node_modules`
- CORS is required because they run on different ports in development
- Environment variables: frontend uses `VITE_` prefix (Vite convention), backend reads from `process.env` directly

### References

- [Source: architecture.md#Starter Template Evaluation] — initialization commands and technology justifications
- [Source: architecture.md#Project Structure & Boundaries] — complete directory tree and file responsibilities
- [Source: architecture.md#Implementation Patterns & Consistency Rules] — naming conventions and patterns
- [Source: architecture.md#Core Architectural Decisions] — technology stack decisions with rationale
- [Source: ux-design-specification.md#Design System Foundation] — Tailwind CSS decision and token strategy
- [Source: ux-design-specification.md#Color System] — complete colour palette with hex values
- [Source: ux-design-specification.md#Typography System] — Inter font family, type scale
- [Source: epics.md#Story 1.1] — acceptance criteria and requirements
- [Source: prd.md#Technical Architecture] — rendering approach, browser support

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-03-12'
inputDocuments:
  - product-brief-todo-2026-03-11.md
  - prd.md
  - ux-design-specification.md
  - ux-design-directions.html
workflowType: 'architecture'
project_name: 'todo'
user_name: 'chlo'
date: '2026-03-12'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

17 FRs across 4 categories. The core is single-entity CRUD — create, view, complete (toggle), and delete tasks. Each task has a text description, completion status, and creation timestamp. All operations happen on a single page with no navigation. The app starts with an empty list (no pre-seeded data). Error handling is specified per-operation: inline errors for creation failure, toast for toggle/delete failures, full-page error for initial load failure. Keyboard navigation and screen reader support are specified but treated as second-priority — avoid major failures rather than target comprehensive compliance.

**Non-Functional Requirements:**

10 NFRs that shape architecture. The performance bar is explicit: 200ms visible feedback on CRUD, 2s initial page load, small JS bundle. Maintainability and extensibility are emphasised — clean code, minimal dependencies, standalone API, additive-change-friendly architecture. No hard-coded single-instance assumptions (no local filesystem state, no in-memory primary persistence). Accessibility is present but second-priority: don't break obvious things, don't gold-plate.

**Scale & Complexity:**

- Primary domain: Full-stack web application (React SPA + REST API + relational database)
- Complexity level: Low
- Estimated architectural components: ~15 (11 React components + API layer + data layer + error handling + config)

### Technical Constraints & Dependencies

- **Frontend:** React SPA, no meta-framework (no Next.js, no Remix). Tailwind CSS for styling (decided in UX spec). No component library.
- **Backend:** Standalone RESTful API, decoupled from frontend. Framework and language TBD at architecture stage.
- **Database:** Persistent relational storage with consistency and durability guarantees. No in-memory stores as primary persistence.
- **Rendering:** Client-side only. No SSR, no SSG.
- **Browser support:** Modern evergreen only (Chrome, Firefox, Safari, Edge — current and previous major version).
- **Auth:** None for V1, but architecture must not prevent future addition.
- **Pre-seeded data:** Not included — app starts empty.

### Cross-Cutting Concerns Identified

- **Error handling strategy:** Consistent pattern across all operations — no optimistic UI, revert on failure, error severity scales by operation type. Needs to be well-abstracted so every mutation follows the same pattern.
- **Extensibility:** Data model, API surface, and component structure are shaped by a known future roadmap (subtasks, priorities, status workflows, auth, multi-user). The bar is "additive changes are possible" — not pre-built.
- **Accessibility (secondary):** Semantic HTML, no major a11y failures, reasonable contrast. Not a primary focus for architectural decisions.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web application: React SPA frontend + Fastify REST API backend + PostgreSQL database. Monorepo with `frontend/` and `backend/` directories.

### Starter Options Considered

Third-party boilerplate starters (FastifyKit, DriftOS Fastify Starter, various Fastify + TypeScript + PostgreSQL templates) were evaluated and rejected. They introduce unnecessary complexity for a 4-endpoint CRUD API — MVC patterns, dependency injection, monitoring, Swagger generation, ORM configurations — all of which would need to be removed. The project is simple enough that manual setup is cleaner.

ORM options (Drizzle, Prisma, Kysely) were evaluated and rejected for V1. One table with three fields and four queries does not justify an abstraction layer, schema definition system, or migration toolchain. Raw SQL with `pg` (node-postgres) is completely readable for this scope. An ORM can be introduced later if the data model grows complex enough to warrant it.

### Selected Approach: Minimal Manual Setup

**Rationale:** V1 is a training course deliverable with deliberately minimal scope. Every dependency must earn its place. For a 4-endpoint API with one database table, the simplest approach is the best approach.

**What earns its place:**

| Technology | Justification |
|------------|---------------|
| Vite | Standard way to start a React + TypeScript project. Dev server, HMR, production builds. No simpler path exists. |
| React | Frontend framework — specified in PRD. |
| TypeScript | Type safety across frontend and backend. Standard for modern JS projects. |
| Tailwind CSS | Design system and styling — decided in UX spec, justified there. |
| Fastify | API server. Lightweight, async-native, good TypeScript support. |
| PostgreSQL | Relational database. Chosen for future multi-user extensibility. |
| pg (node-postgres) | Database driver. Raw SQL for 4 trivial queries. No ORM overhead. |

**What was deliberately excluded:**

| Excluded | Why |
|----------|-----|
| ORM (Drizzle/Prisma) | One table, four queries. An abstraction layer adds complexity without value at this scale. |
| Migration tooling | One table. A single `schema.sql` file run once is sufficient. |
| Starter templates | Would bring more to remove than they save. |
| Workspace tooling | Two directories in a folder is organisation, not infrastructure. |
| Swagger/OpenAPI | Four endpoints. Documentation is the code itself. |

**Initialization:**

```bash
# Frontend
npm create vite@latest frontend -- --template react-ts
cd frontend && npm install -D tailwindcss @tailwindcss/vite

# Backend
mkdir -p backend/src
cd backend && npm init -y
npm install fastify pg @fastify/cors
npm install -D typescript @types/node @types/pg tsx
```

**Database schema (`backend/schema.sql`):**

```sql
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Note:** Project initialization should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
All critical decisions are resolved — technology stack, data model, API pattern, state management approach, and deployment targets are defined.

**Deferred Decisions (Post-V1):**
Authentication, CI/CD, monitoring/logging beyond console, caching, API documentation tooling. These are explicitly out of scope and do not need architectural pre-work in V1.

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Database | PostgreSQL | Relational, durable, supports future multi-user without migration |
| Database driver | `pg` (node-postgres) | Raw SQL for 4 trivial queries. No ORM overhead. |
| Schema management | Single `schema.sql` file | One table. No migration tooling needed. |
| Data validation | Fastify JSON schema (backend) + empty-check (frontend) | Built-in to Fastify, zero dependencies. Only validation needed: non-empty task text. |
| Caching | None | Single-user, low data volume, no benefit. |

### Authentication & Security

No authentication for V1. The only security-relevant decision is CORS:

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CORS | `@fastify/cors` | Required — frontend and backend are separate services. One-liner config. |
| Auth | Deferred to post-V1 | Explicitly out of scope. Table schema doesn't include user FK — will be added via new column when auth is introduced. |

### API & Communication Patterns

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API style | REST | Specified in PRD. Four endpoints on one resource. |
| Error format | `{ "error": "message" }` with HTTP status codes | Simplest consistent pattern. 400 bad input, 404 not found, 500 server error. |
| API documentation | None (code is the docs) | Four endpoints. Swagger/OpenAPI adds more than it saves. |

**API Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update task (toggle completion) |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/health` | Health check (returns 200 with `{ status: "ok" }`) |

### Frontend Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| State management | Plain React (`useState` + `useEffect` + `fetch`) | Zero dependencies. 4 operations on 1 entity — a library adds more concepts than it saves. |
| Component architecture | 11 custom components (defined in UX spec) | Purpose-built, no component library. |
| Routing | None | Single-page app, single view. No router needed. |
| Styling | Tailwind CSS with custom theme in `tailwind.config` | Decided in UX spec. Design tokens for colours, spacing, typography. |

### Testing

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend testing | Node built-in test runner (`node:test`) | Zero dependencies, ships with Node.js. Sufficient for API endpoint tests. |
| Frontend testing | Vitest + React Testing Library (`@testing-library/react`) | Vitest reuses existing Vite config — near-zero setup. React Testing Library tests component behaviour, not implementation. |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend hosting | Vercel (free tier) | Trivial SPA deployment, free. |
| Backend hosting | Railway (free tier) | Easy Fastify deployment, managed PostgreSQL included. |
| Environment config | `.env` files | Database connection string, API port, frontend API URL. |
| CI/CD | Deferred to post-V1 | Manual deployment is acceptable for a training deliverable. |
| Containerisation | Docker + Docker Compose | Multi-stage Dockerfiles for frontend and backend. PostgreSQL via official image. Application starts with `docker-compose up`. |
| Monitoring/logging | Console logging only | No production monitoring for V1. |

## Implementation Patterns & Consistency Rules

### Naming Conventions

**Database:**
- Tables: `snake_case`, plural (`tasks`)
- Columns: `snake_case` (`created_at`, `completed`)

**API:**
- Endpoints: `/api/{resource}` plural (`/api/tasks`)
- JSON fields: `camelCase` — transformed at the API boundary from database `snake_case`. API returns `{ id, text, completed, createdAt }`, not `{ created_at }`.

**Frontend code:**
- React components: `PascalCase` (`TaskItem`, `TaskList`)
- Component files: `PascalCase.tsx` (`TaskItem.tsx`, `TaskList.tsx`)
- Non-component files: lowercase (`api.ts`, `types.ts`)
- Functions/variables: `camelCase` (`handleDelete`, `taskList`)
- Types/interfaces: `PascalCase`, no prefix (`Task`, not `ITask`)

**Backend code:**
- Files: lowercase (`routes.ts`, `db.ts`)
- Functions/variables: `camelCase`
- Types: `PascalCase`

### Structure Patterns

**Tests:** Co-located with source files. `TaskItem.test.tsx` next to `TaskItem.tsx`. Backend follows the same pattern — `routes.test.ts` next to `routes.ts`.

**Components:** Flat structure in `frontend/src/components/`. No nesting by feature — the app only has one feature.

### API Response Formats

**Success responses:**
- `GET /api/tasks` → `200` with `[{ id, text, completed, createdAt }]`
- `POST /api/tasks` → `201` with `{ id, text, completed, createdAt }`
- `PATCH /api/tasks/:id` → `200` with `{ id, text, completed, createdAt }`
- `DELETE /api/tasks/:id` → `204` with empty body

**Error responses:**
- `400` → `{ "error": "Task text is required" }` (bad input)
- `404` → `{ "error": "Task not found" }` (invalid ID)
- `500` → `{ "error": "Something went wrong" }` (server error — no stack traces to client)

**Dates:** ISO 8601 strings in all API responses (`"2026-03-12T14:30:00.000Z"`).

**snake_case to camelCase mapping:** The API boundary transforms database column names to camelCase for all responses. The mapping for V1 is a single field: `created_at` → `createdAt`. All other columns (`id`, `text`, `completed`) are identical in both conventions.

### Frontend State Pattern

Every CRUD operation follows the same sequence:

1. Set loading/disabled state on the relevant UI element
2. Make `fetch` call to the API
3. **On success:** update local state with response data, clear loading state
4. **On failure:** revert any UI changes, show error (inline for creation, toast for toggle/delete per UX spec), clear loading state

No optimistic UI. No intermediate states. The API confirms before the UI commits.

### Error Handling Pattern

**Backend:** Fastify's built-in error handling. JSON schema validation rejects bad input automatically (400). Route handlers catch database errors and return appropriate status codes. No error details leaked to client in production.

**Frontend:** Errors are caught per-operation and handled according to UX spec severity rules:
- Initial load failure → full-page `ErrorState` component with retry
- Creation failure → inline error below input, text preserved
- Toggle/delete failure → revert UI state, show `Toast` (auto-dismiss 3s)

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo/
├── README.md
├── .gitignore
│
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
│       ├── index.css
│       ├── App.tsx
│       ├── App.test.tsx
│       ├── api.ts
│       ├── types.ts
│       └── components/
│           ├── AppShell.tsx
│           ├── AppHeader.tsx
│           ├── TaskInput.tsx
│           ├── TaskInput.test.tsx
│           ├── TaskList.tsx
│           ├── TaskList.test.tsx
│           ├── TaskItem.tsx
│           ├── TaskItem.test.tsx
│           ├── Checkbox.tsx
│           ├── DeleteButton.tsx
│           ├── Toast.tsx
│           ├── EmptyState.tsx
│           ├── LoadingState.tsx
│           └── ErrorState.tsx
│
└── backend/
    ├── package.json
    ├── tsconfig.json
    ├── .env
    ├── .env.example
    ├── schema.sql
    └── src/
        ├── server.ts
        ├── routes.ts
        ├── routes.test.ts
        ├── db.ts
        └── types.ts
```

### Key File Responsibilities

**Frontend:**

| File | Purpose |
|------|---------|
| `main.tsx` | React entry point — mounts `App` to DOM |
| `index.css` | Tailwind directives and any custom CSS |
| `App.tsx` | Root component — owns task state, orchestrates CRUD operations, renders component tree |
| `api.ts` | All `fetch` calls to the backend API. Single place for API URL, request/response handling |
| `types.ts` | Shared TypeScript types (`Task` interface) |
| `components/` | All 11 UX spec components, flat structure |

**Backend:**

| File | Purpose |
|------|---------|
| `server.ts` | Fastify instance creation, plugin registration (CORS), route mounting, server start |
| `routes.ts` | All 4 API route handlers with JSON schema validation |
| `db.ts` | PostgreSQL connection pool (`pg.Pool`), query functions for each operation |
| `types.ts` | Shared TypeScript types (mirrors frontend `Task` but with DB column names) |
| `schema.sql` | Database table creation — run once manually |

### Architectural Boundaries

**API boundary:** `api.ts` (frontend) communicates with `routes.ts` (backend) over HTTP. The frontend never touches the database. The backend never knows about React.

**Data boundary:** `db.ts` is the only file that talks to PostgreSQL. Route handlers call functions from `db.ts`, never write SQL directly. The `snake_case` to `camelCase` transformation happens in `db.ts` before data leaves the backend.

**Component boundary:** `App.tsx` owns all state and passes data/callbacks down as props. Components are purely presentational except for local UI state (e.g., input text, toast visibility).

### Data Flow

```
User action → Component (prop callback) → App.tsx (state + fetch via api.ts)
→ HTTP → routes.ts → db.ts → PostgreSQL
→ response → routes.ts (camelCase transform) → HTTP
→ api.ts → App.tsx (setState) → Component (re-render)
```

### Test Coverage Strategy

Tests focus on behaviour, not coverage percentage:

| Test file | What it tests |
|-----------|---------------|
| `App.test.tsx` | Integration: full CRUD flow with mocked API |
| `TaskInput.test.tsx` | Submits on Enter/button, clears on success, preserves on error, rejects empty |
| `TaskList.test.tsx` | Renders tasks, orders active before completed |
| `TaskItem.test.tsx` | Completion toggle, delete action, visual states |
| `routes.test.ts` | All 4 endpoints: success cases, validation errors, not-found cases |

### Environment Configuration

**Frontend `.env.example`:**

```
VITE_API_URL=http://localhost:3001
```

**Backend `.env.example`:**

```
PORT=3001
DATABASE_URL=postgresql://localhost:5432/todo
```

## Architecture Validation Results

### Coherence Validation

**Decision Compatibility:** All technology choices are standard, well-tested combinations. React + Vite + TypeScript + Tailwind is a mainstream frontend stack. Fastify + TypeScript + pg is a clean backend stack. No version conflicts or incompatibilities.

**Pattern Consistency:** Naming conventions are consistent — camelCase in JavaScript, snake_case in database, transformation at the `db.ts` boundary. File naming follows standard React conventions. Co-located tests are consistent across frontend and backend.

**Structure Alignment:** The two-directory monorepo maps cleanly to the frontend/backend split. Each directory is self-contained with its own `package.json` and `tsconfig.json`. Boundaries are clearly defined and respected.

### Requirements Coverage

All 17 functional requirements and 10 non-functional requirements are architecturally supported. No gaps identified. FR10 (pre-seeded data) was removed by user decision — the EmptyState component provides the first-use experience instead.

### Implementation Readiness

**Decision Completeness:** All critical decisions are documented with rationale. Technology choices, API surface, data model, state management approach, testing strategy, and deployment targets are fully specified.

**Pattern Completeness:** Naming conventions, file organization, API response formats, error handling, and frontend state patterns are defined with enough specificity to prevent AI agent divergence.

**Structure Completeness:** Every file in the project tree has a defined purpose. Architectural boundaries are clear. Data flow is documented.

### Gap Analysis

**Minor gap resolved:** `@fastify/cors` was missing from backend initialization commands. Corrected.

**No critical or important gaps identified.**

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with rationale
- [x] Technology stack fully specified
- [x] API endpoints and response formats defined
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Error handling patterns specified
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Data flow documented
- [x] All FRs and NFRs covered

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — low-complexity project with well-understood technology, clear requirements, and deliberate simplicity.

**Key Strengths:**
- Radical simplicity — every decision favours the minimal viable approach
- Clear boundaries — API, data, and component boundaries are unambiguous
- Extensibility without over-engineering — the architecture supports future growth through additive changes, not pre-built abstractions

**First Implementation Priority:** Project initialization — create monorepo structure, install dependencies, configure Vite, Tailwind, Fastify, and PostgreSQL connection. Create `schema.sql` and run it against a local database.

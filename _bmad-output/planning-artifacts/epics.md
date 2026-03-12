---
stepsCompleted: [step-01-validate-prerequisites, step-02-design-epics, step-03-create-stories, step-04-final-validation]
status: complete
completedAt: '2026-03-12'
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# todo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for todo, decomposing the requirements from the PRD, UX Design, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: User can create a new task by providing a short text description
- FR2: User can mark an active task as complete
- FR3: User can mark a completed task as active (toggle completion status)
- FR4: User can delete a task permanently
- FR5: User can view all tasks (both active and completed) immediately upon opening the app
- FR6: User can distinguish active tasks from completed tasks at a glance through clear visual differentiation
- FR7: User can see when a task was created (creation timestamp stored per task)
- FR8: User can view and interact with tasks on both desktop and mobile devices without loss of functionality
- FR9: System persists all task data across page refreshes and browser sessions
- FR10: ~~System pre-seeds the database with sample tasks~~ **REMOVED** — app starts empty per architecture decision; EmptyState component handles first-use experience
- FR11: System stores each task with a text description, completion status, and creation timestamp
- FR12: System displays a clear, non-technical error message when a task operation fails
- FR13: System remains in a usable state when the backend is temporarily unavailable (no crashes, no broken UI)
- FR14: System preserves existing task data integrity when errors occur during operations
- FR15: User can perform all task operations (create, complete, delete) using keyboard navigation alone
- FR16: User can access all interactive elements via screen reader with meaningful labels
- FR17: User can interact with all controls via touch on mobile devices (minimum 44x44px tap targets)

### NonFunctional Requirements

- NFR1: All task operations (create, complete, delete) must produce visible UI feedback within 200ms under normal conditions
- NFR2: Initial page load (including fetching tasks from the API) must complete within 2 seconds on a standard broadband connection
- NFR3: The frontend JS bundle should remain small — no unnecessary dependencies beyond React and essential libraries
- NFR4: All interactive elements must have sufficient colour contrast (minimum 4.5:1 ratio for normal text)
- NFR5: The application must contain no major accessibility failures — no keyboard traps, no unlabelled form controls, no missing ARIA roles where semantic HTML is insufficient
- NFR6: The codebase must be understandable by a new developer without requiring a walkthrough — clear file structure, self-explanatory naming, minimal indirection
- NFR7: The API must be designed as a standalone service, decoupled from the frontend, so that future clients can consume it without modification
- NFR8: Future features (authentication, multi-user, subtasks, priorities) must be achievable through additive changes with minimal modification to existing code
- NFR9: Dependencies must be kept to the minimum necessary — every library included must have a clear justification
- NFR10: The architecture must not introduce patterns that would prevent future horizontal scaling — no hard-coded single-instance assumptions, no local filesystem state, no in-memory data stores as primary persistence

### Additional Requirements

**From Architecture:**
- Monorepo structure: `frontend/` and `backend/` directories
- Frontend: Vite + React + TypeScript + Tailwind CSS (no meta-framework)
- Backend: Fastify + TypeScript + pg (node-postgres), raw SQL
- Database: PostgreSQL with single `schema.sql` for table creation
- CORS: `@fastify/cors` required (frontend and backend are separate services)
- API endpoints: GET/POST/PATCH/DELETE on `/api/tasks`
- API responses in camelCase; snake_case → camelCase transform at `db.ts` boundary
- JSON schema validation in Fastify for input validation
- Co-located tests: test files next to source files
- Frontend testing: Vitest + React Testing Library
- Backend testing: Node built-in test runner (`node:test`)
- Deployment: Vercel (frontend) + Railway (backend)
- Environment config via `.env` files
- No ORM, no migration tooling, no Swagger, no workspace tooling

**From UX Design:**
- Mobile-first responsive design, single breakpoint at `sm:` (640px)
- Direction A "Clean Ruled" — ruled-line notebook aesthetic
- Inter font family, custom colour palette with coral accent (`#E8927C`)
- 11 custom components: AppShell, AppHeader, TaskInput, TaskList, TaskItem, Checkbox, DeleteButton, Toast, EmptyState, LoadingState, ErrorState
- Circle checkboxes with coral fill on completion; strikethrough + faded text for completed tasks
- Completed tasks sort to bottom of list automatically
- Delete button: hidden on desktop (revealed on hover), always visible on mobile
- No optimistic UI — wait for API confirmation, revert on failure
- Error escalation: full-page ErrorState for load failure, inline for creation failure, Toast for toggle/delete failure
- All transitions: 200ms ease-out
- 44x44px minimum touch targets on all interactive elements
- Skip link for screen reader users

### FR Coverage Map

- FR1: Epic 2 — Task creation
- FR2: Epic 3 — Mark task complete
- FR3: Epic 3 — Toggle completed task back to active
- FR4: Epic 4 — Delete task
- FR5: Epic 1 — View all tasks on app open
- FR6: Epic 2, Epic 3 — Visual differentiation active vs completed
- FR7: Epic 2 — Creation timestamp stored
- FR8: Epic 2 — Desktop and mobile functionality
- FR9: Epic 1 — Data persistence across sessions
- FR10: Removed — app starts empty
- FR11: Epic 1 — Task data model (text, status, timestamp)
- FR12: Epic 5 — Clear error messages
- FR13: Epic 5 — Usable state during backend unavailability
- FR14: Epic 5 — Data integrity on errors
- FR15: Epic 6 — Keyboard navigation
- FR16: Epic 6 — Screen reader labels
- FR17: Epic 6 — Touch targets 44x44px

## Epic List

### Epic 1: Project Foundation & Core Task Display
Users can open the app and see their task list (or a welcoming empty state). Establishes the full-stack skeleton end-to-end.
**FRs covered:** FR5, FR9, FR11

### Epic 2: Task Creation
Users can capture a task — type it, submit it, see it appear instantly.
**FRs covered:** FR1, FR6, FR7, FR8

### Epic 3: Task Completion
Users can mark tasks complete/incomplete with clear visual feedback and automatic sorting.
**FRs covered:** FR2, FR3, FR6

### Epic 4: Task Deletion
Users can permanently remove tasks they no longer need.
**FRs covered:** FR4

### Epic 5: Error Handling & Resilience
The app handles failures gracefully — inline errors, toasts, full-page error state, data integrity preserved.
**FRs covered:** FR12, FR13, FR14

### Epic 6: Accessibility & Polish
Keyboard navigation, screen reader support, touch targets, and responsive refinements.
**FRs covered:** FR15, FR16, FR17

### Epic 7: End-to-End Tests
Automated browser tests validating all core user journeys work correctly from the user's perspective.
**Training deliverable:** Minimum 5 passing Playwright tests

### Epic 8: Quality Assurance & Reports
Measure and document application quality across test coverage, accessibility, and security.
**Training deliverable:** 70% coverage, zero critical WCAG violations, security review

### Epic 9: Containerisation
Dockerise the application so it runs via `docker-compose up`.
**Training deliverable:** Dockerfiles, docker-compose.yml, health checks

## Epic 1: Project Foundation & Core Task Display

Users can open the app and see their task list (or a welcoming empty state). Establishes the full-stack skeleton end-to-end.

### Story 1.1: Project Setup

As a developer,
I want the monorepo structure with all dependencies configured,
So that I can begin building features on a working full-stack skeleton.

**Acceptance Criteria:**

**Given** a fresh clone of the repository
**When** I run install commands in both `frontend/` and `backend/`
**Then** frontend (Vite + React + TypeScript + Tailwind CSS) and backend (Fastify + TypeScript + pg) start without errors

**Given** the backend is running
**When** I execute `schema.sql` against a PostgreSQL instance
**Then** the `tasks` table is created with columns: `id` (SERIAL PK), `text` (TEXT NOT NULL), `completed` (BOOLEAN DEFAULT false), `created_at` (TIMESTAMPTZ DEFAULT NOW())

**Given** both services are running
**When** the frontend makes a request to the backend
**Then** CORS is configured via `@fastify/cors` and the request is allowed

### Story 1.2: View Tasks on App Load

As a user,
I want to see my task list immediately when I open the app,
So that I can see what I need to do.

**Acceptance Criteria:**

**Given** tasks exist in the database
**When** the user opens the app
**Then** all tasks are displayed with text and creation timestamp via `GET /api/tasks` returning `200` with `[{ id, text, completed, createdAt }]`

**Given** no tasks exist in the database
**When** the user opens the app
**Then** the EmptyState component is shown with a warm, inviting message (e.g. "Nothing here yet. What's on your mind?")

**Given** the API request is in flight
**When** the user opens the app
**Then** a subtle LoadingState (skeleton or gentle pulse) is displayed

**Given** the app is open with tasks displayed
**When** the user refreshes the page
**Then** the same tasks are displayed — data persists across page refreshes and browser sessions

## Epic 2: Task Creation

Users can capture a task — type it, submit it, see it appear instantly.

### Story 2.1: Create a New Task

As a user,
I want to type a task and add it to my list,
So that I can capture what's on my mind instantly.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the user types text in the TaskInput field and presses Enter or clicks the coral "+" button
**Then** a `POST /api/tasks` request is sent, the new task appears in the list as active with clear visual distinction, and the input field clears

**Given** the user submits empty or whitespace-only text
**When** they press Enter or click "+"
**Then** nothing happens — no error message, no empty task created

**Given** a new task is created
**When** it appears in the list
**Then** it is visually distinguished as active (full opacity, no strikethrough) with its creation timestamp stored

**Given** the app is viewed on a mobile device
**When** the user interacts with TaskInput
**Then** the "+" button and input field are touch-friendly with 44x44px minimum tap targets

**Given** the task is being submitted
**When** the API call is in flight
**Then** the submit button is disabled to prevent duplicate submissions

## Epic 3: Task Completion

Users can mark tasks complete/incomplete with clear visual feedback and automatic sorting.

### Story 3.1: Toggle Task Completion

As a user,
I want to mark tasks complete or incomplete,
So that I can track what I've done.

**Acceptance Criteria:**

**Given** an active task in the list
**When** the user clicks or taps its circle checkbox
**Then** a `PATCH /api/tasks/:id` request is sent, and on success the checkbox fills coral (`#E8927C`), the text gets strikethrough + fades to `#B0AEA9`, and the task animates to the bottom of the list

**Given** a completed task at the bottom of the list
**When** the user clicks or taps its filled checkbox
**Then** a `PATCH /api/tasks/:id` request is sent, and on success the visual state reverts (checkbox clears, text restores) and the task animates back up to the active section

**Given** multiple tasks with mixed completion states
**When** the list is rendered
**Then** active tasks appear first (by creation order) and completed tasks appear below

**Given** a completion toggle is attempted
**When** the API call is in flight
**Then** no optimistic UI is applied — the visual state only commits after API confirmation

## Epic 4: Task Deletion

Users can permanently remove tasks they no longer need.

### Story 4.1: Delete a Task

As a user,
I want to remove tasks I no longer need,
So that my list stays clean.

**Acceptance Criteria:**

**Given** a task exists in the list
**When** the user clicks the delete button
**Then** a `DELETE /api/tasks/:id` request is sent, and on success (`204`) the task animates out and the list closes the gap smoothly

**Given** the user is on a desktop viewport (≥640px)
**When** they hover over a task row
**Then** the delete button is revealed via CSS opacity transition

**Given** the user is on a mobile viewport (<640px)
**When** they view a task row
**Then** the delete button is always visible and tappable

**Given** a deletion is in progress
**When** the API call is in flight
**Then** the delete button is disabled to prevent double-deletion

## Epic 5: Error Handling & Resilience

The app handles failures gracefully — inline errors, toasts, full-page error state, data integrity preserved.

### Story 5.1: Graceful Error Handling

As a user,
I want clear, non-alarming feedback when something goes wrong,
So that I trust the app and know what to do.

**Acceptance Criteria:**

**Given** the backend is unavailable on initial load
**When** the app fails to fetch tasks
**Then** a full-page ErrorState component is shown with a warm message and a coral retry button
**And** clicking retry re-attempts the `GET /api/tasks` request

**Given** a task creation fails
**When** the API returns an error
**Then** an inline error message appears below the TaskInput in `#C4705A` text on `#F0D4CE` background, and the typed text is preserved in the input field
**And** the error dismisses when the user starts typing again

**Given** a completion toggle fails
**When** the API returns an error
**Then** the checkbox reverts to its previous state and a Toast slides in from the bottom with a warm error message, auto-dismissing after 3 seconds

**Given** a deletion fails
**When** the API returns an error
**Then** the task reappears in the list and a Toast slides in from the bottom with a warm error message, auto-dismissing after 3 seconds

**Given** any error occurs during an operation
**When** previously saved tasks exist in the database
**Then** no data is corrupted or lost — existing task data integrity is preserved

**Given** the app encounters any error
**When** the user continues interacting with the app
**Then** the app remains in a usable state with no crashes or broken UI

## Epic 6: Accessibility & Polish

Keyboard navigation, screen reader support, touch targets, and responsive refinements.

### Story 6.1: Keyboard Navigation & Screen Reader Support

As a user who relies on assistive technology,
I want to use the app fully with keyboard and screen reader,
So that the app is accessible to me.

**Acceptance Criteria:**

**Given** the app is loaded
**When** the user navigates with Tab
**Then** focus moves through input, submit button, task checkboxes, and delete buttons in logical DOM order with visible 2px coral focus outlines

**Given** a checkbox is focused
**When** the user presses Space
**Then** the completion state toggles (same behaviour as click)

**Given** a screen reader is active
**When** it reads a checkbox
**Then** it announces with `role="checkbox"`, `aria-checked`, and `aria-label="Mark [task text] as complete"`

**Given** a screen reader is active
**When** it reads a delete button
**Then** it announces with `aria-label="Delete task: [task text]"`

**Given** the task list is rendered
**When** a screen reader reads it
**Then** it uses semantic HTML (`<ul>`, `<li>`) with `aria-label="Task list, X items"`

**Given** a Toast error appears
**When** a screen reader is active
**Then** the Toast has `role="alert"` and `aria-live="polite"`

**Given** a skip link exists at the top of the page
**When** a keyboard user activates it
**Then** focus jumps directly to the TaskInput field

**Given** all interactive elements at any viewport size
**When** rendered
**Then** touch/click targets are at least 44x44px with sufficient spacing between them

## Epic 7: End-to-End Tests

Automated browser tests validating all core user journeys work correctly from the user's perspective.

### Story 7.1: Playwright E2E Test Suite

As a developer,
I want automated end-to-end tests covering all core user journeys,
So that I can verify the full application works correctly in a real browser.

**Acceptance Criteria:**

**Given** the application is running (frontend + backend + database)
**When** the Playwright test suite is executed
**Then** a minimum of 5 tests pass covering: create a task, complete a task, delete a task, empty state display, and error handling

**Given** a new user opens the app with no tasks
**When** the page loads
**Then** the empty state is displayed

**Given** the user types a task and submits
**When** the task is created
**Then** it appears in the task list

**Given** an active task exists
**When** the user clicks its checkbox
**Then** the task moves to the completed section with visual changes

**Given** a task exists
**When** the user clicks delete
**Then** the task is removed from the list

**Given** the backend is unavailable
**When** the app attempts to load tasks
**Then** the error state is displayed with a retry button

## Epic 8: Quality Assurance & Reports

Measure and document application quality across test coverage, accessibility, and security.

### Story 8.1: QA Reports

As a developer delivering a training course project,
I want documented quality reports,
So that I can demonstrate the application meets quality standards.

**Acceptance Criteria:**

**Given** the test suites exist
**When** coverage analysis is run
**Then** meaningful code coverage is at minimum 70%

**Given** the application is running
**When** an accessibility audit is performed (Lighthouse or axe-core)
**Then** zero critical WCAG AA violations are found

**Given** the application codebase
**When** a security review is performed
**Then** common vulnerabilities (XSS, injection) are documented with findings and remediations

## Epic 9: Containerisation

Dockerise the application so it runs via `docker-compose up`.

### Story 9.1: Docker Setup

As a developer deploying the application,
I want Docker containers for frontend and backend,
So that the application can be started with a single `docker-compose up` command.

**Acceptance Criteria:**

**Given** the repository is cloned
**When** `docker-compose up` is run
**Then** the frontend, backend, and database start and the application is usable in the browser

**Given** the Dockerfiles
**When** inspected
**Then** they use multi-stage builds, run as non-root users, and include health checks

**Given** the containers are running
**When** `docker-compose logs` is run
**Then** health status and application logs are accessible

**Given** the docker-compose configuration
**When** environment variables are reviewed
**Then** dev/test environments are supported through environment variables or compose profiles

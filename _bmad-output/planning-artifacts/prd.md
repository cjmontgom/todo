---
stepsCompleted: [step-01-init, step-02-discovery, step-02b-vision, step-02c-executive-summary, step-03-success, step-04-journeys, step-05-domain, step-06-innovation, step-07-project-type, step-08-scoping, step-09-functional, step-10-nonfunctional, step-11-polish]
inputDocuments: [product-brief-todo-2026-03-11.md]
workflowType: 'prd'
date: 2026-03-11
author: chlo
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
---

# Product Requirements Document - todo

**Author:** chlo
**Date:** 2026-03-11

## Executive Summary

Todo is a personal task management web application that delivers a focused, minimal CRUD experience: create, view, complete, and delete tasks. V1 is scoped as a BMAD training course deliverable, prioritising clean architecture, high UX polish, and codebase simplicity over feature breadth. The product targets individual users who want frictionless task capture and completion without the overhead of team-oriented tools (Asana) or the structural limitations of plain note apps (Google Keep, Apple Notes).

V1 is also the deliberate technical and UX foundation for a future neurodiverse-first productivity tool — designed for users who struggle with executive function, task paralysis, and the emotional weight of unfinished commitments. The longer-term roadmap includes task decomposition, dopamine-driven reward systems, energy-aware task suggestions, and shame-reducing guardrails. While none of these features are in V1 scope, their existence as concrete design targets informs V1's architecture decisions — data model, API surface, and component structure are shaped by knowing where the product needs to go.

### What Makes This Special

The extensibility in this project is not theoretical. Where most V1s are told to "be extensible" in the abstract, this product has a defined future roadmap (subtasks, priority levels, weekly planning with points-based estimation, partner sharing) that gives architecture decisions real targets. The result is a codebase designed to gracefully absorb complexity rather than have it bolted on after the fact.

Radical simplicity is treated as a design discipline, not a shortcut. V1 ships only four actions — create, view, complete, delete — at a high quality bar. Every interaction should feel instant and self-evident. The constraint is intentional: by keeping V1 to pure CRUD, the foundation can be validated before complexity is layered on, avoiding the degradation pattern where early feature creep compromises long-term product quality.

### Project Classification

| Dimension | Value |
|-----------|-------|
| **Project Type** | Web Application (responsive SPA, desktop and mobile browsers) |
| **Domain** | General / Personal Productivity |
| **Complexity** | Low (single-user CRUD, no auth, no integrations, no regulatory requirements) |
| **Project Context** | Greenfield (new product, no existing codebase) |
| **Business Context** | BMAD training course deliverable with genuine product evolution intent |

## Success Criteria

### User Success

- A new user can create, view, complete, and delete tasks without any onboarding, tutorial, or explanation. The interface is self-evident.
- All user actions are reflected immediately in the UI. Interactions feel instantaneous under normal conditions.
- Completed tasks are visually distinguishable from active tasks at a glance — a user can scan their list and immediately understand what's done and what's not.
- Data persists reliably across page refreshes and browser sessions. A user can close the app, reopen it, and find their tasks exactly as they left them.
- The interface works well on both desktop and mobile devices without usability degradation.
- Failures are handled gracefully without disrupting the user's flow. Sensible empty, loading, and error states are present throughout.

### Business Success

- V1 has no commercial, growth, or monetisation objectives. Success is defined purely by the quality of the delivered product against this PRD specification and as a demonstration of the BMAD development methodology.
- The delivered product feels complete and polished despite its minimal scope — it should not feel like a prototype or partial implementation.

### Technical Success

- The codebase is simple, readable, and easy for a future developer to understand and extend.
- Dependencies are minimal. Maintainability and long-term risk reduction are prioritised.
- The architecture supports future feature additions through additive changes rather than restructuring existing code.
- The backend exposes a small, clean RESTful API with data consistency and durability guarantees.

### Measurable Outcomes

| Outcome | Measure | Target |
|---------|---------|--------|
| Zero-onboarding usability | New user completes all four core actions without guidance | Pass/fail — no assistance required |
| Data durability | Tasks persist across refresh, session close, browser restart | Zero data loss under normal use |
| Interaction speed | UI updates on create, complete, delete | Immediate — no perceptible delay |
| Visual clarity | Active vs. completed task distinction | Unambiguous at a glance |
| Cross-device | Desktop and mobile usability | Fully responsive, no functionality gaps |
| Error resilience | Graceful handling of failures | Empty, loading, and error states present |
| Extensibility | Adding auth/multi-user requires only new endpoints and tables | Minimal changes to existing code |
| Scope discipline | No features built outside MVP specification | Nothing shipped that isn't in the PRD |

## User Journeys

### Journey 1: Core Task Management (Success Path)

A user opens the app in their browser. The page loads quickly and they immediately see a list of tasks already present — pre-seeded data that demonstrates the full-stack connection between frontend and backend. The interface is clean and self-evident: tasks are listed with clear visual hierarchy, and the means to add a new task is immediately obvious.

They type a short description and create a new task. It appears in the list instantly. They scan the list, spot a task they've finished, and mark it complete. The task's visual state changes immediately — it's clearly distinguishable from active tasks without ambiguity. They decide an old task is no longer relevant and delete it. It disappears from the list without fuss.

At no point did they need instructions, tooltips, or onboarding. Every action was obvious, every response was instant, and the interface never got in the way.

**Capabilities revealed:** Task CRUD operations, instant UI feedback, visual completion state, responsive layout, pre-seeded data, self-evident interface design.

### Journey 2: Error Recovery (Edge Case)

A user is managing their tasks when the backend becomes temporarily unavailable. They attempt to create a new task. Instead of a silent failure or a cryptic error, the app displays a clean, simple error message that communicates the problem without technical jargon. The app doesn't crash or enter a broken state — it remains usable and the error is clearly presented.

When the backend recovers, the user retries the action and it succeeds normally. No data was corrupted and previously saved tasks are intact.

**Capabilities revealed:** Graceful error handling, clean error state UI, no data corruption on failure, resilient frontend that doesn't break on backend unavailability.

### Journey Requirements Summary

| Capability | Revealed By |
|-----------|-------------|
| Task creation with text input | Journey 1 |
| Task list display on load | Journey 1 |
| Task completion toggle with visual feedback | Journey 1 |
| Task deletion | Journey 1 |
| Instant UI updates on all actions | Journey 1 |
| Pre-seeded database with sample tasks | Journey 1 |
| Self-evident interface (zero onboarding) | Journey 1 |
| Responsive layout (desktop and mobile) | Journey 1 |
| Graceful error state with clean messaging | Journey 2 |
| Frontend resilience during backend unavailability | Journey 2 |
| Data integrity across failures | Journey 2 |

## Product Scope

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP — the goal is not to validate whether users need task management, but to deliver a polished, complete-feeling product that validates the quality bar, UX philosophy, and architectural foundation. V1 succeeds by being excellent at a small number of things, not by covering a broad feature set.

**Resource Requirements:** Solo developer (BMAD training context). The deliberately minimal scope is sized for individual delivery.

### MVP Feature Set (Phase 1)

**Task Management (the complete V1 feature set):**
- Create a todo item with a short text description
- View all todo items immediately upon opening the app
- Complete a todo item (toggle completion status)
- Delete a todo item

**Task Data Model:**
- Short textual description
- Completion status (active / completed)
- Creation timestamp

**Frontend:**
- Responsive SPA (React) across desktop and mobile
- Instant UI updates on all task actions
- Completed tasks visually distinct from active tasks
- Sensible empty state, loading state, and error states
- Clean, line-based aesthetic — the feel of a well-organised paper notebook page
- Zero onboarding required

**Backend:**
- Standalone RESTful CRUD API, decoupled from the frontend
- Persistent data storage with consistency and durability
- Pre-seeded database with sample tasks for initial demonstration
- Basic error handling on client and server
- Architecture designed for additive extension

### Post-MVP Features

**Phase 2 (Growth):**
- Subtasks and task decomposition
- Task status workflow (to do / in progress / done)
- Priority levels (high / medium / low)
- Task categories and grouping
- User accounts and authentication
- Search and filtering

**Phase 3 (Expansion):**
- Weekly task planner with points-based estimation
- Dopamine menu and reward systems
- Shame-reducing guidance and commitment guardrails
- Energy/context-aware task suggestions
- Partner sharing
- AI-assisted features (task breakdown, voice capture)
- Progressive Web App or native experience

### Risk Mitigation Strategy

**Scope Creep:** The primary risk. Mitigated by explicit scope discipline as a measurable outcome — nothing ships that isn't in the PRD. The out-of-scope list is documented and non-negotiable for V1.

**Over-Engineering:** Designing for future extensibility is a stated goal, but V1 must not gold-plate the architecture for features that may never ship. The bar is "additive changes are possible" — not "every future feature is pre-built." Keep it simple, keep it clean.

**Technical Risk:** Low. CRUD on a single entity with a standard tech stack (React + REST API + relational database) is well-understood territory. No novel technology, no integration complexity.

**Market Risk:** None for V1. This is a training deliverable, not a market bet. Success is measured against the PRD, not against user acquisition or revenue.

## Web App Specific Requirements

### Technical Architecture

**Rendering:** Client-side SPA (React). All UI rendering happens in the browser after initial JS bundle load. No SSR, no static site generation. This prioritises instant-feeling interactions and clean frontend/backend separation over first-paint speed — an acceptable trade-off for a productivity tool where users return repeatedly rather than arriving from search.

**Browser Support:** Modern evergreen browsers only — Chrome, Firefox, Safari, Edge (current and previous major version). No IE support. No polyfills for legacy browsers.

**SEO:** Not required. No public-facing content that needs search engine indexing.

**Real-Time:** Not required for V1. Single-user, no collaboration. Standard HTTP request-response for all operations. The architecture should not prevent adding WebSocket support later.

### Responsive Design

- Fully responsive single layout across desktop and mobile browsers
- Mobile-first or desktop-first approach is an architecture decision, but both breakpoints must be well-supported
- Touch-friendly targets on mobile (minimum 44x44px tap areas)

### Implementation Considerations

- React as the frontend framework — lightweight setup without a meta-framework (no Next.js, no Remix)
- Standalone RESTful API backend — framework and language to be determined at architecture stage
- API designed as an independent service to support future client diversity (mobile app, PWA)

## Functional Requirements

### Task Management

- FR1: User can create a new task by providing a short text description
- FR2: User can mark an active task as complete
- FR3: User can mark a completed task as active (toggle completion status)
- FR4: User can delete a task permanently
- FR5: User can view all tasks (both active and completed) immediately upon opening the app

### Task Display & Visual State

- FR6: User can distinguish active tasks from completed tasks at a glance through clear visual differentiation
- FR7: User can see when a task was created (creation timestamp stored per task)
- FR8: User can view and interact with tasks on both desktop and mobile devices without loss of functionality

### Data & Persistence

- FR9: System persists all task data across page refreshes and browser sessions
- FR10: System pre-seeds the database with sample tasks so that the app displays content on first use
- FR11: System stores each task with a text description, completion status, and creation timestamp

### Error Handling & Resilience

- FR12: System displays a clear, non-technical error message when a task operation fails
- FR13: System remains in a usable state when the backend is temporarily unavailable (no crashes, no broken UI)
- FR14: System preserves existing task data integrity when errors occur during operations

### Interface & Accessibility

- FR15: User can perform all task operations (create, complete, delete) using keyboard navigation alone
- FR16: User can access all interactive elements via screen reader with meaningful labels
- FR17: User can interact with all controls via touch on mobile devices (minimum 44x44px tap targets)

## Non-Functional Requirements

### Performance

- NFR1: All task operations (create, complete, delete) must produce visible UI feedback within 200ms under normal conditions
- NFR2: Initial page load (including fetching tasks from the API) must complete within 2 seconds on a standard broadband connection
- NFR3: The frontend JS bundle should remain small — no unnecessary dependencies beyond React and essential libraries

### Accessibility

- NFR4: All interactive elements must have sufficient colour contrast (minimum 4.5:1 ratio for normal text)
- NFR5: The application must contain no major accessibility failures — no keyboard traps, no unlabelled form controls, no missing ARIA roles where semantic HTML is insufficient

### Maintainability & Extensibility

- NFR6: The codebase must be understandable by a new developer without requiring a walkthrough — clear file structure, self-explanatory naming, minimal indirection
- NFR7: The API must be designed as a standalone service, decoupled from the frontend, so that future clients can consume it without modification
- NFR8: Future features (authentication, multi-user, subtasks, priorities) must be achievable through additive changes (new endpoints, new tables) with minimal modification to existing code
- NFR9: Dependencies must be kept to the minimum necessary — every library included must have a clear justification

### Scalability

- NFR10: The architecture must not introduce patterns that would prevent future horizontal scaling — no hard-coded single-instance assumptions, no local filesystem state, no in-memory data stores as primary persistence

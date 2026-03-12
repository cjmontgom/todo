# Sprint Change Proposal

**Date:** 2026-03-12
**Project:** todo
**Triggered by:** Training course deliverable requirements discovered mid-sprint

## 1. Issue Summary

The project was planned and scoped from the PRD alone. Mid-way through implementation (after Stories 1.1–3.1), the full training course task description was reviewed, revealing additional deliverables not covered by the original plan:

- Playwright E2E test suite (minimum 5 passing tests)
- Docker containerisation (`docker-compose up` must work)
- QA reports (70% coverage, accessibility audit, security review)
- Documentation (README, AI integration log)

These are delivery/packaging requirements around the working application, not changes to the application itself.

## 2. Impact Analysis

### Epic Impact

- **Epics 1–6:** No changes. All existing epics remain valid and needed.
- **New epics required:** 3 (E2E Tests, QA Reports, Docker Setup)

### Artifact Conflicts

- **PRD:** No conflicts. Product requirements unchanged.
- **Architecture:** Minor additive updates — health check endpoint and Docker noted as deployment option.
- **UX Spec:** No conflicts.
- **Sprint Status:** New epics added to tracking.

### Technical Impact

- Health check endpoint added to backend (trivial — single GET route)
- Playwright installed as dev dependency for E2E tests
- Docker/Docker Compose configuration files added at project root
- Coverage tooling configuration for reporting

## 3. Recommended Approach

**Direct Adjustment** — add new epics to the existing plan, sequenced after the current six.

**Rationale:** No existing work needs to change. The app MVP is unaffected. The new requirements layer cleanly on top once the working app is complete. Low risk, medium effort.

**Sequencing:**
1. Complete existing Epics 4–6 (finish the working app)
2. Epic 7: E2E Tests (validate the app works)
3. Epic 8: QA Reports (measure and document quality)
4. Epic 9: Docker Setup (containerise for deployment)

## 4. Detailed Change Proposals

### 4.1 Epics Document (`epics.md`)

**Add Epic 7: End-to-End Tests**
- Story 7.1: Playwright E2E Test Suite — setup Playwright, write 5+ tests covering create, complete, delete, empty state, error handling

**Add Epic 8: Quality Assurance & Reports**
- Story 8.1: QA Reports — coverage analysis (70% target), accessibility audit (WCAG AA), security review

**Add Epic 9: Containerisation**
- Story 9.1: Docker Setup — Dockerfiles (multi-stage, non-root), docker-compose.yml, health check endpoint, environment config

### 4.2 Architecture Document (`architecture.md`)

- Add `GET /api/health` endpoint to API Endpoints table
- Add Docker + Docker Compose row to Infrastructure & Deployment table

### 4.3 Sprint Status (`sprint-status.yaml`)

- Add epic-7, epic-8, epic-9 with their stories in backlog status

## 5. Implementation Handoff

**Scope classification:** Minor — direct implementation by dev team.

**Immediate next step:** Continue with Epic 4 (Story 4.1: Delete a Task). No interruption to current sprint flow.

**Handoff:** Development team continues the create-story → dev-story cycle through the remaining epics in order.

**Success criteria:**
- Working Todo app with all CRUD operations
- 5+ passing Playwright E2E tests
- 70% meaningful test coverage
- Zero critical WCAG violations
- Application runs via `docker-compose up`
- README with setup instructions
- AI integration log documenting BMAD usage

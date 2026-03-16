# AI Integration Log

**Project:** Todo App

**Framework:** BMAD Method (v6.0.4)

**IDE:** Cursor

---

## TL;DR

BMAD provided a highly structured way to plan and ship an AI-assisted project, but that structure came at a cost: I felt removed from the actual code in a way I am unfamiliar with. It feels like more structured/accurate vibe coding in that way. There's too much output to read every word, so you end up trusting the agents rather than verifying everything. This gave me a feeling of a lack of control. The planning phase produced solid, comprehensive artifacts, though the agents needed constant oversight to avoid scope creep. Course corrections were neccessary, and happened twice, but they were both due to my own human error. The code review agent turned out to be the standout tool for me. The biggest takeaway: trust the agents, but stay engaged enough to catch their repeated mistakes, and be mindful of token cost. Sometimes a few minutes of manual investigation is both faster and cheaper than handing the problem to an agent from scratch. 

Overall I learned a lot from the process and was really impressed with the output, but found it hard to maintain concentration in my new role as orchestrator and not coder. Both the app and the codebase are very clean. Unsurprisingly, agents seem to collaborate better on sticking to a structure and design pattern than humans do.

---

## Timeline

### 1. Product Brief

Gave a fuller product spec than strictly required — describing a later version of the app (a todo app for people with ADHD) — to provide guardrails for keeping the project extendable without being vague about it. This turned out to be a big time cost.

### 2. PRD

Defined 17 functional requirements and 10 non-functional requirements. Making it not over-engineer requires complete focus and reading every word of output to catch things the AI is adding in at the planning stage.

### 3. UX Design

Ran the UX workflow twice across two separate sessions, producing both a written spec and an HTML prototype of design directions. Difficult to focus when the flow keeps being broken by the AI processing. I normally "lock in" which can't happen here. My focus drifts.

### 4. Architecture

Winston the architect tried to add an ORM, migration tooling, and workspace tooling — had to push back to keep things minimal. Accessibility also somehow became a primary concern between planning and architecting; it had been secondary in the PRD but got elevated at some point and I missed it.

Changing your mind on something mid-process leaves docs that don't align across agents. This happened when I changed course on having a pre-seeded database. Later agents were visibly confused by the discrepancy between planning artifacts. I hadn't discovered the "change course" workflow yet.

### 5. Epics & Stories

Didn't want to drag through everything again after many hours with other agents producing comprehensive docs. Telling the PM I was short on time successfully condensed the steps in the epic creation role. Produced 6 epics with stories covering all functional requirements. Good to know the BMAD agents are flexible in this way.

### 6. Implementation Readiness & Sprint Planning

Validated alignment across all planning artifacts before entering the sprint.

### 7. Development begins

Followed the advice of the bmad-help agent and used the scrum master to create tickets and the dev to implement. Didn't initially use the QA agent or retrospective — ended up doing the QA role myself, finding and fixing bugs directly. The developer agent was instructed to commit in sensible chunks.

### 8. Course correction #1

Realised partway through development that I had not seen the requirements in the original Leapsome brief and had just been working from the PRD document. Asked bmad-help, which suggested the Correct Course workflow. The new requirements included Docker/Docker Compose, Playwright E2E tests, QA deliverables, and documentation that weren't in the original plan. Also started using the QA agent from this point instead of doing that role myself, as instructed by the requirements.

The course-correct workflow handled the pivot well — easy to plug in the new requirements, and it identified which older artifacts needed updating without much prompting.

### 9. Settling into a workflow

After the course correction, adopted a consistent four-step cycle for each story: Create Story → Dev Story → QA → Code Review (CS → DS → QA → CR). QA kept implementation honest against requirements; code review was exploratory at first but quickly earned its place.

### 10. Structured vibe coding

BMAD feels like structured vibe coding. There's too much output to read every word, so you end up trusting the agents rather than verifying everything. Compared to other SDD coding approaches, BMAD creates more distance from the actual codebase — losing that familiarity and sense of control is uncomfortable. You have to be okay with riding the wave.

### 11. Course correction #2 — Playwright

After Epic 4, it became clear that Playwright hadn't actually been set up — the QA agent had skipped writing tests entirely. Rather than running the formal course-correct workflow again (last time token cost was very high), I handled it more manually: used the Quick Flow Solo Dev (Barry) to install Playwright and write a basic smoketest, then had the QA agent retroactively write tests for all completed epics.

### 12. Fresh context, same problems

Without persistent memory, agents repeatedly re-discovered the same problems from scratch. The QA/E2E agent, for example, would every time: try to start the app (port already in use), work out that it needed `CI= npx playwright test`, attempt to run tests in sandbox (fail), and finally run them outside sandbox. Fresh context means no institutional memory and either literally everything has got to be in documentation, or you have to be ok with the repetition of agents tripping on the same thing.

### 13. Code review brings a broader lens

The code review agent flagged an incorrect sprint status on one of the epics as a high-priority finding. Agents can definitely be a bit dramatic.  

### 14. Becoming token-conscious

Seeing the overall token cost of the project changed the approach. When E2E tests were failing, spending three minutes investigating manually and then directing an agent on how to fix it was both faster and significantly cheaper than handing the problem to an agent from scratch. By the end, had swung back toward being more hands-on.

### 15. Code review as standout tool

The code review agent became a favourite. Reviewing each epic immediately on completion catches issues while they're still in context — before they become bugs that a future agent has to debug without the constraints or framing of the original story. It's a genuinely efficient safeguard.

---

## Stats

| Metric | Value |
|--------|-------|
| Total agent sessions | — |
| Distinct personas used | 9 (Analyst, PM, UX Designer, Architect, Scrum Master, Developer, QA, Code Review, Quick Flow Solo Dev) |
| Planning artifacts | 7 |
| Stories / epics completed | 9 of 9 |
| Course corrections | 2 |

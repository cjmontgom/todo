---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments: []
date: 2026-03-11
author: chlo
---

# Product Brief: todo

## Executive Summary

Todo is a personal task management application designed to be exceptionally simple, clean, and instantly usable. The V1 product delivers a focused full-stack todo app that prioritizes clarity, speed, and ease of use above all else — an app so intuitive that no onboarding is needed and even a child could use it.

While the initial release is deliberately minimal in scope (create, view, complete, and delete tasks), the product is architected with a longer-term vision in mind: to evolve into a holistic productivity tool designed around the needs of neurodiverse users — particularly those who struggle with executive function, follow-through, and the emotional weight of unfinished tasks. The future vision includes ADHD-friendly features such as task decomposition guidance, shame-reducing guardrails, dopamine-driven reward systems, and structured weekly planning. However, V1 focuses purely on delivering a best-in-class simple task management experience as the technical and UX foundation for that journey.

The product will initially be built as a responsive web application usable across desktop and mobile browsers, with the possibility of evolving into a Progressive Web App or native experience in the future.

---

## Core Vision

### Problem Statement

People who struggle with executive function and follow-through lack a task management tool that meets them where they are. The current landscape forces a choice between two inadequate extremes: powerful but cluttered team-oriented tools like Asana (which require significant learning curves and too many clicks to do simple things), or ultra-simple tools like Google Keep (which are great for brain dumps but do nothing to bridge the gap to actual productivity). Neither end of this spectrum addresses the emotional and cognitive barriers that prevent people from getting things done — task paralysis, over-commitment, shame from unfinished lists, and the vague low-level anxiety of feeling like something has been forgotten.

### Problem Impact

For people affected by executive function challenges — whether diagnosed with ADHD, suspecting it, or simply struggling with these patterns — the consequences are real and daily. Life admin accumulates, projects stall, and a persistent sense of being overwhelmed erodes confidence and wellbeing. Existing tools either add to the cognitive load or fail to provide the structure needed to move from "I should do this" to "I did this." The result is a cycle of avoidance, guilt, and diminished productivity that affects quality of life.

### Why Existing Solutions Fall Short

- **Team-oriented tools (Asana, etc.):** Feature-rich but noisy. Designed for collaboration, which means cluttered interfaces, steep learning curves, and friction in basic task creation. The complexity itself can be a barrier for someone who struggles to start.
- **Simple note/list apps (Google Keep, Apple Notes):** Frictionless for capturing thoughts, but offer no structure, no progress tracking, and no path from brain dump to done. Tasks sit in a list with no follow-through support.
- **ADHD-specific tools (Tiimo, Routinery):** Focus on daily routine scaffolding (brushing teeth, meals) rather than the higher-level life tasks — admin, projects, goals — that create the most anxiety and guilt when left undone.
- **Across the board:** No existing tool meaningfully addresses the emotional dimension of task management — the shame of unfinished lists, the paralysis of poorly-scoped tasks, or the lack of intrinsic motivation and reward.

### Proposed Solution

V1 delivers a clean, reliable, full-stack todo application with a laser focus on usability. Users can create, view, complete, and delete tasks with minimal friction. The interface is responsive across devices, updates are reflected instantly, and the experience feels polished from the first interaction. The architecture is designed to gracefully accommodate future feature growth — including subtasks, priority levels, status workflows, weekly planning, reward systems, and AI-assisted task management — without requiring a redesign.

The long-term product vision is to create a holistic personal productivity tool that is designed around how neurodiverse brains actually work: reducing shame, breaking down barriers to starting, providing motivation through rewards, and guiding users toward realistic commitments. While built with ADHD users in mind, the resulting experience would be beneficial and appealing to anyone.

### Key Differentiators

- **Radical simplicity as a feature:** V1 is intentionally minimal — not as a limitation, but as a design philosophy. Every interaction should feel instant and obvious.
- **Architected for graceful growth:** Unlike tools that bolt on features and degrade over time (the Monzo cautionary tale), this product is designed from day one to expand without losing its core simplicity.
- **Future neurodiverse-first design:** The long-term roadmap addresses the emotional and cognitive dimensions of productivity — shame reduction, dopamine-driven motivation, realistic commitment guardrails — that no mainstream tool meaningfully tackles.
- **The "missing middle":** Occupies the gap between powerful-but-overwhelming and simple-but-shallow, aiming to be both easy and effective.
- **Inclusive by design:** Built for ADHD brains but framed and useful for everyone. The principle: what's good for neurodiverse users is good for all users.

## Target Users

### Primary Users

#### Persona 1: "Maya" — The Overwhelmed Avoider

**Background:** Maya is in her early 30s. She's intelligent and capable but struggles significantly with executive function — she may have undiagnosed ADHD. She lives with her partner, who helps with a lot of the life admin, but before that relationship she frequently missed deadlines and dropped the ball on important tasks like tax returns and bills.

**Day-to-day reality:** Maya's productivity is heavily driven by environmental and emotional factors — a sunny day, a burst of energy, visitors coming over, or sheer boredom can trigger a productive spell. But on low-energy days, she falls into a "rot day" pattern: bingeing TV, avoiding tasks, and then feeling ashamed for not accomplishing anything. The shame compounds — making it even harder to start the next day.

**Relationship with tasks:** Big looming tasks (tax returns, important admin) get put off until the absolute last moment — the deadline itself becomes the only motivator. She doesn't break tasks down, so they loom large and feel bigger than they are, creating paralysis. When she's bored and has nothing else to do, she'll sometimes tackle a boring task just for the dopamine hit of completing something. Crucially, the *type* of task she gravitates toward depends on her energy state and environment — on a high-energy sunny morning, she'll choose active, physical tasks (laundry, cleaning, gardening) rather than sitting at a computer for admin. On low-energy or rainy days, sedentary tasks might actually be a better fit. This distinction between task types and energy/context is a rich design space for the future product.

**What she needs from todo:** An app that doesn't add to her cognitive load. Something she can open, immediately understand, and start using. She'd be drawn in by a setup/customisation experience that feels personal and fun — like the app is adapting to *her*, not the other way around. Features that feel optional and toggleable, so it never becomes overwhelming. Eventually: gentle nudges, realistic planning guardrails, rewards for consistency, and context-aware task suggestions that match her energy level and environment.

**Success looks like:** Maya feels on top of things. The vague background anxiety of "I'm forgetting something" is replaced by a sense of control. Even on a low-energy day, she can look at her list and see that things are manageable — and the app helps her pick the right task for how she's feeling right now. Completing tasks gives her a genuine sense of accomplishment rather than just relief.

---

#### Persona 2: "Sam" — The Frustrated Productive

**Background:** Sam is a working professional who is generally productive and organised. He uses tools like Asana for task management and Google Keep for quick notes. He doesn't struggle with executive function in the same way as Maya, but he's frustrated by the gap between his tools.

**Day-to-day reality:** When Sam thinks of something he needs to do, he tries to put it straight into Asana — because if he doesn't, it gets lost. But even after capturing it, tasks often just sit there undone. Asana's interface feels heavy for personal use — it was designed for teams, and the overhead of clicks and navigation friction means he sometimes just opens Google Keep instead because it's faster. But Keep has no structure, no completion tracking, and no follow-through support.

**Relationship with tasks:** Sam doesn't struggle to *start* tasks, but he wants the process of managing them to feel effortless. He's annoyed by tools that are either too simple to be useful or too complex to be pleasant. He wants something that "just works" for personal task management without the noise.

**What he needs from todo:** Speed. Minimal clicks to create a task. A clean, uncluttered interface. Instant feedback. Something that replaces both the heavyweight project tool and the throwaway note — sitting perfectly in the middle.

**Success looks like:** Sam opens one app for personal tasks instead of bouncing between two. Capturing a task takes seconds. The app doesn't try to do too much, but does what it does exceptionally well.

### Secondary Users

For V1, there are no secondary users — the app is single-user with no collaboration features. However, the architecture should accommodate future possibilities:

- **Supportive partners/family:** People like Sam who help manage life admin for someone like Maya. A future feature could allow shared visibility into task lists — not a full team workspace, but a lightweight "partner sharing" model (similar to Google Photos partner sharing). This would let a supportive partner see what's on someone's plate without taking over.
- **Coaches/therapists:** In a more distant future, professionals supporting someone with ADHD or executive function challenges might benefit from visibility into a client's task patterns and progress — but this is a much later consideration.

### User Journey

#### Maya's Journey (Primary)

1. **Discovery:** Finds the app through word of mouth, social media, or a recommendation from her partner/therapist. The positioning ("finally, a task app that gets how your brain works") resonates immediately.
2. **First 30 seconds:** Opens the app and is greeted with a brief, engaging setup flow — clickable, visual, fun. It asks a few questions to personalise the experience. It feels like the app is being tailored to her, not asking her to learn a system. She toggles on only the features she wants.
3. **First task:** Creates her first task in seconds. The interface is so clean and obvious that she doesn't need to think about how. She feels a small hit of accomplishment just from writing it down.
4. **Aha moment:** She completes a task and the app makes it feel *good*. Not in a patronising way, but in a way that acknowledges the effort. Over time, the weekly planning and dopamine menu features (future) turn this into a genuine reward loop. Eventually, the app even suggests the right type of task for her current energy — "Sunny morning? Here are your active tasks."
5. **Long-term:** The app becomes her external brain for life admin. The background anxiety fades. She starts to trust that if it's in the app, it won't be forgotten. She begins to plan weeks ahead rather than reacting to deadlines.

#### Sam's Journey (Primary)

1. **Discovery:** Frustrated with Asana for personal use, searches for a simpler alternative. Or his partner Maya recommends it.
2. **First 30 seconds:** Opens the app. No sign-up wall, no tutorial. He sees an empty task list and an obvious way to add a task. Types one in. Done. He immediately thinks "this is what I wanted."
3. **Core usage:** Replaces Google Keep for task capture and Asana for personal tracking. One app, minimal friction. Tasks are created fast, completed with a tap, and the list stays clean.
4. **Aha moment:** Realises he hasn't opened Google Keep in a week. Everything is in one place and nothing has fallen through the cracks.
5. **Long-term:** Becomes his default personal productivity tool. As new features roll out, he toggles on only what he needs. The app grows with him without ever feeling cluttered.

## Success Metrics

### User Success Criteria

Success for V1 is measured against the core PRD requirements. No analytics, telemetry, or growth metrics are in scope.

- **Task completion without guidance:** A user can create, view, complete, and delete tasks without any onboarding, tutorial, or explanation. The interface is self-evident.
- **Instant interaction feedback:** All user actions (adding, completing, deleting tasks) are reflected immediately in the UI. Interactions feel instantaneous under normal conditions.
- **Visual status clarity:** Completed tasks are visually distinguishable from active ones at a glance. A user can scan their list and immediately understand what's done and what's not.
- **Session durability:** Data persists reliably across page refreshes and browser sessions. A user can close the app, reopen it, and find their tasks exactly as they left them.
- **Cross-device usability:** The interface works well on both desktop and mobile devices without degradation in usability.
- **Graceful error handling:** Failures on the client or server side are handled gracefully without disrupting the user's flow. Sensible empty, loading, and error states are present.

### Technical Success Criteria

- **Simplicity:** The codebase is easy to understand, navigate, and extend by future developers.
- **Minimal dependencies:** The solution avoids unnecessary libraries or frameworks, prioritising maintainability and reducing long-term risk.
- **Extensible architecture:** While V1 excludes authentication, multi-user support, prioritisation, deadlines, and notifications, the architecture does not prevent these from being added later.
- **Well-defined API:** The backend exposes a small, clean CRUD API with data consistency and durability guarantees.
- **Performance:** The application loads fast and all interactions feel instantaneous under normal conditions.

### Business Objectives

V1 is a side project and a demonstration of BMAD development methodology. There are no commercial, growth, or monetisation objectives for this version. Success is defined purely by the quality of the delivered product against the PRD specification.

The door remains open for future evolution toward a broader user base and potential commercialisation, but these considerations are explicitly out of scope for V1.

### Key Performance Indicators

KPIs for V1 are qualitative, not quantitative:

| KPI | Measure | Target |
|-----|---------|--------|
| Usability | Can a new user complete all core actions without guidance? | Yes — zero onboarding required |
| Stability | Does data persist reliably across refreshes and sessions? | Zero data loss under normal use |
| Responsiveness | Do interactions feel instantaneous? | UI updates reflected immediately on action |
| Visual clarity | Can a user distinguish active vs. completed tasks at a glance? | Clear visual differentiation |
| Cross-device | Does the app work well on desktop and mobile? | Fully responsive, no usability gaps |
| Error resilience | Are failures handled without disrupting user flow? | Graceful empty, loading, and error states |
| Maintainability | Can a future developer understand and extend the codebase? | Clean architecture, minimal dependencies |
| Extensibility | Does the architecture allow future features without redesign? | Auth, multi-user, priorities can be added later |

## MVP Scope

### Core Features

V1 delivers the minimum set of features required to provide a complete, usable personal task management experience as defined by the PRD. The guiding principle is: **if in doubt, don't build it.**

**Task Management:**
- **Create** a todo item with a short text description
- **View** all todo items immediately upon opening the app
- **Complete** a todo item (toggle completion status)
- **Delete** a todo item

**Task Data Model:**
- Short textual description
- Completion status (active / completed)
- Creation timestamp

**Frontend:**
- Responsive design that works well across desktop and mobile devices
- Instant UI updates when tasks are created, completed, or deleted
- Completed tasks visually distinguishable from active tasks at a glance
- Sensible empty state (no tasks yet), loading state, and error states
- Clean, line-based aesthetic inspired by a well-organised paper notebook page — the feel of someone arranging tasks in a journal with care and slight perfectionism
- Zero onboarding — the interface is self-evident on first use

**Backend:**
- Small, well-defined RESTful API supporting CRUD operations
- Persistent data storage with consistency and durability across sessions
- Basic error handling on both client and server side
- Architecture that does not prevent future addition of authentication, multi-user support, or other features

### Out of Scope for MVP

The following are explicitly excluded from V1. These may be considered in future iterations but are intentionally omitted to maintain focus and simplicity:

- User accounts and authentication
- Multi-user support or collaboration
- Task prioritisation (high/medium/low)
- Task status workflow (to do / in progress / done)
- Subtasks or task decomposition
- Deadlines or due dates
- Notifications or reminders
- Categories, tags, or grouping
- Search or filtering
- Weekly planning, sprints, or points
- Dopamine menu or reward systems
- Shame-reduction messaging or guidance
- Calendar view or calendar integration
- AI-assisted features (task breakdown, voice input)
- Analytics, telemetry, or usage tracking
- Progressive Web App (PWA) capabilities
- Partner sharing or visibility features
- Onboarding flow or setup customisation
- Any feature not explicitly listed in Core Features above

### MVP Success Criteria

V1 is successful when all of the following are true:

1. A user can complete all four core actions (create, view, complete, delete) without any guidance or onboarding
2. The application is stable across page refreshes and browser sessions — zero data loss under normal use
3. The user experience is clear, polished, and feels like a complete product despite its minimal scope
4. The interface works well on both desktop and mobile devices
5. Interactions feel instantaneous under normal conditions
6. The codebase is clean, simple, and easy for a future developer to understand and extend
7. The architecture supports future feature additions without requiring a redesign

### Future Vision

The long-term vision for todo extends well beyond V1, evolving from a simple task manager into a holistic personal productivity tool designed for neurodiverse users. Future iterations may include (in rough priority order):

**Near-term enhancements:**
- Subtasks and task decomposition
- Task status workflow (to do → in progress → done)
- Priority levels (high / medium / low)
- Task categories/grouping
- User accounts and authentication

**Medium-term features:**
- Weekly task planner with points-based estimation (sprint-style)
- Weekly review with progress visualisation (burndown chart)
- Dopamine menu — customisable reward system for meeting weekly goals
- Consistency rewards (e.g. meeting goals 4 weeks in a row unlocks a bigger reward)
- Shame-reducing guidance ("Remember not to over-commit — your average is 17 points")
- Task decomposition suggestions ("This looks like it could be broken into smaller subtasks")
- Toggleable features — users control their own complexity level
- List and calendar view options
- Engaging setup/personalisation flow on first use

**Longer-term vision:**
- Energy/context-aware task suggestions (matching task type to energy state and environment)
- Calendar integration (Google Calendar, iCal)
- Partner sharing — lightweight visibility into each other's task lists
- Progressive Web App or native app experience
- AI agent integration (task breakdown, voice-to-task capture)
- Optional ADHD-specific profiling and tailored in-app messaging

**Design philosophy for growth:** Every future feature must be additive, not disruptive. The app should grow gracefully like a well-designed product, not accumulate features that degrade the experience. The Monzo cautionary tale applies: complexity must never come at the cost of usability. Features should be toggleable where possible, so each user controls their own experience.

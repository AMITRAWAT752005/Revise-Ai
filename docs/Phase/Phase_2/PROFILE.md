# Phase 2 — Home / Dashboard Profile

## 1. Phase Overview

**Phase:** Phase 2  
**Name:** Home / Dashboard  
**Status:** Planned  
**Previous Phase:** Phase 1 — Authentication  
**Primary Goal:** Build the authenticated ReviseAI Home/Dashboard page as the student's central learning hub.

Phase 2 is limited to the **Home/Dashboard page**. It must integrate correctly with the completed authentication system and provide working navigation to the respective routes for every actionable button/link shown on the Home page.

The SRS defines the Dashboard as the central learning hub and specifies a Welcome Section, Daily Revision Card, Streak Card, Readiness Card, and Subject Overview. 

---

## 2. Phase 2 Objectives

- Build the complete Home/Dashboard UI.
- Reuse the existing ReviseAI design system and Phase 1 authenticated layout.
- Display authenticated user information.
- Provide the dashboard's core progress and learning overview.
- Implement appropriate loading, empty, error, and success states.
- Make every actionable Home-page button/link functional.
- Ensure every Home-page action redirects to its correct route.
- Keep Phase 1 Authentication stable and unchanged except where integration is strictly necessary.
- Keep all future-phase functionality outside this phase while still providing correct navigation to its routes.

---

## 3. Scope

### 3.1 In Scope

#### A. Dashboard Shell
- Authenticated Home/Dashboard route.
- Existing sidebar/navbar integration.
- Home navigation item highlighted.
- Header/profile area.
- Responsive layout for mobile, tablet, and desktop.
- Consistent spacing, typography, icons, colors, and UI texture.

The SRS requires every screen to support mobile, tablet, and desktop. 

#### B. Welcome Section
Display a personalized greeting using authenticated user information.

Example:
```text
Good Morning, Bikram 👋
Ready to make progress today?
```

The SRS specifies the Dashboard Welcome Section as a core component. fileciteturn10file4L1214-L1227

#### C. Daily Revision Card
Display the user's current daily revision information.

Example:
```text
15 Questions Due Today
[Start Revision]
```

The SRS specifies that the Dashboard Daily Revision Card displays questions due today. 

If revision data is not yet available, use an honest loading/empty/unavailable state rather than inventing real student data.

#### D. Streak Card
Display the current learning streak.

Example:
```text
🔥 21 Days
Current Streak
```

The SRS specifies a Dashboard Streak Card displaying the current streak. fileciteturn10file4L1238-L1247

#### E. Exam Readiness Card
Display the user's exam-readiness metric when the required backend data exists.

Example:
```text
🎯 78%
Exam Readiness
```

The SRS specifies the Readiness Card as part of the Dashboard. fileciteturn10file4L1248-L1257

#### F. Subject Overview
Display the user's subjects with relevant overview information such as:
- Subject name
- Progress
- Accuracy, when available

The SRS explicitly lists these Dashboard Subject Overview fields. fileciteturn10file4L1258-L1266

#### G. Quick Actions / Dashboard Actions
Every actionable button or link placed on Home must work.

Examples:

| Home Action | Destination |
|---|---|
| Create Subject | Subject creation route |
| View Subjects / View All | Subjects route |
| Start Revision / Continue Revision | Revision route |
| View Analytics | Analytics route |
| Notifications | Notifications route |
| Profile | Profile route |
| Settings | Settings route |

Routes must use the project's actual routing conventions. Do not invent duplicate routes when an existing route already exists.

The SRS authenticated navigation includes Dashboard, Subjects, Revision, Analytics, Notifications, Profile, and Settings. fileciteturn10file4L1024-L1041

---

## 4. New User / Empty Dashboard

A newly authenticated user may have no subjects, revision history, or learning statistics.

The Home page must provide a useful empty state rather than a blank dashboard.

Example:
```text
Your learning journey starts here ✨

Create your first subject and start building
your personalized revision system.

[ Create Your First Subject ]
```

The project rules require every page to handle Loading, Empty, Error, and Success states, and ensure the user knows what to do next. fileciteturn10file1L434-L454

The primary empty-state CTA must navigate to the appropriate Subject Creation route.

---

## 5. Returning User Dashboard

When learning data exists, Home should present the available information without pretending that unavailable metrics exist.

Conceptually:
```text
Welcome back, Student 👋

┌────────────┬────────────┬────────────┐
│ Revision   │ Streak     │ Readiness  │
│ 15 Due     │ 7 Days     │ 72%        │
└────────────┴────────────┴────────────┘

Today's Revision
[ Start Revision ]

Your Subjects
[ Subject Cards ]

Recommended / Next Action
[ Navigate ]
```

The actual values must come from available backend data.

---

## 6. Navigation Requirements

Home is the central hub, but it does not own the implementation of future modules.

```text
Home
 ├── Create Subject → Subject Creation
 ├── View Subjects → Subjects
 ├── Start Revision → Revision
 ├── View Analytics → Analytics
 ├── Notifications → Notifications
 ├── Profile → Profile
 └── Settings → Settings
```

**Important:** A button is not considered complete merely because it visually responds to a click. It must navigate to the correct route and the destination route must be registered in the application.

If a destination feature is not implemented yet, the route must still be handled according to the team's agreed routing plan. Do not implement that future feature inside Phase 2.

---

## 7. Backend / API Responsibility

Phase 2 may add or consume only the backend endpoints required to provide Home/Dashboard data.

Potential responsibilities include:
- Authenticated user/profile data.
- Dashboard summary data.
- Current streak.
- XP/level if available.
- Daily revision count if available.
- Readiness if available.
- Subject overview if the Subject module already exposes the required data.

The frontend must communicate through backend APIs; it must not access MongoDB directly. The project architecture states that the frontend communicates exclusively through backend APIs and that the backend is the central authority. fileciteturn10file6L1563-L1581

Do not implement full Subject, Revision, Analytics, AI, or Notification business logic in Phase 2.

---

## 8. Data Rules

- Do not hardcode user-specific values as real data.
- Do not invent readiness, revision counts, accuracy, or subject progress.
- Use loading states while data is being fetched.
- Use empty states when data does not exist.
- Use error states when an API fails.
- Use actual authenticated user information.
- Respect user ownership and authorization.

The SRS requires actual student activity to form the basis of analytics and restricts students to their own resources. fileciteturn10file6L1503-L1512

---

## 9. UI / UX Requirements

Follow the existing ReviseAI design system.

The Home page should be:
- Playful
- Interactive
- Motivational
- Clean
- Student-focused
- Easy to scan
- Consistent with Phase 1
- Responsive
- Accessible

Do not:
- Create a separate visual language for Home.
- Introduce unnecessary animations.
- Overload the dashboard with every future feature.
- Create dead buttons.
- Leave blank/confusing states.
- Break the existing sidebar/navigation.

The project rules explicitly require reuse of existing components, consistent sidebar/navigation, correct active navigation, existing colors/icons, and complete loading/empty/error/success states. fileciteturn10file8L1785-L1831

---

## 10. Out of Scope

The following are **not Phase 2 implementations**:
- Subject CRUD/business logic.
- Syllabus upload.
- Notes/PYQ upload.
- AI document processing.
- AI question generation.
- Flashcard generation.
- Short-answer generation.
- AI subjective answer evaluation.
- Spaced repetition algorithm.
- Full Revision module.
- Full Analytics module.
- Recommendation engine.
- Notification engine.
- Gamification engine.
- New authentication functionality.
- Admin dashboard.

Home may display or navigate to these areas where required, but their underlying feature implementation belongs to their respective phases.

---

## 11. Phase 1 Dependency

Phase 2 depends on the completed Authentication phase.

Expected flow:
```text
Application Launch
      ↓
Check JWT
      ↓
Verify Session
      ↓
Load Profile
      ↓
Authenticated User
      ↓
Home / Dashboard
```

The SRS defines the startup flow as checking the stored JWT, verifying it through `/api/auth/profile`, restoring the session, and loading the Dashboard when valid. fileciteturn10file9L1917-L1959

Phase 2 must not weaken or bypass authentication protection.

---

## 12. Completion Criteria

- [ ] Home/Dashboard is implemented.
- [ ] Authenticated user can access Home.
- [ ] Unauthenticated users cannot access protected Home.
- [ ] Existing sidebar/navbar is reused.
- [ ] Home navigation item is highlighted correctly.
- [ ] Welcome section works with real user data.
- [ ] Daily Revision section is implemented.
- [ ] Streak section is implemented.
- [ ] Readiness section is implemented or correctly represented as unavailable/loading when its backend data is not yet available.
- [ ] Subject Overview is implemented according to available data.
- [ ] New-user empty state works.
- [ ] Loading state works.
- [ ] Error state works.
- [ ] Every actionable Home button/link redirects correctly.
- [ ] No dead buttons remain.
- [ ] Mobile, tablet, and desktop layouts are tested.
- [ ] Phase 1 authentication remains functional.
- [ ] No unrelated phase functionality was modified.
- [ ] TASKDONE.md is updated.
- [ ] TIMELINE.md is updated.
- [ ] REVIEW.md is completed after implementation/testing.
# ReviseAI — Phase 2: Home / Dashboard

## 1. Overview & Objective
Phase 2 delivers the core Home / Dashboard experience for ReviseAI. It acts as the primary hub for learners after authentication, visualizing their daily revision targets, streak statistics, exam readiness, subject overviews, and AI-curated revision recommendations.

---

## 2. Scope & Boundaries
- **In Scope (Phase 2)**:
  - Navigation Sidebar (`SideNavBar`): Brand header, active route states, Quick Revision CTA, XP counter chip, Settings & Support links.
  - Active User Home Dashboard (Desktop & Mobile Light): Greeting header, notification alerts, top 4 metrics (Daily Revision, Streak, Exam Readiness, AI Smart Focus).
  - Revision Hero Card: AI-curated revision status, question count, daily progress bar, and "Start Revision" CTA.
  - Subjects Overview: Subject cards with mastery progress bars and "Continue" navigation.
  - AI Recommendations: Priority topic suggestions ("Needs Work", "Review Suggested") with direct review triggers.
  - Gamification & Progress Widget: Level avatar, XP progress bar, streak counter, and percentile ranking.
  - Revision Commitment Prompts (Desktop & Mobile).
- **Out of Scope (Future Phases)**:
  - Phase 3: Subject Creation & Syllabus Management
  - Phase 4: Active Revision Engine & Question Players
  - Phase 5: Deep Analytics & Performance Insights

---

## 3. Stitch Design Reference
- **Project ID**: `8356759800152041564`
- **Assigned Screens**:
  1. `Home Dashboard - Active User (Desktop - Light) - Final Layout` (Screen ID: `87fc59f988e548d6b4e1537addf162ee`)
  2. `Home Dashboard - Active User (Mobile - Light) - Final Layout` (Screen ID: `0754e00a78cd43758c6141034291f855`)
  3. `Revision - Commitment Prompt (Desktop)` (Screen ID: `75c8a7bab57847a8a4cc78ac0b83fa75`)
  4. `Revision - Commitment Prompt (Mobile)` (Screen ID: `658215650ebb4d6abebb5b074c2458d6`)

---

## 4. Protected Rules
- Phase 1 Authentication is locked and read-only.
- All session data is retrieved via existing `/api/auth/me` and `localStorage['user']`.

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

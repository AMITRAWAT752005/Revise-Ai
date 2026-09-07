# ReviseAI — Phase 2: Home / Dashboard Task List

## Status: 🟢 Completed (100% Complete)

---

### Home Dashboard Screens (Stitch Project: 8356759800152041564)

- [x] **Page 1: Home Dashboard - Active User (Desktop - Light) - Final Layout** (Screen ID: `87fc59f988e548d6b4e1537addf162ee`)
  - [x] Reusable `SideNavBar` component with branding, navigation links, XP indicator, and "Start Quick Revision" button
  - [x] User greeting header with personalized name and notification alert dropdown
  - [x] 4 Key Metric Cards: Daily Revision (`15 / 20`), Streak (`12 days`), Exam Readiness (`78%`), AI Smart Focus (`OS Memory`)
  - [x] Today's Revision Hero Card with AI Curated tag, progress bar (`5 / 20`), and "Start Revision" action
  - [x] Your Subjects Grid with DBMS (`82%`), Computer Networks (`64%`), Operating Systems (`91%`) mastery progress and "Continue" actions
  - [x] AI Recommendations section with "Needs Work" (`Deadlock` - 42%) and "Review Suggested" (`Scheduling` - 61%) topics
  - [x] Gamification Widget with Level 8 ("Knowledge Seeker"), XP bar (`820 / 1000`), Streak (`12 days`), and Ranking (`Top 10%`)
  - [x] Safe placeholder routing in `App.jsx` for all destination targets (`/subjects`, `/revision`, `/analytics`, `/settings`)
  - [x] Build and test verification (`npm run build` 0 errors, Phase 1 auth regression test 14/14 passed)

- [x] **Page 2: Home Dashboard - Active User (Mobile - Light) - Final Layout** (Screen ID: `0754e00a78cd43758c6141034291f855`)
  - [x] Reusable `BottomNavBar` component (`client/src/components/Navigation/BottomNavBar.jsx` and `.module.css`) with active indicators, pill shapes, and safe area inset padding
  - [x] Mobile Top App Bar (`mobileTopBar`) with ReviseAI sparkle branding, title, and interactive profile action button
  - [x] Mobile 2x2 compact Metric Grid with Daily Revision (`15/20`), Streak (`12 days` with flame watermark), Readiness (`78%` with mini horizontal progress meter), and AI Smart Focus (`DBMS` high priority with psychology watermark)
  - [x] Mobile Today's Revision Hero Card with top-right sparkle icon, progress bar with animated pulse highlight (`5/20` - 25%), and tactile 3D pressable "START REVISION" button
  - [x] Mobile Horizontal Scroll / Swipeable "Your Subjects" row with `snap-x`, hiding scrollbar, mastery percentage badges (DBMS 82%, CN 64%, OS 91%), topic review counts, and CONTINUE/REVIEW action buttons
  - [x] Mobile Floating XP Chip (`+125 XP Today` / `820 XP Earned`) positioned above bottom navigation with smooth floating animation
  - [x] Zero regressions on desktop layout and 100% Phase 1 auth protection preservation

- [x] **Page 3: Revision - Commitment Prompt (Desktop)** (Screen ID: `75c8a7bab57847a8a4cc78ac0b83fa75`)
  - [x] Created `client/src/pages/Revision/Revision.jsx` and `Revision.module.css` with active SideNavBar link to `/revision`
  - [x] Ambient backdrop blur overlay (`backdrop-filter: blur(6px)`) with mock blurred background skeleton
  - [x] Commitment Prompt Card with 24px corner radius, floating sparkle icon circular badge with purple gradient
  - [x] High-contrast serif headline "Ready to lock in?" and motivational copy ("10 minutes is all it takes to make it stick. Try to complete the full series or stay focused for at least 10 minutes.")
  - [x] Primary pressable "Start Now →" button in solid indigo
  - [x] Secondary "Maybe Later" dismiss button returning safely to `/home`
  - [x] Updated `App.jsx` with protected route `/revision` rendering `<Revision />`

- [x] **Page 4: Revision - Commitment Prompt (Mobile)** (Screen ID: `658215650ebb4d6abebb5b074c2458d6`)
  - [x] Bottom sheet modal presentation on mobile (`rounded-t-[24px]`, bottom elevation shadow)
  - [x] Mobile drag handle indicator at top center (`dragHandle`)
  - [x] Sparkle icon circular container with purple gradient
  - [x] High-contrast serif headline "Ready to lock in?" and motivational copy
  - [x] Full-width primary "Start Now →" action in solid indigo
  - [x] Secondary dismiss button ("Maybe Later") with touch interaction
  - [x] Verified full responsive seamless switching between Desktop (Page 3) and Mobile (Page 4)
  - [x] Frontend build passed (0 errors) and Phase 1 auth regression passed (14/14 tests)

---

### Syllabus Setup Workflow Screens (Stitch Project: 8356759800152041564)

- [x] **Page 1: Syllabus Setup - Step 1: Upload (Desktop - Light)** (Screen ID: `85ee6716fe0746d3990fc99896bc77cf`)
  - [x] Created `client/src/pages/SyllabusSetup/SyllabusSetup.jsx` and `SyllabusSetup.module.css`
  - [x] Onboarding Sidebar Navigation showing Step 1 of 4 (25% progress bar) with active Upload Syllabus state
  - [x] Drag & drop file upload dropzone, 3D illustration, "Choose File" primary CTA button, and supported format notes
- [x] **Page 2: Syllabus Setup - Step 1: File Selected (Desktop - Light)** (Screen ID: `7bb60101477943d48a56ebc2fa14949b`)
  - [x] File preview card (`Engineering_Syllabus_2026.pdf`, 2.4 MB, "Ready to analyze" checkmark badge, remove file button)
  - [x] Action group with "Choose Another File" secondary action and "Analyze Syllabus →" primary action
- [x] **Page 3: Syllabus Setup - Step 2: AI Analysis (Desktop - Light)** (Screen ID: `b18d3a7a230b4d1c9789443e49ef35e0`)
  - [x] Onboarding Sidebar Navigation showing Step 2 of 4 (50% progress bar) with Upload Syllabus marked complete
  - [x] AI processing visual with glowing sparkle animation and "ReviseAI is reading your syllabus..." heading
  - [x] Analysis progress bar (72% complete) and live step breakdown checklist box
- [x] **Page 4: Syllabus Setup - Step 3: Select Subjects (Desktop - Light)** (Screen ID: `21435e05b3db4b6992502f0e0a95d195`)
  - [x] Onboarding Sidebar Navigation showing Step 3 of 4 (75% progress bar) with previous steps marked complete
  - [x] Interactive subject selection card grid for DBMS (`CS301`), CN (`CS302`), OS (`CS303`), SE (`CS304`) with topic counts and syllabus coverage badges
  - [x] Select All / Deselect All toggle button and "Continue to Review →" primary CTA
- [x] **Page 5: Syllabus Setup - Step 4: Review (Desktop - Light)** (Screen ID: `36805ff88370492d8ee531d97c8ca60c`)
  - [x] Onboarding Sidebar Navigation showing Step 4 of 4 (100% progress bar) with active Create Dataset state
  - [x] Workspace Summary card with 3 metric boxes (Selected Subjects count, Total Topics 44, AI Dataset Ready) and included subjects list
  - [x] Full-width "Confirm & Build Dataset" primary CTA button
- [x] **Outcome A: Syllabus Setup - Success (Desktop - Light)** (Screen ID: `e8f72540bdf0479aa675f55681e7631e`)
  - [x] Celebration graphic icon container with purple badge and "Syllabus Setup Complete! 🎉" title
  - [x] Summary metrics chips (4 Subjects Added, 44 Topics Curated, Level 1 Unlocked) and "Go to Home Dashboard →" navigation button
- [x] **Outcome B: Syllabus Setup - Error State (Desktop - Light)** (Screen ID: `5a0b825a11cd4621a2f4d669a105df6a`)
  - [x] Error state card with red warning icon, error title ("Unable to Process Syllabus"), explanation copy, "Upload Different File" secondary button, and "Try Again" primary button
  - [x] Verified full build with `npm run build` (0 errors) and 100% Phase 1 auth protection preservation

  ---

### UserProgress Backend Integration

- [x] Converted `UserProgress` and `Subject` models to the server's ES module convention.
- [x] Added idempotent `UserProgress` initialization during local registration.
- [x] Added shared progress helpers for initialization, subject-count synchronization, and activity-field updates.
- [x] Added authenticated subject create, list, and delete operations with ownership checks.
- [x] Subject create/delete operations synchronize `UserProgress.subjectCount` from the database.
- [x] Added a repeatable one-time migration script for users missing `UserProgress` records.
- [x] Execute and verify the migration against the Phase 1 MongoDB data; first run created 2 records and the repeat run created 0 duplicates.

**Verification:**

- Server syntax checks passed for all changed backend modules.
- Express app import passed with the new subject route registered.
- Existing authentication security suite passed: 14 tests passed, 0 failed.

  ### Data Models Added

  - [x] Add `server/src/models/UserProgress.js`
    - [x] Link progress records to `User` through a required unique `userId`
    - [x] Add XP, level, streak, question, study-time, and daily-revision fields
    - [x] Add activity and revision timestamps
    - [x] Enable `createdAt` and `updatedAt` timestamps
  - [x] Add `server/src/models/Subject.js`
    - [x] Link subjects to `User` through a required `userId`
    - [x] Add subject name and progress fields
    - [x] Add status enum and mastery range validation
    - [x] Add unit, topic, and question totals
    - [x] Enable `createdAt` and `updatedAt` timestamps

  **Scope Note:**
  Only the two Mongoose model files were added in this task. Subject APIs, progress APIs, dashboard data integration, and CRUD workflows are not marked complete here.

  ### Subject APIs & UserProgress Synchronization (Tasks 8, 9, 10)

  - [x] **Task 8 — Subject Creation API (`POST /api/subjects`)**
    - [x] Protect route using `authenticateToken` middleware
    - [x] Enforce ownership via `req.userId` (never accept `userId` from request body)
    - [x] Validate required fields (`name` trimmed, non-empty)
    - [x] Apply case-insensitive duplicate subject name rule per user
    - [x] Create Subject and update `UserProgress.subjectCount` atomically via Mongoose transactions (with fallback recount)
    - [x] Return standardized API response (`{ success: true, message, subject, progress }`)

  - [x] **Task 9 — Subject Retrieval API (`GET /api/subjects`)**
    - [x] Protect route using `authenticateToken` middleware
    - [x] Query strictly by `Subject.find({ userId: req.userId })`
    - [x] Disallow `userId` query/body parameters for ownership determination
    - [x] Return empty array `[]` if user has no subjects
    - [x] Use standardized API response format (`{ success: true, message, subjects, progress }`)

  - [x] **Task 10 — Subject & UserProgress Synchronization**
    - [x] Maintain strict consistency between `Subject` collection and `UserProgress.subjectCount`
    - [x] Increment/synchronize `subjectCount` on subject creation
    - [x] Decrement/synchronize `subjectCount` on subject deletion
    - [x] Execute operations inside Mongoose transaction sessions where supported
    - [x] Ensure `Subject` collection remains ultimate source of truth with recount fallback




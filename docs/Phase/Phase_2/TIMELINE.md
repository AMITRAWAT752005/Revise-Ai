# ReviseAI — Phase 2: Home / Dashboard

# Development Timeline

> This file records meaningful development activity during Phase 2.
>
> Do not create entries for trivial changes.
>
> Each entry should accurately describe what was actually changed and tested.

---

# Timeline Entries

## Date: 07 September 2026

### Team Member: Bikram Singh Bisht

**Time:** 08:12 AM

**Task Worked On:**
Phase 2 — Backend UserProgress Integration

**Changes Made:**
- Integrated idempotent `UserProgress` creation into local user registration.
- Added shared progress helpers for initialization, subject-count synchronization, and activity progress fields.
- Added authenticated subject create, list, and delete endpoints with user ownership enforcement.
- Added a repeatable migration script for Phase 1 users missing `UserProgress` records.
- Registered the subject routes under `/api/subjects`.

**Files Created:**
- `server/src/services/userProgressService.js`
- `server/src/controllers/subjectController.js`
- `server/src/routes/subjectRoutes.js`
- `server/src/scripts/migrateUserProgress.js`

**Files Modified:**
- `server/src/models/UserProgress.js`
- `server/src/models/Subject.js`
- `server/src/controllers/authController.js`
- `server/src/app.js`
- `server/package.json`
- `docs/Phase/Phase_2/TASKDONE.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Passed Node syntax checks for all changed backend modules.
- Verified `UserProgress` and `Subject` model imports at runtime.
- Verified Express app import with the new subject route.
- Ran `npm test` in `server`: 14 passed, 0 failed.
- Ran `npm run migrate:user-progress`: created 2 missing records.
- Re-ran `npm run migrate:user-progress`: created 0 duplicate records.
- Added the migration DNS resolver configuration required by the local network.

**Status:**
🟢 Completed and verified

**Notes / Blockers:**
- No Phase 1 authentication behavior was intentionally changed beyond initializing the required progress record during registration.

---


## Date: 06 September 2026

### Team Member: Bikram Singh Bisht

**Time:** 12:15 PM

**Task Worked On:**
Phase 2 — Home Dashboard - New User State & Create Subject Modal Flow (Stitch Project ID: 8356759800152041564)

**Changes Made:**
- Updated `client/src/pages/Home/Home.jsx` and `Home.module.css` implementing the **New User Dashboard** empty state:
  - Page 1: Home Dashboard - New User (Desktop - Light) - Final Layout (`970828215ece42479db7d0f43233beb1`)
    - `isNewUser` conditional rendering when `subjects` array is empty.
    - Empty metrics grid (0/0 revision, 0 streak, 0% readiness, no smart focus).
    - Empty State Hero card with AI sparkle book icon, dual glow effects, and CTA buttons.
    - Empty gamification widget (Level 1, Beginner, 0 XP).
- Created `client/src/components/CreateSubjectModal/` component directory with 4 modal components implementing the full Subject Creation flow:
  - Page 2: Home - Create Subject Modal (Desktop - Light) (`11b5b5bd95ac40d5bd80d73e3b4abf93`)
    - Modal with AI Sparkle top border accent (gradient from primary to tertiary).
    - Form fields: Subject Name (required), Description (optional), Subject Theme color picker (Indigo, Teal, Purple).
    - Footer with Cancel + Create Subject buttons.
  - Page 3: Home - AI Processing (Desktop - Light) (`screen for AI Processing`)
    - Full-screen overlay with pulsing AI sparkle illustration.
    - 5-step animated checklist (Reading documents → Finding chapters → Identifying topics → Building knowledge map → Preparing revision questions).
    - Progress bar with gradient fill animation.
    - Cancel Processing button.
  - **Outcome A:** Home - Subject Success (Desktop - Light) (`screen for Subject Success`)
    - Celebratory modal with pulse ring animation and confetti dots.
    - "🎉 Subject created!" title.
    - "Upload Study Material" primary CTA and "I'll do this later" secondary action.
  - **Outcome B:** Home - Subject Error (Desktop - Light) (`screen for Subject Error`)
    - Error icon in red container with glow shadow.
    - "Something went wrong" message.
    - "Try Again" button (reopens create modal) and "Cancel" button.
- Wired complete modal flow in `Home.jsx`: Create → Processing (simulated 5-step AI) → Success/Error, with state transitions and subject array updates.
- Verified Phase 1 authentication integrity (100% untouched).

**Files Created:**
- `client/src/components/CreateSubjectModal/CreateSubjectModal.jsx`
- `client/src/components/CreateSubjectModal/CreateSubjectModal.module.css`
- `client/src/components/CreateSubjectModal/SubjectProcessingModal.jsx`
- `client/src/components/CreateSubjectModal/SubjectProcessingModal.module.css`
- `client/src/components/CreateSubjectModal/SubjectSuccessModal.jsx`
- `client/src/components/CreateSubjectModal/SubjectSuccessModal.module.css`
- `client/src/components/CreateSubjectModal/SubjectErrorModal.jsx`
- `client/src/components/CreateSubjectModal/SubjectErrorModal.module.css`

**Files Modified:**
- `client/src/pages/Home/Home.jsx`
- `client/src/pages/Home/Home.module.css`
- `docs/Phase/Phase_2/TIMELINE.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Executed frontend production build (`npx vite build` in `client`) → 69 modules transformed, 0 errors, 0 warnings.
- Verified complete modal flow: Create → Processing animation → Success celebration.
- Verified error modal retry and cancel actions.
- Verified new user → active user state transition after subject creation.

**Status:**
🟢 Completed (All 5 Assigned Home Dashboard Screens Implemented & Verified)

**Notes / Blockers:**
- None. All 5 Home Dashboard pages (New User, Create Modal, AI Processing, Success, Error) completed in a single session.

---

## Date: 06 September 2026

### Team Member: Anukool Negi

**Time:** 10:48 AM

**Task Worked On:**
Phase 2 — Syllabus Setup Workflow Implementation (Stitch Project ID: 8356759800152041564)

**Changes Made:**
- Created `client/src/pages/SyllabusSetup/SyllabusSetup.jsx` and `client/src/pages/SyllabusSetup/SyllabusSetup.module.css` implementing all 7 assigned Syllabus Setup workflow screens from Google Stitch design reference:
  - Page 1: Syllabus Setup - Step 1: Upload (Desktop - Light) (`85ee6716fe0746d3990fc99896bc77cf`)
  - Page 2: Syllabus Setup - Step 1: File Selected (Desktop - Light) (`7bb60101477943d48a56ebc2fa14949b`)
  - Page 3: Syllabus Setup - Step 2: AI Analysis (Desktop - Light) (`b18d3a7a230b4d1c9789443e49ef35e0`)
  - Page 4: Syllabus Setup - Step 3: Select Subjects (Desktop - Light) (`21435e05b3db4b6992502f0e0a95d195`)
  - Page 5: Syllabus Setup - Step 4: Review (Desktop - Light) (`36805ff88370492d8ee531d97c8ca60c`)
  - Page 6: Syllabus Setup - Step 4: Success (Desktop - Light) (`e8f72540bdf0479aa675f55681e7631e`)
  - Page 7: Syllabus Setup - Error State (Desktop - Light) (`5a0b825a11cd4621a2f4d669a105df6a`)
- Registered protected route `/syllabus-setup` in `client/src/App.jsx`.
- Verified Phase 1 authentication integrity (100% untouched).

**Files Created:**
- `client/src/pages/SyllabusSetup/SyllabusSetup.jsx`
- `client/src/pages/SyllabusSetup/SyllabusSetup.module.css`

**Files Modified:**
- `client/src/App.jsx`
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/TIMELINE.md`
- `docs/Phase/Phase_2/REVIEW.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Executed `npm run build` in `client` -> 61 modules transformed, 0 errors, 0 warnings.
- Verified all 7 page views, state transitions, step navigation, dropzone upload, selection toggles, review breakdown, success celebration, error handling, and dashboard redirects.

**Status:**
🟢 Completed (All 7 Assigned Syllabus Setup Workflow Screens Implemented & Verified)

**Notes / Blockers:**
- None. All assigned pages completed step-by-step with explicit user confirmation.

---

## Date: 06 September 2026

### Team Member: Anshul Gusain

**Time:** 10:45 AM

**Task Worked On:**
Phase 2 — Revision - Commitment Prompt (Mobile) (Stitch Project ID: 8356759800152041564, Screen ID: `658215650ebb4d6abebb5b074c2458d6`)

**Changes Made:**
- Enhanced `client/src/pages/Revision/Revision.jsx` and `Revision.module.css` with mobile bottom sheet modal presentation:
  - Added mobile drag handle indicator at top of modal.
  - Implemented dual decorative floating sparks (cyan spark top-right, purple spark bottom-left) alongside the central `auto_awesome` icon.
  - Updated modal title to "You've got this!" and motivation text: "Commit to just 10 minutes or finishing the series to maximize your learning. The spark is within you."
  - Implemented full-width primary "Start Revision" action with animated flame icon (`local_fire_department`) and 3D press feedback.
  - Added "Not yet" cancel/dismiss action.
  - Seamless responsive adaptation between Desktop modal (Page 3) and Mobile bottom sheet (Page 4).
- Verified Phase 1 authentication integrity (100% untouched).

**Files Modified:**
- `client/src/pages/Revision/Revision.jsx`
- `client/src/pages/Revision/Revision.module.css`
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/TIMELINE.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Executed `npm run build` in `client` -> 59 modules transformed, 0 errors, 0 warnings.
- Executed `npm test` in `server` -> 14 passed, 0 failed, 100% Phase 1 auth regression test passed.
- Verified mobile bottom sheet presentation, touch feedback, drag handle, and responsive switching.

**Status:**
🟢 Completed (Page 4 - Phase 2 100% Complete)

**Notes / Blockers:**
- All 4 assigned Phase 2 screens from Stitch Project ID 8356759800152041564 are now fully implemented and tested.

---

## Date: 06 September 2026

### Team Member: Anshul Gusain

**Time:** 10:30 AM

**Task Worked On:**
Phase 2 — Revision - Commitment Prompt (Desktop) (Stitch Project ID: 8356759800152041564, Screen ID: `75c8a7bab57847a8a4cc78ac0b83fa75`)

**Changes Made:**
- Created `client/src/pages/Revision/Revision.jsx` and `Revision.module.css` implementing the Desktop Revision screen with the Commitment Prompt modal overlay.
- Implemented the Commitment Prompt design:
  - Ambient AI glow top radial gradient and blurred app background.
  - Floating circular icon header with pulsing glow ring and filled `auto_awesome` sparkle icon.
  - Heading "Ready to lock in?" and motivational copy ("10 minutes is all it takes to make it stick...").
  - 3D pressable "Start Now" button with hover arrow translate effect, starting the active revision session with a 10-minute focus countdown timer and interactive question layout.
  - "Maybe Later" secondary button routing back to `/home`.
- Updated `client/src/App.jsx` route `/revision` to render the protected `<Revision />` component.
- Verified zero Phase 1 authentication regressions.

**Files Created:**
- `client/src/pages/Revision/Revision.jsx`
- `client/src/pages/Revision/Revision.module.css`

**Files Modified:**
- `client/src/App.jsx`
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/TIMELINE.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Executed `npm run build` in `client` -> 59 modules transformed, 0 errors, 0 warnings.
- Executed `npm test` in `server` -> 14 passed, 0 failed, 100% Phase 1 auth regression test passed.
- Verified modal dismiss, routing, timer, and active session view transitions.

**Status:**
🟢 Completed (Page 3)

**Notes / Blockers:**
- Next and final page in sequence: Page 4 (`Revision - Commitment Prompt (Mobile)` - Screen ID: `658215650ebb4d6abebb5b074c2458d6`).

---

## Date: 06 September 2026

### Team Member: Anshul Gusain

**Time:** 10:15 AM

**Task Worked On:**
Phase 2 — Home Dashboard - Active User (Mobile - Light) - Final Layout (Stitch Project ID: 8356759800152041564, Screen ID: `0754e00a78cd43758c6141034291f855`)

**Changes Made:**
- Created `client/src/components/Navigation/BottomNavBar.jsx` and `BottomNavBar.module.css` implementing the mobile bottom navigation bar with active state pills, custom icons, touch ripple scale feedback, and safe area inset support.
- Added Mobile Top App Bar (`mobileTopBar`) in `Home.jsx` with sparkle logo branding and quick profile access button.
- Updated `Home.jsx` and `Home.module.css` with mobile responsive layout adaptations matching the Stitch mobile design:
  - 2x2 compact metric cards with watermarked fire icon (Streak) and brain icon (Smart Focus).
  - Mini horizontal readiness meter in the Readiness metric card.
  - Today's Revision card with glowing accent border, pulsing progress indicator, and 3D pressable "START REVISION" button.
  - Horizontally swipeable "Your Subjects" section (`overflow-x: auto`, `snap-x`) with responsive card styling, mastery status tags, and action buttons.
  - Floating XP earned pill indicator (`+125 XP Today`) with smooth floating animation.
- Preserved 100% desktop fidelity and Phase 1 auth protection integrity.

**Files Created:**
- `client/src/components/Navigation/BottomNavBar.jsx`
- `client/src/components/Navigation/BottomNavBar.module.css`

**Files Modified:**
- `client/src/pages/Home/Home.jsx`
- `client/src/pages/Home/Home.module.css`
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/TIMELINE.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Ran client production build (`npm run build` in `client`) -> 57 modules transformed, 0 errors, 0 warnings.
- Ran backend auth & security test suite (`npm test` in `server`) -> 14 passed, 0 failed, 100% Phase 1 auth regression test passed.
- Verified responsive layout across mobile and desktop viewport widths.

**Status:**
🟢 Completed (Page 2)

**Notes / Blockers:**
- Next page in sequence: Page 3 (`Revision - Commitment Prompt (Desktop)` - Screen ID: `75c8a7bab57847a8a4cc78ac0b83fa75`).

---

## Date: 06 September 2026

### Team Member: Anshul Gusain

**Time:** 10:00 AM

**Task Worked On:**
Phase 2 — Home Dashboard - Active User (Desktop - Light) - Final Layout (Stitch Project ID: 8356759800152041564, Screen ID: `87fc59f988e548d6b4e1537addf162ee`)

**Changes Made:**
- Created `client/src/components/Navigation/SideNavBar.jsx` and `SideNavBar.module.css` matching the Stitch design sidebar with ReviseAI logo (`book-logo.png`), active navigation link styles, XP chip indicator ("820 XP Earned"), "Start Quick Revision" pressable button, and settings/support actions.
- Created `client/src/pages/Home/Home.module.css` featuring the complete ReviseAI Phase 2 light design system: `#fcf8fb` background, `#4441cc` primary indigo, `#9026c3` secondary purple, `#005e79` tertiary cyan, interactive hover states, ambient shadows, and responsive grid system.
- Created `client/src/pages/Home/Home.jsx` implementing:
  - Dynamic user greeting reading name from session/`localStorage` with fallback
  - Interactive notification bell toggle with alert items
  - 4 Metric cards: Daily Revision (`15/20`), Streak (`12 days`), Exam Readiness (`78%`), AI Smart Focus (`OS Memory`)
  - Today's Revision hero card with AI Curated badge, progress bar (`5/20` - 25%), and "Start Revision" CTA
  - "Your Subjects" section featuring DBMS (`82%`), Computer Networks (`64%`), and Operating Systems (`91%`) with "Continue" CTA links
  - "Recommended for You" AI recommendations with "Needs Work" (`Deadlock` - 42%) and "Review Suggested" (`Scheduling` - 61%) topics
  - Gamification widget with Level 8 avatar ("Knowledge Seeker"), XP progress bar (`820/1000`), 12-day streak, and Top 10% percentile badge
- Updated `client/src/App.jsx` with safe protected route placeholders for future phase navigation targets (`/subjects`, `/revision`, `/analytics`, `/settings`) ensuring zero dead or broken links.
- Verified Phase 1 authentication integrity (100% untouched).

**Files Created:**
- `client/src/components/Navigation/SideNavBar.jsx`
- `client/src/components/Navigation/SideNavBar.module.css`
- `client/src/pages/Home/Home.module.css`
- `docs/Phase/Phase_2/PROFILE.md`
- `docs/Phase/Phase_2/TIMELINE.md`

**Files Modified:**
- `client/src/pages/Home/Home.jsx`
- `client/src/App.jsx`
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/REVIEW.md`

**Branch:**
`Phase_2`

**Testing Performed:**
- Executed frontend production build (`npm run build` in `client`) -> 55 modules transformed, 0 errors, 0 warnings.
- Executed backend security & rate limiting test suite (`npm test` in `server`) -> 14 passed, 0 failed, 100% Phase 1 auth regression test passed.
- Verified all clickable Home actions and links route cleanly without console errors.

**Status:**
🟢 Completed (Phase 2 - 4/4 Screens Complete)

**Notes / Blockers:**
- Refined Revision Commitment Prompt screen (Pages 3 & 4) to precisely match the Google Stitch design layout with centered sparkle icon, "Ready to lock in?" serif heading, 10-minute focus description, "Start Now →" primary button, and "Maybe Later" action over blurred backdrop skeleton.

---

### Team Member: Anshul Gusain

**Time:** 10:22 AM

**Task Worked On:**
Revision - Commitment Prompt (Desktop & Mobile) Layout Alignment with Design Mockup (Stitch Project ID: 8356759800152041564)

**Changes Made:**
- Aligned `client/src/pages/Revision/Revision.jsx` to render the clean Revision Commitment Prompt matching the exact Stitch design image:
  - Sparkle icon circular container with purple gradient
  - "Ready to lock in?" high-contrast serif title
  - Description: "10 minutes is all it takes to make it stick. Try to complete the full series or stay focused for at least 10 minutes."
  - "Start Now →" primary indigo button and "Maybe Later" secondary action
  - Removed extraneous active question mockups so the page is exclusively the Commitment Prompt as designed for Phase 2
- Updated `client/src/pages/Revision/Revision.module.css` with clean skeleton backdrop, rounded card with soft elevation shadow, and responsive bottom sheet styling for mobile.

**Files Modified:**
- `client/src/pages/Revision/Revision.jsx`
- `client/src/pages/Revision/Revision.module.css`
- `docs/Phase/Phase_2/TIMELINE.md`

**Status:**
🟢 Completed

## Date: 06 September 2026

### Team Member: Amit Rawat

**Task Worked On:**
Phase 2 — User Progress and Subject Data Models

**Changes Made:**
- Added `server/src/models/UserProgress.js` with a unique `User` reference and progress metrics for XP, level, streaks, answered/correct questions, study time, daily revision goals, and activity timestamps.
- Added `server/src/models/Subject.js` with a required `User` reference, subject status, mastery percentage validation, and unit/topic/question totals.
- Enabled Mongoose timestamps on both models.

**Files Created:**
- `server/src/models/UserProgress.js`
- `server/src/models/Subject.js`

**Files Modified:**
- `docs/Phase/Phase_2/TASKDONE.md`
- `docs/Phase/Phase_2/TIMELINE.md`

**Testing Performed:**
- Inspected both schemas and confirmed the declared fields, user references, defaults, validation rules, and timestamps.

**Status:**
🟢 Completed

**Notes / Blockers:**
- API routes, controllers, services, and frontend integration for these models were not part of this task.


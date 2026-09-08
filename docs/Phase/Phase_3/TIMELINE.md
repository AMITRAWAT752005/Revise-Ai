# ReviseAI — Phase 3: Subject Management & Syllabus-to-Subject Extraction

# Development Timeline

> This file records meaningful development activity during Phase 3.
>
> Do not create entries for trivial changes.
>
> Each entry should accurately describe what was actually changed and tested.

---

# Timeline Entries

### Entry 2
- **Date:** 2026-09-08
- **Time:** 11:29 AM IST
- **Team Member Name:** Amit Rawat
- **Tasks Worked On:**
  - Task 16: Subject Model Enhancement
  - Task 17: Subject Creation Backend
  - Task 18: Subject Retrieval
  - Task 19: Subject Detail
  - Task 20: Subject Update and Delete
  - Task 21: Subject Authorization
- **Changes Made:**
  - Added trimmed `description` support with a maximum length of 200 characters and minimum subject-name validation.
  - Added user ownership and case-insensitive unique subject-name indexes.
  - Created `subjectService.js` as the central business-logic layer for subject creation, listing, detail retrieval, update, and deletion.
  - Replaced database logic in `subjectController.js` with thin controllers that use `req.user.id` only.
  - Added protected update and subject-detail routes while preserving the existing subject route structure.
  - Kept delete as the selected subject lifecycle and synchronized `UserProgress.subjectCount` after creation and deletion.
- **Files Created:**
  - `server/src/services/subjectService.js`
- **Files Modified:**
  - `server/src/models/Subject.js`
  - `server/src/controllers/subjectController.js`
  - `server/src/routes/subjectRoutes.js`
  - `docs/Phase/Phase_3/TASKDONE.md`
  - `docs/Phase/Phase_3/TIMELINE.md`
- **Branch:**
  `Phase_3`
- **Notes:**
  - Phase 1 authentication and Phase 2 dashboard/progress models were not modified.
  - No duplicate Subject model or Dashboard/AI model was created.
- **Blockers / Risks:**
  - Task 22's AI-confirmed subject flow remains pending because no AI syllabus-extraction pipeline exists in the current codebase.
- **Testing Performed & Step-by-Step Method:**
  1. Ran `node --check` for the Subject model, service, controller, and routes.
  2. Ran `npm run test:subjects`: 5/5 passed.
  3. Ran `npm test`: 14/14 authentication security tests passed.
  4. Imported the Express app successfully with the protected subject routes registered.
  5. Ran a real MongoDB integration test with temporary users and subjects covering create, duplicate rejection, list, detail, ownership isolation, update allowlist, delete, description validation, and progress synchronization.
  6. Removed all temporary MongoDB fixtures after testing.

### Entry 1
- **Date:** 2026-09-08
- **Time:** 09:55 AM IST
- **Team Member Name:** Anshul Gusain
- **Tasks Worked On:**
  - Task 8: Subjects — Empty State (Stitch Screen: `Subjects - Empty State`)
  - Task 9: Upload — Select Files (Stitch Screen: `Upload - Select Files`)
  - Task 10: Upload — AI Analysis State (Stitch Screen: `Upload - AI Analysis`)
  - Task 11: Upload — Success State (Stitch Screen: `Upload - Success State`)
  - Task 12: Subjects — Populated State (Stitch Screen: `Subjects - Populated State`)
  - Task 13: DBMS Subject Workspace — Redesign (Stitch Screen: `DBMS Subject Workspace - Redesign`)
  - Task 14: Unit Detail: Normalization (Stitch Screen: `Unit Detail - Normalization`)
  - Task 15: Topic Detail: 3NF (Stitch Screen: `Topic Detail - 3NF`)
  - Task 16: Mobile Views (Mobile-responsive layouts for all 8 assigned screens)
- **Changes Made:**
  - Verified and refined frontend UI screens according to Stitch Project ID `10743120728999009316`.
  - Implemented `Subjects` component with loading, empty state, populated state, metrics, search & filters, and subject card navigation.
  - Implemented `UploadSyllabusModal` supporting file drag-and-drop, format validation, multi-stage AI analysis progress indicators, and detected topics success review.
  - Implemented `SubjectWorkspace` with breadcrumb navigation, subject statistics, unit accordion, and study materials grid.
  - Implemented `UnitDetail` and `TopicDetail` with topic mastery badges, review CTA buttons, and responsive grid layouts.
  - Fixed syntax error in backend controller `server/src/controllers/subjectController.js`.
  - Maintained Phase 3 boundaries (no premature learning engine / question generation implementation).
- **Files Modified/Created:**
  - `client/src/pages/Subjects/Subjects.jsx`
  - `client/src/pages/Subjects/Subjects.module.css`
  - `client/src/components/UploadSyllabusModal/UploadSyllabusModal.jsx`
  - `client/src/components/UploadSyllabusModal/UploadSyllabusModal.module.css`
  - `client/src/pages/SubjectWorkspace/SubjectWorkspace.jsx`
  - `client/src/pages/SubjectWorkspace/SubjectWorkspace.module.css`
  - `client/src/pages/UnitDetail/UnitDetail.jsx`
  - `client/src/pages/UnitDetail/UnitDetail.module.css`
  - `client/src/pages/TopicDetail/TopicDetail.jsx`
  - `client/src/pages/TopicDetail/TopicDetail.module.css`
  - `server/src/controllers/subjectController.js`
  - `docs/Phase/Phase_3/TASKDONE.md`
  - `docs/Phase/Phase_3/TIMELINE.md`
- **Notes:**
  - Strict preservation of Phase 1 authentication and Phase 2 Home/Dashboard functionality.
  - Reused existing design system tokens, color palettes, and typography.
- **Blockers / Risks:**
  - None.
- **Testing Performed & Step-by-Step Method:**
  1. *Frontend Build Verification:* Executed `npm run build` in `client/` directory. Result: 0 errors, build succeeded in 464ms.
  2. *Subject Controller & UserProgress Unit Tests:* Executed `npm run test:subjects` in `server/` directory. Result: 5/5 tests passed (missing name rejection, whitespace validation, model instantiation, userId filtering, UserProgress sync).
  3. *Phase 1 & 2 Auth & Security Regression:* Executed `npm test` in `server/` directory. Result: 14/14 tests passed (login throttling, IP rate limiting, OTP email/IP limits, password reset limit, 30s cooldown).
  4. *Responsive Verification:* Inspected desktop and mobile view states for all 8 assigned screens.

# ReviseAI — Phase 3: Subject Management & Syllabus-to-Subject Extraction

# Development Timeline

> This file records meaningful development activity during Phase 3.
>
> Do not create entries for trivial changes.
>
> Each entry should accurately describe what was actually changed and tested.

---

# Timeline Entries

## Date: 09 September 2026

### Time: 10:15 AM IST

### Team Member Name: Amit Rawat

**Task Worked On:**
Task 25 & 26 Completion — Unit & Topic Module

**Changes Made:**

- Implemented Unit and Topic models.
- Implemented the Unit and Topic retrieval APIs.
- Ensured ownership validation through `Unit -> Subject -> userId` and `Topic -> Unit -> Subject -> userId`.
- Integrated the protected routes and shared service layer.

**Files Modified:**

- `server/src/models/Unit.js`
- `server/src/models/Topic.js`
- `server/src/controllers/unitController.js`
- `server/src/controllers/topicController.js`
- `server/src/services/unitTopicService.js`
- `server/src/routes/unitRoutes.js`
- `server/src/routes/topicRoutes.js`

**Notes:**

- Implementation completed earlier; this entry reflects final documentation sync after audit.
- Earlier database testing was partially blocked due to the MongoDB Atlas DNS issue; the later connected database verification passed.

**Testing Performed:**

- Authentication checks: all four unauthenticated API requests returned `401`.
- Structure validation: required references, indexes, timestamps, status enum, and absence of `userId` passed.
- Database testing: authenticated User A API checks returned `200`; User B ownership checks returned `404` with no data leak; invalid IDs returned `400`.

## Date: 09 September 2026

### Time: 10:01 AM IST

### Team Member Name: Amit Rawat

**Task Worked On:**
Audit & Recovery — Unit & Topic Module

**Changes Made:**

- Completed the interrupted implementation audit for Unit and Topic models, services, controllers, and routes.
- Fixed no code because the existing implementation was complete for the defined read APIs and ownership chain.
- Validated required references, indexes, timestamps, status enum, absence of `userId`, thin controllers, and protected route registration.
- Task 25 audit: Unit schema, Unit service operations, Unit controllers, protected routes, and `Unit -> Subject -> userId` ownership checks are implemented.
- Task 26 audit: Topic schema, Topic service operations, Topic controllers, protected routes, and `Topic -> Unit -> Subject -> userId` ownership checks are implemented.
- Updated Task 25 and Task 26 status without falsely marking blocked authenticated integration verification as complete.

**Files Modified:**

- `docs/Phase/Phase_3/TASKDONE.md`
- `docs/Phase/Phase_3/TIMELINE.md`

**Notes:**

- Recovery after interrupted execution.
- Existing uncommitted Unit/Topic source changes were preserved.
- Authenticated MongoDB-backed success and ownership checks remain blocked by the configured Atlas SRV DNS resolution failure.

**Testing Performed:**

1. Ran `node --check` for both models, the shared service, both controllers, and both route modules.
2. Imported the Unit/Topic models and route modules and verified required references, indexes, timestamps, status values, and no `userId` fields.
3. Started the Express app on an ephemeral local port and requested all four APIs without credentials; each returned `401`.
4. Ran `npm test`; all 14 Phase 1 authentication tests passed.
5. Ran `npm run test:subjects`; all 5 subject/UserProgress tests passed.
6. Authenticated success and cross-user ownership checks could not be executed because MongoDB Atlas DNS was unavailable.

### Entry 6
- **Date:** 2026-09-08
- **Time:** 05:45 PM IST
- **Team Member Name:** Anukool Negi
- **Task Worked On:**
  - Tasks 12, 13, 14, 15: Subject UX Integration (Basic Subject Workspace UI, Subject Navigation & Routing, Home -> Create Subject Integration, Home -> Upload Syllabus Integration)
- **Changes Made:**
  - Implemented dynamic Subject Workspace UI (`client/src/pages/SubjectWorkspace/SubjectWorkspace.jsx`) fetching real subject detail data from `GET /api/subjects/:subjectId`.
  - Added loading spinner and error/404 handling state with retry and navigation fallback in `SubjectWorkspace.jsx` and `SubjectWorkspace.module.css`.
  - Added `/subjects/create` protected route in `App.jsx` pointing to `Subjects` with pre-opened Create Subject modal and clean route replacement on modal dismiss/completion.
  - Connected new-user and active-user Home creation actions ("Create Your First Subject", "+ Add First Subject") to `/subjects/create`.
  - Connected Home syllabus upload actions to `/syllabus-setup`.
  - Connected Home and Subjects cards to navigate directly to individual Subject Workspace at `/subjects/:subjectId`.
- **Files Modified:**
  - `client/src/App.jsx`
  - `client/src/pages/Home/Home.jsx`
  - `client/src/pages/Subjects/Subjects.jsx`
  - `client/src/pages/SubjectWorkspace/SubjectWorkspace.jsx`
  - `client/src/pages/SubjectWorkspace/SubjectWorkspace.module.css`
  - `docs/Phase/Phase_3/TASKDONE.md`
  - `docs/Phase/Phase_3/TIMELINE.md`
- **Notes:**
  - Phase 1 Authentication and Phase 2 backend functionality remain 100% untouched and functional.
  - Workspace structure prepared for Phase 4 extensions without early implementation of Phase 4 flashcards/questions logic.
- **Blockers / Risks:**
  - None.
- **Testing Performed & Step-by-Step Method:**
  1. *Client Production Build Verification:* Executed `npm run build` in `client/`. Result: 79 modules transformed, 0 errors, 0 warnings.
  2. *Subject API & UserProgress Unit Tests:* Executed `npm run test:subjects` in `server/`. Result: 5/5 tests passed.
  3. *Phase 1 Auth Security & Throttling Regression:* Executed `npm test` in `server/`. Result: 14/14 tests passed.
  4. *Routing & Workspace State Verification:* Verified navigation flows (`/home` -> `/subjects/create`, `/home` -> `/syllabus-setup`, `/home` -> `/subjects/:id`, `/subjects` -> `/subjects/:id`), 404/error state handling for invalid subject IDs, loading skeleton, and dynamic rendering from backend `GET /api/subjects/:id`.

### Entry 5
- **Date:** 2026-09-08
- **Time:** Current verification session
- **Team Member Name:** Bikram Singh
- **Task Worked On:**
  - Phase 3 syllabus and subject-management verification
- **Testing Performed:**
  1. Ran `npm test`: 14/14 Phase 1 authentication tests passed.
  2. Ran `npm run test:subjects`: 5/5 Subject API tests passed after correcting the legacy Express test mock.
  3. Ran `npm run test:syllabus`: focused syllabus tests passed.
  4. Ran the client production build successfully.
  5. Ran server syntax checks and workspace diagnostics successfully.
  6. Sent a minimal request to Groq; HTTP 200 confirmed the configured `openai/gpt-oss-120b` model and key are accepted.
  7. Ran the real subject-extraction prompt against Groq; validation returned 2 subjects successfully.
  8. Attempted MongoDB ping; it failed with `querySrv ECONNREFUSED` while resolving the configured Atlas SRV hostname.
- **Files Modified:**
  - `server/tests/subject_api.test.js`
  - `server/src/services/aiSubjectService.js`
- **Notes:**
  - AI provider configuration and subject extraction are verified independently.
  - Full authenticated upload, import persistence, confirmation, and UserProgress verification cannot pass until MongoDB DNS/network access is restored.
- **Blockers / Risks:**
  - MongoDB Atlas SRV DNS resolution is currently unavailable from this environment; do not mark end-to-end syllabus tasks complete yet.

### Entry 4
- **Date:** 2026-09-08
- **Time:** 12:51 PM IST
- **Team Member Name:** Bikram Singh
- **Task Worked On:**
  - Tasks 1–7: Syllabus upload, extraction, OCR fallback, AI subject validation, and pipeline integration
  - Task 22: Confirmed Subject Creation
- **Changes Made:**
  - Added the authenticated `SyllabusImport` model with lifecycle state, file metadata, temporary detected subjects, errors, timestamps, and user indexes.
  - Added protected upload, import-status, and confirmation endpoints under `/api/syllabus`.
  - Added PDF, DOCX, and TXT extraction services with usable-text checks and scanned-PDF OCR fallback.
  - Added server-side, configurable structured AI subject extraction with schema validation and case-insensitive deduplication.
  - Added confirmation validation that accepts only subjects detected for the authenticated import, then reuses the existing Subject creation service and UserProgress synchronization.
  - Connected the Phase 3 Syllabus Setup screen to upload, processing status, detected-subject selection, and confirmation APIs.
- **Files Created:**
  - `server/src/models/SyllabusImport.js`
  - `server/src/services/syllabusExtractionService.js`
  - `server/src/services/aiSubjectService.js`
  - `server/src/services/syllabusService.js`
  - `server/src/controllers/syllabusController.js`
  - `server/src/routes/syllabusRoutes.js`
  - `server/tests/syllabus_pipeline.test.js`
  - `server/uploads/syllabus/.gitkeep`
- **Files Modified:**
  - `server/src/app.js`
  - `server/package.json`
  - `server/package-lock.json`
  - `server/.env.example`
  - `.gitignore`
  - `client/src/pages/SyllabusSetup/SyllabusSetup.jsx`
  - `docs/Phase/Phase_3/TASKDONE.md`
- **Notes:**
  - Phase 1 authentication and Phase 2 dashboard/UserProgress implementation files were not modified.
  - Uploaded files are stored temporarily and removed after processing; AI credentials remain server-side.
- **Blockers / Risks:**
  - Live MongoDB-backed API verification and live AI-provider verification require environment credentials/configuration.
  - PDF/DOCX/OCR integration tests were not marked complete because representative files and an OCR runtime test were not available in this session.
  - Existing `test:subjects` still has two legacy direct-controller harness failures because its mocks omit Express `next(error)`.
- **Testing Performed:**
  1. Ran `npm run test:syllabus`; focused extraction, schema, AI structured-output, invalid-output, and deduplication checks passed.
  2. Ran server syntax checks for all new model, service, controller, route, and app files.
  3. Ran the client production build; Vite completed with 0 errors.
  4. Ran `npm test`; all 14 Phase 1 authentication security tests passed.
  5. Ran workspace diagnostics on the changed source files; no errors were reported.

### Entry 3
- **Date:** 2026-09-08
- **Time:** 12:10 PM IST
- **Team Member Name:** Amit Rawat
- **Task Worked On:**
  - Error Handling Fix for Subject Module
- **Changes Made:**
  - Fixed global error middleware to respect `error.statusCode` instead of returning all errors as 500.
  - Added 400 handling for Mongoose `CastError` cases.
  - Ensured Subject controllers forward errors through `next(error)`.
  - Returned structured `{ success: false, message }` error responses without stack traces or internal 500 details.
- **Files Modified:**
  - `server/src/middleware/errorMiddleware.js`
  - `server/src/controllers/subjectController.js`
- **Notes:**
  - Fixed incorrect 500 responses for validation and authorization errors.
  - No Subject business logic, authentication logic, database schema, or API success contracts were changed.
- **Blockers / Risks:**
  - The legacy direct-controller subject test mock does not provide Express `next(error)` and reports two harness failures; production HTTP tests pass.
- **Testing Performed:**
  1. Retested empty subject-name validation: 400.
  2. Retested duplicate subject creation: 400.
  3. Retested cross-user subject detail access: 404.
  4. Retested cross-user subject update: 404.
  5. Retested invalid ObjectId handling: 400.
  6. Verified structured error responses and no stack traces in responses.
  7. Ran authentication regression tests: 14/14 passed.
  8. Ran syntax checks and workspace diagnostics: passed.
  9. All previously failing API tests now pass.

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

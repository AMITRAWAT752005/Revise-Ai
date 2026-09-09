# ReviseAI — Phase 3: Subject Management & Syllabus-to-Subject Extraction
# Task Completion Tracker

## Phase Status

🟡 **In Progress**

> Subject management was completed earlier. Syllabus processing and confirmed-subject creation are implemented in part; unchecked items still require environment-backed verification.

---

# 1. Phase Overview

Phase 3 focuses on the complete Subject Management experience of ReviseAI.

The existing `Subject` model must be reused. Phase 3 supports two subject creation paths:

1. Manual Subject Creation
2. Syllabus Upload → AI Subject Extraction → User Confirmation → Subject Creation

Main flow:

```text
Home
→ Subjects
→ Create Subject / Upload Syllabus
→ Subject Creation or Syllabus Extraction
→ User Confirmation
→ Subject Created
→ Subjects Dashboard
→ Subject Workspace
```

---

# 2. Subject Model & Backend

- [x] Enhance the existing `Subject` model with trimmed, maximum-200-character description support and minimum-length name validation.
- [x] Reuse the existing `Subject` model instead of creating a duplicate model.
- [x] Implement manual subject creation for authenticated users through `createSubject(userId, data)`.
- [x] Implement retrieval of the authenticated user's subjects.
- [x] Implement individual subject detail retrieval.
- [x] Implement supported subject updates for name, description, and colour.
- [x] Implement subject deletion with UserProgress synchronization.
- [x] Enforce subject ownership on every read and mutation operation.
- [x] Never trust `userId` supplied by the frontend.
- [x] Synchronize `UserProgress` where subject operations require it.

**Backend Verification:**

- [x] Added `{ userId: 1 }` and unique case-insensitive `{ userId: 1, name: 1 }` indexes.
- [x] Verified invalid IDs, duplicate names, ownership isolation, update allowlists, and sanitized responses.
- [x] Verified delete operations synchronize `UserProgress.subjectCount`.
- [x] Verified validation, duplicate, ownership, and CastError responses use the required 400/404 statuses.

---

# 3. Subjects Dashboard

- [x] Create the protected Subjects dashboard route.
- [x] Implement the Subjects dashboard empty state.
- [x] Implement the Subjects dashboard populated state.
- [x] Render subject cards using real backend data.
- [x] Display subject statistics and supported progress fields.
- [x] Implement search/filter UI where specified by the approved design.
- [x] Add the Create Subject action.
- [x] Add the Upload Syllabus action.
- [x] Handle loading, error, empty, and success states.

---

# 4. Subject Card & Workspace

- [x] Display real subject name.
- [x] Display mastery and supported progress values.
- [x] Display subject status.
- [x] Display topic and question counts where available.
- [x] Open an individual subject workspace from a subject card.
- [x] Build the initial Subject Workspace based on the Phase 3 design.
- [x] Represent the selected subject and its available actions.
- [x] Keep future learning-content systems outside Phase 3.

---

# 5. Home Integration

- [x] Make Home's subject creation button open the correct Subject Creation flow.
- [x] Connect manual subject creation from Home to the backend.
- [x] Make Home's Upload Syllabus button open the syllabus import flow.
- [x] Refresh Home subject data after confirmed subject creation.
- [x] Preserve existing Phase 1 and Phase 2 behavior.

---

# 6. Syllabus Upload & Processing

- [ ] Allow authenticated users to upload supported syllabus files.
- [ ] Associate uploaded syllabus processing with the authenticated user.
- [ ] Support digital PDF syllabus text extraction.
- [ ] Support DOCX text extraction where required by the design.
- [x] Support TXT text extraction where required by the design.
- [ ] Add OCR fallback when a syllabus contains no usable text.
- [ ] Track syllabus processing states: uploaded, processing, completed, and failed.
- [ ] Provide clear frontend feedback for processing states and failures.

---

# 7. AI Subject Extraction

- [ ] Analyze extracted syllabus text with the approved AI/LLM pipeline.
- [ ] Restrict AI responsibility to identifying academic subjects.
- [x] Require structured subject output.
- [x] Validate structured AI output before use.
- [x] Remove invalid subjects.
- [x] Deduplicate detected subjects.
- [ ] Prevent malformed AI output from being stored.
- [ ] Show detected subjects to the user for confirmation.
- [ ] Allow users to select, deselect, or review detected subjects.
- [ ] Create Subject documents only from confirmed subjects.
- [ ] Synchronize `UserProgress` after confirmed subject creation.

---

# 8. Complete Syllabus-to-Subject Flow

- [ ] Upload Syllabus.
- [ ] Extract document text.
- [ ] Use OCR when required.
- [ ] Run AI Subject Extraction.
- [ ] Validate and deduplicate AI results.
- [ ] Show detected subjects for user confirmation.
- [ ] Create only confirmed subjects.
- [ ] Display the created subjects in the Subjects dashboard.
- [ ] Open the created subject workspace.

---

# 9. Testing & Regression

- [x] Test manual subject creation.
- [x] Test subject retrieval.
- [x] Test subject detail access.
- [x] Test subject update.
- [x] Test subject delete/archive.
- [x] Test ownership isolation between users.
- [x] Test empty and populated Subjects dashboard states.
- [x] Test syllabus upload validation.
- [ ] Test PDF, DOCX, and TXT extraction where supported.
- [ ] Test OCR fallback.
- [x] Test AI structured-output validation and deduplication.
- [ ] Test detected-subject confirmation flow.
- [ ] Test processing success and failure states.
- [x] Test desktop, tablet, and mobile layouts.
- [x] Test keyboard and accessibility behavior.
- [x] Verify Phase 1 authentication remains intact.
- [x] Verify Phase 2 Home/Dashboard and UserProgress behavior remain intact.
- [x] Run frontend build and backend tests successfully.

---

# 10. Phase 3 Boundary

The following are explicitly outside Phase 3:

- Unit creation or extraction
- Topic creation or extraction
- Flashcard generation
- Question generation
- Subjective answer evaluation
- Spaced repetition
- Revision engine
- Analytics engine
- Recommendation engine
- Notifications
- XP/streak systems unrelated to existing Subject/UserProgress integration

The Phase 3 AI scope is strictly:

```text
Syllabus → Identify Subjects
```

---

# 11. Tasks 25 and 26 - Unit and Topic Read APIs

## Audit Status

Implementation is complete, but authenticated database-backed verification remains blocked by the unavailable MongoDB Atlas DNS connection. These tasks are therefore not marked fully complete.

### Task 25 - Unit APIs

- [x] Add `Unit` schema with required `subjectId` reference.
- [x] Add `subjectId` indexes, including ordering support.
- [x] Enable timestamps and omit `userId` from the schema.
- [x] Implement `GET /api/subjects/:subjectId/units`.
- [x] Implement `GET /api/units/:unitId`.
- [x] Keep controllers thin and delegate database/business logic to the service.
- [x] Protect routes with `authenticateToken`.
- [x] Enforce `Unit -> Subject -> userId` ownership checks.
- [x] Verify module syntax, imports, schema metadata, and unauthenticated `401` responses.
- [ ] Verify authenticated success responses and ownership behavior against MongoDB.

**Classification:** Partially verified; no incomplete code was found during recovery.

### Task 26 - Topic APIs

- [x] Add `Topic` schema with required `unitId` reference.
- [x] Add `unitId` indexes, including ordering support.
- [x] Use the `not_started`, `in_progress`, and `completed` status enum.
- [x] Enable timestamps and omit `userId` from the schema.
- [x] Implement `GET /api/units/:unitId/topics`.
- [x] Implement `GET /api/topics/:topicId`.
- [x] Keep controllers thin and delegate database/business logic to the service.
- [x] Protect routes with `authenticateToken`.
- [x] Enforce `Topic -> Unit -> Subject -> userId` ownership checks.
- [x] Verify module syntax, imports, schema metadata, and unauthenticated `401` responses.
- [ ] Verify authenticated success responses and ownership behavior against MongoDB.

**Classification:** Partially verified; no incomplete code was found during recovery.

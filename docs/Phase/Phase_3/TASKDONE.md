# ReviseAI — Phase 3: Subject Management & Syllabus-to-Subject Extraction
# Task Completion Tracker

## Phase Status

🟡 **Planned**

> No Phase 3 implementation work has been completed yet. Tasks must be marked `[x]` only after implementation and verification.

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

- [ ] Enhance the existing `Subject` model only where required, such as adding description support.
- [ ] Reuse the existing `Subject` model instead of creating a duplicate model.
- [ ] Implement manual subject creation for authenticated users.
- [ ] Implement retrieval of the authenticated user's subjects.
- [ ] Implement individual subject detail retrieval.
- [ ] Implement supported subject updates: name, description, colour, and status.
- [ ] Implement subject delete or archive according to the chosen lifecycle.
- [ ] Enforce subject ownership on every read and mutation operation.
- [ ] Never trust `userId` supplied by the frontend.
- [ ] Synchronize `UserProgress` where subject operations require it.

---

# 3. Subjects Dashboard

- [ ] Create the protected Subjects dashboard route.
- [ ] Implement the Subjects dashboard empty state.
- [ ] Implement the Subjects dashboard populated state.
- [ ] Render subject cards using real backend data.
- [ ] Display subject statistics and supported progress fields.
- [ ] Implement search/filter UI where specified by the approved design.
- [ ] Add the Create Subject action.
- [ ] Add the Upload Syllabus action.
- [ ] Handle loading, error, empty, and success states.

---

# 4. Subject Card & Workspace

- [ ] Display real subject name.
- [ ] Display mastery and supported progress values.
- [ ] Display subject status.
- [ ] Display topic and question counts where available.
- [ ] Open an individual subject workspace from a subject card.
- [ ] Build the initial Subject Workspace based on the Phase 3 design.
- [ ] Represent the selected subject and its available actions.
- [ ] Keep future learning-content systems outside Phase 3.

---

# 5. Home Integration

- [ ] Make Home's subject creation button open the correct Subject Creation flow.
- [ ] Connect manual subject creation from Home to the backend.
- [ ] Make Home's Upload Syllabus button open the syllabus import flow.
- [ ] Refresh Home subject data after confirmed subject creation.
- [ ] Preserve existing Phase 1 and Phase 2 behavior.

---

# 6. Syllabus Upload & Processing

- [ ] Allow authenticated users to upload supported syllabus files.
- [ ] Associate uploaded syllabus processing with the authenticated user.
- [ ] Support digital PDF syllabus text extraction.
- [ ] Support DOCX text extraction where required by the design.
- [ ] Support TXT text extraction where required by the design.
- [ ] Add OCR fallback when a syllabus contains no usable text.
- [ ] Track syllabus processing states: uploaded, processing, completed, and failed.
- [ ] Provide clear frontend feedback for processing states and failures.

---

# 7. AI Subject Extraction

- [ ] Analyze extracted syllabus text with the approved AI/LLM pipeline.
- [ ] Restrict AI responsibility to identifying academic subjects.
- [ ] Require structured subject output.
- [ ] Validate structured AI output before use.
- [ ] Remove invalid subjects.
- [ ] Deduplicate detected subjects.
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

- [ ] Test manual subject creation.
- [ ] Test subject retrieval.
- [ ] Test subject detail access.
- [ ] Test subject update.
- [ ] Test subject delete/archive.
- [ ] Test ownership isolation between users.
- [ ] Test empty and populated Subjects dashboard states.
- [ ] Test syllabus upload validation.
- [ ] Test PDF, DOCX, and TXT extraction where supported.
- [ ] Test OCR fallback.
- [ ] Test AI structured-output validation and deduplication.
- [ ] Test detected-subject confirmation flow.
- [ ] Test processing success and failure states.
- [ ] Test desktop, tablet, and mobile layouts.
- [ ] Test keyboard and accessibility behavior.
- [ ] Verify Phase 1 authentication remains intact.
- [ ] Verify Phase 2 Home/Dashboard and UserProgress behavior remain intact.
- [ ] Run frontend build and backend tests successfully.

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

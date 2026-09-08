# Phase 3 — Subject Management & Syllabus-to-Subject Extraction Profile

## 1. Phase Overview

**Phase:** Phase 3  
**Name:** Subject Management & Syllabus-to-Subject Extraction  
**Status:** Planned  
**Previous Phase:** Phase 2 — Home / Dashboard  
**Primary Goal:** Build the complete Subject Management experience and allow users to extract academic subjects from uploaded syllabus files.

Phase 3 must reuse the existing Phase 1 authentication system and Phase 2 Home/Dashboard and UserProgress functionality. It must not break completed features or implement future learning-content systems early.

---

## 2. Phase Objectives

- Enhance the existing Subject model only where Phase 3 requires it.
- Provide manual subject creation.
- Provide authenticated subject retrieval and detail views.
- Allow users to update, delete, or archive their own subjects.
- Build the Subjects dashboard and initial Subject Workspace.
- Connect Home subject actions to the Phase 3 flows.
- Support syllabus upload for authenticated users.
- Extract text from supported digital syllabus files.
- Use OCR when a syllabus does not contain usable text.
- Identify academic subjects using a structured AI/LLM pipeline.
- Validate, deduplicate, and present detected subjects for user confirmation.
- Create only user-confirmed Subject documents.
- Synchronize existing UserProgress fields where subject operations require it.
- Preserve all Phase 1 and Phase 2 behavior.

---

## 3. Existing Architecture to Reuse

### Authentication

- Existing authenticated session and cookie-based authentication.
- Existing `authenticateToken` middleware.
- Existing protected route conventions.
- Existing user ownership from `req.userId`.

### Subject Data

Reuse the existing `Subject` model, which currently contains:

- `name`
- `userId`
- `status`
- `colour`
- `mastery`
- `totalUnits`
- `totalTopics`
- `totalQuestions`
- `createdAt`
- `updatedAt`

Add fields only when required by the approved Phase 3 design and implementation.

### Progress Integration

Reuse the existing `UserProgress` integration and synchronization helpers. Subject operations must not trust a frontend-supplied user ID.

---

## 4. Scope

### 4.1 Subject Management

Phase 3 includes:

- Manual subject creation.
- Subject list retrieval for the authenticated user.
- Individual subject detail retrieval.
- Supported subject updates such as name, description, colour, and status.
- Subject deletion or archival according to the selected lifecycle.
- Strict subject ownership authorization.
- Duplicate and input validation.
- UserProgress synchronization where required.

### 4.2 Subjects Dashboard

The Subjects dashboard should include, where specified by the approved design:

- Loading state.
- Empty state.
- Populated state.
- Subject cards.
- Subject statistics.
- Subject mastery and status.
- Topic and question counts where available.
- Search and filter controls.
- Create Subject action.
- Upload Syllabus action.
- Error and retry states.

All displayed user-specific values must come from backend data or honest unavailable states. Do not use hardcoded user-specific values.

### 4.3 Subject Workspace

The initial Subject Workspace should:

- Represent the selected subject.
- Display supported subject information.
- Provide available Phase 3 actions.
- Provide clear navigation back to the Subjects dashboard.
- Avoid implementing units, topics, questions, flashcards, revision, or analytics systems.

### 4.4 Home Integration

The following Home actions must connect to real Phase 3 flows:

```text
Home → Create Subject → Subject Creation
Home → Upload Syllabus → Syllabus Import
Home → Subjects → Subjects Dashboard
```

Existing Home, authentication, and UserProgress behavior must remain functional.

### 4.5 Syllabus-to-Subject Extraction

The complete supported flow is:

```text
Upload Syllabus
→ Text Extraction
→ OCR if Required
→ AI Subject Extraction
→ Structured Validation
→ Deduplication
→ User Confirmation
→ Confirmed Subject Creation
→ Subjects Dashboard
→ Subject Workspace
```

Processing states should include:

- Uploaded
- Processing
- Completed
- Failed

The AI is responsible only for identifying academic subjects from syllabus text.

---

## 5. File and Processing Requirements

### Supported Documents

Support the file types approved for the Phase 3 design, such as:

- PDF
- DOCX
- TXT

Reject unsupported, corrupt, oversized, or unsafe files with clear errors.

### Text Extraction

- Extract usable text from digital documents.
- Detect when extracted text is missing or insufficient.
- Invoke OCR fallback when required.
- Avoid exposing uploaded documents or extracted text to other users.
- Clean up temporary files safely.

### AI Output

The AI pipeline must:

- Receive only the intended extracted syllabus content.
- Return structured subject data.
- Validate the response against a defined schema.
- Reject malformed or invalid output.
- Remove duplicate subjects.
- Avoid storing detected subjects before user confirmation.
- Handle provider failures and timeouts safely.

---

## 6. Authorization and Security Rules

- All subject and syllabus operations must authenticate the request.
- Derive ownership from the authenticated session, never from frontend `userId` values.
- A user can access only their own subjects and processing records.
- A user cannot update, delete, archive, or view another user's subject.
- Uploaded files must be protected from cross-user access.
- AI provider credentials must remain server-side.
- Do not log sensitive syllabus content unnecessarily.
- Do not expose passwords, cookies, tokens, or secrets in responses.
- Apply validation and file-size/type restrictions before processing.

---

## 7. Out of Scope

The following are not Phase 3 responsibilities:

- Unit creation or extraction.
- Topic creation or extraction.
- Flashcard generation.
- Question generation.
- Subjective answer evaluation.
- Spaced repetition.
- Revision engine.
- Analytics engine.
- Recommendation engine.
- Notifications.
- New XP or streak systems unrelated to existing Subject/UserProgress integration.

The Phase 3 AI boundary is:

```text
Syllabus → Identify Subjects
```

It is not:

```text
Syllabus → Units → Topics → Questions → Flashcards
```

---

## 8. Testing Expectations

Before Phase 3 is declared complete, verify:

- Manual subject creation.
- Subject retrieval and detail access.
- Subject update.
- Subject delete/archive.
- Ownership isolation between users.
- Subjects dashboard empty and populated states.
- Subject workspace navigation.
- Syllabus file validation and upload.
- PDF, DOCX, and TXT extraction where supported.
- OCR fallback.
- Structured AI output validation.
- AI result deduplication.
- Detected subject confirmation.
- Confirmed subject creation.
- Upload and processing success/failure states.
- Desktop, tablet, and mobile behavior.
- Keyboard and accessibility behavior.
- Phase 1 authentication regression.
- Phase 2 Home/Dashboard and UserProgress regression.
- Frontend build and backend test suites.

# ReviseAI — Phase 4: Learning, RAG & Revision Engine
# Task Completion Tracker

## Phase Status

⚪ **Planned**

> Phase 4 is currently in the planning stage. Tasks will be checked off as development progresses.

---

# 1. Phase Overview

Phase 4 implements the core learning and AI engine of ReviseAI. It involves processing user study materials, building a vector knowledge base (RAG), generating questions and flashcards using LLMs, and powering a spaced-repetition revision engine.

---

# 2. Phase 4A — Study Material Upload

- [x] Create `StudyMaterial` schema with references to `User`, `Subject`, `Unit`, `Topic`.
- [x] Implement file upload API (PDF, DOCX, TXT) integrated with external storage (Cloudinary).
- [x] Validate file types and sizes.
- [x] Initialize `processingStatus` as "uploaded".
- [x] Secure endpoints with authentication and ownership checks.
- [x] Frontend material upload UI integrated.
- [x] Frontend material list UI integrated with delete functionality.

---

# 3. Phase 4B — Document Processing

- [x] Establish central Document Processing architecture and orchestrator (`documentProcessingService`).
- [x] Implement text extraction for digital PDFs (e.g., via `pdf-parse`).
- [x] Implement text extraction for DOCX and TXT files.
- [x] Implement OCR fallback (e.g., Tesseract.js / pdf-to-img) for scanned/image-based PDFs.
- [x] Implement text cleaning and chunking logic.
- [x] Create `DocumentChunk` schema to store text chunks with metadata.
- [x] Update `StudyMaterial` status to "completed" or "failed" based on outcome.

### Amit Rawat — A1, A2, A3 Text Processing

- [x] Refine text cleaning for whitespace, line wrapping, repeated headers/footers, and obvious OCR noise.
- [x] Preserve paragraph and heading structure while normalizing extracted text.
- [x] Add metadata-aware paragraph and sentence-boundary chunk preparation with sequential indexes and bounded overlap.
- [x] Add the `materialId` + `chunkIndex` compound index to `DocumentChunk`.
- [x] Validate cleaning, metadata propagation, sequential indexes, and oversized paragraph handling.

### Amit Rawat — A1/A3 Responsibility Separation

- [x] Move text cleaning into `utils/textCleaner.js`.
- [x] Move chunking and token estimation into `services/chunkingService.js`.
- [x] Keep `textProcessing.js` as a compatibility re-export without processing logic.
- [x] Update the document processing pipeline to import the dedicated modules directly.
- [x] Confirm no duplicate cleaning or chunking implementation exists.

### Amit Rawat — A1/A3 Failed-Test Corrections

- [x] Join broken lowercase continuation lines without merging punctuated lines or headings.
- [x] Remove excessive OCR symbol runs while preserving meaningful text and math content.
- [x] Replace character-based chunk sizing with paragraph and sentence-aware word sizing.

### Bikram Singh Bisht — Task B3 Complete Document Processing Pipeline

- [x] Connect AN1-3 extractions, B2 OCR, A1 cleaning, A3 chunking, and A2 schema.
- [x] Verify correct sequential pipeline execution (Extraction -> Fallback -> Clean -> Chunk -> Save).
- [x] Ensure Phase 4C functionality (RAG/Embeddings) is strictly excluded from the B3 pipeline.
- [x] Test end-to-end integration and assert completion of Phase 4B.
- [x] Keep chunks within the 300–800 word target with approximately 500-word chunks.
- [x] Merge undersized chunks and add controlled overlap between adjacent chunks.

### Amit Rawat — A4 Processing Status & Error Handling

- [x] Implement `processDocument(materialId)` in `documentProcessingService.js`.
- [x] Manage the `uploaded` -> `processing` -> `completed` lifecycle.
- [x] Mark materials as `failed` with a meaningful `processingError` on pipeline failures.
- [x] Make completed processing idempotent and allow failed materials to retry.
- [x] Prevent concurrent processing of materials already in `processing` state.
- [x] Replace chunks safely with ordered bulk insertion and partial-write cleanup.
- [x] Preserve the existing `processStudyMaterial` upload/retry compatibility path.
- [x] Validate the Phase 4B regression suite, syntax, diagnostics, and scoped changes.

### Anshul Gusain — Task AS1 Document Processing UI

- [x] Build multi-stage Document Processing UI (`File uploaded` -> `Text extraction` -> `Preparing content` -> `Finalizing`).
- [x] Integrate real-time processing status badges and progress indicator.
- [x] Provide user-friendly guidance & reassurance message during background processing.
- [x] Display clear completed state with readiness indicator for next Phase 4 learning features.
- [x] Display failed state with contextual error message and retry action.
- [x] Handle loading and empty states cleanly according to ReviseAI design system.


---

# 4. Phase 4C — Embeddings & Vector Database Foundation

- [x] Implement reusable Embedding Service using `sentence-transformers/all-MiniLM-L6-v2` (dimension 384).
- [ ] Configure Qdrant with appropriate environment variables and create the collection.
- [ ] Build the chunk-to-embedding pipeline seamlessly integrating with existing `documentProcessingService`.
- [ ] Ensure Qdrant payloads include necessary metadata (`userId`, `subjectId`, `unitId`, `topicId`, `materialId`, `chunkId`).
- [ ] Implement robust duplicate vector handling and idempotency logic.
- [ ] Create a reusable Semantic Search Service with strict `userId` and hierarchical metadata filtering.
- [ ] Create a protected Search API (`/api/search`).
- [ ] Ensure embedding/indexing failure does not lose `DocumentChunk` and supports retry mechanism.

### Bikram Singh Bisht — 4C-1 Embedding Service

- [x] Install `@xenova/transformers` as a local embedding dependency (no Gemini, no external API).
- [x] Create `server/src/services/embeddingService.js` with a singleton pipeline abstraction.
- [x] Implement `generateEmbedding(text)` → `number[]` using `Xenova/all-MiniLM-L6-v2` with mean pooling and L2 normalization.
- [x] Write `tests/embeddingService.test.js` and verify output dimension is exactly 384.
- [x] Confirm model can be swapped later without changing callers.



---

# 5. Phase 4D — AI Content Generation

- [ ] Integrate an LLM API (e.g., Groq) for content generation.
- [ ] Implement prompt templates for generating MCQs, True/False, Short/Long questions, and Flashcards based on retrieved RAG chunks.
- [ ] Ensure the generation pipeline validates and parses structured output from the LLM.

---

# 6. Phase 4E — Question Bank & Flashcards

- [ ] Create `Question` schema (MCQ, T/F, Short, Long, Fill-blank).
- [ ] Create `Flashcard` schema.
- [ ] Implement APIs to save generated questions and flashcards.
- [ ] Implement APIs to retrieve the question bank and flashcards for a topic.

---

# 7. Phase 4F — Practice Engine

- [ ] Create `PracticeSession` schema to track session state.
- [ ] Implement API to start a practice session (filtering by subject/topic/difficulty).
- [ ] Implement question randomization and selection logic.
- [ ] Implement APIs to submit answers and complete a session.

---

# 8. Phase 4G — Answer Evaluation

- [ ] Implement objective answer evaluation (exact match for MCQ, T/F, Fill-blank).
- [ ] Implement subjective answer evaluation using the LLM and RAG (Short/Long answers).
- [ ] Ensure AI evaluation provides score, feedback, and missing points based *only* on source material.

---

# 9. Phase 4H — Performance Tracking

- [ ] Create `QuestionAttempt` schema to record individual answers, scores, and time taken.
- [ ] Implement analytics to aggregate user accuracy and identify weak topics.
- [ ] Integrate performance metrics into the subject/topic dashboards.

---

# 10. Phase 4I — Spaced Repetition

- [ ] Create `RevisionSchedule` schema.
- [ ] Implement a scheduling algorithm (e.g., SM-2) to determine `nextRevisionAt` based on attempt scores and difficulty.
- [ ] Update revision schedule dynamically after practice sessions.

---

# 11. Phase 4J — Revision Session

- [ ] Implement API to fetch "Today's Revision" (topics due for review based on `RevisionSchedule`).
- [ ] Combine questions and flashcards into a unified revision workflow.
- [ ] Process session completion to update schedules.

---

# 12. Phase 4K — Gamification Integration

- [ ] Integrate learning activities with `UserProgress`.
- [ ] Award XP for completing questions (+10), flashcards (+5), and sessions (+50).
- [ ] Implement logic to maintain and update user streaks upon learning activity.

---

# 13. Testing & Regression

- [ ] Test end-to-end file upload and extraction.
- [ ] Test vector search isolation by user.
- [ ] Test AI question and evaluation accuracy.
- [ ] Test Spaced Repetition logic.
- [ ] Verify Phase 1-3 functionalities remain fully intact.

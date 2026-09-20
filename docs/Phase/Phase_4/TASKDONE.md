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
- [x] Configure Qdrant with appropriate environment variables and create the collection.
- [x] Build the chunk-to-embedding pipeline seamlessly integrating with existing `documentProcessingService`.
- [x] Ensure Qdrant payloads include necessary metadata (`userId`, `subjectId`, `unitId`, `topicId`, `materialId`, `chunkId`).
- [x] Implement robust duplicate vector handling and idempotency logic.
- [x] Create a reusable Semantic Search Service with strict `userId` and hierarchical metadata filtering.
- [x] Create a protected Search API (`/api/search`).
- [x] Ensure embedding/indexing failure does not lose `DocumentChunk` and supports retry mechanism.

### Bikram Singh Bisht — 4C-1 Embedding Service

- [x] Install `@xenova/transformers` as a local embedding dependency (no Gemini, no external API).
- [x] Create `server/src/services/embeddingService.js` with a singleton pipeline abstraction.
- [x] Implement `generateEmbedding(text)` → `number[]` using `Xenova/all-MiniLM-L6-v2` with mean pooling and L2 normalization.
- [x] Write `tests/embeddingService.test.js` and verify output dimension is exactly 384.
- [x] Confirm model can be swapped later without changing callers.

### Anukool Negi — 4C-5 Semantic Search Service & 4C-6 Protected Search API

- [x] Add `searchVectors` method to `qdrantService.js` wrapping Qdrant REST client vector search with retry logic.
- [x] Create `server/src/services/semanticSearchService.js` implementing `searchSemanticChunks` with query embedding, metadata filtering, and MongoDB chunk hydration.
- [x] Enforce strict user data isolation by requiring authenticated `userId` and validating ownership of subject/unit/topic/material filters.
- [x] Create `server/src/controllers/searchController.js` and `server/src/routes/searchRoutes.js` exposing `POST /api/search` protected by `authenticateToken`.
- [x] Return sanitized search results containing text, metadata, similarity score, and formatted source citations (omitting raw vectors and Qdrant internal IDs).
- [x] Create and pass comprehensive test suite `server/tests/semanticSearch.test.js`.



---

### Bikram Singh Bisht — 4C-3 Chunk-to-Embedding Pipeline

- [x] Create `server/src/services/chunkEmbeddingPipeline.js` to orchestrate per-chunk embedding and Qdrant indexing.
- [x] Add `embeddingStatus` (`pending`|`indexed`|`failed`) and `embeddingError` fields to `DocumentChunk` schema.
- [x] Add compound `{ materialId, embeddingStatus }` index to `DocumentChunk` for efficient retry queries.
- [x] Implement `embedChunksForMaterial(materialId)` — fetches unindexed chunks, embeds each independently, upserts into Qdrant.
- [x] Implement `embedSingleChunk` with per-chunk isolation: failure of one chunk does not stop others.
- [x] Implement idempotency: chunks already in `embeddingStatus: 'indexed'` are skipped on retry.
- [x] Implement bounded concurrency (`CONCURRENCY_LIMIT = 3`) for transformer model memory safety.
- [x] Wire `embedChunksForMaterial` into `documentProcessingService.processDocument` as a non-blocking post-completion step.
- [x] Ensure embedding failures never delete `DocumentChunk` and never revert `processingStatus` to `failed`.
- [x] Write `tests/chunkEmbeddingPipeline.test.js` with 11 tests covering: happy path, embedding failure (no deletion), Qdrant failure (no deletion), separate per-chunk embeddings, idempotency, partial failure isolation, early exit on zero pending chunks, vector dimension contract, and three Phase 4B regressions.

- [x] Add the official `@qdrant/js-client-rest` dependency.
- [x] Create `server/src/services/qdrantService.js` as the dedicated Qdrant infrastructure service.
- [x] Configure Qdrant through `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION_NAME` environment variables.
- [x] Define the `reviseai_document_chunks` collection convention with 384-dimensional Cosine vectors.
- [x] Implement reusable client initialization and collection-existence checks.
- [x] Implement safe collection creation without blindly recreating an existing collection.
- [x] Implement basic vector upsert with required chunk metadata payload fields.
- [x] Add vector dimension and numeric-value validation for 384-dimensional vectors.
- [x] Add focused Qdrant infrastructure tests using a mocked client.
- [ ] Complete live Qdrant connection and collection verification after credentials are configured.

### Anshul Gusain — 4C-4 Vector Metadata & Source Mapping

- [x] Create `server/src/services/vectorMetadataService.js` to standardize vector payload construction, validation, and source mapping.
- [x] Ensure complete hierarchical source traceability: Vector -> Chunk -> Material -> Topic/Unit/Subject -> User.
- [x] Implement `buildVectorPayload` and `validateVectorPayload` enforcing non-empty IDs (`userId`, `subjectId`, `materialId`, `chunkId`, `chunkIndex`) and valid page bounds.
- [x] Implement `mapVectorToSource` and `hydrateSourceMapping` to link vector search results back to full document and academic hierarchy details.
- [x] Implement `resolveSourceChain` with strict `userId` ownership validation to prevent cross-user vector leakage.
- [x] Implement `formatSourceCitation` for standardized, human-readable RAG attribution.
- [x] Integrate `buildVectorPayload` into `qdrantService.js` for single-source payload building.
- [x] Create and pass comprehensive test suite `server/tests/vectorMetadataService.test.js`.

### Anshul Gusain — 4C-8 Processing State + Frontend Integration

- [x] Integrate frontend material processing state with actual backend `processingStatus` (`uploaded`, `processing`, `completed`, `failed`).
- [x] Multi-stage asynchronous pipeline UI representation (`File uploaded` -> `Text extraction` -> `Chunking & Cleaning` -> `Building knowledge index`).
- [x] Auto-polling mechanism for materials in active processing states without blocking UI interactions.
- [x] Reassurance UX messaging for long-running asynchronous background indexing jobs.
- [x] Robust failure state handling displaying contextual error messages with retry action calling existing backend retry endpoint.
- [x] Keep user data safe without exposing internal vector database identifiers or sensitive embedding data.
- [x] Validate client production build with zero syntax, rendering, or build errors.

### Amit Rawat — 4C-7 Retry, Error Handling & Idempotency

- [x] Stabilize the vector identity contract using `hash(materialId + chunkId + chunkIndex)` so the same chunk re-runs without producing duplicate vectors.
- [x] Ensure Qdrant writes use UPSERT semantics so repeated indexing results in update rather than duplicate insert.
- [x] Add bounded retry logic for transient Qdrant errors using a short exponential backoff window and a strict retry limit.
- [x] Wrap Qdrant connection and upsert failures in structured errors while preserving MongoDB chunk records and preventing silent failures.
- [x] Keep failed indexing isolated to the vector layer; `DocumentChunk` remains intact and is marked with detailed failure metadata when needed.
- [x] Update the material status on batch indexing failure only as a safe partial-failure state rather than deleting any MongoDB data.
- [x] Handle Qdrant failures, invalid vectors, and timeout-like transient errors without silent failure.
- [x] Validate duplicate prevention, retry success, partial failure isolation, Qdrant outage safety, processing status failure, and no-data-loss behavior with targeted tests.

**Testing:**
- Retry success simulation (fail -> success).
- Partial failure isolation with only failed chunks retried.
- Qdrant outage safety with no MongoDB data loss.
- Processing status validation with `failed` status and populated `processingError`.

**Files Added:**
- `server/tests/qdrantService.test.js`
- `server/tests/chunkEmbeddingPipeline.test.js`
- `server/tests/chunkEmbeddingPipeline.real.test.js`


# 5. Phase 4D — AI Content Generation

### Bikram Singh Bisht — Task 1: AI Generation Contract & Architecture Analysis

- [x] Analyze Phase 4 architecture and RAG vector metadata format.
- [x] Define Zod schemas for generation requests and response validation.
- [x] Support 9 content types (MCQ, Flashcard, True/False, One-word, Fill-in-the-blank, Match the following, Sequence, Spot the mistake, What happens next).
- [x] Ensure the generation pipeline validates and parses structured output from the LLM.

- [x] Integrate an LLM API (e.g., Groq/Gemini) for content generation.
- [x] Implement prompt templates for generating MCQs, True/False, Short/Long questions, and Flashcards based on retrieved RAG chunks.

### Anukool Negi — Protected API Integration

- [x] Create `server/src/controllers/aiController.js` handling request validation, `userId` derivation from auth token, and resource ownership checks.
- [x] Create `server/src/routes/aiRoutes.js` exposing `POST /api/ai/generate` protected by `authenticateToken`.
- [x] Mount `/api/ai` routes in `server/src/app.js`.
- [x] Enforce strict user isolation and hierarchy ownership validation across Subject, Unit, and Topic.
- [x] Integrate backend AI generation service (`aiGenerationService.js`) with backend-only API key handling.
- [x] Standardize API success responses (`{ success: true, data: { generatedContent, meta } }`) and error responses without leaking credentials.
- [x] Create and pass comprehensive test suite `server/tests/protected_ai_api.test.js` (13 tests passing).

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

### Team Member Name: Amit Rawat

**Task Worked On:**
 — Question & Flashcard Model Design

**Changes Made:**
- Created Question and Flashcard MongoDB schemas
- Added full metadata linking (user, subject, unit, topic, material)
- Added sourceChunks reference for RAG traceability
- Enforced schema-level validation (required fields, enums)
- Designed models aligned with AI generation contract

**Files Created:**
- server/src/models/Question.js
- server/src/models/Flashcard.js

**Testing Performed:**
- Schema validation tested
- Required fields enforced
- Enum validation verified
- MongoDB model creation successful
- `node --check server/src/models/Question.js` passed
- `node --check server/src/models/Flashcard.js` passed
- File and schema review confirmed no forbidden logic, no API/service code, and no unrelated file changes

### Bikram Singh Bisht — Task 2: RAG Context Retrieval & Context Builder

- [x] Implement `ragContextService.js` using the existing `semanticSearchService`.
- [x] Implement `buildRagContext` to retrieve chunks.
- [x] Implement chunk deduplication and max character limits (default 15000 chars) for prompt safety.
- [x] Implement source traceability ensuring chunks are mapped back to `materialId`, `subjectId`, `unitId`, etc.
- [x] Integrate empty result, missing query, and missing userId error handling.
- [x] Write `ragContextService.test.js` to verify retrieval, context building, limits, and error handling.

### Bikram Singh Bisht — Task 3: AI Generation Service & LLM Integration

- [x] Implement `aiGenerationService.js`.
- [x] Validate generation requests using `GenerationRequestSchema`.
- [x] Integrate RAG context retrieval into the prompt.
- [x] Construct a strict prompt template enforcing difficulty, count, item types, and source-grounding.
- [x] Integrate Gemini LLM directly using the fetch API with retry logic and timeout handling.
- [x] Parse LLM output and validate against `AIGenerationResponseSchema`.
- [x] Write `aiGenerationService.test.js` to verify logic, schema validation, and error scenarios.

### Anshul Gusain — Phase 4D Prompt 1: Revision Questions & Flashcard Experience

- [x] Implement Stitch Quick Pick Question frontend design (Desktop & Mobile) with 3-option interactive selection, hover/active press animations, and module breadcrumbs.
- [x] Implement Stitch Fill the Gap frontend design (Desktop & Mobile) with interactive sentence gap highlight, selectable chips, AI hint sparkle, and inline feedback evaluation.
- [x] Implement Stitch Flashcard Front frontend design (Desktop & Mobile) with psychology icon, question title, concept category, and "Tap / Click to Flip" pulse indicator.
- [x] Implement Stitch Flashcard Back frontend design (Desktop & Mobile) with 3D shutter/flip animation, definition, Coffman conditions checklist, and rating actions (Again, Good, Easy).
- [x] Implement Stitch Short Answer Empty frontend design (Desktop & Mobile) with live character counter (0/300), focus glow, and 3D Submit button.
- [x] Implement Stitch Short Answer Evaluation frontend design (Desktop & Mobile) with score ring (8/10), floating +20 XP badge, criteria checklist, cyan AI Quick Tip, and Next action.
- [x] Implement Stitch Correct Answer Feedback frontend design (Desktop & Mobile) with celebratory +10 XP animated popup, "GREAT JOB!" badge, and summary review.
- [x] Implement Stitch Wrong Answer Feedback frontend design (Desktop & Mobile) with shake animation, highlighted wrong answer with cross, and friendly conceptual correction.
- [x] Implement Stitch Combo Reward frontend design (Desktop & Mobile) with bouncy entrance, 🔥 COMBO ×5 badge, +25 XP BONUS gradient, and Continue Journey action.
- [x] Build integrated interactive Revision session flow and 9-tab Stitch Navigator inside `Revision.jsx`.
- [x] Validate client production build with zero errors.

### Anshul Gusain — Phase 4D Prompt 2: Advanced Revision Modes & Session Flow

- [x] Implement Stitch Match It frontend design (Desktop & Mobile) with dual-column concepts & definitions, connection dot ports, checkmarks on match, error shake on mismatch, and +15 XP completion banner (`MatchItCard.jsx`).
- [x] Implement Stitch Put in Order (Immersion Mode) frontend design (Desktop & Mobile) with draggable/reorderable packet sequence cards (SYN, SYN-ACK, ACK), step numbering badges, up/down arrows, and "PERFECT SEQUENCE! +15 XP" celebration (`PutInOrderCard.jsx`).
- [x] Implement Stitch Spot the Mistake frontend design (Desktop & Mobile) with interactive clickable sentence tokens, red strikethrough & green correction transition on faulty keyword ("unreliable" ➔ "reliable"), "NICE CATCH! +15 XP" badge, and AI explanation card (`SpotTheMistakeCard.jsx`).
- [x] Implement Stitch True / False frontend design (Desktop & Mobile) with large interactive FALSE/TRUE choice cards, top sparkle gradient accent, animated pop-in CORRECT!/INCORRECT result badge, and conceptual rationale (`TrueFalseCard.jsx`).
- [x] Implement Stitch Scenario Choice frontend design (Desktop & Mobile) with practical dilemma headline ("Reliable and ordered data delivery"), Choice A (TCP with Shield) vs Choice B (UDP with Speed), vibrant hover glow, and architectural AI justification (`ScenarioChoiceCard.jsx`).
- [x] Implement Stitch What Happens Next? frontend design (Desktop & Mobile) with scenario analysis card, CPU icon, AI sparkle pulse, 4 bento-grid prediction options (A, B, C, D), dynamic priority aging explanation, and +15 XP reward (`WhatHappensNextCard.jsx`).
- [x] Implement Stitch Rank It frontend design (Desktop & Mobile) with vertical FASTEST-to-SLOWEST track bar indicator, reorderable storage hierarchy cards (CPU Cache, RAM, SSD, HDD), and "PERFECT ORDER! +15 XP" overlay modal (`RankItCard.jsx`).
- [x] Implement Stitch Session Complete frontend design (Desktop & Mobile) with grand trophy celebration, multi-metric grid (Total XP, Accuracy %, Daily Streak 🔥, Time Spent), topic mastery progress bars, and "Return to Dashboard" / "Revise Again" actions (`SessionCompleteCard.jsx`).
- [x] Integrate all 17 revision modes seamlessly into `Revision.jsx` with progressive state flow and comprehensive Stitch screen tab bar navigator.
- [x] Validate production build with `npm run build` passing with zero errors.

### Bikram Singh Bisht — Phase 4E/4F Task B-1: Review Generation Contract & Dependencies

- [x] Review and verify Phase 4D Generation Contract (`aiGenerationContract.js`).
- [x] Review and verify RAG Context Retrieval and Context Builder (`ragContextService.js`).
- [x] Review and verify AI Provider integration and LLM prompt design (`aiGenerationService.js`).
- [x] Produce verification report confirming strict `sourceChunkIds` adherence, context bounds, and robust API handling without needing structural adjustments.

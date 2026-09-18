# ReviseAI — Phase 4: Learning, RAG & Revision Engine

# Development Timeline

> This file records meaningful development activity during Phase 4.
>
> Do not create entries for trivial changes.
>
> Each entry should accurately describe what was actually changed and tested.

---

# Timeline Entries

## Date: 11 September 2026

### Time: Current verification session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4A: Study Material Upload Implementation

**Changes Made:**
- Created `StudyMaterial` mongoose model tracking user hierarchy (`userId`, `subjectId`, `unitId`, `topicId`), metadata, and processing states.
- Implemented `cloudinaryService` for uploading and deleting files directly from memory buffers.
- Implemented `studyMaterialService` for business logic (hierarchy ownership validation across subjects, units, topics) and CRUD operations.
- Implemented `studyMaterialController` and protected routes in `studyMaterialRoutes.js`.
- Integrated `multer` memory storage for parsing multipart requests up to 10MB.
- Integrated Cloudinary environment variables.
- Created `MaterialUpload` and `MaterialList` frontend components.
- Integrated the new upload and list components into `SubjectWorkspace`, `UnitDetail`, and `TopicDetail` workspaces.
- Marked Phase 4A tasks as completed in `TASKDONE.md`.

**Files Created:**
- `server/src/models/StudyMaterial.js`
- `server/src/services/cloudinaryService.js`
- `server/src/services/studyMaterialService.js`
- `server/src/controllers/studyMaterialController.js`
- `server/src/routes/studyMaterialRoutes.js`
- `client/src/components/MaterialUpload/MaterialUpload.jsx`
- `client/src/components/MaterialUpload/MaterialUpload.module.css`
- `client/src/components/MaterialList/MaterialList.jsx`
- `client/src/components/MaterialList/MaterialList.module.css`

**Files Modified:**
- `server/src/app.js`
- `server/.env.example`
- `client/src/pages/SubjectWorkspace/SubjectWorkspace.jsx`
- `client/src/pages/UnitDetail/UnitDetail.jsx`
- `client/src/pages/TopicDetail/TopicDetail.jsx`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Checked server syntax using `node --check`.
- Ran frontend build successfully.
- Cross-user file access checks implemented in backend logic.

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4B: Document Processing Architecture (Task B1)

**Changes Made:**
- Created `DocumentChunk` schema to store processed text chunks.
- Established the central `documentProcessingService` orchestrator that routes files to the appropriate extractors and chunks the text.
- Defined skeleton contracts in `documentExtractors.js` and `textProcessing.js` for other team members to plug their implementations into.
- Updated `studyMaterialService.js` to automatically trigger the asynchronous processing pipeline after a successful file upload.
- Verified server syntax.
- Marked architecture tasks as completed in `TASKDONE.md`.

**Files Created:**
- `server/src/models/DocumentChunk.js`
- `server/src/services/documentProcessingService.js`
- `server/src/services/documentExtractors.js`
- `server/src/services/textProcessing.js`

**Files Modified:**
- `server/src/services/studyMaterialService.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Anukool Negi

**Task Worked On:**
Phase 4B: Text Extraction (AN1: PDF, AN2: DOCX, AN3: TXT) & Document Processing Pipeline Integration

**Changes Made:**
- Implemented `extractPdfText` in `documentExtractors.js` using `pdf-parse` with page tracking and error handling.
- Implemented `extractDocxText` in `documentExtractors.js` using `mammoth` for text extraction from `.docx` files.
- Implemented `extractTxtText` in `documentExtractors.js` with UTF-8 decoding and BOM removal.
- Implemented `performOcrFallback` in `documentExtractors.js` using `pdf-to-img` and `tesseract.js` for scanned PDF pages.
- Implemented `cleanText` in `textProcessing.js` for control char removal, hyphenation repairs, whitespace normalization, and line break cleanup.
- Implemented `chunkText` in `textProcessing.js` for paragraph/sentence aware chunking (~500 token target, ~100 token overlap) with `pageStart`/`pageEnd` metadata preservation.
- Enhanced `documentProcessingService.js` orchestrator with buffer resolution from `material.fileUrl` (retry safety), progress updates, and idempotent `DocumentChunk` database persistence.
- Added `POST /api/materials/:materialId/retry` route and controller action.
- Updated `MaterialList.jsx` and `MaterialList.module.css` with processing status steps, progress bar, real-time polling, and Retry action button.
- Added test suite `server/tests/document_processing.test.js`.

**Files Created:**
- `server/tests/document_processing.test.js`

**Files Modified:**
- `server/src/services/documentExtractors.js`
- `server/src/services/textProcessing.js`
- `server/src/services/documentProcessingService.js`
- `server/src/services/studyMaterialService.js`
- `server/src/controllers/studyMaterialController.js`
- `server/src/routes/studyMaterialRoutes.js`
- `client/src/components/MaterialList/MaterialList.jsx`
- `client/src/components/MaterialList/MaterialList.module.css`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Checked backend syntax via `node --check`.
- Ran unit test suite `node tests/document_processing.test.js` (all tests passed).
- Built frontend production assets via `npm run build` (build succeeded).

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4B: Text Processing Improvements (A1: Cleaning, A2: DocumentChunk, A3: Chunking)

**Changes Made:**
- Refined `cleanText` to normalize whitespace and line breaks, preserve paragraph and heading structure, remove repeated headers/footers, and filter obvious OCR noise.
- Updated `chunkText` to accept metadata, preserve paragraph and sentence boundaries, split oversized paragraphs at word boundaries when needed, maintain bounded overlap, and assign sequential `chunkIndex` values.
- Added the compound `materialId` and `chunkIndex` index to `DocumentChunk`.
- Kept extraction, OCR, orchestration, upload behavior, and database persistence flow unchanged.

**Files Created:**
- None. Existing Phase 4B text-processing and model files were updated.

**Files Modified:**
- `server/src/services/textProcessing.js`
- `server/src/models/DocumentChunk.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` successfully.
- Verified metadata propagation and sequential chunk indexes.
- Verified oversized paragraphs remain within the configured chunk size.
- Checked diagnostics and whitespace with no errors.

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4B: A1/A3 Responsibility Separation

**Changes Made:**
- Moved the existing text cleaning implementation to `server/src/utils/textCleaner.js`.
- Moved the existing chunking and token estimation implementation to `server/src/services/chunkingService.js`.
- Reduced `server/src/services/textProcessing.js` to backward-compatible re-exports only.
- Updated `documentProcessingService.js` to import cleaning and chunking from their dedicated modules.
- Preserved `DocumentChunk.js` without changes because its schema and indexes were already correct.

**Files Created:**
- `server/src/utils/textCleaner.js`
- `server/src/services/chunkingService.js`

**Files Modified:**
- `server/src/services/textProcessing.js`
- `server/src/services/documentProcessingService.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` successfully.
- Passed syntax checks for all refactored modules.
- Verified the direct `cleanText()` to `chunkText()` flow and metadata propagation.
- Confirmed no cleaning or chunking implementation remains in `textProcessing.js`.

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4B: A1/A3 Failed-Test Corrections

**Changes Made:**
- Updated `cleanText()` to join broken lowercase continuation lines while preserving headings and punctuated lines.
- Improved OCR noise handling by removing excessive symbol runs and standalone garbage tokens.
- Reworked `chunkText()` from character-based sizing to paragraph and sentence-aware word-based chunking.
- Added undersized-chunk merging and controlled 60-word overlap between adjacent chunks.
- Preserved sequential indexes, metadata propagation, sentence safety, and paragraph boundaries.

**Files Created:**
- None.

**Files Modified:**
- `server/src/utils/textCleaner.js`
- `server/src/services/chunkingService.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` successfully.
- Verified broken-line joining and OCR noise removal with the strict A1 sample.
- Verified A3 chunks remain within 300–800 words with overlap and metadata.
- Verified sequential chunk indexes and no diagnostics in the modified files.

## Date: 18 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 5 — Question & Flashcard Model Design

**Changes Made:**
- Designed and implemented MongoDB schemas for Questions and Flashcards with full metadata and validation support.
- Added hierarchical references for user, subject, unit, topic, and material.
- Added `sourceChunks` linkage to preserve RAG provenance and AI generation traceability.
- Enforced schema-level validation for required fields and enum values.
- Kept the implementation limited to the model layer, without services, APIs, or business logic.

**Files Created:**
- `server/src/models/Question.js`
- `server/src/models/Flashcard.js`

**Files Modified:**
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Status:**
Completed

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Anshul Gusain

**Task Worked On:**
Phase 4B: Document Processing UI (Task AS1)

**Changes Made:**
- Enhanced `MaterialList.jsx` to incorporate the 4-stage document processing pipeline visualization (`File uploaded` -> `Text extraction` -> `Preparing content` -> `Finalizing`).
- Added real-time processing feedback with animated pulse dots, progress percentages, and reassuring background UX messaging.
- Added completed state visual indicators ("Document processed successfully!") showing the material as ready for upcoming Phase 4 features.
- Added failed state handling with detailed error messaging and inline retry functionality.
- Updated `MaterialList.module.css` with responsive styling, stepper step dots, progress tracks, and clean color tokens matching ReviseAI design system.
- Expanded `server/tests/document_processing.test.js` with comprehensive test cases.
- Marked Task AS1 as completed in `TASKDONE.md`.

**Files Created:**
- None.

**Files Modified:**
- `client/src/components/MaterialList/MaterialList.jsx`
- `client/src/components/MaterialList/MaterialList.module.css`
- `server/tests/document_processing.test.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` (all 6 test suites passed).
- Built client production assets via `npm run build` with 0 errors.
- Verified state rendering for 'uploaded', 'processing', 'completed', and 'failed' states.
## Date: 14 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4: Bugfix - AI Subject Extraction JSON parsing errors

**Changes Made:**
- Updated `aiSubjectService.js` to utilize Gemini's native `responseSchema` property inside `generationConfig`.
- Enforced strict JSON structure matching the required schema to prevent "Expected ',' or ']'" syntax errors from the LLM.
- Eliminated reliance on manual JSON fallback parsing.

**Files Created:**
- None.

**Files Modified:**
- `server/src/services/aiSubjectService.js`

**Testing Performed:**
- Verified syntax correctness.
- Ensured malformed JSON errors from the AI model are prevented directly at the generation level.

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4B: A4 Processing Status & Error Handling

**Changes Made:**
- Added `processDocument(materialId)` to the existing `documentProcessingService.js` orchestration layer.
- Preserved the `uploaded` -> `processing` -> `completed` lifecycle and marked failures as `failed` with `processingError`.
- Added idempotent no-op behavior for completed materials and retry support for failed materials.
- Prevented duplicate concurrent processing when a material is already `processing`.
- Added ordered bulk chunk insertion after cleaning and chunking complete.
- Added cleanup of partially inserted chunks before persisting the failed state.
- Preserved `processStudyMaterial` as a compatibility alias for existing upload and retry flows.
- Left A1 cleaner, A2 model, and A3 chunking implementations unchanged.

**Files Created:**
- None. The existing processing service was extended.

**Files Modified:**
- `server/src/services/documentProcessingService.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` successfully.
- Passed syntax and diagnostics checks for the processing service.
- Confirmed the change scope excluded A1, A2, and A3 implementation files.

## Date: 14 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Task B3 — Complete Document Processing Pipeline

**Changes Made:**
- Finalized and verified the central integration within `documentProcessingService.js`.
- Connected AN1-3 text extractions, B2 OCR fallback, A1 text cleaning, A3 text chunking, and A2 DocumentChunk schema insertion into one continuous `processDocument` flow.
- Verified that the system safely processes PDFs, DOCX, and TXT files, triggering OCR dynamically only when standard extraction produces insufficient text.
- Formally completed Phase 4B per specification, strictly avoiding Phase 4C RAG/Embedding scope.

**Files Created:**
- None.

**Files Modified:**
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/document_processing.test.js` assuring end-to-end extraction and chunk storage without errors.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4C-1 — Embedding Service Foundation

**Changes Made:**
- Installed `@xenova/transformers` (v3.x) as a local embedding dependency — no external API, no Gemini.
- Created `server/src/services/embeddingService.js` as a singleton abstraction over the `Xenova/all-MiniLM-L6-v2` model.
- Implemented `generateEmbedding(text) → number[]` using mean pooling and L2 normalization to produce cosine-similarity-ready vectors.
- The service is isolated behind a clean interface so the underlying model can be swapped later without modifying any callers.
- Created `server/tests/embeddingService.test.js` to verify end-to-end embedding generation.

**Files Created:**
- `server/src/services/embeddingService.js`
- `server/tests/embeddingService.test.js`

**Files Modified:**
- `server/package.json` (added `@xenova/transformers` dependency)
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/embeddingService.test.js` — test passed.
- Confirmed model initialized: `Xenova/all-MiniLM-L6-v2`.
- Confirmed output vector dimension is exactly **384**.
- Confirmed output is a standard JavaScript `number[]` array.
- Confirmed embedding generated in ~7693ms on first call (model warm-up), subsequent calls will be faster.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4C-2: Qdrant Setup & Vector Collection

**Implementation Completed:**
- Added the official `@qdrant/js-client-rest` dependency.
- Created the dedicated `server/src/services/qdrantService.js` module.
- Added environment-based configuration for `QDRANT_URL`, `QDRANT_API_KEY`, and `QDRANT_COLLECTION_NAME`.
- Defined the `reviseai_document_chunks` collection with 384-dimensional Cosine vectors.
- Implemented reusable Qdrant initialization and collection-existence checks.
- Implemented safe collection creation that does not recreate an existing collection.
- Implemented basic vector upsert with the required user, subject, material, chunk, and page metadata payload.
- Added validation for vector dimension and finite numeric values.
- Added `server/tests/qdrantService.test.js` for isolated infrastructure verification.

**Files Created:**
- `server/src/services/qdrantService.js`
- `server/tests/qdrantService.test.js`

**Files Modified:**
- `server/package.json`
- `server/package-lock.json`
- `server/.env.example`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Scope Boundaries:**
- No retry logic, idempotency strategy, embedding logic, semantic search, RAG, or document-processing integration was implemented.
- Live Qdrant verification remains pending until `QDRANT_URL` and `QDRANT_API_KEY` are configured.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Anshul Gusain

**Task Worked On:**
Phase 4C-4: Vector Metadata & Source Mapping

**Changes Made:**
- Created `server/src/services/vectorMetadataService.js` to establish source-mapping and vector metadata handling for Phase 4C.
- Implemented `buildVectorPayload` to build standardized Qdrant payload schemas preserving complete hierarchical source tracing (`userId`, `subjectId`, `unitId`, `topicId`, `materialId`, `chunkId`, `chunkIndex`, `pageStart`, `pageEnd`).
- Implemented `validateVectorPayload` to enforce mandatory fields (`userId`, `subjectId`, `materialId`, `chunkId`, `chunkIndex`) and valid page bounds (`pageStart`, `pageEnd`).
- Implemented `mapVectorToSource` and `hydrateSourceMapping` to link vector search hits back to `DocumentChunk`, `StudyMaterial`, and hierarchical subject/unit/topic context.
- Implemented `resolveSourceChain` with strict `userId` ownership validation to prevent cross-user vector leakage.
- Implemented `formatSourceCitation` for human-readable RAG attribution (e.g. `[Material Title, pp. 3-4, Chunk #2]`).
- Updated `server/src/services/qdrantService.js` to reuse `buildVectorPayload` for unified payload extraction and validation.
- Created `server/tests/vectorMetadataService.test.js` covering payload extraction, schema validation, citation generation, model hydration, and user isolation.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Amit Rawat

**Task Worked On:**
Phase 4C-7

**Description:**
Implemented idempotent vector indexing with retry-safe Qdrant integration and added strict test coverage.

**Changes Made:**
- Added the stable vector identity contract `hash(materialId + chunkId + chunkIndex)` so the same DocumentChunk updates the same Qdrant point instead of producing duplicates on rerun.
- Kept Qdrant writes in UPSERT mode and ensured reprocessing revises existing vectors without deleting or duplicating MongoDB chunk records.
- Added bounded retry handling for transient Qdrant failures with a short exponential backoff and strict max retry count.
- Ensured invalid vector length and connection failures raise structured errors instead of being silently discarded.
- Preserved `DocumentChunk` integrity during partial failures and recorded meaningful failure metadata without deleting the source chunk.
- Updated the material status to a safe partial-failure state when a chunk batch fails indexing, rather than corrupting the source-of-truth MongoDB data.
- Kept the changes limited to the reliability layer and did not modify the embedding logic or search scope.

**Files Created:**
- `server/tests/qdrantService.test.js`
- `server/tests/chunkEmbeddingPipeline.test.js`
- `server/tests/chunkEmbeddingPipeline.real.test.js`

**Files Modified:**
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Status:**
Completed.

**Testing Performed:**
- Ran `node tests/qdrantService.test.js` — passed.
- Ran `node tests/chunkEmbeddingPipeline.test.js` — passed with all 13 tests green.
- Ran `node --experimental-test-module-mocks tests/chunkEmbeddingPipeline.real.test.js` — both real-pipeline tests passed.
- Confirmed duplicate prevention, stable vector IDs, retry success, partial failure isolation, processing status validation, and no MongoDB data loss under failed indexing scenarios.

**Files Created:**
- `server/src/services/vectorMetadataService.js`
- `server/tests/vectorMetadataService.test.js`

**Files Modified:**
- `server/src/services/qdrantService.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/vectorMetadataService.test.js` — all 7 test cases passed (schema extraction, fallback handling, validation errors, source mapping, citation formatting, model hydration, user isolation enforcement).
- Ran `node tests/qdrantService.test.js` — Qdrant infrastructure tests passed.
- Ran `node tests/embeddingService.test.js` — 384-d vector generation verified.
- Ran `node tests/document_processing.test.js` — Phase 4B pipeline regression suite passed.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4C-3 — Chunk-to-Embedding Pipeline Integration

**Changes Made:**
- Extended `DocumentChunk` schema with `embeddingStatus` (`pending`|`indexed`|`failed`) and `embeddingError` fields to track per-chunk vector indexing state independently of document processing state.
- Added compound index `{ materialId, embeddingStatus }` to `DocumentChunk` for efficient retry queries.
- Created `server/src/services/chunkEmbeddingPipeline.js` as the dedicated embedding orchestrator:
  - `embedChunksForMaterial(materialId)`: fetches all `pending`/`failed` chunks, embeds each via `embeddingService`, upserts into Qdrant via `qdrantService.upsertVector`, updates `embeddingStatus` in MongoDB.
  - `embedSingleChunk`: isolated per-chunk try/catch — failure of one chunk never stops others and never deletes the chunk.
  - Idempotent: chunks already in `embeddingStatus: 'indexed'` are skipped without re-embedding.
  - Bounded concurrency (`CONCURRENCY_LIMIT = 3`) to prevent transformer model memory exhaustion.
  - Both outer and inner error paths log clearly and never propagate to the caller.
- Wired `embedChunksForMaterial` into `documentProcessingService.processDocument` as a non-blocking fire-and-forget call after the material is marked `completed`. Embedding failures do not revert `processingStatus`.
- Created `server/tests/chunkEmbeddingPipeline.test.js` with 11 fully isolated tests using constructor-injection mocking (no real MongoDB, no real Qdrant).

**Files Created:**
- `server/src/services/chunkEmbeddingPipeline.js`
- `server/tests/chunkEmbeddingPipeline.test.js`

**Files Modified:**
- `server/src/models/DocumentChunk.js` (added `embeddingStatus`, `embeddingError`, compound index)
- `server/src/services/documentProcessingService.js` (wired embedding pipeline call)
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/chunkEmbeddingPipeline.test.js` — all 11 tests passed:
  - T1: Happy path — vector generated, Qdrant upserted, chunk marked `indexed`
  - T2: Embedding failure — chunk NOT deleted, `embeddingStatus` = `failed`
  - T3: Qdrant failure — chunk NOT deleted, `embeddingStatus` = `failed`
  - T4: Multiple chunks produce separate, independent embeddings
  - T5: Already-indexed chunks skipped on retry (idempotent)
  - T6: Partial failure — other chunks still indexed, all chunks preserved in MongoDB
  - T7: Zero pending chunks — returns early, no embedding calls made
  - T8: 384-dimensional vector contract verified
  - T9a/b/c: Phase 4B regression — extraction, cleaning, and chunking still pass
- Ran `node tests/document_processing.test.js` — all 6 Phase 4B tests passed.
- Ran `node tests/qdrantService.test.js` — Qdrant infrastructure tests passed.
- Ran `node tests/vectorMetadataService.test.js` — all 7 metadata service tests passed.
- Syntax checked all modified/created files via `node --check`.

**Scope Boundaries:**
- No semantic search, search API, RAG, or LLM generation implemented.
- Qdrant collection setup and client configuration remains in Amit's `qdrantService.js`.
- Upload request is never blocked by embedding; embedding runs fully in the background.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Anukool Negi

**Task Worked On:**
Phase 4C Tasks 4C-5 (Semantic Search Service) & 4C-6 (Protected Semantic Search API)

**Changes Made:**
- Added `searchVectors` method to `server/src/services/qdrantService.js` to execute Qdrant similarity search with retries.
- Added `setGenerateEmbeddingForTests` helper to `server/src/services/embeddingService.js`.
- Created `server/src/services/semanticSearchService.js` implementing `searchSemanticChunks` which:
  - Generates query embedding using the existing `embeddingService`.
  - Constructs Qdrant filter object with mandatory `userId` filter and optional `subjectId`, `unitId`, `topicId`, `materialId` filters.
  - Enforces ownership validation across `Subject`, `Unit`, `Topic`, and `StudyMaterial` records.
  - Performs Qdrant similarity search.
  - Hydrates matching chunks and materials from MongoDB.
  - Formats clean citations and returns sanitized chunk results (omitting raw vectors and Qdrant internal IDs).
- Created `server/src/controllers/searchController.js` and `server/src/routes/searchRoutes.js` exposing `POST /api/search` protected by `authenticateToken`.
- Updated `server/src/app.js` to mount `app.use('/api/search', searchRoutes)`.
- Created `server/tests/semanticSearch.test.js` covering input validation, user isolation, hierarchical filtering, happy path hydration, and protected endpoint behavior.
- Marked Tasks 4C-5 and 4C-6 as completed in `TASKDONE.md`.

**Files Created:**
- `server/src/services/semanticSearchService.js`
- `server/src/controllers/searchController.js`
- `server/src/routes/searchRoutes.js`
- `server/tests/semanticSearch.test.js`

**Files Modified:**
- `server/src/services/qdrantService.js`
- `server/src/services/embeddingService.js`
- `server/src/app.js`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node server/tests/semanticSearch.test.js` — all 4 test suites passed.
- Ran `node server/tests/embeddingService.test.js` — passed.
- Ran `node server/tests/qdrantService.test.js` — passed.
- Ran `node server/tests/vectorMetadataService.test.js` — passed.
- Ran `node server/tests/chunkEmbeddingPipeline.test.js` — passed (13/13 passed).
- Ran `node server/tests/document_processing.test.js` — passed (6/6 passed).
- Ran `node --check` syntax check across all created and modified JavaScript files.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Anshul Gusain

**Task Worked On:**
Phase 4C Task 4C-8 — Processing State + Frontend Integration

**Changes Made:**
- Integrated frontend material list and processing UI with actual backend status values (`uploaded`, `processing`, `completed`, `failed`).
- Represented multi-stage asynchronous processing lifecycle: `File uploaded` -> `Text extraction` -> `Chunking & Cleaning` -> `Building knowledge index`.
- Maintained non-intrusive auto-polling (every 3 seconds) for materials in active processing states without blocking user interactions.
- Added UX reassurance note informing users that background processing and indexing can continue asynchronously while they navigate elsewhere.
- Integrated robust failure handling with contextual error messaging and retry capability calling the existing backend retry endpoint (`/api/materials/:id/retry`).
- Ensured no sensitive vector values, internal Qdrant IDs, or embedding arrays are exposed in the frontend.
- Verified zero fake progress percentages or invented backend statuses are displayed.

**Files Created:**
None (reused and integrated existing component architecture).

**Files Modified:**
- `client/src/components/MaterialList/MaterialList.jsx`
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `npm run build` in `client` — successfully built production bundle in 579ms with 0 errors.
- Ran `node server/tests/vectorMetadataService.test.js` — all 7 tests passed.
- Ran `node server/tests/chunkEmbeddingPipeline.test.js` — all 13 tests passed.
- Ran `node server/tests/semanticSearch.test.js` — all 4 test suites passed.
- Ran `node server/tests/document_processing.test.js` — all 6 Phase 4B tests passed.
- Confirmed full compatibility with Phase 1–3 and Phase 4A/B/C features.

## Date: 15 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4C-3 — Bugfix: Qdrant Vector ID Format & Collection Auto-Creation

**Context:**
Two runtime errors were discovered during live end-to-end testing with a real Qdrant Cloud cluster immediately after Phase 4C-3 implementation. Both were diagnosed and fixed in the same session.

**Bug 1 — Invalid Qdrant Point ID (400 Bad Request)**

The `buildStableVectorId` function in `qdrantService.js` produced a raw 64-character SHA-256 hex string (e.g. `988a2b3c4569c162...`). Qdrant's REST API strictly requires point IDs to be either UUIDs or unsigned 64-bit integers. A raw hex string caused every upsert to return `400 Bad Request`.

Fix: Reformatted the first 32 hex characters of the SHA-256 digest into the standard `8-4-4-4-12` UUID layout (e.g. `7a619da3-7d0d-e15e-0cc4-1b397561621d`). The value remains deterministic and stable — the same chunk always maps to the same Qdrant point ID.

**Bug 2 — Collection Not Found (404 Not Found)**

The `embedChunksForMaterial` function attempted to upsert vectors directly without first ensuring the Qdrant collection existed. The collection is not created at server startup, so the first upsert into an empty cluster returned `404 Not Found` on every attempt.

Fix: Added `await createCollection()` at the start of `embedChunksForMaterial`, before the chunk loop. `createCollection()` is already idempotent — it checks whether the collection exists and only creates it if missing.

**Bug 3 — Incorrect `processingStatus` Revert on Embedding Failure**

Amit's Phase 4C-7 code set `processingStatus = 'failed'` on the `StudyMaterial` document when any chunk failed Qdrant indexing. This violated the design contract: document processing had already completed successfully and the material should remain `'completed'`. This caused the UI to show a "Failed" card even though the PDF was fully extracted and chunked.

Fix: Removed the block that reverted `processingStatus`. Embedding failures are now tracked exclusively via `DocumentChunk.embeddingStatus = 'failed'`, which is the correct source of truth for the indexing state.

**Files Modified:**
- `server/src/services/qdrantService.js` (fixed UUID format in `buildStableVectorId`)
- `server/src/services/chunkEmbeddingPipeline.js` (added `createCollection()` call; removed incorrect `processingStatus` revert; removed unused `StudyMaterial` import)
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Ran `node tests/chunkEmbeddingPipeline.test.js` — all 13 tests passed after fixes.
- Ran `node --check` syntax check on all modified files.
- Verified UUID format is valid: `7a619da3-7d0d-e15e-0cc4-1b397561621d` (length 36, passes UUID regex).
- Verified determinism: same chunk identity always produces the same UUID.
- Live tested with a real Qdrant Cloud cluster (sa-east-1, AWS): uploaded a 12-chunk PDF and confirmed `indexed=12, failed=0, skipped=0` in the server terminal.
- Confirmed the `reviseai_document_chunks` collection was auto-created in the Qdrant dashboard without any manual intervention.

## Date: 18 September 2026

### Time: Current session

### Team Member Name: Bikram Singh Bisht

**Task Worked On:**
Phase 4D Task 1 — AI Generation Contract & Architecture Analysis

**Changes Made:**
- Analyzed existing Phase 4 architecture and RAG vector metadata format.
- Created `server/src/contracts/aiGenerationContract.js` outlining Zod schemas for generation requests and response validation.
- Defined 9 content types (MCQ, Flashcard, True/False, One-word, Fill-in-the-blank, Match the following, Sequence, Spot the mistake, What happens next).
- Merged "Put in order" and "Arrange the following in order" into a single `Sequence` type based on feedback.
- Ensured the generation pipeline will validate and parse structured output from the LLM cleanly.

**Files Created:**
- `server/src/contracts/aiGenerationContract.js`
- `server/tests/aiGenerationContract.test.js`

**Files Modified:**
- `docs/Phase/Phase_4/TASKDONE.md`
- `docs/Phase/Phase_4/TIMELINE.md`

**Testing Performed:**
- Created and successfully ran `node --test tests/aiGenerationContract.test.js` to ensure the Zod validation works correctly.

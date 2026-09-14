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


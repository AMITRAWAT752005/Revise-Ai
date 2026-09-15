# Phase 4 — Learning, RAG & Revision Engine Profile

## 1. Phase Overview

**Phase:** Phase 4  
**Name:** Learning, RAG & Revision Engine  
**Status:** Planned  
**Previous Phase:** Phase 3 — Subject Management & Syllabus-to-Subject Extraction  
**Primary Goal:** Build the complete AI-powered learning pipeline, from study material upload and document processing to RAG-backed content generation, practice sessions, spaced repetition, and revision scheduling.

Phase 4 must reuse the existing models (`User`, `UserProgress`, `Subject`, `Unit`, `Topic`) and authentication system. It builds the core AI infrastructure of ReviseAI and powers question generation, flashcard generation, and answer evaluation, setting the stage for Phase 5.

---

## 2. Phase Objectives

- Implement Study Material upload and storage (Cloudinary/S3).
- Process uploaded documents (PDF/DOCX/TXT) to extract and chunk text, using OCR only when necessary.
- Build a Vector Database Foundation by generating embeddings (e.g., all-MiniLM-L6-v2) for document chunks and storing them in Qdrant for semantic search.
- Use an LLM (Groq) with RAG to generate varied learning content (MCQs, Flashcards, Short/Long questions, etc.) from user's actual material.
- Persist generated content in `Question` and `Flashcard` collections.
- Build a Practice Engine for users to practice questions with randomized selection and session tracking.
- Implement both objective answer evaluation and RAG-based subjective answer evaluation via LLM.
- Track user performance with `QuestionAttempt` to determine mastery and weak topics.
- Implement a Spaced Repetition scheduling algorithm to determine when topics should be reviewed next.
- Combine the features into a cohesive Revision Session workflow.
- Integrate Gamification by updating `UserProgress` (XP and streaks) based on learning activity.
- Preserve all previous Phase behavior.

---

## 3. Existing Architecture to Reuse

### Authentication
- Existing authenticated session, cookie-based authentication, `authenticateToken` middleware, and protected routes.

### Database Models
Reuse the existing hierarchical models without duplication:
- `User`
- `UserProgress` (for XP and streak integration)
- `Subject`
- `Unit`
- `Topic`

### New Models
Phase 4 will introduce:
- `StudyMaterial`
- `DocumentChunk`
- `Question`
- `Flashcard`
- `PracticeSession`
- `QuestionAttempt`
- `RevisionSchedule`

---

## 4. Scope

### 4A — Study Material Upload
- Allow users to upload learning materials (PDF, DOCX, TXT, etc.) for a specific Subject/Unit/Topic.
- Store files using an external storage service (e.g., Cloudinary).
- Track processing status (`uploaded`, `processing`, `completed`, `failed`).

### 4B — Document Processing
- Extract text from digital PDFs using libraries (e.g., pdf-parse/pdfjs-dist).
- Use external OCR APIs (e.g., Google Vision) ONLY for scanned PDFs.
- Clean text and break it into chunks (`DocumentChunk`).

### 4C — Embeddings & Vector Database Foundation
- Create a reusable Embedding Service generating numerical vectors (e.g., using `sentence-transformers/all-MiniLM-L6-v2` with 384 dimensions) isolated from LLMs like Gemini.
- Store vectors and extensive metadata (`userId`, `subjectId`, `materialId`, etc.) in Qdrant (MongoDB remains the source of truth).
- Implement an idempotent indexing pipeline with retry support and accurate processing status.
- Build a protected Semantic Search API ensuring strict data isolation by enforcing `userId` and hierarchical filters.

### 4D & 4E — AI Content Generation & Storage
- Retrieve relevant source chunks using RAG.
- Use an LLM (Groq) to generate educational content (MCQs, T/F, Short/Long questions, Flashcards) from the chunks.
- Store generated content with references to source chunks.

### 4F & 4G — Practice Engine & Evaluation
- Allow users to start practice sessions with customizable parameters (topic, difficulty, type).
- Objectively evaluate MCQs and Fill-in-the-blanks.
- Subjectively evaluate Short/Long answers using the LLM against retrieved source chunks (not general knowledge).

### 4H & 4I — Performance Tracking & Spaced Repetition
- Record attempts in `QuestionAttempt` (score, time, accuracy).
- Calculate and update a `RevisionSchedule` for topics based on user performance (custom or SM-2 style algorithm).

### 4J & 4K — Revision Session & Gamification
- Provide a unified UI for users to complete "Today's Revision".
- Award XP and update streaks in `UserProgress` upon completing questions, flashcards, or sessions.

---

## 5. File and Processing Requirements

- Ensure uploaded files are strictly associated with the authenticated user.
- Enforce file size and type validation before uploading.
- Handle extraction pipeline failures gracefully and update `StudyMaterial.processingError`.
- Chunking must retain context and token limits suitable for the embedding model (e.g., all-MiniLM-L6-v2).
- Vector search via Qdrant must always filter by `userId` to prevent data leakage.

---

## 6. Authorization and Security Rules

- All Phase 4 endpoints must require authentication.
- Strict data isolation: Users can only upload, process, search, and practice their own materials and questions.
- Vector search metadata filters MUST include `userId`.
- External API keys (Groq, Cloudinary, Embedding provider) must remain secure on the backend.
- Do not expose source documents or extracted text of one user to another.

---

## 7. Out of Scope

The following are not Phase 4 responsibilities:
- Phase 5 AI Study Assistant (Chatbot interface for learning).
- Real-time multiplayer practice.
- RAG as a standalone user-facing UI feature (it is a backend utility powering the content generation and evaluation).

---

## 8. Testing Expectations

- Verify secure file upload and robust error handling.
- Verify text extraction and OCR fallback triggers correctly.
- Verify embedding generation (e.g., 384 dimensions) and Qdrant storage with correct metadata payload.
- Verify semantic search isolates data strictly by `userId` and prevents duplicate vectors.
- Verify structured LLM output for content generation.
- Verify objective and subjective answer evaluation logic.
- Verify Spaced Repetition scheduling calculates future dates correctly.
- Verify XP and streak updates in `UserProgress`.
- Verify Phase 1, Phase 2, and Phase 3 regressions.

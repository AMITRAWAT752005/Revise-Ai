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
- [ ] Implement text extraction for digital PDFs (e.g., via `pdf-parse`).
- [ ] Implement text extraction for DOCX and TXT files.
- [ ] Implement OCR fallback (e.g., Google Vision) for scanned/image-based PDFs.
- [ ] Implement text cleaning and chunking logic.
- [x] Create `DocumentChunk` schema to store text chunks with metadata.
- [x] Update `StudyMaterial` status to "completed" or "failed" based on outcome.

---

# 4. Phase 4C — RAG Knowledge Base

- [ ] Integrate an Embedding API (OpenAI, Gemini, Cohere, etc.).
- [ ] Generate vector embeddings for `DocumentChunk` records.
- [ ] Configure MongoDB Atlas Vector Search for the chunks.
- [ ] Implement RAG retrieval service that filters by `userId`, `subjectId`, etc.

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

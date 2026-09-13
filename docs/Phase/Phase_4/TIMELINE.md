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

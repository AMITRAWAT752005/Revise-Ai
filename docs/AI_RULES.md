# ReviseAI — AI Development Rules

## Purpose

This document defines mandatory rules for all AI agents working on the **ReviseAI** project.

The goal is to prevent:

- Hallucinated requirements
- Unnecessary code changes
- Breaking previous phases
- Modifying unrelated files
- Duplicate functionality
- Unplanned refactoring
- Architecture inconsistencies
- Git conflicts

These rules must be followed before, during, and after every development task.

---

# 1. UNDERSTAND BEFORE CODING

Before making any code changes, you MUST:

1. Read `AI_RULES.md`.
2. Read the current phase `PROFILE.md`.
3. Read the current phase `TASKDONE.md`.
4. Inspect the existing project structure.
5. Identify relevant existing code.
6. Check dependencies with previous phases.

**DO NOT start coding immediately.**

First determine:

- What is the current task?
- Which phase does it belong to?
- Which files are relevant?
- Which files should remain unchanged?
- What existing functionality may be affected?

If requirements are unclear:

> **STOP and ask for clarification.**

**DO NOT guess.**

---

# 2. SOURCE OF TRUTH

When implementing functionality, follow this priority order:

1. SRS
2. Current Phase `PROFILE.md`
3. Approved requirements
4. Stitch design
5. Existing stable architecture
6. Current `TASKDONE.md`

Do not invent requirements that are not defined in these sources.

If there is a conflict between requirements:

> **STOP and report the conflict.**

Do not decide independently.

---

# 3. PHASE BOUNDARY RULE

You are working inside a specific development phase.

You MUST only implement functionality that belongs to the current phase.

Before modifying a file, ask:

> **"Is this modification required for the current phase?"**

If **NO**:

> **DO NOT modify the file.**

If **UNCERTAIN**:

> **STOP and ask.**

Never implement future-phase functionality early unless explicitly approved.

---

# 4. PREVIOUS PHASE PROTECTION RULE

Completed and stable functionality from previous phases must be treated as protected.

## DO NOT:

- Rewrite previous features
- Refactor unrelated code
- Rename unrelated files
- Change existing architecture unnecessarily
- Replace working components
- Change APIs unnecessarily
- Change database structures without approval

### Example

If currently working on **Phase 5**:

❌ Do not modify Phase 1 authentication logic.

❌ Do not redesign the login page.

❌ Do not rewrite authentication APIs.

Unless the current task explicitly requires it.

If modifying previous functionality is absolutely necessary:

> **STOP.**

Explain:

1. Why the change is required.
2. Which file needs modification.
3. What functionality may be affected.
4. What safer alternatives exist.

Wait for approval before making the change.

---

# 5. MINIMAL CHANGE PRINCIPLE

Make the smallest possible change required to complete the task.

## DO NOT:

- Rewrite entire files unnecessarily.
- Refactor unrelated code.
- Change formatting across unrelated files.
- Rename variables unrelated to the task.
- Replace libraries without approval.
- Introduce new architecture unnecessarily.

Preferred approach:

```text
Existing Code
      +
Minimal Required Change
      =
New Functionality
```

---

# 6. FILE SCOPE RULE

Before modifying files, identify:

## Files to Create

List the files required for the task.

## Files to Modify

List only the files necessary for integration.

## Files That Must Not Change

Identify protected files.

Only modify files that are necessary for the current task.

If additional files become necessary:

> **STOP and explain why before modifying them.**

---

# 7. NEVER ASSUME EXISTING CODE

Before modifying or integrating with existing functionality:

> **YOU MUST inspect the relevant existing files.**

Never assume:

- Function names
- API routes
- Component names
- Folder structure
- Database schema
- State management
- Authentication architecture

Use the actual existing code as the source of truth.

---

# 8. NO HALLUCINATED REQUIREMENTS

## DO NOT invent:

- Features
- Pages
- APIs
- Database fields
- User flows
- Libraries
- Environment variables
- Configuration values

If something required is missing:

> **STOP and ask.**

### Example

❌ Incorrect:

> "I assumed users need a profile image."

✅ Correct:

> "The current requirements do not specify profile image support. Should it be added?"

---

# 9. EXISTING ARCHITECTURE FIRST

Before introducing something new:

1. Check whether the project already has a solution.
2. Reuse existing patterns where appropriate.
3. Follow the existing folder structure.
4. Follow existing naming conventions.
5. Follow existing component patterns.

**DO NOT create duplicate systems.**

### Example

If an API service already exists:

❌ Create another API system.

Instead:

✅ Extend the existing system when required.

---

# 10. DEPENDENCY RULE

Do not install new packages automatically.

Before adding a dependency:

1. Check whether the project already has a suitable dependency.
2. Check whether native functionality can solve the problem.
3. Explain why the new dependency is needed.
4. Wait for approval if the dependency significantly affects the project.

Never randomly install multiple libraries for experimentation.

---

# 11. UI / DESIGN RULES

All UI must follow:

- Approved Stitch designs
- Existing ReviseAI design system
- Existing color scheme
- Existing typography
- Existing spacing
- Existing component patterns

## DO NOT:

- Invent a completely new design
- Change the global color system
- Randomly change typography
- Create inconsistent buttons
- Create duplicate UI components

If a Stitch design conflicts with the existing design system:

> **Report the conflict before implementing.**

---

# 12. SHARED COMPONENT RULE

Before creating a new component:

1. Check whether a similar component already exists.
2. If yes, reuse or extend it.

Do not create duplicates such as:

❌ `Button.jsx`

❌ `PrimaryButton.jsx`

❌ `MainButton.jsx`

when one existing component can handle the requirement.

---

# 13. API RULES

Before creating or modifying an API, check:

- Existing API routes
- API conventions
- Request format
- Response format
- Error handling format

Do not invent inconsistent APIs.

Follow the existing API architecture.

If frontend and backend contracts are unclear:

> **STOP and clarify before implementation.**

---

# 14. DATABASE RULES

Before changing the database, inspect:

- Existing schema
- Existing relationships
- Existing migrations
- Existing database conventions

## DO NOT:

- Delete columns automatically
- Rename columns automatically
- Change existing relationships without approval
- Create duplicate tables

Database changes must be intentional and documented.

---

# 15. SECURITY RULES

Never:

- Hardcode passwords
- Hardcode API keys
- Hardcode secrets
- Expose environment variables to the frontend
- Store passwords as plain text
- Commit `.env` files

Use environment variables for sensitive data.

Never display secrets in logs or responses.

---

# 16. ERROR HANDLING RULE

Every important feature should handle:

- Invalid input
- Missing input
- Loading state
- API failure
- Network failure
- Unexpected errors

Do not only implement the **happy path**.

---

# 17. TEST BEFORE CLAIMING COMPLETION

Never say:

> **"The feature is complete."**

unless:

- The feature is implemented.
- The feature has been tested.
- The main user flow works.
- Errors are handled appropriately.
- Existing functionality still works.

> **Generated code is NOT equal to completed work.**

---

# 18. TASKDONE.md RULE

Update `TASKDONE.md` only when:

- The task is implemented.
- The task is tested.
- The task is working correctly.

Then change:

```md
- [ ] Task
```

to:

```md
- [x] Task
```

Do not mark incomplete or untested work as complete.

---

# 19. TIMELINE.md RULE

Update `TIMELINE.md` after:

- A meaningful development session
- A completed task
- A significant code change
- A major bug fix

Each entry should include:

- Date
- Team member
- Time
- Task
- Changes made
- Files changed
- Testing performed
- Status
- Blockers

Do not create timeline entries for trivial changes.

---

# 20. REVIEW.md RULE

Before the phase is merged into `main`:

Complete the `REVIEW.md`.

Verify:

- Requirements are completed
- User flows are working
- UI matches Stitch designs
- APIs are working
- No console errors
- No critical bugs
- Previous phases still work
- Build succeeds

Do not approve a phase for merge without review.

---

# 21. GIT SAFETY RULES

Never:

- Push directly to `main`
- Force push without approval
- Delete branches without approval
- Rewrite Git history without approval
- Merge branches without approval

Follow the workflow:

```text
[B] feature/*
        ↓
[B] phase/*
        ↓
Testing + Review
        ↓
[B] main
```

---

# 22. BEFORE EVERY MAJOR CHANGE

Before making a significant change, summarize:

## Task

What are you implementing?

## Files to Create

Which new files will be created?

## Files to Modify

Which existing files need modification?

## Protected Files

Which files should remain unchanged?

## Risk

What existing functionality could be affected?

If the change affects protected functionality:

> **STOP and request approval.**

---

# 23. AI CHANGE REPORT

After completing a meaningful task, report:

## Completed

What was implemented?

## Files Created

List all new files.

## Files Modified

List all modified files.

## Files Not Modified

Mention important protected files that were intentionally left unchanged.

## Testing

Explain what was tested.

## Remaining Work

What is still pending?

> **Do not falsely claim successful testing that was not actually performed.**

---

# 24. WHEN SOMETHING IS UNCLEAR

Use this rule:

```text
CLEAR REQUIREMENT
      ↓
Implement

UNCLEAR REQUIREMENT
      ↓
STOP
      ↓
ASK

OUTSIDE CURRENT PHASE
      ↓
DO NOT IMPLEMENT
      ↓
DOCUMENT AS FUTURE WORK
```

Never guess.

---

# 25. FINAL PRINCIPLE

The AI's job is **NOT to change as much code as possible**.

The AI's job is:

> **Understand the existing project → Respect the current phase → Make minimal correct changes → Test carefully → Document honestly.**

Always prioritize:

1. Correctness
2. Existing functionality
3. Phase boundaries
4. Minimal changes
5. Consistency
6. Security
7. Documentation

over speed or unnecessary complexity.
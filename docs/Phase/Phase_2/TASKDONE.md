# Phase 2 — TASKDONE

> **Purpose:** Master checklist for all work required to complete Phase 2 — Home / Dashboard.
>
> Team members should change `[ ]` to `[x]` only after the task has actually been implemented and verified.
>
> Do not mark a task complete based only on code being written. Test the behavior first.

---

## 1. Phase Setup & Planning

- [ ] Create Phase 2 branch.
- [ ] Create Phase 2 documentation folder.
- [ ] Review `AI_RULES.md`.
- [ ] Review `SRS.md`.
- [ ] Review Phase 1 implementation before making changes.
- [ ] Confirm Phase 1 authentication remains the integration baseline.
- [ ] Define/confirm Phase 2 Home requirements.
- [ ] Define required Home API contracts.
- [ ] Confirm destination routes for every Home-page action.
- [ ] Confirm task ownership between team members.

---

## 2. Frontend — Dashboard Foundation

- [ ] Create/verify authenticated Home/Dashboard route.
- [ ] Integrate existing application layout.
- [ ] Reuse existing sidebar/navbar.
- [ ] Highlight Home/Dashboard correctly.
- [ ] Reuse existing typography and spacing system.
- [ ] Reuse existing color palette.
- [ ] Reuse existing icon style.
- [ ] Build responsive desktop layout.
- [ ] Build responsive tablet layout.
- [ ] Build responsive mobile layout.
- [ ] Verify no Phase 1 UI is unintentionally changed.

---

## 3. Frontend — Welcome Section

- [ ] Connect Home to authenticated user state.
- [ ] Fetch/use authenticated user's name.
- [ ] Display personalized greeting.
- [ ] Add appropriate supporting message.
- [ ] Handle missing user information safely.
- [ ] Verify greeting updates for different authenticated users.

---

## 4. Frontend — Dashboard Statistics

### Daily Revision

- [ ] Build Daily Revision card.
- [ ] Display questions due today when data is available.
- [ ] Add Start/Continue Revision action.
- [ ] Connect action to Revision route.
- [ ] Add loading state.
- [ ] Add empty state.
- [ ] Add error state.

### Streak

- [ ] Build Streak card.
- [ ] Display current streak from real data.
- [ ] Handle zero streak correctly.
- [ ] Add appropriate motivational presentation.
- [ ] Add loading state where required.
- [ ] Add error state where required.

### Exam Readiness

- [ ] Build Readiness card.
- [ ] Display real readiness data when available.
- [ ] Do not invent readiness values.
- [ ] Handle unavailable readiness data.
- [ ] Add loading state.
- [ ] Add error state.

### XP / Level

- [ ] Display XP/level only if included in the approved Home design/API contract.
- [ ] Use real backend/user data.
- [ ] Do not allow Home to directly modify XP or level.

---

## 5. Frontend — Subject Overview

- [ ] Build Subject Overview section.
- [ ] Display subject names.
- [ ] Display subject progress when available.
- [ ] Display subject accuracy when available.
- [ ] Handle zero subjects.
- [ ] Handle loading state.
- [ ] Handle API error state.
- [ ] Add View All Subjects action.
- [ ] Connect View All Subjects to Subjects route.
- [ ] Make subject cards navigate to the correct subject route when that route is available.

---

## 6. Frontend — New User / Empty State

- [ ] Detect no-subject/no-learning-data state.
- [ ] Build friendly empty state.
- [ ] Explain what the user should do next.
- [ ] Add primary CTA.
- [ ] Connect CTA to Subject Creation route.
- [ ] Verify CTA works.
- [ ] Verify empty state does not block authenticated navigation.

---

## 7. Frontend — Home Actions & Navigation

For **every** button/link/action visible on Home:

- [ ] Create Subject → correct Subject Creation route.
- [ ] View Subjects → correct Subjects route.
- [ ] Start Revision → correct Revision route.
- [ ] View Analytics → correct Analytics route.
- [ ] Notifications → correct Notifications route.
- [ ] Profile → correct Profile route.
- [ ] Settings → correct Settings route.
- [ ] Any additional action → destination route confirmed and tested.
- [ ] No button is visually present without a defined behavior.
- [ ] No dead links.
- [ ] No duplicate/incorrect routes.
- [ ] Browser back/forward navigation works correctly.

---

## 8. Backend / API

- [ ] Confirm required Home API contract.
- [ ] Implement only APIs required by Home.
- [ ] Protect Home APIs with authentication middleware.
- [ ] Verify authenticated user ownership.
- [ ] Return standardized API responses.
- [ ] Validate API input where applicable.
- [ ] Handle database/API failures.
- [ ] Do not expose private user data to other users.
- [ ] Do not implement unrelated future-phase business logic.
- [ ] Test APIs independently.

---

## 9. Data Integration

- [ ] Integrate authenticated profile data.
- [ ] Integrate dashboard summary data if available.
- [ ] Integrate streak data.
- [ ] Integrate daily revision data if available.
- [ ] Integrate readiness data if available.
- [ ] Integrate subject overview data if available.
- [ ] Verify zero/empty values.
- [ ] Verify API loading behavior.
- [ ] Verify API failure behavior.
- [ ] Verify refresh/reload behavior.
- [ ] Verify data belongs to the logged-in user.

---

## 10. UX States

- [ ] Loading state.
- [ ] Empty state.
- [ ] Error state.
- [ ] Success/normal state.
- [ ] No confusing blank sections.
- [ ] User always has a clear next action.
- [ ] Error messages are understandable.
- [ ] Retry actions work where appropriate.

---

## 11. Responsive & Accessibility Testing

- [ ] Mobile layout tested.
- [ ] Tablet layout tested.
- [ ] Desktop layout tested.
- [ ] Navigation works on small screens.
- [ ] Cards do not overflow.
- [ ] Buttons have usable touch targets.
- [ ] Text remains readable.
- [ ] Keyboard navigation checked.
- [ ] Focus states checked.
- [ ] Images/icons have appropriate accessible labels where required.
- [ ] Color is not the only method of communicating state.

---

## 12. Integration Testing

- [ ] Register → OTP → Commitment → Home works.
- [ ] Login → Home works.
- [ ] Google Login → Home works.
- [ ] Existing authenticated session → Home works.
- [ ] Invalid/expired session → Login works.
- [ ] Logout → Login works.
- [ ] Home navigation to Subjects works.
- [ ] Home navigation to Revision works.
- [ ] Home navigation to Analytics works.
- [ ] Home navigation to Notifications works.
- [ ] Home navigation to Profile works.
- [ ] Home navigation to Settings works.
- [ ] Phase 1 authentication remains functional.

---

## 13. Code Quality & Security

- [ ] Only required files modified.
- [ ] Existing components reused where appropriate.
- [ ] Duplicate components avoided.
- [ ] No unnecessary refactoring.
- [ ] No hardcoded secrets.
- [ ] No direct frontend-to-MongoDB access.
- [ ] Protected data requires authentication.
- [ ] User ownership is validated by backend.
- [ ] Errors do not expose sensitive information.
- [ ] No console/debug code left unnecessarily.

---

## 14. Documentation

- [ ] `Profile.md` finalized.
- [ ] `TASKDONE.md` updated as tasks are completed.
- [ ] `TIMELINE.md` updated with meaningful development sessions.
- [ ] `REVIEW.md` completed after implementation/testing.
- [ ] API changes documented if applicable.
- [ ] Route changes documented if applicable.
- [ ] Known blockers documented.

---

## 15. Final Verification

- [ ] All required Phase 2 tasks completed.
- [ ] All Home buttons/links tested.
- [ ] All required routes verified.
- [ ] Desktop tested.
- [ ] Tablet tested.
- [ ] Mobile tested.
- [ ] Authentication regression tested.
- [ ] API integration tested.
- [ ] No unrelated phase modified.
- [ ] No known critical bugs remain.
- [ ] REVIEW.md approved.
- [ ] Phase 2 ready for merge.

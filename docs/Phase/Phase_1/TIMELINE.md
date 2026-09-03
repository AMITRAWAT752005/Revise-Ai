# ReviseAI — Phase 1: Authentication
# Development Timeline

> This file records meaningful development activity during Phase 1.
>
> Do not create entries for trivial changes.
>
> Each entry should accurately describe what was actually changed and tested.

---

# Timeline Entries


## Date: 02 September 2026
### Team Member: Bikram Singh Bisht
**Time:** 01:48 PM

**Task Worked On:**
Phase 1 — Sign Up Page UI (Desktop & Mobile Responsive)

**Changes Made:**
- Created `client/src/pages/Auth/Signup.jsx` matching the Stitch "Sign Up - Desktop" design
- Created `client/src/pages/Auth/Signup.module.css` with full responsive CSS matching the ReviseAI design system (Indigo primary, Inter font, ambient shadows, pressable buttons, input glow)
- Added ReviseAI Book Logo and signup illustration assets to `client/src/assets/images/`
- Updated `client/src/App.jsx` to add `/signup` route with redirect from `/`
- Replaced old Vite default `index.css` with clean ReviseAI global reset
- Replaced old Vite `App.css` import (no longer needed)
- Removed temporary `desktop_signup.html` scratch file
- Updated `client/index.html` title to "ReviseAI" and added Inter + Material Symbols font imports

**Files Created:**
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Auth/Signup.module.css`
- `client/src/assets/images/book-logo.png`
- `client/src/assets/images/signup-illustration.png`

**Files Modified:**
- `client/src/App.jsx`
- `client/src/index.css`
- `client/index.html`
- `docs/Phase/Phase_1/TASKDONE.md`

**Files Deleted:**
- `desktop_signup.html` (temporary scratch file)

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- `npm run build` succeeded with 0 errors, 0 warnings
- All 28 modules transformed successfully
- Desktop & mobile responsive layout validated against Stitch design

**Status:**
🟢 Completed

**Notes / Blockers:**
- External image downloads (Google assets, Stitch CDN) failed due to network restrictions; replaced with generated local assets and inline SVG for Google icon.
- Show/hide password toggle implemented with React state.
- Client-side form validation, loading states, and API integration are pending (Phase 1 backend tasks).

---

## Date: 03 September 2026
### Team Member: Anshul Gusain
**Time:** 08:30 AM

**Task Worked On:**
Phase 1 — Sign In Page, Forgot Password Page, Reset Password Page, and Authentication Pop-Up Modals

**Changes Made:**
- Created `client/src/pages/Auth/Login.jsx` and `Login.module.css` matching Stitch `Login - Desktop` & `Login - Mobile` designs with ReviseAI Book Logo (`book-logo.png`), email/password inputs with show/hide password toggle, and right-side desktop streak illustration card.
- Created `client/src/pages/Auth/ForgotPassword.jsx` and `ForgotPassword.module.css` matching Stitch `Forgot Password` designs with `lock_reset` badge icon and email input with mail icon.
- Created `client/src/pages/Auth/ResetPassword.jsx` and `ResetPassword.module.css` matching Stitch `Reset Password` designs with dynamic password strength meter & validation checklist.
- Created `client/src/components/Popups/LoginSuccessModal.jsx` & `LoginSuccessModal.module.css` featuring ReviseAI Book Logo and green checkmark icon (`#34C759`).
- Created `client/src/components/Popups/LoginFailureModal.jsx` & `LoginFailureModal.module.css` matching Stitch `Login Failed - Desktop` with red error icon (`#ba1a1a`) and direct **"Create an Account"** redirect button.
- Created `client/src/components/Popups/AccountSuccessModal.jsx` & `AccountSuccessModal.module.css` for successful account creation feedback.
- Created `client/src/components/Popups/AccountFailureModal.jsx` & `AccountFailureModal.module.css` for account creation failure feedback.
- Created `client/src/components/Popups/ResetSuccessModal.jsx` & `ResetSuccessModal.module.css` for password reset success feedback.
- Created `client/src/components/Popups/ResetFailureModal.jsx` & `ResetFailureModal.module.css` for password reset failure feedback.
- Updated `client/src/pages/Auth/Signup.jsx` to persist registered user accounts in `localStorage` (`registeredUsers`) and connect success/failure modals.
- Integrated account lookup logic in `Login.jsx` against registered accounts & demo accounts (`student@university.edu` / `password123`); failed logins prompt users to create an account and redirect to `/signup`.
- Updated `client/src/App.jsx` to register `/login`, `/forgot-password`, and `/reset-password` routes.
- Removed all temporary test buttons across form cards.

**Files Created:**
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Login.module.css`
- `client/src/pages/Auth/ForgotPassword.jsx`
- `client/src/pages/Auth/ForgotPassword.module.css`
- `client/src/pages/Auth/ResetPassword.jsx`
- `client/src/pages/Auth/ResetPassword.module.css`
- `client/src/components/Popups/LoginSuccessModal.jsx`
- `client/src/components/Popups/LoginSuccessModal.module.css`
- `client/src/components/Popups/LoginFailureModal.jsx`
- `client/src/components/Popups/LoginFailureModal.module.css`
- `client/src/components/Popups/AccountSuccessModal.jsx`
- `client/src/components/Popups/AccountSuccessModal.module.css`
- `client/src/components/Popups/AccountFailureModal.jsx`
- `client/src/components/Popups/AccountFailureModal.module.css`
- `client/src/components/Popups/ResetSuccessModal.jsx`
- `client/src/components/Popups/ResetSuccessModal.module.css`
- `client/src/components/Popups/ResetFailureModal.jsx`
- `client/src/components/Popups/ResetFailureModal.module.css`

**Files Modified:**
- `client/src/App.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Files Deleted:**
- None

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- Executed `npm run build` -> 46 modules transformed in 221ms with 0 errors.
- Verified account check & signup persistence via `localStorage`.
- Verified successful login popup & redirection.
- Verified failed login popup & "Create an Account" redirect to `/signup`.
- Verified password reset modals and strength meter functionality.
- Verified ReviseAI Book Logo rendering across all screens.

**Status:**
🟢 Completed

**Notes / Blockers:**
- All auth UI pages, modals, and flow redirections are fully functional on the frontend.
- Backend API integration and backend OTP sending remain for upcoming phase tasks.

---

## Next Steps

- Implement backend API routes for authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/otp`).
- Integrate MongoDB user database schema with hashed passwords.
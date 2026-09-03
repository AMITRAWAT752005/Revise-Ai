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

## Date: 03 September 2026
### Team Member: Anukool Negi
**Time:** 10:45 AM

**Task Worked On:**
Phase 1 — Mail Verification Page (Mobile/Responsive), OTP Verification Success Pop UP, and OTP Verification Failure Pop UP

**Changes Made:**
- Created `client/src/pages/Auth/OTPVerification.jsx` and `OTPVerification.module.css` matching Stitch design `OTP Verification - Mobile` (`Project ID: 8356759800152041564`) with ReviseAI Book Logo (`book-logo.png`), 6-box OTP input with auto-advance, backspace navigation, arrow key navigation, paste support, resend cooldown timer, and toast notifications.
- Created `client/src/components/Popups/OtpSuccessModal.jsx` and `OtpSuccessModal.module.css` matching Stitch design `OTP Verification Success - Mobile` featuring ReviseAI Book Logo, green checkmark badge (`#34C759`), and "Continue to Dashboard" redirect action.
- Created `client/src/components/Popups/OtpFailureModal.jsx` and `OtpFailureModal.module.css` matching Stitch design `OTP Verification Failed - Mobile` featuring ReviseAI Book Logo, red error badge (`#ba1a1a`), "Try Again" action button, and "Resend Code" link.
- Updated `client/src/App.jsx` to register `/verify-otp` and `/otp-verification` routes.

**Files Created:**
- `client/src/pages/Auth/OTPVerification.jsx`
- `client/src/pages/Auth/OTPVerification.module.css`
- `client/src/components/Popups/OtpSuccessModal.jsx`
- `client/src/components/Popups/OtpSuccessModal.module.css`
- `client/src/components/Popups/OtpFailureModal.jsx`
- `client/src/components/Popups/OtpFailureModal.module.css`

**Files Modified:**
- `client/src/App.jsx`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Files Protected:**
- `client/src/assets/images/book-logo.png`

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- Executed `npm run build` -> 52 modules transformed with 0 compilation errors or warnings.
- Tested 6-digit OTP input auto-advance, backspace focus movement, and paste handling.
- Tested OTP verification triggering `OtpSuccessModal` on valid codes and `OtpFailureModal` on invalid test codes.
- Verified resend timer cooldown and toast notifications.

**Status:**
🟢 Completed

---

## Date: 03 September 2026
### Team Member: Bikram Singh Bisht
**Time:** 11:20 AM – 11:31 AM

**Task Worked On:**
Phase 1 — OTP Flow Integration, Forgot Password Fix & Signup/Reset Password Validation Improvements

**Changes Made:**

**1. Fix Registration Flow — Redirect to OTP after Sign Up**
- Updated `client/src/pages/Auth/Signup.jsx` to redirect to `/verify-otp` (with email & context via route state) instead of showing `AccountSuccessModal`. New users are saved with `isVerified: false` and `pendingVerificationEmail` stored in `localStorage` as fallback.
- Updated `client/src/pages/Auth/OTPVerification.jsx` to read `email` and `context` from route state. Displays the user's email in the subtitle. On successful OTP, marks `isVerified: true` in `localStorage` and clears `pendingVerificationEmail`.
- Updated `client/src/components/Popups/OtpSuccessModal.jsx`: changed button label from "Continue to Dashboard" to "Continue to Login". Added optional `description` and `btnLabel` props for context-specific messages.

**2. Fix Forgot Password Flow — Redirect to OTP before Reset Password**
- Updated `client/src/pages/Auth/ForgotPassword.jsx` to redirect to `/verify-otp` with `context: 'password-reset'` instead of going directly to `/reset-password`.
- Updated `client/src/pages/Auth/OTPVerification.jsx` so that `context === 'password-reset'` navigates to `/reset-password` on success, while `registration` navigates to `/login`.
- `OtpSuccessModal` now shows context-specific text:
  - Registration: *"Your email has been verified…"* / "Continue to Login"
  - Password Reset: *"Your identity has been verified…"* / "Continue to Reset Password"

**3. Fix Reset Password Validation — Inline errors instead of popup**
- Removed `ResetFailureModal` trigger for password validation failures in `ResetPassword.jsx`. Validation errors now show inline below the affected field with red border + shake animation.
- Added `fieldErrors` and `shakeFields` state; errors auto-clear on re-type.
- Added `@keyframes shake`, `.shake`, `.inputError`, `.fieldError` to `ResetPassword.module.css`.

**4. Signup — Specific Error Messages per Failure**
- Updated `AccountFailureModal.jsx` to accept optional `title` and `message` props (with generic fallback).
- Updated `Signup.jsx` to pass specific error info to `AccountFailureModal` per scenario:
  - Missing fields → "Missing Information"
  - Passwords don't match → "Passwords Don't Match"
  - Duplicate email → "Email Already Registered" (shows the specific email)

**Files Modified:**
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Auth/OTPVerification.jsx`
- `client/src/pages/Auth/ForgotPassword.jsx`
- `client/src/pages/Auth/ResetPassword.jsx`
- `client/src/pages/Auth/ResetPassword.module.css`
- `client/src/components/Popups/OtpSuccessModal.jsx`
- `client/src/components/Popups/AccountFailureModal.jsx`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- Verified `/signup` navigates to `/verify-otp` with email displayed on successful registration.
- Verified OTP page shows `OtpSuccessModal` and "Continue to Login" redirects to `/login` (registration context).
- Verified `registeredUsers` in `localStorage` has `isVerified: true` after successful OTP.
- Verified `000000` / `111111` OTP codes still trigger `OtpFailureModal`.
- Verified Forgot Password → submit email → redirects to `/verify-otp` with email displayed.
- Verified password-reset OTP success shows "Continue to Reset Password" and navigates to `/reset-password`.
- Verified Reset Password: empty/weak/mismatched fields shake with inline error text; no modal appears.
- Verified inline errors clear on re-type; success modal still appears on valid submission.
- Verified Signup shows "Missing Information", "Passwords Don't Match", and "Email Already Registered" modals correctly.

**Status:**
🟢 Completed

---

## Date: 03 September 2026
### Team Member: Bikram Singh Bisht
**Time:** 11:45 AM

**Task Worked On:**
Phase 1 — Post-Registration Commitment Flow

**Changes Made:**
- Updated `client/src/pages/Auth/OTPVerification.jsx` so that after a successful registration OTP verification, the user is prompted to "Continue to Commitment" and redirected to `/commitment`.
- Created a new `Commitment` page (`Commitment.jsx` and `Commitment.module.css`) to collect the user's learning goal and daily study target.
- Added a `commitmentPending` flag to `localStorage` and `hasCompletedCommitment` to the user schema to ensure only new users can access the Commitment page.
- Created a placeholder `Home` page (`Home.jsx`) and registered the new routes in `App.jsx`.
- Submitting the Commitment form successfully sets `hasCompletedCommitment: true`, clears `commitmentPending`, and navigates the user to `/home`.
- Updated `PROFILE.md` and `TASKDONE.md` with the new flow logic.

**Files Modified:**
- `client/src/pages/Auth/OTPVerification.jsx`
- `client/src/pages/Commitment/Commitment.jsx` (New)
- `client/src/pages/Commitment/Commitment.module.css` (New)
- `client/src/pages/Home/Home.jsx` (New)
- `client/src/App.jsx`
- `docs/Phase/Phase_1/PROFILE.md`
- `docs/Phase/Phase_1/TASKDONE.md`

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- Verified that successfully verifying a registration OTP updates the `OtpSuccessModal` text to "Continue to Commitment".
- Verified clicking "Continue to Commitment" routes to `/commitment`.
- Verified that the `Commitment` page rejects users who do not have `commitmentPending: 'true'` in localStorage (redirects to `/login`).
- Verified that submitting the Commitment form correctly updates user state, removes the pending flag, and navigates to `/home`.

**Status:**
🟢 Completed

---

## Date: 03 September 2026
### Team Member: Bikram Singh Bisht
**Time:** 11:58 AM

**Task Worked On:**
Phase 1 — Commitment Page UI Redesign (Stitch integration)

**Changes Made:**
- Redesigned `/commitment` to exactly match the Stitch design "Study Commitment Agreement (Final Interactive)" (Screen ID: 36e41ea420ee4ac390f679c03dfe4282).
- Transformed the standard form into an interactive "Madlib" style contract.
- Added floating animated SVGs, a paper texture background, and cursive digital signature styling (`Caveat` font).
- Replaced standard inputs with inline pill selects/inputs that auto-resize.
- Implemented button state changes simulating a fake submission delay before redirecting to `/home`.

**Files Modified:**
- `client/src/pages/Commitment/Commitment.jsx`
- `client/src/pages/Commitment/Commitment.module.css`

**Branch:**
`Phase_1`

**Commit Reference:**
*(pending)*

**Testing Performed:**
- Verified the UI matches the required Stitch design visually.
- Verified name input binds to the digital signature dynamically and auto-resizes.
- Verified form submission disables the button, changes text to "Committed! Let's go!", and redirects to `/home`.

**Status:**
🟢 Completed

---

## Next Steps

- Implement backend API routes for authentication (`/api/auth/register`, `/api/auth/login`, `/api/auth/otp`).
- Integrate MongoDB user database schema with hashed passwords.
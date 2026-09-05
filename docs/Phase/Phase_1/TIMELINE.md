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
_(pending)_

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
_(pending)_

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
_(pending)_

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
  - Registration: _"Your email has been verified…"_ / "Continue to Login"
  - Password Reset: _"Your identity has been verified…"_ / "Continue to Reset Password"

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
_(pending)_

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
_(pending)_

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
_(pending)_

**Testing Performed:**

- Verified the UI matches the required Stitch design visually.
- Verified name input binds to the digital signature dynamically and auto-resizes.
- Verified form submission disables the button, changes text to "Committed! Let's go!", and redirects to `/home`.

**Status:**
🟢 Completed

---

## Date: 03 September 2026

### Team Member: Amit Rawat

**Task Worked On:**
Phase 1 — MongoDB User Schema and Database Connection Setup

**Changes Made:**

- Added the Mongoose `User` model with the requested account, commitment, and timestamp fields.
- Added the MongoDB connection helper using `MONGO_URI`.
- Updated server startup to load the server `.env` file, connect to MongoDB, and start listening only after a successful connection.
- Updated the server package to use ES modules and added the Mongoose dependency.
- Added Added the Mongoose `otp ` model.

**Files Created:**

- `server/src/models/User.js`
- `server/src/config/db.js`
- `server/src/models/Otp.js`

**Files Modified:**

- `server/src/server.js`
- `server/src/app.js`
- `server/package.json`
- `server/package-lock.json`
- `server/.env.example`

**Testing Performed:**

- Verified all changed server modules pass syntax and workspace diagnostics checks.
- Verified the model exposes the requested fields and maps to the `users` collection.
- Verified the model exposes the requested fields and maps to the `otp` collection.

**Status:**
🟢 Completed

**Notes / Blockers:**

- Authentication API routes, password hashing flow, and OTP backend integration remain pending.

---

## Date: 04 September 2026

### Team Member: Bikram Singh Bisht

**Time:** 07:45 AM

**Task Worked On:**
Phase 1 — Backend OTP and Email Verification Implementation

**Changes Made:**

- Updated MongoDB `Otp.js` model to include `purpose` (ACCOUNT_VERIFICATION, PASSWORD_RESET) and track `attempts`. Updated unique index to handle purpose separation.
- Installed `resend` package for email integration.
- Created `server/src/services/emailService.js` to send verification emails with the ReviseAI-styled HTML template using the Resend API.
- Created `server/src/services/otpService.js` with functions to `generateOtp`, `sendOtp` (handling resend cooldowns), and `verifyOtp` (handling expiration, maximum attempts, and rate limiting).
- Created `server/src/controllers/authController.js` to handle `/otp/send` and `/otp/verify` requests, including purpose-specific validations.
- Created `server/src/routes/authRoutes.js` and mounted them in `server/src/app.js` under `/api/auth`.

**Files Created:**

- `server/src/services/emailService.js`
- `server/src/services/otpService.js`
- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`

**Files Modified:**

- `server/src/models/Otp.js`
- `server/src/app.js`
- `server/package.json`
- `server/package-lock.json`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**

- Ran `node --check` syntax verification across all new and modified server files successfully.
- Verified correct installation of `resend` dependency.

**Status:**
🟢 Completed

**Notes / Blockers:**

- A valid `RESEND_API` key must be set in `.env` for actual emails to be dispatched. If missing, it will gracefully warn in the console and skip sending, but still return success for development purposes.

---

## Date: 04 September 2026

### Team Member: Anukool Negi

**Time:** 09:30 AM

**Task Worked On:**
Phase 1 — Backend Login, JWT Generation & Verification, Authentication Middleware, and Protected Routes

**Changes Made:**

- Installed `jsonwebtoken` and `bcryptjs` dependencies in `server`.
- Updated `server/.env.example` with `JWT_SECRET` and `JWT_EXPIRES_IN` configuration.
- Added `isVerified` boolean field to `server/src/models/User.js`.
- Created `server/src/utils/jwtUtils.js` for token generation (`generateToken`) and token verification (`verifyToken`).
- Created `server/src/middleware/authMiddleware.js` (`authenticateToken`) to validate `Bearer <token>` authorization headers and attach authenticated user objects to `req.user`.
- Updated `server/src/controllers/authController.js` to implement:
  - `registerController`: Hashes passwords with `bcryptjs` before persisting user documents.
  - `loginController`: Validates email/password credentials, verifies password hashes using `bcrypt.compare`, and returns signed JWT tokens.
  - `getProfileController`: Returns authenticated user profiles.
  - `logoutController`: Acknowledges logout requests.
- Updated `server/src/routes/authRoutes.js` to expose `/register`, `/login`, `/logout`, `/profile`, `/me`, and `/protected` endpoints.

**Files Created:**

- `server/src/utils/jwtUtils.js`
- `server/src/middleware/authMiddleware.js`

**Files Modified:**

- `server/package.json`
- `server/package-lock.json`
- `server/.env.example`
- `server/src/models/User.js`
- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**

- Ran `node --check` syntax verification across all server files (`app.js`, `server.js`, `User.js`, `jwtUtils.js`, `authMiddleware.js`, `authController.js`, `authRoutes.js`) — 0 syntax errors.
- Verified successful installation of `jsonwebtoken` and `bcryptjs` dependencies.
- Verified frontend build with `npm run build` in `client` — 51 modules transformed in 217ms with 0 errors.

**Status:**
🟢 Completed

**Notes / Blockers:**
None.

---

## Date: 04 September 2026

### Team Member: Anshul Gusain

**Time:** 10:20 AM

**Task Worked On:**
Phase 1 — Auth Core + Registration Backend Implementation

**Changes Made:**

- Created `server/src/utils/validationUtils.js` containing `validateName`, `validateEmail`, and `validatePassword` input validation helpers.
- Enforced password requirements matching SRS security specifications: minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.
- Enhanced `registerController` in `server/src/controllers/authController.js`:
  - Validates `name`, `email`, and `password` inputs.
  - Normalizes email formatting (trimmed, lowercase).
  - Checks if user email already exists using existing `User` model, returning HTTP 409 Conflict status.
  - Hashes passwords securely using `bcrypt.hash(password, 10)`.
  - Creates user in MongoDB using existing `User` model with initial state `isVerified: false`, `commitmentPending: true`, and `type: 'local'`.
  - Returns standard HTTP 201 response with sanitized user object (excluding password hash).
  - Handles validation errors (400), duplicate email errors (409), and internal server errors (500).

**Files Created:**

- `server/src/utils/validationUtils.js`

**Files Modified:**

- `server/src/controllers/authController.js`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**

- Executed unit tests for `validationUtils` and `bcrypt` password hashing — 100% tests passed.
- Verified frontend build with `npm run build` in `client` — 51 modules transformed with 0 errors.

**Status:**
🟢 Completed

**Notes / Blockers:**
None.

---

## Date: 04 September 2026

### Team Member: Bikram Singh Bisht

**Task Worked On:**
Phase 1 — Frontend and Backend Auth Integration

**Changes Made:**
- Updated `client/vite.config.js` with server proxy to route `/api` to backend.
- Refactored `client/src/pages/Auth/Signup.jsx` to replace `localStorage` with `fetch('/api/auth/register')`.
- Refactored `client/src/pages/Auth/OTPVerification.jsx` to use `/api/auth/otp/verify` and `/api/auth/otp/send`. JWT is saved to `localStorage` on verification.
- Refactored `client/src/pages/Auth/Login.jsx` to use `/api/auth/login` and save JWT token.
- Refactored `client/src/pages/Auth/ForgotPassword.jsx` to call `/api/auth/otp/send` directly.
- Implemented `/api/auth/reset-password` and `/api/auth/commitment` placeholder endpoints in backend.
- Updated `server/src/controllers/authController.js` to automatically call `sendOtp` upon successful user registration and modified `verifyOtpController` to issue a JWT.

**Testing Performed:**
- Evaluated frontend `npm run build` with 0 errors.

**Status:**
🟢 Completed

---

## Date: 04 September 2026

### Team Member: Bikram Singh Bisht

**Task Worked On:**
Phase 1 — Email Service Migration and Commitment DB Schema Fix

**Changes Made:**
- Migrated the email delivery system from Resend to the Brevo API in `server/src/services/emailService.js`.
- Removed the `resend` npm package and implemented a native `fetch` call to Brevo's REST API `/v3/smtp/email`.
- Resolved `.env` file corruption issues and properly added `BREVO_API_KEY`.
- Fixed the `User` schema in `server/src/models/User.js` to correctly map the commitment fields: added `studentType` (String), updated `commitTime` (String) to store time per day, and mapped flashcards to `cardCommits` (Number).
- Updated `updateCommitmentController` in `server/src/controllers/authController.js` to save the correct field mappings to MongoDB.
- Fixed a navigation bug in `client/src/pages/Auth/OTPVerification.jsx` by properly setting the `commitmentPending` flag in localStorage after verification, allowing access to the `/commitment` page.

**Testing Performed:**
- Verified OTP emails are successfully delivered via Brevo.
- Verified that completing the Commitment form correctly stores `studentType`, `commitTime`, `cardCommits`, and `hasCompletedCommitment` in the MongoDB User document.

**Status:**
🟢 Completed

---

## Date: 04 September 2026

### Team Member: Amit Rawat
Time: 4:03 pm
**Task Worked On:**
Phase 1 — Google Credential Authentication and Complete Forgot Password Flow

**Changes Made:**
- Added `/api/auth/google` to validate Google ID tokens, find or create users, link an existing email account, and return the standard JWT/user response.
- Connected the existing login and signup Google buttons to Google Identity Services.
- Completed password reset token verification, password hashing, and database persistence.
- Connected the forgot-password UI to OTP response handling and temporary reset-token storage.

**Files Created:**
- None

**Files Modified:**
- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Auth/ForgotPassword.jsx`
- `client/src/pages/Auth/OTPVerification.jsx`
- `client/src/pages/Auth/ResetPassword.jsx`
- `client/index.html`
- `client/.env.example`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Client production build passed with 51 modules and no errors.
- Backend syntax checks passed.
- Workspace diagnostics passed for all changed authentication files.

**Status:**
🟢 Completed

**Notes / Blockers:**
- Google sign-in requires `VITE_GOOGLE_CLIENT_ID` in the client environment.
- Live Google and email delivery testing requires configured external credentials/services.

---

## Date: 04 September 2026

### Team Member: Amit Rawat

**Task Worked On:**
Phase 1 — Secure OTP Storage

**Changes Made:**
- Replaced plain-text OTP storage with keyed HMAC-SHA-256 hashes in the OTP model and service.
- Compared submitted and stored hashes using a timing-safe comparison.
- Removed the raw OTP from the fallback email-service log.
- Preserved the existing five-minute TTL expiry, resend cooldown, attempt limit, and delete-after-verification behavior.

**Files Modified:**
- `server/src/models/Otp.js`
- `server/src/services/otpService.js`
- `server/src/services/emailService.js`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Syntax checks passed for all changed server files.
- Workspace diagnostics reported no errors.
- Confirmed raw OTP storage, comparison, and logging patterns were removed.

**Status:**
🟢 Completed

**Notes / Blockers:**
- Existing OTP records created before this change use the old field and must be requested again after deployment.

---

## Date: 04 September 2026

### Team Member: Bikram Singh Bisht

**Time:** 05:25 PM

**Task Worked On:**
Phase 1 — Google Sign-In Button Fix

**Changes Made:**
- Identified a silent failure bug where clicking the "Continue with Google" button did nothing due to the Google Identity Services `prompt()` (One Tap UI) being blocked by browser settings or cooldown periods.
- Refactored `client/src/pages/Auth/Login.jsx` and `client/src/pages/Auth/Signup.jsx` to use Google's official `renderButton` API instead of `.prompt()`.
- Replaced the custom Google buttons with a centered container (`div`) to host the official, reliable Google Sign-In iframe, ensuring the standard popup authentication flow triggers correctly upon user interaction.

**Files Modified:**
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Verified the official Google Sign-In button renders correctly and is centered on both the Login and Signup pages.

**Status:**
🟢 Completed

---

## Next Steps

- Verify full end-to-end auth flows (Google + Email).

---

## Date: 05 September 2026

### Team Member: Bikram Singh Bisht

**Time:** 07:24 AM

**Task Worked On:**
Phase 1 — Google Sign-In Commitment Redirect Fix

**Problem Identified:**
After a user signed up or logged in via Google, they were being redirected directly to `/home` instead of `/commitment`, even though `commitmentPending: true` was correctly set in the database. The cause was a two-part bug:

1. **`Commitment.jsx` gate:** The page guard was only checking for a standalone `commitmentPending` key in `localStorage` (set during the old email-registration flow), which was never being set during the Google auth flow. So the gate immediately redirected away from `/commitment`.
2. **`Login.jsx` Google handler:** After Google auth, the code triggered the `LoginSuccessModal`, which previously had a hardcoded `navigate('/')`. Even after the modal was updated to read from `localStorage`, it was still showing an unnecessary intermediate step.

**Changes Made:**
- **`client/src/pages/Commitment/Commitment.jsx`:** Updated the `useEffect` gate to also check `user.commitmentPending` inside the `localStorage['user']` JSON object, not just the standalone `commitmentPending` key.
- **`client/src/pages/Auth/Login.jsx`:** Imported `useNavigate`. For the Google auth response handler, replaced `setModalState('success')` with a direct `navigate()` call that checks `data.user.commitmentPending`. Also now correctly sets the standalone `commitmentPending` key in `localStorage`.
- **`client/src/pages/Auth/Signup.jsx`:** The Google auth response handler now also correctly sets the standalone `commitmentPending` key in `localStorage` before navigating.

**Files Modified:**
- `client/src/pages/Commitment/Commitment.jsx`
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Verified Google login correctly redirects a new user (`commitmentPending: true`) to `/commitment`.
- Verified Google login correctly redirects a returning user (`commitmentPending: false`) to `/home`.
- Verified `Commitment.jsx` page guard allows access when `commitmentPending` is true (either via standalone key or `user` object).

**Status:**
🟢 Completed

---

## Date: 05 September 2026

### Team Member: Anshul Gusain

**Time:** 10:15 AM

**Task Worked On:**
Phase 1.1 — TASK 2: Login Throttling + OTP Rate Limiting (Abuse Protection)

**Changes Made:**
- Implemented native in-memory sliding window rate limiting and abuse protection in `server/src/middleware/rateLimiter.js` with zero external dependencies.
- Added **Login Throttling (`loginIpLimiter` & `isAccountLoginThrottled`)**:
  - IP-based rate limiting on `/login` (30 requests per IP per 15-minute window).
  - Account-level failed attempt protection (maximum 5 consecutive failed login attempts per normalized email within a 15-minute window; returns HTTP 429 with `Retry-After` header).
  - Automatic failure counter reset upon successful authentication.
- Added **OTP Sending Rate Limiter (`otpSendLimiter`)**:
  - Email-level rate limiting on `/otp/send` and `/register` (maximum 5 OTP requests per email per hour).
  - IP-level rate limiting (maximum 20 OTP requests per IP per 15-minute window).
  - Preserved the existing 30-second per-record resend cooldown in `otpService.js`.
- Added **OTP Verification Attempt Protection (`otpVerifyLimiter`)**:
  - Rate limiting on `/otp/verify` (maximum 15 verification attempts per IP/email per 15-minute window).
  - Preserved all existing cryptographic protections: 6-digit OTP, HMAC-SHA-256 hashing, timing-safe comparison (`crypto.timingSafeEqual`), 5-minute TTL expiry, and single-use deletion.
- Updated `server/src/controllers/authController.js` to check account-level login throttling, record failed login attempts, and clear counters on successful login.
- Updated `server/src/routes/authRoutes.js` to mount rate limiting middleware on `/login`, `/otp/send`, `/otp/verify`, and `/register`.
- Updated `server/.env.example` to document rate limiting configuration variables (`RATE_LIMIT_ENABLED`, `LOGIN_ACCOUNT_MAX_FAILS`, `LOGIN_IP_MAX`, `OTP_SEND_EMAIL_MAX`, `OTP_SEND_IP_MAX`, `OTP_VERIFY_MAX`).

**Files Created:**
- `server/src/middleware/rateLimiter.js`

**Files Modified:**
- `server/src/controllers/authController.js`
- `server/src/routes/authRoutes.js`
- `server/.env.example`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Executed unit & integration test suite (`test_rate_limiter.js`) covering:
  - Account login throttling (locked after 5 failed attempts; reset on successful login).
  - Login IP rate limiting (blocks on 31st request with 429 and `Retry-After` header).
  - OTP send rate limiting (blocks 6th request with same email within 1 hour).
  - OTP verification rate limiting (blocks 16th verification attempt with 429).
- Verified `node --check` syntax on all backend files with 0 errors.
- Verified frontend build with `npm run build` on `client` (51 modules transformed in 597ms with 0 errors).

**Status:**
🟢 Completed

**Notes / Blockers:**
None.

---

## Date: 05 September 2026

### Team Member: Anshul Gusain

**Time:** 11:50 AM

**Task Worked On:**
Phase 1.1 — Password Reset Protection, OTP Cooldown Verification & Committed Test Suite

**Changes Made:**
- **Password Reset Rate Limiting (`passwordResetLimiter`)**:
  - Added dedicated sliding window rate limiter for `POST /reset-password` in `server/src/middleware/rateLimiter.js` (default 10 requests per IP per 15-minute window; configurable via `PASSWORD_RESET_MAX` and `PASSWORD_RESET_WINDOW_MS`).
  - Mounted `passwordResetLimiter` on `/reset-password` in `server/src/routes/authRoutes.js` to protect against brute-forcing password reset tokens.
  - Documented `PASSWORD_RESET_MAX` and `PASSWORD_RESET_WINDOW_MS` in `server/.env.example`.
- **Committed Automated Test Suite**:
  - Created and committed `server/tests/auth_security.test.js` into the repository.
  - Updated `server/package.json` to configure `"test": "node tests/auth_security.test.js"`.
- **OTP Resend Cooldown & Rate Limiter Verification**:
  - Added automated unit and integration tests confirming that the existing 30-second DB-level cooldown in `otpService.js` and the sliding window email rate limiter (5 requests / hour) on `/otp/send` function harmoniously without conflict.

**Files Created:**
- `server/tests/auth_security.test.js`

**Files Modified:**
- `server/src/middleware/rateLimiter.js`
- `server/src/routes/authRoutes.js`
- `server/.env.example`
- `server/package.json`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Executed `npm test` on `server` (14/14 automated security & rate limiting tests passed with 0 errors).
- Executed `npm run build` on `client` (51 modules transformed in 498ms with 0 errors).

**Status:**
🟢 Completed

**Notes / Blockers:**
None.

## Date: 05 September 2026

### Team Member: Amit Rawat

**Task Worked On:**
Phase 1.1 — TASK 1: JWT Migration to HttpOnly Cookie Authentication

**Changes Made:**
- Added separate HttpOnly cookies for normal authentication and temporary password-reset authorization.
- Issued the normal authentication cookie after registration OTP verification, email login, and Google authentication.
- Updated `authenticateToken` to read the HttpOnly authentication cookie while retaining temporary Bearer compatibility during migration.
- Updated logout to clear authentication cookies and password reset completion to clear only its temporary cookie.
- Configured credentialed CORS with an explicit `CLIENT_ORIGIN` and environment-controlled cookie settings.
- Added frontend credentialed requests and backend-backed protected route checks through `/api/auth/me`.
- Removed frontend storage and use of normal JWTs in `localStorage` and removed frontend Bearer headers.

**Files Created:**
- `server/src/utils/authCookie.js`
- `client/src/components/ProtectedRoute.jsx`

**Files Modified:**
- `server/src/app.js`
- `server/src/controllers/authController.js`
- `server/src/middleware/authMiddleware.js`
- `server/.env.example`
- `client/src/App.jsx`
- `client/src/components/Popups/LoginSuccessModal.jsx`
- `client/src/pages/Auth/Login.jsx`
- `client/src/pages/Auth/Signup.jsx`
- `client/src/pages/Auth/ForgotPassword.jsx`
- `client/src/pages/Auth/OTPVerification.jsx`
- `client/src/pages/Auth/ResetPassword.jsx`
- `client/src/pages/Commitment/Commitment.jsx`
- `docs/Phase/Phase_1/TASKDONE.md`
- `docs/Phase/Phase_1/TIMELINE.md`

**Testing Performed:**
- Server security suite passed: 14/14 tests.
- Client production build passed: 52 modules, 0 errors.
- Client lint completed with existing warnings only.
- Backend syntax checks and workspace diagnostics passed.
- Cookie utility checks passed for HttpOnly flags, parsing, and clearing.
- Confirmed no frontend `authToken`, `tempResetToken`, or Bearer usage remains.

**Status:**
🟢 Completed

**Notes / Blockers:**
- Production deployments on different sites must use HTTPS with `AUTH_COOKIE_SAME_SITE=none` and an explicit `CLIENT_ORIGIN`.
- Bearer support remains temporarily for migration rollback compatibility and should be removed only after end-to-end cookie verification.


---

## Date: 05 September 2026

### Team Member: Amit Rawat

**Task Worked On:**
Phase 1.1 — TASK 1 Final Cookie-Only Authentication Hardening

**Changes Made:**
- Removed the temporary Bearer-token fallback from protected authentication middleware.
- Removed Bearer-token fallback from password reset authorization.
- Removed JWT `token` fields from login, Google login, and OTP verification responses.
- Kept JWTs available only through HttpOnly cookies.

**Testing Performed:**
- Verified login response does not contain a `token` field.
- Verified cookie includes `HttpOnly` and `SameSite=Lax`.
- Verified cookie-authenticated `/api/auth/me` returns `200`.
- Verified Bearer-only `/api/auth/me` returns `401`.
- Verified logout clears the cookie and `/api/auth/me` returns `401` afterward.
- Server tests passed: 14/14.
- Client build passed successfully.
- Temporary MongoDB test user was removed after testing.

**Status:**
🟢 Completed

**Notes / Blockers:**
- Google live browser testing requires the configured Google Client ID to allow the local frontend origin.
- Brevo live delivery requires a real verified recipient address; no synthetic email was sent.

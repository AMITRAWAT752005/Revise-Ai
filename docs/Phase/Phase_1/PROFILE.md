# ReviseAI — Phase 1: Authentication

## 🎯 Phase Objective

By the end of Phase 1, a new or existing user should be able to securely access ReviseAI through:

- Email + Password registration/login
- OTP verification
- Password reset
- Google Sign-In

---

# 1. Authentication UI Pages

All authentication pages should be implemented according to the approved Stitch designs.

## Required Pages

- [ ] Register / Sign Up
- [ ] OTP Verification
- [ ] Login / Sign In
- [ ] Forgot Password
- [ ] Change / Reset Password

## Authentication UI Requirements

- [ ] Correct Stitch design implementation
- [ ] Responsive layout
- [ ] Form validation
- [ ] Loading states
- [ ] Error states
- [ ] Success states
- [ ] Navigation between authentication pages
- [ ] Show/hide password functionality

---

# 2. User Registration

## Expected Flow

```text
Register
   ↓
Enter Name + Email + Password
   ↓
Validate Information
   ↓
Send OTP
   ↓
OTP Verification
   ↓
Account Successfully Verified
```

## Requirements

- [ ] User can enter registration details
- [ ] Validate required fields
- [ ] Validate email format
- [ ] Validate password requirements
- [ ] Confirm password validation
- [ ] Prevent duplicate accounts
- [ ] Generate/send OTP
- [ ] Show appropriate errors
- [ ] Account verification process works

---

# 3. OTP Verification

OTP should support authentication-related verification.

## Requirements

- [ ] OTP input interface
- [ ] OTP verification
- [ ] Invalid OTP handling
- [ ] Expired OTP handling
- [ ] Resend OTP
- [ ] Resend cooldown/timer
- [ ] Prevent reuse of OTP
- [ ] Successful verification confirmation

## OTP Should Support

```text
Registration Verification
        +
Password Reset Verification
```

---

# 4. Login

## Expected Flow

```text
Login
   ↓
Enter Email + Password
   ↓
Validate Credentials
   ↓
Authenticated
   ↓
Enter ReviseAI
```

## Requirements

- [ ] Email/password login
- [ ] Validate credentials
- [ ] Wrong password handling
- [ ] Unknown email handling
- [ ] Loading state
- [ ] Error messages
- [ ] Redirect after successful login
- [ ] Link to Forgot Password
- [ ] Link to Register

---

# 5. Google Sign-In

## Expected Flow

```text
Continue with Google
        ↓
Google Authentication
        ↓
User Verified
        ↓
Existing User? ── Yes → Login
       │
       No
       ↓
Create Account
       ↓
Enter ReviseAI
```

## Requirements

- [ ] Google Sign-In button
- [ ] Google OAuth integration
- [ ] New Google user account creation
- [ ] Existing Google user login
- [ ] Error/cancel handling
- [ ] Successful redirect into the application

---

# 6. Forgot Password

## Expected Flow

```text
Forgot Password
       ↓
Enter Email
       ↓
Verify Email
       ↓
Send Reset OTP
       ↓
OTP Verification
```

## Requirements

- [ ] User enters registered email
- [ ] Validate email
- [ ] Handle unregistered email
- [ ] Generate/send reset OTP
- [ ] Redirect to OTP verification

---

# 7. Change / Reset Password

## Expected Flow

```text
Verified OTP
      ↓
Enter New Password
      ↓
Confirm Password
      ↓
Password Changed
      ↓
Redirect to Login
```

## Requirements

- [ ] New password input
- [ ] Confirm password
- [ ] Password validation
- [ ] Password update
- [ ] Success message
- [ ] Redirect to login

---

# 8. Authentication State & Session Management

The application needs to remember whether a user is logged in.

## Requirements

- [ ] Authentication state management
- [ ] Keep user logged in appropriately
- [ ] Logout functionality
- [ ] Session/token handling
- [ ] Protected routes
- [ ] Unauthorized user handling

## Example

```text
User not logged in
        ↓
Tries to access Dashboard
        ↓
Redirect to Login
```

---

# 9. User Data & Database

Phase 1 should establish the basic user system.

## Expected User Information

```text
User
├── Unique ID
├── Name
├── Email
├── Password / Authentication Provider
├── Verification Status
├── Commitment Status (hasCompletedCommitment)
├── Account Creation Date
└── Last Updated Date
```

## Requirements

- [ ] User storage
- [ ] Unique email handling
- [ ] Secure password storage
- [ ] Account verification status
- [ ] Google authentication support

---

# 10. Security & Validation

## Minimum Requirements

- [ ] Passwords must never be stored as plain text
- [ ] Password hashing
- [ ] Server-side validation
- [ ] Client-side validation
- [ ] OTP expiration
- [ ] OTP cannot be reused
- [ ] Sensitive credentials stored in environment variables
- [ ] Protected API/routes
- [ ] Proper error handling

---

# 11. Complete Flow Integration

By the end of Phase 1, these flows must work completely.

## Flow A — New User

```text
Register
→ OTP
→ Verify Account
→ Commitment Page
→ Enter ReviseAI (Home)
```

## Flow B — Existing User

```text
Login
→ Enter ReviseAI
```

## Flow C — Google User

```text
Google Sign-In
→ Authentication
→ Enter ReviseAI
```

## Flow D — Forgot Password

```text
Forgot Password
→ Email
→ OTP
→ Verify
→ Change Password
→ Login with New Password
```

---

# 12. Testing & Phase Completion

Before Phase 1 is considered complete, all of the following must be checked.

## Functional Testing

- [ ] Registration works
- [ ] OTP works
- [ ] Login works
- [ ] Google Sign-In works
- [ ] Forgot Password works
- [ ] Change Password works
- [ ] Logout works
- [ ] Protected routes work

## Error Testing

- [ ] Duplicate email handling
- [ ] Invalid email handling
- [ ] Wrong password handling
- [ ] Invalid OTP handling
- [ ] Expired OTP handling
- [ ] Weak password handling
- [ ] Google authentication failure handling

## Technical Checks

- [ ] No console errors
- [ ] No broken routes
- [ ] Environment variables configured correctly
- [ ] Build succeeds
- [ ] Existing functionality is not broken

---

# ✅ Phase 1 Definition of Done

Phase 1 is considered complete when:

> A new user can create an account, verify it using OTP, log in, reset their password if needed, or use Google Sign-In—and authenticated users can securely access the ReviseAI application.

Before merging the Phase 1 branch into `main`:

- [ ] All Phase 1 requirements are completed
- [ ] All required user flows are tested
- [ ] Error scenarios are tested
- [ ] Previous functionality is not broken
- [ ] `TASKDONE.md` is updated
- [ ] `TIMELINE.md` is updated
- [ ] `REVIEW.md` is completed
- [ ] Phase is approved for merge
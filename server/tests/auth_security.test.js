/**
 * Automated Security & Rate Limiting Test Suite for ReviseAI Authentication
 * Tests:
 * 1. Login IP Rate Limiting (IP Throttling)
 * 2. Account-Level Login Throttling (Consecutive Failed Attempt Protection)
 * 3. OTP Send Rate Limiting (Email Hourly Limit + Network IP Limit)
 * 4. OTP Verification Rate Limiting & Brute-force Attempt Protection
 * 5. Password Reset Rate Limiting (/reset-password protection)
 * 6. OTP Resend Cooldown (30-second DB-level cooldown) & Rate Limiter Coexistence
 * 7. Rate Limiter Dev Bypass Toggle (RATE_LIMIT_ENABLED=false)
 */

import assert from 'assert';
import {
  loginIpLimiter,
  isAccountLoginThrottled,
  recordFailedLogin,
  resetFailedLogin,
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
  resetAllRateLimitStores,
} from '../src/middleware/rateLimiter.js';
import { sendOtp, verifyOtp } from '../src/services/otpService.js';
import Otp from '../src/models/Otp.js';

// Mock helper to create express req / res / next objects
const createMockReqRes = ({ ip = '127.0.0.1', body = {}, headers = {} } = {}) => {
  const req = {
    ip,
    connection: { remoteAddress: ip },
    body,
    headers,
  };
  const res = {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  return { req, res, next, wasNextCalled: () => nextCalled };
};

let passed = 0;
let failed = 0;

const runTest = async (testName, fn) => {
  try {
    resetAllRateLimitStores();
    await fn();
    console.log(`  ✓ ${testName}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${testName}`);
    console.error(`    Error: ${err.message}`);
    failed++;
  }
};

console.log('\n======================================================');
console.log('  ReviseAI Auth Security & Rate Limiting Test Suite');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. Account-Level Login Throttling
// -----------------------------------------------------------------------------
console.log('--- Suite 1: Account-Level Login Throttling ---');

await runTest('Allows login attempts below failure threshold (5)', () => {
  const email = 'user@example.com';
  for (let i = 0; i < 4; i++) {
    recordFailedLogin(email);
    const check = isAccountLoginThrottled(email);
    assert.strictEqual(check.throttled, false, `Attempt ${i + 1} should not be throttled`);
  }
});

await runTest('Throttles account after 5 failed login attempts', () => {
  const email = 'victim@example.com';
  for (let i = 0; i < 5; i++) {
    recordFailedLogin(email);
  }
  const check = isAccountLoginThrottled(email);
  assert.strictEqual(check.throttled, true, 'Account should be throttled on 5th failed attempt');
  assert.ok(check.retryAfterSeconds > 0, 'Retry-After duration should be greater than 0');
});

await runTest('Resets failed login counter on successful login', () => {
  const email = 'reset_user@example.com';
  for (let i = 0; i < 5; i++) {
    recordFailedLogin(email);
  }
  assert.strictEqual(isAccountLoginThrottled(email).throttled, true);

  // Simulate successful login
  resetFailedLogin(email);
  assert.strictEqual(isAccountLoginThrottled(email).throttled, false, 'Counter should reset');
});

// -----------------------------------------------------------------------------
// 2. Login IP Rate Limiter
// -----------------------------------------------------------------------------
console.log('\n--- Suite 2: Login IP Rate Limiter ---');

await runTest('Allows requests up to LOGIN_IP_MAX (30)', () => {
  const ip = '192.168.1.50';
  for (let i = 0; i < 30; i++) {
    const { req, res, next, wasNextCalled } = createMockReqRes({ ip });
    loginIpLimiter(req, res, next);
    assert.strictEqual(wasNextCalled(), true, `Request ${i + 1} should pass`);
    assert.strictEqual(res.statusCode, 200);
  }
});

await runTest('Blocks 31st login request from same IP with 429 and Retry-After header', () => {
  const ip = '192.168.1.51';
  for (let i = 0; i < 30; i++) {
    const { req, res, next } = createMockReqRes({ ip });
    loginIpLimiter(req, res, next);
  }

  const { req, res, next, wasNextCalled } = createMockReqRes({ ip });
  loginIpLimiter(req, res, next);
  assert.strictEqual(wasNextCalled(), false, '31st request should be blocked');
  assert.strictEqual(res.statusCode, 429, 'Status code should be 429');
  assert.ok(res.headers['retry-after'], 'Retry-After header must be set');
  assert.ok(res.body?.error?.includes('Too many login requests'));
});

// -----------------------------------------------------------------------------
// 3. OTP Send Rate Limiting (Email & IP)
// -----------------------------------------------------------------------------
console.log('\n--- Suite 3: OTP Send Rate Limiter ---');

await runTest('Allows up to OTP_SEND_EMAIL_MAX (5) OTP sends per email per hour', () => {
  const email = 'student@example.com';
  for (let i = 0; i < 5; i++) {
    const { req, res, next, wasNextCalled } = createMockReqRes({ ip: `10.0.0.${i}`, body: { email } });
    otpSendLimiter(req, res, next);
    assert.strictEqual(wasNextCalled(), true, `OTP Send ${i + 1} should pass`);
  }
});

await runTest('Blocks 6th OTP send request for the same email with 429', () => {
  const email = 'spammer@example.com';
  for (let i = 0; i < 5; i++) {
    const { req, res, next } = createMockReqRes({ ip: `10.0.0.${i}`, body: { email } });
    otpSendLimiter(req, res, next);
  }

  const { req, res, next, wasNextCalled } = createMockReqRes({ ip: '10.0.0.99', body: { email } });
  otpSendLimiter(req, res, next);
  assert.strictEqual(wasNextCalled(), false, '6th OTP request should be blocked');
  assert.strictEqual(res.statusCode, 429);
  assert.ok(res.body?.error?.includes('Too many verification code requests'));
});

await runTest('Blocks IP after OTP_SEND_IP_MAX (20) sends across emails', () => {
  const sharedIp = '172.16.0.1';
  for (let i = 0; i < 20; i++) {
    const { req, res, next, wasNextCalled } = createMockReqRes({
      ip: sharedIp,
      body: { email: `user${i}@example.com` },
    });
    otpSendLimiter(req, res, next);
    assert.strictEqual(wasNextCalled(), true);
  }

  const { req, res, next, wasNextCalled } = createMockReqRes({
    ip: sharedIp,
    body: { email: 'user21@example.com' },
  });
  otpSendLimiter(req, res, next);
  assert.strictEqual(wasNextCalled(), false);
  assert.strictEqual(res.statusCode, 429);
  assert.ok(res.body?.error?.includes('Too many OTP requests from your network'));
});

// -----------------------------------------------------------------------------
// 4. OTP Verification Attempt Rate Limiter
// -----------------------------------------------------------------------------
console.log('\n--- Suite 4: OTP Verification Rate Limiter ---');

await runTest('Allows up to OTP_VERIFY_MAX (15) verification attempts', () => {
  const email = 'verify@example.com';
  const ip = '192.168.2.1';
  for (let i = 0; i < 15; i++) {
    const { req, res, next, wasNextCalled } = createMockReqRes({ ip, body: { email, otp: '123456' } });
    otpVerifyLimiter(req, res, next);
    assert.strictEqual(wasNextCalled(), true, `Attempt ${i + 1} should pass`);
  }
});

await runTest('Blocks 16th verification attempt with 429 and Retry-After', () => {
  const email = 'verify@example.com';
  const ip = '192.168.2.1';
  for (let i = 0; i < 15; i++) {
    const { req, res, next } = createMockReqRes({ ip, body: { email, otp: '123456' } });
    otpVerifyLimiter(req, res, next);
  }

  const { req, res, next, wasNextCalled } = createMockReqRes({ ip, body: { email, otp: '123456' } });
  otpVerifyLimiter(req, res, next);
  assert.strictEqual(wasNextCalled(), false);
  assert.strictEqual(res.statusCode, 429);
  assert.ok(res.headers['retry-after']);
  assert.ok(res.body?.error?.includes('Too many verification attempts'));
});

// -----------------------------------------------------------------------------
// 5. Password Reset Endpoint Rate Limiting
// -----------------------------------------------------------------------------
console.log('\n--- Suite 5: Password Reset Rate Limiter ---');

await runTest('Allows password reset attempts up to PASSWORD_RESET_MAX (10)', () => {
  const ip = '192.168.3.1';
  for (let i = 0; i < 10; i++) {
    const { req, res, next, wasNextCalled } = createMockReqRes({ ip, body: { newPassword: 'NewPassword123!' } });
    passwordResetLimiter(req, res, next);
    assert.strictEqual(wasNextCalled(), true, `Reset attempt ${i + 1} should pass`);
  }
});

await runTest('Blocks 11th password reset attempt with 429 and Retry-After', () => {
  const ip = '192.168.3.2';
  for (let i = 0; i < 10; i++) {
    const { req, res, next } = createMockReqRes({ ip, body: { newPassword: 'NewPassword123!' } });
    passwordResetLimiter(req, res, next);
  }

  const { req, res, next, wasNextCalled } = createMockReqRes({ ip, body: { newPassword: 'NewPassword123!' } });
  passwordResetLimiter(req, res, next);
  assert.strictEqual(wasNextCalled(), false, '11th attempt should be blocked');
  assert.strictEqual(res.statusCode, 429);
  assert.ok(res.headers['retry-after']);
  assert.ok(res.body?.error?.includes('Too many password reset attempts'));
});

// -----------------------------------------------------------------------------
// 6. DB-Level 30-Second Cooldown & Rate Limiter Coexistence
// -----------------------------------------------------------------------------
console.log('\n--- Suite 6: DB-Level 30s Cooldown & Rate Limiter Coexistence ---');

await runTest('Enforces 30-second DB cooldown on immediate resend', async () => {
  // Mock Otp Model store for testing standalone DB cooldown logic
  const originalFindOne = Otp.findOne;
  const originalDeleteOne = Otp.deleteOne;
  const originalPrototypeSave = Otp.prototype.save;

  let storedOtp = null;

  Otp.findOne = async ({ email, purpose }) => {
    if (storedOtp && storedOtp.email === email && storedOtp.purpose === purpose) {
      return storedOtp;
    }
    return null;
  };

  Otp.deleteOne = async ({ _id }) => {
    if (storedOtp && storedOtp._id === _id) {
      storedOtp = null;
    }
    return { deletedCount: 1 };
  };

  Otp.prototype.save = async function () {
    storedOtp = this;
    return this;
  };

  try {
    const email = 'cooldown_test@example.com';
    const purpose = 'ACCOUNT_VERIFICATION';

    // 1st Send - should succeed
    const firstResult = await sendOtp(email, purpose);
    assert.strictEqual(firstResult.success, true);
    assert.ok(storedOtp, 'OTP record should be saved in DB');

    // Immediate 2nd Send (< 30s) - should be blocked by 30s cooldown
    let cooldownError = null;
    try {
      await sendOtp(email, purpose);
    } catch (err) {
      cooldownError = err;
    }
    assert.ok(cooldownError, 'Immediate resend should throw cooldown error');
    assert.ok(
      cooldownError.message.includes('Please wait') && cooldownError.message.includes('seconds before requesting a new OTP'),
      `Expected cooldown error message, got: ${cooldownError?.message}`
    );

    // Simulate 31 seconds passing
    storedOtp.lastSentAt = new Date(Date.now() - 31 * 1000);

    // Resend after 31s - should succeed
    const resendResult = await sendOtp(email, purpose);
    assert.strictEqual(resendResult.success, true);
  } finally {
    Otp.findOne = originalFindOne;
    Otp.deleteOne = originalDeleteOne;
    Otp.prototype.save = originalPrototypeSave;
  }
});

await runTest('Combined Flow: 30s DB Cooldown + Email Hourly Limit (5/hr) work in harmony', async () => {
  const originalFindOne = Otp.findOne;
  const originalDeleteOne = Otp.deleteOne;
  const originalPrototypeSave = Otp.prototype.save;

  let storedOtp = null;

  Otp.findOne = async ({ email, purpose }) => {
    if (storedOtp && storedOtp.email === email && storedOtp.purpose === purpose) {
      return storedOtp;
    }
    return null;
  };

  Otp.deleteOne = async ({ _id }) => {
    if (storedOtp && storedOtp._id === _id) {
      storedOtp = null;
    }
    return { deletedCount: 1 };
  };

  Otp.prototype.save = async function () {
    storedOtp = this;
    return this;
  };

  try {
    const email = 'harmony_test@example.com';
    const purpose = 'PASSWORD_RESET';
    const ip = '192.168.4.10';

    // Helper to simulate request through rate limiter + otpService
    const attemptSend = async () => {
      const { req, res, next, wasNextCalled } = createMockReqRes({ ip, body: { email, purpose } });
      otpSendLimiter(req, res, next);
      if (!wasNextCalled()) {
        return { rateLimited: true, statusCode: res.statusCode, body: res.body };
      }
      try {
        const result = await sendOtp(email, purpose);
        return { success: true, result };
      } catch (err) {
        return { cooldownBlocked: true, error: err.message };
      }
    };

    // Request 1: Passes rate limiter, passes DB check
    const req1 = await attemptSend();
    assert.strictEqual(req1.success, true, 'Request 1 should succeed');

    // Request 2 (Immediate): Passes rate limiter (count=2), but caught by 30s DB cooldown
    const req2 = await attemptSend();
    assert.strictEqual(req2.cooldownBlocked, true, 'Request 2 should be caught by 30s DB cooldown');

    // Advance DB time by 35 seconds
    storedOtp.lastSentAt = new Date(Date.now() - 35 * 1000);

    // Request 3 (Spaced): Passes rate limiter (count=3), passes DB check
    const req3 = await attemptSend();
    assert.strictEqual(req3.success, true, 'Request 3 should succeed after cooldown');

    // Advance DB time and perform Request 4 & 5
    storedOtp.lastSentAt = new Date(Date.now() - 35 * 1000);
    const req4 = await attemptSend();
    assert.strictEqual(req4.success, true, 'Request 4 should succeed');

    storedOtp.lastSentAt = new Date(Date.now() - 35 * 1000);
    const req5 = await attemptSend();
    assert.strictEqual(req5.success, true, 'Request 5 should succeed');

    // Advance DB time for Request 6 - even though DB cooldown has elapsed, Hourly Limit (5/hr) blocks it
    storedOtp.lastSentAt = new Date(Date.now() - 35 * 1000);
    const req6 = await attemptSend();
    assert.strictEqual(req6.rateLimited, true, 'Request 6 must be blocked by rate limiter (429)');
    assert.strictEqual(req6.statusCode, 429);
  } finally {
    Otp.findOne = originalFindOne;
    Otp.deleteOne = originalDeleteOne;
    Otp.prototype.save = originalPrototypeSave;
  }
});

// -----------------------------------------------------------------------------
// Summary
// -----------------------------------------------------------------------------
console.log('\n======================================================');
console.log(`  Tests Complete: ${passed} Passed, ${failed} Failed`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

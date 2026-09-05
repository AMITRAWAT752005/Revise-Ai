/**
 * Rate limiting and abuse protection middleware for ReviseAI Authentication
 * Native in-memory sliding window implementation (zero external dependencies).
 */

const isRateLimitEnabled = process.env.RATE_LIMIT_ENABLED !== 'false';

// Default configuration with environment variable overrides
const CONFIG = {
  // Login throttling: 5 failed attempts per email within 15 minutes
  LOGIN_ACCOUNT_MAX_FAILS: parseInt(process.env.LOGIN_ACCOUNT_MAX_FAILS || '5', 10),
  LOGIN_ACCOUNT_WINDOW_MS: parseInt(process.env.LOGIN_ACCOUNT_WINDOW_MS || String(15 * 60 * 1000), 10),

  // Login IP rate limiting: 30 requests per IP per 15 minutes (generous for shared IPs)
  LOGIN_IP_MAX: parseInt(process.env.LOGIN_IP_MAX || '30', 10),
  LOGIN_IP_WINDOW_MS: parseInt(process.env.LOGIN_IP_WINDOW_MS || String(15 * 60 * 1000), 10),

  // OTP Send: 5 requests per email per hour
  OTP_SEND_EMAIL_MAX: parseInt(process.env.OTP_SEND_EMAIL_MAX || '5', 10),
  OTP_SEND_EMAIL_WINDOW_MS: parseInt(process.env.OTP_SEND_EMAIL_WINDOW_MS || String(60 * 60 * 1000), 10),

  // OTP Send: 20 requests per IP per 15 minutes
  OTP_SEND_IP_MAX: parseInt(process.env.OTP_SEND_IP_MAX || '20', 10),
  OTP_SEND_IP_WINDOW_MS: parseInt(process.env.OTP_SEND_IP_WINDOW_MS || String(15 * 60 * 1000), 10),

  // OTP Verify: 15 verification attempts per IP/email per 15 minutes
  OTP_VERIFY_MAX: parseInt(process.env.OTP_VERIFY_MAX || '15', 10),
  OTP_VERIFY_WINDOW_MS: parseInt(process.env.OTP_VERIFY_WINDOW_MS || String(15 * 60 * 1000), 10),

  // Password Reset: 10 requests per IP per 15 minutes
  PASSWORD_RESET_MAX: parseInt(process.env.PASSWORD_RESET_MAX || '10', 10),
  PASSWORD_RESET_WINDOW_MS: parseInt(process.env.PASSWORD_RESET_WINDOW_MS || String(15 * 60 * 1000), 10),
};

// In-memory sliding window stores
const ipStore = new Map();
const failedLoginStore = new Map();
const otpSendEmailStore = new Map();
const otpVerifyStore = new Map();
const passwordResetStore = new Map();

// Periodic cleanup timer every 5 minutes to prevent memory leaks
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  const pruneMap = (map, windowMs) => {
    for (const [key, records] of map.entries()) {
      if (Array.isArray(records)) {
        const valid = records.filter(ts => now - ts < windowMs);
        if (valid.length === 0) {
          map.delete(key);
        } else {
          map.set(key, valid);
        }
      }
    }
  };

  pruneMap(ipStore, CONFIG.LOGIN_IP_WINDOW_MS);
  pruneMap(failedLoginStore, CONFIG.LOGIN_ACCOUNT_WINDOW_MS);
  pruneMap(otpSendEmailStore, CONFIG.OTP_SEND_EMAIL_WINDOW_MS);
  pruneMap(otpVerifyStore, CONFIG.OTP_VERIFY_WINDOW_MS);
  pruneMap(passwordResetStore, CONFIG.PASSWORD_RESET_WINDOW_MS);
}, 5 * 60 * 1000);

// Unref timer so Node process isn't kept alive during tests or shutdowns
if (cleanupInterval.unref) {
  cleanupInterval.unref();
}

/**
 * Generic helper to check and record hits in a sliding window store.
 * @param {Map} store - Map containing timestamps
 * @param {string} key - Unique identifier (IP, email, etc.)
 * @param {number} maxLimit - Max allowed hits
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {{ allowed: boolean, remaining: number, retryAfterSeconds: number }}
 */
const checkSlidingWindow = (store, key, maxLimit, windowMs) => {
  if (!isRateLimitEnabled) {
    return { allowed: true, remaining: maxLimit, retryAfterSeconds: 0 };
  }

  const now = Date.now();
  const timestamps = (store.get(key) || []).filter(ts => now - ts < windowMs);

  if (timestamps.length >= maxLimit) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  return { allowed: true, remaining: maxLimit - timestamps.length, retryAfterSeconds: 0 };
};

const recordHit = (store, key, windowMs) => {
  if (!isRateLimitEnabled) return;
  const now = Date.now();
  const timestamps = (store.get(key) || []).filter(ts => now - ts < windowMs);
  timestamps.push(now);
  store.set(key, timestamps);
};

/**
 * Middleware to throttle login requests by IP
 */
export const loginIpLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  const { allowed, retryAfterSeconds } = checkSlidingWindow(
    ipStore,
    `login_ip:${clientIp}`,
    CONFIG.LOGIN_IP_MAX,
    CONFIG.LOGIN_IP_WINDOW_MS
  );

  if (!allowed) {
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many login requests from this IP. Please try again later.',
    });
  }

  recordHit(ipStore, `login_ip:${clientIp}`, CONFIG.LOGIN_IP_WINDOW_MS);
  next();
};

/**
 * Checks whether an account is temporarily locked due to repeated failed logins
 * @param {string} email
 * @returns {{ throttled: boolean, retryAfterSeconds: number }}
 */
export const isAccountLoginThrottled = (email) => {
  if (!email || !isRateLimitEnabled) return { throttled: false, retryAfterSeconds: 0 };
  const normalizedEmail = email.trim().toLowerCase();
  const { allowed, retryAfterSeconds } = checkSlidingWindow(
    failedLoginStore,
    `fail_login:${normalizedEmail}`,
    CONFIG.LOGIN_ACCOUNT_MAX_FAILS,
    CONFIG.LOGIN_ACCOUNT_WINDOW_MS
  );

  return { throttled: !allowed, retryAfterSeconds };
};

/**
 * Records a failed login attempt for an account
 * @param {string} email
 */
export const recordFailedLogin = (email) => {
  if (!email || !isRateLimitEnabled) return;
  const normalizedEmail = email.trim().toLowerCase();
  recordHit(failedLoginStore, `fail_login:${normalizedEmail}`, CONFIG.LOGIN_ACCOUNT_WINDOW_MS);
};

/**
 * Resets failed login attempts for an account on successful login
 * @param {string} email
 */
export const resetFailedLogin = (email) => {
  if (!email) return;
  const normalizedEmail = email.trim().toLowerCase();
  failedLoginStore.delete(`fail_login:${normalizedEmail}`);
};

/**
 * Middleware to rate limit OTP sending requests (by IP and by email)
 */
export const otpSendLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  const email = req.body?.email;

  // 1. Check IP limit
  const ipCheck = checkSlidingWindow(
    ipStore,
    `otp_send_ip:${clientIp}`,
    CONFIG.OTP_SEND_IP_MAX,
    CONFIG.OTP_SEND_IP_WINDOW_MS
  );

  if (!ipCheck.allowed) {
    res.setHeader('Retry-After', ipCheck.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many OTP requests from your network. Please wait a few minutes.',
    });
  }

  // 2. Check Email hourly limit
  if (email && typeof email === 'string') {
    const normalizedEmail = email.trim().toLowerCase();
    const emailCheck = checkSlidingWindow(
      otpSendEmailStore,
      `otp_send_email:${normalizedEmail}`,
      CONFIG.OTP_SEND_EMAIL_MAX,
      CONFIG.OTP_SEND_EMAIL_WINDOW_MS
    );

    if (!emailCheck.allowed) {
      res.setHeader('Retry-After', emailCheck.retryAfterSeconds);
      return res.status(429).json({
        error: 'Too many verification code requests for this email. Please try again later.',
      });
    }

    recordHit(otpSendEmailStore, `otp_send_email:${normalizedEmail}`, CONFIG.OTP_SEND_EMAIL_WINDOW_MS);
  }

  recordHit(ipStore, `otp_send_ip:${clientIp}`, CONFIG.OTP_SEND_IP_WINDOW_MS);
  next();
};

/**
 * Middleware to rate limit OTP verification attempts (by IP and email)
 */
export const otpVerifyLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  const email = req.body?.email;
  const normalizedEmail = email && typeof email === 'string' ? email.trim().toLowerCase() : 'unknown';

  const check = checkSlidingWindow(
    otpVerifyStore,
    `otp_verify:${clientIp}:${normalizedEmail}`,
    CONFIG.OTP_VERIFY_MAX,
    CONFIG.OTP_VERIFY_WINDOW_MS
  );

  if (!check.allowed) {
    res.setHeader('Retry-After', check.retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many verification attempts. Please wait a few minutes before trying again.',
    });
  }

  recordHit(otpVerifyStore, `otp_verify:${clientIp}:${normalizedEmail}`, CONFIG.OTP_VERIFY_WINDOW_MS);
  next();
};

/**
 * Middleware to rate limit Password Reset attempts (by IP)
 */
export const passwordResetLimiter = (req, res, next) => {
  const clientIp = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  const { allowed, retryAfterSeconds } = checkSlidingWindow(
    passwordResetStore,
    `pw_reset_ip:${clientIp}`,
    CONFIG.PASSWORD_RESET_MAX,
    CONFIG.PASSWORD_RESET_WINDOW_MS
  );

  if (!allowed) {
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({
      error: 'Too many password reset attempts. Please try again later.',
    });
  }

  recordHit(passwordResetStore, `pw_reset_ip:${clientIp}`, CONFIG.PASSWORD_RESET_WINDOW_MS);
  next();
};

/**
 * Helper to clear all stores for testing purposes
 */
export const resetAllRateLimitStores = () => {
  ipStore.clear();
  failedLoginStore.clear();
  otpSendEmailStore.clear();
  otpVerifyStore.clear();
  passwordResetStore.clear();
};

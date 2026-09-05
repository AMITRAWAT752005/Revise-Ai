export const AUTH_COOKIE_NAME = 'reviseai_auth';
export const RESET_COOKIE_NAME = 'reviseai_password_reset';

const getCookieOptions = (maxAge) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.AUTH_COOKIE_SAME_SITE || 'lax',
  path: '/',
  ...(process.env.AUTH_COOKIE_DOMAIN ? { domain: process.env.AUTH_COOKIE_DOMAIN } : {}),
  maxAge,
});

export const setAuthCookie = (res, token) => {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions(7 * 24 * 60 * 60 * 1000));
};

export const setResetCookie = (res, token) => {
  res.cookie(RESET_COOKIE_NAME, token, getCookieOptions(15 * 60 * 1000));
};

export const clearAuthCookies = (res) => {
  const options = getCookieOptions(0);
  res.clearCookie(AUTH_COOKIE_NAME, options);
  res.clearCookie(RESET_COOKIE_NAME, options);
};

export const clearResetCookie = (res) => {
  res.clearCookie(RESET_COOKIE_NAME, getCookieOptions(0));
};

export const getCookie = (req, name) => {
  const header = req.headers.cookie;
  if (!header) return null;

  const cookie = header.split(';').find((part) => part.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.trim().slice(name.length + 1)) : null;
};

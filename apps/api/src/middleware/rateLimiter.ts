import { rateLimits } from '@community-os/config';
import rateLimit from 'express-rate-limit';

export const LoginLimiter = rateLimit({
  windowMs: rateLimits.login.windowMs,
  max: rateLimits.login.max,
  message: { success: false, error: 'Too many login attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const RefreshLimiter = rateLimit({
  windowMs: rateLimits.refresh.windowMs,
  max: rateLimits.refresh.max,
  message: { success: false, error: 'Too many token refresh requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const RegisterLimiter = rateLimit({
  windowMs: rateLimits.register.windowMs,
  max: rateLimits.register.max,
  message: {
    success: false,
    error: 'Too many accounts created from this IP, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const PasswordLimiter = rateLimit({
  windowMs: rateLimits.password.windowMs,
  max: rateLimits.password.max,
  message: {
    success: false,
    error: 'Too many password reset attempts, please try again after an hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
}

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const authConfig = {
  jwtAccessExpiresIn: '15m' as const,
  jwtRefreshExpiresIn: '7d' as const,
  cookieName: 'refreshToken',
  rbacDefaults: {
    roles: ['citizen', 'authority', 'municipality', 'admin'] as const,
    defaultRole: 'citizen' as const,
  },
};

export const rateLimits = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
  },
  refresh: {
    windowMs: 15 * 60 * 1000,
    max: 30,
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
  },
  password: {
    windowMs: 60 * 60 * 1000,
    max: 3,
  },
};

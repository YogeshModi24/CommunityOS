"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimits = exports.authConfig = exports.cookieOptions = void 0;
exports.cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
exports.authConfig = {
    jwtAccessExpiresIn: '15m',
    jwtRefreshExpiresIn: '7d',
    cookieName: 'refreshToken',
    rbacDefaults: {
        roles: ['citizen', 'authority', 'municipality', 'admin'],
        defaultRole: 'citizen',
    },
};
exports.rateLimits = {
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

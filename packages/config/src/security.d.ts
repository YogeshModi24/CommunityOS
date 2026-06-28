export interface CookieOptions {
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    maxAge: number;
}
export declare const cookieOptions: CookieOptions;
export declare const authConfig: {
    jwtAccessExpiresIn: "15m";
    jwtRefreshExpiresIn: "7d";
    cookieName: string;
    rbacDefaults: {
        roles: readonly ["citizen", "authority", "municipality", "admin"];
        defaultRole: "citizen";
    };
};
export declare const rateLimits: {
    login: {
        windowMs: number;
        max: number;
    };
    refresh: {
        windowMs: number;
        max: number;
    };
    register: {
        windowMs: number;
        max: number;
    };
    password: {
        windowMs: number;
        max: number;
    };
};
//# sourceMappingURL=security.d.ts.map
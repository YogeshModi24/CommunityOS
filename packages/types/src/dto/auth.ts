import { UserSession } from '../domain/user';

export interface LoginRequestDTO {
  email: string;
  password?: string;
  tenantId?: string;
}

export interface ClientMetaDTO {
  deviceName?: string;
  browser?: string;
  platform?: string;
  os?: string;
  appVersion?: string;
  ipAddress?: string;
}

export interface AuthSessionDTO {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  session: UserSession;
  user: {
    id: string;
    name?: string;
    email: string;
    role: string;
    ward?: string;
    points?: number;
  };
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  tenantId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponseDTO {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    ward?: string;
    points: number;
    issues_reported: number;
  };
}

export enum AuthEventType {
  LoginSuccess = 'login_success',
  LoginFailed = 'login_failed',
  Logout = 'logout',
  SessionCreated = 'session_created',
  SessionRevoked = 'session_revoked',
  RefreshSuccess = 'refresh_success',
  RefreshFailed = 'refresh_failed',
  RBACDenied = 'rbac_denied',
}

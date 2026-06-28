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
    email: string;
    role: string;
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

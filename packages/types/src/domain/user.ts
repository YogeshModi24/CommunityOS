export type UserRole = 'citizen' | 'authority' | 'municipality' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  ward?: string;
  points: number;
  issues_reported: number;
  achievements: {
    id: string;
    unlockedAt: Date;
    progress?: number;
  }[];
  savedLocations: {
    type: 'home' | 'office' | 'university' | 'custom';
    address: string;
    coordinates: [number, number];
  }[];
  reputation?: {
    level: number;
    xpProgress: number;
    nextLevelPoints: number;
    currentLevelPoints: number;
    rankTitle: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceInfo {
  deviceName?: string;
  browser?: string;
  platform?: string;
  os?: string;
  appVersion?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  tenantId: string;
  refreshTokenHash: string;
  device: DeviceInfo;
  ipAddress?: string;
  isActive: boolean;
  version: number;
  createdAt: Date;
  lastUsedAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  revokedReason?: string;
}

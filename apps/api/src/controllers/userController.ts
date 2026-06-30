import { authConfig, cookieOptions } from '@community-os/config';
import { ValidationError } from '@community-os/errors';
import { ClientMetaDTO } from '@community-os/types';
import {
  loginSchema,
  municipalityAccessRequestSchema,
  registerSchema,
} from '@community-os/validation';
import { NextFunction, Request, Response } from 'express';

import { container } from '../infra/container';
import { AuthRequest } from '../middleware/auth';
import { IUserService } from '../services/contracts/IUserService';
import { ApproveMunicipalityAccessRequestUseCase } from '../use-cases/ApproveMunicipalityAccessRequestUseCase';
import { CreateMunicipalityAccessRequestUseCase } from '../use-cases/CreateMunicipalityAccessRequestUseCase';
import { GetCitizenInsightsUseCase } from '../use-cases/GetCitizenInsightsUseCase';
import { GetDashboardDataUseCase } from '../use-cases/GetDashboardDataUseCase';
import { ListMunicipalityAccessRequestsUseCase } from '../use-cases/ListMunicipalityAccessRequestsUseCase';
import { LoginUserUseCase } from '../use-cases/LoginUserUseCase';
import { LogoutUserUseCase } from '../use-cases/LogoutUserUseCase';
import { RefreshTokenUseCase } from '../use-cases/RefreshTokenUseCase';
import { RegisterUserUseCase } from '../use-cases/RegisterUserUseCase';

function getClientMeta(req: Request): ClientMetaDTO {
  const userAgent = req.headers['user-agent'] || '';
  let browser = 'Unknown';
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  let platform = 'Web';
  if (
    userAgent.includes('Mobile') ||
    userAgent.includes('Android') ||
    userAgent.includes('iPhone')
  ) {
    platform = 'Mobile';
  }

  return {
    deviceName: (req.headers['x-device-name'] as string) || undefined,
    browser,
    platform,
    os: (req.headers['x-os'] as string) || undefined,
    appVersion: (req.headers['x-app-version'] as string) || undefined,
    ipAddress: req.ip || req.socket.remoteAddress || undefined,
  };
}

// POST /api/users/login
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const clientMeta = getClientMeta(req);
    const loginUseCase = container.resolve<LoginUserUseCase>(LoginUserUseCase);

    const result = await loginUseCase.execute(validatedData, clientMeta);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    const authSession = result.value;
    const isWeb = req.headers['x-auth-transport'] !== 'json';

    if (isWeb && authSession.refreshToken) {
      res.cookie(authConfig.cookieName, authSession.refreshToken, cookieOptions);
    }

    const responsePayload = {
      accessToken: authSession.accessToken,
      expiresAt: authSession.expiresAt,
      session: authSession.session,
      user: authSession.user,
      ...(isWeb ? {} : { refreshToken: authSession.refreshToken }),
    };

    res.json({ success: true, data: responsePayload });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/refresh
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[authConfig.cookieName] || (req.body.refreshToken as string);
    if (!rawRefreshToken) {
      throw new ValidationError('Refresh token missing');
    }

    const clientMeta = getClientMeta(req);
    const refreshUseCase = container.resolve<RefreshTokenUseCase>(RefreshTokenUseCase);
    const result = await refreshUseCase.execute(rawRefreshToken, clientMeta);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    const authSession = result.value;
    const isWeb = req.headers['x-auth-transport'] !== 'json';

    if (isWeb && authSession.refreshToken) {
      res.cookie(authConfig.cookieName, authSession.refreshToken, cookieOptions);
    }

    const responsePayload = {
      accessToken: authSession.accessToken,
      expiresAt: authSession.expiresAt,
      session: authSession.session,
      user: authSession.user,
      ...(isWeb ? {} : { refreshToken: authSession.refreshToken }),
    };

    res.json({ success: true, data: responsePayload });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/logout
export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.sessionId) {
      throw new ValidationError('No active session found');
    }

    const logoutUseCase = container.resolve<LogoutUserUseCase>(LogoutUserUseCase);
    const result = await logoutUseCase.execute(req.sessionId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }

    res.clearCookie(authConfig.cookieName, cookieOptions);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me
export async function getMe(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const userService = container.resolve<IUserService>('userService');
    const result = await userService.getMe(req.userId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/leaderboard
export async function getLeaderboard(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userService = container.resolve<IUserService>('userService');
    const result = await userService.getLeaderboard(10);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/dashboard
export async function getDashboard(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const useCase = container.resolve<GetDashboardDataUseCase>(GetDashboardDataUseCase);
    const result = await useCase.execute(req.userId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/locations
export async function saveLocation(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const { type, address, coordinates } = req.body;
    if (!type || !address || !coordinates) {
      throw new ValidationError('Type, address, and coordinates are required');
    }
    const userService = container.resolve<IUserService>('userService');
    const result = await userService.saveLocation(req.userId, { type, address, coordinates });
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/me/insights
export async function getCitizenInsights(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const useCase = container.resolve<GetCitizenInsightsUseCase>(GetCitizenInsightsUseCase);
    const result = await useCase.execute(req.userId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/register
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);
    const useCase = container.resolve<RegisterUserUseCase>(RegisterUserUseCase);
    const result = await useCase.execute(validatedData);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.status(201).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/municipality-request
export async function requestMunicipalityAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = municipalityAccessRequestSchema.parse(req.body);
    const useCase = container.resolve<CreateMunicipalityAccessRequestUseCase>(
      CreateMunicipalityAccessRequestUseCase
    );
    const result = await useCase.execute(validatedData);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.status(201).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/users/municipality-requests
export async function listMunicipalityRequests(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const useCase = container.resolve<ListMunicipalityAccessRequestsUseCase>(
      ListMunicipalityAccessRequestsUseCase
    );
    const result = await useCase.execute();
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// POST /api/users/municipality-requests/:id/approve
export async function approveMunicipalityRequest(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) {
      throw new ValidationError('Access request ID is required');
    }
    const useCase = container.resolve<ApproveMunicipalityAccessRequestUseCase>(
      ApproveMunicipalityAccessRequestUseCase
    );
    const result = await useCase.execute(id);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

import { ValidationError } from '@community-os/errors';
import {
  createIssueSchema,
  getNearbyIssuesSchema,
  listIssuesQuerySchema,
  updateIssueStatusSchema,
} from '@community-os/validation';
import { NextFunction, Request, Response } from 'express';

import { container } from '../infra/container';
import { AuthRequest } from '../middleware/auth';
import { IAIService } from '../services/contracts/IAIService';
import { IIssueService } from '../services/contracts/IIssueService';
import { ReportIssueUseCase } from '../use-cases/ReportIssueUseCase';
import { ResolveIssueUseCase } from '../use-cases/ResolveIssueUseCase';

// POST /api/issues
export async function createIssue(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = createIssueSchema.parse(req.body);
    if (!req.userId) {
      throw new ValidationError('User context missing');
    }
    const reportUseCase = container.resolve<ReportIssueUseCase>(ReportIssueUseCase);
    const result = await reportUseCase.execute(validatedData, req.userId);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.status(201).json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/issues/analyze?url=
export async function analyzeImage(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const url = req.query.url as string | undefined;
    if (!url) {
      throw new ValidationError('url query param required');
    }
    const aiService = container.resolve<IAIService>('aiService');
    const result = await aiService.analyzeIssueImage(url);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/issues/nearby
export async function getNearbyIssues(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedQuery = getNearbyIssuesSchema.parse(req.query);
    const issueService = container.resolve<IIssueService>('issueService');
    const result = await issueService.getNearbyIssues(validatedQuery);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/issues
export async function listIssues(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validatedQuery = listIssuesQuerySchema.parse(req.query);
    const issueService = container.resolve<IIssueService>('issueService');
    const result = await issueService.listIssues(validatedQuery);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// GET /api/issues/:id
export async function getIssue(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const issueService = container.resolve<IIssueService>('issueService');
    const result = await issueService.getIssue(req.params.id);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/issues/:id/status
export async function updateStatus(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const validatedData = updateIssueStatusSchema.parse(req.body);
    const resolveUseCase = container.resolve<ResolveIssueUseCase>(ResolveIssueUseCase);
    const result = await resolveUseCase.execute(req.params.id, validatedData);
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

// POST /api/issues/:id/assign
export async function assignIssue(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { department, assignedToId, assignedToName, assignedToRole, dueDate } = req.body;
    if (!department) {
      throw new ValidationError('Department is required for assignment');
    }
    
    // We import AssignIssueUseCase inside the function or at the top
    const { AssignIssueUseCase } = await import('../use-cases/AssignIssueUseCase');
    const assignUseCase = container.resolve<any>(AssignIssueUseCase);
    
    const result = await assignUseCase.execute(
      req.params.id,
      { department, assignedToId, assignedToName, assignedToRole, dueDate },
      req.userId!
    );
    
    if (result.isFailure) {
      throw new ValidationError(result.error);
    }
    res.json({ success: true, data: result.value });
  } catch (err) {
    next(err);
  }
}

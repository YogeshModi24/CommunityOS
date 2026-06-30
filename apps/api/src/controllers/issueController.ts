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

    const issueService = container.resolve<IIssueService>('issueService');
    const issueResult = await issueService.getIssue(req.params.id);
    if (issueResult.isFailure) {
      throw new ValidationError(issueResult.error);
    }
    const issue = issueResult.value;

    if (req.userRole === 'admin') {
      // Explicit Admin Bypass: Admin retains full access to all issues across all wards
    } else if (req.userRole === 'municipality') {
      const userRepository = container.resolve<any>('userRepository');
      const requester = await userRepository.findById(req.userId!);
      if (!requester || !requester.ward) {
        res.status(403).json({
          success: false,
          error:
            'Access denied: Your account has no ward assigned. Please contact an administrator.',
        });
        return;
      }
      if (requester.ward !== issue.ward) {
        res.status(403).json({
          success: false,
          error: `Access denied: You are only authorized to manage issues in ward "${requester.ward}", but this issue belongs to "${issue.ward || 'None'}".`,
        });
        return;
      }
    }

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

    const issueService = container.resolve<IIssueService>('issueService');
    const issueResult = await issueService.getIssue(req.params.id);
    if (issueResult.isFailure) {
      throw new ValidationError(issueResult.error);
    }
    const issue = issueResult.value;

    if (req.userRole === 'admin') {
      // Explicit Admin Bypass: Admin retains full access to all issues across all wards
    } else if (req.userRole === 'municipality') {
      const userRepository = container.resolve<any>('userRepository');
      const requester = await userRepository.findById(req.userId!);
      if (!requester || !requester.ward) {
        res.status(403).json({
          success: false,
          error:
            'Access denied: Your account has no ward assigned. Please contact an administrator.',
        });
        return;
      }
      if (requester.ward !== issue.ward) {
        res.status(403).json({
          success: false,
          error: `Access denied: You are only authorized to manage issues in ward "${requester.ward}", but this issue belongs to "${issue.ward || 'None'}".`,
        });
        return;
      }
    }

    // We import AssignIssueUseCase inside the function or at the top
    const { AssignIssueUseCase } = await import('../use-cases/AssignIssueUseCase.js');
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

import { Result } from '@community-os/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { assignIssue, updateStatus } from '../controllers/issueController';
import { container } from '../infra/container';

// Mock container registrations
const mockIssueService = {
  getIssue: vi.fn(),
  updateStatus: vi.fn(),
};

const mockUserRepo = {
  findById: vi.fn(),
};

const mockResolveUseCase = {
  execute: vi.fn(),
};

const mockAssignUseCase = {
  execute: vi.fn(),
};

describe('Ward-Level Permission Restrictions', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Stub container resolves
    vi.spyOn(container, 'resolve').mockImplementation((key: any) => {
      if (key === 'issueService') return mockIssueService;
      if (key === 'userRepository') return mockUserRepo;
      // Handle both class constructors and string lookups
      if (key.name === 'ResolveIssueUseCase' || key === 'resolveIssueUseCase')
        return mockResolveUseCase;
      if (key.name === 'AssignIssueUseCase' || key === 'assignIssueUseCase')
        return mockAssignUseCase;
      return null;
    });
  });

  describe('updateStatus', () => {
    it('admin role should bypass ward constraints', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { status: 'in_progress', note: 'work started' },
        userId: 'admin-1',
        userRole: 'admin',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockResolveUseCase.execute.mockResolvedValue(
        Result.ok({ id: 'issue-1', status: 'in_progress' })
      );

      await updateStatus(req, res, next);

      expect(mockResolveUseCase.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('municipality user with matching ward should be allowed', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { status: 'in_progress', note: 'work started' },
        userId: 'officer-1',
        userRole: 'municipality',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockUserRepo.findById.mockResolvedValue({
        id: 'officer-1',
        role: 'municipality',
        ward: 'Ward 5',
      });
      mockResolveUseCase.execute.mockResolvedValue(
        Result.ok({ id: 'issue-1', status: 'in_progress' })
      );

      await updateStatus(req, res, next);

      expect(mockResolveUseCase.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('municipality user with mismatched ward should be rejected with 403', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { status: 'in_progress', note: 'work started' },
        userId: 'officer-1',
        userRole: 'municipality',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockUserRepo.findById.mockResolvedValue({
        id: 'officer-1',
        role: 'municipality',
        ward: 'Ward 12',
      });

      await updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('authorized to manage issues in ward "Ward 12"'),
        })
      );
      expect(mockResolveUseCase.execute).not.toHaveBeenCalled();
    });

    it('municipality user with empty/invalid ward should see clear error', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { status: 'in_progress', note: 'work started' },
        userId: 'officer-2',
        userRole: 'municipality',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockUserRepo.findById.mockResolvedValue({ id: 'officer-2', role: 'municipality', ward: '' });

      await updateStatus(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('no ward assigned'),
        })
      );
    });
  });

  describe('assignIssue', () => {
    it('admin role should bypass ward constraints on assignment', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { department: 'sanitation' },
        userId: 'admin-1',
        userRole: 'admin',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockAssignUseCase.execute.mockResolvedValue(Result.ok({ id: 'issue-1', status: 'assigned' }));

      await assignIssue(req, res, next);

      expect(mockAssignUseCase.execute).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    it('municipality user with mismatched ward should be rejected with 403 on assignment', async () => {
      const req = {
        params: { id: 'issue-1' },
        body: { department: 'sanitation' },
        userId: 'officer-1',
        userRole: 'municipality',
      } as any;

      const res = {
        json: vi.fn(),
        status: vi.fn().mockReturnThis(),
      } as any;

      const next = vi.fn();

      mockIssueService.getIssue.mockResolvedValue(Result.ok({ id: 'issue-1', ward: 'Ward 5' }));
      mockUserRepo.findById.mockResolvedValue({
        id: 'officer-1',
        role: 'municipality',
        ward: 'Ward 12',
      });

      await assignIssue(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(mockAssignUseCase.execute).not.toHaveBeenCalled();
    });
  });
});

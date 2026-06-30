import { ForbiddenError } from '@community-os/errors';
import { Result } from '@community-os/utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { rbacMiddleware } from '../middleware/rbac';
import { ApproveMunicipalityAccessRequestUseCase } from '../use-cases/ApproveMunicipalityAccessRequestUseCase';
import { CompleteSetupAccountUseCase } from '../use-cases/CompleteSetupAccountUseCase';
import { CreateMunicipalityAccessRequestUseCase } from '../use-cases/CreateMunicipalityAccessRequestUseCase';
import { ListMunicipalityAccessRequestsUseCase } from '../use-cases/ListMunicipalityAccessRequestsUseCase';
import { RegisterUserUseCase } from '../use-cases/RegisterUserUseCase';
import { ValidateSetupTokenUseCase } from '../use-cases/ValidateSetupTokenUseCase';

const mockUserRepo = {
  findByEmail: vi.fn(),
  create: vi.fn(),
  findByResetPasswordToken: vi.fn(),
  updatePasswordAndClearToken: vi.fn(),
};

const mockUserService = {
  createUser: vi.fn(),
};

const mockRequestRepo = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findPendingByEmail: vi.fn(),
  listAll: vi.fn(),
  create: vi.fn(),
  updateStatus: vi.fn(),
};

describe('Registration & Access Requests Use Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RegisterUserUseCase', () => {
    it('should register a new citizen user successfully and hash password', async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(
        Result.ok({ id: 'user-1', name: 'Alice', role: 'citizen' })
      );

      const useCase = new RegisterUserUseCase(mockUserService as any, mockUserRepo as any);
      const result = await useCase.execute({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'securePassword123',
        ward: 'Ward 4',
      });

      expect(result.isSuccess).toBe(true);
      expect(mockUserRepo.findByEmail).toHaveBeenCalledWith('alice@example.com');
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Alice',
          email: 'alice@example.com',
          role: 'citizen',
          ward: 'Ward 4',
        })
      );
    });

    it('should fail if email is already registered', async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: 'user-1', email: 'alice@example.com' });

      const useCase = new RegisterUserUseCase(mockUserService as any, mockUserRepo as any);
      const result = await useCase.execute({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'securePassword123',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Email is already registered');
    });
  });

  describe('CreateMunicipalityAccessRequestUseCase', () => {
    it('should submit a request successfully', async () => {
      mockRequestRepo.findPendingByEmail.mockResolvedValue(null);
      mockRequestRepo.create.mockResolvedValue({
        id: 'req-1',
        name: 'Bob',
        email: 'bob@city.gov',
        ward: 'Sanitation Dept',
        status: 'pending',
      });

      const useCase = new CreateMunicipalityAccessRequestUseCase(mockRequestRepo as any);
      const result = await useCase.execute({
        name: 'Bob',
        email: 'bob@city.gov',
        ward: 'Sanitation Dept',
        message: 'Requesting access',
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.status).toBe('pending');
      expect(mockRequestRepo.create).toHaveBeenCalledWith({
        name: 'Bob',
        email: 'bob@city.gov',
        ward: 'Sanitation Dept',
        message: 'Requesting access',
        status: 'pending',
      });
    });

    it('should fail if pending request already exists', async () => {
      mockRequestRepo.findPendingByEmail.mockResolvedValue({ id: 'req-1' });

      const useCase = new CreateMunicipalityAccessRequestUseCase(mockRequestRepo as any);
      const result = await useCase.execute({
        name: 'Bob',
        email: 'bob@city.gov',
        ward: 'Sanitation Dept',
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('A pending access request already exists for this email address.');
    });
  });

  describe('ListMunicipalityAccessRequestsUseCase', () => {
    it('should list all requests', async () => {
      mockRequestRepo.listAll.mockResolvedValue([{ id: 'req-1' }, { id: 'req-2' }]);

      const useCase = new ListMunicipalityAccessRequestsUseCase(mockRequestRepo as any);
      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      expect(result.value.length).toBe(2);
    });
  });

  describe('ApproveMunicipalityAccessRequestUseCase', () => {
    it('should approve request, create user with locked password, and return setup token', async () => {
      const request = {
        id: 'req-1',
        name: 'Bob',
        email: 'bob@city.gov',
        ward: 'Sanitation Dept',
        status: 'pending',
      };
      mockRequestRepo.findById.mockResolvedValue(request);
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(
        Result.ok({ id: 'user-2', name: 'Bob', role: 'municipality' })
      );

      const useCase = new ApproveMunicipalityAccessRequestUseCase(
        mockRequestRepo as any,
        mockUserRepo as any,
        mockUserService as any
      );
      const result = await useCase.execute('req-1');

      expect(result.isSuccess).toBe(true);
      expect(result.value.setupToken).toBeDefined();
      expect(mockRequestRepo.updateStatus).toHaveBeenCalledWith('req-1', 'approved');
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Bob',
          email: 'bob@city.gov',
          role: 'municipality',
          ward: 'Sanitation Dept',
          resetPasswordToken: expect.any(String),
          resetPasswordExpires: expect.any(Date),
        })
      );
    });

    it('should fail if request not found', async () => {
      mockRequestRepo.findById.mockResolvedValue(null);

      const useCase = new ApproveMunicipalityAccessRequestUseCase(
        mockRequestRepo as any,
        mockUserRepo as any,
        mockUserService as any
      );
      const result = await useCase.execute('invalid-id');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Access request not found.');
    });

    it('should fail if request is already approved', async () => {
      mockRequestRepo.findById.mockResolvedValue({ id: 'req-1', status: 'approved' });

      const useCase = new ApproveMunicipalityAccessRequestUseCase(
        mockRequestRepo as any,
        mockUserRepo as any,
        mockUserService as any
      );
      const result = await useCase.execute('req-1');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe(
        "Access request cannot be approved because its status is 'approved'."
      );
    });
  });

  describe('RBAC Middleware Negative Tests for Municipality endpoints', () => {
    it('should reject a non-admin (citizen) user with 403 Forbidden', () => {
      const middleware = rbacMiddleware(['admin']);
      const req = {
        userId: 'user-citizen',
        userRole: 'citizen',
      };
      const res = {};
      const next = vi.fn();

      middleware(req as any, res as any, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed).toBeInstanceOf(ForbiddenError);
      expect(errorPassed.status).toBe(403);
      expect(errorPassed.message).toBe('Forbidden access: Insufficient permissions');
    });

    it('should reject anonymous requests with 403 Forbidden', () => {
      const middleware = rbacMiddleware(['admin']);
      const req = {
        userId: undefined,
        userRole: undefined,
      };
      const res = {};
      const next = vi.fn();

      middleware(req as any, res as any, next);

      expect(next).toHaveBeenCalledTimes(1);
      const errorPassed = next.mock.calls[0][0];
      expect(errorPassed).toBeInstanceOf(ForbiddenError);
      expect(errorPassed.status).toBe(403);
    });

    it('should allow admin requests through', () => {
      const middleware = rbacMiddleware(['admin']);
      const req = {
        userId: 'user-admin',
        userRole: 'admin',
      };
      const res = {};
      const next = vi.fn();

      middleware(req as any, res as any, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith(); // called with no errors
    });
  });

  describe('ValidateSetupTokenUseCase', () => {
    it('should validate token successfully if user exists and token not expired', async () => {
      const expires = new Date(Date.now() + 60000);
      mockUserRepo.findByResetPasswordToken.mockResolvedValue({
        id: 'user-1',
        email: 'officer@city.gov',
        name: 'Officer Bob',
        resetPasswordExpires: expires,
      });

      const useCase = new ValidateSetupTokenUseCase(mockUserRepo as any);
      const result = await useCase.execute('valid-token');

      expect(result.isSuccess).toBe(true);
      expect(result.value.email).toBe('officer@city.gov');
    });

    it('should fail if token is missing or invalid', async () => {
      mockUserRepo.findByResetPasswordToken.mockResolvedValue(null);

      const useCase = new ValidateSetupTokenUseCase(mockUserRepo as any);
      const result = await useCase.execute('invalid-token');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Invalid or already used setup token');
    });

    it('should fail if token is expired', async () => {
      const expires = new Date(Date.now() - 60000);
      mockUserRepo.findByResetPasswordToken.mockResolvedValue({
        id: 'user-1',
        email: 'officer@city.gov',
        resetPasswordExpires: expires,
      });

      const useCase = new ValidateSetupTokenUseCase(mockUserRepo as any);
      const result = await useCase.execute('expired-token');

      expect(result.isFailure).toBe(true);
      expect(result.error).toBe('Setup token has expired');
    });
  });

  describe('CompleteSetupAccountUseCase', () => {
    it('should hash password, update user and clear token info successfully', async () => {
      const expires = new Date(Date.now() + 60000);
      mockUserRepo.findByResetPasswordToken.mockResolvedValue({
        id: 'user-1',
        email: 'officer@city.gov',
        name: 'Officer Bob',
        resetPasswordExpires: expires,
      });
      mockUserRepo.updatePasswordAndClearToken.mockResolvedValue({
        id: 'user-1',
        email: 'officer@city.gov',
        role: 'municipality',
      });

      const useCase = new CompleteSetupAccountUseCase(mockUserRepo as any);
      const result = await useCase.execute({ token: 'valid-token', password: 'newSecurePassword' });

      expect(result.isSuccess).toBe(true);
      expect(mockUserRepo.updatePasswordAndClearToken).toHaveBeenCalledWith(
        'user-1',
        expect.any(String)
      );
    });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import IssueMongoose from '../mongodb/models/Issue';
import UserMongoose from '../mongodb/models/User';
import { MongoIssueRepository } from '../mongodb/MongoIssueRepository';
import { MongoUserRepository } from '../mongodb/MongoUserRepository';

vi.mock('../mongodb/models/User', () => {
  return {
    default: {
      findById: vi.fn(),
      findOne: vi.fn(),
      find: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
});

vi.mock('../mongodb/models/Issue', () => {
  return {
    default: {
      findById: vi.fn(),
      findByIdAndUpdate: vi.fn(),
      find: vi.fn(),
      create: vi.fn(),
      countDocuments: vi.fn(),
      deleteMany: vi.fn(),
    },
  };
});

describe('MongoUserRepository', () => {
  let userRepo: MongoUserRepository;

  beforeEach(() => {
    userRepo = new MongoUserRepository();
    vi.clearAllMocks();
  });

  it('should find user by id and map properly', async () => {
    const mockUserDoc = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Rahul Sharma',
      email: 'rahul@demo.com',
      role: 'citizen',
      points: 10,
      issues_reported: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(UserMongoose.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUserDoc),
    } as any);

    const result = await userRepo.findById('507f1f77bcf86cd799439011');
    expect(result).not.toBeNull();
    expect(result?.id).toBe('507f1f77bcf86cd799439011');
    expect(result?.name).toBe('Rahul Sharma');
    expect(result?.role).toBe('citizen');
  });

  it('should return null when user is not found', async () => {
    vi.mocked(UserMongoose.findById).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const result = await userRepo.findById('507f1f77bcf86cd799439012');
    expect(result).toBeNull();
  });
});

describe('MongoIssueRepository', () => {
  let issueRepo: MongoIssueRepository;

  beforeEach(() => {
    issueRepo = new MongoIssueRepository();
    vi.clearAllMocks();
  });

  it('should list issues with filters and pagination', async () => {
    const mockIssueDoc = {
      _id: '607f1f77bcf86cd799439022',
      title: 'Water leak',
      description: 'Pipes leaking water',
      category: 'water_leak',
      severity: 3,
      status: 'open',
      location: { type: 'Point', coordinates: [73.3, 28.0] },
      reporter_id: { _id: '507f1f77bcf86cd799439011', name: 'Rahul' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockFindChain = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([mockIssueDoc]),
    };

    vi.mocked(IssueMongoose.find).mockReturnValue(mockFindChain as any);
    vi.mocked(IssueMongoose.countDocuments).mockResolvedValue(1);

    const result = await issueRepo.findAll({ category: 'water_leak' }, { skip: 0, limit: 10 });

    expect(result.issues).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.issues[0].id).toBe('607f1f77bcf86cd799439022');
    expect(typeof result.issues[0].reporter_id).toBe('object');
  });
});

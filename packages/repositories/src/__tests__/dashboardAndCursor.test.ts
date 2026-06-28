import { Types } from 'mongoose';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import IssueMongoose from '../mongodb/models/Issue';
import UserMongoose from '../mongodb/models/User';
import { MongoIssueRepository } from '../mongodb/MongoIssueRepository';
import { MongoUserRepository } from '../mongodb/MongoUserRepository';

vi.mock('../mongodb/models/User', () => {
  return {
    default: {
      aggregate: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
    },
  };
});

vi.mock('../mongodb/models/Issue', () => {
  return {
    default: {
      find: vi.fn(),
      countDocuments: vi.fn(),
    },
  };
});

describe('Dashboard and Cursor Pagination Tests', () => {
  let userRepo: MongoUserRepository;
  let issueRepo: MongoIssueRepository;

  beforeEach(() => {
    userRepo = new MongoUserRepository();
    issueRepo = new MongoIssueRepository();
    vi.clearAllMocks();
  });

  describe('getDashboardProjection', () => {
    it('should aggregate user dashboard stats and leaderboard correctly in a single pipeline', async () => {
      const mockUserId = new Types.ObjectId().toString();

      const mockAggregationResult = [
        {
          userProfile: [
            {
              _id: new Types.ObjectId(mockUserId),
              name: 'Rahul Sharma',
              email: 'rahul@demo.com',
              role: 'citizen',
              ward: 'Ward 12',
              points: 150,
              issues_reported: 5,
              totalReports: 5,
              resolvedReports: 2,
              pendingReports: 3,
              recentActivity: [
                {
                  _id: new Types.ObjectId(),
                  title: 'Water Leak Main Road',
                  status: 'open',
                  category: 'water_leak',
                  severity: 3,
                  address: 'Main Road',
                  votes: 4,
                  createdAt: new Date(),
                },
              ],
            },
          ],
          leaderboard: [
            {
              _id: new Types.ObjectId(mockUserId),
              name: 'Rahul Sharma',
              email: 'rahul@demo.com',
              ward: 'Ward 12',
              points: 150,
              issues_reported: 5,
            },
            {
              _id: new Types.ObjectId(),
              name: 'Priya Patel',
              email: 'priya@demo.com',
              ward: 'Ward 15',
              points: 90,
              issues_reported: 3,
            },
          ],
        },
      ];

      vi.mocked(UserMongoose.aggregate).mockResolvedValue(mockAggregationResult);

      const result = await userRepo.getDashboardProjection(mockUserId);

      expect(UserMongoose.aggregate).toHaveBeenCalled();
      expect(result).not.toBeNull();
      expect(result.userId).toBe(mockUserId);
      expect(result.totalReports).toBe(5);
      expect(result.resolvedReports).toBe(2);
      expect(result.pendingReports).toBe(3);
      expect(result.recentActivity).toHaveLength(1);
      expect(result.leaderboard).toHaveLength(2);
      expect(result.leaderboard[0].points).toBe(150);
      expect(result.leaderboard[1].name).toBe('Priya Patel');
    });
  });

  describe('findAll cursor pagination', () => {
    it('should query with cursor and generate next cursor', async () => {
      const mockIssueId = new Types.ObjectId();
      const mockIssues = [
        {
          _id: mockIssueId,
          title: 'Pothole on Cross Road',
          description: 'Deep pothole',
          category: 'pothole',
          severity: 4,
          status: 'open',
          location: { type: 'Point', coordinates: [73.0, 28.0] },
          votes: 10,
          priority_score: 80,
          createdAt: new Date('2026-06-26T12:00:00Z'),
          reporter_id: { _id: new Types.ObjectId(), name: 'Test User' },
        },
      ];

      const mockFindChain = {
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        lean: vi.fn().mockResolvedValue(mockIssues),
      };

      vi.mocked(IssueMongoose.find).mockReturnValue(mockFindChain as any);
      vi.mocked(IssueMongoose.countDocuments).mockResolvedValue(1);

      const result = await issueRepo.findAll(
        { category: 'pothole' },
        { limit: 1, sort: 'priority' }
      );

      expect(result.issues).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.nextCursor).toBeDefined();

      const decodedCursor = Buffer.from(result.nextCursor!, 'base64').toString('ascii');
      expect(decodedCursor).toBe(`80_${mockIssueId.toString()}`);
    });
  });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const vitest_1 = require("vitest");
const Issue_1 = __importDefault(require("../mongodb/models/Issue"));
const User_1 = __importDefault(require("../mongodb/models/User"));
const MongoIssueRepository_1 = require("../mongodb/MongoIssueRepository");
const MongoUserRepository_1 = require("../mongodb/MongoUserRepository");
vitest_1.vi.mock('../mongodb/models/User', () => {
    return {
        default: {
            aggregate: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            findOne: vitest_1.vi.fn(),
        },
    };
});
vitest_1.vi.mock('../mongodb/models/Issue', () => {
    return {
        default: {
            find: vitest_1.vi.fn(),
            countDocuments: vitest_1.vi.fn(),
        },
    };
});
(0, vitest_1.describe)('Dashboard and Cursor Pagination Tests', () => {
    let userRepo;
    let issueRepo;
    (0, vitest_1.beforeEach)(() => {
        userRepo = new MongoUserRepository_1.MongoUserRepository();
        issueRepo = new MongoIssueRepository_1.MongoIssueRepository();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.describe)('getDashboardProjection', () => {
        (0, vitest_1.it)('should aggregate user dashboard stats and leaderboard correctly in a single pipeline', async () => {
            const mockUserId = new mongoose_1.Types.ObjectId().toString();
            const mockAggregationResult = [
                {
                    userProfile: [
                        {
                            _id: new mongoose_1.Types.ObjectId(mockUserId),
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
                                    _id: new mongoose_1.Types.ObjectId(),
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
                            _id: new mongoose_1.Types.ObjectId(mockUserId),
                            name: 'Rahul Sharma',
                            email: 'rahul@demo.com',
                            ward: 'Ward 12',
                            points: 150,
                            issues_reported: 5,
                        },
                        {
                            _id: new mongoose_1.Types.ObjectId(),
                            name: 'Priya Patel',
                            email: 'priya@demo.com',
                            ward: 'Ward 15',
                            points: 90,
                            issues_reported: 3,
                        },
                    ],
                },
            ];
            vitest_1.vi.mocked(User_1.default.aggregate).mockResolvedValue(mockAggregationResult);
            const result = await userRepo.getDashboardProjection(mockUserId);
            (0, vitest_1.expect)(User_1.default.aggregate).toHaveBeenCalled();
            (0, vitest_1.expect)(result).not.toBeNull();
            (0, vitest_1.expect)(result.userId).toBe(mockUserId);
            (0, vitest_1.expect)(result.totalReports).toBe(5);
            (0, vitest_1.expect)(result.resolvedReports).toBe(2);
            (0, vitest_1.expect)(result.pendingReports).toBe(3);
            (0, vitest_1.expect)(result.recentActivity).toHaveLength(1);
            (0, vitest_1.expect)(result.leaderboard).toHaveLength(2);
            (0, vitest_1.expect)(result.leaderboard[0].points).toBe(150);
            (0, vitest_1.expect)(result.leaderboard[1].name).toBe('Priya Patel');
        });
    });
    (0, vitest_1.describe)('findAll cursor pagination', () => {
        (0, vitest_1.it)('should query with cursor and generate next cursor', async () => {
            const mockIssueId = new mongoose_1.Types.ObjectId();
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
                    reporter_id: { _id: new mongoose_1.Types.ObjectId(), name: 'Test User' },
                },
            ];
            const mockFindChain = {
                sort: vitest_1.vi.fn().mockReturnThis(),
                limit: vitest_1.vi.fn().mockReturnThis(),
                populate: vitest_1.vi.fn().mockReturnThis(),
                lean: vitest_1.vi.fn().mockResolvedValue(mockIssues),
            };
            vitest_1.vi.mocked(Issue_1.default.find).mockReturnValue(mockFindChain);
            vitest_1.vi.mocked(Issue_1.default.countDocuments).mockResolvedValue(1);
            const result = await issueRepo.findAll({ category: 'pothole' }, { limit: 1, sort: 'priority' });
            (0, vitest_1.expect)(result.issues).toHaveLength(1);
            (0, vitest_1.expect)(result.total).toBe(1);
            (0, vitest_1.expect)(result.nextCursor).toBeDefined();
            const decodedCursor = Buffer.from(result.nextCursor, 'base64').toString('ascii');
            (0, vitest_1.expect)(decodedCursor).toBe(`80_${mockIssueId.toString()}`);
        });
    });
});

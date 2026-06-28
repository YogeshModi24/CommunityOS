"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Issue_1 = __importDefault(require("../mongodb/models/Issue"));
const User_1 = __importDefault(require("../mongodb/models/User"));
const MongoIssueRepository_1 = require("../mongodb/MongoIssueRepository");
const MongoUserRepository_1 = require("../mongodb/MongoUserRepository");
vitest_1.vi.mock('../mongodb/models/User', () => {
    return {
        default: {
            findById: vitest_1.vi.fn(),
            findOne: vitest_1.vi.fn(),
            find: vitest_1.vi.fn(),
            findByIdAndUpdate: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            deleteMany: vitest_1.vi.fn(),
        },
    };
});
vitest_1.vi.mock('../mongodb/models/Issue', () => {
    return {
        default: {
            findById: vitest_1.vi.fn(),
            findByIdAndUpdate: vitest_1.vi.fn(),
            find: vitest_1.vi.fn(),
            create: vitest_1.vi.fn(),
            countDocuments: vitest_1.vi.fn(),
            deleteMany: vitest_1.vi.fn(),
        },
    };
});
(0, vitest_1.describe)('MongoUserRepository', () => {
    let userRepo;
    (0, vitest_1.beforeEach)(() => {
        userRepo = new MongoUserRepository_1.MongoUserRepository();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should find user by id and map properly', async () => {
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
        vitest_1.vi.mocked(User_1.default.findById).mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(mockUserDoc),
        });
        const result = await userRepo.findById('507f1f77bcf86cd799439011');
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result?.id).toBe('507f1f77bcf86cd799439011');
        (0, vitest_1.expect)(result?.name).toBe('Rahul Sharma');
        (0, vitest_1.expect)(result?.role).toBe('citizen');
    });
    (0, vitest_1.it)('should return null when user is not found', async () => {
        vitest_1.vi.mocked(User_1.default.findById).mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(null),
        });
        const result = await userRepo.findById('507f1f77bcf86cd799439012');
        (0, vitest_1.expect)(result).toBeNull();
    });
});
(0, vitest_1.describe)('MongoIssueRepository', () => {
    let issueRepo;
    (0, vitest_1.beforeEach)(() => {
        issueRepo = new MongoIssueRepository_1.MongoIssueRepository();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should list issues with filters and pagination', async () => {
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
            sort: vitest_1.vi.fn().mockReturnThis(),
            skip: vitest_1.vi.fn().mockReturnThis(),
            limit: vitest_1.vi.fn().mockReturnThis(),
            populate: vitest_1.vi.fn().mockReturnThis(),
            lean: vitest_1.vi.fn().mockResolvedValue([mockIssueDoc]),
        };
        vitest_1.vi.mocked(Issue_1.default.find).mockReturnValue(mockFindChain);
        vitest_1.vi.mocked(Issue_1.default.countDocuments).mockResolvedValue(1);
        const result = await issueRepo.findAll({ category: 'water_leak' }, { skip: 0, limit: 10 });
        (0, vitest_1.expect)(result.issues).toHaveLength(1);
        (0, vitest_1.expect)(result.total).toBe(1);
        (0, vitest_1.expect)(result.issues[0].id).toBe('607f1f77bcf86cd799439022');
        (0, vitest_1.expect)(typeof result.issues[0].reporter_id).toBe('object');
    });
});

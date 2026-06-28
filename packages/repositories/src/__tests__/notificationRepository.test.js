"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const Notification_1 = __importDefault(require("../mongodb/models/Notification"));
const MongoNotificationRepository_1 = require("../mongodb/MongoNotificationRepository");
vitest_1.vi.mock('../mongodb/models/Notification', () => {
    return {
        default: {
            create: vitest_1.vi.fn(),
            findById: vitest_1.vi.fn(),
            find: vitest_1.vi.fn(),
            findByIdAndUpdate: vitest_1.vi.fn(),
            updateMany: vitest_1.vi.fn(),
            deleteOne: vitest_1.vi.fn(),
            deleteMany: vitest_1.vi.fn(),
            countDocuments: vitest_1.vi.fn(),
        },
    };
});
(0, vitest_1.describe)('MongoNotificationRepository', () => {
    let notificationRepo;
    (0, vitest_1.beforeEach)(() => {
        notificationRepo = new MongoNotificationRepository_1.MongoNotificationRepository();
        vitest_1.vi.clearAllMocks();
    });
    (0, vitest_1.it)('should create notification and map correctly', async () => {
        const mockDoc = {
            _id: '60d5ec49f1b2c71048888888',
            userId: '60d5ec49f1b2c71048888888',
            title: 'Alert',
            message: 'New message',
            type: 'system',
            read: false,
            createdAt: new Date(),
        };
        vitest_1.vi.mocked(Notification_1.default.create).mockResolvedValue(mockDoc);
        const result = await notificationRepo.create({
            userId: '60d5ec49f1b2c71048888888',
            title: 'Alert',
            message: 'New message',
            type: 'system',
            read: false,
        });
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.id).toBe('60d5ec49f1b2c71048888888');
        (0, vitest_1.expect)(result.title).toBe('Alert');
        (0, vitest_1.expect)(result.read).toBe(false);
    });
    (0, vitest_1.it)('should find unread notifications', async () => {
        const mockDocs = [
            {
                _id: '60d5ec49f1b2c71048888888',
                userId: '60d5ec49f1b2c71048888888',
                title: 'A',
                message: 'M',
                type: 'system',
                read: false,
            },
        ];
        vitest_1.vi.mocked(Notification_1.default.find).mockReturnValue({
            sort: vitest_1.vi.fn().mockReturnValue({
                lean: vitest_1.vi.fn().mockResolvedValue(mockDocs),
            }),
        });
        const result = await notificationRepo.findUnread('60d5ec49f1b2c71048888888');
        (0, vitest_1.expect)(result.length).toBe(1);
        (0, vitest_1.expect)(result[0].id).toBe('60d5ec49f1b2c71048888888');
    });
    (0, vitest_1.it)('should count unread notifications', async () => {
        vitest_1.vi.mocked(Notification_1.default.countDocuments).mockResolvedValue(3);
        const result = await notificationRepo.countUnread('60d5ec49f1b2c71048888888');
        (0, vitest_1.expect)(result).toBe(3);
    });
    (0, vitest_1.it)('should mark notification read', async () => {
        const mockDoc = {
            _id: '60d5ec49f1b2c71048888888',
            userId: '60d5ec49f1b2c71048888888',
            title: 'Alert',
            message: 'New message',
            type: 'system',
            read: true,
            createdAt: new Date(),
        };
        vitest_1.vi.mocked(Notification_1.default.findByIdAndUpdate).mockReturnValue({
            lean: vitest_1.vi.fn().mockResolvedValue(mockDoc),
        });
        const result = await notificationRepo.markRead('60d5ec49f1b2c71048888888');
        (0, vitest_1.expect)(result).not.toBeNull();
        (0, vitest_1.expect)(result.read).toBe(true);
    });
    (0, vitest_1.it)('should mark all notifications read', async () => {
        await notificationRepo.markAllRead('60d5ec49f1b2c71048888888');
        (0, vitest_1.expect)(Notification_1.default.updateMany).toHaveBeenCalled();
    });
    (0, vitest_1.it)('should delete expired notifications', async () => {
        vitest_1.vi.mocked(Notification_1.default.deleteMany).mockResolvedValue({ deletedCount: 5 });
        const count = await notificationRepo.deleteExpired(10000);
        (0, vitest_1.expect)(count).toBe(5);
    });
});

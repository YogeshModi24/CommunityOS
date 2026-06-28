"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoNotificationRepository = void 0;
const mongoose_1 = require("mongoose");
const mappers_1 = require("./mappers");
const Notification_1 = __importDefault(require("./models/Notification"));
class MongoNotificationRepository {
    async create(notification) {
        const doc = await Notification_1.default.create({
            userId: new mongoose_1.Types.ObjectId(notification.userId),
            title: notification.title,
            message: notification.message,
            type: notification.type,
            issueId: notification.issueId ? new mongoose_1.Types.ObjectId(notification.issueId) : undefined,
            metadata: notification.metadata,
            read: notification.read,
            readAt: notification.readAt,
        });
        return (0, mappers_1.mapMongoNotification)(doc);
    }
    async findById(id) {
        try {
            const doc = await Notification_1.default.findById(id).lean();
            return doc ? (0, mappers_1.mapMongoNotification)(doc) : null;
        }
        catch {
            return null;
        }
    }
    async findByUser(userId, options) {
        const limit = options?.limit ?? 10;
        const page = options?.page ?? 1;
        const skip = (page - 1) * limit;
        const query = { userId: new mongoose_1.Types.ObjectId(userId) };
        const docs = await Notification_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const total = await Notification_1.default.countDocuments(query);
        return {
            notifications: docs.map(mappers_1.mapMongoNotification),
            total,
        };
    }
    async findUnread(userId) {
        const docs = await Notification_1.default.find({
            userId: new mongoose_1.Types.ObjectId(userId),
            read: false,
        })
            .sort({ createdAt: -1 })
            .lean();
        return docs.map(mappers_1.mapMongoNotification);
    }
    async markRead(id) {
        try {
            const doc = await Notification_1.default.findByIdAndUpdate(id, { $set: { read: true, readAt: new Date() } }, { new: true }).lean();
            return doc ? (0, mappers_1.mapMongoNotification)(doc) : null;
        }
        catch {
            return null;
        }
    }
    async markAllRead(userId) {
        await Notification_1.default.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), read: false }, { $set: { read: true, readAt: new Date() } });
    }
    async delete(id) {
        try {
            const res = await Notification_1.default.deleteOne({ _id: new mongoose_1.Types.ObjectId(id) });
            return res.deletedCount > 0;
        }
        catch {
            return false;
        }
    }
    async deleteExpired(ttlMs) {
        const cutoff = new Date(Date.now() - ttlMs);
        const res = await Notification_1.default.deleteMany({
            createdAt: { $lt: cutoff },
        });
        return res.deletedCount ?? 0;
    }
    async countUnread(userId) {
        return await Notification_1.default.countDocuments({
            userId: new mongoose_1.Types.ObjectId(userId),
            read: false,
        });
    }
}
exports.MongoNotificationRepository = MongoNotificationRepository;

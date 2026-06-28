"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: [
            'nearby_issue',
            'ai_completed',
            'status_changed',
            'resolved',
            'assignment',
            'promotion',
            'system',
        ],
        required: true,
    },
    issueId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Issue' },
    metadata: { type: mongoose_1.Schema.Types.Map, of: mongoose_1.Schema.Types.Mixed },
    read: { type: Boolean, default: false, required: true },
    readAt: Date,
}, { timestamps: { createdAt: true, updatedAt: false } });
// Indexes for high performance
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ userId: 1, createdAt: -1 });
exports.default = (0, mongoose_1.model)('Notification', NotificationSchema);

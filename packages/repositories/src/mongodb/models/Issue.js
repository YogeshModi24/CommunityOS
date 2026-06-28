"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IssueSchema = new mongoose_1.Schema({
    title: { type: String, required: true, maxlength: 100, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
        type: String,
        enum: ['pothole', 'water_leak', 'streetlight', 'garbage', 'encroachment', 'sewage', 'other'],
        required: true,
    },
    severity: { type: Number, min: 1, max: 5, required: true },
    status: {
        type: String,
        enum: ['open', 'verified', 'in_progress', 'resolved'],
        default: 'open',
    },
    ai_status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        required: true,
    },
    priority_score: { type: Number, default: 0 },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    address: { type: String, trim: true },
    ward: { type: String, trim: true },
    media: [
        {
            url: { type: String, required: true },
            originalUrl: { type: String, required: true },
            optimizedUrl: { type: String, required: true },
            thumbnailUrl: { type: String, required: true },
            public_id: { type: String, required: true },
        },
    ],
    ai_category: String,
    ai_confidence: Number,
    ai_description: String,
    hazardous: { type: Boolean, default: false },
    ai_analysis: {
        category: String,
        severity: Number,
        description: String,
        hazardous: Boolean,
        confidence: Number,
        aiVersion: String,
        modelName: String,
        promptVersion: String,
        processedAt: Date,
    },
    votes: { type: Number, default: 0 },
    voter_ids: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    reporter_id: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status_history: [
        {
            status: String,
            note: String,
            timestamp: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
IssueSchema.index({ location: '2dsphere' });
IssueSchema.index({ status: 1, priority_score: -1 });
IssueSchema.index({ reporter_id: 1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ category: 1 });
IssueSchema.index({ priority_score: -1 });
exports.default = (0, mongoose_1.model)('Issue', IssueSchema);

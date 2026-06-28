"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listIssuesQuerySchema = exports.getNearbyIssuesSchema = exports.updateIssueStatusSchema = exports.createIssueSchema = void 0;
const zod_1 = require("zod");
exports.createIssueSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .min(1, 'Title is required')
        .max(100, 'Title cannot exceed 100 characters')
        .trim(),
    description: zod_1.z.string().min(1, 'Description is required').trim(),
    category: zod_1.z.enum([
        'pothole',
        'water_leak',
        'streetlight',
        'garbage',
        'encroachment',
        'sewage',
        'other',
    ]),
    severity: zod_1.z.coerce.number().int().min(1).max(5),
    address: zod_1.z.string().min(1, 'Address is required').trim(),
    ward: zod_1.z.string().min(1, 'Ward is required').trim(),
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    mediaUrl: zod_1.z.string().url('Invalid media URL'),
    mediaPublicId: zod_1.z.string().optional().default(''),
    mediaOriginalUrl: zod_1.z.string().url().optional(),
    mediaOptimizedUrl: zod_1.z.string().url().optional(),
    mediaThumbnailUrl: zod_1.z.string().url().optional(),
});
exports.updateIssueStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['open', 'verified', 'in_progress', 'resolved']),
    note: zod_1.z.string().optional().default(''),
});
exports.getNearbyIssuesSchema = zod_1.z.object({
    lat: zod_1.z.coerce.number().min(-90).max(90),
    lng: zod_1.z.coerce.number().min(-180).max(180),
    radius: zod_1.z.coerce.number().positive().optional(),
});
exports.listIssuesQuerySchema = zod_1.z.object({
    category: zod_1.z.string().optional(),
    status: zod_1.z.string().optional(),
    ward: zod_1.z.string().optional(),
    severity: zod_1.z.coerce.number().int().min(1).max(5).optional(),
    reporterId: zod_1.z.string().optional(),
    lat: zod_1.z.coerce.number().min(-90).max(90).optional(),
    lng: zod_1.z.coerce.number().min(-180).max(180).optional(),
    distance: zod_1.z.coerce.number().positive().optional(),
    cursor: zod_1.z.string().optional(),
    sort: zod_1.z.enum(['latest', 'votes', 'priority']).optional().default('priority'),
    page: zod_1.z.coerce.number().int().positive().optional().default(1),
    limit: zod_1.z.coerce.number().int().positive().optional().default(10),
});

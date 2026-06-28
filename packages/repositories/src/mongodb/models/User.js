"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: {
        type: String,
        enum: ['citizen', 'authority', 'municipality', 'admin'],
        default: 'citizen',
    },
    ward: String,
    points: { type: Number, default: 0 },
    issues_reported: { type: Number, default: 0 },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)('User', UserSchema);

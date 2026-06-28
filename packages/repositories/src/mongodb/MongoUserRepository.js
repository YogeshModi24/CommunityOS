"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoUserRepository = void 0;
const mongoose_1 = require("mongoose");
const mappers_1 = require("./mappers");
const User_1 = __importDefault(require("./models/User"));
class MongoUserRepository {
    async findById(id) {
        const doc = await User_1.default.findById(id).lean();
        return doc ? (0, mappers_1.mapMongoUser)(doc) : null;
    }
    async findByEmail(email) {
        const doc = await User_1.default.findOne({ email }).lean();
        return doc ? (0, mappers_1.mapMongoUser)(doc) : null;
    }
    async findByEmailWithPassword(email) {
        const doc = await User_1.default.findOne({ email }).select('+password').lean();
        return doc ? (0, mappers_1.mapMongoUser)(doc) : null;
    }
    async getLeaderboard(limit) {
        const docs = await User_1.default.find()
            .sort({ points: -1 })
            .limit(limit)
            .select('name email ward points issues_reported')
            .lean();
        return docs.map(mappers_1.mapMongoUser);
    }
    async incrementPointsAndIssues(id, points, issuesCount) {
        const doc = await User_1.default.findByIdAndUpdate(id, { $inc: { points, issues_reported: issuesCount } }, { new: true }).lean();
        return doc ? (0, mappers_1.mapMongoUser)(doc) : null;
    }
    async create(user) {
        const doc = await User_1.default.create(user);
        return (0, mappers_1.mapMongoUser)(doc.toObject());
    }
    async getDashboardProjection(userId) {
        const pipeline = [
            {
                $facet: {
                    userProfile: [
                        { $match: { _id: new mongoose_1.Types.ObjectId(userId) } },
                        {
                            $lookup: {
                                from: 'issues',
                                localField: '_id',
                                foreignField: 'reporter_id',
                                as: 'userIssues',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                role: 1,
                                ward: 1,
                                points: 1,
                                issues_reported: 1,
                                totalReports: { $size: '$userIssues' },
                                resolvedReports: {
                                    $size: {
                                        $filter: {
                                            input: '$userIssues',
                                            as: 'issue',
                                            cond: { $eq: ['$$issue.status', 'resolved'] },
                                        },
                                    },
                                },
                                pendingReports: {
                                    $size: {
                                        $filter: {
                                            input: '$userIssues',
                                            as: 'issue',
                                            cond: { $ne: ['$$issue.status', 'resolved'] },
                                        },
                                    },
                                },
                                recentActivity: {
                                    $slice: [
                                        {
                                            $sortArray: {
                                                input: '$userIssues',
                                                sortBy: { createdAt: -1 },
                                            },
                                        },
                                        5,
                                    ],
                                },
                            },
                        },
                    ],
                    leaderboard: [
                        { $sort: { points: -1 } },
                        { $limit: 10 },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                email: 1,
                                ward: 1,
                                points: 1,
                                issues_reported: 1,
                            },
                        },
                    ],
                },
            },
        ];
        const results = await User_1.default.aggregate(pipeline);
        if (!results || results.length === 0) {
            return null;
        }
        const { userProfile, leaderboard } = results[0];
        if (!userProfile || userProfile.length === 0) {
            return null;
        }
        const result = userProfile[0];
        return {
            userId: result._id.toString(),
            name: result.name,
            email: result.email,
            role: result.role,
            ward: result.ward,
            points: result.points ?? 0,
            issues_reported: result.issues_reported ?? 0,
            totalReports: result.totalReports ?? 0,
            resolvedReports: result.resolvedReports ?? 0,
            pendingReports: result.pendingReports ?? 0,
            recentActivity: (result.recentActivity || []).map((issue) => ({
                id: issue._id.toString(),
                title: issue.title,
                status: issue.status,
                category: issue.category,
                severity: issue.severity,
                address: issue.address,
                votes: issue.votes ?? 0,
                createdAt: issue.createdAt,
            })),
            leaderboard: (leaderboard || []).map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                ward: user.ward,
                points: user.points ?? 0,
                issues_reported: user.issues_reported ?? 0,
            })),
        };
    }
    async findByWard(ward) {
        const docs = await User_1.default.find({ ward }).lean();
        return docs.map(mappers_1.mapMongoUser);
    }
    async deleteAll() {
        await User_1.default.deleteMany({});
    }
}
exports.MongoUserRepository = MongoUserRepository;

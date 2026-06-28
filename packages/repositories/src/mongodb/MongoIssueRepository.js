"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoIssueRepository = void 0;
const mongoose_1 = require("mongoose");
const mappers_1 = require("./mappers");
const Issue_1 = __importDefault(require("./models/Issue"));
class MongoIssueRepository {
    async findById(id) {
        const doc = await Issue_1.default.findById(id).populate('reporter_id', 'name points ward').lean();
        return doc ? (0, mappers_1.mapMongoIssue)(doc) : null;
    }
    async create(issueData) {
        const doc = await Issue_1.default.create({
            title: issueData.title,
            description: issueData.description,
            category: issueData.category,
            severity: Number(issueData.severity),
            address: issueData.address,
            ward: issueData.ward,
            location: {
                type: 'Point',
                coordinates: [Number(issueData.lng), Number(issueData.lat)],
            },
            media: [
                {
                    url: issueData.mediaUrl,
                    originalUrl: issueData.mediaOriginalUrl ?? issueData.mediaUrl,
                    optimizedUrl: issueData.mediaOptimizedUrl ?? issueData.mediaUrl,
                    thumbnailUrl: issueData.mediaThumbnailUrl ?? issueData.mediaUrl,
                    public_id: issueData.mediaPublicId ?? '',
                },
            ],
            reporter_id: issueData.reporterId,
            status: issueData.status ?? 'open',
            ai_status: issueData.ai_status ?? 'pending',
            votes: issueData.votes ?? 0,
            priority_score: issueData.priority_score ?? 0,
            ai_category: issueData.ai_category,
            ai_confidence: issueData.ai_confidence,
            ai_description: issueData.ai_description,
            hazardous: issueData.hazardous ?? false,
            ai_analysis: issueData.ai_analysis,
            status_history: issueData.status_history ?? [
                { status: 'open', note: 'Issue reported', timestamp: new Date() },
            ],
            createdAt: issueData.createdAt ?? new Date(),
        });
        return (0, mappers_1.mapMongoIssue)(doc.toObject());
    }
    async update(id, updateData) {
        const updatePayload = { ...updateData };
        if (updateData.location) {
            updatePayload.location = {
                type: 'Point',
                coordinates: [updateData.location.coordinates[0], updateData.location.coordinates[1]],
            };
        }
        const doc = await Issue_1.default.findByIdAndUpdate(id, updatePayload, { new: true })
            .populate('reporter_id', 'name points ward')
            .lean();
        return doc ? (0, mappers_1.mapMongoIssue)(doc) : null;
    }
    async updateStatus(id, status, note) {
        const doc = await Issue_1.default.findByIdAndUpdate(id, {
            status,
            $push: {
                status_history: { status, note: note ?? '', timestamp: new Date() },
            },
        }, { new: true })
            .populate('reporter_id', 'name points ward')
            .lean();
        return doc ? (0, mappers_1.mapMongoIssue)(doc) : null;
    }
    async toggleVote(id, userId) {
        const issue = await Issue_1.default.findById(id);
        if (!issue)
            return null;
        const voterIdStrs = issue.voter_ids.map((v) => v.toString());
        const hasVoted = voterIdStrs.includes(userId);
        if (hasVoted) {
            issue.voter_ids = issue.voter_ids.filter((v) => v.toString() !== userId);
            issue.votes = Math.max(0, issue.votes - 1);
        }
        else {
            issue.voter_ids.push(userId);
            issue.votes += 1;
        }
        const age_score = Math.min((Date.now() - issue.createdAt.getTime()) / (30 * 86_400_000), 1);
        const vote_score = Math.min(issue.votes / 50, 1);
        issue.priority_score =
            ((issue.severity / 5) * 0.4 +
                vote_score * 0.3 +
                age_score * 0.2 +
                (issue.hazardous ? 1 : 0) * 0.1) *
                100;
        await issue.save();
        return {
            votes: issue.votes,
            priority_score: issue.priority_score,
            hasVoted: !hasVoted,
        };
    }
    async findNearby(lng, lat, maxDistance, limit) {
        const docs = await Issue_1.default.find({
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: maxDistance,
                },
            },
        })
            .limit(limit)
            .populate('reporter_id', 'name')
            .lean();
        return docs.map(mappers_1.mapMongoIssue);
    }
    async findAll(filter, pagination) {
        const query = {};
        if (filter.category && filter.category !== 'all')
            query.category = filter.category;
        if (filter.status)
            query.status = filter.status;
        if (filter.ward)
            query.ward = filter.ward;
        if (filter.severity)
            query.severity = Number(filter.severity);
        if (filter.reporterId)
            query.reporter_id = new mongoose_1.Types.ObjectId(filter.reporterId);
        if (filter.location) {
            query.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [Number(filter.location.lng), Number(filter.location.lat)],
                    },
                    $maxDistance: Number(filter.location.radius),
                },
            };
        }
        const sortField = pagination.sort ?? 'priority';
        const limit = pagination.limit ?? 10;
        let sortQuery = {};
        if (sortField === 'latest') {
            sortQuery = { createdAt: -1, _id: -1 };
        }
        else if (sortField === 'votes') {
            sortQuery = { votes: -1, _id: -1 };
        }
        else {
            sortQuery = { priority_score: -1, _id: -1 };
        }
        if (pagination.cursor) {
            try {
                const decoded = Buffer.from(pagination.cursor, 'base64').toString('ascii');
                const [valStr, idStr] = decoded.split('_');
                const val = Number(valStr);
                const objectId = new mongoose_1.Types.ObjectId(idStr);
                if (sortField === 'latest') {
                    query.$or = [
                        { createdAt: { $lt: new Date(val) } },
                        { createdAt: new Date(val), _id: { $lt: objectId } },
                    ];
                }
                else if (sortField === 'votes') {
                    query.$or = [{ votes: { $lt: val } }, { votes: val, _id: { $lt: objectId } }];
                }
                else {
                    query.$or = [
                        { priority_score: { $lt: val } },
                        { priority_score: val, _id: { $lt: objectId } },
                    ];
                }
            }
            catch (err) {
                // ignore invalid cursor
            }
        }
        let q = Issue_1.default.find(query).sort(sortQuery);
        if (!pagination.cursor && pagination.skip !== undefined) {
            q = q.skip(pagination.skip);
        }
        const docs = await q.limit(limit).populate('reporter_id', 'name points ward').lean();
        const issues = docs.map(mappers_1.mapMongoIssue);
        const total = await Issue_1.default.countDocuments(query);
        let nextCursor = undefined;
        if (issues.length === limit && issues.length > 0) {
            const lastIssue = issues[issues.length - 1];
            let val;
            if (sortField === 'latest') {
                val = lastIssue.createdAt.getTime();
            }
            else if (sortField === 'votes') {
                val = lastIssue.votes;
            }
            else {
                val = lastIssue.priority_score;
            }
            const rawCursor = `${val}_${lastIssue.id}`;
            nextCursor = Buffer.from(rawCursor).toString('base64');
        }
        return {
            issues,
            total,
            nextCursor,
        };
    }
    async getUserStats(reporterId) {
        const total = await Issue_1.default.countDocuments({
            reporter_id: new mongoose_1.Types.ObjectId(reporterId),
        });
        const resolved = await Issue_1.default.countDocuments({
            reporter_id: new mongoose_1.Types.ObjectId(reporterId),
            status: 'resolved',
        });
        const pending = total - resolved;
        return { total, resolved, pending };
    }
    async deleteAll() {
        await Issue_1.default.deleteMany({});
    }
}
exports.MongoIssueRepository = MongoIssueRepository;

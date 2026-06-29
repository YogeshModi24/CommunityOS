import { CreateIssueDTO, Issue } from '@community-os/types';
import { Types } from 'mongoose';

import { IIssueRepository } from '../interfaces/IIssueRepository';
import { mapMongoIssue } from './mappers';
import IssueMongoose from './models/Issue';

export class MongoIssueRepository implements IIssueRepository {
  async findById(id: string): Promise<Issue | null> {
    const doc = await IssueMongoose.findById(id).populate('reporter_id', 'name points ward').lean();
    return doc ? mapMongoIssue(doc) : null;
  }

  async create(issueData: CreateIssueDTO): Promise<Issue> {
    const doc = await IssueMongoose.create({
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
    return mapMongoIssue(doc.toObject());
  }

  async update(id: string, updateData: Partial<Issue>): Promise<Issue | null> {
    const updatePayload: any = { ...updateData };
    if (updateData.location) {
      updatePayload.location = {
        type: 'Point',
        coordinates: [updateData.location.coordinates[0], updateData.location.coordinates[1]],
      };
    }
    const doc = await IssueMongoose.findByIdAndUpdate(id, updatePayload, { new: true })
      .populate('reporter_id', 'name points ward')
      .lean();
    return doc ? mapMongoIssue(doc) : null;
  }

  async updateStatus(id: string, status: string, note?: string): Promise<Issue | null> {
    const doc = await IssueMongoose.findByIdAndUpdate(
      id,
      {
        status,
        $push: {
          status_history: { status, note: note ?? '', timestamp: new Date() },
        },
      },
      { new: true }
    )
      .populate('reporter_id', 'name points ward')
      .lean();
    return doc ? mapMongoIssue(doc) : null;
  }

  async toggleVote(
    id: string,
    userId: string
  ): Promise<{ votes: number; priority_score: number; hasVoted: boolean } | null> {
    const issue = await IssueMongoose.findById(id);
    if (!issue) return null;

    const voterIdStrs = issue.voter_ids.map((v) => v.toString());
    const hasVoted = voterIdStrs.includes(userId);

    if (hasVoted) {
      issue.voter_ids = issue.voter_ids.filter((v) => v.toString() !== userId) as any;
      issue.votes = Math.max(0, issue.votes - 1);
    } else {
      issue.voter_ids.push(userId as any);
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

  async findNearby(lng: number, lat: number, maxDistance: number, limit: number): Promise<Issue[]> {
    const docs = await IssueMongoose.find({
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
    return docs.map(mapMongoIssue);
  }

  async findAll(
    filter: {
      category?: string;
      status?: string;
      ward?: string;
      department?: string;
      severity?: number;
      reporterId?: string;
      location?: {
        lat: number;
        lng: number;
        radius: number;
      };
    },
    pagination: {
      skip?: number;
      limit?: number;
      cursor?: string;
      sort?: 'latest' | 'votes' | 'priority';
    }
  ): Promise<{ issues: Issue[]; total: number; nextCursor?: string }> {
    const query: any = {};
    if (filter.category && filter.category !== 'all') query.category = filter.category;
    if (filter.status) query.status = filter.status;
    if (filter.ward) query.ward = filter.ward;
    if (filter.department) query.department = filter.department;
    if (filter.severity) query.severity = Number(filter.severity);
    if (filter.reporterId) query.reporter_id = new Types.ObjectId(filter.reporterId);

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

    let sortQuery: any = {};
    if (sortField === 'latest') {
      sortQuery = { createdAt: -1, _id: -1 };
    } else if (sortField === 'votes') {
      sortQuery = { votes: -1, _id: -1 };
    } else {
      sortQuery = { priority_score: -1, _id: -1 };
    }

    if (pagination.cursor) {
      try {
        const decoded = Buffer.from(pagination.cursor, 'base64').toString('ascii');
        const [valStr, idStr] = decoded.split('_');
        const val = Number(valStr);
        const objectId = new Types.ObjectId(idStr);

        if (sortField === 'latest') {
          query.$or = [
            { createdAt: { $lt: new Date(val) } },
            { createdAt: new Date(val), _id: { $lt: objectId } },
          ];
        } else if (sortField === 'votes') {
          query.$or = [{ votes: { $lt: val } }, { votes: val, _id: { $lt: objectId } }];
        } else {
          query.$or = [
            { priority_score: { $lt: val } },
            { priority_score: val, _id: { $lt: objectId } },
          ];
        }
      } catch (_err) {
        // ignore invalid cursor
      }
    }

    let q = IssueMongoose.find(query).sort(sortQuery);

    if (!pagination.cursor && pagination.skip !== undefined) {
      q = q.skip(pagination.skip);
    }

    const docs = await q.limit(limit).populate('reporter_id', 'name points ward').lean();
    const issues = docs.map(mapMongoIssue);
    const total = await IssueMongoose.countDocuments(query);

    let nextCursor: string | undefined = undefined;
    if (issues.length === limit && issues.length > 0) {
      const lastIssue = issues[issues.length - 1];
      let val: number;
      if (sortField === 'latest') {
        val = lastIssue.createdAt.getTime();
      } else if (sortField === 'votes') {
        val = lastIssue.votes;
      } else {
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

  async getUserStats(
    reporterId: string
  ): Promise<{ total: number; resolved: number; pending: number }> {
    const total = await IssueMongoose.countDocuments({
      reporter_id: new Types.ObjectId(reporterId),
    });
    const resolved = await IssueMongoose.countDocuments({
      reporter_id: new Types.ObjectId(reporterId),
      status: 'resolved',
    });
    const pending = total - resolved;
    return { total, resolved, pending };
  }

  async deleteAll(): Promise<void> {
    await IssueMongoose.deleteMany({});
  }

  async getDashboardStats(): Promise<{ totalIssues: number; resolvedIssues: number; openIssues: number }> {
    const [totalStats, resolvedStats, openStats] = await Promise.all([
      IssueMongoose.countDocuments(),
      IssueMongoose.countDocuments({ status: 'resolved' }),
      IssueMongoose.countDocuments({ status: { $in: ['open', 'verified', 'in_progress'] } }),
    ]);

    return {
      totalIssues: totalStats,
      resolvedIssues: resolvedStats,
      openIssues: openStats,
    };
  }

  async getDepartmentWorkload(): Promise<{ department: string; count: number }[]> {
    const workload = await IssueMongoose.aggregate([
      { $match: { status: { $ne: 'resolved' } } },
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    return workload.map((w: any) => ({
      department: w._id || 'unassigned',
      count: w.count,
    }));
  }

  async getSlaOverview(): Promise<{ expired: number; active: number }> {
    const now = new Date();
    const stats = await IssueMongoose.aggregate([
      { $match: { status: { $ne: 'resolved' }, estimated_sla_days: { $exists: true } } },
      {
        $project: {
          sla_due_date: {
            $add: ['$createdAt', { $multiply: ['$estimated_sla_days', 24 * 60 * 60 * 1000] }],
          },
        },
      },
      {
        $project: {
          status: {
            $cond: {
              if: { $lt: ['$sla_due_date', now] },
              then: 'expired',
              else: 'active',
            },
          },
        },
      },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    let expired = 0;
    let active = 0;
    stats.forEach((s: any) => {
      if (s._id === 'expired') expired = s.count;
      if (s._id === 'active') active = s.count;
    });

    return { expired, active };
  }

  async getCategoryDistribution(): Promise<{ category: string; count: number }[]> {
    const dist = await IssueMongoose.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);
    return dist.map((d: any) => ({
      category: d._id || 'unknown',
      count: d.count,
    }));
  }

  async getCriticalIssueSummary(): Promise<{ total: number; issues: Issue[] }> {
    const docs = await IssueMongoose.find({ severity: { $gte: 4 }, status: { $ne: 'resolved' } })
      .sort({ priority_score: -1 })
      .limit(10)
      .lean();
    
    const issues = docs.map(mapMongoIssue);
    const total = await IssueMongoose.countDocuments({ severity: { $gte: 4 }, status: { $ne: 'resolved' } });
    
    return { total, issues };
  }
}

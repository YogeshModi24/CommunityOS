import { User } from '@community-os/types';
import { Types } from 'mongoose';

import { IUserRepository } from '../interfaces/IUserRepository';
import { mapMongoUser } from './mappers';
import UserMongoose from './models/User';

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const doc = await UserMongoose.findById(id).lean();
    return doc ? mapMongoUser(doc) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await UserMongoose.findOne({ email }).lean();
    return doc ? mapMongoUser(doc) : null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const doc = await UserMongoose.findOne({ email }).select('+password').lean();
    return doc ? mapMongoUser(doc) : null;
  }

  async getLeaderboard(limit: number): Promise<User[]> {
    const docs = await UserMongoose.find()
      .sort({ points: -1 })
      .limit(limit)
      .select('name email ward points issues_reported')
      .lean();
    return docs.map(mapMongoUser);
  }

  async incrementPointsAndIssues(
    id: string,
    points: number,
    issuesCount: number
  ): Promise<User | null> {
    const doc = await UserMongoose.findByIdAndUpdate(
      id,
      { $inc: { points, issues_reported: issuesCount } },
      { new: true }
    ).lean();
    return doc ? mapMongoUser(doc) : null;
  }

  async create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const doc = await UserMongoose.create(user);
    return mapMongoUser(doc.toObject());
  }

  async getDashboardProjection(userId: string): Promise<any> {
    const pipeline = [
      {
        $facet: {
          userProfile: [
            { $match: { _id: new Types.ObjectId(userId) } },
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
                        sortBy: { createdAt: -1 as const },
                      },
                    },
                    5,
                  ],
                },
              },
            },
          ],
          leaderboard: [
            { $sort: { points: -1 as const } },
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

    const results = await UserMongoose.aggregate(pipeline);
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
      recentActivity: (result.recentActivity || []).map((issue: any) => ({
        id: issue._id.toString(),
        title: issue.title,
        status: issue.status,
        category: issue.category,
        severity: issue.severity,
        address: issue.address,
        votes: issue.votes ?? 0,
        createdAt: issue.createdAt,
      })),
      leaderboard: (leaderboard || []).map((user: any) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        ward: user.ward,
        points: user.points ?? 0,
        issues_reported: user.issues_reported ?? 0,
      })),
    };
  }

  async findByWard(ward: string): Promise<User[]> {
    const docs = await UserMongoose.find({ ward }).lean();
    return docs.map(mapMongoUser);
  }

  async deleteAll(): Promise<void> {
    await UserMongoose.deleteMany({});
  }
}

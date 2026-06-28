import { User } from '@community-os/types';
import { IUserRepository } from '../interfaces/IUserRepository';
export declare class MongoUserRepository implements IUserRepository {
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findByEmailWithPassword(email: string): Promise<User | null>;
    getLeaderboard(limit: number): Promise<User[]>;
    incrementPointsAndIssues(id: string, points: number, issuesCount: number): Promise<User | null>;
    create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    getDashboardProjection(userId: string): Promise<any>;
    findByWard(ward: string): Promise<User[]>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=MongoUserRepository.d.ts.map
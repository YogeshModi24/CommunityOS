/**
 * Domain Events Placeholders.
 * Reserved for future Event-Driven Architecture (EDA) implementation.
 */
export interface DomainEvent {
    eventId: string;
    occurredAt: Date;
    aggregateId: string;
    name: string;
    payload: any;
}
export interface IssueCreated extends DomainEvent {
    name: 'IssueCreated';
    payload: {
        issueId: string;
        reporterId: string;
        category: string;
    };
}
export interface IssueUpdated extends DomainEvent {
    name: 'IssueUpdated';
    payload: {
        issueId: string;
        changes: Record<string, any>;
    };
}
export interface IssueResolved extends DomainEvent {
    name: 'IssueResolved';
    payload: {
        issueId: string;
        resolverId?: string;
        resolutionNote?: string;
    };
}
export interface VoteAdded extends DomainEvent {
    name: 'VoteAdded';
    payload: {
        issueId: string;
        userId: string;
    };
}
export interface VoteRemoved extends DomainEvent {
    name: 'VoteRemoved';
    payload: {
        issueId: string;
        userId: string;
    };
}
export interface IssueAnalyzed extends DomainEvent {
    name: 'IssueAnalyzed';
    payload: {
        issueId: string;
        category: string;
        severity: number;
        hazardous: boolean;
        confidence: number;
        department: string;
        estimated_sla_days: number;
        aiVersion: string;
        modelName: string;
        promptVersion: string;
        processedAt: Date;
    };
}
export interface IssuePriorityUpdated extends DomainEvent {
    name: 'IssuePriorityUpdated';
    payload: {
        issueId: string;
        priorityScore: number;
    };
}
export interface UserLoggedIn extends DomainEvent {
    name: 'UserLoggedIn';
    payload: {
        userId: string;
        timestamp: Date;
    };
}
export interface NotificationCreated extends DomainEvent {
    name: 'NotificationCreated';
    payload: {
        notificationId: string;
        userId: string;
        title: string;
        message: string;
        type: string;
        issueId?: string;
    };
}
export interface NotificationRead extends DomainEvent {
    name: 'NotificationRead';
    payload: {
        notificationId: string;
        userId: string;
    };
}
export interface NotificationDeleted extends DomainEvent {
    name: 'NotificationDeleted';
    payload: {
        notificationId: string;
        userId: string;
    };
}
//# sourceMappingURL=index.d.ts.map
export interface DomainEvent<T = any> {
  type: string;
  payload: T;
  occurredAt: Date;
}

export interface IssueCreatedV1Payload {
  issueId: string;
  reporterId: string;
  category: string;
  title: string;
  ward?: string;
  location?: { type: 'Point'; coordinates: [number, number] };
  createdAt: Date;
}

export interface IssueUpdatedV1Payload {
  issueId: string;
  status?: string;
  priority_score?: number;
  department?: string;
  estimated_sla_days?: number;
  updatedAt: Date;
}

export interface IssuePriorityUpdatedV1Payload {
  issueId: string;
  priorityScore: number;
}

export interface IssueResolvedV1Payload {
  issueId: string;
  resolutionNote: string;
  resolvedAt: Date;
}

export interface VoteAddedV1Payload {
  issueId: string;
  voterId: string;
  newVoteCount: number;
  newPriorityScore: number;
}

export interface VoteRemovedV1Payload {
  issueId: string;
  voterId: string;
  newVoteCount: number;
  newPriorityScore: number;
}

export interface IssueAnalyzedV1Payload {
  issueId: string;
  category: string;
  severity: number;
  confidence: number;
  hazardous: boolean;
  department: string;
  estimated_sla_days: number;
  analysisProcessedAt: Date;
}

export interface NotificationCreatedV1Payload {
  notificationId: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  issueId?: string;
}

export interface NotificationReadV1Payload {
  notificationId: string;
  userId: string;
}

export interface NotificationDeletedV1Payload {
  notificationId: string;
  userId: string;
}

export interface DepartmentUpdatedV1Payload {
  department: string;
  workloadDelta: number;
}

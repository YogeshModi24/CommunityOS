# Domain Policies Guide

This document outlines the guidelines for creating and consuming **Domain Policies** inside **CommunityOS**.

---

## 1. Role of Policies in Domain-Driven Design

In Domain-Driven Design (DDD), **Domain Policies** represent pure, stateless business rules or equations that are too complex to exist inside a single Entity, yet do not belong to the Application Service layer (which coordinates infrastructure and database calls).

Policies are strictly:

- **Stateless**: They do not query databases, call external APIs, or manage state.
- **Pure**: Given the same inputs, they will always return the exact same outputs.
- **Persistence-Agnostic**: They have zero knowledge of MongoDB, Postgres, Prisma, or file systems.

---

## 2. Directory Structure

All domain policies are organized within:

- **Path**: `apps/api/src/domain/policies/`
- **Files**:
  - `PriorityPolicy.ts`: Equations for calculating severity-age priority score.
  - `RewardPolicy.ts`: Mapping actions to gamified contributor points/XP allocations.
  - `ModerationPolicy.ts`: Threshold checks for AI confidence and spam alerts.
  - `ResolutionPolicy.ts`: Business conditions for auto-closing or reopening reported issues.

---

## 3. Example Policy: Priority Calculation

```typescript
export class PriorityPolicy {
  static calculateScore(issue: {
    severity: number;
    votes: number;
    hazardous: boolean;
    createdAt: Date;
  }): number {
    const age_score = Math.min((Date.now() - issue.createdAt.getTime()) / (30 * 86_400_000), 1);
    const vote_score = Math.min(issue.votes / 50, 1);

    return (
      ((issue.severity / 5) * 0.4 +
        vote_score * 0.3 +
        age_score * 0.2 +
        (issue.hazardous ? 1 : 0) * 0.1) *
      100
    );
  }
}
```

---

## 4. Consumption in Services

Services delegate calculations to policies:

```typescript
import { PriorityPolicy } from '../domain/policies/PriorityPolicy';

export class VoteService implements IVoteService {
  async toggleVote(issueId: string, userId: string) {
    // ... load issue
    const priorityScore = PriorityPolicy.calculateScore({
      severity: issue.severity,
      votes: votesCount,
      hazardous: issue.hazardous,
      createdAt: issue.createdAt,
    });
    // ... update repository
  }
}
```

# Use Case Guidelines

This document outlines the architectural standard for implementing and maintaining the Use Case layer in **CommunityOS**.

---

## 1. Role of Use Cases in Clean Architecture

Use Cases represent the specific business operations (orchestrations) of the system. They act as the command executors coordinating services, repositories, policies, and notification hooks.

Key characteristics:

- **Single Responsibility**: Each Use Case is focused on one single action (e.g., `ReportIssueUseCase`).
- **Input/Output Boundaries**: They accept raw parameters (or validated DTOs) and return `Result<T, E>`.
- **Infrastructure Orchestration**: They handle system events, transaction coordination, and queue additions, keeping application services completely pure.

---

## 2. Directory Structure

All use-case classes are placed in:

- **Path**: `apps/api/src/use-cases/`
- **Files**:
  - `LoginUserUseCase.ts`
  - `ReportIssueUseCase.ts`
  - `AnalyzeIssueUseCase.ts`
  - `VoteIssueUseCase.ts`
  - `ResolveIssueUseCase.ts`

---

## 3. Template Implementation

Each Use Case follows a standardized class structure:

```typescript
import { Result } from '@community-os/utils';
import { IIssueService } from '../services/contracts/IIssueService';

export class ResolveIssueUseCase {
  constructor(private issueService: IIssueService) {}

  async execute(issueId: string, dto: UpdateIssueStatusDTO): Promise<Result<Issue, string>> {
    // 1. Perform validation checks or business checks
    // 2. Delegate data mutations to services
    const result = await this.issueService.updateStatus(issueId, dto);

    // 3. Coordinate background jobs, events, or real-time notifications here

    return result;
  }
}
```

---

## 4. Why Separating Use Cases Matters

- **Clarity**: Finding the flow for "reporting an issue" only requires reading one cohesive file (`ReportIssueUseCase.ts`) instead of searching through controller endpoints and service implementations.
- **Worker/API Consistency**: The background worker job and Express HTTP endpoints run the exact same `AnalyzeIssueUseCase`, guaranteeing that business calculations execute identically regardless of trigger source.

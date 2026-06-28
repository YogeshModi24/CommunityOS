# Event Bus Guide

This document describes the Event Bus abstraction and the domain event lifecycle in CommunityOS.

## Architectural Goal

To preserve Clean Architecture boundaries, Application Use Cases must not have direct dependencies on Socket.IO servers, message brokers, or concrete event emitter libraries. Instead, Use Cases return or publish events through a port interface, allowing the transport layer to be hot-swapped without modifying core business rules.

---

## Event Bus Interface (`IEventBus`)

The core port is defined in `apps/api/src/services/contracts/IEventBus.ts`:

```typescript
export interface IDomainEvent {
  eventId: string;
  occurredAt: Date;
  aggregateId: string;
  name: string;
  payload: any;
}

export interface IEventBus {
  publish(event: IDomainEvent): void;
  subscribe(eventName: string, handler: (event: any) => void): void;
}
```

### Implementations

1. **`EventEmitterEventBus`** (Active): Initial implementation leveraging Node's native `EventEmitter` class.
2. **Future Integrations**: Can be seamlessly swapped to Kafka, RabbitMQ, NATS, or Azure Service Bus by implementing the `IEventBus` interface and registering it in the Dependency Composition Root (`container.ts`).

---

## Supported Domain Events

| Domain Event               | Dispatched By                              | Payload Parameters                                                                                      |
| :------------------------- | :----------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| **`IssueCreated`**         | `ReportIssueUseCase`                       | `issueId`, `reporterId`, `category`                                                                     |
| **`IssueAnalyzed`**        | `AnalyzeIssueUseCase`                      | `issueId`, `category`, `severity`, `hazardous`, `confidence`, `aiVersion`, `modelName`, `promptVersion` |
| **`IssuePriorityUpdated`** | `AnalyzeIssueUseCase` / `VoteIssueUseCase` | `issueId`, `priorityScore`                                                                              |
| **`IssueResolved`**        | `ResolveIssueUseCase`                      | `issueId`, `resolverId`, `resolvedAt`                                                                   |
| **`VoteAdded`**            | `VoteIssueUseCase`                         | `issueId`, `userId`, `votesCount`                                                                       |
| **`VoteRemoved`**          | `VoteIssueUseCase`                         | `issueId`, `userId`, `votesCount`                                                                       |

---

## Socket.IO Integration (Infrastructure Mapping)

Infrastructure listeners are registered during Express bootstrap (`index.ts`). They capture domain events and broadcast updates to connected clients:

- **`IssueAnalyzed`** ──► Broadcasts `issue:new` with the complete analyzed issue payload so that the feed updates.
- **`IssuePriorityUpdated`** ──► Broadcasts `issue:voted` containing `issueId`, new votes count, and new priority score, enabling Optimistic UI synchronization.

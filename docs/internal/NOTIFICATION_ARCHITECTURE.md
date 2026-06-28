# Notification Architecture: CommunityOS Alerts Platform

This document details the architecture, data structures, and event paths of the CommunityOS notification engine.

---

## 1. Domain Object & Schema

Notifications are represented by a clean domain entity in `packages/types/src/domain/notification.ts`:

```typescript
export type NotificationType =
  | 'nearby_issue'
  | 'ai_completed'
  | 'status_changed'
  | 'resolved'
  | 'assignment'
  | 'promotion'
  | 'system';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  issueId?: string;
  metadata?: Record<string, unknown>;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
}
```

---

## 2. Hexagonal Topologies

The notification layer complies with Hexagonal / Clean Architecture boundaries:

```text
  [Event Trigger] ─────────► [EventBus (EventEmitter)]
                                   │
                                   ▼
                       [registerEventHandlers]
                                   │
                      (Resolves NotificationService)
                                   │
                                   ▼
                       [NotificationService]
                      ┌────────────┴────────────┐
                      ▼                         ▼
         [MongoNotificationRepository]     [Socket.IO Server]
                      │                         │
                      ▼                         ▼
               [(MongoDB DB)]           (Private Room: `user:id`)
```

1. **Decoupled Handlers**: Controllers never construct notifications directly. Handlers subscribe to the `EventBus` and trigger notification insertions.
2. **Persistence Boundary**: `MongoNotificationRepository` manages direct Mongoose actions, writing indices to ensure low latency under high counts.
3. **Delivery Guards**: Real-time Socket.IO broadcasts are isolated to unique private user rooms (`user:${userId}`), avoiding global event pollution.

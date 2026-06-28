# Notification Event Catalog: Triggers & Payloads

This catalog maps domain and application events to the automatic creation of persistent user notifications in CommunityOS.

---

## 1. Automated Event Flows

```text
  [Domain Event] ------------► [Event Subscriptions] ------------► [Notification Created]
  IssueCreated                 Nearby residents (same ward)       "New Issue Nearby"
  IssueAnalyzed                Reporter                           "AI Analysis Completed"
  IssueResolved                Reporter                           "Issue Resolved"
  IssuePriorityUpdated         Reporter                           "Upvote Milestone Reached"
```

---

## 2. Event Payload Specs

### 2.1 Issue Created

- **Trigger**: Submitted by citizen, event `IssueCreated` published.
- **Action**: Queries users sharing the same ward. Creates alert:
  - **Title**: `New Issue Nearby`
  - **Message**: `A new issue "[Title]" was reported in your ward [Ward].`
  - **Type**: `nearby_issue`

### 2.2 Issue Analyzed

- **Trigger**: Vision AI finishes classification, event `IssueAnalyzed` published.
- **Action**: Notifies the reporter.
  - **Title**: `AI Analysis Completed`
  - **Message**: `Your reported issue "[Title]" has been analyzed. Category: [Category], Severity: [Severity]/5.`
  - **Type**: `ai_completed`

### 2.3 Issue Resolved

- **Trigger**: Municipality/Authority changes status to resolved, event `IssueResolved` published.
- **Action**: Notifies the reporter.
  - **Title**: `Issue Resolved`
  - **Message**: `Your reported issue "[Title]" has been resolved! Note: [ResolutionNote].`
  - **Type**: `resolved`

### 2.4 Upvote Milestones

- **Trigger**: Citizen upvotes, recalculating priority, event `IssuePriorityUpdated` published.
- **Action**: Checks total votes. If count is `5`, `10`, `25`, or `50`, notifies the reporter.
  - **Title**: `Upvote Milestone Reached`
  - **Message**: `Your reported issue "[Title]" has reached [Votes] upvotes!`
  - **Type**: `promotion`

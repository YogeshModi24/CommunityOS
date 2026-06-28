# AI Analysis Pipeline

This document describes the design, execution flow, and idempotency guarantees of the asynchronous AI analysis pipeline.

## Asynchronous Worker Architecture

When a civic report is submitted, the issue details are queued in Redis using a BullMQ queue (`aiQueue`). An asynchronous worker processes the job using the `AnalyzeIssueUseCase`.

```
[ReportIssueUseCase]
         │
         ▼ (Enqueue Job)
     [aiQueue] ◄─── Redis
         │
         ▼ (Fetch Job)
     [aiWorker]
         │
         ▼
 [AnalyzeIssueUseCase]
         │
         ├──► 1. Idempotency Check
         │
         ├──► 2. Run AI Model (OpenAI gpt-4o)
         │
         ├──► 3. Calculate Priority Score
         │
         ├──► 4. Save analysis results & version parameters
         │
         └──► 5. Dispatch domain events & Award user points
```

---

## State Machine Lifecycle

Each issue has a strict AI analysis lifecycle represented by `ai_status`:

```
           ┌──────────┐
           │ pending  │
           └────┬─────┘
                │ (Job Picked Up)
                ▼
          ┌────────────┐
          │ processing │
          └─────┬──────┘
                │
        ┌───────┴───────┐
        ▼ (Success)     ▼ (Failure)
  ┌───────────┐   ┌──────────┐
  │ completed │   │  failed  │
  └───────────┘   └────┬─────┘
                       │ (Retry Worker)
                       ▼
```

- **pending**: Default state upon submission.
- **processing**: Set immediately before contacting the AI provider.
- **completed**: Set after successful response and database update.
- **failed**: Set if any transient exception occurs. Failed analyses are safely retryable.

---

## Worker Idempotency & Replay Protection

To prevent duplicate point allocations, notifications, and status history logs, the `AnalyzeIssueUseCase` enforces strict idempotency:

1. **State Audit**: Before execution, the worker checks if `ai_status` is `completed` or `processing`.
2. **Early Return**: If the state is `completed` or `processing`, the worker returns success immediately and terminates the job without calling the AI provider or modifying the issue.
3. **Safe Recovery**: If the state is `failed`, the worker is allowed to re-run. This allows manual retries or worker restarts without duplicate database allocations.

---

## Prompt Versioning & Historical Reproducibility

Every successful AI analysis persists full execution metadata on the issue record. This ensures historical auditability when prompts or models are updated:

```json
"ai_analysis": {
  "category": "pothole",
  "severity": 4,
  "description": "Deep pothole blocking single lane",
  "hazardous": false,
  "confidence": 0.92,
  "aiVersion": "v1.0.0",
  "modelName": "gpt-4o",
  "promptVersion": "p1.0.0",
  "processedAt": "2026-06-26T15:00:00Z"
}
```

---

## Performance SLA Target

- **Target**: AI Queue Processing < 60 seconds (development target).
- **Enforcement**: If the worker execution takes longer than 60 seconds, a structured performance warning log (`sla_target_exceeded`) is emitted with duration details.

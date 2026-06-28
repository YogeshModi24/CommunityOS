# Observability Guide

This guide details the logging, context propagation, and error handling architecture for **CommunityOS**. It describes how correlation IDs are generated, propagated, and logged, and outlines plans for future OpenTelemetry integrations.

---

## 1. Unified Logging & Error Architecture

CommunityOS decouples error definition from system output logging:

```
[ Domain Errors ]                 [ System Logger ]
 @community-os/errors              @community-os/logger
        ↓                                 ↓
 (ApplicationError subclasses)     (Winston & Console adapters)
        └───────────────┬─────────────────┘
                        ↓
             [ Express API / Worker ]
                        ↓
            [ Structured JSON logs ]
```

- **`@community-os/errors`**: Fully encapsulated package declaring domain exceptions (e.g. `NotFoundError`, `ValidationError`). Contains zero logging code to prevent side-effects.
- **`@community-os/logger`**: Ingestion interface (`ILogger`), factory (`LoggerFactory`), and adapters (Console & Winston) which read context details from Node `AsyncLocalStorage`.

---

## 2. Request & Correlation Lifecycle

### A. HTTP Request Lifecycle (API Gateway)

1. **Entry**: An HTTP request reaches the Express application.
2. **Context Establishment**: `correlationIdMiddleware` runs:
   - Reads `x-correlation-id` from header or generates a new UUID.
   - Generates a unique `requestId` for this specific gateway transaction.
   - Enters an isolated asynchronous context using `AsyncLocalStorage.run`.
3. **Authentication**: `authMiddleware` verifies the JWT token and calls `enrichLogContext({ userId })`.
4. **Execution**: Controllers and services execute. Any logs written here automatically read context parameters (`correlationId`, `requestId`, `userId`, `tenantId`).
5. **Worker Offloading**: When queuing background work (e.g. BullMQ `aiQueue.add`), the controller passes `correlationContext` in the job payload.
6. **Error / Exit**:
   - On success, `requestLogger` logs completed latency and status code.
   - On exception, `errorHandler` catches, formats the standard JSON response, and logs details.

### B. Background Worker Lifecycle (BullMQ Worker)

1. **Queue Dequeue**: The BullMQ Worker pulls an `'analyze'` job.
2. **Context Restoration**: The worker execution loop extracts the `correlationContext` from the job payload:
   - Starts a new `AsyncLocalStorage.run` wrapper using the original `correlationId` and job metadata.
3. **Job Execution**: Logs written during image analysis or priority score updates are logged with the original gateway correlation ID.
4. **Completion**: Logs status and concludes context isolation.

---

## 3. Future Extension Plans

### A. OpenTelemetry Tracing Integration

The `LoggerFactory` and `ILogger` are designed to support OpenTelemetry tracing hooks:

- **Trace Propagation**: Future headers `traceparent` or `tracestate` will be parsed by correlation middleware and set as `traceId`.
- **Span Instrumentation**: Pluggable trace providers can be registered in `LoggerFactory.createLogger` to export span contexts directly to OpenTelemetry collectors (Jaeger, Honeycomb, Datadog) without changing business route files.

### B. Metrics Integration

System metrics (response latencies, database query times, queue wait times) will rely on a future pluggable metrics adapter:

- High-frequency counters and histograms will collect resource metrics using Prometheus client specs.

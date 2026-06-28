# CommunityOS Logging Policy

This policy establishes strict standards for log data generation, ingestion, and management within the **CommunityOS** environment. It ensures compliance with security regulations, protects user privacy, and supports efficient incident troubleshooting.

---

## 1. Standard Log Levels & Intended Usage

Every service inside CommunityOS must align its logs to these six canonical levels:

| Level   | Severity      | Description                                                                                                   | Intended Usage                                                                                 |
| :------ | :------------ | :------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------- |
| `fatal` | Emergency     | System-level failure making the application or component completely unusable.                                 | Unhandled exceptions causing process exits (e.g., startup DB connection crash).                |
| `error` | Critical      | Runtime errors that disrupt a single request or job execution flow but allow the service to continue running. | Failed external calls, database query crashes, or API write operations failing.                |
| `warn`  | Warning       | Unexpected runtime behaviors that are handled safely but require attention.                                   | Rate limit triggers, schema degradation, or user validation anomalies (e.g., duplicate votes). |
| `info`  | Informational | Standard milestone operational events showing the system is working.                                          | Server start/stop, database connections, scheduled job completions, or API route hits.         |
| `debug` | Diagnostics   | Granular logic path traces for troubleshooting in non-production environments.                                | Raw payload values (masking rules apply), schema conversions, or query construction traces.    |
| `trace` | Verbose       | Highly verbose diagnostics charting exact stack code positions.                                               | High-frequency socket messages, internal loops, or middleware flow progression.                |

---

## 2. Sensitive Information Policy (Strictly Prohibited Data)

To protect user confidentiality, **never write sensitive personal or system data to logs**. The following items are strictly prohibited:

### A. Prohibited Credentials & Authentication Tokens

- **Passwords**: Clear-text or hashed passwords during sign-up or login.
- **Tokens**: JWTs, Refresh Tokens, NextAuth session cookies, or CSRF tokens.
- **Secrets**: API keys (e.g. OpenAI key, Cloudinary secrets), private keys, or SSH credentials.
- **Headers**: Raw HTTP `Authorization`, `Cookie`, or `Proxy-Authorization` headers.

### B. Prohibited Personal Sensitive Information (PII/SPI)

- **Real Names**: Do not log user names in general context (use `userId` instead).
- **Emails**: User email addresses must not be printed in logs.
- **Precise Coordinates**: Avoid printing exact GPS locations in debug blocks (reference `issueId` or `ward` instead).

---

## 3. Permitted Log Data

Logs should focus on structured correlation and operational metadata:

- **Correlation Identifiers**: `correlationId`, `requestId`, `userId`, `tenantId`, `issueId`.
- **Events**: Named string markers (`event`) that categorize system states (e.g., `db_connected`, `job_queued`).
- **Duration**: Execution latencies in milliseconds (`duration`) for HTTP requests or background jobs.
- **Service Context**: Application metadata (`service`, `environment`, `timestamp`).

---

## 4. Production Logging Rules

1. **Structured Outputs**: All production and staging services must write logs in JSON format to stdout.
2. **Log Level Limits**: Production level is capped at `info`. `debug` and `trace` outputs are disabled in staging/production to optimize disk utilization and prevent unintended PII exposure.
3. **Log Ingestion & Retention**: Logs are forwarded from standard output streams by daemon aggregators (e.g., Fluentd, CloudWatch, Datadog) to secure targets with a standard **30-day retention period** for general logs, and **90 days** for security logs.

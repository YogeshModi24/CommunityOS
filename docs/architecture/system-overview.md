# System Overview

CommunityOS uses a decoupled architecture to ensure scalability, reliability, and clear separation of concerns.

## High-Level Architecture

The system is composed of the following major components:
1. **Frontend Client:** A Next.js application handling the citizen and municipality dashboards.
2. **REST API:** A Node.js/Express service acting as the central gateway.
3. **Database:** MongoDB for persistent storage, accessed via Prisma ORM.
4. **Background Workers:** Asynchronous job processing for AI categorization and notifications.

## Information Flow
When a user submits a report:
1. The frontend uploads images directly to Cloudinary.
2. The frontend sends the report metadata (including image URLs) to the REST API.
3. The API saves the raw report to MongoDB and emits an event.
4. The background worker picks up the event, calls OpenAI Vision, and updates the report classification.
5. The API pushes real-time WebSocket updates to the Mission Control dashboard.

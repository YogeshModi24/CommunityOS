# Dashboard Architecture

This document details the single aggregation design of the Citizen Dashboard in CommunityOS.

## Query Performance Principles

Traditional dashboard rendering executes multiple consecutive database calls to gather user data, count total reports, count resolved reports, slice recent reports, and fetch leaderboard details. This leads to connection bottlenecks and high latency.

CommunityOS enforces that the dashboard payload is returned in a **single database aggregation pipeline call** to satisfy our SLA performance targets.

---

## Single Aggregation Design

The aggregation pipeline is implemented in `MongoUserRepository.getDashboardProjection(userId)` using a MongoDB `$facet` query.

```
                    [User Collection]
                            │
                            ▼
                     [$facet Stage]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
      [userProfile]                   [leaderboard]
            │                               │
    [$match by userId]              [$sort by points]
            │                               │
  [$lookup user issues]               [$limit to 10]
            │                               │
     [$project stats]               [$project fields]
```

### Aggregation Pipeline Stages

1. **`$facet` stage**: Allows running multiple parallel sub-pipelines inside a single query.
2. **`userProfile` sub-pipeline**:
   - **`$match`**: Filters the document to the current logged-in user.
   - **`$lookup`**: Joins with the `issues` collection where `reporter_id` matches the user's ID.
   - **`$project`**:
     - Calculates `totalReports` using `{ $size: "$userIssues" }`.
     - Filters and counts resolved reports using `$filter` and `$size` checks on issue status.
     - Slices the sorted issues array to return only the last 5 reports (recent activity) using `$slice` and `$sortArray`.
3. **`leaderboard` sub-pipeline**:
   - **`$sort`**: Orders all users descending by their points.
   - **`$limit`**: Slices the top 10 users.
   - **`$project`**: Projects only public ranking fields (name, email, ward, points, issues reported).

---

## Performance SLA Target

- **Target**: Dashboard API < 300 ms.
- **Enforcement**: If the `getDashboardData` request takes longer than 300ms, the system logs a structured warning (`[UserService] Dashboard API performance target exceeded`).

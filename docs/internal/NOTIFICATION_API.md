# Notification REST API Contract

This document outlines the API endpoints, payloads, and authorization constraints for the Notification Center in CommunityOS.

---

## 1. Endpoints Catalog

All endpoints require authentication (NextAuth Bearer JWT headers). Users can only fetch and update their own notifications.

### 1.1 List Recent Alerts

- **Route**: `GET /api/notifications`
- **Params**: `page` (optional, default: 1), `limit` (optional, default: 10)
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "notifications": [
        {
          "id": "60d5ec49f1b2c71048888888",
          "userId": "60d5ec49f1b2c71047777777",
          "title": "AI Analysis Completed",
          "message": "Your reported issue has been analyzed.",
          "type": "ai_completed",
          "issueId": "60d5ec49f1b2c71046666666",
          "read": false,
          "createdAt": "2026-06-27T12:00:00.000Z"
        }
      ],
      "total": 1
    }
  }
  ```

### 1.2 Fetch Unread Count

- **Route**: `GET /api/notifications/unread-count`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "count": 5
    }
  }
  ```

### 1.3 Mark Notification Read

- **Route**: `PATCH /api/notifications/:id/read`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "60d5ec49f1b2c71048888888",
      "read": true,
      "readAt": "2026-06-27T12:05:00.000Z"
    }
  }
  ```

### 1.4 Mark All Notifications Read

- **Route**: `POST /api/notifications/read-all`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": null
  }
  ```

### 1.5 Delete Notification

- **Route**: `DELETE /api/notifications/:id`
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "deleted": true
    }
  }
  ```

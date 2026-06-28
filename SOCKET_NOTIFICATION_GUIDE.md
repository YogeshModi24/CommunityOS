# Socket.IO Notification Integration Guide

This guide details real-time notification transmissions over Socket.IO, channel topologies, and event processing parameters in CommunityOS.

---

## 1. Socket Registration & Channel Security

To prevent broadcasting alerts to unauthorized users:

- The Socket.IO server isolates messages into client-specific private rooms.
- Upon successful login and socket connection, the client must emit a `join` event containing their authenticated `userId`.
- The server associates the client socket to a room named `user:${userId}`.

```javascript
// Server Registration
socket.on('join', (data) => {
  if (data?.userId) {
    socket.join(`user:${data.userId}`);
  }
});
```

---

## 2. Supported Events Matrix

The server broadcasts the following events to the private room `user:${userId}`:

| Event Name             | Emit Payload               | Client Side Action                                      |
| :--------------------- | :------------------------- | :------------------------------------------------------ |
| `notification.created` | Full `Notification` object | Append card to UI feed, increment unread counter badge  |
| `notification.read`    | `{ notificationId }`       | Mark card as read, decrement unread counter             |
| `notification.deleted` | `{ notificationId }`       | Remove card from DOM, decrement unread if it was unread |

---

## 3. Reconnections & Event Deduplication

To maintain synchronization during socket dropped connections:

- **Auto-Reconnect**: The client maintains `reconnection: true` and retries up to 5 times.
- **Event Deduplication**: The client maintains a history of processed notification IDs (`processedEvents`). If a duplicate `notification.created` payload arrives due to re-sending or connection handshakes, it is rejected at the handler level to prevent rendering duplicate cards.

# Chat Logic

## Overview

LiHoChat currently uses:

- `Next.js` frontend for room selection, message rendering, and user switching
- `Express` API for loading users, rooms, members, and message history
- `Socket.IO` for room join and real-time message delivery

The chat model is built around four core data structures:

- `users`
- `rooms`
- `roomMembers`
- `messages`

`rooms` support two types:

- `group`
- `direct`

Both types use the same message flow. The difference is only in room membership and presentation.

## System Diagram

```mermaid
flowchart LR
    U["User"] --> F["Next.js Frontend"]
    F -->|HTTP| A["Express API"]
    F -->|Socket.IO| S["Socket Server"]
    A --> R["rooms"]
    A --> M["messages"]
    A --> RM["roomMembers"]
    A --> US["users"]
    S --> R
    S --> M
    S --> RM
    S --> US
```

## Room Access Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Express API
    participant S as Socket Server

    U->>F: Select current user
    F->>A: GET /api/users/:userId/rooms
    A-->>F: Visible rooms

    U->>F: Select room
    F->>A: GET /api/messages?roomId=...
    A-->>F: Message history

    F->>S: room:join { roomId, userId }
    S->>S: Validate room exists
    S->>S: Validate user exists
    S->>S: Validate membership exists
    S-->>F: room:joined
```

## Send Message Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Socket Server
    participant L as Message Logic

    U->>F: Type message and submit
    F->>S: message:send { roomId, userId, username, type, content }
    S->>S: Validate active socket user
    S->>L: createMessage(payload)
    L->>L: Validate room exists
    L->>L: Validate user exists
    L->>L: Validate user is room member
    L-->>S: newMessage
    S-->>F: message:ack
    S-->>F: message:new
    S-->>OtherClients: message:new
```

## Data Model

```mermaid
classDiagram
    class User {
      id
      username
      displayName
      avatarUrl
      createdAt
    }

    class Room {
      id
      type
      name
      description
      createdAt
    }

    class RoomMember {
      roomId
      userId
      role
      joinedAt
    }

    class Message {
      id
      roomId
      userId
      username
      type
      content
      createdAt
    }

    User --> RoomMember
    Room --> RoomMember
    User --> Message
    Room --> Message
```

## API and Socket Responsibilities

- `GET /api/users`
  - Returns available users for the frontend selector
- `GET /api/users/:userId/rooms`
  - Returns only rooms visible to that user
- `GET /api/messages?roomId=...`
  - Returns message history for one room
- `GET /api/rooms/:roomId/members`
  - Returns expanded room member profiles

- `room:join`
  - Joins one socket connection to one room after membership validation
- `message:send`
  - Creates a new message after room, user, and membership validation
- `message:ack`
  - Confirms message creation to the sender
- `message:new`
  - Broadcasts the created message to all connected room members

## Validation Rules

Before a message is created, the backend verifies:

1. The room exists
2. The user exists
3. The user belongs to the room
4. The socket user matches the message sender

This keeps the `direct` and `group` chat models consistent under the same flow.

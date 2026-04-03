"use client";

import { useEffect, useRef, useState } from "react";

import { getMessages, getUserRooms, getUsers } from "../lib/api";
import { createSocket } from "../lib/socket";

const DEFAULT_ERROR = "Something went wrong";

export default function HomePage() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("general");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("u1");
  const [username, setUsername] = useState("william");
  const [content, setContent] = useState("");
  const [socketStatus, setSocketStatus] = useState("Connecting...");
  const [apiStatus, setApiStatus] = useState("Loading rooms...");
  const socketRef = useRef(null);
  const selectedRoomIdRef = useRef("general");
  const userIdRef = useRef("u1");

  const groupedRooms = {
    group: rooms.filter((room) => room.type === "group"),
    direct: rooms.filter((room) => room.type === "direct"),
  };

  useEffect(() => {
    let isMounted = true;

    async function loadVisibleRooms(nextUserId) {
      try {
        const roomData = await getUserRooms(nextUserId);

        if (!isMounted) {
          return;
        }

        setRooms(roomData.rooms);

        if (roomData.rooms.length > 0) {
          const hasCurrentRoom = roomData.rooms.some(
            (room) => room.id === selectedRoomIdRef.current,
          );

          setSelectedRoomId(
            hasCurrentRoom ? selectedRoomIdRef.current : roomData.rooms[0].id,
          );
        } else {
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus("No rooms available");
        }
      } catch (error) {
        if (isMounted) {
          setRooms([]);
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus(error.message || DEFAULT_ERROR);
        }
      }
    }

    loadVisibleRooms(userIdRef.current);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const userData = await getUsers();

        if (!isMounted) {
          return;
        }

        setUsers(userData.users);

        const currentUser = userData.users.find((user) => user.id === userId);

        if (currentUser) {
          setUsername(currentUser.username);
          return;
        }

        if (userData.users.length > 0) {
          setUserId(userData.users[0].id);
          setUsername(userData.users[0].username);
        }
      } catch (error) {
        if (isMounted) {
          setApiStatus(error.message || DEFAULT_ERROR);
        }
      }
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function refreshVisibleRooms() {
      try {
        const roomData = await getUserRooms(userId);

        if (!isMounted) {
          return;
        }

        setRooms(roomData.rooms);

        if (roomData.rooms.length === 0) {
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus("No rooms available");
          return;
        }

        const hasCurrentRoom = roomData.rooms.some(
          (room) => room.id === selectedRoomIdRef.current,
        );

        if (!hasCurrentRoom) {
          setSelectedRoomId(roomData.rooms[0].id);
        }
      } catch (error) {
        if (isMounted) {
          setRooms([]);
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus(error.message || DEFAULT_ERROR);
        }
      }
    }

    refreshVisibleRooms();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    const currentUser = users.find((user) => user.id === userId);

    if (currentUser) {
      setUsername(currentUser.username);
    }
  }, [userId, users]);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketStatus(`Connected: ${socket.id}`);

      if (selectedRoomIdRef.current) {
        socket.emit("room:join", {
          roomId: selectedRoomIdRef.current,
          userId: userIdRef.current,
        });
      }
    });

    socket.on("room:joined", (payload) => {
      setSocketStatus(`Joined room: ${payload.roomId}`);
    });

    socket.on("room:member_count", (payload) => {
      if (payload.roomId === selectedRoomIdRef.current) {
        setSocketStatus(
          `Room ${payload.roomId} currently has ${payload.count} socket member(s)`,
        );
      }
    });

    socket.on("message:new", (message) => {
      setMessages((currentMessages) => {
        if (message.roomId !== selectedRoomIdRef.current) {
          return currentMessages;
        }

        return [...currentMessages, message];
      });
    });

    socket.on("message:ack", (payload) => {
      setSocketStatus(`Message sent: ${payload.messageId}`);
    });

    socket.on("message:error", (payload) => {
      setSocketStatus(payload.error || DEFAULT_ERROR);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    selectedRoomIdRef.current = selectedRoomId;
    userIdRef.current = userId;

    if (!selectedRoomId) {
      return;
    }

    loadMessages(selectedRoomId);

    if (socketRef.current?.connected) {
      socketRef.current.emit("room:join", {
        roomId: selectedRoomId,
        userId,
      });
    }
  }, [selectedRoomId, userId]);

  async function loadMessages(roomId) {
    try {
      const messageData = await getMessages(roomId);
      setMessages(messageData.messages);
      setApiStatus(`Loaded ${messageData.messages.length} message(s)`);
    } catch (error) {
      setApiStatus(error.message || DEFAULT_ERROR);
    }
  }

  function handleSelectRoom(roomId) {
    setSelectedRoomId(roomId);
  }

  function handleSelectUser(nextUserId) {
    setUserId(nextUserId);
  }

  function handleSendMessage(event) {
    event.preventDefault();

    if (!socketRef.current) {
      setSocketStatus("Socket is not ready");
      return;
    }

    if (!selectedRoomId) {
      setSocketStatus("No room selected");
      return;
    }

    socketRef.current.emit("message:send", {
      roomId: selectedRoomId,
      userId,
      username,
      type: "text",
      content,
    });

    setContent("");
  }

  return (
    <main className="shell">
      <section className="sidebar card">
        <div className="eyebrow">LiHoChat</div>
        <h1 className="title">Realtime Chat Console</h1>
        <p className="summary">
          Formal Next.js frontend talking to your existing Express and Socket.IO
          backend.
        </p>

        <div className="field">
          <label htmlFor="userId">Current User</label>
          <select
            id="userId"
            value={userId}
            onChange={(event) => handleSelectUser(event.target.value)}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} ({user.username})
              </option>
            ))}
          </select>
        </div>

        <div className="status-box">
          <div>
            <span className="status-label">API</span>
            <p>{apiStatus}</p>
          </div>
          <div>
            <span className="status-label">Socket</span>
            <p>{socketStatus}</p>
          </div>
        </div>

        <div className="room-list">
          <div className="section-header">
            <h2>Rooms</h2>
          </div>

          {groupedRooms.group.length > 0 ? (
            <div className="room-section">
              <div className="room-section-title">Groups</div>
              {groupedRooms.group.map((room) => (
                <button
                  key={room.id}
                  className={
                    room.id === selectedRoomId ? "room active" : "room"
                  }
                  onClick={() => handleSelectRoom(room.id)}
                  type="button"
                >
                  <div className="room-title-row">
                    <strong>{room.name}</strong>
                    <span className="room-type-badge">{room.type}</span>
                  </div>
                  <span>{room.description}</span>
                </button>
              ))}
            </div>
          ) : null}

          {groupedRooms.direct.length > 0 ? (
            <div className="room-section">
              <div className="room-section-title">Direct</div>
              {groupedRooms.direct.map((room) => (
                <button
                  key={room.id}
                  className={
                    room.id === selectedRoomId ? "room active" : "room"
                  }
                  onClick={() => handleSelectRoom(room.id)}
                  type="button"
                >
                  <div className="room-title-row">
                    <strong>{room.name}</strong>
                    <span className="room-type-badge">{room.type}</span>
                  </div>
                  <span>{room.description}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="chat card">
        <div className="chat-header">
          <div>
            <div className="eyebrow">Current Room</div>
            <h2>
              {rooms.find((room) => room.id === selectedRoomId)?.name ||
                selectedRoomId ||
                "No room"}
            </h2>
          </div>
        </div>

        <div className="message-list">
          {messages.map((message) => (
            <article
              key={message.id}
              className={
                message.userId === userId ? "message message-self" : "message"
              }
            >
              <div className="message-meta">
                <strong>{message.username}</strong>
                <span>{new Date(message.createdAt).toLocaleTimeString()}</span>
              </div>
              <p>{message.content}</p>
            </article>
          ))}
        </div>

        <form className="composer" onSubmit={handleSendMessage}>
          <label className="field grow">
            <span>Message</span>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Type a message for this room"
            />
          </label>
          <button className="send-button" type="submit">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}

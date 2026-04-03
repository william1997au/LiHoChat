"use client";

import { useEffect, useRef, useState } from "react";

import { getMessages, getRooms } from "../lib/api";
import { createSocket } from "../lib/socket";

const DEFAULT_ERROR = "Something went wrong";

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("general");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("u99");
  const [username, setUsername] = useState("demo-user");
  const [content, setContent] = useState("");
  const [socketStatus, setSocketStatus] = useState("Connecting...");
  const [apiStatus, setApiStatus] = useState("Loading rooms...");
  const socketRef = useRef(null);
  const selectedRoomIdRef = useRef("general");

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const roomData = await getRooms();

        if (!isMounted) {
          return;
        }

        setRooms(roomData.rooms);

        if (roomData.rooms.length > 0) {
          const firstRoomId = roomData.rooms[0].id;
          setSelectedRoomId(firstRoomId);
        } else {
          setApiStatus("No rooms available");
        }
      } catch (error) {
        if (isMounted) {
          setApiStatus(error.message || DEFAULT_ERROR);
        }
      }
    }

    bootstrap();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = createSocket();
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketStatus(`Connected: ${socket.id}`);
      socket.emit("room:join", selectedRoomIdRef.current);
    });

    socket.on("room:joined", (payload) => {
      setSocketStatus(`Joined room: ${payload.roomId}`);
    });

    socket.on("room:member_count", (payload) => {
      if (payload.roomId === selectedRoomId) {
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

    if (!selectedRoomId) {
      return;
    }

    loadMessages(selectedRoomId);

    if (socketRef.current?.connected) {
      socketRef.current.emit("room:join", selectedRoomId);
    }
  }, [selectedRoomId]);

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

  function handleSendMessage(event) {
    event.preventDefault();

    if (!socketRef.current) {
      setSocketStatus("Socket is not ready");
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
          <label htmlFor="userId">User ID</label>
          <input
            id="userId"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
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
          {rooms.map((room) => (
            <button
              key={room.id}
              className={room.id === selectedRoomId ? "room active" : "room"}
              onClick={() => handleSelectRoom(room.id)}
              type="button"
            >
              <strong>{room.name}</strong>
              <span>{room.description}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="chat card">
        <div className="chat-header">
          <div>
            <div className="eyebrow">Current Room</div>
            <h2>{selectedRoomId}</h2>
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

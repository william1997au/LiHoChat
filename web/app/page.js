"use client";

import { useEffect, useRef, useState } from "react";

import {
  deleteRoom,
  getFriends,
  getMessages,
  getOrCreatePrivateRoom,
  getUserRooms,
  getUsers,
} from "../lib/api";
import { createSocket } from "../lib/socket";

const DEFAULT_ERROR = "Something went wrong";

export default function HomePage() {
  const [activePanel, setActivePanel] = useState("chats");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState("general");
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState("u1");
  const [username, setUsername] = useState("william");
  const [content, setContent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [socketStatus, setSocketStatus] = useState("Connecting...");
  const [apiStatus, setApiStatus] = useState("Loading conversations...");
  const socketRef = useRef(null);
  const selectedRoomIdRef = useRef("general");
  const userIdRef = useRef("u1");

  const filteredFriends = friends.filter((friend) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      friend.displayName.toLowerCase().includes(keyword) ||
      friend.username.toLowerCase().includes(keyword)
    );
  });

  const filteredRooms = rooms.filter((room) => {
    const keyword = searchTerm.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      room.name.toLowerCase().includes(keyword) ||
      room.description.toLowerCase().includes(keyword)
    );
  });

  const selectedRoom =
    rooms.find((room) => room.id === selectedRoomId) || null;
  const privateRooms = filteredRooms.filter((room) => room.type === "private");
  const groupRooms = filteredRooms.filter((room) => room.type === "group");

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

    async function loadVisibleRoomsAndFriends() {
      try {
        const [roomData, friendData] = await Promise.all([
          getUserRooms(userId),
          getFriends(userId),
        ]);

        if (!isMounted) {
          return;
        }

        setRooms(roomData.rooms);
        setFriends(friendData.friends);

        if (roomData.rooms.length === 0) {
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus("No conversations available");
          return;
        }

        const hasCurrentRoom = roomData.rooms.some(
          (room) => room.id === selectedRoomIdRef.current,
        );

        if (!hasCurrentRoom) {
          setSelectedRoomId(roomData.rooms[0].id);
        }

        setApiStatus(
          `Loaded ${friendData.friends.length} friend(s) and ${roomData.rooms.length} room(s)`,
        );
      } catch (error) {
        if (isMounted) {
          setFriends([]);
          setRooms([]);
          setSelectedRoomId("");
          setMessages([]);
          setApiStatus(error.message || DEFAULT_ERROR);
        }
      }
    }

    loadVisibleRoomsAndFriends();

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

  async function handleOpenFriendChat(friendUserId) {
    try {
      const result = await getOrCreatePrivateRoom(userId, friendUserId);
      const roomData = await getUserRooms(userId);

      setRooms(roomData.rooms);
      setSelectedRoomId(result.room.id);
      setApiStatus(
        result.created
          ? `Created private room: ${result.room.name}`
          : `Opened private room: ${result.room.name}`,
      );

      if (socketRef.current?.connected) {
        socketRef.current.emit("room:join", {
          roomId: result.room.id,
          userId,
        });
      }
    } catch (error) {
      setApiStatus(error.message || DEFAULT_ERROR);
    }
  }

  async function handleDeleteRoom(roomId) {
    try {
      await deleteRoom(roomId, userId);

      const roomData = await getUserRooms(userId);
      setRooms(roomData.rooms);

      if (selectedRoomId === roomId) {
        const nextRoomId = roomData.rooms[0]?.id || "";
        setSelectedRoomId(nextRoomId);
        setMessages([]);

        if (nextRoomId && socketRef.current?.connected) {
          socketRef.current.emit("room:join", {
            roomId: nextRoomId,
            userId,
          });
        } else if (socketRef.current?.connected) {
          socketRef.current.emit("room:leave");
        }
      }

      setApiStatus("Private room deleted");
    } catch (error) {
      setApiStatus(error.message || DEFAULT_ERROR);
    }
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
    <main className="app-shell">
      <aside className="app-rail">
        <div className="app-brand">L</div>
        <div className="app-rail-icons">
          <button
            className={
              activePanel === "friends"
                ? "app-rail-icon active"
                : "app-rail-icon"
            }
            onClick={() => setActivePanel("friends")}
            type="button"
            aria-label="Friends"
          >
            <span className="material-symbols-outlined">person</span>
          </button>
          <button
            className={
              activePanel === "chats"
                ? "app-rail-icon active"
                : "app-rail-icon"
            }
            onClick={() => setActivePanel("chats")}
            type="button"
            aria-label="Chats"
          >
            <span className="material-symbols-outlined">chat</span>
          </button>
          <span className="app-rail-icon">
            <span className="material-symbols-outlined">person_add</span>
          </span>
          <span className="app-rail-icon">
            <span className="material-symbols-outlined">settings</span>
          </span>
        </div>
      </aside>

      <section className="conversation-panel card">
        <div className="conversation-header">
          <div>
            <div className="eyebrow">LiHoChat</div>
            <h1 className="title">
              {activePanel === "friends" ? "Friends" : "Conversations"}
            </h1>
          </div>
          <div className="field compact">
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
        </div>

        <div className="search-box">
          <input
            aria-label="Search friends and chats"
            placeholder="以姓名搜尋"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {activePanel === "friends" ? (
          <div className="list-section list-section-fill">
            <div className="section-header">
              <h2>好友 {filteredFriends.length}</h2>
            </div>
            <div className="conversation-list">
              {filteredFriends.map((friend) => (
                <button
                  key={friend.userId}
                  className="conversation-item"
                  onClick={() => handleOpenFriendChat(friend.userId)}
                  type="button"
                >
                  <div className="avatar">{friend.displayName.slice(0, 1)}</div>
                  <div className="conversation-copy">
                    <strong>{friend.displayName}</strong>
                    <span>@{friend.username}</span>
                  </div>
                  <span className="conversation-action">聊天</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="list-section list-section-fill">
            <div className="section-header">
              <h2>聊天室 {filteredRooms.length}</h2>
            </div>

            {privateRooms.length > 0 ? (
              <div className="room-section">
                <div className="room-section-title">Private</div>
                <div className="conversation-list">
                  {privateRooms.map((room) => (
                    <div
                      key={room.id}
                      className={
                        room.id === selectedRoomId
                          ? "conversation-item selected"
                          : "conversation-item"
                      }
                    >
                      <button
                        className="conversation-main"
                        onClick={() => handleSelectRoom(room.id)}
                        type="button"
                      >
                        <div className="avatar">{room.name.slice(0, 1)}</div>
                        <div className="conversation-copy">
                          <strong>{room.name}</strong>
                          <span>{room.description}</span>
                        </div>
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteRoom(room.id)}
                        type="button"
                      >
                        刪除
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {groupRooms.length > 0 ? (
              <div className="room-section">
                <div className="room-section-title">Groups</div>
                <div className="conversation-list">
                  {groupRooms.map((room) => (
                    <button
                      key={room.id}
                      className={
                        room.id === selectedRoomId
                          ? "conversation-item selected"
                          : "conversation-item"
                      }
                      onClick={() => handleSelectRoom(room.id)}
                      type="button"
                    >
                      <div className="avatar">{room.name.slice(0, 1)}</div>
                      <div className="conversation-copy">
                        <strong>{room.name}</strong>
                        <span>{room.description}</span>
                      </div>
                      <span className="conversation-tag">Group</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <section className="chat card">
        <div className="chat-header">
          <div>
            <div className="eyebrow">
              {selectedRoom?.type === "private" ? "Private Chat" : "Chat Room"}
            </div>
            <h2>
              {selectedRoom?.name || selectedRoomId || "No room"}
            </h2>
            <p className="chat-summary">
              {selectedRoom?.description || "Select a room or click a friend"}
            </p>
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

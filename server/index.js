const express = require("express");

const HOST = "127.0.0.1";
const PORT = 3001;

const app = express();
const fakeMessages = [
  {
    id: "1",
    roomId: "general",
    userId: "u1",
    username: "william",
    type: "text",
    content: "Hello LiHoChat",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    roomId: "general",
    userId: "u2",
    username: "amy",
    type: "text",
    content: "Hi William, I can see your message.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    roomId: "general",
    userId: "u3",
    username: "kevin",
    type: "text",
    content: "This is the default room for everyone.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    roomId: "frontend",
    userId: "u2",
    username: "amy",
    type: "text",
    content: "I am working on the chat page layout.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    roomId: "backend",
    userId: "u1",
    username: "william",
    type: "text",
    content: "I am building the message API first.",
    createdAt: new Date().toISOString(),
  },
];

function getMessagesByRoomId(roomId) {
  return fakeMessages.filter((message) => message.roomId === roomId);
}

function createMessage(payload) {
  const { roomId, userId, username, type, content } = payload;

  if (!roomId || !userId || !username || !type || !content) {
    throw new Error("roomId, userId, username, type and content are required");
  }

  if (type !== "text") {
    throw new Error('type must be "text"');
  }

  const newMessage = {
    id: String(fakeMessages.length + 1),
    roomId,
    userId,
    username,
    type,
    content,
    createdAt: new Date().toISOString(),
  };

  fakeMessages.push(newMessage);

  return newMessage;
}

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/messages", (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    res.json({ messages: fakeMessages });
    return;
  }

  res.json({ messages: getMessagesByRoomId(roomId) });
});

app.post("/api/messages", (req, res) => {
  try {
    const newMessage = createMessage(req.body);

    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});

const express = require("express");

const {
  fakeMessages,
  getMessagesByRoomId,
  createMessage,
} = require("./messages");

const app = express();

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

module.exports = app;

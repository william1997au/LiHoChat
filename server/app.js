const cors = require("cors");
const express = require("express");
const path = require("path");

const {
  fakeMessages,
  getMessagesByRoomId,
  createMessage,
} = require("./messages");
const { getRooms, getRoomById } = require("./rooms");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  }),
);
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/rooms", (req, res) => {
  res.json({ rooms: getRooms() });
});

app.get("/api/rooms/:roomId", (req, res) => {
  const room = getRoomById(req.params.roomId);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json({ room });
});

app.get("/api/messages", (req, res) => {
  const { roomId } = req.query;

  if (!roomId) {
    res.json({ messages: fakeMessages });
    return;
  }

  try {
    res.json({ messages: getMessagesByRoomId(roomId) });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
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

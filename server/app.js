const cors = require("cors");
const express = require("express");

const { roomsRouter } = require("./routes/rooms.routes");
const { getFriendsByUserId } = require("./friendships");
const { deleteRoomForUser } = require("./services/privateRooms.service");
const {
  fakeMessages,
  getMessagesByRoomId,
  createMessage,
} = require("./messages");
const {
  getRoomDetail,
  getRoomMemberProfiles,
  getUserRooms,
} = require("./roomMembers");
const { getRooms, getRoomById } = require("./repositories/rooms.repository");
const {
  getUsers,
  getUserById,
} = require("./repositories/users.repository");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  }),
);
app.use(express.json());
app.use("/api", roomsRouter);

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

  res.json({ room: getRoomDetail(room) });
});

app.get("/api/rooms/:roomId/members", (req, res) => {
  try {
    res.json({
      roomId: req.params.roomId,
      members: getRoomMemberProfiles(req.params.roomId),
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.get("/api/users", (req, res) => {
  res.json({ users: getUsers() });
});

app.get("/api/users/:userId", (req, res) => {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
});

app.get("/api/users/:userId/rooms", (req, res) => {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    userId: user.id,
    rooms: getUserRooms(user.id),
  });
});

app.get("/api/users/:userId/friends", (req, res) => {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    userId: user.id,
    friends: getFriendsByUserId(user.id),
  });
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

app.delete("/api/rooms/:roomId", (req, res) => {
  try {
    const userId = String(req.query.userId || "").trim();

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const room = deleteRoomForUser(req.params.roomId, userId);

    res.json({
      room,
      deleted: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;

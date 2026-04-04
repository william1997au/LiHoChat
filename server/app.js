const cors = require("cors");
const express = require("express");

const { roomsRouter } = require("./routes/rooms.routes");
const { usersRouter } = require("./routes/users.routes");
const { messagesRouter } = require("./routes/messages.routes");

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  }),
);
app.use(express.json());
app.use("/api", roomsRouter);
app.use("/api", usersRouter);
app.use("/api", messagesRouter);

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = app;

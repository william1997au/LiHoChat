const { Server } = require("socket.io");

const { getMessagesByRoomId } = require("../repositories/messages.repository");
const { ensureRoomMember } = require("../repositories/roomMembers.repository");
const { getRooms } = require("../repositories/rooms.repository");
const { createMessage } = require("../services/messages.service");

function logSocketDebug(message, meta = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.log(message, meta);
  }
}

function emitRoomMemberCount(io, roomId) {
  const count = io.sockets.adapter.rooms.get(roomId)?.size || 0;

  io.to(roomId).emit("room:member_count", {
    roomId,
    count,
  });
}

function emitSocketError(socket, error, context) {
  socket.emit("message:error", {
    error,
    context,
  });
}

function registerSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket) => {
    socket.emit("socket:ready", {
      socketId: socket.id,
      rooms: await getRooms(),
    });

    logSocketDebug("socket connected", { socketId: socket.id });

    socket.on("room:join", async (payload) => {
      try {
        const nextRoomId = String(payload?.roomId || "").trim();
        const nextUserId = String(payload?.userId || "").trim();

        if (!nextRoomId) {
          emitSocketError(socket, "roomId is required", "room:join");
          return;
        }

        if (!nextUserId) {
          emitSocketError(socket, "userId is required", "room:join");
          return;
        }

        await ensureRoomMember(nextRoomId, nextUserId);

        const previousRoomId = socket.data.roomId;

        if (previousRoomId && previousRoomId !== nextRoomId) {
          socket.leave(previousRoomId);
          emitRoomMemberCount(io, previousRoomId);
        }

        socket.join(nextRoomId);
        socket.data.roomId = nextRoomId;
        socket.data.userId = nextUserId;

        const messages = await getMessagesByRoomId(nextRoomId);

        socket.emit("room:joined", {
          roomId: nextRoomId,
          userId: nextUserId,
          messageCount: messages.length,
        });

        logSocketDebug("socket joined room", {
          socketId: socket.id,
          roomId: nextRoomId,
          userId: nextUserId,
        });

        emitRoomMemberCount(io, nextRoomId);
      } catch (error) {
        emitSocketError(socket, error.message, "room:join");
      }
    });

    socket.on("room:leave", () => {
      const currentRoomId = socket.data.roomId;

      if (!currentRoomId) {
        emitSocketError(socket, "No active room to leave", "room:leave");
        return;
      }

      socket.leave(currentRoomId);
      socket.data.roomId = null;
      socket.emit("room:left", {
        roomId: currentRoomId,
      });

      logSocketDebug("socket left room", {
        socketId: socket.id,
        roomId: currentRoomId,
      });

      emitRoomMemberCount(io, currentRoomId);
    });

    socket.on("message:send", async (payload) => {
      try {
        const activeRoomId = socket.data.roomId;
        const activeUserId = socket.data.userId;
        const payloadRoomId = String(payload?.roomId || "").trim();
        const payloadUserId = String(payload?.userId || "").trim();

        if (!activeRoomId) {
          throw new Error("Join a room before sending messages");
        }

        if (activeRoomId !== payloadRoomId) {
          throw new Error("payload roomId must match the active room");
        }

        if (!activeUserId || activeUserId !== payloadUserId) {
          throw new Error("payload userId must match the active socket user");
        }

        const newMessage = await createMessage(payload);

        socket.emit("message:ack", {
          messageId: newMessage.id,
          roomId: newMessage.roomId,
        });

        logSocketDebug("socket message persisted", {
          socketId: socket.id,
          roomId: newMessage.roomId,
          userId: newMessage.userId,
          messageId: newMessage.id,
        });

        io.to(newMessage.roomId).emit("message:new", newMessage);
      } catch (error) {
        emitSocketError(socket, error.message, "message:send");
      }
    });

    socket.on("disconnect", () => {
      const currentRoomId = socket.data.roomId;

      logSocketDebug("socket disconnected", {
        socketId: socket.id,
        roomId: currentRoomId,
      });

      if (currentRoomId) {
        emitRoomMemberCount(io, currentRoomId);
      }
    });
  });

  return io;
}

module.exports = {
  registerSocket,
};

const { Server } = require("socket.io");

const { createMessage } = require("./messages");

function registerSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("room:join", (roomId) => {
      if (!roomId) {
        socket.emit("message:error", { error: "roomId is required" });
        return;
      }

      socket.join(roomId);
    });

    socket.on("message:send", (payload) => {
      try {
        const newMessage = createMessage(payload);

        io.to(newMessage.roomId).emit("message:new", newMessage);
      } catch (error) {
        socket.emit("message:error", { error: error.message });
      }
    });
  });

  return io;
}

module.exports = {
  registerSocket,
};

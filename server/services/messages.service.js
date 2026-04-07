const { ensureRoomExists } = require("../repositories/rooms.repository");
const { ensureRoomMember } = require("../repositories/roomMembers.repository");
const { ensureUserExists } = require("../repositories/users.repository");
const {
  addMessage,
  getMessagesByRoomId,
} = require("../repositories/messages.repository");

async function listMessagesByRoomId(roomId) {
  await ensureRoomExists(roomId);
  return await getMessagesByRoomId(roomId);
}

async function createMessage(payload) {
  const roomId = String(payload.roomId || "").trim();
  const userId = String(payload.userId || "").trim();
  const username = String(payload.username || "").trim();
  const type = String(payload.type || "").trim();
  const content = String(payload.content || "").trim();

  if (!roomId || !userId || !username || !type || !content) {
    throw new Error("roomId, userId, username, type and content are required");
  }

  await ensureRoomExists(roomId);
  ensureUserExists(userId);
  await ensureRoomMember(roomId, userId);

  if (type !== "text") {
    throw new Error('type must be "text"');
  }

  return await addMessage({
    id: String(Date.now()),
    roomId,
    userId,
    username,
    type,
    content,
    createdAt: new Date().toISOString(),
  });
}

module.exports = {
  listMessagesByRoomId,
  createMessage,
};

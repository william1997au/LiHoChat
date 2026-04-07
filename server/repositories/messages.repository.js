const { pool } = require("../db/postgres");

function toMessageEntity(message) {
  return {
    id: message.id,
    roomId: message.room_id,
    userId: message.user_id,
    username: message.username,
    type: message.type,
    content: message.content,
    createdAt: message.created_at,
  };
}

async function getMessages() {
  const result = await pool.query(`
    SELECT id, room_id, user_id, username, type, content, created_at
    FROM messages
    ORDER BY created_at ASC
  `);

  return result.rows.map(toMessageEntity);
}

async function getMessagesByRoomId(roomId) {
  const result = await pool.query(
    `
    SELECT id, room_id, user_id, username, type, content, created_at
    FROM messages
    WHERE room_id = $1
    ORDER BY created_at ASC
    `,
    [roomId],
  );

  return result.rows.map(toMessageEntity);
}

async function addMessage(newMessage) {
  const result = await pool.query(
    `
    INSERT INTO messages (id, room_id, user_id, username, type, content, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, room_id, user_id, username, type, content, created_at
    `,
    [
      newMessage.id,
      newMessage.roomId,
      newMessage.userId,
      newMessage.username,
      newMessage.type,
      newMessage.content,
      newMessage.createdAt,
    ],
  );

  return toMessageEntity(result.rows[0]);
}

async function removeMessagesByRoomId(roomId) {
  await pool.query(
    `
    DELETE FROM messages
    WHERE room_id = $1
    `,
    [roomId],
  );
}

module.exports = {
  getMessages,
  getMessagesByRoomId,
  addMessage,
  removeMessagesByRoomId,
};

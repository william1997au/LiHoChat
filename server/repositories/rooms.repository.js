const { pool } = require("../db/postgres");

const fakeRooms = [
  {
    id: "general",
    type: "group",
    name: "General",
    description: "Default room for all members",
    createdAt: new Date().toISOString(),
  },
  {
    id: "frontend",
    type: "group",
    name: "Frontend",
    description: "UI and client-side discussion",
    createdAt: new Date().toISOString(),
  },
  {
    id: "backend",
    type: "group",
    name: "Backend",
    description: "API and server-side discussion",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dm-u1-u2",
    type: "private",
    name: "William & Amy",
    description: "Private chat between William and Amy",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dm-u1-u3",
    type: "private",
    name: "William & Kevin",
    description: "Private chat between William and Kevin",
    createdAt: new Date().toISOString(),
  },
];

function createPrivateRoomName(userA, userB) {
  return [userA.displayName, userB.displayName].sort().join(" & ");
}

async function getRooms() {
  const result = await pool.query(`
    SELECT id, type, name, description, created_at
    FROM rooms
    ORDER BY created_at ASC
  `);

  return result.rows.map((room) => ({
    id: room.id,
    type: room.type,
    name: room.name,
    description: room.description,
    createdAt: room.created_at,
  }));
}

async function getRoomById(roomId) {
  const result = await pool.query(
    `
    SELECT id, type, name, description, created_at
    FROM rooms
    WHERE id = $1
    LIMIT 1
    `,
    [roomId],
  );

  if (result.rows.length === 0) {
    return null;
  }

  const room = result.rows[0];

  return {
    id: room.id,
    type: room.type,
    name: room.name,
    description: room.description,
    createdAt: room.created_at,
  };
}

async function ensureRoomExists(roomId) {
  const room = await getRoomById(roomId);

  if (!room) {
    throw new Error(`Room "${roomId}" does not exist`);
  }

  return room;
}

function getPrivateRoomByUserIds(userId, friendUserId, roomMembers) {
  return (
    fakeRooms.find((room) => {
      if (room.type !== "private") {
        return false;
      }

      const memberIds = roomMembers
        .filter((membership) => membership.roomId === room.id)
        .map((membership) => membership.userId)
        .sort();
      const targetIds = [userId, friendUserId].sort();

      return (
        memberIds.length === 2 &&
        memberIds[0] === targetIds[0] &&
        memberIds[1] === targetIds[1]
      );
    }) || null
  );
}

async function addRoom(room) {
  const result = await pool.query(
    `
    INSERT INTO rooms (id, type, name, description, created_at)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, type, name, description, created_at
    `,
    [room.id, room.type, room.name, room.description ?? null, room.createdAt],
  );

  const insertedRoom = result.rows[0];

  return {
    id: insertedRoom.id,
    type: insertedRoom.type,
    name: insertedRoom.name,
    description: insertedRoom.description,
    createdAt: insertedRoom.created_at,
  };
}

async function removeRoom(roomId) {
  const result = await pool.query(
    `
    DELETE FROM rooms
    WHERE id = $1
    RETURNING id, type, name, description, created_at
    `,
    [roomId],
  );

  if (result.rows.length === 0) {
    throw new Error(`Room "${roomId}" does not exist`);
  }

  const removedRoom = result.rows[0];

  return {
    id: removedRoom.id,
    type: removedRoom.type,
    name: removedRoom.name,
    description: removedRoom.description,
    createdAt: removedRoom.created_at,
  };
}

module.exports = {
  fakeRooms,
  getRooms,
  getRoomById,
  ensureRoomExists,
  createPrivateRoomName,
  getPrivateRoomByUserIds,
  addRoom,
  removeRoom,
};

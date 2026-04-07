const { pool } = require("../db/postgres");

const { ensureRoomExists, getRoomById } = require("./rooms.repository");
const { ensureUserExists, getUserById } = require("./users.repository");

const fakeRoomMembers = [
  {
    roomId: "general",
    userId: "u1",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "general",
    userId: "u2",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "general",
    userId: "u3",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "frontend",
    userId: "u2",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "backend",
    userId: "u1",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "dm-u1-u2",
    userId: "u1",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "dm-u1-u2",
    userId: "u2",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "dm-u1-u3",
    userId: "u1",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
  {
    roomId: "dm-u1-u3",
    userId: "u3",
    role: "member",
    joinedAt: new Date().toISOString(),
  },
];

async function getRoomMembers(roomId) {
  await ensureRoomExists(roomId);

  const result = await pool.query(
    `
    SELECT room_id, user_id, role, joined_at
    FROM room_members
    WHERE room_id = $1
    ORDER BY joined_at ASC
    `,
    [roomId],
  );

  return result.rows.map((membership) => ({
    roomId: membership.room_id,
    userId: membership.user_id,
    role: membership.role,
    joinedAt: membership.joined_at,
  }));
}

function getRoomMemberProfiles(roomId) {
  return getRoomMembers(roomId).map((membership) => {
    const user = getUserById(membership.userId);

    return {
      roomId: membership.roomId,
      userId: membership.userId,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      role: membership.role,
      joinedAt: membership.joinedAt,
    };
  });
}

function getRoomOwner(roomId) {
  const ownerMembership =
    getRoomMembers(roomId).find((membership) => membership.role === "owner") ||
    null;

  if (!ownerMembership) {
    return null;
  }

  const owner = getUserById(ownerMembership.userId);

  return {
    userId: owner.id,
    username: owner.username,
    displayName: owner.displayName,
    avatarUrl: owner.avatarUrl,
    role: ownerMembership.role,
    joinedAt: ownerMembership.joinedAt,
  };
}

function getRoomDetail(room) {
  const members = getRoomMemberProfiles(room.id);

  return {
    ...room,
    memberCount: members.length,
    owner: getRoomOwner(room.id),
  };
}

function getUserRoomMemberships(userId) {
  ensureUserExists(userId);

  return fakeRoomMembers.filter((membership) => membership.userId === userId);
}

function getUserRooms(userId) {
  return getUserRoomMemberships(userId).map((membership) => {
    const room = getRoomById(membership.roomId);

    return {
      ...room,
      membership: {
        role: membership.role,
        joinedAt: membership.joinedAt,
      },
    };
  });
}

async function isRoomMember(roomId, userId) {
  const result = await pool.query(
    `
    SELECT 1
    FROM room_members
    WHERE room_id = $1 AND user_id = $2
    LIMIT 1
    `,
    [roomId, userId],
  );

  return result.rows.length > 0;
}

async function ensureRoomMember(roomId, userId) {
  await ensureRoomExists(roomId);
  ensureUserExists(userId);

  if (!(await isRoomMember(roomId, userId))) {
    throw new Error(`User "${userId}" is not a member of room "${roomId}"`);
  }
}

async function addRoomMember({ roomId, userId, role = "member" }) {
  await ensureRoomExists(roomId);
  ensureUserExists(userId);

  if (await isRoomMember(roomId, userId)) {
    throw new Error(`User "${userId}" is already in room "${roomId}"`);
  }

  const result = await pool.query(
    `
    INSERT INTO room_members (room_id, user_id, role)
    VALUES ($1, $2, $3)
    RETURNING room_id, user_id, role, joined_at
    `,
    [roomId, userId, role],
  );

  const membership = result.rows[0];

  return {
    roomId: membership.room_id,
    userId: membership.user_id,
    role: membership.role,
    joinedAt: membership.joined_at,
  };
}

async function removeRoomMembers(roomId) {
  await pool.query(
    `
    DELETE FROM room_members
    WHERE room_id = $1
    `,
    [roomId],
  );
}

module.exports = {
  fakeRoomMembers,
  getRoomMembers,
  getRoomMemberProfiles,
  getRoomOwner,
  getRoomDetail,
  getUserRoomMemberships,
  getUserRooms,
  isRoomMember,
  ensureRoomMember,
  addRoomMember,
  removeRoomMembers,
};

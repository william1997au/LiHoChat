const { ensureRoomExists, getRoomById } = require("./rooms.repository");
const {
  ensureUserExists,
  getUserById,
} = require("./users.repository");

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

function getRoomMembers(roomId) {
  ensureRoomExists(roomId);

  return fakeRoomMembers.filter((membership) => membership.roomId === roomId);
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

function isRoomMember(roomId, userId) {
  return fakeRoomMembers.some(
    (membership) =>
      membership.roomId === roomId && membership.userId === userId,
  );
}

function ensureRoomMember(roomId, userId) {
  ensureRoomExists(roomId);
  ensureUserExists(userId);

  if (!isRoomMember(roomId, userId)) {
    throw new Error(`User "${userId}" is not a member of room "${roomId}"`);
  }
}

function addRoomMember({ roomId, userId, role = "member" }) {
  ensureRoomExists(roomId);
  ensureUserExists(userId);

  if (isRoomMember(roomId, userId)) {
    throw new Error(`User "${userId}" is already in room "${roomId}"`);
  }

  const membership = {
    roomId,
    userId,
    role,
    joinedAt: new Date().toISOString(),
  };

  fakeRoomMembers.push(membership);

  return membership;
}

function removeRoomMembers(roomId) {
  const nextMemberships = fakeRoomMembers.filter(
    (membership) => membership.roomId !== roomId,
  );
  fakeRoomMembers.length = 0;
  fakeRoomMembers.push(...nextMemberships);
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

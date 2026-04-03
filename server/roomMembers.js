const { ensureRoomExists } = require("./rooms");
const { ensureUserExists, getUserById } = require("./users");

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

function getUserRoomMemberships(userId) {
  ensureUserExists(userId);

  return fakeRoomMembers.filter((membership) => membership.userId === userId);
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

module.exports = {
  fakeRoomMembers,
  getRoomMembers,
  getRoomMemberProfiles,
  getUserRoomMemberships,
  isRoomMember,
  ensureRoomMember,
  addRoomMember,
};

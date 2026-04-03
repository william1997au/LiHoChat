const { ensureFriendship } = require("./friendships");
const { removeMessagesByRoomId } = require("./messages");
const {
  addRoom,
  createDirectRoomName,
  ensureRoomExists,
  getDirectRoomByUserIds,
  getRoomById,
  removeRoom,
} = require("./rooms");
const {
  addRoomMember,
  fakeRoomMembers,
  getUserRoomMemberships,
  removeRoomMembers,
} = require("./roomMembers");
const { ensureUserExists, getUserById } = require("./users");

function getOrCreateDirectRoom(userId, friendUserId) {
  ensureUserExists(userId);
  ensureUserExists(friendUserId);
  ensureFriendship(userId, friendUserId);

  const existingRoom = getDirectRoomByUserIds(userId, friendUserId, fakeRoomMembers);

  if (existingRoom) {
    return {
      room: existingRoom,
      created: false,
    };
  }

  const user = getUserById(userId);
  const friend = getUserById(friendUserId);
  const roomId = `dm-${[userId, friendUserId].sort().join("-")}`;
  const room = addRoom({
    id: roomId,
    type: "direct",
    name: createDirectRoomName(user, friend),
    description: `Direct chat between ${user.displayName} and ${friend.displayName}`,
    createdAt: new Date().toISOString(),
  });

  addRoomMember({ roomId, userId });
  addRoomMember({ roomId, userId: friendUserId });

  return {
    room,
    created: true,
  };
}

function deleteRoomForUser(roomId, userId) {
  ensureUserExists(userId);
  const room = ensureRoomExists(roomId);

  const visibleRoom = getUserRoomMemberships(userId).some(
    (membership) => membership.roomId === roomId,
  );

  if (!visibleRoom) {
    throw new Error(`User "${userId}" cannot delete room "${roomId}"`);
  }

  if (room.type !== "direct") {
    throw new Error("Only direct rooms can be deleted for now");
  }

  removeMessagesByRoomId(roomId);
  removeRoomMembers(roomId);
  removeRoom(roomId);

  return room;
}

module.exports = {
  getOrCreateDirectRoom,
  deleteRoomForUser,
  getRoomById,
};

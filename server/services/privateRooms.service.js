const {
  ensureFriendship,
} = require("../repositories/friendships.repository");
const {
  removeMessagesByRoomId,
} = require("../repositories/messages.repository");
const {
  addRoom,
  createPrivateRoomName,
  ensureRoomExists,
  getPrivateRoomByUserIds,
  removeRoom,
} = require("../repositories/rooms.repository");
const {
  addRoomMember,
  fakeRoomMembers,
  getUserRoomMemberships,
  removeRoomMembers,
} = require("../repositories/roomMembers.repository");
const {
  ensureUserExists,
  getUserById,
} = require("../repositories/users.repository");

function getOrCreatePrivateRoom(userId, friendUserId) {
  ensureUserExists(userId);
  ensureUserExists(friendUserId);
  ensureFriendship(userId, friendUserId);

  const existingRoom = getPrivateRoomByUserIds(
    userId,
    friendUserId,
    fakeRoomMembers,
  );

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
    type: "private",
    name: createPrivateRoomName(user, friend),
    description: `Private chat between ${user.displayName} and ${friend.displayName}`,
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

  if (room.type !== "private") {
    throw new Error("Only private rooms can be deleted for now");
  }

  removeMessagesByRoomId(roomId);
  removeRoomMembers(roomId);
  removeRoom(roomId);

  return room;
}

module.exports = {
  getOrCreatePrivateRoom,
  deleteRoomForUser,
};

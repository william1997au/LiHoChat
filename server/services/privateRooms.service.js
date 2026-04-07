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
  getUserRoomMemberships,
  removeRoomMembers,
} = require("../repositories/roomMembers.repository");
const {
  ensureUserExists,
  getUserById,
} = require("../repositories/users.repository");

async function getOrCreatePrivateRoom(userId, friendUserId) {
  ensureUserExists(userId);
  ensureUserExists(friendUserId);
  ensureFriendship(userId, friendUserId);

  const existingRoom = await getPrivateRoomByUserIds(userId, friendUserId);

  if (existingRoom) {
    return {
      room: existingRoom,
      created: false,
    };
  }

  const user = getUserById(userId);
  const friend = getUserById(friendUserId);
  const roomId = `dm-${[userId, friendUserId].sort().join("-")}`;
  const room = await addRoom({
    id: roomId,
    type: "private",
    name: createPrivateRoomName(user, friend),
    description: `Private chat between ${user.displayName} and ${friend.displayName}`,
    createdAt: new Date().toISOString(),
  });

  await Promise.all([
    addRoomMember({ roomId, userId }),
    addRoomMember({ roomId, userId: friendUserId }),
  ]);

  return {
    room,
    created: true,
  };
}

async function deleteRoomForUser(roomId, userId) {
  ensureUserExists(userId);
  const room = await ensureRoomExists(roomId);

  const userRoomMemberships = await getUserRoomMemberships(userId);
  const visibleRoom = userRoomMemberships.some(
    (membership) => membership.roomId === roomId,
  );

  if (!visibleRoom) {
    throw new Error(`User "${userId}" cannot delete room "${roomId}"`);
  }

  if (room.type !== "private") {
    throw new Error("Only private rooms can be deleted for now");
  }

  removeMessagesByRoomId(roomId);
  await removeRoomMembers(roomId);
  await removeRoom(roomId);

  return room;
}

module.exports = {
  getOrCreatePrivateRoom,
  deleteRoomForUser,
};

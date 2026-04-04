const { addRoom } = require("../repositories/rooms.repository");
const { addRoomMember } = require("../repositories/roomMembers.repository");
const {
  ensureUserExists,
  getUserById,
} = require("../repositories/users.repository");

function createGroupRoom({ creatorUserId, name, memberUserIds = [] }) {
  const normalizedCreatorId = String(creatorUserId || "").trim();
  const normalizedName = String(name || "").trim();

  if (!normalizedCreatorId) {
    throw new Error("creatorUserId is required");
  }

  if (!normalizedName) {
    throw new Error("name is required");
  }

  ensureUserExists(normalizedCreatorId);

  const uniqueMemberIds = Array.from(
    new Set(
      [normalizedCreatorId, ...memberUserIds]
        .map((memberUserId) => String(memberUserId || "").trim())
        .filter(Boolean),
    ),
  );

  if (uniqueMemberIds.length < 2) {
    throw new Error("A group room must contain at least 2 unique members");
  }

  uniqueMemberIds.forEach((memberUserId) => {
    ensureUserExists(memberUserId);
  });

  const creator = getUserById(normalizedCreatorId);
  const roomId = `group-${Date.now()}`;
  const room = addRoom({
    id: roomId,
    type: "group",
    name: normalizedName,
    description: `Group created by ${creator.displayName}`,
    createdAt: new Date().toISOString(),
  });

  uniqueMemberIds.forEach((memberUserId) => {
    addRoomMember({
      roomId,
      userId: memberUserId,
      role: memberUserId === normalizedCreatorId ? "owner" : "member",
    });
  });

  return room;
}

module.exports = {
  createGroupRoom,
};

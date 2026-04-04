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

function getRooms() {
  return fakeRooms;
}

function getRoomById(roomId) {
  return fakeRooms.find((room) => room.id === roomId) || null;
}

function ensureRoomExists(roomId) {
  const room = getRoomById(roomId);

  if (!room) {
    throw new Error(`Room "${roomId}" does not exist`);
  }

  return room;
}

function getPrivateRoomByUserIds(userId, friendUserId, roomMembers) {
  return fakeRooms.find((room) => {
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
  }) || null;
}

function addRoom(room) {
  fakeRooms.push(room);
  return room;
}

function removeRoom(roomId) {
  const roomIndex = fakeRooms.findIndex((room) => room.id === roomId);

  if (roomIndex === -1) {
    throw new Error(`Room "${roomId}" does not exist`);
  }

  const [removedRoom] = fakeRooms.splice(roomIndex, 1);
  return removedRoom;
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

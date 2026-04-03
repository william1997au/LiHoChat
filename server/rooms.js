const fakeRooms = [
  {
    id: "general",
    name: "General",
    description: "Default room for all members",
    createdAt: new Date().toISOString(),
  },
  {
    id: "frontend",
    name: "Frontend",
    description: "UI and client-side discussion",
    createdAt: new Date().toISOString(),
  },
  {
    id: "backend",
    name: "Backend",
    description: "API and server-side discussion",
    createdAt: new Date().toISOString(),
  },
];

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

module.exports = {
  fakeRooms,
  getRooms,
  getRoomById,
  ensureRoomExists,
};

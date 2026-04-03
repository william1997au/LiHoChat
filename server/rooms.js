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
    type: "direct",
    name: "William & Amy",
    description: "Direct chat between William and Amy",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dm-u1-u3",
    type: "direct",
    name: "William & Kevin",
    description: "Direct chat between William and Kevin",
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

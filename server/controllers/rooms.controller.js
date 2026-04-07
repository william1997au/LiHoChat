const {
  getRoomDetail,
  getRoomMemberProfiles,
} = require("../repositories/roomMembers.repository");
const { getRooms, getRoomById } = require("../repositories/rooms.repository");
const { createGroupRoom } = require("../services/groupRooms.service");
const {
  deleteRoomForUser,
  getOrCreatePrivateRoom,
} = require("../services/privateRooms.service");

async function listRoomsController(req, res) {
  const rooms = await getRooms();

  res.json({ rooms });
}

async function getRoomController(req, res) {
  const room = await getRoomById(req.params.roomId);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json({ room: await getRoomDetail(room) });
}

async function listRoomMembersController(req, res) {
  try {
    res.json({
      roomId: req.params.roomId,
      members: await getRoomMemberProfiles(req.params.roomId),
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createRoomController(req, res) {
  try {
    const type = String(req.body?.type || "").trim();

    if (type === "private") {
      const userId = String(req.body?.userId || "").trim();
      const friendUserId = String(req.body?.friendUserId || "").trim();

      if (!userId || !friendUserId) {
        res.status(400).json({ error: "userId and friendUserId are required" });
        return;
      }

      const result = await getOrCreatePrivateRoom(userId, friendUserId);

      res.status(result.created ? 201 : 200).json(result);
      return;
    }

    if (type === "group") {
      const creatorUserId = String(req.body?.creatorUserId || "").trim();
      const name = String(req.body?.name || "").trim();
      const memberUserIds = Array.isArray(req.body?.memberUserIds)
        ? req.body.memberUserIds
        : [];

      const room = await createGroupRoom({
        creatorUserId,
        name,
        memberUserIds,
      });

      res.status(201).json({ room });
      return;
    }

    res.status(400).json({
      error: 'type must be either "private" or "group"',
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function deleteRoomController(req, res) {
  try {
    const userId = String(req.query.userId || "").trim();

    if (!userId) {
      res.status(400).json({ error: "userId is required" });
      return;
    }

    const room = await deleteRoomForUser(req.params.roomId, userId);

    res.json({
      room,
      deleted: true,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  listRoomsController,
  getRoomController,
  listRoomMembersController,
  createRoomController,
  deleteRoomController,
};

const { createGroupRoom } = require("../services/groupRooms.service");
const { getOrCreatePrivateRoom } = require("../services/privateRooms.service");

function createRoomController(req, res) {
  try {
    const type = String(req.body?.type || "").trim();

    if (type === "private") {
      const userId = String(req.body?.userId || "").trim();
      const friendUserId = String(req.body?.friendUserId || "").trim();

      if (!userId || !friendUserId) {
        res.status(400).json({ error: "userId and friendUserId are required" });
        return;
      }

      const result = getOrCreatePrivateRoom(userId, friendUserId);

      res.status(result.created ? 201 : 200).json(result);
      return;
    }

    if (type === "group") {
      const creatorUserId = String(req.body?.creatorUserId || "").trim();
      const name = String(req.body?.name || "").trim();
      const memberUserIds = Array.isArray(req.body?.memberUserIds)
        ? req.body.memberUserIds
        : [];

      const room = createGroupRoom({
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

module.exports = {
  createRoomController,
};

const {
  getFriendsByUserId,
} = require("../repositories/friendships.repository");
const { getUserRooms } = require("../repositories/roomMembers.repository");
const {
  getUsers,
  getUserById,
} = require("../repositories/users.repository");

function listUsersController(req, res) {
  res.json({ users: getUsers() });
}

function getUserController(req, res) {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ user });
}

async function listUserRoomsController(req, res) {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    userId: user.id,
    rooms: await getUserRooms(user.id),
  });
}

function listUserFriendsController(req, res) {
  const user = getUserById(req.params.userId);

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({
    userId: user.id,
    friends: getFriendsByUserId(user.id),
  });
}

module.exports = {
  listUsersController,
  getUserController,
  listUserRoomsController,
  listUserFriendsController,
};

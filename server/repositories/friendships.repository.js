const {
  ensureUserExists,
  getUserById,
} = require("./users.repository");

const fakeFriendships = [
  {
    id: "f1",
    userId: "u1",
    friendUserId: "u2",
    status: "accepted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "f2",
    userId: "u1",
    friendUserId: "u3",
    status: "accepted",
    createdAt: new Date().toISOString(),
  },
  {
    id: "f3",
    userId: "u2",
    friendUserId: "u3",
    status: "accepted",
    createdAt: new Date().toISOString(),
  },
];

function isFriendPair(userId, friendUserId) {
  return fakeFriendships.some((friendship) => {
    if (friendship.status !== "accepted") {
      return false;
    }

    return (
      (friendship.userId === userId &&
        friendship.friendUserId === friendUserId) ||
      (friendship.userId === friendUserId &&
        friendship.friendUserId === userId)
    );
  });
}

function ensureFriendship(userId, friendUserId) {
  ensureUserExists(userId);
  ensureUserExists(friendUserId);

  if (userId === friendUserId) {
    throw new Error("Cannot create a private room with the same user");
  }

  if (!isFriendPair(userId, friendUserId)) {
    throw new Error(`User "${friendUserId}" is not a friend of "${userId}"`);
  }
}

function getFriendsByUserId(userId) {
  ensureUserExists(userId);

  return fakeFriendships
    .filter((friendship) => {
      if (friendship.status !== "accepted") {
        return false;
      }

      return (
        friendship.userId === userId || friendship.friendUserId === userId
      );
    })
    .map((friendship) => {
      const friendId =
        friendship.userId === userId
          ? friendship.friendUserId
          : friendship.userId;
      const friend = getUserById(friendId);

      return {
        friendshipId: friendship.id,
        userId: friend.id,
        username: friend.username,
        displayName: friend.displayName,
        avatarUrl: friend.avatarUrl,
        createdAt: friendship.createdAt,
      };
    });
}

module.exports = {
  fakeFriendships,
  getFriendsByUserId,
  ensureFriendship,
};

const fakeUsers = [
  {
    id: "u1",
    username: "william",
    displayName: "William",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    username: "amy",
    displayName: "Amy",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u3",
    username: "kevin",
    displayName: "Kevin",
    avatarUrl: "",
    createdAt: new Date().toISOString(),
  },
];

function getUsers() {
  return fakeUsers;
}

function getUserById(userId) {
  return fakeUsers.find((user) => user.id === userId) || null;
}

function getUserByUsername(username) {
  return fakeUsers.find((user) => user.username === username) || null;
}

function ensureUserExists(userId) {
  const user = getUserById(userId);

  if (!user) {
    throw new Error(`User "${userId}" does not exist`);
  }

  return user;
}

module.exports = {
  fakeUsers,
  getUsers,
  getUserById,
  getUserByUsername,
  ensureUserExists,
};

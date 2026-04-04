const express = require("express");

const {
  listUsersController,
  getUserController,
  listUserRoomsController,
  listUserFriendsController,
} = require("../controllers/users.controller");

const usersRouter = express.Router();

usersRouter.get("/users", listUsersController);
usersRouter.get("/users/:userId", getUserController);
usersRouter.get("/users/:userId/rooms", listUserRoomsController);
usersRouter.get("/users/:userId/friends", listUserFriendsController);

module.exports = {
  usersRouter,
};

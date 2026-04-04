const express = require("express");

const { createRoomController } = require("../controllers/rooms.controller");

const roomsRouter = express.Router();

roomsRouter.post("/rooms", createRoomController);

module.exports = {
  roomsRouter,
};

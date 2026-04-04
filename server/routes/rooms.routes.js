const express = require("express");

const {
  listRoomsController,
  getRoomController,
  listRoomMembersController,
  createRoomController,
  deleteRoomController,
} = require("../controllers/rooms.controller");

const roomsRouter = express.Router();

roomsRouter.get("/rooms", listRoomsController);
roomsRouter.get("/rooms/:roomId", getRoomController);
roomsRouter.get("/rooms/:roomId/members", listRoomMembersController);
roomsRouter.post("/rooms", createRoomController);
roomsRouter.delete("/rooms/:roomId", deleteRoomController);

module.exports = {
  roomsRouter,
};

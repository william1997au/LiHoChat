const express = require("express");

const {
  listMessagesController,
  createMessageController,
} = require("../controllers/messages.controller");

const messagesRouter = express.Router();

messagesRouter.get("/messages", listMessagesController);
messagesRouter.post("/messages", createMessageController);

module.exports = {
  messagesRouter,
};

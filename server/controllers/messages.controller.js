const { getMessages } = require("../repositories/messages.repository");
const {
  createMessage,
  listMessagesByRoomId,
} = require("../services/messages.service");

function listMessagesController(req, res) {
  const { roomId } = req.query;

  if (!roomId) {
    res.json({ messages: getMessages() });
    return;
  }

  try {
    res.json({ messages: listMessagesByRoomId(roomId) });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

function createMessageController(req, res) {
  try {
    const newMessage = createMessage(req.body);
    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  listMessagesController,
  createMessageController,
};

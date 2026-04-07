const { getMessages } = require("../repositories/messages.repository");
const {
  createMessage,
  listMessagesByRoomId,
} = require("../services/messages.service");

async function listMessagesController(req, res) {
  const { roomId } = req.query;

  if (!roomId) {
    res.json({ messages: await getMessages() });
    return;
  }

  try {
    res.json({ messages: await listMessagesByRoomId(roomId) });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
}

async function createMessageController(req, res) {
  try {
    const newMessage = await createMessage(req.body);
    res.status(201).json({ message: newMessage });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  listMessagesController,
  createMessageController,
};

const fakeMessages = [
  {
    id: "1",
    roomId: "general",
    userId: "u1",
    username: "william",
    type: "text",
    content: "Hello LiHoChat",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    roomId: "general",
    userId: "u2",
    username: "amy",
    type: "text",
    content: "Hi William, I can see your message.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    roomId: "general",
    userId: "u3",
    username: "kevin",
    type: "text",
    content: "This is the default room for everyone.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "4",
    roomId: "frontend",
    userId: "u2",
    username: "amy",
    type: "text",
    content: "I am working on the chat page layout.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "5",
    roomId: "backend",
    userId: "u1",
    username: "william",
    type: "text",
    content: "I am building the message API first.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "6",
    roomId: "dm-u1-u2",
    userId: "u1",
    username: "william",
    type: "text",
    content: "Amy, this private room is ready now.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "7",
    roomId: "dm-u1-u2",
    userId: "u2",
    username: "amy",
    type: "text",
    content: "Good. Next step is building the friend flow.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "8",
    roomId: "dm-u1-u3",
    userId: "u3",
    username: "kevin",
    type: "text",
    content: "This one will become the private chat example.",
    createdAt: new Date().toISOString(),
  },
];

function getMessages() {
  return fakeMessages;
}

function getMessagesByRoomId(roomId) {
  return fakeMessages.filter((message) => message.roomId === roomId);
}

function addMessage(newMessage) {
  fakeMessages.push(newMessage);
  return newMessage;
}

function removeMessagesByRoomId(roomId) {
  const nextMessages = fakeMessages.filter((message) => message.roomId !== roomId);
  fakeMessages.length = 0;
  fakeMessages.push(...nextMessages);
}

module.exports = {
  fakeMessages,
  getMessages,
  getMessagesByRoomId,
  addMessage,
  removeMessagesByRoomId,
};

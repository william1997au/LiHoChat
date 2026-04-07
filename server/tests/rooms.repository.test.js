const { after, test } = require("node:test");
const assert = require("node:assert/strict");

const {
  addRoom,
  getPrivateRoomByUserIds,
  getRoomById,
  removeRoom,
} = require("../repositories/rooms.repository");

const {
  addRoomMember,
  getRoomMembers,
} = require("../repositories/roomMembers.repository");

const { pool } = require("../db/postgres");

after(async () => {
  await pool.end();
});

test("room repository can create, read, and delete a room", async () => {
  const roomId = `test-room-${Date.now()}`;

  try {
    const createdRoom = await addRoom({
      id: roomId,
      type: "group",
      name: "Test Room",
      description: "Integration test room",
      createdAt: new Date().toISOString(),
    });

    assert.equal(createdRoom.id, roomId);
    assert.equal(createdRoom.type, "group");
    assert.equal(createdRoom.name, "Test Room");

    const loadedRoom = await getRoomById(roomId);

    assert.equal(loadedRoom.id, roomId);
    assert.equal(loadedRoom.description, "Integration test room");

    const removedRoom = await removeRoom(roomId);

    assert.equal(removedRoom.id, roomId);

    const roomAfterDelete = await getRoomById(roomId);

    assert.equal(roomAfterDelete, null);
  } finally {
    await pool.query("DELETE FROM rooms WHERE id = $1", [roomId]);
  }
});

test("room member repository can add and list members", async () => {
  const roomId = `test-room-member-${Date.now()}`;

  try {
    await addRoom({
      id: roomId,
      type: "group",
      name: "Test room Members",
      description: "Integration test room members",
      createdAt: new Date().toISOString(),
    });

    const ownerMembership = await addRoomMember({
      roomId,
      userId: "u1",
      role: "owner",
    });

    assert.equal(ownerMembership.roomId, roomId);
    assert.equal(ownerMembership.userId, "u1");
    assert.equal(ownerMembership.role, "owner");

    const memberMembership = await addRoomMember({
      roomId,
      userId: "u2",
      role: "member",
    });

    assert.equal(memberMembership.roomId, roomId);
    assert.equal(memberMembership.userId, "u2");
    assert.equal(memberMembership.role, "member");

    const members = await getRoomMembers(roomId);

    assert.equal(members.length, 2);
    assert.deepEqual(members.map((member) => member.userId).sort(), [
      "u1",
      "u2",
    ]);
  } finally {
    await pool.query("DELETE FROM rooms WHERE id = $1", [roomId]);
  }
});

test("room repository can find an existing private room by member ids", async () => {
  const roomId = `test-private-room-${Date.now()}`;

  try {
    await addRoom({
      id: roomId,
      type: "private",
      name: "Test Private Room",
      description: "Integration test private room",
      createdAt: new Date().toISOString(),
    });

    await addRoomMember({
      roomId,
      userId: "u1",
      role: "member",
    });
    await addRoomMember({
      roomId,
      userId: "u2",
      role: "member",
    });

    const privateRoom = await getPrivateRoomByUserIds("u2", "u1");

    assert.equal(privateRoom.id, roomId);
    assert.equal(privateRoom.type, "private");
  } finally {
    await pool.query("DELETE FROM rooms WHERE id = $1", [roomId]);
  }
});

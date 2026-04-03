const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001";

async function request(pathname, options) {
  const response = await fetch(`${API_BASE_URL}${pathname}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function getRooms() {
  return request("/api/rooms");
}

export function getUserRooms(userId) {
  return request(`/api/users/${encodeURIComponent(userId)}/rooms`);
}

export function getUsers() {
  return request("/api/users");
}

export function getFriends(userId) {
  return request(`/api/users/${encodeURIComponent(userId)}/friends`);
}

export function getOrCreateDirectRoom(userId, friendUserId) {
  return request("/api/direct-rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, friendUserId }),
  });
}

export function deleteRoom(roomId, userId) {
  return request(
    `/api/rooms/${encodeURIComponent(roomId)}?userId=${encodeURIComponent(userId)}`,
    {
      method: "DELETE",
    },
  );
}

export function getMessages(roomId) {
  return request(`/api/messages?roomId=${encodeURIComponent(roomId)}`);
}

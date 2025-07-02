import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = [];
const rooms = [
  { id: "0", name: "General" },
  { id: "1", name: "Fun" },
];
let userRoomRelation = [];

io.on("connection", (socket) => {
  console.log("a user connected");
  const user = createUser(socket);
  initUserListeners(user);
});

server.listen(4000, () => {
  console.log("listening on *:3000");
});

function initUserListeners(user) {
  const { socket } = user;

  socket.emit("user", {
    id: user.id,
    color: user.color,
    name: user.name,
  });

  socket.emit("rooms", getRooms());

  socket.on("disconnect", () => {
    const userId = user.id;
    users = users.filter((currentUser) => currentUser.id !== userId);
    const roomId = findRoomIdByUserId(userId);
    if (roomId) removeUserFromRoom(userId, roomId);
    console.log("User disconnected. Now we have ", users.length, "users");
  });

  socket.on("join room", (roomId) => {
    const { fromRoomId } = switchRoom(user, roomId);
    console.log(`user switched rooms from ${fromRoomId} to ${roomId}`);
    updateRoomDetailsForAllUsersInRoom(roomId);
    if (fromRoomId) updateRoomDetailsForAllUsersInRoom(fromRoomId);
    updateRoomsForAllUsers();
  });

  socket.on("post message", (content) => {
    console.log("message sent", content);
    const roomId = findRoomIdByUserId(user.id);
    if (!roomId) throw new Error("User not in any room");
    postMessage(user, roomId, content);
  });

  socket.on("rename user", (name) => {
    console.log("user renamed to", name);
    user.name = name;
    socket.emit("user", convertUser(user));
    const roomId = findRoomIdByUserId(user.id);
    if (roomId) updateRoomDetailsForAllUsersInRoom(roomId);
  });
}

function createUser(socket) {
  const color = [
    "#FF5733", // Red
    "#33FF57", // Green
    "#3357FF", // Blue
    "#F1C40F", // Yellow
    "#8E44AD", // Purple
    "#E67E22", // Orange
    "#2ECC71", // Light Green
    "#3498DB", // Light Blue
  ];

  const firstName = [
    "Beautiful",
    "Charming",
    "Dazzling",
    "Elegant",
    "Fabulous",
    "Gorgeous",
    "Lovely",
    "Radiant",
    "Stunning",
    "Wonderful",
  ];

  const lastName = [
    "Butterfly",
    "Dragonfly",
    "Firefly",
    "Hummingbird",
    "Ladybug",
    "Moth",
    "Beetle",
    "Grasshopper",
    "Caterpillar",
    "Cricket",
  ];
  const randomFirstName =
    firstName[Math.floor(Math.random() * firstName.length)];
  const randomLastName = lastName[Math.floor(Math.random() * lastName.length)];
  const name = `${randomFirstName} ${randomLastName}`;

  const user = {
    id: Math.random().toString(),
    name,
    color: color[Math.floor(Math.random() * color.length)],
    socket: socket,
  };

  users.push(user);
  return user;
}

function switchRoom(user, roomId) {
  const currentRoomId = findRoomIdByUserId(user.id);
  if (currentRoomId) removeUserFromRoom(user.id, currentRoomId);
  addUserToRoom(user.id, roomId);
  return { fromRoomId: currentRoomId, toRoomId: roomId };
}

function postMessage(user, roomId, content) {
  const message = {
    id: Math.random().toString(),
    user: convertUser(user),
    roomId,
    content,
    timestamp: Date.now(),
  };

  getUsersInRoom(roomId).forEach((user) =>
    user.socket.emit("message", message)
  );
}

function getRooms() {
  return rooms.map((room) => {
    const membersRelations = userRoomRelation.filter(
      (relation) => relation.roomId === room.id
    );

    return {
      id: room.id,
      name: room.name,
      members: membersRelations.length,
    };
  });
}

function getUser(userId) {
  const user = users.find((user) => user.id === userId);
  return user;
}

function convertUser(user) {
  return {
    id: user.id,
    name: user.name,
    color: user.color,
  };
}

function getUsersInRoom(roomId) {
  const relations = userRoomRelation.filter(
    (relation) => relation.roomId === roomId /*&& relation.userId !== user.id*/
  );
  if (!relations.length)
    throw new Error("No relations for room. Cant send message");
  const usersInRoom = relations.map((relation) => getUser(relation.userId));
  if (!usersInRoom.length)
    throw new Error("No users in room. Cant send message");
  return users;
}

function getRoomDetails(roomId) {
  const room = rooms.find((room) => room.id === roomId);
  return {
    id: room.id,
    name: room.name,
    members: getUsersInRoom(roomId).map((user) => convertUser(user)),
  };
}

function findRoomIdByUserId(userId) {
  return userRoomRelation.find((relation) => relation.userId === userId)
    ?.roomId;
}

function removeUserFromRoom(userId, roomId) {
  const relationToRemove = userRoomRelation.find(
    (relation) => relation.userId === userId && relation.roomId === roomId
  );
  userRoomRelation = userRoomRelation.filter(
    (relation) => relation === relationToRemove
  );
}

function addUserToRoom(userId, roomId) {
  userRoomRelation.push({ userId, roomId });
}

function updateRoomsForAllUsers() {
  users.forEach((user) => user.socket.emit("rooms", getRooms()));
}

function updateRoomDetailsForAllUsersInRoom(roomId) {
  const usersInRoom = getUsersInRoom(roomId);
  usersInRoom.forEach((user) => {
    const roomDetails = getRoomDetails(roomId);
    if (!roomDetails) return;
    user.socket.emit("room details", roomDetails);
  });
}

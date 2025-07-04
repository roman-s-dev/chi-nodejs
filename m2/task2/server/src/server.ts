import express from "express";
import http from "http";
import { Server } from "socket.io";
import { RoomsController } from "./RoomsController.class.js";
import { UsersController } from "./UsersController.class.js";
import { UserRoomRelationController } from "./UserRoomRelationController.class.js";
import { User } from "./User.class.js";
import { CommunicationController } from "./CommmunicationController.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const roomsController = new RoomsController([
  { id: "0", name: "General" },
  { id: "1", name: "Fun" },
]);
const usersController = new UsersController();
const userRoomRelationController = new UserRoomRelationController(
  roomsController,
  usersController
);
const communicationController = new CommunicationController();

io.on("connection", (socket) => {
  console.log("a user connected");
  const user = usersController.addUser(socket);
  initUserListeners(user);
});

server.listen(4000, () => {
  console.log("listening on *:3000");
});

function initUserListeners(user: User) {
  const { socket } = user;

  socket.emit("user", user.convertToClientFormat());
  socket.emit("rooms", userRoomRelationController.getClientRoomsAll());

  socket.on("disconnect", () => {
    const userId = user.id;
    userRoomRelationController.removeUserFromAnyRoom(userId);
    usersController.removeUser(userId);
    console.log(`User [${user.name}] disconnected`);
  });

  socket.on("join room", (roomId: string) => {
    const { fromRoomId } = userRoomRelationController.switchRoom(
      user.id,
      roomId
    );
    if (fromRoomId)
      communicationController.sendLeaveRoomMessage(
        userRoomRelationController
          .getUserIdsInRoom(fromRoomId)
          .map((userId) => usersController.getUserById(userId))
          .filter((u) => !!u),
        user
      );
    communicationController.sendJoinRoomMessage(
      userRoomRelationController
        .getUserIdsInRoom(roomId)
        .map((userId) => usersController.getUserById(userId))
        .filter((u) => !!u),
      user
    );

    updateRoomDetailsForAllUsersInRoom(roomId);
    if (fromRoomId) updateRoomDetailsForAllUsersInRoom(fromRoomId);
    updateRoomsForAllUsers();

    console.log(
      `User [${user.name}] switched rooms from ${fromRoomId} to ${roomId}`
    );
  });

  socket.on("post message", (content: string) => {
    console.log("message sent", content);
    const roomId = userRoomRelationController.getRoomIdByUserId(user.id);
    if (!roomId) throw new Error("User not in any room");

    const usersSendTo = userRoomRelationController
      .getUserIdsInRoom(roomId)
      .filter((userId) => userId !== user.id)
      .map((userId) => usersController.getUserById(userId))
      .filter((u) => !!u);
    communicationController.sendMessage(usersSendTo, user, roomId, content);
  });

  socket.on("rename user", (name: string) => {
    console.log("user renamed to", name);
    user.updateName(name);
    socket.emit("user", user.convertToClientFormat());
    const roomId = userRoomRelationController.getRoomIdByUserId(user.id);
    if (roomId) updateRoomDetailsForAllUsersInRoom(roomId);
  });

  socket.on("typing", () => {
    console.log("user is typing");
    const roomId = userRoomRelationController.getRoomIdByUserId(user.id);
    if (!roomId) return;

    const usersInRoom = userRoomRelationController
      .getUserIdsInRoom(roomId)
      .map((userId) => usersController.getUserById(userId))
      .filter((u) => !!u)
      .filter((u) => u.id !== user.id); // Exclude the current user

    communicationController.sendUserTypingMessage(usersInRoom, user);
  });
}

function updateRoomsForAllUsers() {
  usersController.users.forEach((user) =>
    user.socket.emit("rooms", userRoomRelationController.getClientRoomsAll())
  );
}

function updateRoomDetailsForAllUsersInRoom(roomId: string) {
  const usersInRoom = userRoomRelationController
    .getUserIdsInRoom(roomId)
    .map((userId) => usersController.getUserById(userId))
    .filter((user) => !!user);

  usersInRoom.forEach((user) => {
    const roomDetails = userRoomRelationController.getClientRoom(roomId);
    if (!roomDetails) return;
    user.socket.emit("room details", roomDetails);
  });
}

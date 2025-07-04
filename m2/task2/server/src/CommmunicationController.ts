import { User } from "./User.class.js";
import { RoomClient } from "./UserRoomRelationController.class.js";

export class CommunicationController {
  constructor() {}

  public sendMessage(
    users: User[],
    user: User,
    roomId: string,
    content: string
  ) {
    const message = {
      type: "TEXT",
      id: Math.random().toString(),
      user: user.convertToClientFormat(),
      roomId,
      content,
      timestamp: Date.now(),
    };

    users.forEach((user) => user.socket.emit("message", message));
  }

  public sendJoinRoomMessage(users: User[], userJoined: User) {
    const message = {
      type: "STATUS",
      id: Math.random().toString(),
      user: userJoined.convertToClientFormat(),
      action: "join",
    };
    users.forEach((user) => {
      user.socket.emit("user joined", message);
    });
  }

  public sendLeaveRoomMessage(users: User[], userLeft: User) {
    const message = {
      type: "STATUS",
      id: Math.random().toString(),
      user: userLeft.convertToClientFormat(),
      action: "leave",
    };
    users.forEach((user) => {
      user.socket.emit("user left", message);
    });
  }

  public sendUserTypingMessage(users: User[], user: User) {
    users.forEach((u) => {
      u.socket.emit("user typing", user.convertToClientFormat());
    });
  }

  public updateRoomDetailsForUsers(users: User[], details: RoomClient) {
    users.forEach((user) => {
      user.socket.emit("room details", details);
    });
  }

  public updateRoomsListForUsers(users: User[], rooms: RoomClient[]) {
    users.forEach((user) => {
      user.socket.emit("rooms", rooms);
    });
  }
}

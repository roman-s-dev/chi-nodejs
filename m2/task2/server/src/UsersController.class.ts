import { Socket } from "socket.io";
import { User } from "./User.class.js";

export class UsersController {
  public users: User[] = [];

  constructor() {}

  addUser(socket: Socket) {
    const user = new User(socket);
    this.users.push(user);
    return user;
  }

  getUserById(userId: string) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId: string) {
    this.users = this.users.filter((user) => user.id !== userId);
  }
}

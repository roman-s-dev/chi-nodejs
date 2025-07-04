import { Room, RoomsController } from "./RoomsController.class.js";
import { UserClient } from "./User.class.js";
import { UsersController } from "./UsersController.class.js";

export type UserRoomRelation = {
  userId: string;
  roomId: string;
};

export type RoomClient = {
  id: string;
  name: string;
  members: UserClient[];
};

export class UserRoomRelationController {
  public relations: UserRoomRelation[] = [];

  constructor(
    public roomsController: RoomsController,
    public usersController: UsersController
  ) {}

  public addUserToRoom(userId: string, roomId: string) {
    this.relations.push({ userId, roomId });
  }

  public removeUserFromRoom(userId: string, roomId: string) {
    this.relations = this.relations.filter(
      (relation) => relation.userId !== userId || relation.roomId !== roomId
    );
  }

  public removeUserFromAnyRoom(userId: string) {
    this.relations = this.relations.filter(
      (relation) => relation.userId !== userId
    );
  }

  public switchRoom(userId: string, roomId: string) {
    const currentRoomId = this.getRoomIdByUserId(userId);
    if (currentRoomId) {
      this.removeUserFromRoom(userId, currentRoomId);
    }
    this.addUserToRoom(userId, roomId);
    return { fromRoomId: currentRoomId, toRoomId: roomId };
  }

  public getUserIdsInRoom(roomId: string): string[] {
    return this.relations
      .filter((relation) => relation.roomId === roomId)
      .map((relation) => relation.userId);
  }

  public getRoomIdByUserId(userId: string) {
    const relation = this.relations.find(
      (relation) => relation.userId === userId
    );
    return relation ? relation.roomId : undefined;
  }

  public getClientRoomsAll() {
    return this.roomsController.rooms.map((room) => this.getRoomDetails(room));
  }

  public getClientRoom(roomId: string): RoomClient {
    const room = this.roomsController.rooms.find((room) => room.id === roomId);
    if (!room) throw new Error(`Room with id ${roomId} not found`);

    return this.getRoomDetails(room);
  }

  private getRoomDetails(room: Room): RoomClient {
    const membersRelations = this.relations.filter(
      (relation) => relation.roomId === room.id
    );

    return {
      id: room.id,
      name: room.name,
      members: membersRelations
        .map((relation) =>
          this.usersController
            .getUserById(relation.userId)
            ?.convertToClientFormat()
        )
        .filter((u) => !!u),
    };
  }
}

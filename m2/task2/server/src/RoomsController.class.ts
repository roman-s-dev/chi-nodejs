export type Room = {
  id: string;
  name: string;
};

export class RoomsController {
  constructor(public rooms: Room[]) {}

  public getRoomById(roomId: string) {
    return this.rooms.find((room) => room.id === roomId);
  }
}

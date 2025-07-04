import { Socket } from "socket.io";

export type UserClient = {
  id: string;
  name: string;
  color: string;
};

export class User {
  public id: string = Math.random().toString(36).substring(2, 6);
  public name: string = this.getRandomName();
  public color: string = this.getRandomColor();

  constructor(public socket: Socket) {}

  public updateName(name: string) {
    this.name = name;
    this.socket.emit("user", this.convertToClientFormat());
  }

  public convertToClientFormat(): UserClient {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
    };
  }

  private getRandomName() {
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
    const randomLastName =
      lastName[Math.floor(Math.random() * lastName.length)];
    return `${randomFirstName} ${randomLastName}`;
  }

  private getRandomColor() {
    const colors = [
      "#FF5733", // Red
      "#33FF57", // Green
      "#3357FF", // Blue
      "#F1C40F", // Yellow
      "#8E44AD", // Purple
      "#E67E22", // Orange
      "#2ECC71", // Light Green
      "#3498DB", // Light Blue
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

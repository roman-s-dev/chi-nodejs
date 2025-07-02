export type User = {
  id: string;
  name: string;
  color: string;
};

export type Room = {
  id: string;
  name: string;
  members: number;
};

export type RoomDetails = {
  id: string;
  name: string;
  members: User[];
};

export type Message = {
  id: string;
  user: User;
  roomId: string;
  content: string;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
  color: string;
};

export type Room = {
  id: string;
  name: string;
  members: User[];
};

export type Message = TextMessage | StatusMessage;

export type TextMessage = {
  type: "TEXT";
  id: string;
  user: User;
  roomId: string;
  content: string;
  timestamp: string;
};
export type StatusMessage = {
  type: "STATUS";
  id: string;
  user: User;
  action: "join" | "leave";
};

import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import type { Message, Room, RoomDetails, User } from "./models";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnection: true,
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const joinedRoom = useRef(false);

  const [currentRoom, setCurrentRoom] = useState<RoomDetails | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    const handleRooms = (roomsFromServer: Room[]) => {
      if (!rooms.length && !joinedRoom.current) {
        console.log("Joining first room:", roomsFromServer[0]);
        socket.emit("join room", roomsFromServer[0].id);
        joinedRoom.current = true;
      }
      setRooms(roomsFromServer);
    };

    socket.on("rooms", handleRooms);
  }, [joinedRoom, rooms.length]);

  useEffect(() => {
    socket.on("room details", (roomDetails) => {
      console.log("Room details received:", roomDetails);
      setCurrentRoom(roomDetails);
    });

    socket.on("user", (user: User) => {
      setUser(user);
    });

    socket.on("message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
  }, []);

  const sendMessage = (content: string) => socket.emit("post message", content);

  return (
    <div className="App">
      <header>
        <h1>Chatter</h1>
        {user && <UserName user={user} />}
      </header>
      <main>
        <RoomPanel
          currentRoom={currentRoom}
          rooms={rooms}
          onRoomChange={(roomId) => socket.emit("join room", roomId)}
        />
        <section className="messages">
          <div className="message-list">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isMy={user?.id === message.user.id}
              />
            ))}
          </div>
          <MessageField onMessage={sendMessage} />
        </section>
      </main>
    </div>
  );
};

const UserName: React.FC<{ user: User }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);

  const changeName = (newName: string) => {
    if (newName.trim() !== "") {
      socket.emit("rename user", newName);
      setName(newName);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    setName(user.name);
  }, [user]);

  return isEditing ? (
    <div className="UserName">
      <input value={name} onChange={(ev) => setName(ev.target.value)} />
      <button onClick={() => changeName(name)}>Save</button>
      <button onClick={() => setIsEditing(false)}>Cancel</button>
    </div>
  ) : (
    <div
      className="UserName"
      style={{ color: user.color }}
      onClick={() => setIsEditing(true)}
    >
      {user.name}
    </div>
  );
};

const RoomPanel: React.FC<{
  currentRoom: RoomDetails | null;
  rooms: Room[];
  onRoomChange: (roomId: string) => void;
}> = ({ currentRoom, rooms, onRoomChange }) => {
  return (
    <section className="room">
      <div className="room-list">
        {rooms.map((room) => (
          <button
            key={room.id}
            className={`room-list__item ${
              currentRoom?.id === room.id ? "active" : ""
            }`}
            onClick={() => onRoomChange(room.id)}
          >
            {room.name} ({room.members})
          </button>
        ))}
      </div>

      <h2>{currentRoom?.name}</h2>
      <div className="users">
        <div>Users in this room: </div>
        {currentRoom?.members.map((user) => (
          <div style={{ color: user.color }}>{user.name}</div>
        ))}
      </div>
    </section>
  );
};

const Message: React.FC<{ message: Message; isMy: boolean }> = ({
  message,
  isMy,
}) => {
  const date = new Date(message.timestamp);
  const formattedDate = date.toLocaleString();
  const formattedTime = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const formattedDateTime = `${formattedDate} ${formattedTime}`;

  return (
    <div className={!isMy ? "Message" : "Message Message--my"}>
      <div className="Message__header">
        <div
          className="Message__header__name"
          style={{ color: message.user.color }}
        >
          {message.user.name}
        </div>
      </div>
      <div className="Message__body">{message.content}</div>
      <div className="Message__footer">
        <div className="Message__footer__timestamp">{formattedDateTime}</div>
      </div>
    </div>
  );
};

const MessageField: React.FC<{
  onMessage: (value: string) => void;
}> = ({ onMessage }) => {
  const [value, setValue] = useState("");

  const sendMessage = () => {
    if (value.trim() !== "") {
      onMessage(value);
      setValue("");
    }
  };

  useEffect(() => {
    const handleKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Enter") {
        sendMessage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [value]);

  return (
    <div className="input">
      <input
        value={value}
        onChange={(ev) => setValue(ev.target.value)}
        placeholder="Type your message here..."
      />
      <button className="send" onClick={() => sendMessage()}>
        Send
      </button>
    </div>
  );
};

export default App;

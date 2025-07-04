import { useEffect, useRef, useState } from "react";
import "./App.css";
import { io } from "socket.io-client";
import type { Message, Room, TextMessage, StatusMessage, User } from "./models";
import { debounce } from "lodash";

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
  reconnection: true,
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const joinedRoom = useRef(false);

  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [usersTypingMap, setUsersTypingMap] = useState<
    Record<string, { user: User; count: number }>
  >({});
  const usersTyping = Object.entries(usersTypingMap)
    .filter(([, obj]) => obj.count > 0)
    .map(([, { user }]) => user);

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

    socket.on("user joined", (message: StatusMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("user left", (message: StatusMessage) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("user typing", (user: User) => {
      console.log("User typing:", user);
      setUsersTypingMap((prevMap) => {
        const newMap = { ...prevMap };
        if (!newMap[user.id])
          newMap[user.id] = {
            user: user,
            count: 0,
          };
        newMap[user.id].count++;
        return newMap;
      });
      setTimeout(() => {
        setUsersTypingMap((prevMap) => {
          const newMap = { ...prevMap };
          if (newMap[user.id]) newMap[user.id].count--;
          return newMap;
        });
      }, 2000);
    });
  }, []);

  const sendMessage = (content: string) => {
    socket.emit("post message", content);
    setMessages((messages) => [
      ...messages,
      {
        type: "TEXT",
        id: Math.random().toString(),
        user: user!,
        roomId: currentRoom!.id,
        content,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const changeRoom = (roomId: string) => {
    socket.emit("join room", roomId);
    setMessages([]);
  };

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
          onRoomChange={changeRoom}
        />
        <section className="messages">
          <div className="message-list">
            {messages.map((message) =>
              message.type === "STATUS" ? (
                <StatusMessage
                  key={message.id}
                  message={message as StatusMessage}
                />
              ) : (
                <TextMessage
                  key={message.id}
                  message={message as TextMessage}
                  isMy={user?.id === (message as TextMessage).user.id}
                />
              )
            )}
          </div>
          <MessageField
            usersTyping={usersTyping}
            onMessage={sendMessage}
            onTyping={() => socket.emit("typing")}
          />
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
  currentRoom: Room | null;
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
            {room.name} ({room.members.length})
          </button>
        ))}
      </div>

      <h2>{currentRoom?.name}</h2>
      <div className="users">
        <div>Users in this room: </div>
        {currentRoom?.members.map((user) => (
          <div key={user.id} style={{ color: user.color }}>
            {user.name}
          </div>
        ))}
      </div>
    </section>
  );
};

const TextMessage: React.FC<{ message: TextMessage; isMy: boolean }> = ({
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

const StatusMessage: React.FC<{ message: StatusMessage }> = ({ message }) => {
  return (
    <div className="Message Message--status">
      <div className="Message__header">
        <div
          className="Message__header__name"
          style={{ color: message.user.color }}
        >
          {message.user.name}
        </div>
      </div>
      <div className="Message__body">
        {message.action === "join" ? "joined the room" : "left the room"}
      </div>
    </div>
  );
};

const MessageField: React.FC<{
  usersTyping: User[];
  onMessage: (value: string) => void;
  onTyping: () => void;
}> = ({ usersTyping, onMessage, onTyping }) => {
  const [value, setValue] = useState("");

  const sendMessage = () => {
    if (value.trim() !== "") {
      onMessage(value);
      setValue("");
    }
  };

  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setValue(ev.target.value);
    console.log("User typing not debounced:", ev.target.value);
    debounce(() => {
      console.log("User typing:", ev.target.value);
      onTyping();
    }, 500)();
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
  }, [sendMessage, value]);

  return (
    <div className="input">
      <div className="typing-indicator-container">
        {usersTyping.length > 0 && (
          <div className="typing-indicator">
            {usersTyping.map((user) => (
              <span key={user.id} style={{ color: user.color }}>
                {user.name}
              </span>
            ))}{" "}
            is typing...
          </div>
        )}
      </div>
      <input
        value={value}
        onChange={handleChange}
        placeholder="Type your message here..."
      />
      <button className="send" onClick={() => sendMessage()}>
        Send
      </button>
    </div>
  );
};

export default App;

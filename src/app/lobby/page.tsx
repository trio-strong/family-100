"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket: any;

export default function Lobby() {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState("");
  const [category, setCategory] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [username, setUsername] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const router = useRouter();

  useEffect(() => {
    socket = io("http://localhost:3001");

    socket.on("rooms", (rooms: any) => {
      setRooms(rooms);
    });

    socket.on("roomData", (data: any) => {
      if (data.room.users.includes(username)) {
        setInRoom(true);
        router.push(`/room/${data.room.id}`);
      }
    });

    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const createRoom = () => {
    const username = localStorage.getItem("username");
    socket.emit("createRoom", { roomName, category, username }, (room: any) => {
      router.push(`/room/${room.id}`);
    });
  };

  const joinRoom = (roomId: any) => {
    const username = localStorage.getItem("username");
    socket.emit("joinRoom", { roomId, username }, () => {
      router.push(`/room/${roomId}`);
    });
  };

  if (inRoom) {
    return <div>Joining room...</div>;
  }

  return (
    <div className="text-center">
      <h1>Lobby</h1>
      <button onClick={() => setShowCreateRoom(true)}>Create Room</button>
      {showCreateRoom && (
        <div>
          <input
            type="text"
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <button onClick={createRoom}>Submit</button>
        </div>
      )}
      <div>
        <h2>Available Rooms</h2>
        {rooms.map((room: any) => (
          <div key={room.id}>
            <span>{room.name}</span>
            <button onClick={() => joinRoom(room.id)}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}

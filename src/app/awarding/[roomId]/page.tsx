"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket: any;

export default function Awarding({
  params,
}: {
  readonly params: { roomId: string };
}) {
  const [room, setRoom] = useState<any>(null);
  const router = useRouter();
  const roomId = params.roomId;

  useEffect(() => {
    socket = io("http://localhost:3001");

    socket.emit("joinRoom", {
      roomId,
      username: localStorage.getItem("username"),
    });

    socket.on("roomData", (data: any) => {
      setRoom(data.room);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  if (!room) return <div>Loading...</div>;

  return (
    <div>
      <h1>Awarding</h1>
      <h2>
        Final Score - Team A: {room.scoreA}, Team B: {room.scoreB}
      </h2>
      <div>
        <h3>Team A</h3>
        <ul>
          {room.teamA.map((user: string) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Team B</h3>
        <ul>
          {room.teamB.map((user: string) => (
            <li key={user}>{user}</li>
          ))}
        </ul>
      </div>
      <button
        onClick={() => {
          socket.emit("deleteRoom", { roomId });
          router.push("/lobby");
        }}
      >
        Return to Lobby
      </button>
    </div>
  );
}

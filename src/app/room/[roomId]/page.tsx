"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket: any;

export default function Room({
  params,
}: {
  readonly params: { roomId: string };
}) {
  const [room, setRoom] = useState<any>(null);
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
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
      setTeamA(data.room.teamA);
      setTeamB(data.room.teamB);
    });

    socket.on("startGame", () => {
      router.push(`/game/${roomId}`);
    });

    // return () => {
    //   socket.emit("leaveRoom", {
    //     roomId,
    //     username: localStorage.getItem("username"),
    //   })
    //   socket.disconnect()
    // }
  }, [roomId]);

  const chooseTeam = (team: any) => {
    const username = localStorage.getItem("username");
    socket.emit("chooseTeam", { roomId, team, username });
  };

  const startGame = () => {
    socket.emit("startGame", { roomId });
    // router.push(`/game/${roomId}`);
  };

  const leaveRoom = () => {
    const username = localStorage.getItem("username");
    socket.emit("leaveRoom", { roomId, username }, () => {
      router.push("/lobby");
    });
  };

  if (!room) return <div>Loading...</div>;

  return (
    <div className="text-center">
      <h1>Room: {room.name}</h1>
      <div className="flex ">
        <div className="flex-1">
          <h2>Team A</h2>
          {teamA.map((user) => (
            <div key={user}>{user}</div>
          ))}
          <button onClick={() => chooseTeam("A")}>Choose Team A</button>
        </div>
        <div className="flex-1">
          <h2>Team B</h2>
          {teamB.map((user) => (
            <div key={user}>{user}</div>
          ))}
          <button onClick={() => chooseTeam("B")}>Choose Team B</button>
        </div>
      </div>
      {/* {teamA.length >= 2 && teamB.length >= 2 && (
        <button onClick={startGame}>Start Game</button>
      )} */}
      {room.roomMaster === localStorage.getItem("username") && (
        <button onClick={startGame}>Start Game</button>
      )}
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
}

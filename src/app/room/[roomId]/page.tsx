"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import Image from "next/image";
import ControllerIcon from "../../../../public/games-room-256.png";
import UserProfileIcon from "../../../../public/userProfile.png";

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
    socket = io(process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001");

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
    <div
      className="flex flex-col h-screen w-full "
      style={{
        backgroundImage: `url('/textura.png')`,
        backgroundRepeat: "repeat",
        backgroundColor: `#0a5efb`,
      }}
    >
      <div className="flex flex-col w-full h-full justify-center align-middle ">
        <div className="flex justify-center items-center w-full h-full">
          <div className="flex flex-col w-5/6 h-[700px] p-4 bg-white rounded-[40px] shadow-2xl shadow-black">
            <div className=" flex justify-center items-center w-full">
              <div className="flex justify-center items-center gap-2">
                <Image
                  src={ControllerIcon}
                  alt="User Icon"
                  className="flex w-14 h-auto "
                />
                <div className="flex justify-center items-center  text-3xl font-extrabold text-[#001b4d] ">
                  Room: {room.name}
                </div>
              </div>
            </div>
            <div className="flex grow justify-center w-full py-4 gap-y-4">
              <div className="flex flex-col justify-center max-h-full w-full gap-y-2 ">
                <div className="flex flex-col justify-center w-full min-h-20 gap-2">
                  <div className="flex justify-center items-center text-2xl font-extrabold text-[#001b4d] ">
                    Team A
                  </div>
                </div>
                <div className="flex flex-col items-center grow w-full gap-4">
                  {teamA.map((user: any) => (
                    <div
                      key={user}
                      className="flex justify-center items-center max-w-[500px] w-full h-14 outline outline-3 outline-[#001b4d] rounded-[20px]  bg-[#ffbf00] "
                    >
                      <div className="flex justify-center items-center w-1/4 h-full rounded-l-[12px] bg-[#001b4d]">
                        <Image
                          src={UserProfileIcon}
                          alt="User Icon"
                          className="flex w-10 h-auto "
                        />
                      </div>
                      <div className="flex justify-center items-center w-3/4 h-full text-3xl font-extrabold tracking-wide text-[#001b4d] ">
                        {user}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center min-h-10 ">
                  <button
                    className="flex justify-center items-center w-1/2 h-10 bg-[#001b4d] text-white font-bold rounded-[20px] "
                    onClick={() => chooseTeam("A")}
                  >
                    Choose Team A
                  </button>
                </div>
              </div>
              <div className="flex flex-col justify-center max-h-full w-full gap-y-2 ">
                <div className="flex flex-col justify-center w-full min-h-20 gap-2">
                  <div className="flex justify-center items-center text-2xl font-extrabold text-[#001b4d] ">
                    Team B
                  </div>
                </div>
                <div className="flex flex-col items-center grow w-full gap-4">
                  {teamB.map((user: any) => (
                    <div
                      key={user}
                      className="flex justify-center items-center max-w-[500px] w-full h-14 outline outline-3 outline-[#001b4d] rounded-[20px]  bg-[#ffbf00] "
                    >
                      <div className="flex justify-center items-center w-1/4 h-full rounded-l-[12px] bg-[#001b4d]">
                        <Image
                          src={UserProfileIcon}
                          alt="User Icon"
                          className="flex w-10 h-auto "
                        />
                      </div>
                      <div className="flex justify-center items-center w-3/4 h-full text-3xl font-extrabold tracking-wide text-[#001b4d] ">
                        {user}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center items-center min-h-10 ">
                  <button
                    className="flex justify-center items-center w-1/2 h-10 bg-[#001b4d] text-white font-bold rounded-[20px] "
                    onClick={() => chooseTeam("B")}
                  >
                    Choose Team A
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center w-full py-4 gap-4 ">
              {room.roomMaster === localStorage.getItem("username") && (
                <button
                  className="flex justify-center items-center max-w-52 w-full h-10 bg-[#001b4d] text-white font-bold rounded-[20px] "
                  onClick={startGame}
                >
                  Start Game
                </button>
              )}
              <button
                className="flex justify-center items-center max-w-52 w-full h-10 bg-[#ff3300] text-white font-bold rounded-[20px] "
                onClick={leaveRoom}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

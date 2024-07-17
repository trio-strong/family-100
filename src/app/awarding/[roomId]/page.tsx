"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import WinnerIcon from "../../../../public/winner.png";
import Image from "next/image";

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
    socket = io(process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001");

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
    <div className="flex flex-col max-w-screen w-full max-h-screen h-screen" style={{
      backgroundImage: `url('/textura.png')`,
      backgroundRepeat: 'repeat',
      backgroundColor: `#0a5efb`
    }}>
      <div className="flex justify-center items-center w-full h-full">
        <div className="flex item-center justify-center w-1/4 h-2/4 bg-white rounded-[40px] shadow-2xl p-4 shadow-black">
          <div className="flex-col flex justify-center items-center max-w-80 w-full">
            <div className="flex justify-center items-center w-full h-2/6 ">
              <Image src={WinnerIcon} alt="Winner Icon" />
            </div>
            <div className="flex-col flex justify-center items-center w-full h-3/6 ">
              {room.scoreA > room.scoreB ? (
                <>
                  <div className="flex justify-center items-center w-full h-4/6 text-9xl font-extrabold text-[#ffbf00]">
                    A</div>
                  <div className="flex justify-center items-center w-full h-2/6 text-2xl font-extrabold tracking-widest ">
                    Score : {room.scoreA}
                  </div>
                </>
              ) : (<>
                <div className="flex justify-center items-center w-full h-4/6 text-9xl font-extrabold text-[#ffbf00]">
                  B</div>
                <div className="flex justify-center items-center w-full h-2/6 text-2xl font-extrabold tracking-widest ">
                  Score : {room.scoreB}
                </div>
              </>)}
            </div>
            <div className="flex justify-center items-center w-full h-1/6 ">
              <div className="flex max-w-52 w-full p-2 bg-[#24a2d3] rounded-3xl  outline outline-4 hover:bg-[#ffbf00]">
                <button className="flex w-full justify-center font-bold tracking-widest  text-2xl text-white " onClick={() => {
                  socket.emit("deleteRoom", { roomId });
                  router.push("/lobby");
                }}>Ok!</button></div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}

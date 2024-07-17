"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

import DoorIcon from "../../../public/door.png";
import ControllerIcon from "../../../public/games-room-256.png";
import ExitIcon from "../../../public/Close-256.png";
import ExitIconB from "../../../public/Close-257.png";
import Image from "next/image";

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
    socket = io(process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3001");

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
  const logoutHandler = () => {
    localStorage.removeItem("username");
    router.push("/");
  };
  return (
    <div
      className="flex flex-col max-w-screen w-full max-h-screen h-screen "
      style={{
        backgroundImage: `url('/textura.png')`,
        backgroundRepeat: "repeat",
        backgroundColor: `#0a5efb`,
      }}
    >
      {showCreateRoom && (
        <div className="absolute flex flex-col w-full h-full justify-center align-middle ">
          <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-50">
            <div className="flex flex-col w-1/4 h-1/2 p-4 bg-white rounded-[40px] shadow-2xl shadow-black">
              <div className="relative flex justify-center items-center w-full h-1/4 ">
                <button
                  className="absolute top-0 right-0 p-2"
                  onClick={() => setShowCreateRoom(false)}
                >
                  <Image src={ExitIconB} alt="User Icon" className="flex w-5" />
                </button>
                <div className="flex justify-center items-center gap-2  ">
                  <Image
                    src={ControllerIcon}
                    alt="User Icon"
                    className="flex w-14 h-auto "
                  />
                  <div className="flex justify-center items-center  text-3xl font-extrabold text-[#001b4d] ">
                    Create Room
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center w-full py-4 gap-y-4 ">
                <input
                  type="text"
                  placeholder="Enter Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="max-w-80 w-full text-center p-2 border-2 border-[#868d96] rounded-xl font-extrabold tracking-widest focus:outline-none focus:border-[#001b4d]"
                />
                <input
                  type="text"
                  placeholder="Enter Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="max-w-80 w-full text-center p-2 border-2 border-[#868d96] rounded-xl font-extrabold tracking-widest focus:outline-none focus:border-[#001b4d]"
                />
                <div className="flex max-w-52 w-full p-2 bg-[#24a2d3] rounded-3xl outline outline-4 hover:bg-[#ffbf00]">
                  <button
                    onClick={() => {
                      createRoom();
                      setShowCreateRoom(false);
                    }}
                    className="flex w-full justify-center font-bold tracking-wide text-xl text-white "
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex w-full max-h-[7%] h-full justify-end items-center p-4">
        <button
          className="flex font-extrabold tracking-wider gap-3 text-2xl ustify-center items-center text-white"
          onClick={logoutHandler}
        >
          Exit <Image src={ExitIcon} alt="User Icon" className="flex w-5" />
        </button>
      </div>
      <div className="flex flex-col max-h-[93%] h-full gap-2 w-full px-20 pb-20 overflow-y-auto ">
        <div className="flex max-h-[10%] h-full justify-start items-center rounded-2xl px-5 gap-10 mb-3 bg-white shadow-2xl shadow-black">
          <div className="flex justify-end min-w-40 items-center text-3xl font-extrabold gap-2 text-[#001b4d] ">
            <Image
              src={ControllerIcon}
              alt="User Icon"
              className="flex w-14 h-auto "
            />
            Lobby
          </div>
          <div className="flex w-full ">
            <div className="flex justify-between items-center w-full ">
              <label className="input input-bordered flex max-w-96 h-9 w-full items-center gap-2">
                <input
                  type="text"
                  className="grow italic font-extrabold tracking-widest rounded-xl pl-5 outline outline-2 outline-[#001b4d] h-full"
                  placeholder="Search Room..."
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className=" h-8 w-8 "
                >
                  <path
                    fillRule="evenodd"
                    d="M9.965 11.026a5 5 0 1 1 1.06-1.06l2.755 2.754a.75.75 0 1 1-1.06 1.06l-2.755-2.754ZM10.5 7a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </label>
              <div className="flex justify-center rounded-2xl outline outline-3 outline-[#001b4d]items-center max-w-24 w-full h-10 font-black text-[#001b4d] bg-[#ffbf00]">
                <button onClick={() => setShowCreateRoom(true)}>
                  + CREATE
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className=" flex-col flex items-center w-full max-h-[83%] h-full px-3 gap-10 rounded-3xl bg-white  shadow-2xl shadow-black">
          <div className="flex flex-wrap w-full overflow-y-scroll my-2 px-10 pb-10 pt-5 gap-4 ">
            {rooms.map((room: any) => (
              <div
                key={room.id}
                className="flex max-w-xl w-full h-16 rounded-2xl outline outline-4 outline-[#001b4d] bg-[#ffbf00]"
              >
                <div className="flex grow p-2 text-[#001b4d] ">
                  <div className="flex-col justify-start px-2 min-w-80 h-full ">
                    <div className="flex justify-start items-center w-full text-2xl italic font-extrabold ">
                      {room.name}
                    </div>
                    <div className="flex justify-start items-center w-full text-xs italic font-bold tracking-widest">
                      Players: {room.users.length}/10
                    </div>
                  </div>
                  <div className="flex justify-center items-center grow h-full">
                    <div className="flex justify-center items-center w-full h-full text-lg italic font-black tracking-widest">
                      {" "}
                      {room.questions[0]?.category}
                    </div>
                  </div>
                </div>
                <div className="flex min-w-16 h-full justify-center items-center rounded-r-[10px] px-5 gap-3 bg-[#001b4d]">
                  <Image
                    src={DoorIcon}
                    alt="User Icon"
                    className="flex w-8 h-auto"
                  />
                  <button
                    className="font-extrabold text-2xl text-white"
                    onClick={() => joinRoom(room.id)}
                  >
                    JOIN
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

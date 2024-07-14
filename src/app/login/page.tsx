"use client";
import PlayIcon from "../../../public/playLogos.png";
import Texture from "../../../public/textura.png";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Login() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    // Simpan username di local storage atau context
    localStorage.setItem("username", username);
    router.push("/lobby");
  };

  return (
    <div
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundImage: `url('/textura.png')`,
        backgroundRepeat: 'repeat',
        backgroundColor: `#0a5efb`
      }}
    >
      <div className="flex-col flex items-center  w-1/4 min-h-96 p-4 bg-white rounded-[40px] shadow-2xl shadow-black">
        <Image src={PlayIcon} alt="User Icon" />
        <div className="flex flex-col items-center justify-center max-w-80 w-full py-4 gap-y-4 ">
          <input
            type="text"
            placeholder="Enter Your Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full text-center p-2 border-2 border-[#868d96] rounded-xl font-extrabold tracking-widest focus:outline-none focus:border-[#001b4d]"
          />
          <div className="flex max-w-52 w-full  p-2  bg-[#24a2d3] rounded-3xl  outline outline-4 hover:bg-[#ffbf00]">
            <button
              onClick={handleSubmit}
              className="flex w-full justify-center font-bold tracking-wide text-xl text-white "
            >
              Play!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    // Simpan username di local storage atau context
    localStorage.setItem("username", username);
    router.push("/lobby");
  };

  return (
    <div className="text-center">
      <h1>Login</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={handleSubmit}>Login</button>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

let socket: any;

export default function Game({
  params,
}: {
  readonly params: { roomId: string };
}) {
  const [room, setRoom] = useState<any>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [livesA, setLivesA] = useState(3);
  const [livesB, setLivesB] = useState(3);
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

    socket.on("startTurnBattle", (data: any) => {
      setRoom(data.room);
    });

    socket.on("updateTurn", (data: any) => {
      setRoom(data.room);
    });

    socket.on("nextRound", (data: any) => {
      setRoom(data.room);
      setLivesA(3);
      setLivesB(3);
    });

    socket.on("gameOver", (data: any) => {
      alert(
        `Game Over! Final Score - Team A: ${data.room.scoreA}, Team B: ${data.room.scoreB}`
      );
      router.push("/lobby");
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  const handleAnswer = () => {
    if (!socket) {
      alert("Connection is not established yet. Please try again.");
      return;
    }
    const username = localStorage.getItem("username");
    const team = room.teamA.includes(username) ? "A" : "B";

    // Tambahkan logika untuk babak perebutan currentTurn
    if (room.currentTurn === null) {
      socket.emit(
        "battleAnswer",
        { roomId, answer: currentAnswer, team, username },
        (response: { correct: boolean; score: number }) => {
          if (response.correct) {
            alert(`Correct! You scored ${response.score} points.`);
          } else {
            alert("Incorrect answer!");
          }
        }
      );
    } else {
      socket.emit(
        "answer",
        { roomId, answer: currentAnswer, team, username },
        (response: { correct: boolean; score: number }) => {
          if (response.correct) {
            alert(`Correct! You scored ${response.score} points.`);
          } else {
            alert("Incorrect answer!");
            // if (team === "A") {
            //   setLivesA((prevLives) => prevLives - 1);
            // } else {
            //   setLivesB((prevLives) => prevLives - 1);
            // }
          }
        }
      );
    }

    setCurrentAnswer("");
  };
  console.log(room);

  if (!room) return <div>Loading...</div>;

  return (
    <div>
      <h1>Game in Room: {room.name}</h1>
      <h2>
        Team A: {room.scoreA} - Team B: {room.scoreB}
      </h2>
      <div>
        <h3>Temporary Score</h3>
        <p>Team A: {room.tempScoreA}</p>
        <p>Team B: {room.tempScoreB}</p>
      </div>
      <div>
        <h3>Lives</h3>
        <p>Team A: {room.livesA}</p>
        <p>Team B: {room.livesB}</p>
      </div>
      <div>
        <h3>Current Question: {room.activeQuestion.question}</h3>
        <ul>
          {room.activeQuestion.answers.map(
            (
              a: { answer: string; score: number; revealed: boolean },
              index: number
            ) => (
              <li key={index}>
                {a.revealed ? a.answer + " - " + a.score : "-"}
              </li>
            )
          )}
        </ul>
      </div>
      <div>
        <h3>Players</h3>
        <div>
          <h4>Team A</h4>
          <ul>
            {room.teamA.map((user: string, index: number) => (
              <li key={user}>
                {user}{" "}
                {room.currentTurn === "A" &&
                  room.currentTurnIndex === index && (
                    <span>(Current Turn)</span>
                  )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Team B</h4>
          <ul>
            {room.teamB.map((user: string, index: number) => (
              <li key={user}>
                {user}{" "}
                {room.currentTurn === "B" &&
                  room.currentTurnIndex === index && (
                    <span>(Current Turn)</span>
                  )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {((room.currentTurn === "A" &&
        room.teamA[room.currentTurnIndex] ===
          localStorage.getItem("username") &&
        !room.answeredTeams.A) ||
        (room.currentTurn === "B" &&
          room.teamB[room.currentTurnIndex] ===
            localStorage.getItem("username") &&
          !room.answeredTeams.B) ||
        (room.currentTurn === null &&
          ((room.teamA.includes(localStorage.getItem("username")) &&
            !room.answeredTeams.A) ||
            (room.teamB.includes(localStorage.getItem("username")) &&
              !room.answeredTeams.B)))) && (
        <div>
          <input
            type="text"
            placeholder="Your answer"
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
          />
          <button onClick={handleAnswer}>Submit Answer</button>
        </div>
      )}
    </div>
  );
}

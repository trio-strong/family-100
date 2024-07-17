"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import io from "socket.io-client";
import Life from "../../../../public/heart.png";
import Image from "next/image";
import CorrectIcon from "../../../../public/correct.png";
import WrongIcon from "../../../../public/false.png";
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

  // Add a new state variable for the user's answer and whether it's correct or not
  const [userAnswer, setUserAnswer] = useState<{
    username: string;
    answer: string;
    correct: boolean;
  } | null>(null);

  // Add a new state variable for the countdown timer
  const [countdown, setCountdown] = useState(0);
  const [showResult, setShowResult] = useState(false);

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

    socket.on(
      "userAnswer",
      (data: { username: string; answer: string; correct: boolean }) => {
        // Update the state with the user's answer and whether it's correct or not
        setUserAnswer(data);

        // Hide the result when a new answer is received
        setShowResult(false);

        // Start the countdown timer
        setCountdown(5);

      }
    );

    socket.on("noMoreQuestions", (data: any) => {
      router.push(`/awarding/${roomId}`);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {

      timer = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {

      setShowResult(true);
      timer = setTimeout(() => {
        setUserAnswer(null);
        setShowResult(false);
      }, 3000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  console.log(room);

  if (!room) return <div>Loading...</div>;

  return (
    <div className="flex flex-col max-w-screen w-full max-h-screen h-screen" style={{
      backgroundImage: `url('/textura.png')`,
      backgroundRepeat: 'repeat',
      backgroundColor: `#0a5efb`
    }}>
      {
        userAnswer &&
        userAnswer.username !== localStorage.getItem("username") && (
          <div className="absolute flex flex-col w-full h-full justify-center align-middle ">
            <div className="flex justify-center items-center w-full h-full bg-black bg-opacity-50">
              <div className="flex flex-col w-1/4 h-1/2 p-4 bg-white rounded-[40px] shadow-2xl shadow-black">
                <div className="flex justify-center items-center w-full h-full">
                  {countdown === 0 ? (
                    <div className="flex-col flex justify-center items-center w-full h-full">
                      <div className=" flex justify-center items-center w-full h-2/6 text-4xl font-extrabold tracking-wider text-center text-[#001b4d]">
                        {userAnswer.correct ? "Correct!" : "Incorrect!"}
                      </div>
                      <div className=" flex justify-center items-center w-full h-4/6">
                        <Image src={userAnswer.correct ? CorrectIcon : WrongIcon} className="flex justify-center items-center w-40 h-40" alt="Answer Icon" />
                      </div>

                    </div>
                  ) : (
                    <div className="flex-col flex justify-center items-center w-full h-full">
                      <div className="flex-col flex justify-center items-center w-full h-1/2">
                        <div className="flex justify-center items-center w-full h-1/2 text-2xl font-extrabold tracking-wider text-center text-[#001b4d]">{userAnswer.username} answered:</div>
                        <div className="flex justify-center items-center w-full h-1/2 text-5xl font-black tracking-widest text-center text-[#001b4d]">{userAnswer.answer}</div>
                      </div>
                      <div className="flex justify-center items-center w-full h-1/2">
                        <div className="flex justify-center items-center w-32 h-32 rounded-full text-5xl font-black bg-[#ffbf00] outline outline-8 text-[#001b4d] outline-[#001b4d]">{countdown}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      }
      <div className="flex-col w-full h-full">
        <div className="flex justify-center items-center max-h-[20%] h-full">
          <div className="flex justify-center items-center w-1/6 h-full pt-3">
            <div className="flex justify-center items-center w-36 h-36 text-4xl font-extrabold tracking-wider rounded-xl outline outline-4 outline-white bg-[#ffbf00] text-[#001b4d]">{room.scoreA}</div>
          </div>
          <div className="flex-col justify-center items-center w-4/6 h-full">
            <div className="flex justify-center items-center w-full h-1/2">
              <div className="flex-col max-w-[40%] w-full h-full">
                <div className="flex justify-start items-end w-full h-4/6 text-4xl font-extrabold tracking-wider text-white">Team A</div>
                <div className="flex justify-start items-center w-full h-2/6 font-bold tracking-wider gap-2">
                  {Array.from({ length: room.livesA }, (_, index) => (
                    <Image key={index} src={Life} alt="Life Icon" className="flex w-5" />
                  ))}
                </div>
              </div>
              <div className="flex max-w-[20%] justify-center items-center w-full h-full  text-5xl font-extrabold text-white">VS</div>
              <div className="flex-col max-w-[40%] w-full h-full">
                <div className="flex justify-end items-end w-full h-4/6 text-4xl font-extrabold tracking-wider text-white">Team B</div>
                <div className="flex justify-end items-center w-full h-2/6 font-bold tracking-wider gap-2">
                  {Array.from({ length: room.livesB }, (_, index) => (
                    <Image key={index} src={Life} alt="Life Icon" className="flex w-5" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center w-full h-1/2 ">
              <div className="flex justify-center items-center min-w-4/6 h-5/6 outline outline-4 outline-white bg-[#ffbf00] rounded-2xl shadow-2xl shadow-black">
                <div className="flex justify-center items-center w-11/12 h-full text-2xl font-extrabold tracking-wider text-[#001b4d] text-center">{room.activeQuestion.question}</div>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center w-1/6 h-full pt-3">
            <div className="flex justify-center items-center w-36 h-36 text-4xl font-extrabold tracking-wider rounded-xl outline outline-4 outline-white bg-[#ffbf00] text-[#001b4d]">{room.scoreB}</div>
          </div>
        </div>
        <div className="flex justify-center items-center max-h-[55%] h-full">
          <div className="flex-col flex justify-center items-center max-w-[80%] w-full h-full">
            <div className="flex-col flex justify-center items-center max-h-[90%] h-full max-w-[80%] p-2 w-full rounded-2xl bg-white shadow-2xl shadow-black">
              <div className="flex justify-center items-center w-full h-[15%] ">
                <div className="flex justify-center items-center h-full min-w-20 text-2xl rounded-full bg-[#ffbf00] font-extrabold tracking-wider text-[#001b4d]">{room.tempScoreA + room.tempScoreB}</div>
              </div>
              <div className="flex justify-center items-center h-[85%] w-full ">
                <div className="flex-col flex justify-start pt-5 items-center h-full w-1/2 gap-5">
                  {room.activeQuestion.answers.slice(0, Math.ceil(room.activeQuestion.answers.length / 2)).map(
                    (a: { answer: string; score: number; revealed: boolean }, index: number) => (
                      <div key={index} className="flex justify-start items-center max-h-[17%] h-full max-w-[90%] w-full text-xl font-extrabold outline outline-4 outline-[#001b4d] bg-[#ffbf00] rounded-2xl">
                        <div className="flex justify-center items-center h-full w-[80%] text-[#001b4d]">{a.revealed && countdown === 0 ? a.answer : "????"}</div>
                        <div className="flex justify-center items-center h-full w-[20%] text-white rounded-r-[13px] bg-[#001b4d]">{a.revealed && countdown === 0 ? a.score : "?"}</div>
                      </div>
                    )
                  )}
                </div>
                <div className="flex-col flex justify-start pt-5 items-center h-full w-1/2 gap-5">
                  {room.activeQuestion.answers.slice(Math.ceil(room.activeQuestion.answers.length / 2)).map(
                    (a: { answer: string; score: number; revealed: boolean }, index: number) => (
                      <div key={index} className="flex justify-start items-center max-h-[17%] h-full max-w-[90%] w-full text-xl font-extrabold outline outline-4 outline-[#001b4d] bg-[#ffbf00] rounded-2xl">
                        <div className="flex justify-center items-center h-full w-[80%] text-[#001b4d]">{a.revealed && countdown === 0 ? a.answer : "????"}</div>
                        <div className="flex justify-center items-center h-full w-[20%] text-white rounded-r-[13px] bg-[#001b4d]">{a.revealed && countdown === 0 ? a.score : "?"}</div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center max-h-[25%] h-full pt-2">
          <div className="flex justify-between items-center h-full max-w-[90%] w-full ">
            <div className="flex justify-center items-end h-full w-[37%]  gap-4">
              {room.teamA.map((user: string, index: number) => {
                const isCurrentTurn = room.currentTurn === "A" && room.currentTurnIndex === index;
                const animationClass = isCurrentTurn ? 'grow' : 'shrink';
                return (
                  <div key={index} className={`flex-col flex justify-center items-center max-w-[13%] w-full rounded-t-xl outline outline-4 outline-[#001b4d] bg-[#ffbf00] ${animationClass}`}>
                    <div className="flex justify-center items-center h-1/6 w-full bg-[#001b4d] rounded-t-[10px] text-white font-bold">{index + 1}</div>
                    <div className="flex justify-center items-center h-5/6 w-full text-2xl font-extrabold tracking-wide text-[#001b4d]">{user.substring(0, 3).toLocaleUpperCase()}</div>
                  </div>
                );
              })}
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
                <div className="flex-col flex justify-center items-center gap-4 h-full w-[25%]">
                  <div className="flex-col flex justify-center items-center w-full h-5/6 gap-4 bg-white shadow-2xl shadow-black rounded-xl">
                    <input className="font-extrabold text-center tracking-widest w-[90%] rounded-xl outline outline-[3px] outline-[#001b4d] max-h-10 h-full" type="text" placeholder="Your Answer" value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} />
                    <button className="flex max-w-32 w-full p-2 bg-[#24a2d3] rounded-3xl outline outline-4 hover:bg-[#ffbf00] justify-center text-lg font-extrabold tracking-wider" onClick={handleAnswer}>Submit</button>
                  </div>
                </div>
              )}
            <div className="flex justify-center items-end h-full w-[37%] gap-4">
              {room.teamB.map((user: string, index: number) => {
                const isCurrentTurn = room.currentTurn === "B" && room.currentTurnIndex === index;
                const animationClass = isCurrentTurn ? 'grow' : 'shrink';
                return (
                  <div key={index} className={`flex-col flex justify-center items-center max-w-[13%] w-full rounded-t-xl outline outline-4 outline-[#001b4d] bg-[#ffbf00] ${animationClass}`}>
                    <div className="flex justify-center items-center h-1/6 w-full bg-[#001b4d] rounded-t-[10px] text-white font-bold">{index + 1}</div>
                    <div className="flex justify-center items-center h-5/6 w-full text-2xl font-extrabold tracking-wide text-[#001b4d]">{user.substring(0, 3).toLocaleUpperCase()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

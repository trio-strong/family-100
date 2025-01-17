const http = require("http");
const { Server } = require("socket.io");
const openAI = require("./openai");

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: "*", // Replace with your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

let rooms = [];
const questions = [
  {
    id: 1,
    question: "Apa yang biasanya dilakukan orang di pagi hari?",
    answers: [
      { answer: "Sarapan", score: 30, revealed: false },
      { answer: "Mandi", score: 20, revealed: false },
      { answer: "Olahraga", score: 15, revealed: false },
      { answer: "Bekerja", score: 10, revealed: false },
      { answer: "Tidur lagi", score: 5, revealed: false },
    ],
    category: "Pagi",
  },
  {
    id: 2,
    question: "Apa yang biasanya orang minum di pagi hari?",
    answers: [
      { answer: "Kopi", score: 30, revealed: false },
      { answer: "Teh", score: 25, revealed: false },
      { answer: "Air putih", score: 20, revealed: false },
      { answer: "Jus buah", score: 15, revealed: false },
      { answer: "Susu", score: 10, revealed: false },
    ],
    category: "Pagi",
  },
];

// openAI("sarapan pagi", 1).then(console.log);

io.on("connection", (socket) => {
  console.log("a user connected");

  socket.emit("rooms", rooms);

  socket.on(
    "createRoom",
    async ({ roomName, category, username }, callback) => {
      // const roomQuestions = questions.filter((q) => q.category === category);
      const roomQuestions = await openAI.createQuestion(category, 3);
      const room = {
        id: `${rooms.length + 1}`,
        name: roomName,
        scoreA: 0,
        scoreB: 0,
        tempScoreA: 0,
        tempScoreB: 0,
        questions: roomQuestions,
        activeQuestion: null,
        answeredTeams: {},
        users: [username],
        teamA: [],
        teamB: [],
        currentTurn: null,
        currentTurnIndex: 0,
        roomMaster: username,
        currentTurnPlayer: null,
        livesA: 3,
        livesB: 3,
      };
      rooms.push(room);
      io.emit("rooms", rooms);
      callback(room);
    }
  );

  socket.on("joinRoom", ({ roomId, username }, callback) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      if (!room.users.includes(username)) {
        room.users.push(username);
      }
      socket.join(roomId);
      io.to(roomId).emit("roomData", { room });
      if (typeof callback === "function") {
        // Check if callback is a function
        callback(); // Acknowledge the join action
      }
    }
  });

  socket.on("leaveRoom", ({ roomId, username }, callback) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.users = room.users.filter((user) => user !== username);
      room.teamA = room.teamA.filter((user) => user !== username);
      room.teamB = room.teamB.filter((user) => user !== username);

      socket.leave(roomId);
      io.to(roomId).emit("roomData", { room });

      if (callback) callback();
    }
  });
  socket.on("deleteRoom", ({ roomId }) => {
    rooms = rooms.filter((r) => r.id !== roomId);
    // io.to(roomId).emit("noMoreQuestions", { room });
    io.emit("rooms", rooms);
  });

  socket.on("chooseTeam", ({ roomId, team, username }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      if (team === "A") {
        if (!room.teamA.includes(username)) {
          room.teamA.push(username);
          room.teamB = room.teamB.filter((user) => user !== username);
        }
      } else if (team === "B") {
        if (!room.teamB.includes(username)) {
          room.teamB.push(username);
          room.teamA = room.teamA.filter((user) => user !== username);
        }
      }
      console.log(room);
      io.to(roomId).emit("roomData", { room });
    }
  });

  socket.on("startGame", ({ roomId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      room.activeQuestion = room.questions.shift();
      io.to(roomId).emit("startGame", { room });
    }
  });

  socket.on("answer", async ({ roomId, answer, team, username }, callback) => {
    const room = rooms.find((r) => r.id === roomId);
    io.to(roomId).emit("showCountdown", {
      username,
      answer,
      correct: null,
      score: null,
    });
    if (room) {
      const activeQuestion = room.activeQuestion;
      // const answerObj = activeQuestion.answers.find(
      //   (a) => a.answer.toLowerCase() === answer.toLowerCase()
      // );
      const realAnswers = activeQuestion.answers.map((a) => a.answer);
      const comparisonResult = await openAI.compareAnswer(answer, realAnswers);
      console.log(comparisonResult);

      if (comparisonResult.status && comparisonResult.percentage > 70) {
        const answerObj = activeQuestion.answers.find(
          (a) =>
            a.answer.toLowerCase() === comparisonResult.matched.toLowerCase()
        );

        setTimeout(() => {
          io.to(roomId).emit("userAnswer", {
            username,
            answer,
            correct: true,
            score: answerObj.score,
          });
        }, 5000);

        if (answerObj && !answerObj.revealed) {
          answerObj.revealed = true;
          if (team === "A") {
            room.tempScoreA += answerObj.score;
          } else if (team === "B") {
            room.tempScoreB += answerObj.score;
          }

          const allRevealed = activeQuestion.answers.every((a) => a.revealed);

          if (allRevealed) {
            //sapu bersih
            if (team === "A") {
              room.scoreA += room.tempScoreA;
            } else {
              room.scoreB += room.tempScoreB;
            }
            if (room.questions.length > 0) {
              room.tempScoreA = 0;
              room.tempScoreB = 0;
              room.activeQuestion = room.questions.shift();
              room.currentTurn = null;
              setTimeout(() => {
                io.to(roomId).emit("roomData", { room });
              }, 10000);
            } else {
              // If there are no more questions, emit a "gameOver" event
              setTimeout(() => {
                io.to(roomId).emit("noMoreQuestions", { room });
              }, 10000);
            }

            // io.to(roomId).emit("roomData", { room });
            setTimeout(() => {
              io.to(roomId).emit("nextRound", { room });
            }, 2000);
          } else {
            if (room.livesA === 0 || room.livesB === 0) {
              const opponentTeam = room.currentTurn;

              // If the opponent team answers correctly, transfer the temporary score

              if (opponentTeam === "A") {
                room.tempScoreA += room.tempScoreB;
                room.scoreA += room.tempScoreA;
                room.tempScoreB = 0;
              } else {
                room.tempScoreB += room.tempScoreA;
                room.scoreB += room.tempScoreB;
                room.tempScoreA = 0;
              }

              if (room.questions.length > 0) {
                room.livesA = 3;
                room.livesB = 3;
                room.tempScoreA = 0;
                room.tempScoreB = 0;
                room.currentTurn = null;
                room.activeQuestion = room.questions.shift();
                setTimeout(() => {
                  io.to(roomId).emit("roomData", { room });
                }, 10000);
              } else {
                // If there are no more questions, emit a "gameOver" event
                setTimeout(() => {
                  io.to(roomId).emit("noMoreQuestions", { room });
                }, 10000);
              }

              // Reset the lives of the team that lost all their lives
              // if (room.livesA === 0) {
              //   room.livesA = 3;
              // } else {
              //   room.livesB = 3;
              // }
              // io.to(roomId).emit("roomData", { room });
            } else {
              room.currentTurnIndex++;
              if (team === "A") {
                if (room.currentTurnIndex >= room.teamA.length) {
                  room.currentTurnIndex = 0;
                }
                room.currentTurnPlayer = room.teamA[room.currentTurnIndex];
              } else {
                if (room.currentTurnIndex >= room.teamB.length) {
                  room.currentTurnIndex = 0;
                }
                room.currentTurnPlayer = room.teamB[room.currentTurnIndex];
              }
              setTimeout(() => {
                io.to(roomId).emit("roomData", { room });
              }, 5000);
            }
          }

          if (typeof callback === "function") {
            callback({ correct: true, score: answerObj.score });
          }
        }
      } else {
        if (typeof callback === "function") {
          callback({ correct: false });
        }

        setTimeout(() => {
          io.to(roomId).emit("userAnswer", {
            username,
            answer,
            correct: false,
          });
        }, 5000);

        if (room.livesA === 0 || room.livesB === 0) {
          // Add the temporary score to the score
          if (team === "B") {
            room.scoreA += room.tempScoreA;
            room.tempScoreA = 0;
          } else {
            room.scoreB += room.tempScoreB;
            room.tempScoreB = 0;
          }
          // Check if there are any remaining questions
          if (room.questions.length > 0) {
            room.livesA = 3;
            room.livesB = 3;
            room.tempScoreA = 0;
            room.tempScoreB = 0;
            room.currentTurn = null;
            room.activeQuestion = room.questions.shift();
            setTimeout(() => {
              io.to(roomId).emit("roomData", { room });
            }, 10000);
          } else {
            // If there are no more questions, emit a "gameOver" event
            setTimeout(() => {
              io.to(roomId).emit("noMoreQuestions", { room });
            }, 10000);
          }

          return;
        }

        if (team === "A") {
          room.livesA--;
        } else if (team === "B") {
          room.livesB--;
        }

        if (room.livesA === 0 || room.livesB === 0) {
          const opponent = team === "A" ? "B" : "A";
          room.currentTurn = opponent;

          room.currentTurnIndex = Math.floor(
            Math.random() * room[`team${opponent}`].length
          );

          // If the opponent team answers correctly, transfer the temporary score
          // if (response.correct) {
          //   if (opponentTeam === "A") {
          //     room.tempScoreA += room.tempScoreB;
          //     room.scoreA += room.tempScoreA;
          //     room.tempScoreB = 0;
          //   } else {
          //     room.tempScoreB += room.tempScoreA;
          //     room.scoreB += room.tempScoreB;
          //     room.tempScoreA = 0;
          //   }
          // }

          // Reset the lives of the team that lost all their lives
          // if (room.livesA === 0) {
          //   room.livesA = 3;
          // } else {
          //   room.livesB = 3;
          // }
          setTimeout(() => {
            io.to(roomId).emit("roomData", { room });
          }, 5000);

          // setTimeout(() => {
          //   io.to(roomId).emit("nextRound", { room });
          // }, 2000);
        } else {
          room.currentTurnIndex++;
          if (team === "A") {
            if (room.currentTurnIndex >= room.teamA.length) {
              room.currentTurnIndex = 0;
            }
            room.currentTurnPlayer = room.teamA[room.currentTurnIndex];
          } else {
            if (room.currentTurnIndex >= room.teamB.length) {
              room.currentTurnIndex = 0;
            }
            room.currentTurnPlayer = room.teamB[room.currentTurnIndex];
          }
          setTimeout(() => {
            io.to(roomId).emit("roomData", { room });
          }, 5000);
        }
      }
    }
  });

  socket.on("nextRound", ({ roomId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      if (room.questions.length > 0) {
        room.activeQuestion = room.questions.shift();
        room.tempScoreA = 0;
        room.tempScoreB = 0;
        room.livesA = 3;
        room.livesB = 3;
        io.to(roomId).emit("nextRound", { room });
      } else {
        // If there are no more questions, emit a "gameOver" event
        io.to(roomId).emit("gameOver");
      }
    }
  });

  // Logika untuk menangani jawaban di babak perebutan
  socket.on(
    "battleAnswer",
    async ({ roomId, answer, team, username }, callback) => {
      const room = rooms.find((r) => r.id === roomId);
      if (room && room.currentTurn === null) {
        const activeQuestion = room.activeQuestion;
        // const answerObj = activeQuestion.answers.find(
        //   (a) => a.answer.toLowerCase() === answer.toLowerCase()
        // );

        // If already answer mark the team as having answered
        if (team === "A") {
          room.answeredTeams.A = true;
        } else if (team === "B") {
          room.answeredTeams.B = true;
        }
        console.log(room);

        io.to(roomId).emit("roomData", { room });

        const realAnswers = activeQuestion.answers.map((a) => a.answer);
        const comparisonResult = await openAI.compareAnswer(
          answer,
          realAnswers
        );
        console.log(comparisonResult);

        if (comparisonResult.status && comparisonResult.percentage > 70) {
          const answerObj = activeQuestion.answers.find(
            (a) =>
              a.answer.toLowerCase() === comparisonResult.matched.toLowerCase()
          );
          if (answerObj && !answerObj.revealed) {
            answerObj.revealed = true;

            if (team === "A") {
              room.tempScoreA += answerObj.score;
            } else if (team === "B") {
              room.tempScoreB += answerObj.score;
            }

            const allRevealed = activeQuestion.answers.every((a) => a.revealed);

            if (allRevealed || (room.answeredTeams.A && room.answeredTeams.B)) {
              if (room.tempScoreA > room.tempScoreB) {
                room.currentTurn = "A";
              } else {
                room.currentTurn = "B";
              }
              room.answeredTeams = {}; // Reset the answeredTeams for the next round
              io.to(roomId).emit("roomData", { room });
            }

            if (typeof callback === "function") {
              callback({ correct: true, score: answerObj.score });
            }
          }
        } else {
          // Check if both teams have answered
          if (room.answeredTeams.A && room.answeredTeams.B) {
            if (room.tempScoreA > room.tempScoreB) {
              room.currentTurn = "A";
            } else if (room.tempScoreA < room.tempScoreB) {
              room.currentTurn = "B";
            }
            room.answeredTeams = {}; // Reset the answeredTeams for the next round
            io.to(roomId).emit("roomData", { room });
          }

          if (typeof callback === "function") {
            callback({ correct: false });
          }
        }
      }
    }
  );

  socket.on("gameOver", ({ roomId }) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      io.to(roomId).emit("gameOver", { room });
    }
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});

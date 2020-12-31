const express = require("express");
const socketio = require("socket.io");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/waiting", (req, res) => {
  res.sendFile(__dirname + "/public/waiting.html");
});

const server = app.listen(port, () => console.log("listening on port " + port));

const User = require("./classes/User");
const TicTacToe = require("./classes/TicTacToe");

let waitingList = [];
let games = [];
let users = [];

const io = socketio(server);

io.on("connection", (socket) => {
  const updateGame = (game) => {
    const user1 = users.find((user) => user.id === game.id1);
    const user2 = users.find((user) => user.id === game.id2);
    if (game.turn === 0) {
      io.to(game.id1).emit("game-update", {
        game: game.game,
        yourTurn: true,
        otherUser: user2.username,
      });
      io.to(game.id2).emit("game-update", {
        game: game.game,
        yourTurn: false,
        otherUser: user1.username,
      });
    } else {
      io.to(game.id1).emit("game-update", {
        game: game.game,
        yourTurn: false,
        otherUser: user2.username,
      });
      io.to(game.id2).emit("game-update", {
        game: game.game,
        yourTurn: true,
        otherUser: user2.username,
      });
    }
  };
  socket.on("waiting", ({ username }) => {
    const user = new User(socket.id, username);
    users.push(user);
    if (waitingList.length > 0) {
      const newUser = waitingList.shift();
      console.log("game start");
      console.log(waitingList);
      const game = new TicTacToe(user.id, newUser.id);
      games.push(game);
      console.log("new game");
      console.log(games);
      updateGame(game);
    } else {
      waitingList.push(user);
      console.log("new waiting person");
      console.log(waitingList);
    }
  });
  socket.on("move", ({ move }) => {
    const game = games.find((game) => game.includes(socket.id));
    if (game.yourTurn(socket.id)) {
      console.log(game.makeMove(move));
      updateGame(game);
    } else {
      socket.emit("server-message", {
        message: "Wait your turn",
      });
    }
    const winner = game.winner();
    if (winner) {
      if (winner === 1) {
        io.to(game.id1).emit("game-over", {
          message: "YOU WIN!",
        });
        io.to(game.id2).emit("game-over", {
          message: "YOU LOSE :(",
        });
      } else if (winner === 2) {
        io.to(game.id2).emit("game-over", {
          message: "YOU WIN!",
        });
        io.to(game.id1).emit("game-over", {
          message: "YOU LOSE :(",
        });
      } else {
        io.to(game.id1).to(game.id2).emit("game-over", {
          message: "SCRATCH, you're both losers",
        });
      }
    }
  });

  socket.on("disconnect", () => {
    const game = games.find((game) => game.includes(socket.id));
    const find = waitingList.find((user) => user.id === socket.id);
    users = users.filter((user) => user.id !== socket.id);
    if (find) {
      waitingList = waitingList.filter((user) => user.id !== socket.id);
      console.log("left waiting area");
      console.log(waitingList);
    }
    if (game) {
      games = games.filter((g) => g.gameId !== game.gameId);
      console.log("game over");
      console.log(games);
      io.to(game.id1).to(game.id2).emit("player-disconnected", {
        message: "Other player disconnected",
      });
    }
  });
});

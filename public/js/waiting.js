const fact = document.querySelector(".fact");
const message = document.querySelector(".message");
const content = document.querySelector(".content");

const url = new URL(window.location.href);
const username = url.searchParams.get("username");

message.innerHTML = `Don't worry <strong>${username}</strong>, your opponent is coming. Here's some random facts to pass the time.`;

const getFact = () => {
  fact.textContent = "Loading fact...";
  fetch("https://uselessfacts.jsph.pl/random.json?language=en")
    .then((result) => {
      return result.json();
    })
    .then(({ text }) => {
      fact.textContent = text;
    })
    .catch((err) => {
      console.log(err);
      fact.innerHTML =
        "<span style='color: red'>FACTS COULD NOT BE LOADED :(</span>";
    });
};

getFact();
const fact_interval = setInterval(getFact, 12 * 1000);
const socket = io();

socket.on("connect", () => {
  socket.emit("waiting", { username });
});

socket.on("game-update", (msg) => {
  clearInterval(fact_interval);
  const { game, yourTurn, otherUser } = msg;
  const turnMessage = yourTurn
    ? `Your Turn`
    : `Waiting for other player to make move`;
  content.innerHTML = ` ${turnMessage}
                    <div class='game'></div>
                ${otherUser}`;
  const grid = document.querySelector(".game");
  grid.innerHTML = "";
  console.log(game);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      let letter = " ";
      if (game[i][j] === 1) letter = "X";
      else if (game[i][j] === 25) letter = "O";
      grid.innerHTML += `<div class='game-block'>${letter}</div>`;
    }
  }
  if (yourTurn) {
    const gameblocks = document.querySelectorAll(".game-block");
    gameblocks.forEach((block, index) => {
      block.addEventListener("click", () => makeMove(index));
    });
  }
});

socket.on("player-disconnected", ({ message }) => {
  alert(message);
  document.location.href = "/";
});

socket.on("server-message", (message) => {
  console.log(message);
});

socket.on("game-over", (obj) => {
  console.log(obj);
  alert(obj.message);
  document.location.href = "/";
});

const makeMove = (move) => {
  console.log(move);
  socket.emit("move", { move });
};

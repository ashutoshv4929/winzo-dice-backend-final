const client = new Colyseus.Client(location.origin.replace(/^http/, "ws"));
let room;
let mySessionId = null;

document.getElementById("roll-btn").onclick = () => {
  room.send("roll_dice");
};

function resetGame() {
  room.send("reset_game");
  document.getElementById("result-modal").style.display = "none";
}

(async () => {
  room = await client.joinOrCreate("my_dice_room");
  mySessionId = room.sessionId;
  console.log("Joined:", mySessionId);

  room.onMessage("chat", ({ text }) => {
    document.getElementById("turn-indicator").innerText = text;
  });

  room.onMessage("dice_rolled", ({ roll, sessionId }) => {
    const diceEl = document.getElementById("dice");
    diceEl.innerText = "🎲";
    setTimeout(() => {
      diceEl.innerText = roll;
      room.send("animation_completed", { roll });
    }, 500);
  });

  room.onMessage("game_over", ({ finalScores, winnerId }) => {
    const msg = (winnerId === mySessionId) ? "You Won!" : "You Lost!";
    document.getElementById("result-message").innerText = msg;
    document.getElementById("result-modal").style.display = "block";
  });

  room.state.players.onAdd = (player, sessionId) => {
    if (room.state.currentPlayerId === mySessionId) {
      document.getElementById("roll-btn").disabled = false;
    }
  };

  room.state.listen("currentPlayerId", (id) => {
    const isMyTurn = id === mySessionId;
    document.getElementById("roll-btn").disabled = !isMyTurn;
    document.getElementById("turn-indicator").innerText = isMyTurn ? "Your turn!" : "Opponent's turn!";
  });

  room.state.players.onChange = () => {
    const player = room.state.players.get(mySessionId);
    if (player) {
      document.getElementById("score").innerText = `Score: ${player.score}`;
    }
  };
})();

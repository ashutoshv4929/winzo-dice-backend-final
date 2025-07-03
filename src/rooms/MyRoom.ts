import { Room, Client } from "colyseus";
import { MyRoomState, Player } from "../schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
    maxClients = 2;
    TOTAL_TURNS = 3;

    onCreate() {
        this.setState(new MyRoomState());

        this.onMessage("roll_dice", (client) => {
            if (this.state.gameOver || this.state.currentPlayerId !== client.sessionId) return;

            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            const roll = Math.floor(Math.random() * 6) + 1;
            player.history.push(roll);
            this.broadcast("dice_rolled", { roll, player: player.playerNumber, sessionId: client.sessionId });
        });

        this.onMessage("animation_completed", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player) return;

            const latestRoll = player.history[player.history.length - 1];
            if (message.roll === latestRoll) {
                player.score += latestRoll;

                const allRolled = Array.from(this.state.players.values())
                    .every(p => p.history.length === this.TOTAL_TURNS);
                if (allRolled) this.endGame();
                else {
                    const ids = Array.from(this.state.players.keys());
                    const next = ids.find(id => id !== client.sessionId);
                    this.state.currentPlayerId = next || null;

                    const totalRolls = Array.from(this.state.players.values()).reduce((sum, p) => sum + p.history.length, 0);
                    this.state.currentRound = Math.floor(totalRolls / this.maxClients) + 1;
                }
            }
        });

        this.onMessage("reset_game", () => this.resetGame());
    }

    onJoin(client: Client) {
        const player = new Player();
        player.playerNumber = this.state.players.size + 1;
        player.sessionId = client.sessionId;
        this.state.players.set(client.sessionId, player);

        if (this.state.players.size === this.maxClients) {
            this.state.currentRound = 1;
            this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || null;
            this.broadcast("chat", { senderName: "Server", text: "Game Shuru!" });
        }
    }

    endGame() {
        this.state.gameOver = true;
        const [p1, p2] = Array.from(this.state.players.values());

        this.state.finalScores.set("1", p1.score);
        this.state.finalScores.set("2", p2.score);

        if (p1.score > p2.score) this.state.winnerSessionId = p1.sessionId;
        else if (p2.score > p1.score) this.state.winnerSessionId = p2.sessionId;
        else this.state.winnerSessionId = null;

        this.broadcast("game_over", {
            finalScores: Object.fromEntries(this.state.finalScores),
            winnerId: this.state.winnerSessionId,
        });
    }

    resetGame() {
        this.state.gameOver = false;
        this.state.winnerSessionId = null;
        this.state.currentRound = 1;
        this.state.finalScores.clear();
        this.state.players.forEach(p => {
            p.score = 0;
            p.history.clear();
        });
        this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || null;
        this.broadcast("chat", { senderName: "Server", text: "Game reset ho gaya hai!" });
    }

    onLeave(client: Client) {
        this.state.players.delete(client.sessionId);
    }

    onDispose() {
        console.log("Room band ho gaya:", this.roomId);
    }
}

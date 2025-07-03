"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoom = void 0;
// src/rooms/MyRoom.ts
const colyseus_1 = require("colyseus");
const MyRoomState_1 = require("../schema/MyRoomState");
class MyRoom extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 2;
        this.TOTAL_TURNS = 3;
    }
    onCreate() {
        this.setState(new MyRoomState_1.MyRoomState());
        this.onMessage("roll_dice", (client) => {
            if (this.state.gameOver || this.state.currentPlayerId !== client.sessionId)
                return;
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            const roll = Math.floor(Math.random() * 6) + 1;
            player.history.push(roll);
            this.broadcast("dice_rolled", { roll, player: player.playerNumber, sessionId: client.sessionId });
        });
        this.onMessage("animation_completed", (client, message) => {
            const player = this.state.players.get(client.sessionId);
            if (!player)
                return;
            const latestRoll = player.history[player.history.length - 1];
            if (message.roll === latestRoll) {
                player.score += latestRoll;
                const allRolled = Array.from(this.state.players.values())
                    .every(p => p.history.length === this.TOTAL_TURNS);
                if (allRolled) {
                    this.endGame();
                }
                else {
                    const ids = Array.from(this.state.players.keys());
                    const next = ids.find(id => id !== client.sessionId);
                    // === बदलाव यहाँ ===
                    // पहले: this.state.currentPlayerId = next || null;
                    this.state.currentPlayerId = next || ""; // `null` को `""` से बदला गया
                    // === बदलाव समाप्त ===
                    const totalRolls = Array.from(this.state.players.values()).reduce((sum, p) => sum + p.history.length, 0);
                    this.state.currentRound = Math.floor(totalRolls / this.maxClients) + 1;
                }
            }
        });
        this.onMessage("reset_game", () => this.resetGame());
    }
    onJoin(client) {
        const player = new MyRoomState_1.Player();
        player.playerNumber = this.state.players.size + 1;
        player.sessionId = client.sessionId;
        this.state.players.set(client.sessionId, player);
        if (this.state.players.size === this.maxClients) {
            this.state.currentRound = 1;
            // === बदलाव यहाँ ===
            // पहले: this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || null;
            this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || ""; // `null` को `""` से बदला गया
            // === बदलाव समाप्त ===
            this.broadcast("chat", { senderName: "Server", text: "Game Shuru!" });
        }
    }
    endGame() {
        this.state.gameOver = true;
        const [p1, p2] = Array.from(this.state.players.values());
        this.state.finalScores.set("1", p1.score);
        this.state.finalScores.set("2", p2.score);
        if (p1.score > p2.score) {
            this.state.winnerSessionId = p1.sessionId;
        }
        else if (p2.score > p1.score) {
            this.state.winnerSessionId = p2.sessionId;
        }
        else {
            // === बदलाव यहाँ ===
            // पहले: this.state.winnerSessionId = null;
            this.state.winnerSessionId = ""; // `null` को `""` से बदला गया
            // === बदलाव समाप्त ===
        }
        this.broadcast("game_over", {
            finalScores: Object.fromEntries(this.state.finalScores),
            winnerId: this.state.winnerSessionId,
        });
    }
    resetGame() {
        this.state.gameOver = false;
        // === बदलाव यहाँ ===
        // पहले: this.state.winnerSessionId = null;
        this.state.winnerSessionId = ""; // `null` को `""` से बदला गया
        // === बदलाव समाप्त ===
        this.state.currentRound = 1;
        this.state.finalScores.clear();
        this.state.players.forEach(p => {
            p.score = 0;
            // === बदलाव यहाँ ===
            // पहले: p.history.clear();
            p.history.length = 0; // `clear()` को `length = 0` से बदला गया
            // === बदलाव समाप्त ===
        });
        // === बदलाव यहाँ ===
        // पहले: this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || null;
        this.state.currentPlayerId = Array.from(this.state.players.keys())[0] || ""; // `null` को `""` से बदला गया
        // === बदलाव समाप्त ===
        this.broadcast("chat", { senderName: "Server", text: "Game reset ho gaya hai!" });
    }
    onLeave(client) {
        this.state.players.delete(client.sessionId);
        // यदि कोई खिलाड़ी चला जाता है और खेल जारी है,
        // और यह currentPlayerId था, तो उसे रीसेट करने पर विचार करें।
        // यह आपके गेम लॉजिक पर निर्भर करता है।
        if (this.state.currentPlayerId === client.sessionId && !this.state.gameOver) {
            const remainingPlayers = Array.from(this.state.players.keys());
            this.state.currentPlayerId = remainingPlayers[0] || ""; // अगर कोई बचा है तो पहला खिलाड़ी, वरना खाली
        }
    }
    onDispose() {
        console.log("Room band ho gaya:", this.roomId);
    }
}
exports.MyRoom = MyRoom;

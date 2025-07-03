"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const colyseus_1 = require("colyseus");
const MyRoom_1 = require("./rooms/MyRoom");
const app = (0, express_1.default)();
const port = 2567;
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
const server = http_1.default.createServer(app);
const gameServer = new colyseus_1.Server({ server });
gameServer.define("my_dice_room", MyRoom_1.MyRoom);
gameServer.listen(port);
console.log(`✅ Server is running on http://localhost:${port}`);

// src/schema/MyRoomState.ts
import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") playerNumber: number = 0;
  @type("string") sessionId: string = "";
  @type("number") score: number = 0;
  @type(["number"]) history = new Array<number>();
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("boolean") gameOver: boolean = false;
  // **यह महत्वपूर्ण बदलाव है** - डिफ़ॉल्ट रूप से खाली स्ट्रिंग असाइन करें
  @type("string") currentPlayerId: string = "";
  @type("number") currentRound: number = 1;
  @type({ map: "number" }) finalScores = new MapSchema<number>();
  // **यह भी महत्वपूर्ण बदलाव है** - डिफ़ॉल्ट रूप से खाली स्ट्रिंग असाइन करें
  @type("string") winnerSessionId: string = "";
}

// src/schema/MyRoomState.ts (यह आपकी MyRoomState.ts फ़ाइल होगी)
import { MapSchema, Schema, type } from "@colyseus/schema";

export class Player extends Schema {
  @type("number") playerNumber: number = 0;
  @type("string") sessionId: string = "";
  @type("number") score: number = 0;
  // Colyseus में `ArraySchema` का उपयोग करें यदि आप Array को synchronize करना चाहते हैं।
  // या यदि यह सिर्फ एक साधारण JS array है जो synchronize नहीं होता, तो `@type` की आवश्यकता नहीं होती।
  // मान रहा हूँ कि आप इसे synchronize करना चाहते हैं:
  @type(["number"]) history = new Array<number>(); // Colyseus के लिए `ArraySchema` या `[type]`
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type("boolean") gameOver: boolean = false;
  // `currentPlayerId` और `winnerSessionId` को खाली स्ट्रिंग से इनिशियलाइज़ करें।
  // यदि आप उन्हें `null` असाइन कर रहे थे, तो अपने MyRoom.ts में उस असाइनमेंट को भी `""` से बदलें।
  @type("string") currentPlayerId: string = "";
  @type("number") currentRound: number = 1;
  @type({ map: "number" }) finalScores = new MapSchema<number>();
  @type("string") winnerSessionId: string = ""; // यहाँ भी खाली स्ट्रिंग
}

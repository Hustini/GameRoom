// Shared enums used by both backend (Node + Socket.IO) and frontend (React).
// Frozen objects with string values, so they serialize cleanly over the socket.
 
export const GameStatus = Object.freeze({
  WAITING: "WAITING",
  PLAYING: "PLAYING",
  FINISHED: "FINISHED", 
});
 
export const TurnPhase = Object.freeze({
  ROLL: "ROLL", 
  MOVE: "MOVE",
});
 
export const Color = Object.freeze({
  RED: "RED",
  BLUE: "BLUE",
  GREEN: "GREEN",
  YELLOW: "YELLOW",
});

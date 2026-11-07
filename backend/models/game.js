import { Player } from "./player.js";

export class Game {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.status = "WAITING";
        this.phase = "ROLL";
        this.diceValue = null;
        this.winnerId = null;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    addPlayer(player) {}

    getPlayerById(playerId) {}

    getCurrentPlayer() {}

    getOpponent(playerId) {}

    findFigureAt(boardPosition) {}

    touch() {}

    start() {}

    rollDice(playerId) {}

    getMovableFigures(playerId) {}

    moveFigure(playerId, figureId) {}

    endTurn() {}
}
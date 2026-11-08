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

    addPlayer(player) {
        if (this.players.length >= 2) {
            throw new Error("Game already has 2 players");
        }
        this.players.push(player);
        return this.players;
    }

    getPlayerById(playerId) {
        return this.players.find(player => player.id === playerId);
    }

    getCurrentPlayer() {
        return this.players[0];
    }

    getOpponent(playerId) {
        return this.players.find(player => player.id !== playerId);
    }

    findFigureAt(boardPosition) {
        for (const player of this.players) {
        const figure = player.figures.find(f => player.getBoardPosition(f) === boardPosition);
        if (figure) {
            return { player, figure };
        }
    }
        return null
    }

    touch() {
        this.updatedAt = new Date();
        return this.updatedAt;
    }

    start() {}

    rollDice(playerId) {}

    getMovableFigures(playerId) {}

    moveFigure(playerId, figureId) {}

    endTurn() {}

    toJSON() {
        return {
            roomCode: this.roomCode,
            status: this.status,
            phase: this.phase,
            diceValue: this.diceValue,
            winnerId: this.winnerId,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            players: this.players.map(player => player.toJSON()),
            movableFigureIds: []
        };
    }
}
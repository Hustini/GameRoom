import { Player } from "./player.js";

export class Game {
    constructor(roomCode) {
        this.roomCode = roomCode;
        this.players = [];
        this.currentPlayerIndex = 0;
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

    start() {
        if (this.status !== "WAITING") {
            throw new Error("Wrong game status. Game can only be started from WAITING state");
        }

        if (this.players.length < 2) {
            throw new Error("Cannot start game with less than 2 players");
        }

        this.status = "PLAYING";
        this.phase = "ROLL";
        this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);
    }

    rollDice(playerId) {
        if (this.status !== "PLAYING" || this.phase !== "ROLL" || this.getCurrentPlayer().id !== playerId) {
            throw new Error("Game can only be rolled in PLAYING state and ROLL phase by the current player");
        }

        this.diceValue = Math.floor(Math.random() * 6) + 1;

        let movaableFigures = this.getMovableFigures(playerId);
        if (movaableFigures.length === 0) {
            this.endTurn();
        } else {
            this.phase = "MOVE";
        }
    }

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
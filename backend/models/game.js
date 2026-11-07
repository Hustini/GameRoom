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
        let playerFiguresAtPosition = [];
        for (const player of this.players) {
            let figure = player.figures.filter(figure => player.getBoardPosition(figure) === boardPosition);
            console.log(figure.length);
            if (figure.length === 0) {
                continue;
            }
            playerFiguresAtPosition.push({ 
                figure: {
                    id: figure[0].id, 
                    progress: figure[0].progress
                }, 
                player: {
                    color: player.color, 
                    connected: player.connected, 
                    figures: player.figures.map(figure => ({id: figure.id, progress: figure.progress})),
                    id: player.id,
                    name: player.name,
                    socketId: player.socketId,
                    startIndex: player.startIndex
                }
            });
            return playerFiguresAtPosition[0];
        }
        return null
    }

    touch() {}

    start() {}

    rollDice(playerId) {}

    getMovableFigures(playerId) {}

    moveFigure(playerId, figureId) {}

    endTurn() {}
}
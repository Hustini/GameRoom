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
        return this.players[this.currentPlayerIndex];
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

        let movableFigures = this.getMovableFigures(playerId);
        if (movableFigures.length === 0) {
            this.endTurn();
        } else {
            this.phase = "MOVE";
        }
    }

    getMovableFigures(playerId) {
        let player = this.getPlayerById(playerId);
        let homeFigures = player.getFiguresAtHome();
        let figureOnStart = player.getFigureOnStartField();

        let canMove = (figure) => {
            let target = figure.getTarget(this.diceValue);
            if (target === null) {
                return false;
            }
            // Check if the target position is occupied by own figure
            return !player.figures.some(other => other !== figure && other.progress === target);
        };

        // If there are figures on home and starting is free, bring one out
        if (this.diceValue === 6 && homeFigures.length > 0 && !figureOnStart) {
            return homeFigures;
        }

        // If there are figures on home and a figure on start that can move, only that figure may move
        if (homeFigures.length > 0 && figureOnStart && canMove(figureOnStart)) {
            return [figureOnStart];
        }

        // Return all figures that can move
        return player.figures.filter(figure => !figure.isHome() && canMove(figure));
    }

    moveFigure(playerId, figureId) {
        if (this.phase !== "MOVE" || this.getCurrentPlayer().id !== playerId) {
            throw new Error("Game can only be moved in MOVE phase by the current player");
        }

        let player = this.getCurrentPlayer(playerId);
        let movableFigures = this.getMovableFigures(playerId);
        let figureOfPlayer = player.getFigure(figureId);
        let target;

        if (!movableFigures.includes(figureOfPlayer)) {
            throw new Error("Selected figure cannot be moved");
        }

        // Bring out figure
        if (figureOfPlayer.isHome() && this.diceValue !== 6) {
            throw new Error("Cannot move a figure from home unless dice value is 6");
        } else if (figureOfPlayer.isHome() && this.diceValue === 6) {
            target = 0;
        } else {
            target = figureOfPlayer.getTarget(this.diceValue);
        }

        // Check if the target position is occupied by opponent's figure
        if (target < 40) {
            let targetField = (player.startIndex + target) % 40;
            let figureOnTargetField = this.findFigureAt(targetField);
            if (figureOnTargetField && figureOnTargetField.player.id !== playerId) {
                figureOnTargetField.figure.progress = -1;
            }
        }

        figureOfPlayer.progress = target;

        // check if the player has won
        if (player.hasWon()) {
            this.winnerId = player.id;
            this.status = "FINISHED";
            return;
        } else {
            this.endTurn();
        }
    }

    endTurn() {
        if (this.diceValue === 6) {
            this.phase = "ROLL";
        } else {
            this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
            this.phase = "ROLL";
        }

        this.diceValue = null;
        this.touch();
    }

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
import { Figure } from "./figure.js";
import { TRACK_LENGTH } from "../../shared/config.js";

export class Player {
    constructor(id, name, color, startIndex) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.startIndex = startIndex;
        this.socketId = null;
        this.connected = true;
        this.figures = [];
        for (let i = 0; i < 4; i++) {
            const progress = (i === 0) ? 0 : -1;
            this.figures.push(new Figure(i, progress));
        }
    }

    getFigure(figureId) {
        return this.figures.find(figure => figure.id === figureId);
    }

    getBoardPosition(figure) {
        if (figure.isInFinish()) {
            return null;
        } else if (figure.isHome()) {
            return null;
        }
        return (this.startIndex + figure.progress) % TRACK_LENGTH;
    }

    getFiguresAtHome() {
        let figuresAtHome = this.figures.filter(figure => figure.isHome());
        return figuresAtHome;
    }

    getFigureOnStartField() {
        let figureAtStartField = this.figures.filter(figure => figure.progress === this.startIndex);
        return figureAtStartField[0];
    }

    hasWon() {
        return this.figures.every(figure => figure.isInFinish());
    }
}
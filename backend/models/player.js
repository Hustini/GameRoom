import { Figure } from "./figure.js";

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
}
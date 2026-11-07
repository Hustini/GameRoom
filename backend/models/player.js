export class Player {
    constructor(id, name, color, startIndex) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.startIndex = startIndex;
        this.socketId = null;
        this.connected = true;
    }
}
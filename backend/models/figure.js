export class Figure {
  constructor(id, progress) {
    this.id = id;
    this.progress = progress ?? -1;
  }

  isHome() {
    return this.progress === -1;
  }
}
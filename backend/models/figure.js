export class Figure {
  constructor(id, progress) {
    this.id = id;
    this.progress = progress ?? -1;
  }

  isHome() {
    return this.progress === -1;
  }

  isOnTrack() {
    return this.progress >= 0 && this.progress < 40;
  }

  isInFinish() {
    return this.progress >= 40 && this.progress <= 43;
  }
}
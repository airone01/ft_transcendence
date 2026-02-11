export class InvalidMove extends Error {
  constructor() {
    super("Invalid move");
    this.name = new.target.name;
  }
}

export class EndGame extends Error {
  constructor() {
    super("Game has ended (checkmate or draw)");
    this.name = new.target.name;
  }
}

export class UnknownError extends Error {
  constructor() {
    super("Unknown error");
    this.name = new.target.name;
  }
}

export class DBUserNotFoundError extends Error {
  constructor() {
    super("User not found");
    this.name = new.target.name;
  }
}

export class DBCreateUserUsernameAlreadyExistsError extends Error {
  constructor() {
    super("Username already exists");
    this.name = new.target.name;
  }
}

export class DBCreateUserEmailAlreadyExistsError extends Error {
  constructor() {
    super("Email already exists");
    this.name = new.target.name;
  }
}

export class DBAddFriendWrongFriendshipError extends Error {
  constructor() {
    super("Wrong friendship");
    this.name = new.target.name;
  }
}

export class DBAddFriendFriendshipAlreadyExistsError extends Error {
  constructor() {
    super("Friendship already exists");
    this.name = new.target.name;
  }
}

export class DBPlayersNotFoundError extends Error {
  constructor() {
    super("Players not found");
    this.name = new.target.name;
  }
}

export class DBGameNotFoundError extends Error {
  constructor() {
    super("Game not found");
    this.name = new.target.name;
  }
}

export class DBRemoveSpectatorError extends Error {
  constructor() {
    super("Game or spectator not found");
    this.name = new.target.name;
  }
}

/* Public API */

/* Errors */
export {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  DBRemoveSpectatorError,
  DBUserNotFoundError,
  UnknownError,
} from "./internal/db.errors";

/* Games Types */
export type {
  CreateGameInput,
  EndGameInput,
} from "./internal/schema/db.games.schema";

/* Auth Schema */
export type { OAuthProvider } from "./internal/schema/db.auth.schema";

/* DB Schema */
export type {
  AuthSession,
  Friendship,
  Game,
  GamePlayer,
  GameSpectator,
  OauthAccount,
  User,
  UserStats,
} from "./internal/schema/db.schema";

/* Users Types */
export type {
  CreateUserInput,
  FriendInfo,
  UpdateUserInput,
} from "./internal/schema/db.users.schema";

/* Utils Types */
export type {
  GameHistory,
  Leaderboard,
} from "./internal/schema/db.utils.schema";

/* Friends Services */
export {
  dbAddFriend,
  dbGetFriendsInfo,
  dbRemoveFriend,
} from "./internal/services/db.friends.service";

/* Games Services */
export {
  dbAddSpectator,
  dbCreateGame,
  dbEndGame,
  dbGetGame,
  dbGetSpectators,
  dbGetSpectatorsCount,
  dbRemoveSpectator,
  dbStartGame,
  dbUpdateGame,
} from "./internal/services/db.games.service";

/* Users Services */
export {
  dbCreateUser,
  dbDeleteUser,
  dbGetStats,
  dbGetUser,
  dbIsEmailTaken,
  dbIsUsernameTaken,
  dbGetUserByEmail,
  dbUpdateUser,
} from "./internal/services/db.users.service";

/* Auth Services */
export {
  dbCreateAuthSession,
  dbCreateOAuthAccount,
  dbDeleteAuthSession,
  dbGetUserAndAuthSessionByAuthSessionId,
  dbGetUserByOauthId,
} from "./internal/services/db.auth.service";

/* Utils Services */
export {
  dbGetLeaderboard,
  dbGetUserGameHistory,
} from "./internal/services/db.utils.service";

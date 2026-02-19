/* Public API */

/* Errors */
export {
  DBAddFriendFriendshipAlreadyExistsError,
  DBAddFriendWrongFriendshipError,
  DBChatChannelNotFoundError,
  DBCreateChatChannelError,
  DBCreateUserEmailAlreadyExistsError,
  DBCreateUserUsernameAlreadyExistsError,
  DBDeleteChatChannelError,
  DBGameNotFoundError,
  DBPlayersNotFoundError,
  DBRemoveSpectatorError,
  DBUserNotFoundError,
  UnknownError,
} from "./internal/db.errors";

/* Auth Schema */
export type { OAuthProvider } from "./internal/schema/db.auth.schema";

/* Chat Types */
export type {
  ChatChannelType,
  ChatMessageType,
} from "./internal/schema/db.chat.schema";

/* Games Types */
export type {
  CreateGameInput,
  EndGameInput,
} from "./internal/schema/db.games.schema";

/* DB Schema */
export type {
  AuthSession,
  ChatChannel,
  ChatChannelMember,
  ChatMessage,
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

/* Auth Services */
export {
  dbCreateAuthSession,
  dbCreateOAuthAccount,
  dbDeleteAuthSession,
  dbGetUserAndAuthSessionByAuthSessionId,
  dbGetUserByOauthId,
} from "./internal/services/db.auth.service";

/* Chat Services */
export {
  dbGetFriendMessages,
  dbGetGameMessages,
  dbGetGlobalMessages,
  dbSendToFriend,
  dbSendToGame,
  dbSendToGlobal,
} from "./internal/services/db.chat.service";

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
  dbGetPlayers,
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
  dbGetUserByEmail,
  dbIsEmailTaken,
  dbIsUsernameTaken,
  dbUpdateUser,
} from "./internal/services/db.users.service";

/* Utils Services */
export {
  dbGetLeaderboard,
  dbGetUserGameHistory,
} from "./internal/services/db.utils.service";

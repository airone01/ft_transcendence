/* Public API */

/* DB Schema */
export {
  type User,
  type AuthSession,
  type Friendship,
  type UserStats,
  type Game,
  type GamePlayer,
  type GameSpectator,
} from "./internal/schema/db.schema";

/* Users Types */
export {
  type CreateUserInput,
  type UpdateUserInput,
} from "./internal/schema/db.users.schema";
export {
  type CreateGameInput,
  type EndGameInput,
} from "./internal/schema/db.games.schema";

/* Users Services */
export {
  dbCreateUser,
  dbUpdateUser,
  dbDeleteUser,
  dbGetStats,
} from "./internal/services/db.users.service";

/* Friends Services */
export {
  dbAddFriend,
  dbRemoveFriend,
  dbGetFriendsInfo,
} from "./internal/services/db.friends.service";

/* Games Services */
export {
  dbCreateGame,
  dbStartGame,
  dbGetGame,
  dbUpdateGame,
} from "./internal/services/db.games.service";

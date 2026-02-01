import { Auth } from "./core";
import type {
  AuthConfig,
  AuthSessionsTableConstraint,
  UserTableConstraint,
} from "./types";

export function createAuth<
  TUser extends UserTableConstraint,
  TSession extends AuthSessionsTableConstraint,
>(config: AuthConfig<TUser, TSession>) {
  return new Auth(config);
}

export { hashPassword, verifyPassword } from "./crypto";

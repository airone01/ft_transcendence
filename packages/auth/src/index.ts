import { Auth } from "./core";
import type {
  AuthConfig,
  SessionTableConstraint,
  UserTableConstraint,
} from "./types";

export function createAuth<
  TUser extends UserTableConstraint,
  TSession extends SessionTableConstraint,
>(config: AuthConfig<TUser, TSession>) {
  return new Auth(config);
}

export { hashPassword, verifyPassword } from "./crypto";

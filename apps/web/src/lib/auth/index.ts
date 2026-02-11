import { page } from "$app/state";
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

// 'page' is a reactive state object
// use getter to access current page data dynamically
class AuthState {
  get user() {
    return page.data.user;
  }

  get session() {
    return page.data.session;
  }

  get isAuthenticated() {
    return !!page.data.user;
  }
}

export const authState = new AuthState();
export { hashPassword, verifyPassword } from "./crypto";

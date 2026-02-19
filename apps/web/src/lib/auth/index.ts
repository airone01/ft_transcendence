import { page } from "$app/state";
import type { UserNoPass } from "../../app";

class AuthState {
  get user(): UserNoPass | null {
    return page.data.user ?? null;
  }

  get session() {
    return page.data.session ?? null;
  }

  get isAuthenticated() {
    return !!page.data.user;
  }
}

export const authState = new AuthState();

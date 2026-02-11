import { page } from "$app/state";
import type { User } from "$lib/db-services";

class AuthState {
  get user(): User | null {
    return page.data.user || null;
  }

  get session() {
    return page.data.session || null;
  }

  get isAuthenticated() {
    return !!page.data.user;
  }
}

export const authState = new AuthState();

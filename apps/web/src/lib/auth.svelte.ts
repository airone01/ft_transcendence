import { page } from "$app/state";

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

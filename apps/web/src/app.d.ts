// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from "$lib/db-services";

/* we should not pass the (hashed) password in the user object, otherwise
a malicious actor might utilize an XSS exploit to fetch users'
(hashed) passwords. */
/* leveraging TS's awesome type safety for this job */
export type UserNoPass = Omit<User, "password">;

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: UserNoPass | null;
      session: typeof session.$inferSelect | null;
    }
    interface PageData {
      user: UserNoPass | null;
      session: typeof session.$inferSelect | null;
      sidebarOpen: boolean;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

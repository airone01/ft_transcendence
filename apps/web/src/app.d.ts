// See https://svelte.dev/docs/kit/types#app.d.ts

import type { User } from "$lib/db-services";

// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
      session: typeof session.$inferSelect | null;
    }
    interface PageData {
      user: User | null;
      session: typeof session.$inferSelect | null;
      sidebarOpen: boolean;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

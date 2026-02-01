// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user: typeof user.$inferSelect | null;
      session: typeof session.$inferSelect | null;
    }
    interface PageData {
      user: typeof user.$inferSelect | null;
      session: typeof session.$inferSelect | null;
    }
    // interface PageState {}
    // interface Platform {}
  }
}

export {};

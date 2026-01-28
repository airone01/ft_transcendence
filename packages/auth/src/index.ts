// import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";
import type { UserTableRequirement } from "./types";

export class AuthManager<
  _TUser extends UserTableRequirement,
  _TSession extends PgTable,
> {
  // constructor(_config: AuthConfig<TUser, TSession>) {}

  async validateSession(_sessionId: string) {
    // - query db using this.config.schema.session
    // - check expiration
    // - fetch user info using this.config.schema.user
    // - return typed result
  }

  async createSession(_userId: string | number) {
    // gen token, hash, insert in db
  }
}

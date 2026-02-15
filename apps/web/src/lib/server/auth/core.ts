import { eq } from "drizzle-orm";
import { generateRandomString, hashToken } from "./crypto";
import type {
  AuthConfig,
  AuthSessionsTableConstraint,
  UserTableConstraint,
} from "./types";

export class Auth<
  TUser extends UserTableConstraint,
  TSession extends AuthSessionsTableConstraint,
> {
  constructor(private config: AuthConfig<TUser, TSession>) {}

  /**
   * @throws Drizzle Exception
   */
  async createSession(
    userId: string | number,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = generateRandomString(32); // secret cookie val
    const sessionId = hashToken(token); // we store hash
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    // Code copied from from `db.auth.service.ts` because if we imported it
    // here we would be getting circular deps.
    await this.config.db.insert(this.config.schema.authSessions).values({
      id: sessionId,
      userId: userId,
      expiresAt,
    });

    return { token, expiresAt };
  }

  async validateSession(token: string) {
    const sessionId = hashToken(token);

    // Code copied from from `db.auth.service.ts` because if we imported it
    // here we would be getting circular deps.
    const result = await this.config.db
      .select({
        users: this.config.schema.users,
        authSessions: this.config.schema.authSessions,
      })
      .from(this.config.schema.authSessions)
      .innerJoin(
        this.config.schema.users,
        eq(this.config.schema.authSessions.userId, this.config.schema.users.id),
      )
      .where(eq(this.config.schema.authSessions.id, sessionId));

    if (result.length === 0) return { session: null, user: null };

    const { users: user, authSessions: session } = result[0];

    // check expiration
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.config.db
        .delete(this.config.schema.authSessions)
        .where(eq(this.config.schema.authSessions.id, sessionId));
      return { session: null, user: null };
    }

    // by now TS should still know types
    return { session, user };
  }
}

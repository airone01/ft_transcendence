import { eq } from "drizzle-orm";
import { generateRandomString, hashToken } from "./crypto";
import type {
  AuthConfig,
  SessionTableConstraint,
  UserTableConstraint,
} from "./types";

export class Auth<
  TUser extends UserTableConstraint,
  TSession extends SessionTableConstraint,
> {
  constructor(private config: AuthConfig<TUser, TSession>) {}

  async createSession(
    userId: string | number,
  ): Promise<{ token: string; expiresAt: Date }> {
    const token = generateRandomString(32); // secret cookie val
    const sessionId = hashToken(token); // we store hash
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await this.config.db.insert(this.config.schema.session).values({
      id: sessionId,
      userId: userId,
      expiresAt,
    });

    return { token, expiresAt };
  }

  async validateSession(token: string) {
    const sessionId = hashToken(token);

    const result = await this.config.db
      .select({
        user: this.config.schema.user,
        session: this.config.schema.session,
      })
      .from(this.config.schema.session)
      .innerJoin(
        this.config.schema.user,
        eq(this.config.schema.session.userId, this.config.schema.user.id),
      )
      .where(eq(this.config.schema.session.id, sessionId));

    if (result.length === 0) return { session: null, user: null };

    const { user, session } = result[0];

    // check expiration
    if (Date.now() >= session.expiresAt.getTime()) {
      await this.config.db
        .delete(this.config.schema.session)
        .where(eq(this.config.schema.session.id, sessionId));
      return { session: null, user: null };
    }

    // by now TS should still know types
    return { session, user };
  }
}

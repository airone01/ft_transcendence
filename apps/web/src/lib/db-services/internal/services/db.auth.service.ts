import { db } from "@transc/db";
import { authSessions, oauthAccounts, users } from "@transc/db/schema";
import { and, eq } from "drizzle-orm";
import {
  type AuthSession,
  type OAuthProvider,
  type OauthAccount,
  UnknownError,
  type User,
} from "$lib/db-services";

/**
 * Creates a new authentication session in the database.
 * @param {AuthSession} authSession - The authentication session to create, including the ID, user ID, creation time, and expiration time.
 * @throws {UnknownError} - If an unexpected error occurs
 */
export async function dbCreateAuthSession(authSession: AuthSession) {
  try {
    await db.insert(authSessions).values(authSession);
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Creates a new OAuth account in the database.
 * @param {OauthAccount} oauthAccount - The OAuth account to create, including the provider name, provider user ID, and user ID.
 * @throws {UnknownError} - If an unexpected error occurs
 */
export async function dbCreateOAuthAccount(oauthAccount: OauthAccount) {
  try {
    await db.insert(oauthAccounts).values(oauthAccount);
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a user from the database by their OAuth provider name and provider user ID.
 * @param {OAuthProvider} provider - The name of the OAuth provider
 * @param {string} providerUserId - The ID of the user in the OAuth provider
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<User | undefined>} - A promise that resolves with the user if found, undefined otherwise
 */
export async function dbGetUserByOauthId(
  provider: OAuthProvider,
  providerUserId: string,
): Promise<User | undefined> {
  try {
    const [result] = await db
      .select({
        user: users,
      })
      .from(users)
      .innerJoin(oauthAccounts, eq(users.id, oauthAccounts.userId))
      .where(
        and(
          eq(oauthAccounts.provider, provider),
          eq(oauthAccounts.providerUserId, providerUserId),
        ),
      )
      .limit(1);

    return result?.user ?? undefined;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Retrieves a user and their authentication session from the database by the authentication session ID.
 * @param {string} authSessionId - The ID of the authentication session to retrieve
 * @throws {UnknownError} - If an unexpected error occurs
 * @returns {Promise<[User, AuthSession] | undefined>} - A promise that resolves with the user and their authentication session if found, undefined otherwise
 */
export async function dbGetUserAndAuthSessionByAuthSessionId(
  authSessionId: string,
): Promise<[User, AuthSession] | undefined> {
  try {
    const [result] = await db
      .select({
        user: users,
        authSession: authSessions,
      })
      .from(authSessions)
      .innerJoin(users, eq(authSessions.userId, users.id))
      .where(eq(authSessions.id, authSessionId))
      .limit(1);

    return result ? [result.user, result.authSession] : undefined;
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

/**
 * Deletes an authentication session from the database.
 * @param {string} authSessionId - The ID of the authentication session to delete
 * @throws {UnknownError} - If an unexpected error occurs
 */
export async function dbDeleteAuthSession(authSessionId: string) {
  try {
    await db.delete(authSessions).where(eq(authSessions.id, authSessionId));
  } catch (err) {
    console.error(err);
    throw new UnknownError();
  }
}

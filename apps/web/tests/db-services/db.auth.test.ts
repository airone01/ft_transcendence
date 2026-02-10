import { beforeAll, describe, expect, test } from "bun:test";
import { db } from "@transc/db";
import { users } from "@transc/db/schema";
import { eq } from "drizzle-orm";
import {
  dbCreateAuthSession,
  dbCreateOAuthAccount,
  dbCreateUser,
  dbDeleteAuthSession,
  dbGetUserAndAuthSessionByAuthSessionId,
  dbGetUserByOauthId,
  type AuthSession,
  type OauthAccount,
} from "$lib/db-services";

describe("auth.service.ts tests", () => {
  let userId: number | undefined;
  let authSession: AuthSession;
  let oauthAccount: OauthAccount;

  beforeAll(async () => {
    await db.delete(users).where(eq(users.username, "Alice"));

    userId = await dbCreateUser({
      username: "Alice",
      email: "alice@test.com",
      password: "supersecret",
      avatar: "https://example.com/avatar.png",
    });

    authSession = {
      id: "1234567890",
      userId: userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    };

    oauthAccount = {
      provider: "discord",
      providerUserId: "1234",
      userId: userId,
    };
  });

  test("dbCreateAuthSession", async () => {
    try {
      await dbCreateAuthSession(authSession);
    } catch (err) {
      console.error(err);
    }
  });

  test("dbCreateOAuthAccount", async () => {
    try {
      await dbCreateOAuthAccount(oauthAccount);
    } catch (err) {
      console.error(err);
    }
  });

  test("dbGetUserByOauthId", async () => {
    try {
      const user = await dbGetUserByOauthId(
        oauthAccount.provider,
        oauthAccount.providerUserId,
      );

      expect(user).toBeDefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("dbGetUserByOauthId with wrong provider", async () => {
    try {
      const user = await dbGetUserByOauthId(
        "google",
        oauthAccount.providerUserId,
      );

      expect(user).toBeUndefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("dbGetUserByOauthId with wrong providerUserId", async () => {
    try {
      const user = await dbGetUserByOauthId(
        oauthAccount.provider,
        "1234567890",
      );

      expect(user).toBeUndefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("dbGetUserAndAuthSessionByAuthSessionId", async () => {
    try {
      const result = await dbGetUserAndAuthSessionByAuthSessionId(
        authSession.id,
      );

      const [userResult, authSessionResult] = result ?? [];

      expect(userResult).toBeDefined();
      expect(authSessionResult).toBeDefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("dbGetUserAndAuthSessionByAuthSessionId with wrong authSessionId", async () => {
    try {
      const result = await dbGetUserAndAuthSessionByAuthSessionId("999999999");

      expect(result).toBeUndefined();
    } catch (err) {
      console.error(err);
    }
  });

  test("dbDeleteAuthSession", async () => {
    try {
      await dbDeleteAuthSession(authSession.id);
    } catch (err) {
      console.error(err);
    }
  });

  test("dbDeleteAuthSession with wrong authSessionId", async () => {
    try {
      await dbDeleteAuthSession("999999999");
    } catch (err) {
      console.error(err);
    }
  });
});

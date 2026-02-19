import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import {
  dbCreateOAuthAccount,
  dbCreateUser,
  dbGetUserByEmail,
  dbGetUserByOauthId,
} from "$lib/db-services";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import type { RequestEvent } from "./$types";

// helper interface for discord response typing
interface DiscordUser {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  avatar: string;
}

export const GET = async (event: RequestEvent) => {
  const { url, cookies } = event;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.get("oauth_state");

  // validate state
  if (!code || !state || !storedState || state !== storedState) {
    throw error(400, "Invalid state or code");
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        // this is important, discord is strict
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID ?? "",
        client_secret: env.DISCORD_CLIENT_SECRET ?? "",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: env.DISCORD_REDIRECT_URI ?? "",
      }),
    });

    if (!tokenResponse.ok) throw error(400, "Failed to get access token");
    const tokens = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) throw error(400, "Failed to fetch user data");
    const discordUser: DiscordUser = await userResponse.json();

    // we got internal discord user info
    // rest of func is DB logic
    // TODO!!!

    // check if this discord ID is already linked
    const existingAccount = await dbGetUserByOauthId("discord", discordUser.id);
    let userId: number;

    // depending on whether the account exists already, or it doesn't at all, or it doesn't but there is a user with the same email, we do different things
    if (existingAccount) {
      // account exists: login
      userId = existingAccount.id;
    } else {
      // account doesn't exists:
      // first check if user already has an account that is not linked to discord by searching for email in DB
      const existingEmailUser = await dbGetUserByEmail(discordUser.email);

      if (existingEmailUser) {
        // user does exist (via password acc): link discord
        userId = existingEmailUser.id;
      } else {
        // brand new user: create fresh acc
        userId = await dbCreateUser({
          email: discordUser.email,
          username: discordUser.username, // NOTE: This could go very wrong if two users have the same username
          avatar: discordUser.avatar,
          password: null,
          // no password bc oauth
        });
      }

      // link
      await dbCreateOAuthAccount({
        userId,
        provider: "discord",
        providerUserId: discordUser.id,
      });
    }

    // then session and cookie
    const { token, expiresAt } = await auth.createSession(userId);
    setSessionTokenCookie(event, token, expiresAt);
  } catch (e) {
    console.error("OAuth Error:", e);
    return error(500, "Authentication failed");
  }

  throw redirect(302, "/");
};

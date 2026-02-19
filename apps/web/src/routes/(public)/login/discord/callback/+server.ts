import { error, redirect } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import {
  dbCreateOAuthAccount,
  dbCreateUser,
  dbGetUserByEmail,
  dbGetUserByOauthId,
} from "$lib/server/db-services";
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
  const { url, cookies, locals } = event;
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.get("oauth_state");

  // validate state
  if (!code || !state || !storedState || state !== storedState) {
    throw error(400, "Invalid state or code" /* i18n */);
  }

  try {
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID ?? "",
        client_secret: env.DISCORD_CLIENT_SECRET ?? "",
        grant_type: "authorization_code",
        code: code,
        redirect_uri: env.DISCORD_REDIRECT_URI ?? "",
      }),
    });

    if (!tokenResponse.ok)
      throw error(400, "Failed to get access token" /* i18n */);
    const tokens = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok)
      throw error(400, "Failed to fetch user data" /* i18n */);
    const discordUser: DiscordUser = await userResponse.json();

    // check if this discord ID is already linked
    const existingAccount = await dbGetUserByOauthId("discord", discordUser.id);

    // user is already logged in (link)
    if (locals.user) {
      if (existingAccount) {
        if (existingAccount.id === locals.user.id) {
          // already linked to this user, just redirect back
          throw redirect(302, "/settings/account");
        } else {
          // linked to a different user
          // TODO: maybe show an error on the settings page
          throw error(
            400,
            "This Discord account is already connected to another user." /* i18n */,
          );
        }
      }

      // link new discord account to current user
      await dbCreateOAuthAccount({
        userId: locals.user.id,
        provider: "discord",
        providerUserId: discordUser.id,
      });

      throw redirect(302, "/settings/account");
    }

    // user is not logged in (login/register)
    let userId: number;
    if (existingAccount) {
      // account exists: login
      userId = existingAccount.id;
    } else {
      // check email collision
      const existingEmailUser = await dbGetUserByEmail(discordUser.email);

      if (existingEmailUser) {
        // email match: link accs automatically
        userId = existingEmailUser.id;
      } else {
        // brand new user
        userId = await dbCreateUser({
          email: discordUser.email,
          username: discordUser.username,
          avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
          password: null,
        });
      }

      // create link
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
    console.error("OAuth Error:" /* i18n */, e);
    return error(500, "Authentication failed" /* i18n */);
  }

  throw redirect(302, "/");
};

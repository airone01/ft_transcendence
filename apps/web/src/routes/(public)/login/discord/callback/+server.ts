import { error, redirect, json } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import * as m from "$lib/paraglide/messages";
import { auth, setSessionTokenCookie } from "$lib/server/auth";
import {
  dbCreateOAuthAccount,
  dbCreateUser,
  dbGetUserByEmail,
  dbGetUserByOauthId,
} from "$lib/server/db-services";
import { checkHttpRateLimit } from "$lib/server/http-rate-limiter";
import type { RequestEvent } from "./$types";

interface DiscordUser {
  id: string;
  username: string;
  email: string;
  verified: boolean;
  avatar: string;
}

export const GET = async (event: RequestEvent) => {
  const { url, cookies, locals, getClientAddress } = event;

  if (!checkHttpRateLimit(getClientAddress(), 60))
    throw redirect(302, "/?error=too_many_requests");

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = cookies.get("oauth_state");

  if (!code || !state || !storedState || state !== storedState) {
    throw error(400, m.oauth_invalid_state_or_code());
  }

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: env.DISCORD_CLIENT_ID as string,
      client_secret: env.DISCORD_CLIENT_SECRET as string,
      code: code,
      redirect_uri: env.DISCORD_REDIRECT_URI as string,
    }),
  });

  if (!tokenResponse.ok) {
    console.error(
      `Discord OAuth token exchange failed: ${tokenResponse.status}`,
    );
    throw redirect(302, "/?error=discord_auth");
  }
  const tokens = await tokenResponse.json();

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (!userResponse.ok) throw redirect(302, "/?error=discord_auth");
  const discordUser: DiscordUser = await userResponse.json();

  if (!discordUser.verified) {
    throw redirect(302, "/?error=unverified_discord_email");
  }

  const existingAccount = await dbGetUserByOauthId("discord", discordUser.id);

  if (locals.user) {
    if (existingAccount) {
      if (existingAccount.id === locals.user.id) {
        throw redirect(302, "/settings");
      } else {
        throw redirect(303, "/settings?error=already_linked");
      }
    }

    await dbCreateOAuthAccount({
      userId: locals.user.id,
      provider: "discord",
      providerUserId: discordUser.id,
    });

    throw redirect(302, "/settings");
  }

  let userId: number;
  if (existingAccount) {
    userId = existingAccount.id;
  } else {
    const existingEmailUser = await dbGetUserByEmail(discordUser.email);

    if (existingEmailUser) {
      userId = existingEmailUser.id;
    } else {
      userId = await dbCreateUser({
        email: discordUser.email,
        username: discordUser.username,
        avatar: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
        password: null,
      });
    }

    await dbCreateOAuthAccount({
      userId,
      provider: "discord",
      providerUserId: discordUser.id,
    });
  }

  await auth.deleteUserSessions(userId);
  const { token, expiresAt } = await auth.createSession(userId);
  setSessionTokenCookie(event, token, expiresAt);

  throw redirect(302, "/");
};